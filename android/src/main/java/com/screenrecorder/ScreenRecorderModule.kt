package com.screenrecorder

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.media.MediaRecorder
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import java.io.File
import java.io.IOException

@ReactModule(name = ScreenRecorderModule.NAME)
class ScreenRecorderModule(reactContext: ReactApplicationContext) :
  NativeScreenRecorderSpec(reactContext) {

  private val TAG = "ScreenRecorderModule"
  private var mediaProjectionManager: MediaProjectionManager? = null
  private var mediaProjection: MediaProjection? = null
  private var mediaRecorder: MediaRecorder? = null
  private var isRecording = false
  private var lastError: String? = null
  private var outputFile: File? = null

  init {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      mediaProjectionManager = reactContext.getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
    }
  }

  override fun getName(): String {
    return NAME
  }

  // ReplayKit 사용 가능 여부 확인 (Android에서는 MediaProjection 사용 가능 여부)
  override fun isAvailable(promise: Promise) {
    try {
      val available = mediaProjectionManager != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP
      promise.resolve(available)
    } catch (e: Exception) {
      promise.reject("IS_AVAILABLE_ERROR", e.message, e)
    }
  }

  // 녹화 시작
  override fun startRecording(promise: Promise) {
    if (isRecording) {
      promise.reject("ALREADY_RECORDING", "이미 녹화 중입니다.")
      return
    }

    if (mediaProjectionManager == null) {
      promise.reject("NOT_AVAILABLE", "MediaProjection을 사용할 수 없습니다.")
      return
    }

    try {
      // 녹화 권한 요청을 위한 Activity 시작
      val intent = reactApplicationContext.currentActivity?.let { activity ->
        mediaProjectionManager?.createScreenCaptureIntent()
      }
      
      if (intent != null) {
        reactApplicationContext.currentActivity?.startActivityForResult(intent, REQUEST_MEDIA_PROJECTION)
        // Activity 결과를 처리하기 위해 Promise를 저장
        pendingStartPromise = promise
      } else {
        promise.reject("ACTIVITY_ERROR", "Activity를 찾을 수 없습니다.")
      }
    } catch (e: Exception) {
      promise.reject("START_RECORDING_ERROR", e.message, e)
    }
  }

  // 녹화 중지
  override fun stopRecording(promise: Promise) {
    if (!isRecording) {
      promise.reject("NOT_RECORDING", "현재 녹화 중이 아닙니다.")
      return
    }

    try {
      stopRecordingInternal()
      promise.resolve("녹화가 완료되었습니다.")
    } catch (e: Exception) {
      promise.reject("STOP_RECORDING_ERROR", e.message, e)
    }
  }

  // 현재 녹화 상태 확인
  override fun isRecording(promise: Promise) {
    promise.resolve(isRecording)
  }

  // 녹화 상태 정보 가져오기
  override fun getRecordingStatus(promise: Promise) {
    val status = Arguments.createMap().apply {
      putBoolean("isRecording", isRecording)
      putString("error", lastError)
    }
    promise.resolve(status)
  }

  // MediaProjection 권한 결과 처리
  fun handleActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
    if (requestCode == REQUEST_MEDIA_PROJECTION) {
      if (resultCode == Activity.RESULT_OK && data != null) {
        startRecordingWithPermission(data)
      } else {
        pendingStartPromise?.reject("PERMISSION_DENIED", "스크린 레코딩 권한이 거부되었습니다.")
        pendingStartPromise = null
      }
    }
  }

  private fun startRecordingWithPermission(data: Intent) {
    try {
      mediaProjection = mediaProjectionManager?.getMediaProjection(Activity.RESULT_OK, data)
      if (mediaProjection != null) {
        startRecordingInternal()
        pendingStartPromise?.resolve(true)
        pendingStartPromise = null
      } else {
        pendingStartPromise?.reject("PROJECTION_ERROR", "MediaProjection을 생성할 수 없습니다.")
        pendingStartPromise = null
      }
    } catch (e: Exception) {
      pendingStartPromise?.reject("START_RECORDING_ERROR", e.message, e)
      pendingStartPromise = null
    }
  }

  private fun startRecordingInternal() {
    try {
      // 출력 파일 생성
      val outputDir = reactApplicationContext.getExternalFilesDir(null)
      outputFile = File(outputDir, "screen_recording_${System.currentTimeMillis()}.mp4")
      
      // MediaRecorder 설정
      mediaRecorder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        MediaRecorder(reactApplicationContext)
      } else {
        @Suppress("DEPRECATION")
        MediaRecorder()
      }

      mediaRecorder?.apply {
        setVideoSource(MediaRecorder.VideoSource.SURFACE)
        setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
        setVideoEncoder(MediaRecorder.VideoEncoder.H264)
        setVideoEncodingBitRate(512 * 1000)
        setVideoFrameRate(30)
        setOutputFile(outputFile?.absolutePath)
        prepare()
      }

      // 녹화 시작
      val surface = mediaRecorder?.surface
      if (surface != null) {
        mediaProjection?.createVirtualDisplay(
          "ScreenRecording",
          1080, 1920, 1,
          android.hardware.display.DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
          surface, null, null
        )
        mediaRecorder?.start()
        isRecording = true
        lastError = null
        Log.d(TAG, "Screen recording started")
      }
    } catch (e: Exception) {
      lastError = e.message
      Log.e(TAG, "Error starting recording: ${e.message}")
      throw e
    }
  }

  private fun stopRecordingInternal() {
    try {
      mediaRecorder?.apply {
        stop()
        release()
      }
      mediaProjection?.stop()
      
      mediaRecorder = null
      mediaProjection = null
      isRecording = false
      lastError = null
      
      Log.d(TAG, "Screen recording stopped. File: ${outputFile?.absolutePath}")
    } catch (e: Exception) {
      lastError = e.message
      Log.e(TAG, "Error stopping recording: ${e.message}")
      throw e
    }
  }

  companion object {
    const val NAME = "ScreenRecorder"
    const val REQUEST_MEDIA_PROJECTION = 1001
    private var pendingStartPromise: Promise? = null
  }
}

import ScreenRecorder from './NativeScreenRecorder';

export async function isAvailable(): Promise<boolean> {
  return await ScreenRecorder.isAvailable();
}

export async function startRecording(): Promise<boolean> {
  return await ScreenRecorder.startRecording();
}

export async function stopRecording(): Promise<string | null> {
  return await ScreenRecorder.stopRecording();
}

export async function isRecording(): Promise<boolean> {
  return await ScreenRecorder.isRecording();
}

export async function getRecordingStatus(): Promise<{
  isRecording: boolean;
  error?: string;
}> {
  return await ScreenRecorder.getRecordingStatus();
}

// 편의 함수들
export class ScreenRecorderManager {
  static async checkAvailability(): Promise<boolean> {
    try {
      return await isAvailable();
    } catch (error) {
      console.error('ReplayKit 사용 가능 여부 확인 실패:', error);
      return false;
    }
  }

  static async startScreenRecording(): Promise<boolean> {
    try {
      const available = await this.checkAvailability();
      if (!available) {
        throw new Error('ReplayKit을 사용할 수 없습니다.');
      }
      return await startRecording();
    } catch (error) {
      console.error('화면 녹화 시작 실패:', error);
      throw error;
    }
  }

  static async stopScreenRecording(): Promise<string | null> {
    try {
      return await stopRecording();
    } catch (error) {
      console.error('화면 녹화 중지 실패:', error);
      throw error;
    }
  }

  static async getCurrentStatus(): Promise<{
    isRecording: boolean;
    error?: string;
  }> {
    try {
      return await getRecordingStatus();
    } catch (error) {
      console.error('녹화 상태 확인 실패:', error);
      return { isRecording: false, error: '상태 확인 실패' };
    }
  }
}

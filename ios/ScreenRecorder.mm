#import "ScreenRecorder.h"
#import <React/RCTLog.h>

@implementation ScreenRecorder
RCT_EXPORT_MODULE()

- (instancetype)init {
    self = [super init];
    if (self) {
        _screenRecorder = [RPScreenRecorder sharedRecorder];
        _screenRecorder.delegate = self;
        _isRecording = NO;
        _lastError = nil;
    }
    return self;
}

// ReplayKit 사용 가능 여부 확인
- (void)isAvailable:(RCTPromiseResolveBlock)resolve
            rejecter:(RCTPromiseRejectBlock)reject {
    BOOL available = [RPScreenRecorder sharedRecorder].available;
    resolve(@(available));
}

// 녹화 시작
- (void)startRecording:(RCTPromiseResolveBlock)resolve
               rejecter:(RCTPromiseRejectBlock)reject {
    if (self.isRecording) {
        reject(@"ALREADY_RECORDING", @"이미 녹화 중입니다.", nil);
        return;
    }
    
    if (!self.screenRecorder.available) {
        reject(@"NOT_AVAILABLE", @"ReplayKit을 사용할 수 없습니다.", nil);
        return;
    }
    
    __weak ScreenRecorder *weakSelf = self;
    [self.screenRecorder startRecordingWithHandler:^(NSError * _Nullable error) {
        ScreenRecorder *strongSelf = weakSelf;
        if (!strongSelf) return;
        
        if (error) {
            strongSelf.lastError = error.localizedDescription;
            reject(@"RECORDING_ERROR", error.localizedDescription, error);
        } else {
            strongSelf.isRecording = YES;
            strongSelf.lastError = nil;
            resolve(@(YES));
        }
    }];
}

// 녹화 중지
- (void)stopRecording:(RCTPromiseResolveBlock)resolve
              rejecter:(RCTPromiseRejectBlock)reject {
    if (!self.isRecording) {
        reject(@"NOT_RECORDING", @"현재 녹화 중이 아닙니다.", nil);
        return;
    }
    
    __weak ScreenRecorder *weakSelf = self;
    [self.screenRecorder stopRecordingWithHandler:^(RPPreviewViewController * _Nullable previewViewController, NSError * _Nullable error) {
        ScreenRecorder *strongSelf = weakSelf;
        if (!strongSelf) return;
        
        strongSelf.isRecording = NO;
        
        if (error) {
            strongSelf.lastError = error.localizedDescription;
            reject(@"STOP_ERROR", error.localizedDescription, error);
        } else {
            strongSelf.lastError = nil;
            // 녹화된 파일의 경로를 반환 (실제로는 더 복잡한 처리가 필요할 수 있음)
            resolve(@"녹화가 완료되었습니다.");
        }
    }];
}

// 현재 녹화 상태 확인
- (void)isRecording:(RCTPromiseResolveBlock)resolve
            rejecter:(RCTPromiseRejectBlock)reject {
    resolve(@(self.isRecording));
}

// 녹화 상태 정보 가져오기
- (void)getRecordingStatus:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject {
    NSDictionary *status = @{
        @"isRecording": @(self.isRecording),
        @"error": self.lastError ?: [NSNull null]
    };
    resolve(status);
}

#pragma mark - RPScreenRecorderDelegate

- (void)screenRecorder:(RPScreenRecorder *)screenRecorder didStopRecordingWithError:(NSError *)error previewViewController:(RPPreviewViewController *)previewViewController {
    self.isRecording = NO;
    if (error) {
        self.lastError = error.localizedDescription;
        RCTLogError(@"Screen recording stopped with error: %@", error.localizedDescription);
    }
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeScreenRecorderSpecJSI>(params);
}

@end

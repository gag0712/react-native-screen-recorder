#import <ScreenRecorderSpec/ScreenRecorderSpec.h>
#import <ReplayKit/ReplayKit.h>

@interface ScreenRecorder : NSObject <NativeScreenRecorderSpec, RPScreenRecorderDelegate>

@property (nonatomic, strong) RPScreenRecorder *screenRecorder;
@property (nonatomic, assign) BOOL isRecording;
@property (nonatomic, strong) NSString *lastError;

@end

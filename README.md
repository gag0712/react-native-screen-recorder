# react-native-screen-recorder

React Native에서 iOS ReplayKit을 사용한 화면 녹화 라이브러리입니다.

## 설치

```sh
npm install react-native-screen-recorder
```

### iOS 설정

iOS에서 화면 녹화를 사용하려면 다음 권한이 필요합니다:

1. **Info.plist에 권한 추가**:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>화면 녹화 시 오디오를 포함하기 위해 마이크 권한이 필요합니다.</string>
```

2. **Capabilities 설정**:
   - Xcode에서 프로젝트를 열고
   - Target > Signing & Capabilities 탭으로 이동
   - "+ Capability" 버튼을 클릭하고 "Screen Recording" 추가

## 사용법

### 기본 사용법

```js
import {
  ScreenRecorderManager,
  isAvailable,
  startRecording,
  stopRecording,
} from 'react-native-screen-recorder';

// ReplayKit 사용 가능 여부 확인
const available = await isAvailable();
console.log('ReplayKit 사용 가능:', available);

// 화면 녹화 시작
try {
  await startRecording();
  console.log('녹화가 시작되었습니다.');
} catch (error) {
  console.error('녹화 시작 실패:', error);
}

// 화면 녹화 중지
try {
  const result = await stopRecording();
  console.log('녹화 완료:', result);
} catch (error) {
  console.error('녹화 중지 실패:', error);
}
```

### ScreenRecorderManager 클래스 사용

```js
import { ScreenRecorderManager } from 'react-native-screen-recorder';

// 사용 가능 여부 확인
const available = await ScreenRecorderManager.checkAvailability();

if (available) {
  // 녹화 시작
  await ScreenRecorderManager.startScreenRecording();

  // 녹화 상태 확인
  const status = await ScreenRecorderManager.getCurrentStatus();
  console.log('현재 상태:', status);

  // 녹화 중지
  const result = await ScreenRecorderManager.stopScreenRecording();
  console.log('녹화 결과:', result);
}
```

### 상태 모니터링

```js
import { getRecordingStatus } from 'react-native-screen-recorder';

// 주기적으로 녹화 상태 확인
setInterval(async () => {
  const status = await getRecordingStatus();
  console.log('녹화 상태:', status);
}, 1000);
```

## API 참조

### 함수

- `isAvailable()`: ReplayKit 사용 가능 여부를 반환합니다.
- `startRecording()`: 화면 녹화를 시작합니다.
- `stopRecording()`: 화면 녹화를 중지하고 결과를 반환합니다.
- `isRecording()`: 현재 녹화 중인지 여부를 반환합니다.
- `getRecordingStatus()`: 현재 녹화 상태와 오류 정보를 반환합니다.

### ScreenRecorderManager 클래스

- `checkAvailability()`: 사용 가능 여부를 확인합니다.
- `startScreenRecording()`: 안전하게 녹화를 시작합니다.
- `stopScreenRecording()`: 안전하게 녹화를 중지합니다.
- `getCurrentStatus()`: 현재 상태를 가져옵니다.

## 주의사항

1. **iOS 9.0 이상**에서만 사용 가능합니다.
2. **시뮬레이터에서는 작동하지 않습니다**. 실제 기기에서 테스트해야 합니다.
3. **앱이 백그라운드로 전환되면 녹화가 중지될 수 있습니다**.
4. **사용자가 녹화를 거부할 수 있습니다**. 적절한 오류 처리가 필요합니다.

## 기여하기

[기여 가이드](CONTRIBUTING.md)를 참조하여 저장소에 기여하는 방법과 개발 워크플로우를 알아보세요.

## 라이선스

MIT

---

[create-react-native-library](https://github.com/callstack/react-native-builder-bob)로 제작되었습니다.

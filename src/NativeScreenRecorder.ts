import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  isAvailable(): Promise<boolean>;
  startRecording(): Promise<boolean>;
  stopRecording(): Promise<string | null>;
  isRecording(): Promise<boolean>;
  getRecordingStatus(): Promise<{
    isRecording: boolean;
    error?: string;
  }>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ScreenRecorder');

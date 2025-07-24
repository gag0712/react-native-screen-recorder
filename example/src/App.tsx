import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ScreenRecorderManager } from 'react-native-screen-recorder';

export default function App() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    try {
      const available = await ScreenRecorderManager.checkAvailability();
      setIsAvailable(available);
      setStatus(available ? '사용 가능' : '사용 불가능');
    } catch (error) {
      console.error('사용 가능 여부 확인 실패:', error);
      setIsAvailable(false);
      setStatus('확인 실패');
    }
  };

  const startRecording = async () => {
    try {
      await ScreenRecorderManager.startScreenRecording();
      setIsRecording(true);
      setStatus('녹화 중...');
      Alert.alert('성공', '화면 녹화가 시작되었습니다.');
    } catch (error) {
      console.error('녹화 시작 실패:', error);
      Alert.alert('오류', `녹화 시작 실패: ${error}`);
    }
  };

  const stopRecording = async () => {
    try {
      const result = await ScreenRecorderManager.stopScreenRecording();
      setIsRecording(false);
      setStatus('녹화 완료');
      Alert.alert('완료', `녹화가 완료되었습니다: ${result}`);
    } catch (error) {
      console.error('녹화 중지 실패:', error);
      Alert.alert('오류', `녹화 중지 실패: ${error}`);
    }
  };

  const getStatus = async () => {
    try {
      const currentStatus = await ScreenRecorderManager.getCurrentStatus();
      setStatus(`상태: ${currentStatus.isRecording ? '녹화 중' : '대기 중'}`);
      if (currentStatus.error) {
        setStatus((prev) => `${prev} (오류: ${currentStatus.error})`);
      }
    } catch (error) {
      console.error('상태 확인 실패:', error);
      setStatus('상태 확인 실패');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>React Native Screen Recorder</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          스크린 레코딩 사용 가능:{' '}
          {isAvailable === null ? '확인 중...' : isAvailable ? '예' : '아니오'}
        </Text>
        <Text style={styles.statusText}>현재 상태: {status}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.checkButton]}
          onPress={checkAvailability}
        >
          <Text style={styles.buttonText}>사용 가능 여부 확인</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.statusButton]}
          onPress={getStatus}
        >
          <Text style={styles.buttonText}>상태 확인</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            isRecording ? styles.stopButton : styles.startButton,
            !isAvailable && styles.disabledButton,
          ]}
          onPress={isRecording ? stopRecording : startRecording}
          disabled={!isAvailable}
        >
          <Text style={styles.buttonText}>
            {isRecording ? '녹화 중지' : '녹화 시작'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          • iOS 9.0+ / Android 5.0+ 에서 사용 가능합니다{'\n'}• 시뮬레이터에서는
          작동하지 않습니다{'\n'}• 실제 기기에서 테스트해주세요{'\n'}• 스크린
          레코딩 권한이 필요합니다{'\n'}• Android에서는 MediaProjection 권한을
          허용해야 합니다
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  resultContainer: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  resultText: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '600',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkButton: {
    backgroundColor: '#2196f3',
  },
  statusButton: {
    backgroundColor: '#ff9800',
  },
  startButton: {
    backgroundColor: '#4caf50',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    marginTop: 30,
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 10,
    width: '100%',
  },
  infoText: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 18,
  },
});

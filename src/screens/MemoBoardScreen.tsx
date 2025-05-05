import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Button,
  Alert,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const MemoBoardScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { folderId } = route.params;

  const [memos, setMemos] = useState([]);
  const [newMemo, setNewMemo] = useState('');
  const [boardTitle, setBoardTitle] = useState('');
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [summaryText, setSummaryText] = useState(null);
  const [reminderHours, setReminderHours] = useState('0');
  const [reminderMinutes, setReminderMinutes] = useState('10');
  const [alarmConfigured, setAlarmConfigured] = useState(false);
  const [alarmSetTime, setAlarmSetTime] = useState(null);

  const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

  useEffect(() => {
    fetchBoardTitle();
    fetchMemos();
  }, []);

  const fetchBoardTitle = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.get(`${BASE_URL}/api/boards/${folderId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBoardTitle(response.data.title);
    } catch (error) {
      console.error('보드 제목 불러오기 실패:', error);
    }
  };

  const fetchMemos = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.get(`${BASE_URL}/api/memos/?board=${folderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMemos(response.data);
      const finished = response.data.some((memo) => memo.is_finished);
      setIsInputDisabled(finished);
    } catch (error) {
      console.error('메모 불러오기 실패:', error);
    }
  };

  const scheduleReminder = async (hours, minutes) => {
    const message = `알림 설정됨: ${hours}시간 ${minutes}분 후`;
    Alert.alert('🔔 알림 테스트 (웹용)', message);
  };

  const saveReminderSetting = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    const reminderTime = new Date(Date.now() + (parseInt(reminderHours) * 60 + parseInt(reminderMinutes)) * 60 * 1000);

    try {
      await axios.post(
        `${BASE_URL}/api/boards/${folderId}/set-alarm/`,
        { reminder_time: reminderTime.toISOString() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAlarmConfigured(true);
      setAlarmSetTime(Date.now());
      Alert.alert('알림 설정이 저장되었습니다.');
    } catch (error) {
      console.error('알림 설정 실패:', error);
      Alert.alert('알림 저장 실패', '서버 오류로 인해 저장하지 못했습니다.');
    }
  };

  const addMemo = async () => {
    console.log("🛠️ 메모 추가 시도됨");

    const content = newMemo.trim();
    if (!content || isInputDisabled) return;

    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.post(
        `${BASE_URL}/api/memos/`,
        {
          board: folderId,
          content,
          is_finished: false,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMemos((prev) => [...prev, response.data]);
      setNewMemo('');

      const hours = parseInt(reminderHours) || 0;
      const minutes = parseInt(reminderMinutes) || 0;

      if (alarmConfigured && alarmSetTime && Date.now() > alarmSetTime) {
        if (hours > 0 || minutes > 0) {
          await scheduleReminder(hours, minutes);
        }
        setAlarmConfigured(false);
        setAlarmSetTime(null);
      }
    } catch (error) {
      console.error('메모 추가 실패:', error);
    }
  };

  const summarizeBoard = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.post(
        `${BASE_URL}/api/boards/${folderId}/summarize/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSummaryText(response.data.summary);
      setIsInputDisabled(true);
    } catch (error) {
      console.error('요약 실패:', error);
      Alert.alert('요약 실패', 'ChatGPT 요약 요청이 실패했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>📝 보드: {boardTitle}</Text>
        <View style={styles.rightHeaderGroup}>
          <View style={styles.alarmSettingRow}>
            <Text>({reminderHours}시 {reminderMinutes}분 후에 알림)</Text>
            <Picker
              selectedValue={reminderHours}
              style={styles.picker}
              onValueChange={(itemValue) => setReminderHours(itemValue)}>
              {Array.from({ length: 24 }, (_, i) => (
                <Picker.Item key={i} label={`${i}`} value={`${i}`} />
              ))}
            </Picker>
            <Picker
              selectedValue={reminderMinutes}
              style={styles.picker}
              onValueChange={(itemValue) => setReminderMinutes(itemValue)}>
              {Array.from({ length: 60 }, (_, i) => (
                <Picker.Item key={i} label={`${i}`} value={`${i}`} />
              ))}
            </Picker>
            <Button title="저장" onPress={saveReminderSetting} />
          </View>
          <Button title="보드 목록" onPress={() => navigation.goBack()} />
        </View>
      </View>

      <FlatList
        data={memos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.memoBox}>
            <Text style={styles.memoTitle}>
              📅 {new Date(item.timestamp).toLocaleDateString()}
            </Text>
            <Text style={styles.memoContent}>{item.content}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        )}
      />

      {summaryText && (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>📌 전체 요약:</Text>
          <Text style={styles.summaryText}>{summaryText}</Text>
        </View>
      )}

      <TextInput
        value={newMemo}
        onChangeText={setNewMemo}
        style={styles.input}
        placeholder="새 메모 입력"
        editable={!isInputDisabled}
      />

      <Button title="메모 추가" onPress={addMemo} disabled={false} />
      <Button title="정리하기" onPress={summarizeBoard} disabled={isInputDisabled} />
    </View>
  );
};

export default MemoBoardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: 'bold' },
  rightHeaderGroup: {
    alignItems: 'flex-end',
    gap: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 16,
    marginBottom: 8,
  },
  alarmSettingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  picker: {
    height: 40,
    width: 80,
  },
  memoBox: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  memoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 4,
  },
  memoContent: {
    fontSize: 16,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  summaryBox: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 15,
    color: '#333',
  },
});

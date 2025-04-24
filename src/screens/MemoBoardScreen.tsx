import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Button,
  Alert,
} from 'react-native';
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

  useEffect(() => {
    fetchBoardTitle();
    fetchMemos();
  }, []);

  const fetchBoardTitle = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.get(`http://172.20.10.2:8000/api/boards/${folderId}/`, {
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
      const response = await axios.get(`http://172.20.10.2:8000/api/memos/?board=${folderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMemos(response.data);
      const finished = response.data.some((memo) => memo.is_finished);
      setIsInputDisabled(finished);
    } catch (error) {
      console.error('메모 불러오기 실패:', error);
    }
  };

  const addMemo = async () => {
    const content = newMemo.trim();
    if (!content || isInputDisabled) return;

    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.post(
        'http://localhost:8000/api/memos/',
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
    } catch (error) {
      console.error('메모 추가 실패:', error);
    }
  };

  const summarizeBoard = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.post(
        `http://localhost:8000/api/boards/${folderId}/summarize/`,
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
      <View style={styles.header}>
        <Text style={styles.title}>📝 보드: {boardTitle}</Text>
        <Button title="보드 목록" onPress={() => navigation.goBack()} />
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
      <Button title="메모 추가" onPress={addMemo} disabled={isInputDisabled} />
      <Button title="정리하기" onPress={summarizeBoard} disabled={isInputDisabled} />
    </View>
  );
};

export default MemoBoardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 16,
    marginBottom: 8,
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

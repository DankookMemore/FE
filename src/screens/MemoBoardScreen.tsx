import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRoute, useNavigation, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { RootStackParamList } from '../../App';
import { styles } from './MemoBoardScreen.styles';

const BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8000'
    : 'http://localhost:8081';

type Memo = {
  id: number;
  timestamp: string;
  content: string;
  is_finished: boolean;
};

const MemoBoardScreen: React.FC<{ setIsLoggedIn: (val: boolean) => void }> = ({ setIsLoggedIn }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<{ params: { folderId: number } }>();
  const { folderId } = route.params;

  const [memos, setMemos] = useState<Memo[]>([]);
  const [newMemo, setNewMemo] = useState('');
  const [boardTitle, setBoardTitle] = useState('');
  const [summaryText, setSummaryText] = useState<string | null>(null);

  useEffect(() => {
    fetchBoardTitle();
    fetchMemos();
  }, []);

  const fetchBoardTitle = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;
    try {
      const response = await axios.get(
        `${BASE_URL}/api/boards/${folderId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBoardTitle(response.data.title);
    } catch (error) {
      console.error('보드 제목 불러오기 실패:', error);
    }
  };

  const fetchMemos = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;
    try {
      const response = await axios.get(
        `${BASE_URL}/api/memos/?board=${folderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMemos(response.data);
    } catch (error) {
      console.error('메모 불러오기 실패:', error);
    }
  };

  const addMemo = async () => {
    const content = newMemo.trim();
    if (!content) return;
    const token = await AsyncStorage.getItem('token');
    if (!token) return;
    try {
      const response = await axios.post(
        `${BASE_URL}/api/memos/`,
        { board: folderId, content, is_finished: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMemos(prev => [...prev, response.data]);
      setNewMemo('');
    } catch (error) {
      console.error('메모 추가 실패:', error);
      Alert.alert('메모 추가 실패', '서버 오류');
    }
  };

  const summarizeBoard = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;
    try {
      const response = await axios.post(
        `${BASE_URL}/api/boards/${folderId}/summarize/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSummaryText(response.data.summary);
    } catch (error) {
      console.error('요약 실패:', error);
      Alert.alert('요약 실패', 'ChatGPT 요약 요청이 실패했습니다.');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    setIsLoggedIn(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📝</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>로그아웃</Text>
        </TouchableOpacity>
      </View>

      {/* 보드 이름 */}
      <View style={styles.boardNameContainer}>
        <Text style={styles.boardName}>{boardTitle}</Text>
      </View>

      <FlatList
        data={memos}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.memoBox}>
            <Text style={styles.memoTitle}>
              {new Date(item.timestamp).toLocaleDateString()}
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
        style={styles.input}
        placeholder="새 메모 입력"
        placeholderTextColor="#aaa"
        value={newMemo}
        onChangeText={setNewMemo}
      />
      <TouchableOpacity style={styles.addButton} onPress={addMemo}>
        <Text style={styles.addButtonText}>메모 추가</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.summaryButton} onPress={summarizeBoard}>
        <Text style={styles.summaryButtonText}>정리하기</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default MemoBoardScreen;

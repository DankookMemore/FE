import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {
  RouteProp,
  useRoute,
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { RootStackParamList } from '../../App';
import { styles } from './MemoBoardScreen.styles';

type Memo = {
  id: number;
  timestamp: string;
  content: string;
  is_finished: boolean;
};

type MemoBoardRouteProp = RouteProp<RootStackParamList, 'MemoBoard'>;

const BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8000'
    : 'http://localhost:8000';

const MemoBoardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList, 'MemoBoard'>>();
  const route = useRoute<MemoBoardRouteProp>();
  const { folderId, boardTitle: routeBoardTitle, boardOwner, isGuide, presetMemos } =
    route.params;

  const [memos, setMemos] = useState<Memo[]>([]);
  const [newMemo, setNewMemo] = useState('');
  const [boardTitle, setBoardTitle] = useState(routeBoardTitle || '');
  const [summaryText, setSummaryText] = useState<string | null>(null);

  const renderHeader = () => {
    if (folderId === 0 && isGuide) return null;
    if (memos.length === 0) {
      return (
        <View style={styles.memoBox}>
          <Text style={[styles.memoContent, { fontWeight: 'bold' }]}>📌1. 안녕하세요~ 어떤 아이디어를 가지고 있으신가요?</Text>
        </View>
      );
    }
    if (memos.length === 1) {
      return (
        <View style={styles.memoBox}>
          <Text style={[styles.memoContent, { fontWeight: 'bold' }]}>📌2. 아래 아이디어를 어떻게 구체화하실 건가요?</Text>
        </View>
      );
    }
    return null;
  };

  useEffect(() => {
    if (!isGuide && !routeBoardTitle) {
      fetchBoardTitle();
    }
    if (presetMemos && presetMemos.length > 0) {
      setMemos(presetMemos);
    } else {
      fetchMemos();
    }
  }, []);

  const fetchBoardTitle = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;
    try {
      const response = await axios.get(
        `${BASE_URL}/api/boards/${folderId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBoardTitle(response.data.title ?? '제목 없음');
    } catch {
      setBoardTitle('불러오기 실패');
    }
  };

  const fetchMemos = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;
    try {
      const params: any = { board: folderId };
      if (boardOwner) params.user = boardOwner;
      const response = await axios.get(`${BASE_URL}/api/memos/`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setMemos(response.data);
    } catch {
      console.error('메모 불러오기 실패');
    }
  };

  const addMemo = async () => {
    if (folderId === 0 && isGuide) return;
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
    } catch {
      console.error('메모 추가 실패');
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
    } catch {
      console.error('요약 실패');
    }
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
        <Text style={styles.title}>📝 {boardTitle}</Text>
      </View>

      <FlatList
        data={memos}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        ListHeaderComponent={!isGuide ? renderHeader : undefined}
        renderItem={({ item, index }) => (
          <View style={styles.memoBox}>
            <Text style={styles.memoTitle}>
              {index + 1}. {new Date(item.timestamp).toLocaleDateString()}
            </Text>
            <Text style={styles.memoContent}>{item.content}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        )}
      />

      {!(folderId === 0 && isGuide) && (
        <>
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

          {summaryText && (
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>📌 전체 요약:</Text>
              <Text style={styles.summaryText}>{summaryText}</Text>
            </View>
          )}
        </>
      )}
    </KeyboardAvoidingView>
  );
};

export default MemoBoardScreen;

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
  Modal,
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

  const [editingMemoId, setEditingMemoId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const renderHeader = () => {
    if (folderId === 0 && isGuide) return null;
    if (memos.length === 0) {
      return (
        <View>
          <Text style={{ fontWeight: 'bold' }}>📌1. 안녕하세요~ 어떤 아이디어를 가지고 있으신가요?</Text>
        </View>
      );
    }
    if (memos.length === 1) {
      return (
        <View>
          <Text style={{ fontWeight: 'bold' }}>📌2. 아래 아이디어를 어떻게 구체화하실 건가요?</Text>
        </View>
      );
    }
    if (!summaryText) {
      return (
        <View>
          <Text style={{ fontWeight: 'bold' }}>📌3. 계속 진행해주세요!! 완성되면 정리하기 버튼을 눌러주세요</Text>
        </View>
      );
    }
    return null;
  };

  useEffect(() => {
    if (!isGuide && !routeBoardTitle) fetchBoardTitle();
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
      Alert.alert('메모 추가 실패', '서버 오류');
    }
  };

  const deleteMemo = async (id: number) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;
    try {
      await axios.delete(`${BASE_URL}/api/memos/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMemos(prev => prev.filter(m => m.id !== id));
    } catch {
      Alert.alert('삭제 실패', '서버 오류');
    }
  };

  const startEdit = (memo: Memo) => {
    setEditingMemoId(memo.id);
    setEditingContent(memo.content);
  };

  const cancelEdit = () => {
    setEditingMemoId(null);
    setEditingContent('');
  };

  const submitEdit = async () => {
    if (!editingContent.trim() || editingMemoId === null) return;
    const token = await AsyncStorage.getItem('token');
    if (!token) return;
    try {
      const response = await axios.patch(
        `${BASE_URL}/api/memos/${editingMemoId}/`,
        { content: editingContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMemos(prev => prev.map(m => (m.id === editingMemoId ? response.data : m)));
      cancelEdit();
    } catch {
      Alert.alert('수정 실패', '서버 오류');
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
      Alert.alert('요약 실패', 'ChatGPT 요약 요청이 실패했습니다.');
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
            {!isGuide && (
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <TouchableOpacity onPress={() => startEdit(item)}>
                  <Text>수정</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteMemo(item.id)}>
                  <Text>삭제</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />

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

      <Modal visible={editingMemoId !== null} animationType="slide">
        <View>
          <View>
            <Text>메모 수정</Text>
            <TextInput
              style={styles.input}
              value={editingContent}
              onChangeText={setEditingContent}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={cancelEdit}>
                <Text>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitEdit}>
                <Text>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default MemoBoardScreen;

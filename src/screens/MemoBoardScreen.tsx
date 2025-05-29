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
    : 'http://localhost:8000';

type Memo = {
  id: number;
  timestamp: string;
  content: string;
  is_finished: boolean;
};

const MemoBoardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<{ params: { folderId: number; boardTitle?: string; isGuide?: boolean } }>();
  const { folderId, boardTitle: routeBoardTitle, isGuide } = route.params;

  const [memos, setMemos] = useState<Memo[]>([]);
  const [newMemo, setNewMemo] = useState('');
  const [boardTitle, setBoardTitle] = useState(routeBoardTitle || '');
  const [summaryText, setSummaryText] = useState<string | null>(null);

  useEffect(() => {
    if (!isGuide) {
      fetchBoardTitle();
    }
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
      setBoardTitle(response.data.title ?? '제목 없음');
    } catch (error) {
      console.error('보드 제목 불러오기 실패:', error);
      setBoardTitle('불러오기 실패');
    }
  };

  const fetchMemos = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    if (folderId === 0 && isGuide) {
      setMemos([
        {
          id: 0,
          timestamp: new Date().toISOString(),
          is_finished: false,
          content: `📌 여기는 사용방법 보드입니다.\n\n1. 아이디어 메모에는 다양한 아이디어가 제시되어 있음을 알 수 있다.\n2. 각각의 숫자 조합은 서로 다른 아이디어를 나타내고 있을 가능성이 있다.\n3. 이러한 아이디어들은 개별적으로 고려되었지만, 전체 흐름을 고려하여 유기적으로 연결될 수 있다.\n4. 아이디어를 발전시키고 구체화하기 위해서는 각각의 아이디어를 깊게 고민하고, 상호작용하며 발전시킬 필요가 있다.\n5. 이러한 아이디어 메모는 창의적인 아이디어 발굴과 혁신적인 발전을 이끌어낼 수 있는 중요한 자원이 될 수 있다.`,
        },
      ]);
    } else {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/memos/?board=${folderId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMemos(response.data);
      } catch (error) {
        console.error('메모 불러오기 실패:', error);
      }
    }
  };

  const addMemo = async () => {
    const content = newMemo.trim();
    if (!content) return;
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    if (folderId === 0 && isGuide) {
      Alert.alert('사용방법 보드에서는 메모를 추가할 수 없습니다.');
      return;
    }

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

    if (folderId === 0 && isGuide) {
      Alert.alert('사용방법 보드는 요약 기능이 제공되지 않습니다.');
      return;
    }

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

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📝 {boardTitle}</Text>
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
        editable={!(folderId === 0 && isGuide)}
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

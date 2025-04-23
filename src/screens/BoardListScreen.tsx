import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useCallback } from 'react';
import { RootStackParamList } from '../../App';

type Board = {
  id: number;
  title: string;
  category: string;
  summary: string;
  is_completed: boolean;
  created_at: string;
};

const BoardListScreen = ({ setIsLoggedIn }: { setIsLoggedIn: (val: boolean) => void }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [boards, setBoards] = useState<Board[]>([]);
  const [newBoardName, setNewBoardName] = useState('');

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;
        await fetchBoards(token);
      };
      loadData();
    }, [])
  );

  const fetchBoards = async (token: string) => {
    try {
      const response = await axios.get('http://172.30.105.207:8000/api/boards/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBoards(response.data);
    } catch (error) {
      console.error('보드 불러오기 실패:', error);
    }
  };

  const addBoard = async () => {
    Alert.alert('버튼 클릭됨');
    console.log('🟢 보드 추가 버튼 눌림');
  
    const title = newBoardName.trim();
    if (!title) {
      console.log('❗️제목 없음으로 종료');
      return;
    }
  
    if (boards.find((b) => b.title === title)) {
      Alert.alert('중복된 보드 이름입니다.');
      return;
    }
  
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.log('❌ 토큰 없음, 로그인 필요');
      return;
    }
  
    try {
      console.log('📤 axios 요청 시작');
      const response = await axios.post(
        'http://172.20.10.2:8000/api/boards/',
        {
          title,
          category: '기본',
          summary: '',
          is_completed: false,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('✅ 보드 추가 성공:', response.data);
      setBoards((prev) => [...prev, response.data]);
      setNewBoardName('');
    } catch (error: any) {
      console.error('❌ axios 요청 실패:', error.message);
      if (error.response) {
        console.log('📛 응답 상태코드:', error.response.status);
        console.log('📛 응답 데이터:', error.response.data);
      } else {
        console.log('📛 응답 없음 (네트워크 오류 등)');
      }
      Alert.alert('보드 추가 실패', '서버와 통신할 수 없습니다.');
    }
  }; // ⬅️ 함수 닫힘 누락 수정됨

  const goToBoard = (boardId: number) => {
    navigation.navigate('MemoBoard', { folderId: boardId });
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    setIsLoggedIn(false);
  };

  const summarizeBoard = async (boardId: number) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.post(
        `http://172.30.105.207:8000/api/boards/${boardId}/summarize/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert('요약 결과', response.data.summary);
    } catch (error) {
      console.error('요약 실패:', error);
      Alert.alert('요약 실패', 'ChatGPT 요약 요청이 실패했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 메모 보드 목록</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>로그아웃</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={boards}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.boardRow}
            onPress={() => goToBoard(item.id)}
            onLongPress={() => summarizeBoard(item.id)}
          >
            <Text style={styles.boardText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />

      <TextInput
        style={styles.input}
        placeholder="새 보드 이름"
        value={newBoardName}
        onChangeText={setNewBoardName}
      />
      <TouchableOpacity style={styles.addButton} onPress={addBoard}>
        <Text style={styles.addButtonText}>보드 추가</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: 'bold' },
  logout: {
    fontSize: 16,
    color: 'red',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  boardRow: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  boardText: {
    fontSize: 18,
  },
  addButton: {
    backgroundColor: '#88c0d0',
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BoardListScreen;

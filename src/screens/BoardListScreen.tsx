import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Notifications from 'expo-notifications';
import { RootStackParamList } from '../../App';

const baseURL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

type Board = {
  id: number;
  title: string;
  category: string;
  summary: string;
  is_completed: boolean;
  created_at: string;
  hasAlarm?: boolean;
};

const BoardListScreen = ({ setIsLoggedIn }: { setIsLoggedIn: (val: boolean) => void }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [boards, setBoards] = useState<Board[]>([]);
  const [newBoardName, setNewBoardName] = useState('');

  useEffect(() => {
    const checkAlarms = async () => {
      const alarmsJson = await AsyncStorage.getItem('alarms');
      const alarms = alarmsJson ? JSON.parse(alarmsJson) : {};
      const now = Date.now();
      setBoards(prevBoards =>
        prevBoards.map(board => {
          const alarmTime = alarms[board.id];
          return {
            ...board,
            hasAlarm: alarmTime && now > alarmTime,
          };
        })
      );
    };

    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      const boardId = notification.request.content.data?.boardId;
      if (boardId) {
        setBoards((prev) =>
          prev.map((b) => (b.id === boardId ? { ...b, hasAlarm: true } : b))
        );
      }
    });

    checkAlarms();
    return () => subscription.remove();
  }, []);

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
      const response = await axios.get(`${baseURL}/api/boards/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const alarmsJson = await AsyncStorage.getItem('alarms');
      const alarms = alarmsJson ? JSON.parse(alarmsJson) : {};
      const now = Date.now();
      const boardsWithAlarms = response.data.map((board: Board) => ({
        ...board,
        hasAlarm: alarms[board.id] && now > alarms[board.id],
      }));
      setBoards(boardsWithAlarms);
    } catch (error) {
      console.error('보드 불러오기 실패:', error);
    }
  };

  const addBoard = async () => {
    const title = newBoardName.trim();
    if (!title) return;

    if (boards.find((b) => b.title === title)) {
      Alert.alert('중복된 보드 이름입니다.');
      return;
    }

    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.post(
        `${baseURL}/api/boards/`,
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
      setBoards((prev) => [...prev, response.data]);
      setNewBoardName('');
    } catch (error: any) {
      console.error('axios 요청 실패:', error.message);
      Alert.alert('보드 추가 실패', '서버와 통신할 수 없습니다.');
    }
  };

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
        `${baseURL}/api/boards/${boardId}/summarize/`,
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
            <View style={styles.boardRowContent}>
              <Text style={styles.boardText}>{item.title}</Text>
              {item.hasAlarm && <View style={styles.redDot} />}
            </View>
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

export default BoardListScreen;

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
  boardRowContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boardText: {
    fontSize: 18,
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
    marginLeft: 10,
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

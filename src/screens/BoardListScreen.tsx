import React, { useState, useCallback, useEffect } from 'react';
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
import { useNavigation, useFocusEffect, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Notifications from 'expo-notifications';
import { RootStackParamList } from '../../App';
import { styles } from './BoardListScreen.styles';

const baseURL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8081';

type Board = {
  id: number;
  title: string;
  category: string;
  summary: string;
  is_completed: boolean;
  created_at: string;
  hasAlarm?: boolean;
};

const BoardListScreen: React.FC<{ setIsLoggedIn: (val: boolean) => void }> = ({ setIsLoggedIn }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [boards, setBoards] = useState<Board[]>([]);
  const [newBoardName, setNewBoardName] = useState('');

  useEffect(() => {
    const checkAlarms = async () => {
      const alarmsJson = await AsyncStorage.getItem('alarms');
      const alarms = alarmsJson ? JSON.parse(alarmsJson) : {};
      const now = Date.now();
      setBoards(prev =>
        prev.map(board => ({
          ...board,
          hasAlarm: alarms[board.id] && now > alarms[board.id],
        }))
      );
    };
    const sub = Notifications.addNotificationReceivedListener(notification => {
      const boardId = notification.request.content.data?.boardId;
      if (boardId) {
        setBoards(prev => prev.map(b => (b.id === boardId ? { ...b, hasAlarm: true } : b)));
      }
    });
    checkAlarms();
    return () => sub.remove();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;
        try {
          const res = await axios.get(`${baseURL}/api/boards/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setBoards(res.data);
        } catch {
        }
      };
      load();
    }, [])
  );

  const addBoard = async () => {
    const title = newBoardName.trim();
    if (!title) return;
    if (boards.some(b => b.title === title)) {
      Alert.alert('중복된 보드 이름입니다.');
      return;
    }
    const token = await AsyncStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.post(
        `${baseURL}/api/boards/`,
        { title, category: '기본', summary: '', is_completed: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBoards(prev => [...prev, res.data]);
      setNewBoardName('');
    } catch {
      Alert.alert('보드 추가 실패', '서버 오류');
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
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.title}>📋 메모 보드 목록</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logout}>로그아웃</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={boards}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.boardRow}
              onPress={() => navigation.navigate('MemoBoard', { folderId: item.id })}
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
          placeholderTextColor="#aaa"
          value={newBoardName}
          onChangeText={setNewBoardName}
        />
        <TouchableOpacity style={styles.addButton} onPress={addBoard}>
          <Text style={styles.addButtonText}>보드 추가</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default BoardListScreen;

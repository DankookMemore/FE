import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation, useFocusEffect, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { RootStackParamList } from '../../App';
import { styles } from './BoardListScreen.styles';

const baseURL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000';

type Board = { id: number; title: string; category?: string };

const BoardListScreen: React.FC<{ setIsLoggedIn: (val: boolean) => void }> = ({ setIsLoggedIn }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [boards, setBoards] = useState<Board[]>([]);
  const [sharedBoards, setSharedBoards] = useState<Board[]>([{ id: 0, title: '사용방법' }]);
  const [newBoardName, setNewBoardName] = useState('');

  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followSearch, setFollowSearch] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [followingList, setFollowingList] = useState<string[]>([]);
  const [followRequests, setFollowRequests] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadAll = async () => {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;
        try {
          const [bRes, fRes, sRes, rRes] = await Promise.all([
            axios.get<Board[]>(`${baseURL}/api/boards/`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get<{ username: string }[]>(`${baseURL}/api/neighbor/list/`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get<{ boards: Board[]; memos: any[] }>(`${baseURL}/api/neighbor/content/`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get<{ username: string }[]>(`${baseURL}/api/neighbor/requests/`, { headers: { Authorization: `Bearer ${token}` } }),
          ]);
          setBoards(bRes.data);
          setFollowingList(fRes.data.map(u => u.username));
          setSharedBoards([{ id: 0, title: '사용방법' }, ...sRes.data.boards]);
          setFollowRequests(rRes.data.map(u => u.username));
        } catch (e) {
          console.error(e);
        }
      };
      loadAll();
    }, [])
  );

  const respondRequest = async (username: string, accept: boolean) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;
    try {
      const url = accept ? `${baseURL}/api/neighbor/accept/` : `${baseURL}/api/neighbor/cancel/`;
      await axios.post(url, { username }, { headers: { Authorization: `Bearer ${token}` } });
      setFollowRequests(prev => prev.filter(u => u !== username));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token || !followSearch.trim()) return;
    try {
      const res = await axios.get<{ username: string }[]>(
        `${baseURL}/api/neighbor/search/`,
        { params: { q: followSearch.trim() }, headers: { Authorization: `Bearer ${token}` } }
      );
      setSearchResults(res.data.map(u => u.username));
    } catch {
      Alert.alert('검색 실패');
    }
  };

  const sendFollowRequest = async (username: string) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;
    try {
      await axios.post(
        `${baseURL}/api/neighbor/request/`,
        { target_id : username },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('성공', '이웃 요청을 보냈습니다.');
    } catch (error) {
      console.error('이웃 요청 실패:', error);
      Alert.alert('실패', '이웃 요청 중 문제가 발생했습니다.');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    setIsLoggedIn(false);
  };

  const createBoard = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.post<Board>(
        `${baseURL}/api/boards/`,
        { title: newBoardName.trim(), category: 'default' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBoards(prev => [...prev, res.data]);
      setNewBoardName('');
    } catch {
      Alert.alert('보드 추가 실패');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.title}>📋 메모 보드 목록</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => setShowFollowModal(true)}>
              <Text style={styles.addButtonText}>이웃 관리</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.logout}>로그아웃</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.subtitle}>내 보드 목록</Text>
        <FlatList
          data={boards}
          keyExtractor={item => `mine-${item.id}`}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.boardRow} onPress={() => navigation.navigate('MemoBoard', { folderId: item.id, boardTitle: item.title })}>
              <Text style={styles.boardText}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />

        <Text style={[styles.subtitle, { marginTop: 16 }]}>이웃의 보드 목록</Text>
        <FlatList
          data={sharedBoards}
          keyExtractor={item => `shared-${item.id}`}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.boardRow} onPress={() => navigation.navigate('MemoBoard', item.id === 0 ? { folderId: 0, boardTitle: '사용방법', isGuide: true } : { folderId: item.id, boardTitle: item.title })}>
              <Text style={styles.boardText}>{item.title}</Text>
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
        <TouchableOpacity style={styles.addButton} onPress={createBoard}>
          <Text style={styles.addButtonText}>보드 추가</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showFollowModal} animationType="slide" transparent onRequestClose={() => setShowFollowModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.inner, styles.modalContainer]}>
            <Text style={styles.title}>이웃 관리</Text>

            <Text style={styles.subtitle}>검색</Text>
            <View style={styles.headerRight}>
              <TextInput
                style={styles.searchInput}
                placeholder="사용자 검색"
                placeholderTextColor="#aaa"
                value={followSearch}
                onChangeText={setFollowSearch}
              />
              <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
                <Text style={styles.addButtonText}>검색</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={searchResults}
              keyExtractor={item => `search-${item}`}
              renderItem={({ item }) => (
                <View style={styles.boardRowContent}>
                  <Text style={styles.boardText}>{item}</Text>
                  <TouchableOpacity onPress={() => sendFollowRequest(item)}>
                    <Text style={styles.addButtonText}>이웃 요청</Text>
                  </TouchableOpacity>
                </View>
              )}
              style={styles.searchResults}
            />

            <Text style={styles.subtitle}>받은 이웃 요청</Text>
            <FlatList
              data={followRequests}
              keyExtractor={item => `request-${item}`}
              renderItem={({ item }) => (
                <View style={styles.boardRowContent}>
                  <Text style={styles.boardText}>{item}</Text>
                  <TouchableOpacity onPress={() => respondRequest(item, true)}>
                    <Text style={styles.addButtonText}>수락</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => respondRequest(item, false)}>
                    <Text style={styles.addButtonText}>거절</Text>
                  </TouchableOpacity>
                </View>
              )}
            />

            <Text style={styles.subtitle}>내 이웃 목록</Text>
            <FlatList
              data={followingList}
              keyExtractor={item => `follow-${item}`}
              renderItem={({ item }) => (
                <Text style={styles.boardText}>{item}</Text>
              )}
            />

            <TouchableOpacity onPress={() => setShowFollowModal(false)} style={styles.addButton}>
              <Text style={styles.addButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default BoardListScreen;

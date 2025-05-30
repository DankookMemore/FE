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
import { RootStackParamList } from '../../App';
import { styles } from './BoardListScreen.styles';

const baseURL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000';

type Board = { id: number; title: string; category?: string };

type Memo = {
  id: number;
  board: number;
  content: string;
  timestamp: string;
  is_finished: boolean;
  summary?: string | null;
  user: string;
};


const BoardListScreen: React.FC<{ setIsLoggedIn: (val: boolean) => void }> = ({ setIsLoggedIn }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [boards, setBoards] = useState<Board[]>([]);
  const [sharedBoards, setSharedBoards] = useState<Board[]>([{ id: 0, title: '사용방법' }]);
  const [sharedMemos, setSharedMemos] = useState<Memo[]>([]);
  const [newBoardName, setNewBoardName] = useState('');

  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followSearch, setFollowSearch] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [followingList, setFollowingList] = useState<string[]>([]);
  const [followRequests, setFollowRequests] = useState<string[]>([]);

  const loadAll = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;
    try {
      const [bRes, fRes, sRes, rRes] = await Promise.all([
        fetch(`${baseURL}/api/boards/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${baseURL}/api/neighbor/list/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${baseURL}/api/neighbor/content/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${baseURL}/api/neighbor/requests/`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const boards = await bRes.json();
      const followings = await fRes.json();
      const shared = await sRes.json();
      const requests = await rRes.json();

      setBoards(boards);
      setFollowingList(followings.map((u: any) => u.username));
      setSharedBoards([{ id: 0, title: '사용방법' }, ...shared.boards]);
      setSharedMemos(shared.memos);
      setFollowRequests(requests.map((u: any) => u.username));
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [])
  );

  const respondRequest = async (username: string, accept: boolean) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;
    try {
      const url = accept ? `${baseURL}/api/neighbor/accept/` : `${baseURL}/api/neighbor/cancel/`;
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });
      await loadAll();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token || !followSearch.trim()) return;
    try {
      const res = await fetch(`${baseURL}/api/neighbor/search/?q=${encodeURIComponent(followSearch.trim())}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSearchResults(data.map((u: any) => u.username));
    } catch {
      Alert.alert('검색 실패');
    }
  };

  const sendFollowRequest = async (username: string) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;
    try {
      await fetch(`${baseURL}/api/neighbor/request/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });
      Alert.alert('성공', '이웃 요청을 보냈습니다.');
      await loadAll();
    } catch (error) {
      console.error('이웃 요청 실패:', error);
      Alert.alert('실패', '이웃 요청 중 문제가 발생했습니다.');
    }
  };

  const removeNeighbor = async (username: string) => {
  const token = await AsyncStorage.getItem('token');
  if (!token) return;
  try {
    const res = await fetch(`${baseURL}/api/neighbor/remove/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username }),
    });
    if (!res.ok) throw new Error('이웃 삭제 실패');
    await loadAll();  // UI 갱신
  } catch (e) {
    console.error('이웃 삭제 실패:', e);
    Alert.alert('실패', '이웃 취소 중 오류가 발생했습니다.');
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
      const res = await fetch(`${baseURL}/api/boards/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newBoardName.trim(), category: 'default' }),
      });
      if (!res.ok) throw new Error('생성 실패');
      setNewBoardName('');
      await loadAll();
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
    <TouchableOpacity
      style={styles.boardRow}
      onPress={() => {
        if (item.id === 0) {
          navigation.navigate('MemoBoard', { folderId: 0 });
        } else {
          const filteredMemos = sharedMemos.filter(m => m.board === item.id);
          navigation.navigate('MemoBoard', {
            folderId: item.id,
            boardTitle: item.title,
            presetMemos: filteredMemos,
            boardOwner: item.user, // optional
          });
        }
      }}
    >
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
    <View style={styles.boardRowContent}>
      <Text style={styles.boardText}>{item}</Text>
      <TouchableOpacity onPress={() => removeNeighbor(item)}>
        <Text style={styles.addButtonText}>이웃 취소</Text>
      </TouchableOpacity>
    </View>
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

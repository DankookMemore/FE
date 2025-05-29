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
  Platform.OS === 'android' ? 'http://localhost:8000' : 'http://127.0.0.1:8000';

type Board = { id: number; title: string };

const BoardListScreen: React.FC<{ setIsLoggedIn: (val: boolean) => void }> = ({ setIsLoggedIn }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [boards, setBoards] = useState<Board[]>([]);
  const [sharedBoards, setSharedBoards] = useState<Board[]>([{ id: 0, title: '사용방법' }]);
  const [newBoardName, setNewBoardName] = useState('');

  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followSearch, setFollowSearch] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [followingList, setFollowingList] = useState<string[]>(['안내사항']);
  const [followRequests, setFollowRequests] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadAll = async () => {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;
        try {
          const [bRes, fRes, sRes, rRes] = await Promise.all([
            axios.get<Board[]>(`${baseURL}/api/boards/`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get<{ username: string }[]>(`${baseURL}/api/allfollower/`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get<{ boards: Board[] }>(`${baseURL}/api/following-content/`, { headers: { Authorization: `Bearer ${token}` } }),
            //axios.get<{ from_username: string }[]>(`${baseURL}/api/follow_requests/`, { headers: { Authorization: `Bearer ${token}` } }),
          ]);
          setBoards(bRes.data);
          setFollowingList(fRes.data.map(u => u.username));
          setSharedBoards([{ id: 0, title: '사용방법' }, ...sRes.data.boards]);
          setFollowRequests(rRes.data.map(r => r.from_username));
        } catch (e) {
          console.error(e);
        }
      };
      loadAll();
    }, [])
  );

  const toggleFollowUser = async (username: string) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;
    const endpoint = followingList.includes(username) ? 'unfollow' : 'follow';
    try {
      await axios.post(`${baseURL}/api/${endpoint}/`, { username }, { headers: { Authorization: `Bearer ${token}` } });
      const [fRes, sRes] = await Promise.all([
        axios.get<{ username: string }[]>(`${baseURL}/api/list_following/`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get<{ boards: Board[] }>(`${baseURL}/api/following_content/`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setFollowingList(fRes.data.map(u => u.username));
      setSharedBoards(sRes.data.boards);
    } catch {
      Alert.alert('오류', '요청 실패');
    }
  };

  const respondRequest = async (username: string, accept: boolean) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;
    try {
      const url = accept ? `${baseURL}/api/follow_requests/accept/` : `${baseURL}/api/follow_requests/decline/`;
      await axios.post(url, { username }, { headers: { Authorization: `Bearer ${token}` } });
      setFollowRequests(prev => prev.filter(u => u !== username));
      if (accept) toggleFollowUser(username);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token || !followSearch.trim()) return;
    try {
      const res = await axios.get<{ username: string }[]>(
        `${baseURL}/api/search_users/`,
        { params: { q: followSearch.trim() }, headers: { Authorization: `Bearer ${token}` } }
      );
      setSearchResults(res.data.map(u => u.username));
    } catch {
      Alert.alert('검색 실패');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    setIsLoggedIn(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.title}>📋 메모 보드 목록</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => setShowFollowModal(true)}>
              <Text style={styles.addButtonText}>팔로우 관리</Text>
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
            <TouchableOpacity style={styles.boardRow} onPress={() => navigation.navigate('MemoBoard', { folderId: item.id })}>
              <Text style={styles.boardText}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />

        <Text style={[styles.subtitle, { marginTop: 16 }]}>팔로우한 사람 보드 목록</Text>
        <FlatList
          data={sharedBoards}
          keyExtractor={item => `shared-${item.id}`}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.boardRow} onPress={() => navigation.navigate('MemoBoard', { folderId: item.id })}>
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
        <TouchableOpacity style={styles.addButton} onPress={async () => {
          const token = await AsyncStorage.getItem('token');
          if (!token) return;
          try {
            const res = await axios.post<Board>(`${baseURL}/api/boards/`, { title: newBoardName.trim() }, { headers: { Authorization: `Bearer ${token}` } });
            setBoards(prev => [...prev, res.data]);
            setNewBoardName('');
          } catch {
            Alert.alert('보드 추가 실패');
          }
        }}>
          <Text style={styles.addButtonText}>보드 추가</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showFollowModal} animationType="slide" transparent onRequestClose={() => setShowFollowModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.inner, styles.modalContainer]}>
            <Text style={styles.title}>팔로우 관리</Text>

            <Text style={styles.subtitle}>팔로우 요청 목록</Text>
            {followRequests.length === 0 ? (
              <Text style={styles.boardText}>요청된 팔로우가 없습니다.</Text>
            ) : (
              <FlatList
                data={followRequests}
                keyExtractor={item => `req-${item}`}
                renderItem={({ item }) => (
                  <View style={styles.boardRowContent}>
                    <Text style={styles.boardText}>{item}</Text>
                    <View style={styles.headerRight}>
                      <TouchableOpacity onPress={() => respondRequest(item, true)}>
                        <Text style={styles.addButtonText}>수락</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => respondRequest(item, false)}>
                        <Text style={styles.logout}>거절</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            )}

            <Text style={[styles.subtitle, { marginTop: 16 }]}>내가 팔로잉 중인 사용자</Text>
            <FlatList
              data={followingList}
              keyExtractor={item => `following-${item}`}
              renderItem={({ item }) => (
                <View style={styles.boardRowContent}>
                  <Text style={styles.boardText}>{item}</Text>
                  <TouchableOpacity onPress={() => {
                    Alert.alert(
                      '언팔로우',
                      `${item}님을 언팔로우 하시겠습니까?`,
                      [
                        { text: '취소', style: 'cancel' },
                        { text: '확인', onPress: () => toggleFollowUser(item) },
                      ]
                    );
                  }}>
                    <Text style={styles.logout}>언팔로우</Text>
                  </TouchableOpacity>
                </View>
              )}
              style={styles.searchResults}
            />

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

            <Text style={[styles.subtitle, { marginTop: 16 }]}>검색 결과</Text>
            {searchResults.length === 0 ? (
              <Text style={styles.boardText}>검색된 사용자가 없습니다.</Text>
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={item => `search-${item}`}
                renderItem={({ item }) => (
                  <View style={styles.boardRowContent}>
                    <Text style={styles.boardText}>{item}</Text>
                    <TouchableOpacity onPress={() => toggleFollowUser(item)}>
                      <Text style={styles.addButtonText}>{followingList.includes(item) ? '언팔로우' : '팔로우'}</Text>
                    </TouchableOpacity>
                  </View>
                )}
                style={styles.searchResults}
              />
            )}

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

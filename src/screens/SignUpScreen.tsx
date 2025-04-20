import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const SignupScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');

  const handleSignUp = async () => {
    if (!username || !password || !nickname || !email) {
      Alert.alert('오류', '모든 항목을 입력해주세요.');
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/signup/', {
        username,
        password,
        nickname,
        email,
      });

      if (response.status === 201) {
        Alert.alert('회원가입 성공', '로그인 화면으로 이동합니다.');
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      } else {
        Alert.alert('회원가입 실패', response.data?.error || '다시 시도해주세요.');
      }
    } catch (error: any) {
      Alert.alert('회원가입 실패', error.response?.data?.error || '서버 오류');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원가입</Text>

      <TextInput
        style={styles.input}
        placeholder="아이디 (예: user123)"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="닉네임"
        value={nickname}
        onChangeText={setNickname}
      />
      <TextInput
        style={styles.input}
        placeholder="이메일 (비밀번호 분실 시)"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <Button title="가입하기" onPress={handleSignUp} />
      <View style={{ height: 16 }} />
      <Button title="뒤로가기" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 24 },
  input: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
});

export default SignupScreen;

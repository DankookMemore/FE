import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const LoginScreen = ({ setIsLoggedIn }: { setIsLoggedIn: (val: boolean) => void }) => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', {
        username: email,
        password: password,
      });

      if (response.status === 200) {
        const { id, nickname, token } = response.data;

        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('userId', id.toString());
        await AsyncStorage.setItem('nickname', nickname);

        Alert.alert('로그인 성공', `${nickname}님 환영합니다!`);
        setIsLoggedIn(true); // 🔥 핵심 부분: App.tsx 상태 갱신
      }
    } catch (error: any) {
      Alert.alert('로그인 실패', error.response?.data?.error || '서버 오류');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>MEMO-RE</Text>

      <TextInput
        placeholder="이메일 아이디"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="비밀번호"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>로그인</Text>
      </TouchableOpacity>

      <View style={styles.linkContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.linkText}>회원가입</Text>
        </TouchableOpacity>
        <Text style={styles.separator}>|</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.linkText}>비밀번호 찾기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 40,
    color: '#89b0ae',
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#f8f8f8',
  },
  loginButton: {
    backgroundColor: '#89b0ae',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  linkText: {
    color: '#89b0ae',
    fontWeight: '600',
    paddingHorizontal: 10,
  },
  separator: {
    color: '#ccc',
  },
});

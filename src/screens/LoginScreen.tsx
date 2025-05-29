import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { baseURL } from '../config/baseURL';
import { styles } from './LoginScreen.styles';

const LoginScreen = ({ setIsLoggedIn }: { setIsLoggedIn: (val: boolean) => void }) => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${baseURL}/api/login/`, {
        username: email,
        password: password,
      });

      if (response.status === 200) {
        const { id, nickname, token } = response.data;

        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('userId', id.toString());
        await AsyncStorage.setItem('nickname', nickname);

        Alert.alert('로그인 성공', `${nickname}님 환영합니다!`);
        setIsLoggedIn(true);
      }
    } catch (error: any) {
      Alert.alert('로그인 실패', error.response?.data?.error || '서버 오류');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Image
        source={require('../../assets/Login_background.jpg')}
        style={styles.backgroundImage}
      />

      <View style={styles.card}>
        <Text style={styles.logo}>MEMO-RE</Text>

        <TextInput
          placeholder="이메일 아이디"
          placeholderTextColor="#ccc"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="비밀번호"
          placeholderTextColor="#ccc"
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
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

// SignupScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { RootStackParamList } from '../../App';
import { styles } from './SignupScreen.styles';

const SignupScreen: React.FC<{ setIsLoggedIn: (val: boolean) => void }> = ({ setIsLoggedIn }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !nickname) {
      Alert.alert('오류', '모든 항목을 입력해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/signup/', {
        username: email,
        password,
        password2: confirmPassword,
        nickname,
        email,
      });

      if (response.status === 201) {
        Alert.alert('회원가입 성공', '자동 로그인 중입니다...');

        const loginRes = await axios.post('http://localhost:8000/api/login/', {
          username: email,
          password,
        });

        if (loginRes.status === 200) {
          const { token, id, nickname } = loginRes.data;
          await AsyncStorage.setItem('token', token);
          await AsyncStorage.setItem('userId', id.toString());
          await AsyncStorage.setItem('nickname', nickname);
          setIsLoggedIn(true);
          navigation.reset({ index: 0, routes: [{ name: 'BoardList' }] });
        } else {
          Alert.alert('로그인 실패', '자동 로그인에 실패했습니다.');
          navigation.navigate('Login');
        }
      }
    } catch (error: any) {
      const data = error.response?.data;
      const message =
        data?.error_message ||
        data?.error ||
        data?.username?.[0] ||
        data?.password?.[0] ||
        data?.nickname?.[0] ||
        data?.email?.[0] ||
        '회원가입에 실패했습니다.';
      Alert.alert('회원가입 오류', message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>회원가입</Text>
        <TextInput
          style={styles.input}
          placeholder="이메일 주소"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호 확인"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="닉네임"
          placeholderTextColor="#aaa"
          value={nickname}
          onChangeText={setNickname}
        />
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>가입하기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.link} onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>뒤로가기</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;

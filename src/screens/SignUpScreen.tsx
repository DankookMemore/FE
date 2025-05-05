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
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const SignupScreen = ({ setIsLoggedIn }: { setIsLoggedIn: (val: boolean) => void }) => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');

  const handleSignUp = async () => {
    if (!email || !password || !nickname) {
      Alert.alert('오류', '모든 항목을 입력해주세요.');
      return;
    }

    try {
      const response = await axios.post('http://192.168.45.170:8000/api/signup/', {
        username: email,
        password,
        nickname,
        email,
      });

      if (response.status === 201) {
        Alert.alert('회원가입 성공', '자동 로그인 중입니다...');

        const loginResponse = await axios.post('http://192.168.45.170:8000/api/login/', {
          username: email,
          password,
        });

        if (loginResponse.status === 200) {
          const { token, id, nickname } = loginResponse.data;

          await AsyncStorage.setItem('token', token);
          await AsyncStorage.setItem('userId', id.toString());
          await AsyncStorage.setItem('nickname', nickname);

          setIsLoggedIn(true);

          navigation.reset({
            index: 0,
            routes: [{ name: 'BoardList' }],
          });
        } else {
          Alert.alert('로그인 실패', '회원가입 후 자동 로그인에 실패했습니다.');
          navigation.navigate('Login');
        }
      } else {
        Alert.alert('회원가입 실패', '다시 시도해주세요.');
      }
    } catch (error: any) {
      const data = error.response?.data;
      let message = '회원가입에 실패했습니다.';
      if (data?.username) message = data.username[0];
      else if (data?.password) message = data.password[0];
      else if (data?.nickname) message = data.nickname[0];
      else if (data?.email) message = data.email[0];

      Alert.alert('회원가입 오류', message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원가입</Text>

      <TextInput
        style={styles.input}
        placeholder="이메일 주소"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
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

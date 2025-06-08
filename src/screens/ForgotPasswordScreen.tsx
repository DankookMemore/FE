import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import axios from 'axios';
import { styles } from './ForgotPasswordScreen.styles';
import { RootStackParamList } from '../../App';

const baseURL = 'http://localhost:8000';

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleResetPassword = async () => {
    if (!email || !newPassword) {
      console.error('이메일과 새로운 비밀번호를 모두 입력해주세요.');
      return;
    }
    try {
      const response = await axios.post(
        `${baseURL}/api/reset-password/`,
        { email, new_password: newPassword }
      );
      if (response.status === 200) {
        navigation.navigate('Login');
      } else {
        console.error('비밀번호 재설정에 실패했습니다.');
      }
    } catch (error: any) {
      const msg = error.response?.data?.error || '비밀번호 재설정 중 오류가 발생했습니다.';
      console.error('오류:', msg);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>비밀번호 재설정</Text>
        <TextInput
          style={styles.input}
          placeholder="가입한 이메일 주소"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="새로운 비밀번호"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
          <Text style={styles.buttonText}>비밀번호 재설정</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>로그인 화면으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;

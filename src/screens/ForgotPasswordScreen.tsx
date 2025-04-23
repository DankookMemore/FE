import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleResetPassword = async () => {
    if (!email || !newPassword) {
      Alert.alert('오류', '이메일과 새로운 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/reset-password/', {
        email,
        new_password: newPassword,
      });

      if (response.status === 200) {
        Alert.alert('성공', '비밀번호가 재설정되었습니다.');
      } else {
        Alert.alert('실패', '재설정에 실패했습니다.');
      }
    } catch (error: any) {
      const data = error.response?.data;
      let message = '비밀번호 재설정 중 오류가 발생했습니다.';
      if (data?.error) message = data.error;
      Alert.alert('오류', message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>비밀번호 재설정</Text>
      <TextInput
        placeholder="가입한 이메일 주소"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="새로운 비밀번호"
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      <Button title="비밀번호 재설정" onPress={handleResetPassword} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 20, marginBottom: 12, textAlign: 'center' },
  input: { borderBottomWidth: 1, marginBottom: 12, padding: 8 },
});

export default ForgotPasswordScreen;

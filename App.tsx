import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignUpScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import BoardListScreen from './src/screens/BoardListScreen';
import MemoBoardScreen from './src/screens/MemoBoardScreen';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  BoardList: undefined;
  MemoBoard: {
    folderId: number;
    boardTitle?: string;
    boardOwner?: string;
    isGuide?: boolean;
    presetMemos?: Memo[];
  };
};

const AuthStack = createNativeStackNavigator<RootStackParamList>();
const AppStack  = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [checkingLogin, setCheckingLogin] = useState<boolean>(true);

  useEffect(() => {
    const initialize = async () => {
      await Notifications.requestPermissionsAsync();
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });

      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
      setCheckingLogin(false);
    };
    initialize();
  }, []);

  if (checkingLogin) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator size="large" color="#89b0ae" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <AppStack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName="BoardList"
        >
          <AppStack.Screen name="BoardList">
            {props => <BoardListScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
          </AppStack.Screen>
          <AppStack.Screen name="MemoBoard" component={MemoBoardScreen} />
        </AppStack.Navigator>
      ) : (
        <AuthStack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName="Login"
        >
          <AuthStack.Screen name="Login">
            {props => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
          </AuthStack.Screen>
          <AuthStack.Screen name="Signup">
            {props => <SignupScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
          </AuthStack.Screen>
          <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}

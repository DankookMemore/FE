import { Platform } from 'react-native';

const LOCAL_PC_IP = '172.20.10.2';  

export const baseURL =
  Platform.OS === 'android'
    ? `http://${LOCAL_PC_IP}:8000`  
    : 'http://localhost:8000';     
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    email: string;
    uid: string;
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    const token = response.data.token || response.data.idToken;
    
    // Save token
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data));
    
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  getToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem('token');
  },

  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  },
};
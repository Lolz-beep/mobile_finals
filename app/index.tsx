import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Award } from 'lucide-react-native';
import { authService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // User is already logged in, redirect to home
        router.replace('/class/homePage');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      await authService.login({ email, password });
      router.replace('/class/homePage');
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Failed',
        error.response?.data?.message || 'Invalid credentials. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-600 to-indigo-800 justify-center items-center">
        <ActivityIndicator size="large" color="white" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-600 to-indigo-800">
      <View className="flex-1 justify-center px-6">
        <View className="items-center mb-8">
          <View className="bg-white/10 rounded-3xl p-8 mb-6">
            <Award size={64} color="white" />
          </View>
          <Text className="text-4xl font-bold text-white mb-2">
            Mobile Development
          </Text>
          <Text className="text-blue-200">AI-powered classroom</Text>
        </View>

        <View className="bg-white rounded-3xl p-8">
          <View className="flex-row gap-2 mb-6">
            <TouchableOpacity className="flex-1 py-3 rounded-xl bg-blue-600">
              <Text className="text-white font-semibold text-center">Student</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 py-3 rounded-xl bg-gray-100">
              <Text className="text-gray-600 font-semibold text-center">Teacher</Text>
            </TouchableOpacity>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200"
                secureTextEntry
                editable={!loading}
              />
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600 text-sm">Remember Me</Text>
              <TouchableOpacity>
                <Text className="text-blue-600 font-medium text-sm">Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleSignIn}
              disabled={loading}
              className={`w-full py-4 rounded-xl ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-center">
                  Sign in as Student
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
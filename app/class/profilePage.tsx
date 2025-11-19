import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, SafeAreaView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { User, LogOut } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    name: '',
    username: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        setProfile({
          name: userData.displayName || userData.name || '',
          username: userData.email?.split('@')[0] || '',
          email: userData.email || '',
          phone: userData.phoneNumber || userData.phone || ''
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      // For web, use native confirm
      const confirmed = window.confirm('Are you sure you want to sign out?');
      if (confirmed) {
        performSignOut();
      }
    } else {
      // For mobile, use Alert
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: performSignOut
          }
        ]
      );
    }
  };

  const performSignOut = async () => {
    try {
      console.log('Signing out...');
      
      // Clear all auth data
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.clear();
      
      console.log('Auth data cleared, navigating to index...');
      
      // Try multiple navigation methods
      if (Platform.OS === 'web') {
        // For web, use window.location
        window.location.href = '/';
      } else {
        // For mobile, use router.replace
        router.replace('/');
      }
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleSaveChanges = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        const updatedUser = {
          ...userData,
          displayName: profile.name,
          phoneNumber: profile.phone
        };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
        if (Platform.OS === 'web') {
          alert('Profile updated successfully!');
        } else {
          Alert.alert('Success', 'Profile updated successfully!');
        }
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      if (Platform.OS === 'web') {
        alert('Failed to save changes. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to save changes. Please try again.');
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-6 pt-6">
        {/* Profile Header */}
        <View className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 mb-6 items-center shadow-lg">
          <View className="w-24 h-24 bg-white/20 rounded-full items-center justify-center mb-4">
            <User size={48} color="white" />
          </View>
          <Text className="text-2xl font-bold text-white mb-1">
            {profile.name || profile.username || 'Student'}
          </Text>
          <Text className="text-white/80">@{profile.username || 'user'}</Text>
        </View>

        {/* Profile Form */}
        <View className="bg-white rounded-2xl p-5 mb-6 border border-gray-100 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-4">Profile Information</Text>
          
          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1">Name</Text>
            <TextInput
              value={profile.name}
              onChangeText={(text) => setProfile({ ...profile, name: text })}
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1">Email Address</Text>
            <TextInput
              value={profile.email}
              editable={false}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1">Username</Text>
            <TextInput
              value={profile.username}
              editable={false}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1">Phone Number</Text>
            <TextInput
              value={profile.phone}
              onChangeText={(text) => setProfile({ ...profile, phone: text })}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white"
            />
          </View>

          <TouchableOpacity 
            onPress={handleSaveChanges}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md"
          >
            <Text className="text-white font-semibold text-center">Save Changes</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={handleSignOut}
          className="w-full py-4 bg-red-50 rounded-xl mb-6 border-2 border-red-200 flex-row items-center justify-center gap-2 shadow-sm"
        >
          <LogOut size={20} color="#dc2626" />
          <Text className="text-red-600 font-bold text-center text-base">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
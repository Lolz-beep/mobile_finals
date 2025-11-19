import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, SafeAreaView, Alert, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { User, LogOut, Camera, Image as ImageIcon } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    profileImage: ''
  });

  useEffect(() => {
    loadUserData();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to change your profile picture!');
      }
      
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus.status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera permissions to take photos!');
      }
    }
  };

  const loadUserData = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        setProfile({
          name: userData.displayName || userData.name || '',
          username: userData.email?.split('@')[0] || '',
          email: userData.email || '',
          phone: userData.phoneNumber || userData.phone || '',
          profileImage: userData.profileImage || ''
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setProfile({ ...profile, profileImage: imageUri });
        
        // Save to AsyncStorage immediately
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const userData = JSON.parse(user);
          const updatedUser = {
            ...userData,
            profileImage: imageUri
          };
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      if (Platform.OS === 'web') {
        alert('Failed to pick image. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to pick image. Please try again.');
      }
    }
  };

  const takePhoto = async () => {
    try {
      // Request camera permission first
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setProfile({ ...profile, profileImage: imageUri });
        
        // Save to AsyncStorage immediately
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const userData = JSON.parse(user);
          const updatedUser = {
            ...userData,
            profileImage: imageUri
          };
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      if (Platform.OS === 'web') {
        alert('Camera is not available on web. Please use the library option.');
      } else {
        Alert.alert('Error', 'Failed to take photo. Please try again.');
      }
    }
  };

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to sign out?');
      if (confirmed) {
        performSignOut();
      }
    } else {
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
      
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.clear();
      
      console.log('Auth data cleared, navigating to index...');
      
      if (Platform.OS === 'web') {
        window.location.href = '/';
      } else {
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
          phoneNumber: profile.phone,
          profileImage: profile.profileImage
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
        <View className="bg-blue-600 rounded-3xl p-6 mb-6 shadow-lg relative">
          <View className="items-center">
            <View className="mb-4">
              {profile.profileImage ? (
                <Image 
                  source={{ uri: profile.profileImage }}
                  className="w-24 h-24 rounded-full"
                  style={{ width: 96, height: 96, borderRadius: 48 }}
                />
              ) : (
                <View className="w-24 h-24 bg-white/20 rounded-full items-center justify-center">
                  <User size={48} color="white" />
                </View>
              )}
            </View>
            
            <Text className="text-2xl font-bold text-white mb-1">
              {profile.name || profile.username || 'Student'}
            </Text>
            <Text className="text-white/80">@{profile.username || 'user'}</Text>
          </View>
          
          <View className="absolute bottom-6 right-6 flex-row gap-3" style={{ position: 'absolute', bottom: 24, right: 24 }}>
            <TouchableOpacity 
              onPress={pickImage}
              className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-md"
            >
              <ImageIcon size={20} color="#2563eb" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={takePhoto}
              className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-md"
            >
              <Camera size={20} color="#2563eb" />
            </TouchableOpacity>
          </View>
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
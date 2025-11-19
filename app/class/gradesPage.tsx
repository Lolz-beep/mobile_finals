import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import ProfileAvatar from '@/components/profileAvatar';

const quizzesData = [
  { id: 1, title: 'Mobile Development', total: 100000, lastSession: 5000 },
  { id: 2, title: 'Mobile Development', total: 100000, lastSession: 5000 },
  { id: 3, title: 'Mobile Development', total: 100000, lastSession: 5000 },
  { id: 4, title: 'Mobile Development', total: 100000, lastSession: 5000 },
  { id: 5, title: 'Mobile Development', total: 100000, lastSession: 5000 }
];

export default function GradesPage() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-blue-600 px-4 py-6 mb-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <ProfileAvatar size={48} iconSize={24} borderColor="transparent" showBorder={false} />
            <View>
              <Text className="text-white font-semibold text-base">Mobile Dev</Text>
              <Text className="text-white/90 text-sm">Welcome Back! Student</Text>
            </View>
          </View>
          <View className="w-8 h-8 bg-white/20 rounded-lg items-center justify-center">
            <Text className="text-white text-lg">⚙️</Text>
          </View>
        </View>
      </View>
      
      <ScrollView className="flex-1 px-4">
        {quizzesData.map((quiz) => (
          <View key={quiz.id} className="bg-white rounded-xl p-4 mb-3 border border-gray-300">
            <View className="flex-row items-center mb-3">
              <View className="w-2 h-2 bg-blue-600 rounded-full mr-2" />
              <Text className="font-semibold text-blue-900 text-base">{quiz.title}</Text>
            </View>
            
            <View className="space-y-1">
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-gray-700">Total:</Text>
                <View className="flex-row items-center">
                  <Text className="text-sm font-medium text-red-500 mr-2">{quiz.total}</Text>
                  <Text className="text-sm text-red-500">Points</Text>
                </View>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-gray-700">Last session:</Text>
                <View className="flex-row items-center">
                  <Text className="text-sm font-medium text-red-500 mr-2">{quiz.lastSession}</Text>
                  <Text className="text-sm text-red-500">Points</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
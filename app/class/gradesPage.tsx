import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { Award } from 'lucide-react-native';

const quizzesData = [
  { id: 1, title: 'Mobile Development', total: 100, lastSession: 90 },
  { id: 2, title: 'UI/UX Design', total: 100, lastSession: 85 },
  { id: 3, title: 'Backend Development', total: 100, lastSession: 75 }
];

export default function GradesPage() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-6 pt-6">
        <View className="bg-purple-600 rounded-3xl p-6 mb-6">
          <Text className="text-2xl font-bold text-white mb-2">Quiz Results</Text>
          <Text className="text-white/80">Track your performance</Text>
        </View>

        {quizzesData.map((quiz) => (
          <View key={quiz.id} className="bg-white rounded-2xl p-5 mb-3 border border-gray-100">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-semibold text-gray-800">{quiz.title}</Text>
              <Award size={24} color="#eab308" />
            </View>
            
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-xs text-gray-500 mb-1">Total:</Text>
                <Text className="text-2xl font-bold text-gray-800">{quiz.total}</Text>
                <Text className="text-xs text-blue-600 font-medium">Points</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500 mb-1">Last session:</Text>
                <Text className="text-2xl font-bold text-green-600">{quiz.lastSession}</Text>
                <Text className="text-xs text-green-600 font-medium">Points</Text>
              </View>
            </View>
            
            <View className="w-full h-2 bg-gray-100 rounded-full mt-4">
              <View
                className="h-2 bg-green-500 rounded-full"
                style={{ width: `${quiz.lastSession}%` }}
              />
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
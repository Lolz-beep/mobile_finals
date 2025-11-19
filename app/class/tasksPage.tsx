import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { User, FileText, Clock } from 'lucide-react-native';
import { classroomService, Assignment } from '../../services/classroomService';
import ProfileAvatar from '@/components/profileAvatar';

const CLASSROOM_ID = 'SNFMC37EflogtvFyX8wj';

export default function TasksPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await classroomService.getAllAssignments(CLASSROOM_ID);
      setAssignments(data);
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAssignments();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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

        {assignments.length > 0 ? (
          assignments.map((assignment) => (
            <View key={assignment.id} className="bg-white rounded-2xl p-5 mb-3 border border-gray-100">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-2">
                    <FileText size={20} color="#9ca3af" />
                    <Text className="font-semibold text-gray-800">{assignment.title}</Text>
                  </View>

                  {assignment.dueDate && (
                    <View className="flex-row items-center mb-3">
                      <Clock size={16} color="#6b7280" />
                      <Text className="text-sm text-gray-600 ml-1">
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </Text>
                    </View>
                  )}

                  <View
                    className={`px-3 py-1 rounded-full self-start ${
                      assignment.status === 'overdue'
                        ? 'bg-red-100'
                        : assignment.status === 'completed'
                        ? 'bg-green-100'
                        : 'bg-blue-100'
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        assignment.status === 'overdue'
                          ? 'text-red-600'
                          : assignment.status === 'completed'
                          ? 'text-green-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {assignment.status === 'overdue'
                        ? 'Overdue'
                        : assignment.status === 'completed'
                        ? 'Completed'
                        : 'Pending'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity className="px-4 py-2 bg-blue-600 rounded-lg">
                  <Text className="text-white text-sm font-medium">View</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View className="bg-white rounded-2xl p-6 items-center">
            <Text className="text-gray-500">No assignments available</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
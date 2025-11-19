import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, FileText, Settings } from 'lucide-react-native';
import { classroomService } from '../../services/classroomService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLASSROOM_KEY = 'SNFMC37EflogtvFyX8wj';

export default function CourseDetailPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [materials, setMaterials] = useState<any[]>([]);
  const [classroomDetails, setClassroomDetails] = useState<any>(null);
  const [currentClassroomId, setCurrentClassroomId] = useState<string | null>(null);

  useEffect(() => {
    loadClassroomId();
  }, []);

  const loadClassroomId = async () => {
    try {
      const savedClassroomId = await AsyncStorage.getItem(CLASSROOM_KEY);
      if (savedClassroomId) {
        setCurrentClassroomId(savedClassroomId);
        await loadData(savedClassroomId);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading classroom:', error);
      setLoading(false);
    }
  };

  const loadData = async (classroomId: string) => {
    try {
      setLoading(true);
      const [details, mats] = await Promise.all([
        classroomService.getClassroomDetails(classroomId),
        classroomService.getClassroomMaterials(classroomId),
      ]);
      
      setClassroomDetails(details);
      setMaterials(mats);
    } catch (error) {
      console.error('Error loading course details:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    if (currentClassroomId) {
      setRefreshing(true);
      loadData(currentClassroomId);
    }
  };

  const handleOpenLink = (url: string) => {
    if (url) {
      Linking.openURL(url).catch((err) => 
        console.error('Failed to open URL:', err)
      );
    }
  };

  // Group materials by lesson or section
  const groupedMaterials = materials.reduce((acc: any, material: any) => {
    const lesson = material.lesson || material.section || 'Lesson 1';
    if (!acc[lesson]) {
      acc[lesson] = [];
    }
    acc[lesson].push(material);
    return acc;
  }, {});

  // If no lesson info, create a default grouping
  if (materials.length > 0 && Object.keys(groupedMaterials).length === 0) {
    groupedMaterials['Lesson 1'] = materials;
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-blue-600 px-6 pt-4 pb-6">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 bg-white rounded-full items-center justify-center">
              <Text className="text-2xl">👨‍💻</Text>
            </View>
            <View>
              <Text className="text-sm text-white font-medium">Mobile Dev</Text>
              <Text className="text-xs text-white/80">Welcome Back! Student</Text>
            </View>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity className="p-2 bg-white/20 rounded-lg">
              <Settings size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.back()}
              className="p-2 bg-white/20 rounded-lg"
            >
              <ArrowLeft size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Course Info Card */}
        <View className="px-6 py-4">
          <View className="bg-blue-600 rounded-3xl p-5">
            <Text className="text-white text-xl font-bold mb-1">
              {classroomDetails?.name || 'Mobile Development'}
            </Text>
            <Text className="text-white/80 text-sm">
              Teacher: {classroomDetails?.teacher || classroomDetails?.teacherName || 'Mrs. Veneat'}
            </Text>
          </View>
        </View>

        {/* Materials Tab */}
        <View className="px-6 mb-3">
          <View className="bg-blue-600 rounded-xl px-4 py-2 self-start">
            <Text className="text-white font-semibold">Materials</Text>
          </View>
        </View>

        {/* Materials List */}
        <View className="px-6 pb-6">
          {materials.length > 0 ? (
            Object.keys(groupedMaterials).map((lessonName, lessonIndex) => (
              <View key={lessonIndex} className="mb-4">
                {/* Lesson Header */}
                <View className="flex-row items-center mb-3">
                  <View className="w-2 h-2 rounded-full bg-blue-600 mr-2" />
                  <Text className="text-blue-600 font-bold text-base">{lessonName}</Text>
                </View>

                {/* Material Cards for this lesson */}
                {groupedMaterials[lessonName].map((material: any, index: number) => (
                  <TouchableOpacity
                    key={material.id || index}
                    onPress={() => material.url && handleOpenLink(material.url)}
                    className="bg-white rounded-2xl p-4 mb-3 border border-gray-200"
                  >
                    <View className="flex-row items-center gap-3">
                      <View className="w-12 h-12 rounded-xl bg-blue-100 items-center justify-center">
                        <FileText size={24} color="#2563eb" />
                      </View>
                      
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-800 mb-1">
                          {material.title || material.name || `Material ${index + 1}`}
                        </Text>
                        
                        {material.createdAt && (
                          <Text className="text-xs text-orange-500">
                            Posted: {new Date(material.createdAt).toLocaleDateString('en-US', { 
                              day: 'numeric',
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))
          ) : (
            <View className="bg-white rounded-2xl p-8 items-center border border-gray-200">
              <FileText size={48} color="#d1d5db" />
              <Text className="text-gray-500 mt-4 text-center">
                No course materials available yet
              </Text>
              <Text className="text-gray-400 text-sm mt-2 text-center">
                Check back later for updates
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
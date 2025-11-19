import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Clock, FileText, ExternalLink } from 'lucide-react-native';
import { classroomService } from '../../services/classroomService';

const CLASSROOM_ID = 'SNFMC37EflogtvFyX8wj';

export default function CourseDetailPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [materials, setMaterials] = useState<any[]>([]);
  const [classroomDetails, setClassroomDetails] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [details, mats] = await Promise.all([
        classroomService.getClassroomDetails(CLASSROOM_ID),
        classroomService.getClassroomMaterials(CLASSROOM_ID),
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
    setRefreshing(true);
    loadData();
  };

  const handleOpenLink = (url: string) => {
    if (url) {
      Linking.openURL(url).catch((err) => 
        console.error('Failed to open URL:', err)
      );
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
      case 'document':
        return '📄';
      case 'video':
        return '🎥';
      case 'link':
      case 'url':
        return '🔗';
      case 'image':
        return '🖼️';
      default:
        return '📁';
    }
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
      <ScrollView
        className="flex-1 px-6 pt-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="bg-blue-600 rounded-3xl p-6 mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center mb-4"
          >
            <ChevronRight 
              size={20} 
              color="rgba(255,255,255,0.8)" 
              style={{ transform: [{ rotate: '180deg' }] }} 
            />
            <Text className="text-white/80 ml-1">Back</Text>
          </TouchableOpacity>
          
          <Text className="text-2xl font-bold text-white mb-2">
            {classroomDetails?.name || 'Mobile Development'}
          </Text>
          <Text className="text-white/80">
            {classroomDetails?.teacher || classroomDetails?.teacherName || 'Instructor'}
          </Text>
          
          <View className="flex-row gap-4 mt-4">
            <View className="flex-1 bg-white/10 rounded-xl p-3">
              <Text className="text-sm text-white/90">Materials</Text>
              <Text className="text-2xl font-bold text-white">{materials.length}</Text>
            </View>
            <View className="flex-1 bg-white/10 rounded-xl p-3">
              <Text className="text-sm text-white/90">Status</Text>
              <Text className="text-2xl font-bold text-white">Active</Text>
            </View>
          </View>
        </View>

        <View>
          <Text className="text-lg font-bold text-gray-800 mb-4">Course Materials</Text>
          
          {materials.length > 0 ? (
            <View className="space-y-3">
              {materials.map((material, index) => (
                <TouchableOpacity
                  key={material.id || index}
                  onPress={() => material.url && handleOpenLink(material.url)}
                  className="bg-white rounded-2xl p-4 border-2 border-blue-100"
                >
                  <View className="flex-row items-start gap-4">
                    <View className="w-10 h-10 rounded-xl bg-blue-100 items-center justify-center">
                      <Text className="text-2xl">
                        {getMaterialIcon(material.type || material.materialType)}
                      </Text>
                    </View>
                    
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-800 mb-1">
                        {material.title || material.name || `Material ${index + 1}`}
                      </Text>
                      
                      {material.description && (
                        <Text className="text-sm text-gray-600 mb-2">
                          {material.description}
                        </Text>
                      )}
                      
                      <View className="flex-row items-center flex-wrap gap-2">
                        {material.type && (
                          <View className="bg-blue-50 px-2 py-1 rounded">
                            <Text className="text-xs text-blue-600 font-medium">
                              {material.type}
                            </Text>
                          </View>
                        )}
                        
                        {material.createdAt && (
                          <View className="flex-row items-center">
                            <Clock size={12} color="#6b7280" />
                            <Text className="text-xs text-gray-500 ml-1">
                              {new Date(material.createdAt).toLocaleDateString()}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    
                    {material.url && (
                      <View className="items-center justify-center">
                        <ExternalLink size={20} color="#2563eb" />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="bg-white rounded-2xl p-8 items-center border border-gray-100">
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

        {/* Additional Info Section */}
        {classroomDetails?.description && (
          <View className="mt-6 mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">About This Course</Text>
            <View className="bg-white rounded-2xl p-5 border border-gray-100">
              <Text className="text-gray-600 leading-6">
                {classroomDetails.description}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
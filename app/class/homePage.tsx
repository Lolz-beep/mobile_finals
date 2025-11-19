import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl, Alert, TextInput, Modal, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { User, TrendingUp, CheckCircle, Clock, ChevronRight, BookOpen, Plus, LogOut as LeaveIcon } from 'lucide-react-native';
import { classroomService } from '../../services/classroomService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileAvatar from '@/components/profileAvatar';

const CLASSROOM_KEY = 'SNFMC37EflogtvFyX8wj';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [classroomDetails, setClassroomDetails] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [userName, setUserName] = useState('Student');
  const [currentClassroomId, setCurrentClassroomId] = useState<string | null>(null);
  
  // Join classroom modal
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [joiningClass, setJoiningClass] = useState(false);

  useEffect(() => {
    loadUserName();
    loadCurrentClassroom();
  }, []);

  const loadUserName = async () => {
    const user = await AsyncStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserName(userData.email?.split('@')[0] || 'Student');
    }
  };

  const loadCurrentClassroom = async () => {
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
      const [details, mats, assigns] = await Promise.all([
        classroomService.getClassroomDetails(classroomId),
        classroomService.getClassroomMaterials(classroomId),
        classroomService.getAllAssignments(classroomId).catch(() => []),
      ]);
      
      setClassroomDetails(details);
      setMaterials(mats);
      setAssignments(assigns);
    } catch (error) {
      console.error('Error loading data:', error);
      if (Platform.OS === 'web') {
        alert('Failed to load classroom data');
      } else {
        Alert.alert('Error', 'Failed to load classroom data');
      }
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

  const handleJoinClassroom = async () => {
    if (!classCode.trim()) {
      if (Platform.OS === 'web') {
        alert('Please enter a class code');
      } else {
        Alert.alert('Error', 'Please enter a class code');
      }
      return;
    }

    setJoiningClass(true);
    try {
      const result = await classroomService.joinClassroom(classCode.trim().toUpperCase());
      
      // Save the classroom ID
      const newClassroomId = result.classroomId || result.id || classCode.trim().toUpperCase();
      await AsyncStorage.setItem(CLASSROOM_KEY, newClassroomId);
      setCurrentClassroomId(newClassroomId);
      
      // Close modal and load data
      setShowJoinModal(false);
      setClassCode('');
      await loadData(newClassroomId);
      
      if (Platform.OS === 'web') {
        alert('Successfully joined classroom!');
      } else {
        Alert.alert('Success', 'Successfully joined classroom!');
      }
    } catch (error: any) {
      console.error('Error joining classroom:', error);
      if (Platform.OS === 'web') {
        alert(error.response?.data?.message || 'Failed to join classroom');
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Failed to join classroom.');
      }
    } finally {
      setJoiningClass(false);
    }
  };

  const handleLeaveClassroom = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to leave this classroom?');
      if (confirmed) {
        performLeaveClassroom();
      }
    } else {
      Alert.alert(
        'Leave Classroom',
        'Are you sure you want to leave this classroom?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: performLeaveClassroom
          }
        ]
      );
    }
  };

  const performLeaveClassroom = async () => {
    try {
      await AsyncStorage.removeItem(CLASSROOM_KEY);
      setCurrentClassroomId(null);
      setClassroomDetails(null);
      setMaterials([]);
      setAssignments([]);
      
      if (Platform.OS === 'web') {
        alert('You have left the classroom');
      } else {
        Alert.alert('Success', 'You have left the classroom');
      }
    } catch (error) {
      console.error('Error leaving classroom:', error);
    }
  };

  const completedAssignments = assignments.filter(a => a.status === 'completed').length;
  const pendingAssignments = assignments.filter(a => a.status === 'pending').length;

  // No classroom joined view
  if (!loading && !currentClassroomId) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-8 items-center shadow-lg w-full max-w-md">
            <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4">
              <BookOpen size={40} color="#2563eb" />
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-2">No Classroom</Text>
            <Text className="text-gray-500 text-center mb-6">
              You haven't joined any classroom yet. Enter a class code to get started!
            </Text>
            <TouchableOpacity
              onPress={() => setShowJoinModal(true)}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex-row items-center justify-center gap-2"
            >
              <Plus size={20} color="white" />
              <Text className="text-white font-bold">Join Classroom</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Join Classroom Modal */}
        <JoinClassroomModal
          visible={showJoinModal}
          onClose={() => {
            setShowJoinModal(false);
            setClassCode('');
          }}
          classCode={classCode}
          setClassCode={setClassCode}
          onJoin={handleJoinClassroom}
          loading={joiningClass}
        />
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
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
            <ProfileAvatar size={48} iconSize={24} borderColor="transparent" showBorder={false} />
            <View>
              <Text className="text-sm text-white font-medium">Mobile Dev</Text>
              <Text className="text-xs text-white/80">Welcome Back! {userName}</Text>
            </View>
          </View>
          <TouchableOpacity className="p-2 bg-white/20 rounded-lg">
            <Text className="text-white">⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View className="flex-row gap-3">
          <View className="flex-1 bg-white rounded-xl p-3 items-center">
            <BookOpen size={20} color="#16a34a" />
            <Text className="text-xl font-bold text-gray-800 mt-1">{materials.length}</Text>
            <Text className="text-xs text-gray-600">Classes</Text>
          </View>
          <View className="flex-1 bg-white rounded-xl p-3 items-center">
            <Text className="text-xl">🔔</Text>
            <Text className="text-xl font-bold text-gray-800 mt-1">{pendingAssignments}</Text>
            <Text className="text-xs text-gray-600">Notifications</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* My Class Section */}
        <View className="px-6 py-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-bold text-gray-800">My Class</Text>
            <Text className="text-sm text-gray-600">{materials.length} Class</Text>
          </View>

          {/* Class Card */}
          {classroomDetails ? (
            <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-200 shadow-sm">
              <TouchableOpacity
                onPress={() => router.push('/class/courseDetailPage')}
              >
                <Text className="text-base font-semibold text-gray-800 mb-1">
                  {classroomDetails.name || 'Mobile Development'}
                </Text>
                <Text className="text-xs text-gray-500 mb-2">
                  Class Code: {currentClassroomId || 'MB141'}
                </Text>
                <Text className="text-xs text-gray-600 mb-3">
                  Teacher: {classroomDetails.teacher || classroomDetails.teacherName || 'Mrs. Veneat'}
                </Text>
              </TouchableOpacity>
              
              <View className="flex-row justify-between items-center">
                <View className="flex-row gap-2">
                  <TouchableOpacity 
                    onPress={() => router.push('/class/tasksPage')}
                    className="flex-row items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-lg"
                  >
                    <BookOpen size={14} color="#ea580c" />
                    <Text className="text-xs text-orange-600 font-medium">Assignments</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => router.push('/class/gradesPage')}
                    className="flex-row items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg"
                  >
                    <TrendingUp size={14} color="#dc2626" />
                    <Text className="text-xs text-red-600 font-medium">Grades</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity 
                  onPress={handleLeaveClassroom}
                  className="flex-row items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-lg"
                >
                  <LeaveIcon size={14} color="#6b7280" />
                  <Text className="text-xs text-gray-600 font-medium">Leave</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="bg-white rounded-2xl p-6 items-center border border-gray-200">
              <Text className="text-gray-500">No classroom data available</Text>
            </View>
          )}
        </View>

        {/* Today's Task Banner */}
        {pendingAssignments > 0 && (
          <View className="px-6 mb-4">
            <View className="bg-blue-600 rounded-2xl p-4 flex-row justify-between items-center">
              <View className="flex-row items-center gap-2">
                <Clock size={20} color="white" />
                <View>
                  <Text className="text-white font-semibold">Today's Task</Text>
                  <Text className="text-white/80 text-xs">{pendingAssignments} Assignments Due</Text>
                </View>
              </View>
              <ChevronRight size={20} color="white" />
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View className="px-6 pb-6 flex-row gap-3">
          <TouchableOpacity
            onPress={() => setShowJoinModal(true)}
            className="flex-1 bg-green-600 rounded-2xl py-4 flex-row items-center justify-center gap-2"
          >
            <Plus size={20} color="white" />
            <Text className="text-white font-bold">Join Class</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/class/tasksPage')}
            className="flex-1 bg-blue-600 rounded-2xl py-4 flex-row items-center justify-center gap-2"
          >
            <CheckCircle size={20} color="white" />
            <Text className="text-white font-bold">Assignments</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Join Classroom Modal */}
      <JoinClassroomModal
        visible={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          setClassCode('');
        }}
        classCode={classCode}
        setClassCode={setClassCode}
        onJoin={handleJoinClassroom}
        loading={joiningClass}
      />
    </SafeAreaView>
  );
}

// Join Classroom Modal Component
function JoinClassroomModal({ visible, onClose, classCode, setClassCode, onJoin, loading }: any) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white rounded-3xl p-6 w-full max-w-md">
          <Text className="text-2xl font-bold text-gray-800 mb-2">Join Classroom</Text>
          <Text className="text-gray-500 mb-6">Enter the class code provided by your teacher</Text>
          
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Class Code</Text>
            <TextInput
              value={classCode}
              onChangeText={setClassCode}
              placeholder="3V6P6N"
              autoCapitalize="characters"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-lg font-bold text-center tracking-widest"
              editable={!loading}
            />
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              disabled={loading}
              className="flex-1 py-3 bg-gray-100 rounded-xl"
            >
              <Text className="text-gray-700 font-semibold text-center">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onJoin}
              disabled={loading}
              className={`flex-1 py-3 rounded-xl ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-center">Join</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
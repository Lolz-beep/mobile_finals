import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl, Alert, TextInput, Modal, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { User, TrendingUp, CheckCircle, Clock, ChevronRight, BookOpen, Plus, LogOut as LeaveIcon } from 'lucide-react-native';
import { classroomService } from '../../services/classroomService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLASSROOM_KEY = 'current_classroom_id';

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
        alert(error.response?.data?.message || 'Failed to join classroom. Please check the class code.');
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Failed to join classroom. Please check the class code.');
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
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1 px-6 pt-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Card */}
        <View className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 mb-6 shadow-lg">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
                <User size={24} color="white" />
              </View>
              <View>
                <Text className="text-sm text-white/90">Welcome Back!</Text>
                <Text className="text-xl font-bold text-white capitalize">{userName}</Text>
              </View>
            </View>
            <TouchableOpacity className="p-2 bg-white/20 rounded-xl">
              <Text className="text-white">🔔</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-4 mt-6">
            <View className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-4 items-center">
              <BookOpen size={24} color="white" />
              <Text className="text-2xl font-bold text-white mt-2">
                {materials.length}
              </Text>
              <Text className="text-xs text-white/90">Materials</Text>
            </View>
            <View className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-4 items-center">
              <CheckCircle size={24} color="white" />
              <Text className="text-2xl font-bold text-white mt-2">
                {completedAssignments}
              </Text>
              <Text className="text-xs text-white/90">Completed</Text>
            </View>
            <View className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-4 items-center">
              <Clock size={24} color="white" />
              <Text className="text-2xl font-bold text-white mt-2">
                {pendingAssignments}
              </Text>
              <Text className="text-xs text-white/90">Pending</Text>
            </View>
          </View>
        </View>

        {/* My Classroom */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800">My Classroom</Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setShowJoinModal(true)}
                className="px-3 py-2 bg-blue-100 rounded-lg flex-row items-center gap-1"
              >
                <Plus size={16} color="#2563eb" />
                <Text className="text-blue-600 font-semibold text-xs">Join New</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLeaveClassroom}
                className="px-3 py-2 bg-red-100 rounded-lg flex-row items-center gap-1"
              >
                <LeaveIcon size={16} color="#dc2626" />
                <Text className="text-red-600 font-semibold text-xs">Leave</Text>
              </TouchableOpacity>
            </View>
          </View>

          {classroomDetails ? (
            <TouchableOpacity
              onPress={() => router.push('/class/courseDetailPage')}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            >
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-800 mb-2">
                    {classroomDetails.name || 'Mobile Development'}
                  </Text>
                  <View className="flex-row items-center mb-3">
                    <User size={16} color="#6b7280" />
                    <Text className="text-sm text-gray-500 ml-1">
                      {classroomDetails.teacher || classroomDetails.teacherName || 'Instructor'}
                    </Text>
                  </View>
                  
                  {classroomDetails.description && (
                    <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
                      {classroomDetails.description}
                    </Text>
                  )}

                  <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center">
                      <BookOpen size={16} color="#2563eb" />
                      <Text className="text-sm text-blue-600 font-medium ml-1">
                        {materials.length} Materials
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <CheckCircle size={16} color="#10b981" />
                      <Text className="text-sm text-green-600 font-medium ml-1">
                        {assignments.length} Tasks
                      </Text>
                    </View>
                  </View>
                </View>
                <ChevronRight size={24} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          ) : (
            <View className="bg-white rounded-2xl p-6 items-center border border-gray-100">
              <Text className="text-gray-500">No classroom data available</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">Quick Actions</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push('/class/courseDetailPage')}
              className="flex-1 bg-blue-50 rounded-2xl p-4 items-center border border-blue-100"
            >
              <BookOpen size={32} color="#2563eb" />
              <Text className="text-sm font-semibold text-blue-600 mt-2">
                View Materials
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/class/tasksPage')}
              className="flex-1 bg-orange-50 rounded-2xl p-4 items-center border border-orange-100"
            >
              <CheckCircle size={32} color="#ea580c" />
              <Text className="text-sm font-semibold text-orange-600 mt-2">
                My Tasks
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        {assignments.length > 0 && (
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">Recent Tasks</Text>
              <TouchableOpacity onPress={() => router.push('/class/tasksPage')}>
                <Text className="text-blue-600 font-medium text-sm">View All</Text>
              </TouchableOpacity>
            </View>

            {assignments.slice(0, 3).map((assignment, index) => (
              <View
                key={assignment.id || index}
                className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
              >
                <Text className="font-semibold text-gray-800 mb-1">
                  {assignment.title}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-500">
                    {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}
                  </Text>
                  <View
                    className={`px-3 py-1 rounded-full ${
                      assignment.status === 'completed'
                        ? 'bg-green-100'
                        : assignment.status === 'overdue'
                        ? 'bg-red-100'
                        : 'bg-blue-100'
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        assignment.status === 'completed'
                          ? 'text-green-600'
                          : assignment.status === 'overdue'
                          ? 'text-red-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {assignment.status === 'completed'
                        ? 'Completed'
                        : assignment.status === 'overdue'
                        ? 'Overdue'
                        : 'Pending'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
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
              placeholder="e.g., 3V6P6N"
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
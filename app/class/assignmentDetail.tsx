import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, FileText, Clock, Upload, X, FileIcon } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { classroomService, Assignment } from '../../services/classroomService';
import TasksPage from './tasksPage';

export default function AssignmentDetailPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittedFiles, setSubmittedFiles] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    loadAssignment();
  }, []);

  const loadAssignment = async () => {
    try {
      setLoading(true);
      const mockAssignment: Assignment = {
        id: assignmentId,
        title: 'Practice assignment for API testing',
        description: 'Complete the React Native API integration exercises. Create a mobile app that fetches data from a REST API and displays it in a list format. Include error handling and loading states.',
        dueDate: new Date('2025-12-31'),
        status: 'pending',
        classId: 'SNFMC37EflogtvFyX8wj'
      };
      setAssignment(mockAssignment);
    } catch (error) {
      console.error('Error loading assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSubmittedFiles([...submittedFiles, result.assets[0]]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      if (Platform.OS === 'web') {
        alert('Failed to pick document. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to pick document. Please try again.');
      }
    }
  };

  const removeFile = (index: number) => {
    setSubmittedFiles(submittedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (submittedFiles.length === 0) {
      if (Platform.OS === 'web') {
        alert('Please add at least one file before submitting.');
      } else {
        Alert.alert('No Files', 'Please add at least one file before submitting.');
      }
      return;
    }

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to submit this assignment?');
      if (confirmed) {
        performSubmit();
      }
    } else {
      Alert.alert(
        'Submit Assignment',
        'Are you sure you want to submit this assignment?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit', onPress: performSubmit }
        ]
      );
    }
  };

  const performSubmit = () => {
    setIsSubmitted(true);
    if (Platform.OS === 'web') {
      alert('Assignment submitted successfully!');
    } else {
      Alert.alert('Success', 'Assignment submitted successfully!');
    }
  };

  const handleUnsubmit = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to unsubmit this assignment?');
      if (confirmed) {
        setIsSubmitted(false);
        setSubmittedFiles([]);
      }
    } else {
      Alert.alert(
        'Unsubmit Assignment',
        'Are you sure you want to unsubmit this assignment?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Unsubmit', onPress: () => {
            setIsSubmitted(false);
            setSubmittedFiles([]);
          }}
        ]
      );
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return <FileIcon size={20} color="#3b82f6" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-600">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!assignment) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-600">Assignment not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-blue-600 px-4 py-4">
          <TouchableOpacity 
            onPress={() => router.push('/class/tasksPage')}
            className="flex-row items-center mb-4"
          >
            <ArrowLeft size={24} color="white" />
            <Text className="text-white text-lg font-semibold ml-2">Back</Text>
          </TouchableOpacity>
          
          <View className="flex-row items-start gap-3">
            <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
              <FileText size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-xl font-bold mb-2">
                {assignment.title}
              </Text>
              {assignment.dueDate && (
                <View className="flex-row items-center">
                  <Clock size={16} color="white" />
                  <Text className="text-white/90 ml-2">
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Assignment Description */}
        <View className="bg-white rounded-2xl p-5 mx-4 mt-4 mb-4 border border-gray-100">
          <Text className="text-lg font-bold text-gray-800 mb-3">Description</Text>
          <Text className="text-gray-600 leading-6">
            {assignment.description || 'No description provided.'}
          </Text>
        </View>

        {/* Submission Section */}
        <View className="bg-white rounded-2xl p-5 mx-4 mb-4 border border-gray-100">
          <Text className="text-lg font-bold text-gray-800 mb-4">Your Submission</Text>
          
          {/* File List */}
          {submittedFiles.length > 0 && (
            <View className="mb-4">
              {submittedFiles.map((file, index) => (
                <View 
                  key={index} 
                  className="flex-row items-center justify-between bg-blue-50 rounded-xl p-3 mb-2 border border-blue-200"
                >
                  <View className="flex-row items-center flex-1">
                    {getFileIcon(file.name)}
                    <View className="ml-3 flex-1">
                      <Text className="text-gray-800 font-medium" numberOfLines={1}>
                        {file.name}
                      </Text>
                      <Text className="text-gray-500 text-xs">
                        {formatFileSize(file.size)}
                      </Text>
                    </View>
                  </View>
                  {!isSubmitted && (
                    <TouchableOpacity 
                      onPress={() => removeFile(index)}
                      className="w-8 h-8 bg-red-100 rounded-full items-center justify-center ml-2"
                    >
                      <X size={16} color="#dc2626" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Add File Button */}
          {!isSubmitted && (
            <TouchableOpacity
              onPress={pickDocument}
              className="flex-row items-center justify-center bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl py-4 mb-4"
            >
              <Upload size={20} color="#2563eb" />
              <Text className="text-blue-600 font-semibold ml-2">Add File</Text>
            </TouchableOpacity>
          )}

          {/* Submit/Unsubmit Button */}
          <TouchableOpacity
            onPress={isSubmitted ? handleUnsubmit : handleSubmit}
            disabled={!isSubmitted && submittedFiles.length === 0}
            className={`w-full py-4 rounded-xl ${
              isSubmitted 
                ? 'bg-gray-400' 
                : submittedFiles.length === 0
                ? 'bg-gray-300'
                : 'bg-green-600'
            }`}
          >
            <Text className="text-white font-bold text-center text-base">
              {isSubmitted ? 'Unsubmit' : 'Submit Assignment'}
            </Text>
          </TouchableOpacity>

          {isSubmitted && (
            <View className="mt-3 bg-green-50 rounded-xl p-3 border border-green-200">
              <Text className="text-green-700 text-center font-medium">
                ✓ Assignment submitted successfully
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
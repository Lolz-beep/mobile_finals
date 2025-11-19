import api from './api';

export interface Classroom {
  id: string;
  name: string;
  teacher: string;
  progress: number;
  description?: string;
  materials?: any[];
}

export interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'overdue' | 'completed';
  type: 'practice' | 'submission';
  description?: string;
}

export interface Material {
  id: string;
  title: string;
  type: string;
  url?: string;
  description?: string;
}

export const classroomService = {
  joinClassroom: async (classCode: string) => {
    const response = await api.post('/classrooms/join', { classCode });
    return response.data;
  },

  getClassroomDetails: async (classroomId: string) => {
    const response = await api.get(`/classrooms/${classroomId}/details`);
    return response.data;
  },

  getClassroomMaterials: async (classroomId: string): Promise<Material[]> => {
    const response = await api.get(`/classrooms/${classroomId}/materials`);
    return response.data;
  },

  getPracticeAssignments: async (classroomId: string): Promise<Assignment[]> => {
    const response = await api.get(`/classrooms/${classroomId}/assignments`);
    return response.data;
  },

  getSubmissionAssignments: async (classroomId: string): Promise<Assignment[]> => {
    const response = await api.get(`/classrooms/${classroomId}/assignments?type=submission`);
    return response.data;
  },

  getAllAssignments: async (classroomId: string): Promise<Assignment[]> => {
    const [practice, submission] = await Promise.all([
      classroomService.getPracticeAssignments(classroomId),
      classroomService.getSubmissionAssignments(classroomId),
    ]);
    return [...practice, ...submission];
  },
};
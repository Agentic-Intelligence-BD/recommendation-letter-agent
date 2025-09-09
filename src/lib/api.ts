import axios from 'axios'
import { Student, RecommendationRequest, Answer, GeneratedLetter } from '@/types'

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: async (data: {
    name: string
    email: string
    password: string
    institution: string
    subject?: string
    experience?: number
  }) => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data)
    return response.data
  },
}

// Students API
export const studentsAPI = {
  getAll: async () => {
    const response = await api.get('/students')
    return response.data.students
  },

  getById: async (studentId: string) => {
    const response = await api.get(`/students/${studentId}`)
    return response.data.student
  },

  create: async (studentData: {
    name: string
    email: string
    grade: string
    gpa?: number
    subjects: string[]
    extracurriculars: string[]
    targetColleges: Array<{
      name: string
      type: string
      values: string[]
      characteristics: string[]
    }>
  }) => {
    const response = await api.post('/students', studentData)
    return response.data.student
  },

  update: async (studentId: string, studentData: {
    name?: string
    email?: string
    grade?: string
    gpa?: number | null
    subjects?: string[]
    extracurriculars?: string[]
    targetColleges?: Array<{
      id?: string
      name: string
      type: string
      values: string[]
      characteristics: string[]
    }>
  }) => {
    const response = await api.put(`/students/${studentId}`, studentData)
    return response.data.student
  },

  delete: async (studentId: string) => {
    const response = await api.delete(`/students/${studentId}`)
    return response.data
  },
}

// Recommendations API
export const recommendationsAPI = {
  getAll: async () => {
    const response = await api.get('/recommendations')
    return response.data.recommendations
  },

  // Start a new recommendation request
  start: async (studentId: string, collegeId: string) => {
    const response = await api.post('/recommendations/start', {
      studentId,
      collegeId,
    });
    return response.data;
  },

  // Get recommendation progress
  getProgress: async (recommendationId: string) => {
    const response = await api.get(`/recommendations/${recommendationId}/progress`);
    return response.data;
  },

  // Update recommendation progress
  updateProgress: async (recommendationId: string, phase: string, status?: string) => {
    const response = await api.put(`/recommendations/${recommendationId}/progress`, {
      phase,
      status,
    });
    return response.data;
  },

  // Save current progress (answers + question position)
  saveProgress: async (recommendationId: string, data: {
    currentQuestionIndex: number;
    answers: any[];
    phase?: string;
  }) => {
    const response = await api.post(`/recommendations/${recommendationId}/save-progress`, data);
    return response.data;
  },

  // Get detailed progress
  getDetailedProgress: async (recommendationId: string) => {
    const response = await api.get(`/recommendations/${recommendationId}/save-progress`);
    return response.data;
  },

  create: async (data: { studentId: string; collegeId: string }) => {
    const response = await api.post('/recommendations', data)
    return response.data.recommendation
  },

  saveAnswers: async (recommendationId: string, answers: Answer[]) => {
    const response = await api.post(`/recommendations/${recommendationId}/answers`, {
      answers
    })
    return response.data
  },

  generateLetters: async (recommendationId: string) => {
    const response = await api.post(`/recommendations/${recommendationId}/generate`)
    return response.data.letters
  },

  saveFinalDraft: async (recommendationId: string, finalDraft: string) => {
    const response = await api.patch(`/recommendations/${recommendationId}`, {
      finalDraft,
      status: 'reviewed'
    })
    return response.data
  },
}

// Auth helpers
export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token)
}

export const removeAuthToken = () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user_data')
}

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token')
  }
  return null
}

export const setUserData = (userData: any) => {
  localStorage.setItem('user_data', JSON.stringify(userData))
}

export const getUserData = () => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('user_data')
    return userData ? JSON.parse(userData) : null
  }
  return null
}

export default api
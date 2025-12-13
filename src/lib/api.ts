import axios from 'axios';
import Cookies from 'js-cookie';
import { LoginRequest, LoginResponse, User } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  // Email/Password login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  // Google login
  googleLogin: async (credential: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/google', {
      credential,
    });
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  // Get current user info
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  // Create user with email/password
  createUserWithEmail: async (userData: {
    email: string;
    password: string;
    name: string;
    role: number;
    class_name?: string;
  }): Promise<User> => {
    const response = await api.post<User>('/admin/users/email', userData);
    return response.data;
  },

  // Create user for Google OAuth
  createUserWithGoogle: async (userData: {
    email: string;
    name: string;
    role: number;
    class_name?: string;
  }): Promise<User> => {
    const response = await api.post<User>('/admin/users/google', userData);
    return response.data;
  },

  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/admin/users');
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<User> => {
    const response = await api.get<User>(`/admin/users/${userId}`);
    return response.data;
  },

  // Update user
  updateUser: async (userId: string, userData: {
    name?: string;
    role?: number;
    class_name?: string;
    is_active?: boolean;
  }): Promise<User> => {
    const response = await api.put<User>(`/admin/users/${userId}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/admin/users/${userId}`);
    return response.data;
  },
};

// Questionnaire API
export interface QuestionnaireAnswer {
  q1: number;
  q2: string;
  q3: 'あった' | 'なかった';
  q3_detail: string;
  q4: 'あった' | 'なかった';
  q4_detail: string;
  q5: string;
}

export interface Questionnaire {
  id: string;
  user_id: string;
  week: number;
  title: string;
  deadline: string;
  status: 'pending' | 'completed';
  answers?: QuestionnaireAnswer;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

export const questionnaireAPI = {
  // Get all questionnaires for current user
  getQuestionnaires: async (): Promise<Questionnaire[]> => {
    const response = await api.get<Questionnaire[]>('/questionnaires');
    return response.data;
  },

  // Get questionnaire by ID
  getQuestionnaire: async (id: string): Promise<Questionnaire> => {
    const response = await api.get<Questionnaire>(`/questionnaires/${id}`);
    return response.data;
  },

  // Submit questionnaire answers
  submitQuestionnaire: async (id: string, answers: QuestionnaireAnswer): Promise<Questionnaire> => {
    const response = await api.post<Questionnaire>(`/questionnaires/${id}/submit`, { answers });
    return response.data;
  },

  // Update questionnaire answers (before deadline)
  updateQuestionnaire: async (id: string, answers: QuestionnaireAnswer): Promise<Questionnaire> => {
    const response = await api.put<Questionnaire>(`/questionnaires/${id}`, { answers });
    return response.data;
  },
};

// Monthly Result API
export interface MonthlyResultSkills {
  '戦略的計画力': number;
  '課題設定・構想力': number;
  '巻き込む力': number;
  '対話する力': number;
  '実行する力': number;
  '完遂する力': number;
  '謙虚である力': number;
}

export interface MonthlyResult {
  id: string;
  user_id: string;
  year: number;
  month: number;
  level: number;
  skills: MonthlyResultSkills;
  ai_comment?: string;
  created_at: string;
  updated_at: string;
}

export const monthlyResultAPI = {
  // Get all monthly results for current user
  getMonthlyResults: async (): Promise<MonthlyResult[]> => {
    const response = await api.get<MonthlyResult[]>('/monthly-results');
    return response.data;
  },

  // Get monthly result by ID
  getMonthlyResult: async (id: string): Promise<MonthlyResult> => {
    const response = await api.get<MonthlyResult>(`/monthly-results/${id}`);
    return response.data;
  },
};

// Talent Result API
export interface TalentResult {
  id: string;
  user_id: string;
  talent_type: string;
  talent_name: string;
  description: string;
  keywords: string[];
  strengths: string[];
  next_steps: string[];
  created_at: string;
  updated_at: string;
}

export interface TalentResultCreate {
  talent_type: string;
  talent_name: string;
  description: string;
  keywords: string[];
  strengths: string[];
  next_steps: string[];
}

export const talentResultAPI = {
  // Get talent result for current user
  getTalentResult: async (): Promise<TalentResult | null> => {
    const response = await api.get<TalentResult | null>('/talent-result');
    return response.data;
  },

  // Create or update talent result
  saveTalentResult: async (data: TalentResultCreate): Promise<TalentResult> => {
    const response = await api.post<TalentResult>('/talent-result', data);
    return response.data;
  },
};

export default api;

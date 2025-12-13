export interface User {
  id: string;
  email: string;
  name?: string;
  class_name?: string;
  role: number; // 0: Student, 1: Teacher, 2: Admin
  is_active: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export enum UserRole {
  Student = 0,
  Teacher = 1,
  Admin = 2,
}

export const getRoleName = (role: number): string => {
  switch (role) {
    case UserRole.Student:
      return '生徒';
    case UserRole.Teacher:
      return '先生';
    case UserRole.Admin:
      return '管理者';
    default:
      return '不明';
  }
};

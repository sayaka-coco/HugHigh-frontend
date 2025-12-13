'use client';

import { useState } from 'react';
import { adminAPI } from '@/lib/api';
import { UserRole } from '@/types';

interface UserFormProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const CLASS_OPTIONS = [
  '1-A', '1-B', '1-C', '1-D',
  '2-A', '2-B', '2-C', '2-D',
  '3-A', '3-B', '3-C', '3-D',
];

export default function UserForm({ onSuccess, onError }: UserFormProps) {
  const [authType, setAuthType] = useState<'email' | 'google'>('email');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: UserRole.Student,
    class_name: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'role' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.email || !formData.name) {
        onError('メールアドレスと氏名は必須です');
        setLoading(false);
        return;
      }

      if (authType === 'email' && !formData.password) {
        onError('パスワードは必須です');
        setLoading(false);
        return;
      }

      if (formData.role === UserRole.Student && !formData.class_name) {
        onError('生徒の場合、クラスを選択してください');
        setLoading(false);
        return;
      }

      const userData = {
        email: formData.email,
        name: formData.name,
        role: formData.role,
        class_name: formData.role === UserRole.Student ? formData.class_name : undefined,
      };

      if (authType === 'email') {
        await adminAPI.createUserWithEmail({
          ...userData,
          password: formData.password,
        });
      } else {
        await adminAPI.createUserWithGoogle(userData);
      }

      onSuccess(
        `ユーザー "${formData.email}" を作成しました`
      );

      // Reset form
      setFormData({
        email: '',
        password: '',
        name: '',
        role: UserRole.Student,
        class_name: '',
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'ユーザー作成に失敗しました';
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">新しいユーザーを追加</h2>

      {/* Auth Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          認証方式
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="email"
              checked={authType === 'email'}
              onChange={(e) => setAuthType(e.target.value as 'email' | 'google')}
              className="w-4 h-4 text-indigo-600"
            />
            <span className="ml-2 text-sm text-gray-700">メール/パスワード</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="google"
              checked={authType === 'google'}
              onChange={(e) => setAuthType(e.target.value as 'email' | 'google')}
              className="w-4 h-4 text-indigo-600"
            />
            <span className="ml-2 text-sm text-gray-700">Google認証</span>
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            メールアドレス *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="user@example.com"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        {/* Password (only for email auth) */}
        {authType === 'email' && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              パスワード *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required={authType === 'email'}
            />
          </div>
        )}

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            氏名 *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="山田太郎"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            ロール *
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value={UserRole.Student}>生徒</option>
            <option value={UserRole.Teacher}>教員</option>
            <option value={UserRole.Admin}>管理者</option>
          </select>
        </div>

        {/* Class (only for students) */}
        {formData.role === UserRole.Student && (
          <div>
            <label htmlFor="class_name" className="block text-sm font-medium text-gray-700">
              クラス *
            </label>
            <select
              id="class_name"
              name="class_name"
              value={formData.class_name}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required={formData.role === UserRole.Student}
            >
              <option value="">クラスを選択してください</option>
              {CLASS_OPTIONS.map(classOption => (
                <option key={classOption} value={classOption}>
                  {classOption}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'ユーザーを作成中...' : 'ユーザーを追加'}
          </button>
        </div>
      </form>

      {/* Info Message */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700">
          {authType === 'email'
            ? 'メール/パスワード認証で新しいユーザーを作成します。'
            : 'Google認証用のユーザーを作成します。ユーザーは初回ログイン時にGoogleアカウントをリンクさせます。'}
        </p>
      </div>
    </div>
  );
}

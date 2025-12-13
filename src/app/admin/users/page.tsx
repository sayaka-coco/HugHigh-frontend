'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { authAPI } from '@/lib/api';
import { User, getRoleName, UserRole } from '@/types';
import UserForm from '@/components/admin/UserForm';

export default function AdminUsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const token = Cookies.get('access_token');

      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const userData = await authAPI.getCurrentUser();

        // Check if user is admin
        if (userData.role !== UserRole.Admin) {
          // Redirect to appropriate page
          if (userData.role === UserRole.Student) {
            router.push('/student/home');
          } else if (userData.role === UserRole.Teacher) {
            router.push('/teacher/home');
          } else {
            setError('アクセス権限がありません');
          }
          return;
        }

        setUser(userData);
      } catch (err: any) {
        console.error('Failed to fetch user:', err);
        Cookies.remove('access_token');
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      Cookies.remove('access_token');
      router.push('/auth/login');
    }
  };

  const handleFormSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleFormError = (message: string) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            ログイン画面へ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">ユーザー管理</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/home"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                ダッシュボード
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-700 text-sm">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* User Info Card */}
          {user && (
            <div className="mb-6 bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">管理者情報</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">メールアドレス</p>
                  <p className="text-base font-medium text-gray-900">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ロール</p>
                  <p className="text-base font-medium text-gray-900">{getRoleName(user.role)}</p>
                </div>
              </div>
            </div>
          )}

          {/* User Form */}
          <UserForm
            onSuccess={handleFormSuccess}
            onError={handleFormError}
          />

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 ヒント</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• メール/パスワード認証：管理者が設定したパスワードでログインします</li>
              <li>• Google認証：ユーザーは初回ログイン時にGoogleアカウントでログインしてリンクさせます</li>
              <li>• 生徒のクラス：ドロップダウンメニューから選択してください</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

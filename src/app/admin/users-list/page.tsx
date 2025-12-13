'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { authAPI, adminAPI } from '@/lib/api';
import { User, getRoleName, UserRole } from '@/types';

export default function AdminUsersListPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{
    name?: string;
    role?: number;
    is_active?: boolean;
  }>({});

  useEffect(() => {
    const fetchData = async () => {
      const token = Cookies.get('access_token');

      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const userData = await authAPI.getCurrentUser();

        // Check if user is admin
        if (userData.role !== UserRole.Admin) {
          router.push('/student/home');
          return;
        }

        setCurrentUser(userData);

        // Fetch all users
        const allUsers = await adminAPI.getAllUsers();
        setUsers(allUsers);
      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        Cookies.remove('access_token');
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`本当に${userName}を削除しますか？この操作は取り消せません。`)) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      setSuccessMessage(`${userName}を削除しました`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'ユーザー削除に失敗しました';
      setError(errorMsg);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUserId(user.id);
    setEditFormData({
      name: user.name,
      role: user.role,
      is_active: user.is_active,
    });
  };

  const handleEditCancel = () => {
    setEditingUserId(null);
    setEditFormData({});
  };

  const handleEditSave = async (userId: string) => {
    try {
      const updatedUser = await adminAPI.updateUser(userId, editFormData);
      setUsers(users.map(u => (u.id === userId ? updatedUser : u)));
      setEditingUserId(null);
      setEditFormData({});
      setSuccessMessage('ユーザーを更新しました');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'ユーザー更新に失敗しました';
      setError(errorMsg);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : (name === 'role' ? parseInt(value) : value),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">ユーザー一覧</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/home"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                ダッシュボード
              </Link>
              <Link
                href="/admin/users"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                ユーザー追加
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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

          {/* Users Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                登録済みユーザー ({users.length}人)
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      メール
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      氏名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      ロール
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      クラス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      {editingUserId === user.id ? (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <input
                              type="text"
                              name="name"
                              value={editFormData.name || ''}
                              onChange={handleInputChange}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <select
                              name="role"
                              value={editFormData.role || user.role}
                              onChange={handleInputChange}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                            >
                              <option value={0}>生徒</option>
                              <option value={1}>教員</option>
                              <option value={2}>管理者</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.class_name || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                name="is_active"
                                checked={editFormData.is_active !== false}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-indigo-600"
                              />
                              <span className="ml-2">
                                {editFormData.is_active !== false ? '有効' : '無効'}
                              </span>
                            </label>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            <button
                              onClick={() => handleEditSave(user.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs font-medium"
                            >
                              保存
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-xs font-medium"
                            >
                              キャンセル
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {user.name || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              user.role === 0 ? 'bg-blue-100 text-blue-800' :
                              user.role === 1 ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {getRoleName(user.role)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {user.class_name || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.is_active ? '有効' : '無効'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            <button
                              onClick={() => handleEditClick(user)}
                              disabled={user.id === currentUser.id}
                              className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-xs font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              disabled={user.id === currentUser.id}
                              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              削除
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 ヒント</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 編集ボタンをクリックしてユーザー情報を変更できます</li>
              <li>• 削除ボタンでユーザーを削除できます（自分自身は削除不可）</li>
              <li>• 削除されたユーザーのデータは復元できません</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

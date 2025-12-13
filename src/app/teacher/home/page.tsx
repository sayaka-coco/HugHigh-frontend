'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authAPI } from '@/lib/api';
import { User, UserRole } from '@/types';
import Navigation from '@/components/shared/Navigation';

export default function TeacherHomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('classes');

  const tabs = [
    { id: 'classes', label: 'クラス一覧' },
    { id: 'students', label: '生徒一覧' },
    { id: 'dashboard', label: 'クラスダッシュボード' },
  ];

  // Sample data
  const classes = [
    { name: '1年A組', info: '2024年度 普通科', students: 35, avgLevel: 4, responseRate: 89 },
    { name: '2年B組', info: '2024年度 普通科', students: 32, avgLevel: 4, responseRate: 94 },
    { name: '3年A組', info: '2024年度 普通科', students: 30, avgLevel: 5, responseRate: 97 },
  ];

  const students = [
    { id: 1, name: '山田 太郎', class: '1年A組', level: 4, lastResponse: '2024/12/06', status: '回答済み' },
    { id: 2, name: '佐藤 花子', class: '1年A組', level: 5, lastResponse: '2024/12/06', status: '回答済み' },
    { id: 3, name: '鈴木 一郎', class: '1年A組', level: 3, lastResponse: '2024/11/29', status: '未回答' },
    { id: 4, name: '田中 美咲', class: '1年A組', level: 4, lastResponse: '2024/12/06', status: '回答済み' },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const token = Cookies.get('access_token');

      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const userData = await authAPI.getCurrentUser();

        if (userData.role !== UserRole.Teacher && userData.role !== UserRole.Admin) {
          if (userData.role === UserRole.Student) {
            router.push('/student/home');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'ユーザー情報の取得に失敗しました'}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="btn btn-primary"
          >
            ログイン画面へ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation user={user} activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />

      <main className="pt-20 px-6 max-w-7xl mx-auto pb-10">
        {activeTab === 'classes' && (
          <div className="animate-in">
            <h2 className="text-2xl font-bold mb-6">担当クラス一覧</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {classes.map((classItem, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-sm cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all"
                  onClick={() => setActiveTab('students')}
                >
                  <h3 className="text-xl font-bold mb-2">{classItem.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{classItem.info}</p>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">{classItem.students}</div>
                      <div className="text-xs text-gray-500">生徒数</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">Lv.{classItem.avgLevel}</div>
                      <div className="text-xs text-gray-500">平均レベル</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">{classItem.responseRate}%</div>
                      <div className="text-xs text-gray-500">回答率</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="animate-in">
            <h2 className="text-2xl font-bold mb-6">生徒一覧 - 1年A組</h2>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        生徒名
                      </th>
                      <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        クラス
                      </th>
                      <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        レベル
                      </th>
                      <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        最終回答日
                      </th>
                      <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        状態
                      </th>
                      <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-semibold">
                              {student.name.charAt(0)}
                            </div>
                            <span className="font-medium">{student.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600">{student.class}</td>
                        <td className="py-4 px-4">
                          <span className={`level-badge level-${student.level}`}>
                            Lv.{student.level}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-600 text-sm">{student.lastResponse}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              student.status === '回答済み'
                                ? 'bg-green-100 text-green-900'
                                : 'bg-yellow-100 text-yellow-900'
                            }`}
                          >
                            {student.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                            詳細を見る
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="animate-in">
            <h2 className="text-2xl font-bold mb-6">クラスダッシュボード</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="stat-card">
                <div className="stat-label">総生徒数</div>
                <div className="stat-value">35</div>
                <div className="text-sm mt-1 text-gray-600">1年A組</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">平均レベル</div>
                <div className="stat-value">Lv.4</div>
                <div className="text-sm mt-1 text-green-600">↑ 前月比 +0.3</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">回答率</div>
                <div className="stat-value">89%</div>
                <div className="text-sm mt-1 text-green-600">↑ 先週比 +5%</div>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">クラス全体の能力分布</h3>
              <div className="space-y-4">
                {[
                  { name: '戦略的計画力', avg: 62 },
                  { name: '課題設定・構想力', avg: 68 },
                  { name: '巻き込む力', avg: 55 },
                  { name: '対話する力', avg: 58 },
                  { name: '実行する力', avg: 70 },
                  { name: '完遂する力', avg: 65 },
                  { name: '謙虚である力', avg: 60 },
                ].map((skill) => (
                  <div key={skill.name} className="skill-item">
                    <span className="skill-name w-40 flex-shrink-0">{skill.name}</span>
                    <div className="skill-bar-container">
                      <div className="skill-bar" style={{ width: `${skill.avg}%` }} />
                    </div>
                    <span className="skill-score">{skill.avg}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card mt-5">
              <h3 className="card-title">最近の動向</h3>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-5 rounded-r-xl">
                <div className="font-semibold mb-2 text-blue-900">クラス全体の傾向</div>
                <p className="text-gray-700">
                  1年A組は「実行する力」が全体的に高く、目標に向かって行動する力が育っています。
                  一方で「巻き込む力」が比較的低い傾向にあるため、グループワークなどの協働活動を増やすことで
                  改善が期待できます。
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authAPI, talentResultAPI, TalentResult } from '@/lib/api';
import { User, UserRole } from '@/types';
import Navigation from '@/components/shared/Navigation';
import { Sparkles, Lightbulb, ArrowRight } from 'lucide-react';

export default function TalentPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [talentResult, setTalentResult] = useState<TalentResult | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = Cookies.get('access_token');

      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const userData = await authAPI.getCurrentUser();

        if (userData.role !== UserRole.Student) {
          if (userData.role === UserRole.Teacher) {
            router.push('/teacher/home');
          } else {
            setError('アクセス権限がありません');
          }
          return;
        }

        setUser(userData);

        // Fetch talent result
        const result = await talentResultAPI.getTalentResult();
        setTalentResult(result);
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

  const handleReassess = () => {
    router.push('/student/talent/questionnaire');
  };

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
      <Navigation user={user} activeTab="" onTabChange={() => {}} tabs={[]} />

      <main className="pt-20 px-6 max-w-5xl mx-auto pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">才能特定</h1>
          <p className="text-gray-600">あなたの才能を発見し、それを活かすためのガイドです。</p>
        </div>

        {talentResult ? (
          <div className="animate-in">
            {/* Talent Result Display */}
            <div className="card mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
              <div className="flex items-start gap-6">
                <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-2xl flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-indigo-600 mb-2">{talentResult.talent_type}</div>
                  <h2 className="text-3xl font-bold mb-3">{talentResult.talent_name}</h2>
                  <p className="text-gray-700 leading-relaxed">{talentResult.description}</p>
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              {/* Keywords */}
              <div className="card">
                <h3 className="card-title flex items-center gap-2">
                  <Sparkles className="text-indigo-600" size={20} />
                  関連キーワード
                </h3>
                <div className="flex flex-wrap gap-2">
                  {talentResult.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-indigo-100 text-indigo-900 rounded-full text-sm font-medium"
                    >
                      #{keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Strengths */}
              <div className="card">
                <h3 className="card-title flex items-center gap-2">
                  <Lightbulb className="text-yellow-600" size={20} />
                  あなたの強み
                </h3>
                <ul className="space-y-2">
                  {talentResult.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Next Steps */}
            <div className="card mb-6">
              <h3 className="card-title flex items-center gap-2">
                <ArrowRight className="text-blue-600" size={20} />
                この才能を活かすための次のステップ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {talentResult.next_steps.map((step, index) => (
                  <div
                    key={index}
                    className="p-5 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <h4 className="font-semibold text-gray-900">ステップ {index + 1}</h4>
                    </div>
                    <p className="text-gray-700 text-sm">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Re-assess Button */}
            <div className="flex justify-center">
              <button
                onClick={handleReassess}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Sparkles size={20} />
                再度特定する
              </button>
            </div>
          </div>
        ) : (
          <div className="card text-center py-12">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="text-indigo-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-3">才能診断を始めましょう</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              あなたの「得意とワクワク」と「無意識のパワー」を見つけつけましょう。
            </p>
            <button
              onClick={handleReassess}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
            >
              <Sparkles size={20} />
              才能特定を開始する
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authAPI, questionnaireAPI, monthlyResultAPI, Questionnaire, QuestionnaireAnswer, MonthlyResult } from '@/lib/api';
import { User, UserRole } from '@/types';
import Navigation from '@/components/shared/Navigation';
import StatCard from '@/components/shared/StatCard';
import RadarChart from '@/components/shared/RadarChart';
import QuestionnaireForm from '@/components/shared/QuestionnaireForm';
import QuestionnaireDetail from '@/components/shared/QuestionnaireDetail';
import MonthlyDashboard from '@/components/shared/MonthlyDashboard';

export default function StudentHomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showQuestionnaireForm, setShowQuestionnaireForm] = useState(false);
  const [showQuestionnaireDetail, setShowQuestionnaireDetail] = useState(false);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [monthlyResults, setMonthlyResults] = useState<MonthlyResult[]>([]);
  const [selectedMonthlyResult, setSelectedMonthlyResult] = useState<MonthlyResult | null>(null);
  const [showMonthlyDashboard, setShowMonthlyDashboard] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'ダッシュボード' },
    { id: 'questionnaire', label: 'アンケート' },
    { id: 'history', label: '履歴' },
    { id: 'weekly', label: '週次入力' },
  ];

  // Sample data for demo
  const radarData = {
    labels: [
      '戦略的計画力',
      '課題設定・構想力',
      '巻き込む力',
      '対話する力',
      '実行する力',
      '完遂する力',
      '謙虚である力',
    ],
    values: [58, 65, 45, 52, 72, 68, 55],
  };

  const skills = [
    { name: '戦略的計画力', score: 58 },
    { name: '課題設定・構想力', score: 65 },
    { name: '巻き込む力', score: 45 },
    { name: '対話する力', score: 52 },
    { name: '実行する力', score: 72 },
    { name: '完遂する力', score: 68 },
    { name: '謙虚である力', score: 55 },
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

        if (userData.role !== UserRole.Student) {
          if (userData.role === UserRole.Teacher) {
            router.push('/teacher/home');
          } else {
            setError('アクセス権限がありません');
          }
          return;
        }

        setUser(userData);

        // Fetch questionnaires
        const questionnaireData = await questionnaireAPI.getQuestionnaires();
        setQuestionnaires(questionnaireData);

        // Fetch monthly results
        const monthlyData = await monthlyResultAPI.getMonthlyResults();
        setMonthlyResults(monthlyData);
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
        {activeTab === 'dashboard' && (
          <div className="animate-in">
            <h2 className="text-2xl font-bold mb-6">
              こんにちは、{user.name || user.email}さん
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard label="総合レベル" value="Lv.4" change="↑ 前回比 +0.5" changeType="positive" />
              <StatCard label="最高スコア能力" value="実行する力" change="Lv.5 (72点)" />
              <StatCard label="回答済みアンケート" value="12" change="週次継続中" />
              <StatCard label="次回アンケート" value="今週" change="未回答" changeType="negative" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="card">
                <h3 className="card-title">非認知能力レーダーチャート</h3>
                <div className="h-80">
                  <RadarChart data={radarData} />
                </div>
              </div>

              <div className="card">
                <h3 className="card-title">能力別スコア</h3>
                <div className="space-y-3">
                  {skills.map((skill) => (
                    <div key={skill.name} className="skill-item">
                      <span className="skill-name w-32 flex-shrink-0">{skill.name}</span>
                      <div className="skill-bar-container">
                        <div className="skill-bar" style={{ width: `${skill.score}%` }} />
                      </div>
                      <span className="skill-score">{skill.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card mt-5">
              <h3 className="card-title">あなたの強みと改善ポイント</h3>
              <div className="bg-indigo-50 border-l-4 border-indigo-600 p-5 rounded-r-xl">
                <div className="font-semibold mb-2 text-indigo-900">AIからのコメント</div>
                <p className="text-gray-700">
                  あなたは「実行する力」と「完遂する力」が特に高く、決めたことを着実にやり遂げる力があります。
                  一方で「巻き込む力」を伸ばすことで、チームでの活動がさらに効果的になるでしょう。
                  周囲の人に協力を求めることを意識してみてください。
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'questionnaire' && (
          <div className="animate-in">
            {!showQuestionnaireForm && !showQuestionnaireDetail ? (
              <>
                <h2 className="text-2xl font-bold mb-6">アンケート一覧</h2>
                <div className="card">
                  <div className="space-y-3">
                    {questionnaires.map((q) => {
                      const deadline = new Date(q.deadline);
                      const now = new Date();
                      const isBeforeDeadline = now < deadline;
                      const canEdit = q.status === 'completed' && isBeforeDeadline;

                      return (
                        <div
                          key={q.id}
                          className="flex items-center justify-between p-5 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            setSelectedQuestionnaire(q);
                            // 回答済みの場合は詳細表示、未回答の場合はフォーム表示
                            if (q.status === 'completed') {
                              setShowQuestionnaireDetail(true);
                            } else {
                              setShowQuestionnaireForm(true);
                            }
                          }}
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{q.title}</h4>
                            <p className="text-sm text-gray-600">
                              締切: {deadline.toLocaleDateString('ja-JP')} {deadline.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {canEdit && (
                              <p className="text-xs text-blue-600 mt-1">期限前のため編集可能</p>
                            )}
                          </div>
                          <span
                            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                              q.status === 'completed'
                                ? 'bg-green-100 text-green-900'
                                : 'bg-yellow-100 text-yellow-900'
                            }`}
                          >
                            {q.status === 'completed' ? '回答済み' : '未回答'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : showQuestionnaireDetail && selectedQuestionnaire?.answers ? (
              <div className="card">
                <h2 className="text-2xl font-bold mb-6">{selectedQuestionnaire?.title}</h2>
                <QuestionnaireDetail
                  answers={selectedQuestionnaire.answers as QuestionnaireAnswer}
                  canEdit={new Date() < new Date(selectedQuestionnaire.deadline)}
                  onEdit={() => {
                    setShowQuestionnaireDetail(false);
                    setShowQuestionnaireForm(true);
                  }}
                  onClose={() => {
                    setShowQuestionnaireDetail(false);
                    setSelectedQuestionnaire(null);
                  }}
                />
              </div>
            ) : showQuestionnaireForm ? (
              <div className="card">
                <h2 className="text-2xl font-bold mb-6">{selectedQuestionnaire?.title}</h2>
                {selectedQuestionnaire && (
                  <QuestionnaireForm
                    initialAnswers={selectedQuestionnaire.answers as any}
                    isEditing={selectedQuestionnaire.status === 'completed'}
                    onComplete={async (answers) => {
                      try {
                        const deadline = new Date(selectedQuestionnaire.deadline);
                        const now = new Date();

                        if (now > deadline) {
                          alert('アンケートの締切が過ぎているため、送信できません。');
                          return;
                        }

                        if (selectedQuestionnaire.status === 'completed') {
                          // 編集モード
                          await questionnaireAPI.updateQuestionnaire(selectedQuestionnaire.id, {
                            ...answers,
                            q1: answers.q1!,
                            q3: answers.q3!,
                            q4: answers.q4!,
                          });
                          alert('アンケートを更新しました！');
                        } else {
                          // 新規提出
                          await questionnaireAPI.submitQuestionnaire(selectedQuestionnaire.id, {
                            ...answers,
                            q1: answers.q1!,
                            q3: answers.q3!,
                            q4: answers.q4!,
                          });
                          alert('アンケートを提出しました！');
                        }

                        // アンケート一覧を再取得
                        const questionnaireData = await questionnaireAPI.getQuestionnaires();
                        setQuestionnaires(questionnaireData);
                        setShowQuestionnaireForm(false);
                        setShowQuestionnaireDetail(false);
                        setSelectedQuestionnaire(null);
                      } catch (error: any) {
                        console.error('Error submitting questionnaire:', error);
                        alert(error.response?.data?.detail || 'アンケートの送信に失敗しました');
                      }
                    }}
                    onCancel={() => {
                      setShowQuestionnaireForm(false);
                      // 回答済みの場合は詳細画面に戻る、未回答の場合は一覧に戻る
                      if (selectedQuestionnaire?.status === 'completed') {
                        setShowQuestionnaireDetail(true);
                      } else {
                        setSelectedQuestionnaire(null);
                      }
                    }}
                  />
                )}
              </div>
            ) : null}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-in">
            {!showMonthlyDashboard ? (
              <>
                <h2 className="text-2xl font-bold mb-6">月次結果履歴</h2>
                <div className="card mb-5">
                  <h3 className="card-title">過去の月次結果</h3>
                  <div className="space-y-3">
                    {monthlyResults.map((result, index) => {
                      // Calculate change from previous month
                      const prevResult = monthlyResults[index + 1];
                      const levelChange = prevResult ? result.level - prevResult.level : 0;
                      const changeType = levelChange > 0 ? 'positive' : levelChange < 0 ? 'negative' : 'neutral';

                      return (
                        <div
                          key={result.id}
                          className="flex items-center p-5 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedMonthlyResult(result);
                            setShowMonthlyDashboard(true);
                          }}
                        >
                          <div className="min-w-[120px] text-sm text-gray-600">
                            {result.year}年{result.month}月
                          </div>
                          <div className="flex-1 flex items-center gap-3">
                            <span className={`level-badge level-${result.level}`}>Lv.{result.level}</span>
                          </div>
                          {prevResult && (
                            <span className={`text-sm font-medium ${
                              changeType === 'positive' ? 'text-green-600' :
                              changeType === 'negative' ? 'text-red-600' :
                              'text-gray-600'
                            }`}>
                              {changeType === 'positive' ? '↑' : changeType === 'negative' ? '↓' : '→'}
                              {levelChange > 0 ? `+${levelChange}` : levelChange}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : selectedMonthlyResult ? (
              <MonthlyDashboard
                result={selectedMonthlyResult}
                onClose={() => {
                  setShowMonthlyDashboard(false);
                  setSelectedMonthlyResult(null);
                }}
              />
            ) : null}
          </div>
        )}

        {activeTab === 'weekly' && (
          <div className="animate-in">
            <h2 className="text-2xl font-bold mb-6">週次振り返り入力</h2>
            <div className="card mb-5">
              <h3 className="card-title">今週の振り返り</h3>
              <div className="max-w-2xl space-y-5">
                <div>
                  <label className="block font-semibold mb-2">実施日</label>
                  <input
                    type="date"
                    defaultValue="2024-12-13"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">自分の強み（今週感じたこと）</label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-600 min-h-[120px] resize-y"
                    placeholder="今週、自分の強みだと感じたことを記入してください"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">自分の弱み（改善したいこと）</label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-600 min-h-[120px] resize-y"
                    placeholder="今週、改善したいと感じたことを記入してください"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button className="btn btn-secondary">下書き保存</button>
              <button className="btn btn-primary">登録する</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

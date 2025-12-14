'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authAPI, questionnaireAPI, monthlyResultAPI, evaluationAPI, Questionnaire, QuestionnaireAnswer, MonthlyResult, HumilityEvaluationResponse } from '@/lib/api';
import { User, UserRole } from '@/types';
import Navigation from '@/components/shared/Navigation';
import StatCard from '@/components/shared/StatCard';
import RadarChart from '@/components/shared/RadarChart';
import QuestionnaireForm from '@/components/shared/QuestionnaireForm';
import QuestionnaireDetail from '@/components/shared/QuestionnaireDetail';
import ProjectManager from '@/components/shared/ProjectManager';
import { ThumbsUp, ThumbsDown, Edit3, Save, History, Calendar, CheckCircle2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

// Strength/Weakness interface
interface StrengthWeakness {
  id: string;
  strength: string;
  weakness: string;
  createdAt: string;
}

// 3日以内かどうかを判定
const isWithin3Days = (dateString: string): boolean => {
  const createdDate = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - createdDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= 3;
};

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

  // Strength/Weakness state
  const [strengthWeaknesses, setStrengthWeaknesses] = useState<StrengthWeakness[]>([]);
  const [latestStrengthWeakness, setLatestStrengthWeakness] = useState<StrengthWeakness | null>(null);
  const [currentStrength, setCurrentStrength] = useState('');
  const [currentWeakness, setCurrentWeakness] = useState('');
  const [showStrengthHistory, setShowStrengthHistory] = useState(false);
  const [editingStrengthWeakness, setEditingStrengthWeakness] = useState<StrengthWeakness | null>(null);
  const [showStrengthForm, setShowStrengthForm] = useState(false);

  // Humility evaluation state
  const [humilityScore, setHumilityScore] = useState<number>(55);
  const [humilityEvaluation, setHumilityEvaluation] = useState<HumilityEvaluationResponse | null>(null);
  const [isEvaluatingHumility, setIsEvaluatingHumility] = useState(false);

  // Aggregated skill scores from questionnaires
  const [aggregatedSkills, setAggregatedSkills] = useState({
    strategicPlanning: 0,      // 戦略的計画力 - Q1から
    problemSetting: 0,         // 課題設定・構想力 - Q3のインサイト抽出から
    involvement: 0,            // 巻き込む力 - Q3のインタビュー実施から
    dialogue: 0,               // 対話する力 - Q3のインタビュー品質から
    execution: 0,              // 実行する力 - Q1から
    completion: 0,             // 完遂する力 - アンケート完了率から
  });

  // Month finalization state
  const [isFinalizingMonth, setIsFinalizingMonth] = useState(false);

  // Selected month for dashboard view (default to December 2024 for demo)
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedMonth, setSelectedMonth] = useState<number>(12);
  const [selectedMonthResult, setSelectedMonthResult] = useState<MonthlyResult | null>(null);

  const tabs = [
    { id: 'dashboard', label: 'ダッシュボード' },
    { id: 'questionnaire', label: 'アンケート' },
    { id: 'project', label: 'プロジェクト' },
  ];

  // Use finalized results if available, otherwise use real-time aggregated data
  const displaySkills = selectedMonthResult?.skills || {
    '戦略的計画力': aggregatedSkills.strategicPlanning,
    '課題設定・構想力': aggregatedSkills.problemSetting,
    '巻き込む力': aggregatedSkills.involvement,
    '対話する力': aggregatedSkills.dialogue,
    '実行する力': aggregatedSkills.execution,
    '完遂する力': aggregatedSkills.completion,
    '謙虚である力': humilityScore,
  };

  // Radar chart data using aggregated skills or finalized results
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
    values: [
      displaySkills['戦略的計画力'] || 0,
      displaySkills['課題設定・構想力'] || 0,
      displaySkills['巻き込む力'] || 0,
      displaySkills['対話する力'] || 0,
      displaySkills['実行する力'] || 0,
      displaySkills['完遂する力'] || 0,
      displaySkills['謙虚である力'] || 0,
    ],
  };

  const skills = [
    { name: '戦略的計画力', score: displaySkills['戦略的計画力'] || 0 },
    { name: '課題設定・構想力', score: displaySkills['課題設定・構想力'] || 0 },
    { name: '巻き込む力', score: displaySkills['巻き込む力'] || 0 },
    { name: '対話する力', score: displaySkills['対話する力'] || 0 },
    { name: '実行する力', score: displaySkills['実行する力'] || 0 },
    { name: '完遂する力', score: displaySkills['完遂する力'] || 0 },
    { name: '謙虚である力', score: displaySkills['謙虚である力'] || 0 },
  ];

  // Detailed skills data with descriptions (using displaySkills)
  const skillDetails = [
    {
      name: '戦略的計画力',
      score: displaySkills['戦略的計画力'] || 0,
      maxScore: 100,
      change: 0,
      description: '目標達成に向けて、効果的な計画を立て、優先順位をつけて行動する力です。',
      source: selectedMonthResult ? '確定済み' : 'Q1（計画通りに行動できたか）の評価',
    },
    {
      name: '課題設定・構想力',
      score: displaySkills['課題設定・構想力'] || 0,
      maxScore: 100,
      change: 0,
      description: '問題を発見し、解決すべき課題を明確にして、ビジョンを描く力です。',
      source: selectedMonthResult ? '確定済み' : 'インタビューでのインサイト抽出成功率',
    },
    {
      name: '巻き込む力',
      score: displaySkills['巻き込む力'] || 0,
      maxScore: 100,
      change: 0,
      description: '周囲の人を巻き込み、協力を得ながらチームで成果を出す力です。',
      source: selectedMonthResult ? '確定済み' : 'インタビュー実施・参加率',
    },
    {
      name: '対話する力',
      score: displaySkills['対話する力'] || 0,
      maxScore: 100,
      change: 0,
      description: '相手の話を傾聴し、自分の考えを適切に伝えるコミュニケーション力です。',
      source: selectedMonthResult ? '確定済み' : 'インタビューの質（引き出し・発話成功率）',
    },
    {
      name: '実行する力',
      score: displaySkills['実行する力'] || 0,
      maxScore: 100,
      change: 0,
      description: '計画を実際の行動に移し、粘り強く取り組む力です。',
      source: selectedMonthResult ? '確定済み' : 'Q1（計画通りに行動できたか）の評価',
    },
    {
      name: '完遂する力',
      score: displaySkills['完遂する力'] || 0,
      maxScore: 100,
      change: 0,
      description: '困難があっても最後までやり遂げ、成果を出し切る力です。',
      source: selectedMonthResult ? '確定済み' : 'アンケート完了率',
    },
    {
      name: '謙虚である力',
      score: displaySkills['謙虚である力'] || 0,
      maxScore: 100,
      change: 0,
      description: '自分の弱さを認め、他者から学び、成長し続ける姿勢です。',
      source: selectedMonthResult ? '確定済み' : 'AI評価（感謝メッセージ + 弱みの具体性）',
      isLoading: !selectedMonthResult && isEvaluatingHumility,
    },
  ];

  // Calculate badges for each skill
  const getSkillBadge = (skill: typeof skillDetails[0], allSkills: typeof skillDetails) => {
    const maxScore = Math.max(...allSkills.map(s => s.score));
    const minScore = Math.min(...allSkills.map(s => s.score));

    if (skill.score === maxScore) {
      return { type: 'top', label: 'TOP', color: 'bg-yellow-100 text-yellow-800' };
    }
    if (skill.score === minScore || skill.score < 50) {
      return { type: 'improve', label: '要改善', color: 'bg-red-100 text-red-800' };
    }
    if (skill.change > 0) {
      return { type: 'up', label: `+${skill.change}`, color: 'bg-green-100 text-green-800' };
    }
    if (skill.change < 0) {
      return { type: 'down', label: `${skill.change}`, color: 'bg-gray-100 text-gray-600' };
    }
    return { type: 'neutral', label: '→', color: 'bg-gray-100 text-gray-600' };
  };

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

        // Load strength/weakness from localStorage
        const savedStrengthWeaknesses = localStorage.getItem(`strengthWeaknesses_${userData.id}`);
        if (savedStrengthWeaknesses) {
          const parsed = JSON.parse(savedStrengthWeaknesses) as StrengthWeakness[];
          // Sort by createdAt descending
          const sorted = [...parsed].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setStrengthWeaknesses(sorted);
          if (sorted.length > 0) {
            setLatestStrengthWeakness(sorted[0]);
          }
        }
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

  // Aggregate skills from questionnaires
  useEffect(() => {
    const aggregateSkills = () => {
      const completedQuestionnaires = questionnaires.filter(q => q.status === 'completed' && q.answers);

      if (completedQuestionnaires.length === 0) {
        setAggregatedSkills({
          strategicPlanning: 0,
          problemSetting: 0,
          involvement: 0,
          dialogue: 0,
          execution: 0,
          completion: 0,
        });
        return;
      }

      // 選択された月のアンケートをフィルタリング
      const targetMonth = selectedMonth - 1; // 0-indexed
      const targetYear = selectedYear;
      const thisMonthQuestionnaires = completedQuestionnaires.filter(q => {
        const qDate = new Date(q.created_at);
        return qDate.getMonth() === targetMonth && qDate.getFullYear() === targetYear;
      });

      // 選択月のデータがなければ全データを使用
      const targetQuestionnaires = thisMonthQuestionnaires.length > 0 ? thisMonthQuestionnaires : completedQuestionnaires;

      let totalQ1Score = 0;
      let q1Count = 0;
      let interviewConductedCount = 0;
      let interviewReceivedCount = 0;
      let couldExtractCount = 0;
      let couldSpeakCount = 0;
      let extractAttemptCount = 0;
      let speakAttemptCount = 0;

      targetQuestionnaires.forEach(q => {
        const answers = q.answers;
        if (!answers) return;

        // Q1: 計画通りに行動できたか (1-5)
        if (answers.q1 !== undefined && answers.q1 !== null) {
          totalQ1Score += answers.q1;
          q1Count++;
        }

        // Q3: インタビュー
        if (answers.q3_didConduct) {
          interviewConductedCount++;
          if (answers.q3_couldExtract !== null && answers.q3_couldExtract !== undefined) {
            extractAttemptCount++;
            if (answers.q3_couldExtract) {
              couldExtractCount++;
            }
          }
        }

        if (answers.q3_didReceive) {
          interviewReceivedCount++;
          if (answers.q3_couldSpeak !== null && answers.q3_couldSpeak !== undefined) {
            speakAttemptCount++;
            if (answers.q3_couldSpeak) {
              couldSpeakCount++;
            }
          }
        }
      });

      // スコア計算 (0-100)
      // 戦略的計画力: Q1の平均 (1-5 → 0-100)
      const strategicPlanning = q1Count > 0 ? Math.round(((totalQ1Score / q1Count) - 1) / 4 * 100) : 0;

      // 実行する力: Q1と同じ基準だが、加重を変える
      const execution = q1Count > 0 ? Math.round(((totalQ1Score / q1Count) - 1) / 4 * 100) : 0;

      // 巻き込む力: インタビュー実施率 (最大週4回として)
      const maxInterviews = targetQuestionnaires.length * 2; // 実施 + 受ける
      const totalInterviews = interviewConductedCount + interviewReceivedCount;
      const involvement = maxInterviews > 0 ? Math.round((totalInterviews / maxInterviews) * 100) : 0;

      // 対話する力: インタビューの質 (抽出成功率 + 話せた率の平均)
      const extractRate = extractAttemptCount > 0 ? couldExtractCount / extractAttemptCount : 0;
      const speakRate = speakAttemptCount > 0 ? couldSpeakCount / speakAttemptCount : 0;
      const dialogueAttempts = extractAttemptCount + speakAttemptCount;
      const dialogue = dialogueAttempts > 0 ? Math.round(((extractRate + speakRate) / 2) * 100) : 0;

      // 課題設定・構想力: インサイト抽出の成功率
      const problemSetting = extractAttemptCount > 0 ? Math.round((couldExtractCount / extractAttemptCount) * 100) : 0;

      // 完遂する力: アンケート回答率
      const totalQuestionnaires = questionnaires.length;
      const completionRate = totalQuestionnaires > 0 ? Math.round((completedQuestionnaires.length / totalQuestionnaires) * 100) : 0;

      setAggregatedSkills({
        strategicPlanning,
        problemSetting,
        involvement,
        dialogue,
        execution,
        completion: completionRate,
      });
    };

    aggregateSkills();
  }, [questionnaires, selectedYear, selectedMonth]);

  // Update selectedMonthResult when selected month changes or monthlyResults change
  useEffect(() => {
    const result = monthlyResults.find(
      r => r.year === selectedYear && r.month === selectedMonth
    );
    setSelectedMonthResult(result || null);
  }, [monthlyResults, selectedYear, selectedMonth]);

  // Evaluate humility when questionnaire data or weakness changes
  useEffect(() => {
    const evaluateHumility = async () => {
      // Get latest completed questionnaire with gratitude data
      const completedQuestionnaires = questionnaires.filter(q => q.status === 'completed' && q.answers);
      if (completedQuestionnaires.length === 0 && !latestStrengthWeakness) {
        return;
      }

      // Collect all gratitude targets from questionnaires
      const allGratitudeTargets: Array<{ student_name: string; message: string }> = [];
      completedQuestionnaires.forEach(q => {
        if (q.answers?.q2_hasGratitude) {
          // New format with multiple targets
          if (q.answers.q2_gratitudeTargets && q.answers.q2_gratitudeTargets.length > 0) {
            q.answers.q2_gratitudeTargets.forEach(target => {
              allGratitudeTargets.push({
                student_name: target.studentName,
                message: target.message,
              });
            });
          } else if (q.answers.q2_targetStudent && q.answers.q2_message) {
            // Legacy format
            allGratitudeTargets.push({
              student_name: q.answers.q2_targetStudent,
              message: q.answers.q2_message,
            });
          }
        }
      });

      // Get weakness from latest strength/weakness entry
      const weakness = latestStrengthWeakness?.weakness || '';

      // Skip if no data to evaluate
      if (allGratitudeTargets.length === 0 && !weakness) {
        setHumilityScore(0);
        return;
      }

      setIsEvaluatingHumility(true);
      try {
        const result = await evaluationAPI.evaluateHumility({
          gratitude_targets: allGratitudeTargets,
          weakness: weakness,
        });
        setHumilityScore(result.total_score);
        setHumilityEvaluation(result);
      } catch (error) {
        console.error('Failed to evaluate humility:', error);
        // Keep default score on error
      } finally {
        setIsEvaluatingHumility(false);
      }
    };

    if (user) {
      evaluateHumility();
    }
  }, [questionnaires, latestStrengthWeakness, user]);

  // Strength/Weakness functions
  const handleSaveStrengthWeakness = () => {
    if (!currentStrength.trim() && !currentWeakness.trim()) return;
    if (!user) return;

    if (editingStrengthWeakness) {
      // Update existing entry
      const updated = strengthWeaknesses.map(entry =>
        entry.id === editingStrengthWeakness.id
          ? { ...entry, strength: currentStrength, weakness: currentWeakness }
          : entry
      );
      setStrengthWeaknesses(updated);
      setLatestStrengthWeakness(updated[0]);
      localStorage.setItem(`strengthWeaknesses_${user.id}`, JSON.stringify(updated));
      setEditingStrengthWeakness(null);
      alert('更新しました！');
    } else {
      // Create new entry
      const newEntry: StrengthWeakness = {
        id: Date.now().toString(),
        strength: currentStrength,
        weakness: currentWeakness,
        createdAt: new Date().toISOString(),
      };

      const updated = [newEntry, ...strengthWeaknesses];
      setStrengthWeaknesses(updated);
      setLatestStrengthWeakness(newEntry);
      localStorage.setItem(`strengthWeaknesses_${user.id}`, JSON.stringify(updated));
      alert('保存しました！');
    }

    setCurrentStrength('');
    setCurrentWeakness('');
    setShowStrengthForm(false);
  };

  const handleEditStrengthWeakness = (entry: StrengthWeakness) => {
    setEditingStrengthWeakness(entry);
    setCurrentStrength(entry.strength);
    setCurrentWeakness(entry.weakness);
    setShowStrengthHistory(false);
    setShowStrengthForm(true);
  };

  const handleCancelEdit = () => {
    setEditingStrengthWeakness(null);
    setCurrentStrength('');
    setCurrentWeakness('');
    setShowStrengthForm(false);
  };

  // 月次確定関数
  const handleFinalizeMonth = async () => {
    if (selectedMonthResult) {
      alert('この月の結果は既に確定済みです');
      return;
    }

    const monthName = `${selectedYear}年${selectedMonth}月`;

    if (!confirm(`${monthName}の結果を確定しますか？\n確定後は変更できません。`)) {
      return;
    }

    setIsFinalizingMonth(true);
    try {
      const result = await monthlyResultAPI.finalizeMonthlyResult({
        year: selectedYear,
        month: selectedMonth,
        humility_score: humilityScore,
      });
      setSelectedMonthResult(result);
      setMonthlyResults([result, ...monthlyResults]);
      alert(`${monthName}の結果を確定しました！`);
    } catch (error: any) {
      const message = error.response?.data?.detail || '月次確定に失敗しました';
      alert(message);
    } finally {
      setIsFinalizingMonth(false);
    }
  };

  // 月を移動する関数
  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedYear(selectedYear - 1);
      setSelectedMonth(12);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    // デモ用: 2024年12月が最新月
    const maxYear = 2024;
    const maxMonth = 12;

    // 最新月より先には進めない
    if (selectedYear > maxYear || (selectedYear === maxYear && selectedMonth >= maxMonth)) {
      return;
    }

    if (selectedMonth === 12) {
      setSelectedYear(selectedYear + 1);
      setSelectedMonth(1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // 選択月のアンケート数を取得
  const selectedMonthQuestionnaires = questionnaires.filter(q => {
    const qDate = new Date(q.created_at);
    return qDate.getFullYear() === selectedYear && qDate.getMonth() === selectedMonth - 1;
  });

  const selectedMonthCompletedCount = selectedMonthQuestionnaires.filter(q => q.status === 'completed').length;

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

            {/* 月次ステータスカード */}
            <div className="card mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar size={24} className="text-indigo-600" />
                  <div>
                    {/* 月選択ナビゲーション */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePreviousMonth}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        title="前月"
                      >
                        <ChevronLeft size={20} className="text-gray-600" />
                      </button>
                      <h3 className="font-semibold text-lg min-w-[140px] text-center">
                        {selectedYear}年{selectedMonth}月の結果
                      </h3>
                      <button
                        onClick={handleNextMonth}
                        disabled={selectedYear === 2024 && selectedMonth >= 12}
                        className={`p-1 rounded-full transition-colors ${
                          selectedYear === 2024 && selectedMonth >= 12
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                        title="次月"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">
                      {selectedMonthResult
                        ? `確定済み (${new Date(selectedMonthResult.created_at).toLocaleDateString('ja-JP')})`
                        : `週次アンケート ${selectedMonthCompletedCount}件完了 (リアルタイム集計)`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {selectedMonthResult ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                      <CheckCircle2 size={18} />
                      <span className="font-medium">確定済み</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleFinalizeMonth}
                      disabled={isFinalizingMonth || selectedMonthCompletedCount === 0}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        isFinalizingMonth || selectedMonthCompletedCount === 0
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {isFinalizingMonth ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          確定中...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={18} />
                          月次確定
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
              {!selectedMonthResult && selectedMonthCompletedCount === 0 && (
                <p className="mt-3 text-sm text-orange-600">
                  ※ {selectedYear}年{selectedMonth}月のアンケートがありません
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {(() => {
                // 総合スコアを計算（7つのスキルの平均）- displaySkillsを使用
                const allScores = Object.values(displaySkills) as number[];
                const avgScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;
                const level = selectedMonthResult?.level || (Math.floor(avgScore / 20) + 1);
                return (
                  <StatCard
                    label="総合レベル"
                    value={`Lv.${Math.min(level, 5)}`}
                    change={`平均スコア: ${Math.round(avgScore)}点`}
                    changeType={avgScore >= 50 ? 'positive' : avgScore >= 30 ? 'neutral' : 'negative'}
                  />
                );
              })()}
              {(() => {
                // 最高スコア能力を計算 - displaySkillsを使用
                const skillEntries = Object.entries(displaySkills) as [string, number][];
                const topSkill = skillEntries.reduce((prev, curr) =>
                  curr[1] > prev[1] ? curr : prev
                );
                return (
                  <StatCard
                    label="最高スコア能力"
                    value={topSkill[1] > 0 ? topSkill[0] : '-'}
                    change={topSkill[1] > 0 ? `${topSkill[1]}点` : 'データなし'}
                  />
                );
              })()}
              <StatCard
                label="回答済みアンケート"
                value={String(questionnaires.filter(q => q.status === 'completed').length)}
                change="週次継続中"
              />
              {(() => {
                const pendingQuestionnaire = questionnaires.find(q => q.status === 'pending');
                const allCompleted = questionnaires.length > 0 && questionnaires.every(q => q.status === 'completed');

                if (allCompleted) {
                  return (
                    <StatCard
                      label="次回アンケート"
                      value="なし"
                      change="全て回答済み"
                      changeType="positive"
                    />
                  );
                } else if (pendingQuestionnaire) {
                  return (
                    <StatCard
                      label="次回アンケート"
                      value={`第${pendingQuestionnaire.week}週`}
                      change="未回答"
                      changeType="negative"
                    />
                  );
                } else {
                  return (
                    <StatCard
                      label="次回アンケート"
                      value="-"
                      change="アンケートなし"
                    />
                  );
                }
              })()}
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
                {(() => {
                  // 確定済みの場合はai_commentを表示
                  if (selectedMonthResult?.ai_comment) {
                    return <p className="text-gray-700">{selectedMonthResult.ai_comment}</p>;
                  }

                  // リアルタイムの場合はdisplaySkillsから計算
                  const skillScores = Object.entries(displaySkills).map(([name, score]) => ({
                    name,
                    score: score as number
                  }));

                  const hasData = skillScores.some(s => s.score > 0);

                  if (!hasData) {
                    return (
                      <p className="text-gray-700">
                        アンケートに回答すると、あなたの能力分析とアドバイスが表示されます。
                        まずはアンケートに回答してみましょう！
                      </p>
                    );
                  }

                  // 最高スコアと最低スコアのスキルを取得
                  const sortedSkills = [...skillScores].sort((a, b) => b.score - a.score);
                  const topSkills = sortedSkills.filter(s => s.score === sortedSkills[0].score);
                  const bottomSkills = sortedSkills.filter(s => s.score === sortedSkills[sortedSkills.length - 1].score && s.score < 50);

                  const topSkillNames = topSkills.map(s => `「${s.name}」`).join('と');
                  const bottomSkillNames = bottomSkills.map(s => `「${s.name}」`).join('と');

                  let comment = '';

                  if (topSkills[0].score > 0) {
                    comment += `あなたは${topSkillNames}が特に高く、`;
                    if (topSkills[0].name.includes('実行') || topSkills[0].name.includes('完遂')) {
                      comment += '決めたことを着実にやり遂げる力があります。';
                    } else if (topSkills[0].name.includes('対話') || topSkills[0].name.includes('巻き込む')) {
                      comment += 'チームでの協力やコミュニケーションが得意です。';
                    } else if (topSkills[0].name.includes('戦略') || topSkills[0].name.includes('課題')) {
                      comment += '計画を立てて物事を進める力が優れています。';
                    } else if (topSkills[0].name.includes('謙虚')) {
                      comment += '他者への感謝や自己認識の姿勢が素晴らしいです。';
                    }
                  }

                  if (bottomSkills.length > 0 && bottomSkills[0].score < sortedSkills[0].score) {
                    comment += ` 一方で${bottomSkillNames}を伸ばすことで、さらに成長できるでしょう。`;
                  }

                  if (!comment) {
                    comment = 'アンケートへの回答を続けることで、より詳細な分析ができるようになります。';
                  }

                  return <p className="text-gray-700">{comment}</p>;
                })()}
              </div>
            </div>

            {/* 7つのスキル詳細 */}
            <div className="card mt-5">
              <h3 className="card-title">7つのスキル詳細</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skillDetails.map((skill) => {
                  const badge = getSkillBadge(skill, skillDetails);
                  const scorePercent = (skill.score / skill.maxScore) * 100;
                  const isHumility = skill.name === '謙虚である力';
                  const skillIsLoading = 'isLoading' in skill && skill.isLoading;

                  return (
                    <div
                      key={skill.name}
                      className={`p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow ${
                        isHumility ? 'ring-2 ring-indigo-200' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                          {isHumility && (
                            <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded">
                              AI評価
                            </span>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mb-2">
                        {skillIsLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm text-gray-500">評価中...</span>
                          </div>
                        ) : (
                          <>
                            <div className="text-2xl font-bold text-indigo-600">{skill.score}</div>
                            <div className="text-sm text-gray-500">/ {skill.maxScore}</div>
                          </>
                        )}
                      </div>

                      <div className="w-full h-2 bg-gray-200 rounded-full mb-3">
                        <div
                          className={`h-full rounded-full transition-all ${
                            badge.type === 'top' ? 'bg-yellow-500' :
                            badge.type === 'improve' ? 'bg-red-400' :
                            'bg-indigo-500'
                          }`}
                          style={{ width: skillIsLoading ? '0%' : `${scorePercent}%` }}
                        />
                      </div>

                      <p className="text-sm text-gray-600 mb-2">{skill.description}</p>

                      {/* スコア算出元を表示 */}
                      {'source' in skill && skill.source && (
                        <p className="text-xs text-indigo-500 mb-2">📊 算出元: {skill.source}</p>
                      )}

                      {/* 謙虚である力の評価詳細 */}
                      {isHumility && humilityEvaluation && !skillIsLoading && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-xs text-gray-500 space-y-1">
                            <div className="flex justify-between">
                              <span>感謝の人数スコア:</span>
                              <span className="font-medium">{humilityEvaluation.gratitude_count_score}点</span>
                            </div>
                            <div className="flex justify-between">
                              <span>感謝の内容スコア:</span>
                              <span className="font-medium">{humilityEvaluation.gratitude_content_score}点</span>
                            </div>
                            <div className="flex justify-between">
                              <span>弱みの具体性スコア:</span>
                              <span className="font-medium">{humilityEvaluation.weakness_score}点</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 強み・弱み */}
            <div className="card mt-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="card-title mb-0">
                  {showStrengthForm
                    ? (editingStrengthWeakness ? '強み・弱みの編集' : '強み・弱みの記入')
                    : showStrengthHistory
                      ? '過去の記録'
                      : 'あなたの強み・弱み'}
                </h3>
                <div className="flex gap-2">
                  {!showStrengthForm && !showStrengthHistory && (
                    <>
                      <button
                        onClick={() => setShowStrengthHistory(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <History size={16} />
                        履歴
                      </button>
                      <button
                        onClick={() => setShowStrengthForm(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit3 size={16} />
                        新規登録
                      </button>
                    </>
                  )}
                  {(showStrengthForm || showStrengthHistory) && (
                    <button
                      onClick={() => {
                        setShowStrengthForm(false);
                        setShowStrengthHistory(false);
                        handleCancelEdit();
                      }}
                      className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                    >
                      戻る
                    </button>
                  )}
                </div>
              </div>

              {/* Form View */}
              {showStrengthForm && (
                <div className="space-y-4">
                  {editingStrengthWeakness && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-yellow-800">
                        {new Date(editingStrengthWeakness.createdAt).toLocaleDateString('ja-JP')} の記録を編集中
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-2">自分の強み</label>
                      <textarea
                        value={currentStrength}
                        onChange={(e) => setCurrentStrength(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 min-h-[120px] resize-y"
                        placeholder="例：新しいタスクに積極的に挑戦できた"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">自分の弱み</label>
                      <textarea
                        value={currentWeakness}
                        onChange={(e) => setCurrentWeakness(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 min-h-[120px] resize-y"
                        placeholder="例：時間管理を意識して、計画的に行動する"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={handleCancelEdit}
                      className="px-6 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleSaveStrengthWeakness}
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                      <Save size={18} />
                      {editingStrengthWeakness ? '更新' : '登録'}
                    </button>
                  </div>
                </div>
              )}

              {/* History View */}
              {showStrengthHistory && (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {strengthWeaknesses.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">まだ記録がありません</p>
                  ) : (
                    strengthWeaknesses.map((entry) => {
                      const canEdit = isWithin3Days(entry.createdAt);
                      const daysAgo = Math.floor((new Date().getTime() - new Date(entry.createdAt).getTime()) / (1000 * 60 * 60 * 24));

                      return (
                        <div key={entry.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm text-gray-500">
                              {new Date(entry.createdAt).toLocaleDateString('ja-JP')}
                              {canEdit && (
                                <span className="ml-2 text-xs text-green-600">
                                  (編集可能: あと{3 - daysAgo}日)
                                </span>
                              )}
                            </div>
                            {canEdit && (
                              <button
                                onClick={() => handleEditStrengthWeakness(entry)}
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                              >
                                <Edit3 size={14} />
                                編集
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="text-xs font-semibold text-green-600">強み</span>
                              <p className="text-gray-700 whitespace-pre-wrap">{entry.strength || '-'}</p>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-orange-600">弱み</span>
                              <p className="text-gray-700 whitespace-pre-wrap">{entry.weakness || '-'}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Latest View (Default) */}
              {!showStrengthForm && !showStrengthHistory && (
                <>
                  {latestStrengthWeakness ? (
                    <div className="space-y-4">
                      <div className="text-xs text-gray-500 mb-2">
                        最終更新: {new Date(latestStrengthWeakness.createdAt).toLocaleDateString('ja-JP')}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 強み */}
                        <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <ThumbsUp size={18} className="text-green-600" />
                            <span className="font-semibold text-green-900">強み</span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">{latestStrengthWeakness.strength}</p>
                        </div>
                        {/* 弱み */}
                        <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-r-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <ThumbsDown size={18} className="text-orange-600" />
                            <span className="font-semibold text-orange-900">弱み</span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">{latestStrengthWeakness.weakness}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">まだ強み・弱みが登録されていません</p>
                      <button
                        onClick={() => setShowStrengthForm(true)}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                      >
                        登録する
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="card mt-5">
              <h3 className="card-title">才能特定</h3>
              <p className="text-gray-600 mb-4">
                あなたの強みや才能を発見するための診断を行います。
              </p>
              <button
                onClick={() => router.push('/student/talent')}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl"
              >
                才能特定を始める
              </button>
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

                        const submitData = {
                          ...answers,
                          q1: answers.q1!,
                          q2_hasGratitude: answers.q2_hasGratitude ?? false,
                          q3_didInterview: answers.q3_didInterview ?? false,
                        };

                        if (selectedQuestionnaire.status === 'completed') {
                          // 編集モード
                          await questionnaireAPI.updateQuestionnaire(selectedQuestionnaire.id, submitData as any);
                          alert('アンケートを更新しました！');
                        } else {
                          // 新規提出
                          await questionnaireAPI.submitQuestionnaire(selectedQuestionnaire.id, submitData as any);
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
                        const errorMessage = error.response?.data?.detail;
                        if (typeof errorMessage === 'string') {
                          alert(errorMessage);
                        } else if (Array.isArray(errorMessage)) {
                          alert(errorMessage.map((e: any) => e.msg || e).join('\n'));
                        } else {
                          alert('アンケートの送信に失敗しました');
                        }
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

        {activeTab === 'project' && (
          <div className="animate-in">
            <h2 className="text-2xl font-bold mb-6">プロジェクト管理</h2>
            <ProjectManager userId={user.id} />
          </div>
        )}
      </main>
    </div>
  );
}

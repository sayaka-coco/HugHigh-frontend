'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { talentResultAPI } from '@/lib/api';
import { Lightbulb, BookOpen, Users } from 'lucide-react';

export default function TalentResultPage() {
  const router = useRouter();

  useEffect(() => {
    const saveTalentResult = async () => {
      const sampleResult = {
        talent_type: '未来を創造する革新者',
        talent_name: '構想力',
        description: 'この才能は、未来のビジョンを描き、それを実現するための独創的なアイデアを生み出す力です。あなたは複雑な情報の中から本質を見抜き、新しい価値を創造することに長けています。',
        keywords: ['戦略', 'アイデア', 'ビジョン', 'リーダーシップ'],
        strengths: [
          '複雑な問題を単純化する能力',
          'パターンを認識し、未来を予測する洞察力',
          '既成概念にとらわれない発想'
        ],
        next_steps: [
          '新しいプロジェクトを企画する',
          '関連する書籍を読む',
          '同じ才能を持つ人と繋がる'
        ]
      };

      try {
        await talentResultAPI.saveTalentResult(sampleResult);
      } catch (error) {
        console.error('Error saving talent result:', error);
      }
    };

    saveTalentResult();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cyan-500 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">✦</span>
            </div>
            <span className="font-bold text-gray-900">才能特定Webアプリ</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/student/home')}
              className="px-5 py-2 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition-colors"
            >
              ダッシュボードに戻る
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold">
              T
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">診断結果：あなたの才能</h1>
          <p className="text-gray-600">おめでとうございます！これがあなたの才能です。</p>
        </div>

        {/* Talent Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-8">
          <div className="flex items-start gap-8">
            <div className="w-64 h-48 bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-xl flex-shrink-0"></div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-cyan-600 mb-2">未来を創造する革新者</div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">構想力</h2>
              <p className="text-gray-700 leading-relaxed">
                この才能は、未来のビジョンを描き、それを実現するための独創的なアイデアを生み出す力です。
                あなたは複雑な情報の中から本質を見抜き、新しい価値を創造することに長けています。
              </p>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">サマリー</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Keywords */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-4">関連キーワード</h4>
              <div className="flex flex-wrap gap-2">
                {['戦略', 'アイデア', 'ビジョン', 'リーダーシップ'].map((keyword) => (
                  <span
                    key={keyword}
                    className="px-4 py-2 bg-cyan-100 text-cyan-900 rounded-full text-sm font-medium"
                  >
                    #{keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Strengths */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-4">あなたの強み</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span className="text-gray-700">複雑な問題を単純化する能力</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span className="text-gray-700">パターンを認識し、未来を予測する洞察力</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span className="text-gray-700">既成概念にとらわれない発想</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">この才能を活かすための次のステップ</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-center">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="text-cyan-600" size={32} />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">新しいプロジェクトを企画する</h4>
              <p className="text-sm text-gray-600">
                あなたの構想力を活かして、身の回りの課題を解決する企画を立ててみましょう。
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-center">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-cyan-600" size={32} />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">関連する書籍を読む</h4>
              <p className="text-sm text-gray-600">
                思考を深めるために、戦略やイノベーションに関する本を読んでみましょう。
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-center">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-cyan-600" size={32} />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">同じ才能を持つ人と繋がる</h4>
              <p className="text-sm text-gray-600">
                コミュニティに参加し、他の革新者たちとアイデアを交換しましょう。
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

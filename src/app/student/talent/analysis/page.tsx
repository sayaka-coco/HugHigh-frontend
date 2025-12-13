'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const talentOptions = [
  {
    id: 'communicator',
    title: '人を繋ぐコミュニケーションの達人',
    description: '多様な価値観を持つ人々と対話し、新しい関係性を築きたい。あなたの回答からは、他者との深い繋がりを重視し、共感を通じて協力関係を築く強い意欲が示されています。'
  },
  {
    id: 'analyst',
    title: '論理的思考で問題を解決するアナリスト',
    description: '複雑な情報を整理し、データに基づいた最適な解決策を導き出したい。貴殿の回答からは、物事の本質を見抜き、体系的に課題を解決する能力に長けていることが伺えます。'
  },
  {
    id: 'artist',
    title: '創造性で世界を彩るアーティスト',
    description: '既成概念にとらわれず、独自のアイデアや表現で新しい価値を生み出したい。あなたの回答には、ユニークな視点と、それを形にするための情熱と創造力が表れています。'
  }
];

export default function TalentAnalysisPage() {
  const router = useRouter();
  const [selectedTalent, setSelectedTalent] = useState('communicator');

  // Load saved selection on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('selectedTalent');
    if (saved) {
      setSelectedTalent(saved);
    }
  }, []);

  // Save selection whenever it changes
  useEffect(() => {
    sessionStorage.setItem('selectedTalent', selectedTalent);
  }, [selectedTalent]);

  const handleNext = () => {
    router.push('/student/talent/additional');
  };

  const handleBack = () => {
    router.push('/student/talent/questionnaire');
  };

  const handleMoreQuestions = () => {
    router.push('/student/talent/additional');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AIによる才能分析結果</h1>
          <p className="text-gray-600 text-lg">
            あなたの回答から、3つの才能候補が見つかりました。最も心惹かれるものを1つ選んでください。
          </p>
        </div>

        {/* Talent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {talentOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedTalent(option.id)}
              className={`p-6 rounded-2xl border-2 transition-all text-left ${
                selectedTalent === option.id
                  ? 'border-cyan-400 bg-cyan-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-3">{option.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{option.description}</p>
              <div className="flex justify-center">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedTalent === option.id
                    ? 'border-cyan-500'
                    : 'border-gray-300'
                }`}>
                  {selectedTalent === option.id && (
                    <div className="w-3 h-3 rounded-full bg-cyan-500" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleBack}
            className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            戻る
          </button>
          <button
            onClick={handleNext}
            className="px-8 py-4 bg-cyan-500 text-white rounded-xl font-semibold hover:bg-cyan-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            次へ
            <ArrowRight size={20} />
          </button>
        </div>

        {/* More Questions Link */}
        <div className="text-center">
          <button
            onClick={handleMoreQuestions}
            className="text-gray-600 hover:text-cyan-600 underline"
          >
            結果がしっくりこない場合はこちら（追加質問へ）
          </button>
        </div>
      </div>
    </div>
  );
}

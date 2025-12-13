'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const talentOptions = [
  {
    id: 'order',
    title: '秩序の創造者',
    subtitle: 'Creator of Order',
    description: '複雑な状況や情報を整理し、明確な構造やシステムを構築することに情熱を注ぎます。混沌の中にパターンを見出し、効果的で美しい秩序を生み出すことで、深い満足感を得るでしょう。'
  },
  {
    id: 'empathy',
    title: '共感の架け橋',
    subtitle: 'Bridge of Empathy',
    description: '他者の感情や視点を深く理解し、人々の間にある隔たりを埋めることに喜びを感じます。異なる背景を持つ人々を繋ぎ、相互理解を促進するコミュニケーターとしての役割を果たしたいと願っています。'
  },
  {
    id: 'explorer',
    title: '未知への探求者',
    subtitle: 'Explorer of the Unknown',
    description: 'まだ誰も足を踏み入れたことのない領域や、新しい知識、アイデアを探求することに強い意欲を持ちます。常に学び続け、常に挑戦し、自らの限界を押し広げることで、世界に新たな発見をもたらしたいと考えています。'
  }
];

export default function ReanalysisPage() {
  const router = useRouter();
  const [selectedTalent, setSelectedTalent] = useState('empathy');

  // Load saved selection on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('reanalysisTalent');
    if (saved) {
      setSelectedTalent(saved);
    }
  }, []);

  // Save selection whenever it changes
  useEffect(() => {
    sessionStorage.setItem('reanalysisTalent', selectedTalent);
  }, [selectedTalent]);

  const handleNext = () => {
    router.push('/student/talent/result');
  };

  const handleBack = () => {
    router.push('/student/talent/additional');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AIによる再分析結果</h1>
          <p className="text-gray-600 text-lg">
            追加の回答を元に、あなたの「Want to」候補を再生成しました。最も心惹かれるものを1つ選んでください。
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
              <h3 className="text-xl font-bold text-gray-900 mb-1">{option.title}</h3>
              <p className="text-sm text-cyan-600 mb-3">{option.subtitle}</p>
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
        <div className="flex justify-between items-center">
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

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex justify-center gap-8 text-sm text-gray-500 mb-4">
            <a href="#" className="hover:text-cyan-600">ホーム</a>
            <a href="#" className="hover:text-cyan-600">プライバシーポリシー</a>
            <a href="#" className="hover:text-cyan-600">利用規約</a>
          </div>
          <p className="text-center text-xs text-gray-400">
            © 2024 Your Company, Inc. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface AdditionalAnswers {
  q9: string[];
  q9_other: string;
  q12: string;
}

export default function AdditionalQuestionsPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<AdditionalAnswers>({
    q9: [],
    q9_other: '',
    q12: ''
  });

  // Load saved answers on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('additionalAnswers');
    if (saved) {
      setAnswers(JSON.parse(saved));
    }
  }, []);

  // Save answers to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('additionalAnswers', JSON.stringify(answers));
  }, [answers]);

  const handleQ9Change = (value: string) => {
    if (answers.q9.includes(value)) {
      setAnswers({ ...answers, q9: answers.q9.filter(v => v !== value) });
    } else {
      setAnswers({ ...answers, q9: [...answers.q9, value] });
    }
  };

  const handleNext = () => {
    router.push('/student/talent/reanalysis');
  };

  const handleBack = () => {
    router.push('/student/talent/analysis');
  };

  const filledCount = [
    answers.q9.length > 0 || answers.q9_other.trim() !== '',
    answers.q12.trim() !== ''
  ].filter(Boolean).length;

  const progress = (filledCount / 2) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">追加質問</h1>
          <p className="text-gray-600">
            もう少し深く掘り下げて、あなたの「want to」の解像度を上げてみましょう。
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">進捗</span>
            <span className="text-sm font-semibold text-cyan-600">{Math.round(progress)}%完了</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {/* Q9 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="mb-4">
              <div className="text-cyan-500 font-semibold mb-2">Q9 | 視点①</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                時間を忘れて没頭できること
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                意図：義務感ではなく、純粋な興味や楽しさから行動を続けます。
              </p>
              <p className="text-gray-700 font-medium mb-4">
                あなたが最近、時間を忘れるくらい夢中になったことは何ですか？（複数選択可）
              </p>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {['仕事', '学習', '趣味', '人との対話'].map((option) => (
                  <label key={option} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={answers.q9.includes(option)}
                      onChange={() => handleQ9Change(option)}
                      className="w-5 h-5 text-cyan-500 border-gray-300 rounded focus:ring-cyan-400"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              <div className="pt-2">
                <label className="block text-sm text-gray-600 mb-2">その他（自由記述）</label>
                <input
                  type="text"
                  value={answers.q9_other}
                  onChange={(e) => setAnswers({ ...answers, q9_other: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-400 transition-colors"
                  placeholder="具体的な活動内容を入力してください"
                />
              </div>
            </div>
          </div>

          {/* Q12 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="mb-4">
              <div className="text-cyan-500 font-semibold mb-2">Q12 | 視点③</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                他人から「ありがとう」と言われること
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                意図：あなたの貢献が、他者にどのような価値を提供しているか客観視します。
              </p>
              <p className="text-gray-700 font-medium mb-4">
                人から感謝された経験で、特に心に残っているエピソードを具体的に教えてください。
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-4">
                <p className="text-sm text-gray-700">
                  例：友人のPCトラブルを解決したら、とても感謝された。自分の知識が人の役に立つことが嬉しかった。
                </p>
              </div>
            </div>
            <textarea
              value={answers.q12}
              onChange={(e) => setAnswers({ ...answers, q12: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-400 transition-colors min-h-[150px] resize-y"
              placeholder="具体的なエピソードを記入してください..."
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={handleBack}
            className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            戻る
          </button>
          <button
            onClick={handleNext}
            disabled={filledCount < 2}
            className={`px-8 py-4 rounded-xl font-semibold flex items-center gap-2 transition-all ${
              filledCount >= 2
                ? 'bg-cyan-500 text-white hover:bg-cyan-600 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            次へ
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface QuestionnaireAnswers {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string[];
  q5_other: string;
}

export default function TalentQuestionnairePage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: [],
    q5_other: ''
  });

  // Load saved answers on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('talentAnswers');
    if (saved) {
      setAnswers(JSON.parse(saved));
    }
  }, []);

  // Save answers to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('talentAnswers', JSON.stringify(answers));
  }, [answers]);

  const handleQ5Change = (value: string) => {
    if (answers.q5.includes(value)) {
      setAnswers({ ...answers, q5: answers.q5.filter(v => v !== value) });
    } else {
      setAnswers({ ...answers, q5: [...answers.q5, value] });
    }
  };

  const handleNext = () => {
    router.push('/student/talent/analysis');
  };

  const handleBack = () => {
    router.push('/student/talent');
  };

  const filledCount = [
    answers.q1.trim() !== '',
    answers.q2.trim() !== '',
    answers.q3 !== '',
    answers.q4.trim() !== '',
    answers.q5.length > 0 || answers.q5_other.trim() !== ''
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">才能特定アンケート</h1>
          <p className="text-gray-600">
            いくつかの質問にお答えください。あなたの「得意とワクワク」と「無意識のパワー」を見つけましょう。
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">進捗</span>
            <span className="text-sm font-semibold text-gray-900">{filledCount} / 5</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
              style={{ width: `${(filledCount / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {/* Q1 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="mb-4">
              <div className="text-cyan-500 font-semibold mb-2">Q1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                あなたが最もワクワクすることは何ですか？
              </h3>
              <p className="text-sm text-gray-500">
                例：新しい技術を学ぶこと、チームで目標を達成すること、美しいデザインを作ること
              </p>
            </div>
            <textarea
              value={answers.q1}
              onChange={(e) => setAnswers({ ...answers, q1: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-400 transition-colors min-h-[120px] resize-y"
              placeholder="自由に記述してください..."
            />
          </div>

          {/* Q2 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="mb-4">
              <div className="text-cyan-500 font-semibold mb-2">Q2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                どんな活動をしている時、時間を忘れるほど夢中になりますか？
              </h3>
              <p className="text-sm text-gray-500">
                例：プログラミング、絵を描くこと、人と話すこと、データ分析
              </p>
            </div>
            <textarea
              value={answers.q2}
              onChange={(e) => setAnswers({ ...answers, q2: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-400 transition-colors min-h-[120px] resize-y"
              placeholder="自由に記述してください..."
            />
          </div>

          {/* Q3 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="mb-4">
              <div className="text-cyan-500 font-semibold mb-2">Q3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                あなたの強みは何だと思いますか？
              </h3>
              <p className="text-sm text-gray-500">
                例：論理的思考力、コミュニケーション能力、創造性、リーダーシップ
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: '論理的思考力', label: '論理的思考力' },
                { value: 'コミュニケーション能力', label: 'コミュニケーション能力' },
                { value: '創造性', label: '創造性' },
                { value: 'リーダーシップ', label: 'リーダーシップ' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setAnswers({ ...answers, q3: option.value })}
                  className={`p-4 rounded-xl border-2 transition-all text-center font-medium ${
                    answers.q3 === option.value
                      ? 'border-cyan-400 bg-cyan-50 text-cyan-900'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Q4 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="mb-4">
              <div className="text-cyan-500 font-semibold mb-2">Q4</div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                これまでの人生で、最も達成感を感じた経験は何ですか？
              </h3>
              <p className="text-sm text-gray-500">
                具体的なエピソードを教えてください
              </p>
            </div>
            <textarea
              value={answers.q4}
              onChange={(e) => setAnswers({ ...answers, q4: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-400 transition-colors min-h-[140px] resize-y"
              placeholder="具体的なエピソードを記入してください..."
            />
          </div>

          {/* Q5 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="mb-4">
              <div className="text-cyan-500 font-semibold mb-2">Q5</div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                どのような人と一緒にいると、自分らしくいられますか？
              </h3>
              <p className="text-sm text-gray-500">
                例：ポジティブな人、知的好奇心が旺盛な人、誠実な人
              </p>
            </div>
            <div className="space-y-3">
              {[
                'ポジティブな人',
                '知的好奇心が旺盛な人',
                '誠実な人'
              ].map((option) => (
                <label key={option} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={answers.q5.includes(option)}
                    onChange={() => handleQ5Change(option)}
                    className="w-5 h-5 text-cyan-500 border-gray-300 rounded focus:ring-cyan-400"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={answers.q5.includes('その他')}
                  onChange={() => handleQ5Change('その他')}
                  className="w-5 h-5 text-cyan-500 border-gray-300 rounded focus:ring-cyan-400"
                />
                <span className="text-gray-700">その他</span>
              </label>
              {answers.q5.includes('その他') && (
                <input
                  type="text"
                  value={answers.q5_other}
                  onChange={(e) => setAnswers({ ...answers, q5_other: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-cyan-400"
                  placeholder="具体的な活動内容を入力してください"
                />
              )}
            </div>
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
            disabled={filledCount < 5}
            className={`px-8 py-4 rounded-xl font-semibold flex items-center gap-2 transition-all ${
              filledCount >= 5
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

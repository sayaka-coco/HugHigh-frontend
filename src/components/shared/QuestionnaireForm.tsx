'use client';

import { useState } from 'react';

interface QuestionnaireAnswer {
  q1: number | null;
  q2: string;
  q3: 'あった' | 'なかった' | null;
  q3_detail: string;
  q4: 'あった' | 'なかった' | null;
  q4_detail: string;
  q5: string;
}

interface QuestionnaireFormProps {
  onComplete: (answers: QuestionnaireAnswer) => void;
  onCancel: () => void;
  initialAnswers?: QuestionnaireAnswer;
  isEditing?: boolean;
}

export default function QuestionnaireForm({ onComplete, onCancel, initialAnswers, isEditing = false }: QuestionnaireFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const totalQuestions = 5;

  const [answers, setAnswers] = useState<QuestionnaireAnswer>(initialAnswers || {
    q1: null,
    q2: '',
    q3: null,
    q3_detail: '',
    q4: null,
    q4_detail: '',
    q5: '',
  });

  const handleNext = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onComplete(answers);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const canProceed = () => {
    switch (currentQuestion) {
      case 1:
        return answers.q1 !== null;
      case 2:
        return answers.q2.trim() !== '';
      case 3:
        if (answers.q3 === null) return false;
        if (answers.q3 === 'あった' && answers.q3_detail.trim() === '') return false;
        return true;
      case 4:
        if (answers.q4 === null) return false;
        if (answers.q4 === 'あった' && answers.q4_detail.trim() === '') return false;
        return true;
      case 5:
        return answers.q5.trim() !== '';
      default:
        return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-gray-600">進捗状況</div>
          <div className="text-sm font-semibold text-gray-900">
            {currentQuestion} / {totalQuestions} 問
          </div>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 via-blue-500 to-green-500 transition-all duration-500"
            style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question 1 */}
      {currentQuestion === 1 && (
        <div className="animate-in">
          <div className="mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                1
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">
                今週、計画通りに行動できましたか？
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {[
                { value: 1, label: '全くできなかった', sublabel: 'ほとんどできなかった' },
                { value: 2, label: 'あまりできなかった', sublabel: 'あまりできなかった' },
                { value: 3, label: 'どちらとも', sublabel: '半分程度' },
                { value: 4, label: 'まあできた', sublabel: '概ね計画通り' },
                { value: 5, label: 'とてもできた', sublabel: 'ほぼすべて計画通り' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setAnswers({ ...answers, q1: option.value })}
                  className={`p-6 rounded-2xl border-2 transition-all text-center ${
                    answers.q1 === option.value
                      ? 'border-indigo-600 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-4xl font-bold text-indigo-600 mb-2">{option.value}</div>
                  <div className="text-sm font-medium text-gray-700">{option.sublabel}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Question 2 */}
      {currentQuestion === 2 && (
        <div className="animate-in">
          <div className="mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                2
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">
                今週の行動の中で、最も「目的に近づいた」と感じる行動は何ですか？
              </h2>
            </div>

            <div className="space-y-3">
              <div className="text-sm text-gray-600 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="font-medium mb-1">入力ガイド：</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>どんな行動をしたか</li>
                  <li>なぜ目的に近づいたと思ったか</li>
                </ul>
              </div>

              <textarea
                value={answers.q2}
                onChange={(e) => setAnswers({ ...answers, q2: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 transition-colors min-h-[150px] resize-y"
                placeholder="例：プロジェクトの資料を作成し、チームメンバーに共有しました。具体的な提案ができたため、次のステップに進めると感じました。"
              />
              <div className="text-sm text-gray-500 text-right">
                {answers.q2.length} 文字
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Question 3 */}
      {currentQuestion === 3 && (
        <div className="animate-in">
          <div className="mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                3
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">
                今週、計画や考えを「修正・見直し」した点はありますか？
              </h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setAnswers({ ...answers, q3: 'あった' })}
                  className={`p-6 rounded-2xl border-2 transition-all text-center ${
                    answers.q3 === 'あった'
                      ? 'border-indigo-600 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-xl font-bold text-gray-900">あった</div>
                </button>
                <button
                  onClick={() =>
                    setAnswers({ ...answers, q3: 'なかった', q3_detail: '' })
                  }
                  className={`p-6 rounded-2xl border-2 transition-all text-center ${
                    answers.q3 === 'なかった'
                      ? 'border-indigo-600 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-xl font-bold text-gray-900">なかった</div>
                </button>
              </div>

              {answers.q3 === 'あった' && (
                <div className="animate-in space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    何を、なぜ変えましたか？
                  </label>
                  <textarea
                    value={answers.q3_detail}
                    onChange={(e) => setAnswers({ ...answers, q3_detail: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 transition-colors min-h-[120px] resize-y"
                    placeholder="例：当初の計画では個人で進める予定でしたが、他のメンバーと協力した方が効率的だと気づき、役割分担を見直しました。"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Question 4 */}
      {currentQuestion === 4 && (
        <div className="animate-in">
          <div className="mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                4
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">
                今週、誰かと関わって進んだことはありましたか？
              </h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setAnswers({ ...answers, q4: 'あった' })}
                  className={`p-6 rounded-2xl border-2 transition-all text-center ${
                    answers.q4 === 'あった'
                      ? 'border-indigo-600 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-xl font-bold text-gray-900">あった</div>
                </button>
                <button
                  onClick={() =>
                    setAnswers({ ...answers, q4: 'なかった', q4_detail: '' })
                  }
                  className={`p-6 rounded-2xl border-2 transition-all text-center ${
                    answers.q4 === 'なかった'
                      ? 'border-indigo-600 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-xl font-bold text-gray-900">なかった</div>
                </button>
              </div>

              {answers.q4 === 'あった' && (
                <div className="animate-in space-y-3">
                  <div className="text-sm text-gray-600 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <p className="font-medium mb-1">以下について記入してください：</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>誰と関わりましたか？（立場・関係性）</li>
                      <li>何を手伝ってもらった／一緒にやりましたか？</li>
                      <li>それによって何が実現しましたか？</li>
                    </ul>
                  </div>
                  <textarea
                    value={answers.q4_detail}
                    onChange={(e) => setAnswers({ ...answers, q4_detail: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 transition-colors min-h-[150px] resize-y"
                    placeholder="例：クラスメイトの田中さんと協力しました。データ分析を手伝ってもらい、より説得力のある資料が完成しました。"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Question 5 */}
      {currentQuestion === 5 && (
        <div className="animate-in">
          <div className="mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                5
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">
                今週、うまくいかなかったこと・自分の弱みだと感じた点は何ですか？
              </h2>
            </div>

            <div className="space-y-3">
              <textarea
                value={answers.q5}
                onChange={(e) => setAnswers({ ...answers, q5: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 transition-colors min-h-[150px] resize-y"
                placeholder="例：期限を守ることができず、チームに迷惑をかけてしまいました。時間管理が自分の弱みだと改めて感じました。"
              />
              <div className="text-sm text-gray-500 text-right">
                {answers.q5.length} 文字
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={currentQuestion === 1 ? onCancel : handlePrev}
          className="px-8 py-3 rounded-xl border-2 border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {currentQuestion === 1 ? 'キャンセル' : '戻る'}
        </button>

        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className={`px-8 py-3 rounded-xl font-semibold transition-all ${
            canProceed()
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5 shadow-md'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {currentQuestion === totalQuestions ? '提出する' : '次へ'}
        </button>
      </div>
    </div>
  );
}

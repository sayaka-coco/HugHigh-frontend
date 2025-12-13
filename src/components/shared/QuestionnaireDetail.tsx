'use client';

import { QuestionnaireAnswer } from '@/lib/api';

interface QuestionnaireDetailProps {
  answers: QuestionnaireAnswer;
  onEdit?: () => void;
  onClose: () => void;
  canEdit?: boolean;
}

export default function QuestionnaireDetail({ answers, onEdit, onClose, canEdit = false }: QuestionnaireDetailProps) {
  const getQ1Label = (value: number) => {
    const labels = {
      1: '全くできなかった',
      2: 'あまりできなかった',
      3: 'どちらとも',
      4: 'まあできた',
      5: 'とてもできた',
    };
    return labels[value as keyof typeof labels] || '';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">回答内容</h3>
        <div className="flex gap-3">
          {canEdit && onEdit && (
            <button
              onClick={onEdit}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              編集する
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Question 1 */}
        <div className="card">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-3">
                今週、計画通りに行動できましたか？
              </h4>
              <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r-lg">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-indigo-600">{answers.q1}</div>
                  <div className="text-gray-700 font-medium">{getQ1Label(answers.q1)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Question 2 */}
        <div className="card">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
              2
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-3">
                今週の行動の中で、最も「目的に近づいた」と感じる行動は何ですか？
              </h4>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{answers.q2}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Question 3 */}
        <div className="card">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
              3
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-3">
                今週、計画や考えを「修正・見直し」した点はありますか？
              </h4>
              <div className="space-y-3">
                <div className={`inline-block px-4 py-2 rounded-full font-medium ${
                  answers.q3 === 'あった' ? 'bg-green-100 text-green-900' : 'bg-gray-100 text-gray-900'
                }`}>
                  {answers.q3}
                </div>
                {answers.q3 === 'あった' && answers.q3_detail && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-2">何を、なぜ変えましたか？</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{answers.q3_detail}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Question 4 */}
        <div className="card">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
              4
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-3">
                今週、誰かと関わって進んだことはありましたか？
              </h4>
              <div className="space-y-3">
                <div className={`inline-block px-4 py-2 rounded-full font-medium ${
                  answers.q4 === 'あった' ? 'bg-green-100 text-green-900' : 'bg-gray-100 text-gray-900'
                }`}>
                  {answers.q4}
                </div>
                {answers.q4 === 'あった' && answers.q4_detail && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-2">詳細</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{answers.q4_detail}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Question 5 */}
        <div className="card">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
              5
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-3">
                今週、うまくいかなかったこと・自分の弱みだと感じた点は何ですか？
              </h4>
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{answers.q5}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

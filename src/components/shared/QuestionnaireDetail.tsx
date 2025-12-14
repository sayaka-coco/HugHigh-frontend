'use client';

import { QuestionnaireAnswer } from '@/lib/api';
import { Heart, MessageCircle, User } from 'lucide-react';

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
      3: 'どちらとも言えない',
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
                今週計画通りに行動できましたか？
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
                感謝を伝えたい人はいますか？
              </h4>
              <div className="space-y-3">
                <div className={`inline-block px-4 py-2 rounded-full font-medium ${
                  answers.q2_hasGratitude ? 'bg-pink-100 text-pink-900' : 'bg-gray-100 text-gray-900'
                }`}>
                  {answers.q2_hasGratitude ? 'はい' : 'いいえ'}
                </div>

                {answers.q2_hasGratitude && (
                  <div className="space-y-3">
                    {/* Multiple targets (new format) */}
                    {answers.q2_gratitudeTargets && answers.q2_gratitudeTargets.length > 0 ? (
                      answers.q2_gratitudeTargets.map((target, index) => (
                        <div key={index} className="bg-pink-50 border-l-4 border-pink-500 p-4 rounded-r-lg space-y-3">
                          <div className="flex items-center gap-2">
                            <User size={18} className="text-pink-600" />
                            <span className="text-sm font-semibold text-gray-700">誰に対して：</span>
                            <span className="text-gray-900 font-medium">{target.studentName}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Heart size={18} className="text-pink-600" />
                              <span className="text-sm font-semibold text-gray-700">伝えたいこと：</span>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap pl-6">{target.message}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      /* Legacy format (single target) */
                      answers.q2_targetStudent && (
                        <div className="bg-pink-50 border-l-4 border-pink-500 p-4 rounded-r-lg space-y-3">
                          <div className="flex items-center gap-2">
                            <User size={18} className="text-pink-600" />
                            <span className="text-sm font-semibold text-gray-700">誰に対して：</span>
                            <span className="text-gray-900 font-medium">{answers.q2_targetStudent}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Heart size={18} className="text-pink-600" />
                              <span className="text-sm font-semibold text-gray-700">伝えたいこと：</span>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap pl-6">{answers.q2_message}</p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
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
                インタビューを実施しましたか？
              </h4>
              <div className="space-y-4">
                <div className={`inline-block px-4 py-2 rounded-full font-medium ${
                  answers.q3_didInterview ? 'bg-green-100 text-green-900' : 'bg-gray-100 text-gray-900'
                }`}>
                  {answers.q3_didInterview ? 'はい' : 'いいえ'}
                </div>

                {answers.q3_didInterview && (
                  <div className="space-y-4">
                    {/* インタビューを実施した場合 */}
                    {answers.q3_didConduct && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg space-y-3">
                        <h5 className="font-bold text-blue-900">インタビューを実施した</h5>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <MessageCircle size={18} className="text-blue-600" />
                            <span className="text-sm font-semibold text-gray-700">インタビューの内容：</span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap pl-6">{answers.q3_conductContent}</p>
                        </div>

                        <div className="bg-white p-3 rounded-lg">
                          <h6 className="font-semibold text-gray-900 mb-2">振り返りシート</h6>
                          <div className="mb-2">
                            <span className="text-sm font-medium text-gray-700">知りたいことは引き出せましたか？</span>
                            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                              answers.q3_couldExtract ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'
                            }`}>
                              {answers.q3_couldExtract ? 'はい' : 'いいえ'}
                            </span>
                          </div>
                          {answers.q3_couldExtract && answers.q3_extractedInsight && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">どんな気づきがありましたか？</p>
                              <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-2 rounded">{answers.q3_extractedInsight}</p>
                            </div>
                          )}
                          {!answers.q3_couldExtract && answers.q3_extractionChallenge && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">何が課題でしたか？</p>
                              <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-2 rounded">{answers.q3_extractionChallenge}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* インタビューを受けた場合 */}
                    {answers.q3_didReceive && (
                      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg space-y-3">
                        <h5 className="font-bold text-green-900">インタビューを受けた</h5>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <MessageCircle size={18} className="text-green-600" />
                            <span className="text-sm font-semibold text-gray-700">インタビューの内容：</span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap pl-6">{answers.q3_receiveContent}</p>
                        </div>

                        <div className="bg-white p-3 rounded-lg">
                          <h6 className="font-semibold text-gray-900 mb-2">振り返りシート</h6>
                          <div className="mb-2">
                            <span className="text-sm font-medium text-gray-700">思っていることを話せましたか？</span>
                            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                              answers.q3_couldSpeak ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'
                            }`}>
                              {answers.q3_couldSpeak ? 'はい' : 'いいえ'}
                            </span>
                          </div>
                          {answers.q3_couldSpeak && answers.q3_speakingInsight && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">どんな気づきがありましたか？</p>
                              <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-2 rounded">{answers.q3_speakingInsight}</p>
                            </div>
                          )}
                          {!answers.q3_couldSpeak && answers.q3_speakingChallenge && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">なぜ話せなかったのですか？</p>
                              <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-2 rounded">{answers.q3_speakingChallenge}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

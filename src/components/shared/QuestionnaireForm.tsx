'use client';

import { useState, useEffect } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { studentAPI, Student } from '@/lib/api';

interface GratitudeTarget {
  studentId: string;
  studentName: string;
  message: string;
}

interface QuestionnaireAnswer {
  q1: number | null;
  q2_hasGratitude: boolean | null;
  q2_gratitudeTargets: GratitudeTarget[];
  // Legacy fields (kept for backward compatibility)
  q2_targetStudent: string;
  q2_targetStudentId: string;
  q2_message: string;
  q3_didInterview: boolean | null;
  q3_didConduct: boolean;
  q3_conductContent: string;
  q3_couldExtract: boolean | null;
  q3_extractedInsight: string;
  q3_extractionChallenge: string;
  q3_didReceive: boolean;
  q3_receiveContent: string;
  q3_couldSpeak: boolean | null;
  q3_speakingInsight: string;
  q3_speakingChallenge: string;
}

interface QuestionnaireFormProps {
  onComplete: (answers: QuestionnaireAnswer) => void;
  onCancel: () => void;
  initialAnswers?: QuestionnaireAnswer;
  isEditing?: boolean;
}

export default function QuestionnaireForm({ onComplete, onCancel, initialAnswers }: QuestionnaireFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const totalQuestions = 3;

  // Students from API
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);

  // Fetch students from API on mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await studentAPI.getStudents();
        setStudents(data);
      } catch (error) {
        console.error('Failed to fetch students:', error);
      } finally {
        setIsLoadingStudents(false);
      }
    };
    fetchStudents();
  }, []);

  const [answers, setAnswers] = useState<QuestionnaireAnswer>(() => {
    if (initialAnswers) {
      // Convert legacy format to new format if needed
      if (!initialAnswers.q2_gratitudeTargets && initialAnswers.q2_targetStudentId) {
        return {
          ...initialAnswers,
          q2_gratitudeTargets: [{
            studentId: initialAnswers.q2_targetStudentId,
            studentName: initialAnswers.q2_targetStudent,
            message: initialAnswers.q2_message
          }]
        };
      }
      return {
        ...initialAnswers,
        q2_gratitudeTargets: initialAnswers.q2_gratitudeTargets || []
      };
    }
    return {
      q1: null,
      q2_hasGratitude: null,
      q2_gratitudeTargets: [],
      q2_targetStudent: '',
      q2_targetStudentId: '',
      q2_message: '',
      q3_didInterview: null,
      q3_didConduct: false,
      q3_conductContent: '',
      q3_couldExtract: null,
      q3_extractedInsight: '',
      q3_extractionChallenge: '',
      q3_didReceive: false,
      q3_receiveContent: '',
      q3_couldSpeak: null,
      q3_speakingInsight: '',
      q3_speakingChallenge: '',
    };
  });

  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  const filteredStudents = students.filter(
    (student) =>
      (student.name.includes(studentSearch) || (student.class_name && student.class_name.includes(studentSearch))) &&
      !answers.q2_gratitudeTargets.some(t => t.studentId === student.id)
  );

  const [editingTargetIndex, setEditingTargetIndex] = useState<number | null>(null);

  const selectStudent = (student: Student) => {
    const newTarget: GratitudeTarget = {
      studentId: student.id,
      studentName: student.name,
      message: ''
    };
    setAnswers({
      ...answers,
      q2_gratitudeTargets: [...answers.q2_gratitudeTargets, newTarget]
    });
    setStudentSearch('');
    setShowStudentDropdown(false);
    setEditingTargetIndex(answers.q2_gratitudeTargets.length);
  };

  const removeTarget = (index: number) => {
    const newTargets = answers.q2_gratitudeTargets.filter((_, i) => i !== index);
    setAnswers({ ...answers, q2_gratitudeTargets: newTargets });
    if (editingTargetIndex === index) {
      setEditingTargetIndex(null);
    } else if (editingTargetIndex !== null && editingTargetIndex > index) {
      setEditingTargetIndex(editingTargetIndex - 1);
    }
  };

  const updateTargetMessage = (index: number, message: string) => {
    const newTargets = [...answers.q2_gratitudeTargets];
    newTargets[index] = { ...newTargets[index], message };
    setAnswers({ ...answers, q2_gratitudeTargets: newTargets });
  };

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
        if (answers.q2_hasGratitude === null) return false;
        if (answers.q2_hasGratitude === false) return true;
        // At least one target with a message
        return answers.q2_gratitudeTargets.length > 0 &&
               answers.q2_gratitudeTargets.every(t => t.message.trim() !== '');
      case 3:
        if (answers.q3_didInterview === null) return false;
        if (answers.q3_didInterview === false) return true;

        // 少なくとも1つ選択されている必要がある
        if (!answers.q3_didConduct && !answers.q3_didReceive) return false;

        // 実施した場合のバリデーション
        if (answers.q3_didConduct) {
          if (answers.q3_conductContent.trim() === '') return false;
          if (answers.q3_couldExtract === null) return false;
          if (answers.q3_couldExtract && answers.q3_extractedInsight.trim() === '') return false;
          if (!answers.q3_couldExtract && answers.q3_extractionChallenge.trim() === '') return false;
        }

        // 受けた場合のバリデーション
        if (answers.q3_didReceive) {
          if (answers.q3_receiveContent.trim() === '') return false;
          if (answers.q3_couldSpeak === null) return false;
          if (answers.q3_couldSpeak && answers.q3_speakingInsight.trim() === '') return false;
          if (!answers.q3_couldSpeak && answers.q3_speakingChallenge.trim() === '') return false;
        }

        return true;
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
                今週計画通りに行動できましたか？
              </h2>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {[
                { value: 1, label: '全くできなかった' },
                { value: 2, label: 'あまりできなかった' },
                { value: 3, label: 'どちらとも言えない' },
                { value: 4, label: 'まあできた' },
                { value: 5, label: 'とてもできた' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setAnswers({ ...answers, q1: option.value })}
                  className={`p-4 rounded-2xl border-2 transition-all text-center flex flex-col items-center justify-start min-h-[120px] ${
                    answers.q1 === option.value
                      ? 'border-indigo-600 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-4xl font-bold text-indigo-600 mb-2">{option.value}</div>
                  <div className="text-xs font-medium text-gray-700 whitespace-nowrap">{option.label}</div>
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
                感謝を伝えたい人はいますか？
              </h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setAnswers({ ...answers, q2_hasGratitude: true })}
                  className={`p-6 rounded-2xl border-2 transition-all text-center ${
                    answers.q2_hasGratitude === true
                      ? 'border-indigo-600 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-xl font-bold text-gray-900">はい</div>
                </button>
                <button
                  onClick={() => setAnswers({
                    ...answers,
                    q2_hasGratitude: false,
                    q2_gratitudeTargets: [],
                    q2_targetStudent: '',
                    q2_targetStudentId: '',
                    q2_message: ''
                  })}
                  className={`p-6 rounded-2xl border-2 transition-all text-center ${
                    answers.q2_hasGratitude === false
                      ? 'border-indigo-600 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-xl font-bold text-gray-900">いいえ</div>
                </button>
              </div>

              {answers.q2_hasGratitude === true && (
                <div className="space-y-4 animate-in">
                  {/* Added targets list */}
                  {answers.q2_gratitudeTargets.length > 0 && (
                    <div className="space-y-3">
                      {answers.q2_gratitudeTargets.map((target, index) => (
                        <div key={target.studentId} className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-semibold text-indigo-900">{target.studentName}</span>
                            <button
                              onClick={() => removeTarget(index)}
                              className="p-1 hover:bg-indigo-100 rounded-full transition-colors"
                            >
                              <X size={18} className="text-gray-500" />
                            </button>
                          </div>
                          <textarea
                            value={target.message}
                            onChange={(e) => updateTargetMessage(index, e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 transition-colors min-h-[100px] resize-y bg-white"
                            placeholder="感謝のメッセージを入力してください..."
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add new target */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Plus size={16} className="inline mr-1" />
                      感謝を伝えたい人を追加
                    </label>
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          value={studentSearch}
                          onChange={(e) => {
                            setStudentSearch(e.target.value);
                            setShowStudentDropdown(true);
                          }}
                          onFocus={() => setShowStudentDropdown(true)}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 transition-colors"
                          placeholder="名前またはクラスで検索..."
                        />
                      </div>

                      {showStudentDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          {isLoadingStudents ? (
                            <div className="px-4 py-3 text-gray-500 text-center">
                              読み込み中...
                            </div>
                          ) : filteredStudents.length > 0 ? (
                            filteredStudents.map((student) => (
                              <button
                                key={student.id}
                                onClick={() => selectStudent(student)}
                                className="w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors flex justify-between items-center"
                              >
                                <span className="font-medium text-gray-900">{student.name}</span>
                                <span className="text-sm text-gray-500">{student.class_name || ''}</span>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-gray-500 text-center">
                              {students.length === answers.q2_gratitudeTargets.length
                                ? '全員追加済みです'
                                : students.length === 0
                                  ? '生徒がいません'
                                  : '該当する生徒が見つかりません'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
                インタビューを実施しましたか？
              </h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setAnswers({ ...answers, q3_didInterview: true })}
                  className={`p-6 rounded-2xl border-2 transition-all text-center ${
                    answers.q3_didInterview === true
                      ? 'border-indigo-600 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-xl font-bold text-gray-900">はい</div>
                </button>
                <button
                  onClick={() => setAnswers({
                    ...answers,
                    q3_didInterview: false,
                    q3_didConduct: false,
                    q3_conductContent: '',
                    q3_couldExtract: null,
                    q3_extractedInsight: '',
                    q3_extractionChallenge: '',
                    q3_didReceive: false,
                    q3_receiveContent: '',
                    q3_couldSpeak: null,
                    q3_speakingInsight: '',
                    q3_speakingChallenge: ''
                  })}
                  className={`p-6 rounded-2xl border-2 transition-all text-center ${
                    answers.q3_didInterview === false
                      ? 'border-indigo-600 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-xl font-bold text-gray-900">いいえ</div>
                </button>
              </div>

              {answers.q3_didInterview === true && (
                <div className="space-y-6 animate-in">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      該当するものを選択してください（複数選択可）
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setAnswers({
                          ...answers,
                          q3_didConduct: !answers.q3_didConduct,
                          ...(answers.q3_didConduct ? {
                            q3_conductContent: '',
                            q3_couldExtract: null,
                            q3_extractedInsight: '',
                            q3_extractionChallenge: ''
                          } : {})
                        })}
                        className={`p-4 rounded-xl border-2 transition-all text-center ${
                          answers.q3_didConduct
                            ? 'border-blue-600 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-bold text-gray-900">インタビューを実施した</div>
                      </button>
                      <button
                        onClick={() => setAnswers({
                          ...answers,
                          q3_didReceive: !answers.q3_didReceive,
                          ...(answers.q3_didReceive ? {
                            q3_receiveContent: '',
                            q3_couldSpeak: null,
                            q3_speakingInsight: '',
                            q3_speakingChallenge: ''
                          } : {})
                        })}
                        className={`p-4 rounded-xl border-2 transition-all text-center ${
                          answers.q3_didReceive
                            ? 'border-green-600 bg-green-50 shadow-md'
                            : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-bold text-gray-900">インタビューを受けた</div>
                      </button>
                    </div>
                  </div>

                  {/* インタビューを実施した場合 */}
                  {answers.q3_didConduct && (
                    <div className="space-y-4 animate-in bg-blue-50 p-5 rounded-xl border-2 border-blue-200">
                      <h4 className="font-bold text-blue-900">インタビューを実施した</h4>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          インタビューの内容
                        </label>
                        <textarea
                          value={answers.q3_conductContent}
                          onChange={(e) => setAnswers({ ...answers, q3_conductContent: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 transition-colors min-h-[100px] resize-y bg-white"
                          placeholder="インタビューの内容を入力してください..."
                        />
                      </div>

                      <div className="bg-white p-4 rounded-xl">
                        <h5 className="font-semibold text-gray-900 mb-3">振り返りシート</h5>
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            知りたいことは引き出せましたか？
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => setAnswers({
                                ...answers,
                                q3_couldExtract: true,
                                q3_extractionChallenge: ''
                              })}
                              className={`p-3 rounded-lg border-2 transition-all text-center ${
                                answers.q3_couldExtract === true
                                  ? 'border-blue-600 bg-blue-50 shadow-sm'
                                  : 'border-gray-200 hover:border-blue-300'
                              }`}
                            >
                              はい
                            </button>
                            <button
                              onClick={() => setAnswers({
                                ...answers,
                                q3_couldExtract: false,
                                q3_extractedInsight: ''
                              })}
                              className={`p-3 rounded-lg border-2 transition-all text-center ${
                                answers.q3_couldExtract === false
                                  ? 'border-blue-600 bg-blue-50 shadow-sm'
                                  : 'border-gray-200 hover:border-blue-300'
                              }`}
                            >
                              いいえ
                            </button>
                          </div>
                        </div>

                        {answers.q3_couldExtract === true && (
                          <div className="animate-in">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              どんな気づきがありましたか？
                            </label>
                            <textarea
                              value={answers.q3_extractedInsight}
                              onChange={(e) => setAnswers({ ...answers, q3_extractedInsight: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 transition-colors min-h-[80px] resize-y"
                              placeholder="気づきを入力してください..."
                            />
                          </div>
                        )}

                        {answers.q3_couldExtract === false && (
                          <div className="animate-in">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              何が課題でしたか？
                            </label>
                            <textarea
                              value={answers.q3_extractionChallenge}
                              onChange={(e) => setAnswers({ ...answers, q3_extractionChallenge: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 transition-colors min-h-[80px] resize-y"
                              placeholder="課題を入力してください..."
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* インタビューを受けた場合 */}
                  {answers.q3_didReceive && (
                    <div className="space-y-4 animate-in bg-green-50 p-5 rounded-xl border-2 border-green-200">
                      <h4 className="font-bold text-green-900">インタビューを受けた</h4>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          インタビューの内容
                        </label>
                        <textarea
                          value={answers.q3_receiveContent}
                          onChange={(e) => setAnswers({ ...answers, q3_receiveContent: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-600 transition-colors min-h-[100px] resize-y bg-white"
                          placeholder="インタビューの内容を入力してください..."
                        />
                      </div>

                      <div className="bg-white p-4 rounded-xl">
                        <h5 className="font-semibold text-gray-900 mb-3">振り返りシート</h5>
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            思っていることを話せましたか？
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => setAnswers({
                                ...answers,
                                q3_couldSpeak: true,
                                q3_speakingChallenge: ''
                              })}
                              className={`p-3 rounded-lg border-2 transition-all text-center ${
                                answers.q3_couldSpeak === true
                                  ? 'border-green-600 bg-green-50 shadow-sm'
                                  : 'border-gray-200 hover:border-green-300'
                              }`}
                            >
                              はい
                            </button>
                            <button
                              onClick={() => setAnswers({
                                ...answers,
                                q3_couldSpeak: false,
                                q3_speakingInsight: ''
                              })}
                              className={`p-3 rounded-lg border-2 transition-all text-center ${
                                answers.q3_couldSpeak === false
                                  ? 'border-green-600 bg-green-50 shadow-sm'
                                  : 'border-gray-200 hover:border-green-300'
                              }`}
                            >
                              いいえ
                            </button>
                          </div>
                        </div>

                        {answers.q3_couldSpeak === true && (
                          <div className="animate-in">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              どんな気づきがありましたか？
                            </label>
                            <textarea
                              value={answers.q3_speakingInsight}
                              onChange={(e) => setAnswers({ ...answers, q3_speakingInsight: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-600 transition-colors min-h-[80px] resize-y"
                              placeholder="気づきを入力してください..."
                            />
                          </div>
                        )}

                        {answers.q3_couldSpeak === false && (
                          <div className="animate-in">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              なぜ話せなかったのですか？
                            </label>
                            <textarea
                              value={answers.q3_speakingChallenge}
                              onChange={(e) => setAnswers({ ...answers, q3_speakingChallenge: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-600 transition-colors min-h-[80px] resize-y"
                              placeholder="理由を入力してください..."
                            />
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

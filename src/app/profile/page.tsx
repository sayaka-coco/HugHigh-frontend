'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authAPI, profileAPI } from '@/lib/api';
import { User } from '@/types';
import { ArrowLeft, Camera, Save, User as UserIcon, Loader2 } from 'lucide-react';

// 力を入れていることの選択肢
const FOCUS_OPTIONS = [
  '探究活動',
  '部活動',
  '生徒会',
  'アルバイト',
  '資格勉強',
  'その他',
];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [hobbies, setHobbies] = useState('');
  const [currentFocus, setCurrentFocus] = useState<string[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const token = Cookies.get('access_token');

      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);

        // Initialize form with existing data
        if (userData.profile_image) {
          setProfileImage(userData.profile_image);
        }
        if (userData.hobbies) {
          setHobbies(userData.hobbies);
        }
        if (userData.current_focus) {
          setCurrentFocus(userData.current_focus);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('画像はJPEGまたはPNG形式のみアップロード可能です');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('画像サイズは2MB以下にしてください');
      return;
    }

    // Read and convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for square crop
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        const offsetX = (img.width - size) / 2;
        const offsetY = (img.height - size) / 2;

        // Output size 200x200
        canvas.width = 200;
        canvas.height = 200;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, 200, 200);
          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          setProfileImage(base64);
          setError('');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFocusToggle = (focus: string) => {
    setCurrentFocus(prev =>
      prev.includes(focus)
        ? prev.filter(f => f !== focus)
        : [...prev, focus]
    );
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate hobbies length
    if (hobbies.length > 50) {
      setError('趣味・特技は50文字以内で入力してください');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const updatedUser = await profileAPI.updateProfile({
        profile_image: profileImage || undefined,
        hobbies: hobbies || undefined,
        current_focus: currentFocus.length > 0 ? currentFocus : undefined,
      });

      setUser(updatedUser);
      setSuccessMessage('プロフィールを保存しました');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      setError(err.response?.data?.detail || 'プロフィールの保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    // Navigate back based on user role
    if (user?.role === 0) {
      router.push('/student/home');
    } else if (user?.role === 1) {
      router.push('/teacher/home');
    } else {
      router.push('/admin/home');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-600">ユーザー情報の取得に失敗しました</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">プロフィール設定</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-8">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Success message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* 1. Profile Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              アイコン画像
            </label>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="プロフィール画像"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon size={40} className="text-gray-400" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 transition-colors"
                >
                  <Camera size={16} />
                </button>
              </div>
              <div className="text-sm text-gray-500">
                <p>正方形の画像（JPEG/PNG）</p>
                <p>2MB以下でアップロード</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* 2. Hobbies */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              趣味・特技
            </label>
            <div className="relative">
              <input
                type="text"
                value={hobbies}
                onChange={(e) => setHobbies(e.target.value)}
                maxLength={50}
                placeholder="例：サッカー、読書、プログラミング"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                {hobbies.length}/50
              </span>
            </div>
          </div>

          {/* 3. Current Focus */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              今、力を入れていること
            </label>
            <p className="text-sm text-gray-500 mb-3">複数選択可能</p>
            <div className="flex flex-wrap gap-3">
              {FOCUS_OPTIONS.map((focus) => (
                <button
                  key={focus}
                  onClick={() => handleFocusToggle(focus)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    currentFocus.includes(focus)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {focus}
                </button>
              ))}
            </div>
          </div>

          {/* Save button */}
          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2 ${
                saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save size={20} />
                  保存する
                </>
              )}
            </button>
          </div>
        </div>

        {/* User info (read-only) */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">アカウント情報</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">名前</span>
              <span className="text-gray-900 font-medium">{user.name || '未設定'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">メールアドレス</span>
              <span className="text-gray-900 font-medium">{user.email}</span>
            </div>
            {user.class_name && (
              <div className="flex justify-between">
                <span className="text-gray-500">クラス</span>
                <span className="text-gray-900 font-medium">{user.class_name}</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { authAPI } from '@/lib/api';
import { UserRole } from '@/types';
import { Eye, EyeOff } from 'lucide-react';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });

      // Store token in cookie
      Cookies.set('access_token', response.access_token, { expires: 1 });

      // Redirect based on role
      if (response.user.role === UserRole.Student) {
        router.push('/student/home');
      } else if (response.user.role === UserRole.Teacher) {
        router.push('/teacher/home');
      } else if (response.user.role === UserRole.Admin) {
        router.push('/admin/home');
      } else {
        router.push('/student/home');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setLoading(true);

    try {
      if (!credentialResponse.credential) {
        throw new Error('Google credential is missing');
      }

      const response = await authAPI.googleLogin(credentialResponse.credential);

      // Store token in cookie
      Cookies.set('access_token', response.access_token, { expires: 1 });

      // Redirect based on role
      if (response.user.role === UserRole.Student) {
        router.push('/student/home');
      } else if (response.user.role === UserRole.Teacher) {
        router.push('/teacher/home');
      } else if (response.user.role === UserRole.Admin) {
        router.push('/admin/home');
      } else {
        router.push('/student/home');
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      const errorMessage = err.response?.data?.detail ||
                          err.response?.data?.message ||
                          err.message ||
                          'Googleログインに失敗しました';
      setError(`Error processing Google login: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Googleログインがキャンセルされました');
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md w-full mx-5 animate-in">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-indigo-400 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white text-4xl font-bold">
            H
          </div>
          <h1 className="text-3xl font-bold mb-2">HugHigh</h1>
          <p className="text-gray-600 mb-8">高校生向け非認知能力可視化アプリ</p>

          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleEmailLogin}>
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-600 transition-colors"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-600 transition-colors"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none disabled:opacity-50"
                disabled={loading}
                title={showPassword ? 'パスワードを非表示' : 'パスワードを表示'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">または</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                text="signin_with"
                locale="ja"
              />
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

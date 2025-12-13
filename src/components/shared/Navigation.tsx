'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import Cookies from 'js-cookie';
import { User } from '@/types';
import { Menu, X, UserCircle, Sparkles } from 'lucide-react';

interface NavigationProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: { id: string; label: string }[];
}

export default function Navigation({ user, activeTab, onTabChange, tabs }: NavigationProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      Cookies.remove('access_token');
      router.push('/auth/login');
    }
  };

  const getUserInitial = (user: User) => {
    if (user.name) {
      return user.name.charAt(0);
    }
    return user.email.charAt(0).toUpperCase();
  };

  const getRoleName = (role: number) => {
    switch (role) {
      case 0: // student
        return '生徒';
      case 1: // teacher
        return '教師';
      case 2: // admin
        return '管理者';
      default:
        return '不明';
    }
  };

  const getRoleColor = (role: number) => {
    switch (role) {
      case 0: // student
        return 'bg-indigo-500 text-white';
      case 1: // teacher
        return 'bg-green-500 text-white';
      case 2: // admin
        return 'bg-purple-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-indigo-400 rounded-lg flex items-center justify-center text-white text-lg font-bold">
              H
            </div>
            <span className="text-xl font-bold text-indigo-600">HugHigh</span>
          </div>

          <div className="hidden md:flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-indigo-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
              {getRoleName(user.role)}
            </span>
            <span className="font-medium text-sm hidden sm:inline">{user.name || user.email}</span>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-400 flex items-center justify-center text-white font-semibold">
              {getUserInitial(user)}
            </div>

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="メニュー"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute top-16 right-5 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 animate-in">
          <button
            onClick={() => {
              setMenuOpen(false);
              router.push('/student/talent');
            }}
            className="w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors flex items-center gap-3"
          >
            <Sparkles size={20} className="text-indigo-600" />
            <span className="font-medium">才能特定</span>
          </button>
          <div className="border-t border-gray-200 my-2"></div>
          <button
            onClick={() => {
              setMenuOpen(false);
              router.push('/profile');
            }}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
          >
            <UserCircle size={20} className="text-gray-600" />
            <span className="font-medium">プロフィール設定</span>
          </button>
          <div className="border-t border-gray-200 my-2"></div>
          <button
            onClick={() => {
              setMenuOpen(false);
              handleLogout();
            }}
            className="w-full px-4 py-3 text-left hover:bg-red-50 transition-colors text-red-600 font-medium"
          >
            ログアウト
          </button>
        </div>
      )}
    </nav>
  );
}

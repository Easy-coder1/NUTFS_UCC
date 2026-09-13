import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LoginModal } from './LoginModal';
import { UserPlus, LayoutDashboard, LogOut, Lock } from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, signOut } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="cursor-pointer" onClick={() => setActiveTab('register')}>
            <span className="font-serif font-bold text-lg text-slate-900">NUTFS UCC</span>
            <span className="text-xs text-slate-500 block -mt-1 font-sans">Registration Portal</span>
          </div>

          {/* Navigation & Auth Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('register')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'register' || activeTab === 'thankyou'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>

            {user ? (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'dashboard'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Admin Dashboard</span>
                </button>

                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-700 px-2 py-1 transition-colors"
              >
                <Lock className="w-3 h-3" />
                <span>Admin</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {showLoginModal && !user && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </>
  );
};

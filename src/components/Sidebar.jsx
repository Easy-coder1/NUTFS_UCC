import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, User, LogIn, LogOut, Crown } from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, isAdmin, signOut } = useAuth();

  return (
    <header className="w-full bg-slate-900 text-white border-b-2 border-amber-500 shadow-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        <div
          onClick={() => {
            if (!setActiveTab) return;
            if (user) {
              setActiveTab(isAdmin ? 'admin' : 'profile');
            } else {
              setActiveTab('register');
            }
          }}
          className="flex items-center gap-2 cursor-pointer select-none min-w-0"
        >
          <div className="h-8 sm:h-9 px-2 rounded-md bg-white/10 border border-white/20 flex items-center justify-center text-amber-400 font-bold text-xs tracking-wider shadow-xs shrink-0">
            NUTFS
          </div>
          <div className="min-w-0">
            <span className="font-bold text-sm sm:text-base tracking-tight text-white block leading-tight truncate">
              NUTFS UCC
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-300 block font-sans tracking-wide hidden sm:block">
              {user ? 'Fellowship Student Portal • UCC Chapter' : 'Fellowship Registration Portal • UCC Chapter'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Navigation buttons based on auth state */}
          {user ? (
            <>
              {/* Admin Panel link */}
              {isAdmin && activeTab !== 'admin' && (
                <button
                  type="button"
                  onClick={() => setActiveTab && setActiveTab('admin')}
                  className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 text-white hover:bg-purple-500 transition-colors shadow-xs"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin Panel</span>
                  <span className="sm:hidden">Admin</span>
                </button>
              )}

              {/* Profile Card link */}
              {activeTab !== 'profile' && (
                <button
                  type="button"
                  onClick={() => setActiveTab && setActiveTab('profile')}
                  className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-slate-900 hover:bg-amber-400 transition-colors shadow-xs"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Student Page</span>
                  <span className="sm:hidden">Profile</span>
                </button>
              )}

              {/* Sign Out */}
              <button
                type="button"
                onClick={signOut}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              {activeTab === 'login' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab && setActiveTab('register')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-slate-900 hover:bg-amber-400 transition-colors shadow-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Registration</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab && setActiveTab('login')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white border border-white/15 transition-colors shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sign In</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

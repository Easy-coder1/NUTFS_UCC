import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, LayoutDashboard, Menu, X, LogOut, Lock } from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen }) => {
  const { user, signOut } = useAuth();
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col py-6 h-full w-64 fixed left-0 top-0 bg-white border-r border-slate-200/80 shadow-xs z-40">
        {/* Brand Header */}
        <div className="px-6 mb-6">
          <h1 className="font-serif font-bold text-xl text-slate-900 tracking-tight">NUTFS UCC</h1>
          <p className="text-xs text-slate-500 font-medium">Student Registration Portal</p>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <button
            onClick={() => setActiveTab('register')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left text-sm font-medium transition-colors ${
              activeTab === 'register' || activeTab === 'thankyou'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span>Member Registration</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left text-sm font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span className="flex-1">Admin Dashboard</span>
            {!user && <Lock className="w-3.5 h-3.5 shrink-0 opacity-40" />}
          </button>
        </nav>

        {/* Auth Status & Footer */}
        <div className="px-6 pt-4 border-t border-slate-200/80 space-y-3">
          {user ? (
            <div className="space-y-2">
              <div className="text-xs">
                <span className="block text-slate-400 text-[11px]">Signed in as</span>
                <span className="font-medium text-slate-800 truncate block" title={user.email}>
                  {user.email}
                </span>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 transition-colors pt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400">
              National Union of Teshie Fellowship Students — UCC Chapter
            </p>
          )}
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div>
          <span className="font-serif font-bold text-base text-slate-900">NUTFS UCC</span>
          <span className="text-[11px] text-slate-500 block -mt-1">Registration Portal</span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs pt-14">
          <div className="bg-white p-4 border-b border-slate-200 space-y-1 shadow-lg">
            <button
              onClick={() => {
                setActiveTab('register');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left text-sm font-medium ${
                activeTab === 'register' || activeTab === 'thankyou'
                  ? 'bg-slate-900 text-white font-medium'
                  : 'text-slate-700'
              }`}
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              <span>Member Registration</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left text-sm font-medium ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 text-white font-medium'
                  : 'text-slate-700'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Admin Dashboard</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, LayoutDashboard, Menu, X, Church, ShieldCheck, Heart, Lock, LogOut } from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen }) => {
  const { user, signOut } = useAuth();
  return (
    <>
      {/* Desktop Navigation Drawer */}
      <aside className="hidden md:flex flex-col py-6 h-full w-64 fixed left-0 top-0 bg-surface border-r border-outline-variant/70 shadow-soft z-40">
        {/* Brand Header */}
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-white shadow-md border border-secondary/30">
              <Church className="w-6 h-6 text-gold-300" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-primary tracking-tight font-serif">NUTFS UCC</h1>
              <p className="text-xs text-on-surface-variant font-medium">Digital Sanctuary</p>
            </div>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary">
            <span>University of Cape Coast</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-3 space-y-2 overflow-y-auto">
          <button
            onClick={() => setActiveTab('register')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium text-sm ${
              activeTab === 'register' || activeTab === 'thankyou'
                ? 'bg-primary text-white shadow-md font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <UserPlus className="w-5 h-5 shrink-0 text-gold-300" />
            <span>Registration Form</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'bg-primary text-white shadow-md font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0 text-gold-300" />
            <span className="flex-1">Admin Dashboard</span>
            {!user && <Lock className="w-3.5 h-3.5 shrink-0 opacity-60" />}
          </button>
        </nav>

        {/* Auth Status & Institutional Footer */}
        <div className="px-6 pt-4 border-t border-outline-variant/60 space-y-3">
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-primary truncate" title={user.email}>
                  {user.email}
                </span>
              </div>
              <button
                onClick={signOut}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-on-surface-variant hover:text-error hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <Lock className="w-3.5 h-3.5 text-outline" />
              <span className="text-[11px] text-outline">Sign in to access dashboard</span>
            </div>
          )}
          <div className="pt-2 border-t border-outline-variant/40 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              <span className="font-semibold text-primary">NUTFS Fellowship Portal</span>
            </div>
            <p className="text-[11px] text-outline">
              National Union of Teshie Fellowship Students • UCC Chapter
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Top App Bar */}
      <header className="md:hidden fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-surface/95 backdrop-blur-md border-b border-outline-variant shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white">
            <Church className="w-5 h-5 text-gold-300" />
          </div>
          <div>
            <span className="font-bold text-base text-primary font-serif">NUTFS UCC</span>
            <span className="text-[10px] text-outline block -mt-1">Digital Sanctuary</span>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-on-surface rounded-lg hover:bg-surface-container transition-colors"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-primary" />}
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm pt-16">
          <div className="bg-surface p-4 border-b border-outline-variant space-y-2 shadow-lg">
            <button
              onClick={() => {
                setActiveTab('register');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium ${
                activeTab === 'register' || activeTab === 'thankyou'
                  ? 'bg-primary text-white font-semibold'
                  : 'text-on-surface-variant'
              }`}
            >
              <UserPlus className="w-5 h-5 shrink-0" />
              <span>Registration Form</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium ${
                activeTab === 'dashboard'
                  ? 'bg-primary text-white font-semibold'
                  : 'text-on-surface-variant'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 shrink-0" />
              <span>Admin Dashboard</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

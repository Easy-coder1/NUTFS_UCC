import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <header className="w-full bg-slate-900 text-white border-b-2 border-amber-500 shadow-md sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div 
          onClick={() => setActiveTab && setActiveTab('register')}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="h-9 px-2.5 rounded-md bg-white/10 border border-white/20 flex items-center justify-center text-amber-400 font-bold text-xs tracking-wider shadow-xs">
            NUTFS
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white block leading-tight">
              NUTFS UCC
            </span>
            <span className="text-[11px] text-slate-300 block font-sans tracking-wide">
              Fellowship Registration Portal • UCC Chapter
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {activeTab !== 'dashboard' ? (
            <button
              type="button"
              onClick={() => setActiveTab && setActiveTab('dashboard')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white border border-white/15 transition-colors shadow-xs"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Portal</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab && setActiveTab('register')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-slate-900 hover:bg-amber-400 transition-colors shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Registration Form</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

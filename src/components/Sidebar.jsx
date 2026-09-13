import React from 'react';

export const Sidebar = () => {
  return (
    <header className="w-full bg-slate-900 text-white border-b-2 border-amber-500 shadow-md sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
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

        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Registration Open
          </span>
        </div>
      </div>
    </header>
  );
};

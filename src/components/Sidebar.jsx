import React from 'react';

export const Sidebar = () => {
  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div>
          <span className="font-serif font-bold text-lg text-slate-900">NUTFS UCC</span>
          <span className="text-xs text-slate-500 block -mt-1 font-sans">Student Registration Portal</span>
        </div>
      </div>
    </header>
  );
};

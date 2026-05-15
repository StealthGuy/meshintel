import React from 'react';

export const TopBar: React.FC = () => {
  return (
    <header className="h-12 border-b border-slate-200 dark:border-slate-800 shadow-none fixed top-0 right-0 left-64 flex items-center justify-between px-6 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="flex items-center font-mono text-xs uppercase tracking-tighter">
        <span className="font-bold text-slate-900 dark:text-white mr-4">MeshIntel Terminal</span>
      </div>
      <div className="flex items-center gap-4 text-blue-800 dark:text-blue-400">
        <div className="flex items-center gap-3">
          <button className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-300 cursor-pointer transition-opacity active:opacity-70 flex items-center">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-300 cursor-pointer transition-opacity active:opacity-70 flex items-center">
            <span className="material-symbols-outlined">wifi_tethering</span>
          </button>
          <button className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-300 cursor-pointer transition-opacity active:opacity-70 flex items-center">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </div>
    </header>
  );
};

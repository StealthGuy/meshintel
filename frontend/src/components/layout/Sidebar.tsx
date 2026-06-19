import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AlgorithmSelector } from '../dashboard/AlgorithmSelector';
import { MetricsGrid } from '../dashboard/MetricsGrid';
import { useAppStore } from '../../store/useAppStore';

export const Sidebar: React.FC = () => {
  const { isSidebarOpen, toggleSidebar } = useAppStore();
  const location = useLocation();
  const isMapView = location.pathname === '/map';

  const handleNavClick = () => {
    if (window.innerWidth < 768 && isSidebarOpen) {
      toggleSidebar();
    }
  };

  return (
    <nav className={`fixed left-0 top-0 bottom-0 flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-sm antialiased tracking-tight h-screen w-64 border-r border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800 shadow-none z-50 transition-transform duration-300 ease-in-out print:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Header */}
      <div className="p-4 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 shrink-0"></div> {/* Spacer for the floating button */}
        <div className="flex flex-col">
          <span className="text-lg font-mono font-black tracking-[0.2em] text-slate-900 dark:text-white uppercase leading-tight">MESHINTEL</span>
          <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">NETWORK ANALYST v1.0</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex-1 overflow-y-auto py-2">
        <NavLink
          to="/map"
          onClick={handleNavClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 mx-2 mb-1 rounded font-semibold transition-colors duration-150 ` +
            (isActive
              ? `bg-white dark:bg-slate-900 border-l-2 border-blue-800 dark:border-blue-500 text-blue-800 dark:text-blue-400`
              : `text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800`)
          }
        >
          <span className="material-symbols-outlined text-[20px]">graph_3</span>
          <span>Network Topology</span>
        </NavLink>
        <NavLink
          to="/dashboard"
          onClick={handleNavClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 mx-2 mb-1 rounded font-semibold transition-colors duration-150 ` +
            (isActive
              ? `bg-white dark:bg-slate-900 border-l-2 border-blue-800 dark:border-blue-500 text-blue-800 dark:text-blue-400`
              : `text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800`)
          }
        >
          <span className="material-symbols-outlined text-[20px]">dashboard</span>
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/robustness"
          onClick={handleNavClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 mx-2 mb-1 rounded font-semibold transition-colors duration-150 ` +
            (isActive
              ? `bg-white dark:bg-slate-900 border-l-2 border-blue-800 dark:border-blue-500 text-blue-800 dark:text-blue-400`
              : `text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800`)
          }
        >
          <span className="material-symbols-outlined text-[20px]">destruction</span>
          <span>Attack Simulation</span>
        </NavLink>
        {location.pathname.startsWith('/node-details') && (
          <NavLink
            to={location.pathname}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 mx-2 mb-1 rounded font-semibold transition-colors duration-150 ` +
              (isActive
                ? `bg-white dark:bg-slate-900 border-l-2 border-blue-800 dark:border-blue-500 text-blue-800 dark:text-blue-400`
                : `text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800`)
            }
          >
            <span className="material-symbols-outlined text-[20px]">radar</span>
            <span>Node Details</span>
          </NavLink>
        )}
      </div>

      {/* Custom Analyst Content */}
      {isMapView && (
        <div className="px-4 py-4 flex flex-col gap-6 bg-surface-container-lowest">
          <AlgorithmSelector />
          <MetricsGrid />
        </div>
      )}

      <div className="p-4 shrink-0 flex flex-col gap-2">
        <button
          onClick={() => {
            useAppStore.getState().fetchReport(true);
            useAppStore.getState().fetchMapData(useAppStore.getState().activeAlgorithm, true);
            useAppStore.getState().fetchRobustness(true);
            useAppStore.getState().fetchRoleSuggestions(true);
          }}
          className="w-full bg-primary-container text-on-primary font-body-sm text-body-sm font-semibold rounded py-2 flex items-center justify-center gap-2 hover:bg-primary transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">sync</span>
          Refresh Network
        </button>
      </div>
    </nav>
  );
};

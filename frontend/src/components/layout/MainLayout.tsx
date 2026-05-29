import React from 'react';
import { Sidebar } from './Sidebar';
import { useAppStore } from '../../store/useAppStore';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isSidebarOpen, toggleSidebar } = useAppStore();

  return (
    <div className="bg-background text-on-background min-h-screen print:min-h-fit flex overflow-hidden print:overflow-visible print:block dark">
      {/* Floating Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-[60] w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center cursor-pointer shadow-lg transition-all duration-300 hover:scale-105 print:hidden"
      >
        <span className={`material-symbols-outlined transition-transform duration-500 ${isSidebarOpen ? '-rotate-180' : 'rotate-0'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
          hub
        </span>
      </button>

      <Sidebar />
      
      {/* Mobile Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300 cursor-pointer"
          aria-hidden="true"
        />
      )}

      <main className={`transition-all duration-300 ease-in-out ml-0 ${isSidebarOpen ? 'md:ml-64' : ''} print:ml-0 flex-1 h-screen print:h-auto relative bg-black flex flex-col print:block`}>
        {/* <TopBar /> */}
        {children}
      </main>
    </div>
  );
};

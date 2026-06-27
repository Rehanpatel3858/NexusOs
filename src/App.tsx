import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './AppContext';
import { LoginScreen } from './components/LoginScreen';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardHome } from './components/DashboardHome';
import { CalendarPage } from './components/CalendarPage';
import { ProfilePage } from './components/ProfilePage';
import { VoiceAssistant } from './components/VoiceAssistant';
import { RoleModules } from './components/RoleModules';
import { AIAssistantPage } from './components/AIAssistantPage';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const { user, theme, toastPopup, setToastPopup } = useApp();
  const [activeHash, setActiveHash] = useState(window.location.hash);

  // Synchronous hash routers listener
  useEffect(() => {
    const handleHashChange = () => {
      setActiveHash(window.location.hash);
      // Auto scroll to top on nav updates
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Auto sync baseline routes
    if (!window.location.hash) {
      window.location.hash = '#/dashboard';
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Enforce credentials checking
  if (!user) {
    return <LoginScreen />;
  }

  // Routing render switcher
  const renderView = () => {
    switch (activeHash) {
      case '#/profile':
      case '#/settings':
        return <ProfilePage />;
      case '#/calendar':
        return <CalendarPage />;
      case '#/ai-assistant':
        return <AIAssistantPage />;
      case '#/workspace':
      case '#/team':
        return (
          <div className="w-full max-w-7xl mx-auto p-4 md:p-6 pb-24">
            <RoleModules />
          </div>
        );
      case '#/dashboard':
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-[#F6F7FB] dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 flex flex-col font-sans">
      {/* 80px static Top Navbar */}
      <Navbar />

      {/* Primary operating split panel */}
      <div className="flex flex-1 pt-20 relative">
        {/* Left vertical sidebar */}
        <Sidebar activeHash={activeHash} />

        {/* Scrollable central viewport container */}
        <main className="flex-1 w-full pl-0 md:pl-[90px] pb-20 md:pb-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeHash}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <VoiceAssistant />
      {toastPopup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 max-w-md w-full text-left space-y-4 relative">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-55 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-xl shrink-0">
                🔔
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  {toastPopup.title}
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-medium">
                  {toastPopup.message}
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setToastPopup(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  setToastPopup(null);
                  window.location.hash = toastPopup.actionHash;
                  if (toastPopup.actionHash === '#/dashboard') {
                    setTimeout(() => {
                      const el = document.getElementById('tasks');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 150);
                  }
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-bold rounded-xl transition shadow shadow-indigo-500/20 cursor-pointer"
              >
                {toastPopup.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../AppContext';
import { Sparkles, Search, Moon, Sun, Bell, Terminal, Command, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProfileDropdown } from './ProfileDropdown';

export const Navbar: React.FC = () => {
  const {
    user,
    theme,
    toggleTheme,
    searchQuery,
    setSearchQuery,
    notifications,
    markNotificationRead,
    clearNotifications,
    askAi,
    aiResponse,
    setAiResponse
  } = useApp();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // AI query search trigger
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsAiProcessing(true);
    askAi(searchQuery);
    // Dismiss loading shortly
    setTimeout(() => {
      setIsAiProcessing(false);
    }, 1000);
  };

  const executeChipAction = (chipText: string) => {
    setSearchQuery(chipText);
    setIsAiProcessing(true);
    askAi(chipText);
    setTimeout(() => {
      setIsAiProcessing(false);
    }, 1000);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-dismiss AI Response popup after 8 seconds
  useEffect(() => {
    if (aiResponse && aiResponse !== 'processing' && aiResponse !== 'prioritizing') {
      const timer = setTimeout(() => {
        setAiResponse(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [aiResponse, setAiResponse]);

  return (
    <header className="fixed top-0 left-0 right-0 h-20 transition-all z-30 border-b border-slate-200/50 dark:border-slate-800/40 glass">
      <div className="flex items-center justify-between h-full px-4 sm:px-6 max-w-[1600px] mx-auto">
        
        {/* LEFT BRAND SECTION */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-indigo-600/10 dark:bg-indigo-500/20 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl shadow-inner shadow-indigo-600/10">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              NEXUS<span className="text-indigo-600 dark:text-indigo-400">OS</span>
            </span>
          </div>

          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative w-96">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask AI to find tasks, schedule work, or summarize..."
              className="w-full h-11 text-xs font-medium pl-11 pr-14 bg-white/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 rounded-full focus:border-[#6D4AFF] focus:bg-white dark:focus:bg-slate-950 focus:ring-1 focus:ring-[#6D4AFF] outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 transition"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/25 dark:bg-slate-950 font-mono text-[9px] text-slate-450 pointer-events-none uppercase">
              <Command className="w-2.5 h-2.5" /> Enter
            </span>
          </form>
        </div>

        {/* CENTER ASSISTANT CHIPS SUGGESTIONS */}
        <div className="hidden lg:flex items-center gap-2 text-xs">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 dark:text-slate-500">Suggested:</span>
          <button
            onClick={() => executeChipAction('Summarize status')}
            className="px-2.5 py-1 text-[11px] border border-slate-200/60 dark:border-slate-850 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 hover:bg-indigo-50/20 rounded-lg text-slate-500 dark:text-slate-400 cursor-pointer transition"
          >
            Summarize status
          </button>
          <button
            onClick={() => executeChipAction('Show urgent priority tasks')}
            className="px-2.5 py-1 text-[11px] border border-slate-200/60 dark:border-slate-850 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 hover:bg-indigo-50/20 rounded-lg text-slate-500 dark:text-slate-400 cursor-pointer transition"
          >
            Show urgent priority
          </button>
        </div>

        {/* RIGHT CONTROL ACTIONS */}
        <div className="flex items-center gap-4">
          
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="p-2 border border-slate-200/50 dark:border-slate-800/30 hover:bg-slate-100/55 dark:hover:bg-slate-900/50 rounded-xl transition cursor-pointer text-slate-400 hover:text-indigo-500"
            title="Toggle theme variable"
            id="theme-toggle"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications Panel Box */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 border border-slate-200/50 dark:border-slate-800/30 hover:bg-slate-100/55 dark:hover:bg-slate-900/50 rounded-xl transition cursor-pointer relative text-slate-400 hover:text-indigo-500 shadow-sm"
              title="Notifications queue"
              id="notifications-toggle"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" />
              )}
            </button>

            <AnimatePresence>
              {isNotifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-[280px] sm:w-80 max-h-[500px] overflow-hidden rounded-2xl glass shadow-2xl border border-slate-200/70 dark:border-slate-800/80 z-50 flex flex-col"
                >
                  <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
                    <span className="font-display font-semibold text-xs tracking-wide text-slate-800 dark:text-white uppercase">Notifications Queue</span>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-[11px] font-medium text-indigo-500 hover:underline cursor-pointer"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50 max-h-80">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400">
                        No active alerts pending.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationRead(notif.id)}
                          className={`p-4 hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition cursor-pointer text-left ${notif.read ? 'opacity-65' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-medium text-xs text-slate-800 dark:text-slate-100">{notif.title}</span>
                            <span className="text-[9px] font-mono text-slate-400 shrink-0">{notif.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{notif.message}</p>
                          {!notif.read && (
                            <div className="flex items-center gap-1 text-[10px] text-indigo-500 mt-2 font-medium">
                              <Check className="w-3 h-3" /> Mark read
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 hidden md:block" />

          {/* USER AVATAR BUTTON */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-center w-11 h-11 rounded-full hover:scale-[1.03] active:scale-[0.98] transition cursor-pointer font-semibold text-xs text-white border border-white dark:border-slate-800 shadow-[0_4px_10px_rgba(109,74,255,0.25)] bg-[#6C4AFF]"
              title="Open profile administrator matrix"
              id="avatar-toggle"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>
                  {user?.name
                    ? user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                    : 'RP'}
                </span>
              )}
            </button>

            {/* Profile Dropdown Mount */}
            <AnimatePresence>
              {isDropdownOpen && (
                <ProfileDropdown onClose={() => setIsDropdownOpen(false)} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* INTELLIGENT AI OUTPUT CONTEXT OVERLAY */}
      <AnimatePresence>
        {(isAiProcessing || aiResponse) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 top-20 bg-indigo-50 dark:bg-indigo-950/40 border-b border-indigo-200/50 dark:border-indigo-900/30 shadow-md p-4 transition z-20"
          >
            <div className="max-w-4xl mx-auto flex gap-3 text-left">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-600 flex items-center justify-center shrink-0">
                <Terminal className="w-4 h-4" />
              </div>

              <div className="flex-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold block mb-1">
                  NexusOS AI Cognitive Proxy
                </span>

                {aiResponse === 'processing' ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></span>
                    <span className="text-xs text-slate-550 dark:text-slate-400">Consulting structural variables...</span>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-sans mt-0.5" id="ai-response-text">
                      {aiResponse}
                    </p>
                    <button
                      onClick={() => setAiResponse(null)}
                      className="mt-2 text-[10px] font-medium text-slate-400 dark:text-slate-500 hover:text-indigo-500 border border-slate-200/50 dark:border-slate-800 rounded px-1.5 py-0.5 cursor-pointer transition"
                    >
                      Dismiss reply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

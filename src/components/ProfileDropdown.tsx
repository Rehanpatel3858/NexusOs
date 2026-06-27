import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { User, Settings, Bell, Moon, Sun, Shield, LogOut, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProfileDropdownProps {
  onClose: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ onClose }) => {
  const { user, toggleTheme, theme, logout } = useApp();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const handleItemClick = (navigateTargetId: string) => {
    onClose();
    // Use hash navigation mapping
    window.location.hash = navigateTargetId;
  };

  const handleSignOutConfirm = () => {
    logout();
    onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{ boxShadow: '0 30px 60px rgba(0,0,0,0.15)' }}
        className="absolute right-0 mt-3 w-[350px] rounded-[28px] overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 z-50 p-6 flex flex-col text-left shadow-2xl"
        id="profile-dropdown-card"
      >
        {/* TOP USER SECTION */}
        <div className="flex items-center gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-semibold text-lg border border-indigo-200 dark:border-indigo-600 shadow-md shrink-0">
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
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold text-sm text-slate-900 dark:text-white truncate">
                {user?.name || 'Rehan Patel'}
              </span>
              <span className="px-1.5 py-0.5 rounded-full border border-indigo-500/30 font-mono text-[9px] text-indigo-600 dark:text-indigo-400 uppercase font-semibold">
                {user?.role || 'ADMIN'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5" id="user-email">
              {user?.email || 'redblue.385@gmail.com'}
            </span>
          </div>
        </div>

        {/* PROFILE ITEMS LIST */}
        <div className="py-3 space-y-1">
          <button
            onClick={() => handleItemClick('/profile')}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-indigo-500 dark:hover:text-indigo-400 cursor-pointer transition text-left"
          >
            <div className="flex items-center gap-2.5">
              <User className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
              <span>Edit Profile</span>
            </div>
            <span className="text-[9px] font-mono text-slate-400 dark:text-slate-650">/profile</span>
          </button>

          <button
            onClick={() => handleItemClick('/profile')} // Unified Edit & Settings as requested
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-indigo-500 dark:hover:text-indigo-400 cursor-pointer transition text-left"
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
              <span>Settings</span>
            </div>
          </button>

          <button
            onClick={() => handleItemClick('/profile')}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-indigo-500 dark:hover:text-indigo-400 cursor-pointer transition text-left"
          >
            <div className="flex items-center gap-2.5">
              <Bell className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
              <span>Notifications Preferences</span>
            </div>
          </button>

          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-indigo-500 dark:hover:text-indigo-400 cursor-pointer transition text-left"
          >
            <div className="flex items-center gap-2.5">
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4.5 h-4.5 text-amber-500" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4.5 h-4.5 text-slate-400" />
                  <span>Dark Theme</span>
                </>
              )}
            </div>
          </button>

          <button
            onClick={() => handleItemClick('/profile')}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-indigo-500 dark:hover:text-indigo-400 cursor-pointer transition text-left"
          >
            <div className="flex items-center gap-2.5">
              <Shield className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
              <span>Account Security</span>
            </div>
          </button>
        </div>

        {/* LOG OUT BUTTON */}
        <div className="border-t border-slate-100 dark:border-slate-800/50 pt-3">
          <button
            onClick={() => setShowSignOutConfirm(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-red-500 hover:bg-red-500/5 dark:hover:bg-red-500/10 hover:text-red-650 transition cursor-pointer text-left"
            id="logout-dropdown-btn"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </motion.div>

      {/* CONFIRMATION SIGN-OUT MODAL */}
      <AnimatePresence>
        {showSignOutConfirm && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center"
              id="logout-confirmation-modal"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-1050/10 dark:bg-red-500/10 text-red-500 mx-auto mb-4">
                <LogOut className="w-6 h-6" />
              </div>
              <h2 className="text-sm font-display font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                Terminate Synchronization
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                Are you sure you want to sign out from the NexusOS workspace?
              </p>

              <div className="flex gap-3 justify-center mt-6">
                <button
                  onClick={() => setShowSignOutConfirm(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-805 rounded-xl text-xs font-medium text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSignOutConfirm}
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-xs font-medium text-white shadow-md shadow-red-500/15 cursor-pointer transition"
                  id="confirm-logout-btn"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

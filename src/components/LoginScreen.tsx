import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Sparkles, ArrowRight, ShieldCheck, Mail, Lock, User, AtSign, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

export const LoginScreen: React.FC = () => {
  const { login, register } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'student' | 'faculty' | 'professional' | 'entrepreneur' | 'ADMIN'>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all core credential nodes.');
      return;
    }

    if (isSignUp && (!name || !username)) {
      setError('Profile metadata fields are required for matrix authorization.');
      return;
    }

    if (isSignUp && role === 'ADMIN') {
      if (email.trim().toLowerCase() !== 'demo.admin@nexusos.com' || password !== 'NexusDemo2026') {
        setError('Unauthorized: ADMIN role can only be registered with designated supervisor credentials.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await register(email, password, name, username, role);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Unauthorized: Credentials invalid or account does not exist. Please sign up first.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please verify credentials.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please login instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Authorization failed. Please inspect input variables.');
      }
    } finally {
      setLoading(false);
    }
  };

  const setDemouser = (demoType: 'admin' | 'guest') => {
    if (demoType === 'admin') {
      setEmail('redbluee.385@gmail.com');
      setPassword('rehanpatel');
      setName('Rehan Patel');
      setUsername('rehanpatel');
      setRole('ADMIN');
    } else {
      setEmail('guest@nexusos.io');
      setPassword('password123');
      setName('Guest Explorer');
      setUsername('guest_explorer');
      setRole('student');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-slate-50 dark:bg-slate-950">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md overflow-hidden border border-slate-200/60 dark:border-slate-800/60 rounded-3xl glass shadow-2xl relative z-10 p-8 sm:p-10"
        id="login-card"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex items-center justify-center w-14 h-14 bg-indigo-600/10 dark:bg-indigo-500/20 border border-indigo-500/20 rounded-2xl mb-4 text-indigo-600 dark:text-indigo-400 shadow-md">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-slate-900 dark:text-white" id="brand-title">
            NEXUS<span className="text-indigo-600 dark:text-indigo-400">OS</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {isSignUp ? 'Launch your intelligence matrix account' : 'Synchronize your productivity matrix'}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3 mb-4 text-xs font-medium text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-900/50 rounded-xl bg-red-50/50 dark:bg-red-950/20 text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g.rehan "
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white placeholder-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                    <AtSign className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white placeholder-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Select Role
                </label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white font-medium cursor-pointer"
                  >
                    <option value="student" className="bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100">Student</option>
                    <option value="faculty" className="bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100">Faculty</option>
                    <option value="professional" className="bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100">Working Professional</option>
                    <option value="entrepreneur" className="bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100">Entrepreneur</option>
                    <option value="ADMIN" className="bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100">System Tester / ADMIN</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white placeholder-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider flex items-center justify-between">
              <span>Password</span>
              {!isSignUp && (
                <span className="text-[11px] text-indigo-500 font-normal hover:underline cursor-pointer">
                  Forgot?
                </span>
              )}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white placeholder-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 mt-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all rounded-xl shadow-lg shadow-indigo-600/20 outline-none"
            id="auth-submit-btn"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? 'Authorise Account' : 'Initialize Sync'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="flex flex-col items-center gap-3 mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          <div>
            {isSignUp ? 'Already synced?' : "Don't have an operating account?"}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              {isSignUp ? 'Sign In' : 'Create 1 account option'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

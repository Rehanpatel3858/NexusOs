import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { StatsCards } from './StatsCards';
import { TaskWidget } from './TaskWidget';
import { AIInsights } from './AIInsights';
import { AgendaCard } from './AgendaCard';
import { UrgentQueue } from './UrgentQueue';
import { RecentActivity } from './RecentActivity';
import { GoalTracker } from './GoalTracker';
import { Sparkles, Terminal, ArrowUpRight, TrendingUp, Calendar, Clock, Bell, BrainCircuit, X, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export const DashboardHome: React.FC = () => {
  const { user, tasks, events } = useApp();
  const isNewUser = user?.email !== 'redblue.385@gmail.com';
  const [showAiSummary, setShowAiSummary] = useState(user?.email === 'redblue.385@gmail.com');

  // Simulated metrics
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = tasks.filter((t) => !t.completed).length;

  const urgentCount = tasks.filter(t => !t.completed && t.priority === 'high').length;
  const upcomingCount = tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) >= new Date()).length;
  const todayEventsCount = events.filter(e => e.date === '2026-06-23').length;

  const aiSummaryText = `Nexus AI Summary: You have ${urgentCount} urgent high-priority items requiring immediate action. Additionally, ${upcomingCount} upcoming deliverables are on your active radar with ${todayEventsCount} virtual sync coordinates scheduled. Recommended sprint action: resolve your high-priority items first.`;

  const weeklyProductivityData = isNewUser ? [
    { name: 'Mon', score: 0, completed: 0 },
    { name: 'Tue', score: 0, completed: 0 },
    { name: 'Wed', score: 0, completed: 0 },
    { name: 'Thu', score: 0, completed: 0 },
    { name: 'Fri', score: 0, completed: 0 },
    { name: 'Sat', score: 0, completed: 0 },
    { name: 'Sun', score: 0, completed: 0 }
  ] : [
    { name: 'Mon', score: 65, completed: 3 },
    { name: 'Tue', score: 85, completed: 5 },
    { name: 'Wed', score: 55, completed: 2 },
    { name: 'Thu', score: 95, completed: 6 },
    { name: 'Fri', score: 75, completed: 4 },
    { name: 'Sat', score: 40, completed: 1 },
    { name: 'Sun', score: 60, completed: 3 }
  ];

  const taskCompletionData = isNewUser ? [
    { name: 'Wk 22', completed: 0, benchmark: 0 },
    { name: 'Wk 23', completed: 0, benchmark: 0 },
    { name: 'Wk 24', completed: 0, benchmark: 0 },
    { name: 'Wk 25', completed: 0, benchmark: 0 },
    { name: 'Wk 26', completed: completedTasks, benchmark: 0 }
  ] : [
    { name: 'Wk 22', completed: 8, benchmark: 10 },
    { name: 'Wk 23', completed: 14, benchmark: 12 },
    { name: 'Wk 24', completed: 19, benchmark: 15 },
    { name: 'Wk 25', completed: 12, benchmark: 11 },
    { name: 'Wk 26', completed: completedTasks, benchmark: 10 }
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 pb-24" id="dashboard-container">
      
      {/* TWO COLUMN GRID LAYOUT (Main 9 cols vs Right utility 3 cols on desktop) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* LEFT PRIMARY SECTOR (SPAN 3 on Desktop) */}
        <div className="xl:col-span-3 space-y-8 text-left">
          
          {/* WELCOME BANNER GLASS */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] shadow-sm relative overflow-hidden"
            id="welcome-section"
          >
            {/* Background absolute glowing flares */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 text-center md:text-left">
              <div className="flex flex-col gap-1.5 flex-1 select-none">
                <span className="flex items-center justify-center md:justify-start gap-1 py-1 font-mono text-[9px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest leading-none">
                  <Sparkles className="w-3.5 h-3.5 animate-spin [animation-duration:12s]" /> SYNC MATRIX ESTABLISHED
                </span>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-905 dark:text-white leading-tight">
                  Welcome back, {user?.name ? user.name.split(' ')[0] : 'Rehan'}.
                </h1>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-lg mt-0.5" id="brand-subheading">
                  Your intelligence matrix is synced. Local coordinates are optimal, yielding {pendingTasks} unresolved deliverables.
                </p>
              </div>

              <div className="flex gap-4 shrink-0 font-display">
                <div className="p-4 px-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/25 dark:bg-slate-950/25 flex flex-col items-center">
                  <span className="text-2xl font-bold text-slate-850 dark:text-white">{completedTasks}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Archived Tasks</span>
                </div>
                <div className="p-4 px-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/25 dark:bg-slate-950/25 flex flex-col items-center">
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{events.filter(e => e.date === '2026-06-23').length}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Meetings Today</span>
                </div>
              </div>
            </div>
          </motion.div>

          {showAiSummary && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-205 dark:border-slate-805 p-6 max-w-md w-full shadow-2xl relative text-left"
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-500">
                    <BrainCircuit className="w-5 h-5 animate-pulse" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display uppercase tracking-wider">
                    Nexus AI Daily Brief
                  </h4>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed mb-6">
                  {aiSummaryText}
                </p>

                <div className="flex items-center gap-3 justify-end">
                  <button
                    onClick={() => {
                      const cleanText = aiSummaryText.replace(/[*#_`]/g, '');
                      const utterance = new SpeechSynthesisUtterance(cleanText);
                      window.speechSynthesis.cancel();
                      window.speechSynthesis.speak(utterance);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Listen to Summary</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowAiSummary(false);
                      window.speechSynthesis.cancel();
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition cursor-pointer"
                  >
                    Got It
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* DYNAMIC PROGRESSION STATS */}
          <div className="w-full">
            <StatsCards layoutType="dashboard" />
          </div>

          {/* BEATUIFUL RECHARTS METRICS CHARTS PANEL */}
          {!isNewUser && (
            <div className="grid grid-cols-1 gap-6 w-full" id="dashboard-charts-grid">
              
              {/* WEEKLY PRODUCTIVITY CHART */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="pro-card p-5 text-left h-80 flex flex-col overflow-hidden"
                id="weekly-productivity-chart"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold block">Performance Metric</span>
                    <span className="font-display font-bold text-xs text-slate-800 dark:text-slate-100">Weekly Productivity Velocity</span>
                  </div>
                  <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/20 px-2 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                    Peak at 95%
                  </span>
                </div>

                <div className="flex-1 w-full text-[10px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyProductivityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f01c" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(15, 23, 42, 0.9)',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                          color: '#f8fafc'
                        }}
                      />
                      <Bar dataKey="score" fill="#6D4AFF" radius={[4, 4, 0, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          )}

          {/* DELIVERABLES MANAGER ROW */}
          <div className="grid grid-cols-1 gap-6 w-full" id="tasks">
            <TaskWidget />
          </div>

          {/* TODAY'S AGENDA (Rendered only for non-students) */}
          {user?.role !== 'student' && (
            <div className="rounded-2xl glass p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40">
              <AgendaCard />
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR PANEL UTILITIES (350px width scope equivalent on grids) */}
        <div className="space-y-6 xl:col-span-1">
          {/* ACTIVE CRITICAL URGENTS */}
          <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]" id="urgent-queue-panel">
            <UrgentQueue />
          </div>

          {/* GOAL & HABIT TRACKING */}
          <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <GoalTracker />
          </div>

          {/* AI COGNITIVE LOG */}
          <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]" id="ai-insights-panel">
            <AIInsights />
          </div>
        </div>
      </div>
    </div>
  );
};

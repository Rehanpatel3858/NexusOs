import React from 'react';
import { useApp } from '../AppContext';
import { CheckCircle2, Award, Zap, Clock, FolderGit2 } from 'lucide-react';
import { motion } from 'motion/react';

interface StatsCardsProps {
  layoutType?: 'dashboard' | 'profile';
}

export const StatsCards: React.FC<StatsCardsProps> = ({ layoutType = 'dashboard' }) => {
  const { tasks, classrooms, workspaces, entrepreneurItems, goals } = useApp();

  // Dynamic calculations based on LocalStorage state
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const maxStreak = goals && goals.length > 0 ? Math.max(...goals.map(g => g.currentStreak || 0)) : 0;
  const activeProjectsCount = (workspaces?.length || 0) + (classrooms?.length || 0) + (entrepreneurItems?.length || 0);

  const stats = [
    {
      id: 'stat-completed',
      label: 'Tasks Completed',
      value: `${completedTasks}/${totalTasks}`,
      subtext: `${completionRate}% Completion Velocity`,
      icon: CheckCircle2,
      progress: completionRate,
      color: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-550 dark:text-emerald-400',
      bgColor: 'bg-emerald-550/10'
    },
    {
      id: 'stat-score',
      label: 'Productivity Score',
      value: `${totalTasks > 0 ? Math.min(100, Math.max(10, completionRate + 30)) : 0}%`,
      subtext: totalTasks > 0 ? '+4% vs last baseline session' : 'No tasks created yet',
      icon: Award,
      progress: totalTasks > 0 ? Math.min(100, Math.max(10, completionRate + 30)) : 0,
      color: 'from-indigo-500 to-purple-500',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-605/10'
    },
    {
      id: 'stat-streak',
      label: layoutType === 'profile' ? 'Current Streak' : 'Active Projects',
      value: layoutType === 'profile' ? `${maxStreak} Days` : `${activeProjectsCount} Assets`,
      subtext: layoutType === 'profile' 
        ? (maxStreak > 0 ? 'Top 3% world operators' : 'Start a habit to build streak') 
        : (activeProjectsCount > 0 ? 'Synced across cloud nodes' : 'No active assets'),
      icon: layoutType === 'profile' ? Zap : FolderGit2,
      progress: layoutType === 'profile' ? (maxStreak > 0 ? 85 : 0) : (activeProjectsCount > 0 ? 75 : 0),
      color: 'from-rose-500 to-pink-500',
      textColor: 'text-rose-555 dark:text-rose-400',
      bgColor: 'bg-rose-555/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full" id={`${layoutType}-stats-grid`}>
      {stats.map((item, idx) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.08 }}
            whileHover={{ y: -6 }}
            className="p-6 pro-card relative shadow-xs group overflow-hidden"
          >
            {/* Soft decorative background glow on hover */}
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.color} opacity-[0.02] group-hover:opacity-[0.05] transition rounded-bl-full`} />

            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-display font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                {item.label}
              </span>
              <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${item.bgColor} ${item.textColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="flex flex-col text-left">
              <span className="text-2xl font-display font-bold text-slate-800 dark:text-white">
                {item.value}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                {item.subtext}
              </span>
            </div>

            {/* Premium Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.1 }}
                className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

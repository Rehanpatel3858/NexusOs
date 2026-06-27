import React from 'react';
import { useApp } from '../AppContext';
import { History, CheckCircle, User, Calendar, Cpu, Settings } from 'lucide-react';
import { motion } from 'motion/react';

export const RecentActivity: React.FC = () => {
  const { activities } = useApp();

  const getIcon = (category: string) => {
    switch (category) {
      case 'task':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />;
      case 'profile':
        return <User className="w-3.5 h-3.5 text-indigo-500" />;
      case 'calendar':
        return <Calendar className="w-3.5 h-3.5 text-amber-500" />;
      case 'system':
        return <Cpu className="w-3.5 h-3.5 text-blue-500" />;
      default:
        return <Settings className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-4 text-left" id="activity-timeline-container">
      <div className="flex items-center gap-2 mb-2">
        <History className="w-4.5 h-4.5 text-indigo-500" />
        <h3 className="font-display font-bold text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
          RECENT ACTIVITY TIMELINE
        </h3>
      </div>

      <div className="relative border-l border-slate-100 dark:border-slate-800/80 ml-2.5 pl-5 space-y-4">
        {activities.length === 0 ? (
          <div className="text-xs text-slate-400 ml-[-20px] py-4 text-center">
            No active timeline entries recorded.
          </div>
        ) : (
          activities.map((act, idx) => (
            <motion.div
              key={act.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="relative flex flex-col items-start"
            >
              {/* Rounded floating bullet matching category */}
              <div className="absolute left-[-27px] top-0.5 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-805 rounded-full p-0.5 shadow-sm">
                <div className="w-4 h-4 rounded-full flex items-center justify-center">
                  {getIcon(act.category)}
                </div>
              </div>

              <span className="font-sans font-medium text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed text-left">
                {act.text}
              </span>
              <span className="text-[9px] font-mono font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                {act.timestamp}
              </span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

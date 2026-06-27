import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Target, Award, Plus, CheckCircle, Circle, Flame, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const GoalTracker: React.FC = () => {
  const { goals, addGoal, toggleGoalDate } = useApp();
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Study');
  const [newFrequency, setNewFrequency] = useState<'daily' | 'weekly'>('daily');
  const [newTarget, setNewTarget] = useState(2);
  const [isAdding, setIsAdding] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleAdd = () => {
    if (newTitle.trim()) {
      addGoal(newTitle, newCategory, newFrequency, newTarget);
      setNewTitle('');
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-left" id="goal-tracker-container">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Target className="w-4.5 h-4.5 text-indigo-500" />
          <h3 className="font-display font-bold text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
            GOAL & HABIT TRACKING
          </h3>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-250/20 text-[9px] font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition"
        >
          {isAdding ? 'Cancel' : '+ New Goal'}
        </button>
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 bg-slate-50 dark:bg-slate-950/30 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs"
        >
          <div>
            <label className="block text-[9px] text-slate-400 uppercase mb-1">Goal Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Study 2 hours daily"
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[9px] text-slate-400 uppercase mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-2 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-xl"
              >
                <option value="Study">Study</option>
                <option value="Work">Work</option>
                <option value="Health">Health</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] text-slate-400 uppercase mb-1">Frequency</label>
              <select
                value={newFrequency}
                onChange={(e) => setNewFrequency(e.target.value as any)}
                className="w-full px-2 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-xl"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] text-slate-400 uppercase mb-1">Target Hours/Units</label>
              <input
                type="number"
                value={newTarget}
                onChange={(e) => setNewTarget(parseInt(e.target.value))}
                className="w-full px-2 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-xl"
              />
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-550 text-white font-bold rounded-xl transition"
          >
            Create Goal Node
          </button>
        </motion.div>
      )}

      <div className="space-y-3">
        {goals.map((g) => {
          const isDoneToday = g.history[todayStr] === true;
          return (
            <div
              key={g.id}
              className="p-3.5 rounded-xl border border-slate-200/40 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleGoalDate(g.id, todayStr)}
                  className="text-slate-400 hover:text-indigo-500 transition cursor-pointer"
                >
                  {isDoneToday ? (
                    <CheckCircle className="w-5.5 h-5.5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5.5 h-5.5" />
                  )}
                </button>
                <div>
                  <span className="font-display font-bold text-xs text-slate-850 dark:text-slate-100 block">
                    {g.title}
                  </span>
                  <span className="text-[9px] font-mono text-slate-450 dark:text-slate-500 uppercase tracking-wider block mt-0.5">
                    Category: {g.category} • Target: {g.targetCount} {g.frequency === 'daily' ? 'hrs/day' : 'tasks/wk'}
                  </span>
                </div>
              </div>

              {g.currentStreak > 0 && (
                <div className="flex items-center gap-1 text-orange-500 bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded-lg border border-orange-250/20">
                  <Flame className="w-3.5 h-3.5 fill-current animate-pulse" />
                  <span className="text-[10px] font-mono font-bold">{g.currentStreak} Day Streak</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

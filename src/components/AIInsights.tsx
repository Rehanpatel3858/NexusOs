import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Brain, Sparkles, Cpu, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export const AIInsights: React.FC = () => {
  const { tasks, events } = useApp();
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const unresolvedHighTasks = tasks.filter((t) => !t.completed && t.priority === 'high');
  const finishedTasks = tasks.filter((t) => t.completed).length;
  const isDrop = finishedTasks === 0;

  // Compile intelligence vectors based on active task attributes
  const insights = [
    {
      id: 'ins-1',
      title: 'Urgent Queue Saturation',
      desc: unresolvedHighTasks.length > 0 
        ? `You have ${unresolvedHighTasks.length} urgent tasks pending. Prioritize these to keep your timeline synchronized.`
        : "Excellent work! Red priority queues are fully empty. Bandwidth yields optimal parameters.",
      type: 'warning',
      metric: unresolvedHighTasks.length > 0 ? 'Urgent Priority Warning' : 'No Critical Queues'
    },
    {
      id: 'ins-2',
      title: 'Task Prioritization Advice',
      desc: tasks.some((t) => !t.completed && t.priority === 'low')
        ? 'Consider re-evaluating low-priority work today. Re-allocate effort to higher complexity tasks.'
        : 'All current active queues represent high leverage deliverables. Continue with focus roadmap.',
      type: 'tip',
      metric: 'Work Allocation Index'
    },
    {
      id: 'ins-3',
      title: 'Productivity Trend Shift',
      desc: isDrop 
        ? 'Your productivity dropped by 12% compared to historical baselines. Revitalize completion rates.'
        : 'Your productivity metrics are stable. Active streak indexes show high mental endurance.',
      type: isDrop ? 'negative' : 'positive',
      metric: isDrop ? 'Throughput Drop 12%' : 'Baseline Sustained'
    },
    {
      id: 'ins-4',
      title: 'Cognitive Block Allocation',
      desc: events.filter(e => e.category === 'Work').length < 2
        ? 'Schedule deep work tomorrow. Dedicate a contiguous 2-hour container for intensive focus sprints.'
        : 'High density meetings scheduled. Ensure adequate hydration recovery slots between blocks.',
      type: 'schedule',
      metric: 'Deep Work Suggestion'
    }
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setHasGenerated(true);
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-4 text-left" id="ai-insights-container">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Brain className="w-4.5 h-4.5 text-indigo-500" />
          <h3 className="font-display font-bold text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-505">
            AI INSIGHTS
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-250/20 text-[9px] font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" /> Core IQ Active
        </span>
      </div>

      {!hasGenerated ? (
        <div className="flex flex-col items-center justify-center p-6 py-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-500">
            <Cpu className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">Insights Matrix Empty</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-[200px] leading-relaxed">
              Generate cognitive insights based on your active tasks, goals, and calendar items.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="mt-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing matrix...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Insights</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, idx) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              whileHover={{ y: -6 }}
              className="p-3.5 rounded-xl border border-slate-200/40 dark:border-slate-800/10 bg-[#F5F3FF] dark:bg-indigo-950/25 border-l-4 border-l-[#6D4AFF] dark:border-l-[#818CF8] shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-display font-bold text-xs text-slate-850 dark:text-slate-100">
                  {insight.title}
                </span>
                <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded ${
                  insight.type === 'warning'
                    ? 'bg-red-50 text-red-655 dark:bg-red-950/20 dark:text-red-400'
                    : insight.type === 'negative'
                    ? 'bg-orange-50 text-orange-655 dark:bg-orange-950/20 dark:text-orange-400'
                    : 'bg-indigo-50 text-indigo-650 dark:bg-indigo-950/20 dark:text-indigo-400'
                }`}>
                  {insight.metric}
                </span>
              </div>
              <p className="text-[11px] tracking-wide text-slate-500 dark:text-slate-405 leading-relaxed font-sans">
                {insight.desc}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

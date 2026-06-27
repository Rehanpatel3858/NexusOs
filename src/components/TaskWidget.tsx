import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { CheckSquare, Square, Trash2, Plus, Filter, Tag, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const TaskWidget: React.FC = () => {
  const { tasks, addTask, toggleTask, deleteTask } = useApp();
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newCategory, setNewCategory] = useState('Inbox');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('pending');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTask(newTitle, newPriority, newCategory, newDesc);
    setNewTitle('');
    setNewDesc('');
    setNewPriority('medium');
    setNewCategory('Inbox');
    setShowAddForm(false);
  };

  // Filter lists based on active subtabs
  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return !t.completed;
    if (activeTab === 'completed') return t.completed;
    return true;
  });

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-550 border-red-200 dark:border-red-950/40 bg-red-50/50 dark:bg-red-950/20';
      case 'medium':
        return 'text-amber-550 border-amber-200 dark:border-amber-950/40 bg-amber-50/50 dark:bg-amber-950/20';
      default:
        return 'text-slate-500 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30';
    }
  };

  return (
    <div className="flex flex-col pro-card p-6 h-full text-left" id="tasks">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-[#6D4AFF] dark:text-[#818CF8]" />
          <h2 className="font-display font-bold text-base text-slate-900 dark:text-white uppercase tracking-tight">Active Deliverables</h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6D4AFF] dark:bg-[#818CF8] hover:opacity-90 text-white text-xs font-semibold cursor-pointer active:scale-95 transition-all shadow-md shadow-[#6D4AFF]/10"
          id="toggle-add-task-btn"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>
      </div>

      {/* COMPACT FLOATING TASK CREATION FORM */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="p-4 mb-6 border border-slate-100 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-950/25 space-y-3 overflow-hidden text-left"
            id="task-create-field-set"
          >
            <div>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Task title (e.g., Code API endpoints)"
                className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-indigo-500 outline-none text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Optional task documentation or sub-tasks..."
                className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-indigo-500 outline-none text-slate-800 dark:text-white h-14 resize-none"
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="flex-1 min-w-[120px]">
                <label className="block text-[9px] font-mono text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-700 dark:text-slate-300"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div className="flex-1 min-w-[120px]">
                <label className="block text-[9px] font-mono text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-1">Category</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Design, Build"
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-700 dark:text-slate-300"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] text-slate-500 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition cursor-pointer"
              >
                Assemble Task
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* FILTER TABS */}
      <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 mb-4 h-10 shrink-0 font-sans">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 h-full text-xs font-semibold cursor-pointer border-b-2 transition ${
            activeTab === 'pending'
              ? 'border-[#6D4AFF] text-[#6D4AFF] dark:border-[#818CF8] dark:text-[#818CF8]'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          Pending ({tasks.filter((t) => !t.completed).length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 h-full text-xs font-semibold cursor-pointer border-b-2 transition ${
            activeTab === 'completed'
              ? 'border-[#6D4AFF] text-[#6D4AFF] dark:border-[#818CF8] dark:text-[#818CF8]'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          Completed ({tasks.filter((t) => t.completed).length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-2.5 h-full text-xs font-semibold cursor-pointer border-b-2 transition ${
            activeTab === 'all'
              ? 'border-[#6D4AFF] text-[#6D4AFF] dark:border-[#818CF8] dark:text-[#818CF8]'
              : 'border-transparent text-slate-400 hover:text-slate-600/60 dark:hover:text-slate-300'
          }`}
        >
          All Matrix
        </button>
      </div>

      {/* DELIVERABLES LIST SCROLL CONTAINER */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/50 max-h-[400px] overflow-y-auto pr-1">
        {filteredTasks.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">
            No active deliverables matched this status filter.
          </div>
        ) : (
          filteredTasks.map((t) => (
            <motion.div
              layout
              key={t.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`py-3.5 flex items-start justify-between gap-3 group transition ${t.completed ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <button
                  onClick={() => toggleTask(t.id)}
                  className="p-0.5 mt-0.5 text-slate-400 hover:text-indigo-500 cursor-pointer transition shrink-0"
                >
                  {t.completed ? (
                    <CheckSquare className="w-4.5 h-4.5 text-indigo-605 text-indigo-600" />
                  ) : (
                    <Square className="w-4.5 h-4.5" />
                  )}
                </button>

                <div className="flex flex-col min-w-0 text-left">
                  <span className={`text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed truncate ${t.completed ? 'line-through text-slate-400 dark:text-slate-650' : ''}`}>
                    {t.title}
                  </span>
                  {t.description && !t.completed && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-normal font-sans">
                      {t.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-[9px] font-mono font-semibold">
                    <span className={`px-2 py-0.5 rounded border text-[8px] uppercase ${getPriorityStyle(t.priority)}`}>
                      {t.priority}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500 capitalize">
                      <Tag className="w-2.5 h-2.5" /> {t.category}
                    </span>
                    <span className="text-slate-350 dark:text-slate-705">•</span>
                    <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                      <Clock className="w-2.5 h-2.5" /> {t.dueDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trash operation */}
              <button
                onClick={() => deleteTask(t.id)}
                className="p-1 px-1.5 text-slate-350 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer transition shrink-0 md:opacity-0 group-hover:opacity-100"
                title="Delete task asset"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { CalendarRange, Clock, MapPin, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AgendaCard: React.FC = () => {
  const { events, tasks, addEvent } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [category, setCategory] = useState<'Work' | 'Study' | 'Meeting' | 'Personal' | 'Health' | 'Important'>('Meeting');
  const [location, setLocation] = useState('');

  // Filter Today's schedules
  const todayStr = '2026-06-23'; // Fixed baseline matching User Session metadata date
  const todayEvents = events.filter((e) => e.date === todayStr);
  const pendingTasksDueToday = tasks.filter((t) => !t.completed && t.dueDate === todayStr);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addEvent({
      title,
      description: 'Quick added agenda item',
      date: todayStr,
      startTime,
      endTime,
      priority: 'medium',
      category,
      reminder: '15 min before',
      recurring: 'none',
      location: location.trim() || undefined,
      color: category === 'Meeting' ? '#6D4AFF' : category === 'Work' ? '#EF4444' : '#10B981'
    });

    setTitle('');
    setLocation('');
    setShowForm(false);
  };

  return (
    <div className="flex flex-col gap-4 text-left" id="today-agenda-container">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CalendarRange className="w-4.5 h-4.5 text-indigo-500" />
          <h3 className="font-display font-bold text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
            TODAY'S AGENDA
          </h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 text-slate-450 hover:text-indigo-500 transition cursor-pointer"
          title="Add Agenda Item"
        >
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-850 rounded-xl space-y-2 text-xs overflow-hidden"
          >
            <div>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Event Title (e.g. Project Sync)"
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[8px] text-slate-400 uppercase mb-0.5">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-[10px]"
                />
              </div>
              <div>
                <label className="block text-[8px] text-slate-400 uppercase mb-0.5">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-[10px]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[8px] text-slate-400 uppercase mb-0.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-[10px]"
                >
                  <option value="Meeting">Meeting</option>
                  <option value="Work">Work</option>
                  <option value="Study">Study</option>
                  <option value="Personal">Personal</option>
                  <option value="Important">Important</option>
                </select>
              </div>
              <div>
                <label className="block text-[8px] text-slate-400 uppercase mb-0.5">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Zoom / Room 1"
                  className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-[10px]"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-550 text-white font-semibold rounded-lg transition"
            >
              Add Agenda Item
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {/* Render consolidated meetings lists */}
        {todayEvents.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            No meetings scheduled today.
          </div>
        ) : (
          <div className="space-y-4">
            {todayEvents.map((ev, idx) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="flex items-start gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800/40 last:border-b-0 last:pb-0"
              >
                {/* Left Time Sector */}
                <div className="w-[52px] shrink-0 font-sans font-bold text-[12px] text-[#6D4AFF] dark:text-[#818CF8] pt-0.5">
                  {ev.startTime}
                </div>

                {/* Right Details Sector */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-sans font-semibold text-xs text-slate-800 dark:text-slate-200 leading-snug">
                      {ev.title}
                    </span>
                    <span
                      className="text-[9px] uppercase font-mono tracking-wider font-bold shrink-0 px-1.5 py-0.5 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-500"
                      style={{ color: ev.color || '#6D4AFF' }}
                    >
                      {ev.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                    <span className="font-medium">Ends {ev.endTime}</span>
                    {ev.location && (
                      <div className="flex items-center gap-1 max-w-[140px]">
                        <MapPin className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{ev.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Display pending task deadlines */}
        {pendingTasksDueToday.length > 0 && (
          <div className="mt-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold block mb-2">
              Deliverables Due Today
            </span>
            <div className="space-y-2">
              {pendingTasksDueToday.map((t) => (
                <div key={t.id} className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-900/30 text-[11px] text-slate-655 dark:text-slate-350">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span className="font-semibold truncate flex-1">{t.title}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 font-semibold text-right">
                    DUE TODAY
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

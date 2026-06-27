import React, { useState } from 'react';
import { CalendarEvent, Priority, EventCategory } from '../types';
import { X, Calendar, Clock, MapPin, Tag, Palette, Bell, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface CalendarEventModalProps {
  event?: CalendarEvent | null; // If populated, we are editing; else creating
  selectedDate?: string;
  selectedTime?: string;
  onSave: (event: Omit<CalendarEvent, 'id'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

export const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  event,
  selectedDate,
  selectedTime,
  onSave,
  onDelete,
  onClose
}) => {
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [date, setDate] = useState(event?.date || selectedDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(event?.startTime || selectedTime || '10:00');
  const [endTime, setEndTime] = useState(event?.endTime || '11:00');
  const [priority, setPriority] = useState<Priority>(event?.priority || 'medium');
  const [category, setCategory] = useState<EventCategory>(event?.category || 'Work');
  const [reminder, setReminder] = useState(event?.reminder || '15 min before');
  const [recurring, setRecurring] = useState<'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'>(event?.recurring || 'none');
  const [location, setLocation] = useState(event?.location || '');
  const [color, setColor] = useState(event?.color || '#6D4AFF');

  const colorPresets = [
    { value: '#6D4AFF', label: 'Primary Purple' },
    { value: '#10B981', label: 'Emerald Green' },
    { value: '#F59E0B', label: 'Amber Orange' },
    { value: '#EF4444', label: 'Critical Red' },
    { value: '#3B82F6', label: 'Ocean Blue' },
    { value: '#8B5CF6', label: 'Insight Violet' }
  ];

  const categories: EventCategory[] = ['Work', 'Study', 'Meeting', 'Personal', 'Health', 'Important'];

  const reminders = [
    'none',
    '5 min before',
    '15 min before',
    '30 min before',
    '1 hour before',
    '1 day before'
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: event?.id, // Includes id if editing
      title,
      description,
      date,
      startTime,
      endTime,
      priority,
      category,
      reminder,
      recurring,
      location,
      color
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-805 shadow-2xl overflow-hidden p-6 text-left relative"
        id="calendar-event-modal"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-display font-bold text-sm tracking-wide text-slate-850 dark:text-white uppercase">
            {event ? 'Edit Matrix Event' : 'Schedule Matrix Event'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 px-1.5 text-slate-400 hover:text-indigo-500 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4 mt-4">
          {/* TITLE */}
          <div>
            <label className="block text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              Event Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. NexusOS Architecture Alignment"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850 rounded-xl focus:border-indigo-500 outline-none text-slate-800 dark:text-white placeholder-slate-400"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Examine deliverable metrics and keyframe velocities..."
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850 rounded-xl focus:border-indigo-500 outline-none text-slate-800 dark:text-white h-20 resize-none placeholder-slate-400"
            />
          </div>

          {/* DATE & TIME COLUMNS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-705 dark:text-slate-300"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-755 dark:text-slate-300"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> End Time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-755 dark:text-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* EVENT CATEGORY */}
            <div>
              <label className="block text-[10px] font-mono text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Event Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-755 dark:text-slate-300"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* EVENT PRIORITY */}
            <div>
              <label className="block text-[10px] font-mono text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-755 dark:text-slate-300"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* EVENT REMINDER */}
            <div>
              <label className="block text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Bell className="w-3.5 h-3.5" /> Reminder Time
              </label>
              <select
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-755 dark:text-slate-300"
              >
                {reminders.map((rem) => (
                  <option key={rem} value={rem}>
                    {rem === 'none' ? 'No Reminder' : rem}
                  </option>
                ))}
              </select>
            </div>

            {/* RECURRING RULE */}
            <div>
              <label className="block text-[10px] font-mono text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-1 flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" /> Recurring Options
              </label>
              <select
                value={recurring}
                onChange={(e) => setRecurring(e.target.value as any)}
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-slate-755 dark:text-slate-300"
              >
                <option value="none">One-time event</option>
                <option value="daily">Daily schedule loop</option>
                <option value="weekly">Weekly meeting grid</option>
                <option value="monthly">Monthly audit loop</option>
                <option value="yearly">Yearly review block</option>
              </select>
            </div>
          </div>

          {/* PHYSICAL LOCATION */}
          <div>
            <label className="block text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Location / Meeting URL
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Design Studio B, Encrypted Terminal 7"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-952/50 border border-slate-200 dark:border-slate-850 rounded-xl focus:border-indigo-500 outline-none text-slate-800 dark:text-white placeholder-slate-400"
            />
          </div>

          {/* COLOR PALETTE PRESETS */}
          <div>
            <label className="block text-[10px] font-mono text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5" /> Visual Color Node
            </label>
            <div className="flex gap-2 flex-wrap">
              {colorPresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setColor(preset.value)}
                  style={{ backgroundColor: preset.value }}
                  className={`w-6 h-6 rounded-full transition cursor-pointer relative flex items-center justify-center ${
                    color === preset.value ? 'scale-110 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : 'hover:opacity-80'
                  }`}
                  title={preset.label}
                >
                  {color === preset.value && (
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* SAVE/CLOSE/DELETE BUTTON PANEL */}
          <div className="flex justify-between items-center pt-5 border-t border-slate-100 dark:border-slate-800">
            {event && onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(event.id)}
                className="px-3 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition active:scale-95"
                id="delete-event-modal-btn"
              >
                Delete Event
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-505 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md cursor-pointer transition active:scale-95"
                id="save-event-modal-btn"
              >
                Save Event
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

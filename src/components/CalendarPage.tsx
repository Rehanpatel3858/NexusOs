import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { CalendarEvent } from '../types';
import { ChevronLeft, ChevronRight, Plus, MapPin, Tag, Clock, Bell, RefreshCw, Calendar as CalendarIcon, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarEventModal } from './CalendarEventModal';

export const CalendarPage: React.FC = () => {
  const { events, addEvent, updateEvent, deleteEvent } = useApp();

  // Selected date state (defaults to baseline 2026-06-23 Tuesday)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 5, 23)); // June is 5 index
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('week');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSlot, setModalSlot] = useState<{ date: string; time: string } | null>(null);

  const hours = Array.from({ length: 18 }, (_, idx) => idx + 6); // 6am to 11pm (23:00)
  
  // Format dates cleanly
  const formatDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getWeekDays = (centerDate: Date) => {
    const startOfWeek = new Date(centerDate);
    const day = startOfWeek.getDay(); // 0 is Sun, 6 is Sat
    startOfWeek.setDate(startOfWeek.getDate() - day); // Roll back to Sun
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  const weekDays = getWeekDays(currentDate);

  const formatWeekRangeHeader = () => {
    const first = weekDays[0];
    const last = weekDays[6];
    const optionMonth: Intl.DateTimeFormatOptions = { month: 'short' };
    const labelFirst = first.toLocaleDateString('en-US', optionMonth);
    const labelLast = last.toLocaleDateString('en-US', optionMonth);
    
    if (labelFirst === labelLast) {
      return `${labelFirst} ${first.getDate()} – ${last.getDate()}, ${first.getFullYear()}`;
    }
    return `${labelFirst} ${first.getDate()} – ${labelLast} ${last.getDate()}, ${first.getFullYear()}`;
  };

  const navigateTime = (direction: 'prev' | 'next') => {
    const nextDate = new Date(currentDate);
    if (viewMode === 'day') {
      nextDate.setDate(nextDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      nextDate.setDate(nextDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      nextDate.setMonth(nextDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(nextDate);
  };

  const setToday = () => {
    setCurrentDate(new Date(2026, 5, 23)); // Set back to baseline
  };

  // Click slot handler
  const handleSlotClick = (dateStr: string, timeHour: number) => {
    const formattedHour = `${String(timeHour).padStart(2, '0')}:00`;
    setModalSlot({ date: dateStr, time: formattedHour });
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (e: React.MouseEvent, ev: CalendarEvent) => {
    e.stopPropagation();
    setSelectedEvent(ev);
    setModalSlot(null);
    setIsModalOpen(true);
  };

  const handleModalSave = (eventPayload: Omit<CalendarEvent, 'id'> & { id?: string }) => {
    if (eventPayload.id) {
      updateEvent(eventPayload as CalendarEvent);
    } else {
      addEvent(eventPayload);
    }
    setIsModalOpen(false);
  };

  const handleModalDelete = (id: string) => {
    deleteEvent(id);
    setIsModalOpen(false);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto p-4 md:p-6" id="calendar-view">
      
      {/* CALENDAR HEADER CARD */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-5 rounded-2xl glass bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-805 mb-6 shadow-sm">
        {/* LEFT NAV BOX */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-0.5 bg-slate-50 dark:bg-slate-950">
            <button
              onClick={() => navigateTime('prev')}
              className="p-1 px-1.5 hover:bg-white dark:hover:bg-slate-900 rounded-lg text-slate-500 hover:text-indigo-500 cursor-pointer transition"
              title="Previous interval"
              id="calendar-prev-btn"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={setToday}
              className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-350 hover:text-indigo-505 cursor-pointer shadow-sm"
              id="calendar-today-btn"
            >
              Today
            </button>
            <button
              onClick={() => navigateTime('next')}
              className="p-1 px-1.5 hover:bg-white dark:hover:bg-slate-900 rounded-lg text-slate-500 hover:text-indigo-500 cursor-pointer transition"
              title="Next interval"
              id="calendar-next-btn"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <h1 className="font-display font-bold text-sm md:text-base text-slate-900 dark:text-white uppercase tracking-wider" id="calendar-date-range">
            {viewMode === 'day' 
              ? currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
              : viewMode === 'month'
              ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
              : formatWeekRangeHeader()
            }
          </h1>
        </div>

        {/* RIGHT VIEW SWITCHER */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 p-1">
            {['month', 'week', 'day', 'agenda'].map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v as any)}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  viewMode === v
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
                }`}
                id={`calendar-view-${v}`}
              >
                {v}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setSelectedEvent(null);
              setModalSlot(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-505 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-md active:scale-95 transition"
            id="create-event-top-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Event</span>
          </button>
        </div>
      </div>

      {/* CALENDAR ACTIVE SCHEDULER VIEWPORT */}
      <div className="rounded-3xl glass bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-805 overflow-hidden shadow-md">
        
        {/* WEEK VIEW SCHEDULER */}
        {viewMode === 'week' && (
          <div className="flex flex-col w-full text-left overflow-x-auto">
            {/* Header day columns */}
            <div className="flex border-b border-slate-100 dark:border-slate-800/80 sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 ml-[60px] min-w-[700px]">
              {weekDays.map((day) => {
                const dateStr = formatDateString(day);
                const isToday = dateStr === '2026-06-23'; // Highlight Tuesday, June 23

                return (
                  <div
                    key={day.toISOString()}
                    className={`flex-1 text-center py-4 border-r border-slate-100 dark:border-slate-800/50 flex flex-col items-center ${isToday ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''}`}
                  >
                    <span className="text-[10px] font-mono tracking-wider text-slate-400 dark:text-slate-500 uppercase font-semibold">
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold tracking-tight mt-1 ${
                      isToday 
                        ? 'bg-[#6D4AFF] dark:bg-[#818CF8] text-white shadow-md' 
                        : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {day.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Scrollable Hourly Row Grids */}
            <div className="max-h-[600px] overflow-y-auto flex flex-col min-w-[760px] relative">
              {hours.map((hour) => (
                <div key={hour} className="flex h-16 border-b border-slate-55 dark:border-slate-800/25 relative group">
                  {/* Left hour visual index indicator */}
                  <div className="w-[60px] pr-3 flex justify-end text-[9px] font-mono font-semibold text-slate-400 select-none pt-1">
                    {String(hour % 12 || 12).padStart(2, '0')} {hour >= 12 ? 'PM' : 'AM'}
                  </div>

                  {/* Day specific slots inside the hour block */}
                  <div className="flex-1 flex">
                    {weekDays.map((day) => {
                      const dateStr = formatDateString(day);
                      const isToday = dateStr === '2026-06-23';
                      
                      // Match events overlay in this slot
                      const hourlyEvents = events.filter((ev) => {
                        if (ev.date !== dateStr) return false;
                        const evStartHour = parseInt(ev.startTime.split(':')[0]);
                        return evStartHour === hour;
                      });

                      return (
                        <div
                          key={day.toISOString()}
                          onClick={() => handleSlotClick(dateStr, hour)}
                          className={`flex-1 border-r border-slate-100 dark:border-slate-800/20 hover:bg-slate-50/50 dark:hover:bg-slate-850/10 transition relative cursor-pointer group-hover:border-slate-200 ${
                            isToday ? 'bg-indigo-50/5 dark:bg-indigo-950/2' : ''
                          }`}
                        >
                          {/* Floating scheduled event items */}
                          {hourlyEvents.map((ev) => (
                            <div
                              key={ev.id}
                              onClick={(e) => handleEventClick(e, ev)}
                              style={{ borderLeftColor: ev.color || '#6D4AFF' }}
                              className="absolute inset-x-1.5 top-1 bottom-1 p-2 rounded-lg border-l-4 text-left cursor-pointer hover:brightness-95 hover:shadow-md transition bg-indigo-50/90 dark:bg-slate-950/80 z-20 overflow-hidden"
                            >
                              <div className="font-sans font-semibold text-[10px] text-slate-900 dark:text-white truncate">
                                {ev.title}
                              </div>
                              <div className="text-[8px] font-mono text-slate-400 mt-1 flex items-center justify-between">
                                <span>{ev.startTime} – {ev.endTime}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DAY VIEW SCRIPT */}
        {viewMode === 'day' && (
          <div className="flex flex-col w-full text-left max-h-[600px] overflow-y-auto">
            {hours.map((hour) => {
              const dateStr = formatDateString(currentDate);
              const hourlyEvents = events.filter((ev) => {
                if (ev.date !== dateStr) return false;
                const evStartHour = parseInt(ev.startTime.split(':')[0]);
                return evStartHour === hour;
              });

              return (
                <div
                  key={hour}
                  onClick={() => handleSlotClick(dateStr, hour)}
                  className="flex min-h-20 border-b border-slate-100 dark:border-slate-800/50 relative hover:bg-slate-50/30 dark:hover:bg-slate-900/10 cursor-pointer"
                >
                  <div className="w-[80px] p-4 text-right text-xs font-mono font-semibold text-slate-400 select-none">
                    {String(hour % 12 || 12).padStart(2, '0')}:00 {hour >= 12 ? 'PM' : 'AM'}
                  </div>

                  <div className="flex-1 p-3 flex gap-3 flex-wrap">
                    {hourlyEvents.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={(e) => handleEventClick(e, ev)}
                        style={{ borderLeftColor: ev.color }}
                        className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 border-l-4 bg-slate-50/50 dark:bg-slate-950/20 text-xs min-w-[200px] flex-1 hover:shadow-lg transition cursor-pointer flex flex-col text-left justify-between"
                      >
                        <div>
                          <div className="font-sans font-bold text-slate-850 dark:text-slate-105 truncate">
                            {ev.title}
                          </div>
                          {ev.description && (
                            <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                              {ev.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-3 text-[9px] font-mono text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {ev.startTime} – {ev.endTime}
                          </span>
                          {ev.location && (
                            <span className="flex items-center gap-1 text-slate-400 truncate max-w-[150px]">
                              <MapPin className="w-3 h-3" /> {ev.location}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MONTH GRID VIEW */}
        {viewMode === 'month' && (
          <div className="w-full overflow-x-auto">
            <div className="flex flex-col min-w-[600px] text-left" id="month-grid-wrapper">
              <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-850 text-center font-mono text-[10px] tracking-wider text-slate-400 uppercase font-semibold py-3 bg-slate-50/50 dark:bg-slate-950/30">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

            <div className="grid grid-cols-7 grid-rows-5 h-[500px] divide-x divide-y divide-slate-100 dark:divide-slate-800/40 border-l border-t border-slate-100 dark:border-slate-850">
              {/* Build traditional 35 matrix points relative to current Date scope */}
              {Array.from({ length: 35 }).map((_, idx) => {
                const dayNum = (idx % 31) + 1; // Simulated days
                const dateStr = `2026-06-${String(dayNum).padStart(2, '0')}`;
                const isToday = dateStr === '2026-06-23';
                const dayEvents = events.filter((e) => e.date === dateStr);

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setModalSlot({ date: dateStr, time: '09:00' });
                      setSelectedEvent(null);
                      setIsModalOpen(true);
                    }}
                    className={`p-3 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 cursor-pointer flex flex-col justify-between transition min-h-20 ${
                      isToday ? 'bg-indigo-50/10 dark:bg-indigo-950/5' : ''
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isToday 
                        ? 'bg-[#6D4AFF] dark:bg-[#818CF8] text-white shadow-sm' 
                        : 'text-slate-500'
                    }`}>
                      {dayNum}
                    </div>

                    <div className="space-y-1 mt-2 overflow-hidden max-h-16">
                      {dayEvents.map((ev) => (
                        <div
                          key={ev.id}
                          onClick={(e) => handleEventClick(e, ev)}
                          className="px-1.5 py-0.5 rounded text-[8px] font-sans font-semibold text-white truncate hover:brightness-95 transition"
                          style={{ backgroundColor: ev.color }}
                        >
                          {ev.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

        {/* CHRONOLOGICAL AGENDA LIST VIEW */}
        {viewMode === 'agenda' && (
          <div className="p-6 text-left max-h-[5000px] h-[550px] overflow-y-auto space-y-4">
            <h2 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-550" /> Upcoming chronological events list
            </h2>

            {events.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No upcoming bookings recorded.
              </div>
            ) : (
              [...events]
                .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
                .map((ev) => (
                  <motion.div
                    key={ev.id}
                    onClick={(e) => handleEventClick(e, ev)}
                    whileHover={{ y: -4 }}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-805 hover:border-indigo-500/20 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 text-left relative overflow-hidden"
                  >
                    {/* Visual left edge highlighting color */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: ev.color }} />

                    <div className="flex items-start gap-4">
                      <div className="flex flex-col text-center border-r border-slate-100 dark:border-slate-800 pr-4 min-w-[70px]">
                        <span className="text-[10px] font-mono uppercase text-indigo-500 font-bold">
                          {new Date(ev.date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-xl font-display font-bold text-slate-800 dark:text-white">
                          {ev.date.split('-')[2]}
                        </span>
                      </div>

                      <div className="flex flex-col justify-between">
                        <span className="font-display font-bold text-xs text-slate-850 dark:text-white text-left">
                          {ev.title}
                        </span>
                        {ev.description && (
                          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed text-left">
                            {ev.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-[9px] font-mono text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {ev.startTime} – {ev.endTime}
                          </span>
                          {ev.location && (
                            <span className="flex items-center gap-1 text-slate-400 max-w-[200px] truncate">
                              <MapPin className="w-3 h-3" /> {ev.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                      <span className="px-2.5 py-0.5 rounded-full border text-[8px] uppercase tracking-wide font-bold" style={{ borderColor: `${ev.color}30`, color: ev.color }}>
                        {ev.category}
                      </span>
                      {ev.recurring !== 'none' && (
                        <span className="p-1 rounded bg-slate-50 dark:bg-slate-950 text-slate-400" title="Recurring Event">
                          <RefreshCw className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
            )}
          </div>
        )}
      </div>

      {/* RENDER MODAL POPUP IF ACTIVE */}
      <AnimatePresence>
        {isModalOpen && (
          <CalendarEventModal
            event={selectedEvent}
            selectedDate={modalSlot?.date}
            selectedTime={modalSlot?.time}
            onSave={handleModalSave}
            onDelete={handleModalDelete}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

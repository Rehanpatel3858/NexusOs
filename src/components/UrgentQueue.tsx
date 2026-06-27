import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { AlertTriangle, CheckSquare, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'motion/react';

export const UrgentQueue: React.FC = () => {
  const { tasks, toggleTask } = useApp();

  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('urgent_alarm_muted') === 'true';
  });

  // Filter incomplete tasks with High priority
  const highPriorityTasks = tasks.filter((t) => !t.completed && t.priority === 'high');

  // Audio effect alert loops
  useEffect(() => {
    if (highPriorityTasks.length === 0 || isMuted) return;

    // Build web oscillator context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioCtx = new AudioContextClass();

    const playBeep = () => {
      try {
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        // Louder Double-chime notification sound
        const playTone = (freq: number, delay: number, duration: number) => {
          const osc = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();

          osc.type = 'triangle'; // Triangle wave cuts through laptop speakers much better
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
          gainNode.gain.setValueAtTime(1.0, audioCtx.currentTime + delay); // Maximized volume (100% gain)
          
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);

          osc.connect(gainNode);
          gainNode.connect(audioCtx.destination);

          osc.start(audioCtx.currentTime + delay);
          osc.stop(audioCtx.currentTime + delay + duration);
        };

        // Continuous digital alarm style double beep
        playTone(659.25, 0, 0.08);     // E5 chime 1
        playTone(659.25, 0.15, 0.08);  // E5 chime 2
      } catch (err) {
        console.warn("AudioContext playback blocked by user interaction gesture", err);
      }
    };

    // Cycle beep alerts rapidly every 1.5 seconds for a continuous alarm feel
    const interval = setInterval(playBeep, 1500);
    playBeep(); // Trigger initial alert

    return () => {
      clearInterval(interval);
      audioCtx.close();
    };
  }, [highPriorityTasks.length, isMuted]);

  return (
    <div className="flex flex-col gap-4 text-left" id="urgent-queue-container">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4.5 h-4.5 text-rose-500" />
          <h3 className="font-display font-bold text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
            URGENT QUEUE
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              localStorage.setItem('urgent_alarm_muted', String(nextMuted));
            }}
            className={`p-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider transition flex items-center gap-1 cursor-pointer ${
              isMuted
                ? 'border-slate-200 dark:border-slate-800 text-slate-450 dark:text-slate-500 hover:text-slate-650'
                : 'border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30'
            }`}
            title={isMuted ? "Unmute Alarm Sound" : "Mute Alarm Sound"}
          >
            {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 animate-bounce" />}
            <span>{isMuted ? 'Muted' : 'Alarm'}</span>
          </button>
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-red-500 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-full shrink-0">
            {highPriorityTasks.length} Pending
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {highPriorityTasks.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400" id="empty-queue-alert">
            All critical priorities cleared! Bandwidth is operating normally.
          </div>
        ) : (
          highPriorityTasks.map((task, idx) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="flex items-start gap-3 p-3.5 rounded-xl border bg-red-50/20 dark:bg-red-950/10 border-red-400 dark:border-red-800 shadow-[0_0_15px_rgba(239,68,68,0.2)] dark:shadow-[0_0_15px_rgba(239,68,68,0.35)] animate-pulse hover:animate-none transition group text-left relative overflow-hidden"
            >
              {/* Soft red decorative left strip */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />

              <button
                onClick={() => toggleTask(task.id)}
                className="p-0.5 mt-0.5 hover:text-indigo-500 text-slate-355 hover:bg-slate-50 rounded cursor-pointer transition shrink-0"
                title="Mark task completed"
              >
                <div className="w-4 h-4 rounded border border-red-300 dark:border-red-900 group-hover:border-red-500 transition flex items-center justify-center text-[8px] font-bold text-red-500">
                  ⚠️
                </div>
              </button>

              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-sans font-semibold text-xs text-slate-800 dark:text-slate-100 truncate group-hover:text-red-500 dark:group-hover:text-red-450 transition">
                  {task.title}
                </span>
                {task.description && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate">
                    {task.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2 text-[9px] font-mono font-semibold">
                  <span className="flex items-center gap-1.5 text-red-500 uppercase">
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                    </span>
                    <span>HIGH PRIORITY</span>
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-slate-400 dark:text-slate-500 font-medium">DUE {task.dueDate}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

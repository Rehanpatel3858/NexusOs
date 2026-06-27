import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../AppContext';
import { Sparkles, Send, Paperclip, Image, X, Download, FileText, Cpu, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  attachment?: {
    name: string;
    type: 'image' | 'file';
    url: string;
  };
}

export const AIAssistantPage: React.FC = () => {
  const { user, tasks, addTask, toggleTask, deleteTask, updateTaskPriority } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Welcome to your Nexus AI workspace page! 🤖\n\nI am synchronized with your productivity matrix. You can ask me questions like:\n• 'How many tasks are pending?'\n• 'How to complete my work in time?'\n• Or upload any image/document for context analysis.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [attachment, setAttachment] = useState<{ name: string; type: 'image' | 'file'; url: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      setAttachment({
        name: file.name,
        type: isImage ? 'image' : 'file',
        url: URL.createObjectURL(file)
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && !attachment) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment: attachment || undefined
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setAttachment(null);
    setLoading(true);

    const query = userMsg.text.toLowerCase().trim();

    // Check if user is asking to add/create tasks (multiple parser)
    if (query.startsWith('add') || query.startsWith('create') || query.startsWith('insert')) {
      if (query.includes('task') || query.includes('wok') || query.includes('work')) {
        const cleaned = userMsg.text.replace(/^(?:add|create|insert|make)\s*(?:\d+)?\s*(?:tasks?|woks?|works?|jobs?)/i, '').trim();
        const items = cleaned.split(/(?:\b\d+\.|\b\d+\s*-\s*|\r?\n)/);
        const parsedTitles: string[] = [];

        items.forEach((item) => {
          const title = item.trim().replace(/^,\s*|\s*,$/g, '').trim();
          if (title.length > 2) {
            parsedTitles.push(title);
          }
        });

        if (parsedTitles.length <= 1 && cleaned.includes(',')) {
          const commaItems = cleaned.split(',');
          parsedTitles.length = 0;
          commaItems.forEach((item) => {
            const title = item.trim();
            if (title.length > 2) {
              parsedTitles.push(title);
            }
          });
        }

        if (parsedTitles.length > 0) {
          const addedList: string[] = [];
          parsedTitles.forEach((title) => {
            const isUrgent = title.toLowerCase().includes('urgent') || title.toLowerCase().includes('high');
            const cleanTitle = title.replace(/(?:urgent|high|priority)/gi, '').trim().replace(/^,\s*|\s*,$/g, '').trim();
            addTask(cleanTitle || title, isUrgent ? 'high' : 'medium', 'AI Workspace');
            addedList.push(`"${cleanTitle || title}" (${isUrgent ? 'High' : 'Medium'} priority)`);
          });

          setTimeout(() => {
            const aiMsg: ChatMessage = {
              id: `ai-${Date.now()}`,
              sender: 'ai',
              text: `✨ Successfully added ${parsedTitles.length} task(s) to your workflow:\n` + addedList.map((t, idx) => `${idx + 1}. ${t}`).join('\n'),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages((prev) => [...prev, aiMsg]);
            setLoading(false);
          }, 600);
          return;
        }
      }
    }

    // Complete/finish task command
    if (query.startsWith('complete') || query.startsWith('finish') || query.startsWith('done') || query.includes('mark completed') || query.includes('mark as completed')) {
      const titleQuery = userMsg.text.replace(/^(?:complete|finish|done|mark as completed|mark completed)\s*(?:task|work|wok)?/i, '').trim();
      if (titleQuery) {
        const matched = tasks.find(t => t.title.toLowerCase().includes(titleQuery.toLowerCase()) || titleQuery.toLowerCase().includes(t.title.toLowerCase()));
        if (matched) {
          if (!matched.completed) {
            toggleTask(matched.id);
          }
          setTimeout(() => {
            const aiMsg: ChatMessage = {
              id: `ai-${Date.now()}`,
              sender: 'ai',
              text: `✅ Task "${matched.title}" marked as completed successfully!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages((prev) => [...prev, aiMsg]);
            setLoading(false);
          }, 600);
          return;
        }
      }
    }

    // Delete/remove task command
    if (query.startsWith('delete') || query.startsWith('remove') || query.startsWith('cancel')) {
      const titleQuery = userMsg.text.replace(/^(?:delete|remove|cancel)\s*(?:task|work|wok)?/i, '').trim();
      if (titleQuery) {
        const matched = tasks.find(t => t.title.toLowerCase().includes(titleQuery.toLowerCase()) || titleQuery.toLowerCase().includes(t.title.toLowerCase()));
        if (matched) {
          deleteTask(matched.id);
          setTimeout(() => {
            const aiMsg: ChatMessage = {
              id: `ai-${Date.now()}`,
              sender: 'ai',
              text: `🗑️ Task "${matched.title}" has been deleted from your workspace.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages((prev) => [...prev, aiMsg]);
            setLoading(false);
          }, 600);
          return;
        }
      }
    }

    // Shift priority command
    if (query.includes('shift') || query.includes('change') || query.includes('set') || query.includes('priority') || query.includes('move')) {
      const isUrgent = query.includes('urgent') || query.includes('high');
      const isMedium = query.includes('medium') || query.includes('midiun') || query.includes('mid');
      const isLow = query.includes('low');

      if (isUrgent || isMedium || isLow) {
        const targetPriority = isUrgent ? 'high' : isMedium ? 'medium' : 'low';
        const matched = tasks.find(t => query.includes(t.title.toLowerCase()));
        if (matched) {
          updateTaskPriority(matched.id, targetPriority);
          setTimeout(() => {
            const aiMsg: ChatMessage = {
              id: `ai-${Date.now()}`,
              sender: 'ai',
              text: `⚡ Priority for task "${matched.title}" shifted to ${targetPriority.toUpperCase()}.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages((prev) => [...prev, aiMsg]);
            setLoading(false);
          }, 600);
          return;
        }
      }
    }

    try {
      const pendingTasks = tasks.filter(t => !t.completed);
      const aiSystemPrompt = `You are the NexusOS Core Intelligence companion.
Respond dynamically and concisely in a short, direct manner (usually 1-3 sentences maximum). If the user asks a question that requires a longer list or time management blueprint, format it with short bullet points.
Always prioritize answering user prompts directly and concisely.

Current Context:
- User: ${user?.name || 'Rehan'} (${user?.role || 'student'})
- Total Pending Tasks: ${pendingTasks.length}
- Pending Tasks List: ${JSON.stringify(pendingTasks.map(t => ({ title: t.title, priority: t.priority, dueDate: t.dueDate })))}

User Prompt: "${userMsg.text}"`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY || ''}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'NexusOS'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{ role: 'user', content: aiSystemPrompt }]
        })
      });

      if (!response.ok) {
        throw new Error("API Error");
      }

      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content || "Nexus AI: Connected, but returned an empty response vector.";
      
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      let replyText = '';
      const query = userMsg.text.toLowerCase().trim();

      // Check if user is asking to complete X tasks in Y time (highly forgiving regex)
      const numMatch = query.match(/(\d+)\s*(?:urgent|pending|task|work|wok|job|assignment|thing|item|goal)/i);
      const timeMatch = query.match(/(\d+)\s*(?:hr|hour|min)/i);
      
      if (numMatch && timeMatch) {
        const taskCount = parseInt(numMatch[1]);
        const timeVal = parseInt(timeMatch[1]);
        const timeUnit = query.includes('min') ? 'minutes' : 'hours';
        const totalMinutes = timeUnit === 'hours' ? timeVal * 60 : timeVal;
        const minutesPerTask = Math.floor(totalMinutes / taskCount);

        replyText = `To complete **${taskCount} work items** in **${timeVal} ${timeUnit}**, you have exactly **${minutesPerTask} minutes per item**. 

Here is your time management schedule:
1. **Strict Sprint**: Work for ${minutesPerTask} minutes on Task 1, then immediately pivot to Task 2.
2. **Prioritization**: Tackle the most urgent item first.
3. **Zero Distractions**: Close all chat channels and focus strictly on execution.`;
      } 
      // User asks for time management generally
      else if (query.includes('time') || query.includes('complete this') || query.includes('productivity') || query.includes('manage') || query.includes('comple this in time')) {
        replyText = `Here is a time management blueprint for your current workload:
• **Time Blocking**: Allocate specific blocks on your calendar for deep focus.
• **The Pomodoro Technique**: Work for 25 minutes, then take a 5-minute break to avoid fatigue.
• **Eat the Frog**: Complete your most difficult task first thing in the morning.
• **Parkinson's Law**: Set aggressive deadlines to minimize procrastination.`;
      }
      // General conversational & coding fallbacks
      else if (query.includes('code') || query.includes('javascript') || query.includes('react') || query.includes('html') || query.includes('python')) {
        replyText = "I can write and refactor code! Please paste your code block or describe what algorithm you need, and I'll generate it concisely.";
      } else if (query.startsWith('hello') || query.startsWith('hi ') || query === 'hi' || query.includes('hey')) {
        replyText = `Hello ${user?.name ? user.name.split(' ')[0] : 'Rehan'}! How can I assist you with your productivity matrix today?`;
      } else if (query.includes('what can you do') || query.includes('help') || query.includes('features')) {
        replyText = "I can analyze your workspace load, track pending tasks, calculate custom schedules based on time limits, and write/refactor code.";
      } else if (query.includes('joke')) {
        replyText = "Why do programmers wear glasses? Because they can't C#! 😄 Let me know if you need scheduling help next!";
      } else if (query.includes('thank') || query.includes('thanks')) {
        replyText = "You're very welcome! Stay focused and keep up the great velocity.";
      } else if (query.includes('write') || query.includes('create') || query.includes('make')) {
        replyText = "I can draft emails, project plans, meeting agendas, or notes. Please specify what you want to write!";
      } else if (userMsg.attachment) {
        replyText = `I parsed attachment "${userMsg.attachment.name}". What would you like to analyze or search inside it?`;
      } else {
        const activeCount = tasks.filter(t => !t.completed).length;
        replyText = `Nexus AI: Got it! You have ${activeCount} pending tasks in your workspace. Ask me to block out a schedule, calculate a task timeline, or write code to help you finish them!`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 pb-24 text-left">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] shadow-sm flex flex-col h-[75vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/15 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Brain className="w-5.5 h-5.5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-slate-850 dark:text-white">
                Nexus AI Workspace Assistant
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">REAL-TIME INTELLIGENCE FEED ENABLED</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border border-emerald-200/50 dark:border-emerald-900/50 text-[9px] font-mono font-bold uppercase tracking-wider">
            Online
          </span>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20 dark:bg-slate-950/10">
          {messages.map((msg) => {
            const isAi = msg.sender === 'ai';
            return (
              <div key={msg.id} className={`flex ${isAi ? 'justify-start' : 'justify-end'} gap-3 items-start`}>
                {isAi && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Cpu className="w-4 h-4" />
                  </div>
                )}
                <div className={`max-w-[75%] flex flex-col ${isAi ? 'items-start' : 'items-end'}`}>
                  <div className={`p-4 rounded-2xl text-xs shadow-xs leading-relaxed whitespace-pre-wrap ${
                    isAi
                      ? 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-205 rounded-tl-none'
                      : 'bg-indigo-600 text-white rounded-tr-none'
                  }`}>
                    {msg.text}

                    {/* Rendering Attachment */}
                    {msg.attachment && (
                      <div className="mt-3">
                        {msg.attachment.type === 'image' ? (
                          <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 max-h-48 max-w-sm">
                            <img src={msg.attachment.url} alt={msg.attachment.name} className="object-cover w-full h-full" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 text-[10px] font-mono text-slate-700 dark:text-slate-350">
                            <FileText className="w-4 h-4 text-indigo-500" />
                            <span className="truncate max-w-[150px] font-bold">{msg.attachment.name}</span>
                            <a href={msg.attachment.url} download={msg.attachment.name} className="text-indigo-500 hover:underline text-[9px] font-sans font-bold ml-2">Download</a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex justify-start gap-3 items-center">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-bounce">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5 text-indigo-500 font-medium text-xs">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          {/* Attachment Preview */}
          {attachment && (
            <div className="flex items-center justify-between p-2 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-200/30 rounded-xl text-xs">
              <span className="font-mono text-[10px] truncate text-indigo-650 dark:text-indigo-400">
                📎 Attachment ready ({attachment.type}): {attachment.name}
              </span>
              <button onClick={() => setAttachment(null)} className="text-red-500 hover:text-red-700 font-bold ml-2">Remove</button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <input
              type="file"
              id="ai-page-file-input"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => document.getElementById('ai-page-file-input')?.click()}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 rounded-xl transition cursor-pointer"
              title="Upload File or Photo"
            >
              <Paperclip className="w-4.5 h-4.5" />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask AI assistant about pending work, time management strategies..."
              className="flex-1 px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-850 dark:text-slate-100"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
            />
            <button
              onClick={handleSendMessage}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl shadow-md active:scale-95 transition cursor-pointer"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

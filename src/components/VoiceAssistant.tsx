import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, X, CornerDownLeft, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const VoiceAssistant: React.FC = () => {
  const { askAi, aiResponse, setAiResponse } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(false); // Default to chat-first (voice off by default)
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Initialize Web Speech API Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTextInput(transcript);
        handleSendPrompt(transcript);
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, []);



  // Text to speech reply
  useEffect(() => {
    if (aiResponse && voiceEnabled && aiResponse !== 'processing' && aiResponse !== 'prioritizing') {
      const cleanText = aiResponse.replace(/[*#_`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }, [aiResponse, voiceEnabled]);

  const toggleListening = () => {
    if (!recognition) {
      alert("Speech recognition is not supported on this browser version.");
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const handleSendPrompt = (promptText: string) => {
    if (!promptText.trim()) return;
    askAi(promptText);
    setTextInput('');
  };

  const handleSpeakText = () => {
    if (aiResponse) {
      const cleanText = aiResponse.replace(/[*#_`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-20 md:bottom-6 right-6 z-[999] flex flex-col items-end gap-3 font-sans">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-[320px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] shadow-2xl p-4 flex flex-col text-left mb-2"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                  <span className="font-display font-bold text-xs text-slate-850 dark:text-white uppercase tracking-wider">
                    Nexus AI Chat
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setVoiceEnabled(!voiceEnabled);
                      if (voiceEnabled) window.speechSynthesis.cancel();
                    }}
                    className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition"
                    title={voiceEnabled ? "Mute Speech Voice" : "Enable Speech Voice"}
                  >
                    {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-500" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setAiResponse(null);
                      window.speechSynthesis.cancel();
                    }}
                    className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Response screen */}
              <div className="flex-1 min-h-[100px] max-h-[200px] overflow-y-auto bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl mb-3 text-xs leading-relaxed text-slate-650 dark:text-slate-350">
                {aiResponse === 'processing' ? (
                  <div className="flex items-center gap-2 text-indigo-500 font-medium">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    <span>Processing command...</span>
                  </div>
                ) : aiResponse ? (
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-indigo-500 font-bold uppercase block">Nexus AI</span>
                    <p className="font-sans font-medium">{aiResponse}</p>
                    
                    {!voiceEnabled && (
                      <button
                        onClick={handleSpeakText}
                        className="mt-2 flex items-center gap-1 text-[10px] text-indigo-500 hover:text-indigo-650 font-bold cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" /> Listen to response
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">
                    Type a prompt below to chat with Nexus AI, or speak using the mic button.
                  </p>
                )}
              </div>

              {/* Action input bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt(textInput)}
                  placeholder={isListening ? "Listening closely..." : "Ask Nexus AI..."}
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-xl text-xs outline-none focus:border-indigo-500 text-slate-850 dark:text-slate-100"
                />
                
                {recognition && (
                  <button
                    onClick={toggleListening}
                    className={`p-2 rounded-xl transition cursor-pointer ${
                      isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-350 hover:bg-slate-200'
                    }`}
                    title="Speak prompt instead"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => handleSendPrompt(textInput)}
                  className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition cursor-pointer"
                >
                  <CornerDownLeft className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setAiResponse(null);
            } else {
              window.speechSynthesis.cancel();
            }
          }}
          className={`p-4 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 scale-100 active:scale-90 cursor-pointer ${
            isOpen
              ? 'bg-indigo-650 text-white border border-indigo-500'
              : 'bg-[#6D4AFF] hover:bg-[#5b3ce6] text-white border border-indigo-400/25'
          }`}
          title="Toggle Nexus AI Chat"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>
    </>
  );
};

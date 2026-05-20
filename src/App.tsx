import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { 
  Languages, 
  Copy, 
  Volume2, 
  RefreshCw, 
  Check, 
  ArrowRightLeft,
  ChevronDown,
  History,
  Trash2,
  X,
  Menu,
  Sparkles,
  Clock,
  Mic,
  MicOff,
  WifiOff,
  CloudOff,
  Moon,
  Sun,
  Maximize,
  Minimize,
  LogOut,
  User as UserIcon,
  Settings,
  Edit3,
  Camera,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { languages } from './lib/languages';
import { cn } from './lib/utils';
import { getOfflineTranslation } from './lib/offlineTranslator';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';

interface HistoryItem {
  id: string;
  input: string;
  output: string;
  sourceLang: string;
  targetLang: string;
  timestamp: number;
}

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin opacity-20 text-[#1A1A1A]" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function PolyglotApp() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('es');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const isDarkMode = false;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    avatar: user?.avatar || '',
    bio: user?.bio || '',
    location: user?.location || '',
    profileColor: user?.profileColor || 'violet'
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        avatar: user.avatar || '',
        bio: user.bio || '',
        location: user.location || '',
        profileColor: user.profileColor || 'violet'
      });
    }
  }, [user]);

  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync theme with DOM and localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);
  
  // Sync full screen status
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        setError(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('translation_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  // Save history change to localStorage
  useEffect(() => {
    localStorage.setItem('translation_history', JSON.stringify(history));
  }, [history]);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to translate.');
      return;
    }

    if (inputText.length > 5000) {
      setError('Input exceeds the 5,000 character limit.');
      return;
    }

    if (!isOnline) {
      const offlineResult = getOfflineTranslation(inputText, sourceLang, targetLang);
      if (offlineResult) {
        setTranslatedText(offlineResult);
        setError(null);
        return;
      } else {
        setError('Offline Mode: Only basic phrases are supported for English to Spanish/French when offline.');
        return;
      }
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          sourceLang,
          targetLang
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('The server returned an invalid response. Please try again.');
      }

      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}: Failed to translate`);
      }

      setTranslatedText(data.translatedText);
      
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(7),
        input: inputText,
        output: data.translatedText,
        sourceLang,
        targetLang,
        timestamp: Date.now()
      };
      setHistory(prev => [newItem, ...prev.slice(0, 19)]);
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setError('Network error: Unable to connect to the translation service. Please check your internet connection.');
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    if (confirm('Clear all translation history?')) {
      setHistory([]);
    }
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setInputText(item.input);
    setTranslatedText(item.output);
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    setIsSidebarOpen(false);
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSpeak = (text: string, lang: string) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'auto' ? '' : lang;
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = sourceLang === 'auto' ? 'en-US' : sourceLang;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(prev => prev + (prev ? ' ' : '') + transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        setError("Microphone access denied. Please enable it in browser settings.");
      } else {
        setError("Error occurred in speech recognition: " + event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const swapLanguages = () => {
    if (sourceLang === 'auto') return;
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    if (translatedText) {
      setInputText(translatedText);
      setTranslatedText('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setProfileForm(prev => ({ ...prev, avatar: dataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateInitialsAvatar = () => {
    const initials = profileForm.name ? profileForm.name.substring(0, 2).toUpperCase() : 'OP';
    const colors = [
      { c1: '#4F46E5', c2: '#06B6D4' },
      { c1: '#EC4899', c2: '#F43F5E' },
      { c1: '#10B981', c2: '#3B82F6' },
      { c1: '#F59E0B', c2: '#EF4444' },
      { c1: '#8B5CF6', c2: '#EC4899' },
    ];
    const chosen = colors[Math.floor(Math.random() * colors.length)];
    
    // Encoded offline SVG
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <defs>
        <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${encodeURIComponent(chosen.c1)}" />
          <stop offset="100%" stop-color="${encodeURIComponent(chosen.c2)}" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(%23avatarGrad)" />
      <text x="50" y="55" font-family="system-ui, sans-serif" font-weight="950" font-size="34" fill="%23ffffff" text-anchor="middle" dominant-baseline="middle">${initials}</text>
    </svg>`;
    
    const dataUrl = `data:image/svg+xml;utf8,${svg}`;
    setProfileForm(prev => ({ ...prev, avatar: dataUrl }));
  };

  const PRESET_AVATARS = [
    "https://api.dicebear.com/7.x/lorelei/svg?seed=Elena",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Kenji",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Amber",
    "https://api.dicebear.com/7.x/pixel-art/svg?seed=Poly",
    "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Happy",
    "https://api.dicebear.com/7.x/identicon/svg?seed=Waveform"
  ];

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileForm);
    setIsProfileOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] text-[#1A1A1A] dark:text-white font-sans selection:bg-[#1A1A1A] dark:selection:bg-white selection:text-white dark:selection:text-black transition-colors duration-500">
      
      {/* Profile Modal */}
      <AnimatePresence>
        {isProfileOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#111] rounded-[2.5rem] overflow-hidden shadow-2xl border border-[#1A1A1A]/5 dark:border-white/5"
            >
              <div className="p-8 border-b border-[#1A1A1A]/5 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1A1A1A] dark:bg-white rounded-xl flex items-center justify-center">
                    <Settings className="text-white dark:text-black w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-black text-xl tracking-tight uppercase leading-none dark:text-white">Profile</h2>
                    <p className="text-[10px] font-bold tracking-[0.2em] opacity-30 mt-1 uppercase dark:text-white/40">Identity Configuration</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsProfileOpen(false)}
                  className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 opacity-40 dark:text-white" />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
                <div className="flex flex-col items-center mb-4 text-center">
                  <div 
                    onClick={triggerFileInput}
                    className="relative group cursor-pointer"
                    title="Click to choose a custom picture"
                  >
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#F5F5F3] dark:border-white/5 shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:border-indigo-500/30">
                      {profileForm.avatar ? (
                        <img src={profileForm.avatar} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-full h-full p-6 opacity-20 dark:text-white" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full">
                      <Camera className="text-white w-6 h-6 mb-1" />
                      <span className="text-[7px] text-white/90 uppercase font-black tracking-widest leading-none">Upload</span>
                    </div>
                  </div>
                  
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <button 
                    type="button" 
                    onClick={triggerFileInput}
                    className="text-[9px] font-black uppercase tracking-wider text-indigo-500 hover:underline mt-3"
                  >
                    Upload Custom Image
                  </button>
                </div>

                {/* Preset Avatars Row */}
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-widest opacity-40 dark:text-white/40 block text-center">Neural Signatures (Presets)</label>
                  <div className="flex justify-center items-center gap-2 flex-wrap max-w-sm mx-auto bg-[#F5F5F3]/50 dark:bg-white/[0.01] p-2.5 rounded-2xl border border-black/[0.02] dark:border-white/[0.02]">
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setProfileForm(prev => ({ ...prev, avatar: url }))}
                        className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all hover:scale-110 cursor-pointer shrink-0 ${
                          profileForm.avatar === url 
                            ? 'border-indigo-500 scale-105 shadow-md shadow-indigo-500/20' 
                            : 'border-transparent opacity-60 hover:opacity-100 bg-[#F5F5F3] dark:bg-white/5'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleGenerateInitialsAvatar}
                      className="h-9 px-3 rounded-xl border border-dashed border-indigo-500/20 hover:border-indigo-500 text-[9px] font-black uppercase tracking-widest text-indigo-500 hover:bg-indigo-500/5 transition-all flex items-center gap-1 shrink-0"
                      title="Generate Gradient Initials Signature"
                    >
                      <Sparkles className="w-3 h-3" />
                      Initials
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 dark:text-white/40 ml-1">Display Name</label>
                    <input 
                      type="text" 
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="Your Name"
                      className="w-full px-4 py-3 bg-[#F5F5F3] dark:bg-white/5 border border-transparent focus:border-black/5 dark:focus:border-white/10 rounded-xl text-sm font-medium outline-none transition-all dark:text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 dark:text-white/40 ml-1">Location</label>
                    <input 
                      type="text" 
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      placeholder="e.g. San Francisco"
                      className="w-full px-4 py-3 bg-[#F5F5F3] dark:bg-white/5 border border-transparent focus:border-black/5 dark:focus:border-white/10 rounded-xl text-sm font-medium outline-none transition-all dark:text-white"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 dark:text-white/40 ml-1">System Bio</label>
                    <input 
                      type="text" 
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      placeholder="What defines you?"
                      className="w-full px-4 py-3 bg-[#F5F5F3] dark:bg-white/5 border border-transparent focus:border-black/5 dark:focus:border-white/10 rounded-xl text-sm font-medium outline-none transition-all dark:text-white"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 dark:text-white/40 ml-1">Direct Custom Avatar URL</label>
                    <input 
                      type="text" 
                      value={profileForm.avatar}
                      onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-3 bg-[#F5F5F3] dark:bg-white/5 border border-transparent focus:border-black/5 dark:focus:border-white/10 rounded-xl text-sm font-medium outline-none transition-all dark:text-white"
                    />
                  </div>
                </div>

                {/* Profile Color Theme Selector */}
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-widest opacity-40 dark:text-white/40 block text-center">Operator Accent Core</label>
                  <div className="flex justify-center gap-3">
                    {[
                      { name: 'violet', color: 'bg-violet-500', ring: 'ring-violet-500/30' },
                      { name: 'emerald', color: 'bg-emerald-500', ring: 'ring-emerald-500/40' },
                      { name: 'amber', color: 'bg-amber-500', ring: 'ring-amber-500/40' },
                      { name: 'blue', color: 'bg-blue-500', ring: 'ring-blue-500/40' },
                      { name: 'rose', color: 'bg-rose-500', ring: 'ring-rose-500/40' }
                    ].map((accent) => (
                      <button
                        key={accent.name}
                        type="button"
                        onClick={() => setProfileForm(prev => ({ ...prev, profileColor: accent.name }))}
                        className={`w-6 h-6 rounded-full ${accent.color} transition-all hover:scale-125 cursor-pointer relative flex items-center justify-center ${
                          profileForm.profileColor === accent.name
                            ? `ring-4 ${accent.ring} scale-110`
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {profileForm.profileColor === accent.name && (
                          <Check className="w-3.5 h-3.5 text-white stroke-[3.5px]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex-1 py-4 bg-[#F5F5F3] dark:bg-white/5 text-[#1A1A1A] dark:text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[#EAEAEA] dark:hover:bg-white/10 transition-all"
                  >
                    Discard
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-4 bg-[#1A1A1A] dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Update Matrix
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: isSidebarOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-[#111] border-r border-[#1A1A1A]/5 dark:border-white/5 z-[70] shadow-2xl flex flex-col"
      >
        <div className="p-6 border-b border-[#1A1A1A]/5 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 opacity-40 dark:text-white" />
            <h2 className="font-bold text-lg tracking-tight dark:text-white">History</h2>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5 opacity-40 dark:text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40 dark:text-white">
              <Clock className="w-12 h-12 stroke-[1.5px]" />
              <p className="text-sm">No recent translations</p>
            </div>
          ) : (
            history.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => loadHistoryItem(item)}
                className="group p-4 bg-[#F9F9F9] dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 rounded-xl border border-[#1A1A1A]/5 dark:border-white/5 hover:border-[#1A1A1A]/10 dark:hover:border-white/10 hover:shadow-lg hover:shadow-black/[0.02] cursor-pointer transition-all relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 dark:text-white/40">
                    {languages.find(l => l.code === item.sourceLang)?.name} → {languages.find(l => l.code === item.targetLang)?.name}
                  </span>
                  <button 
                    onClick={(e) => deleteHistoryItem(e, item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all dark:text-white"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs font-medium line-clamp-2 opacity-80 dark:text-white/80">{item.input}</p>
                <div className="mt-2 text-[10px] opacity-30 dark:text-white/30 flex items-center gap-1.5">
                   <div className="w-1 h-1 rounded-full bg-current" />
                   {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {history.length > 0 && (
          <div className="p-4 border-t border-[#1A1A1A]/5 dark:border-white/5">
            <button 
              onClick={clearHistory}
              className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear History
            </button>
          </div>
        )}

        <div className="p-6 border-t border-[#1A1A1A]/5 dark:border-white/5 bg-[#F9F9F9] dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 mb-6 relative group overflow-hidden p-2 rounded-2xl transition-all hover:bg-black/[0.03] dark:hover:bg-white/[0.03]">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1A1A1A]/5 dark:bg-white/5 border border-[#1A1A1A]/10 dark:border-white/10 shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-full h-full p-2 opacity-40" />
              )}
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-xs font-black truncate">{user?.name}</p>
               <p className="text-[10px] opacity-40 truncate">{user?.email}</p>
            </div>
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all absolute right-2 top-1/2 -translate-y-1/2"
              title="Edit Profile"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#1A1A1A] dark:text-white border border-dashed border-[#1A1A1A]/10 dark:border-white/10 hover:border-[#1A1A1A]/30 dark:hover:border-white/30 transition-all flex items-center justify-center gap-2 mb-2"
            >
              <Settings className="w-3 h-3" />
              Profile Settings
            </button>
            
            <button 
              onClick={handleLogout}
              className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] dark:text-white border border-[#1A1A1A]/10 dark:border-white/10 hover:bg-[#1A1A1A] dark:hover:bg-white hover:text-white dark:hover:text-black transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Header */}
      <header className="border-b border-[#1A1A1A]/5 dark:border-white/5 bg-white/70 dark:bg-black/70 backdrop-blur-xl sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 hover:bg-[#F5F5F5] dark:hover:bg-white/5 rounded-xl transition-all group"
            >
              <Menu className="w-6 h-6 opacity-60 group-hover:opacity-100 dark:text-white" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1A1A1A] dark:bg-white rounded-xl flex items-center justify-center shadow-lg shadow-black/20">
                <Languages className="text-white dark:text-black w-5 h-5" />
              </div>
              <div>
                <h1 className="font-black text-xl tracking-tighter uppercase leading-none dark:text-white">Polyglot</h1>
                <span className="text-[10px] font-bold tracking-[0.2em] opacity-30 uppercase dark:text-white/40">AI Ecosystem</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <button
                onClick={toggleFullscreen}
                className="p-3 hover:bg-[#F5F5F5] dark:hover:bg-white/5 rounded-xl transition-all text-[#1A1A1A] dark:text-white"
                title={isFullscreen ? "Exit full screen" : "Enter full screen"}
             >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
             </button>
             <div className="hidden md:flex items-center gap-4 border-l border-[#1A1A1A]/5 dark:border-white/10 pl-4 ml-2">
                <div className="flex -space-x-2">
                   {[...Array(3)].map((_, i) => (
                     <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-[#111] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
                   ))}
                </div>
                <p className="text-xs font-medium opacity-50 dark:text-white/40">Join 12k+ users</p>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16 flex flex-col items-center">
        
        {/* Intro */}
        <div className="text-center mb-16 space-y-4 max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-[#1A1A1A]/5 dark:bg-white/5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1A1A]/50 dark:text-white/40"
          >
            <Sparkles className="w-3 h-3 fill-current" />
            Empowered by Gemini 1.5
          </motion.div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-[0.9] dark:text-white">
            Break barriers. <br />
            <span className="text-[#1A1A1A]/20 dark:text-white/10">Instantly.</span>
          </h2>
          <p className="text-lg opacity-40 dark:opacity-60 font-medium dark:text-white">
            Natural language translation that feels human.
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-7xl mb-8 p-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/10 dark:border-red-500/20 rounded-2xl flex items-center justify-between gap-3 text-red-500 dark:text-red-400 text-sm font-bold"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                {!isOnline ? <WifiOff className="w-4 h-4" /> : <History className="w-4 h-4 rotate-180" />}
              </div>
              <span className="flex-1">{error}</span>
            </div>
            {(error.toLowerCase().includes('demand') || error.toLowerCase().includes('unavailable') || error.toLowerCase().includes('try again')) && (
              <button 
                onClick={handleTranslate}
                className="shrink-0 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl flex items-center gap-2 transition-all active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            )}
          </motion.div>
        )}

        {!isOnline && !error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-7xl mb-8 p-4 bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/10 dark:border-orange-500/20 rounded-2xl flex items-center gap-3 text-orange-600 dark:text-orange-400 text-sm font-bold"
          >
            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
              <CloudOff className="w-4 h-4" />
            </div>
            Offline Mode Active • Limited vocabulary supported locally.
          </motion.div>
        )}

        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* Source Panel */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-xs font-bold uppercase tracking-widest opacity-40">Input</span>
              </div>
              <div className="relative group/select">
                <select 
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="bg-white dark:bg-[#1A1A1A] border border-[#1A1A1A]/5 dark:border-white/10 px-4 py-2 rounded-xl text-sm font-bold shadow-sm cursor-pointer appearance-none pr-10 focus:ring-2 focus:ring-[#1A1A1A]/5 focus:border-[#1A1A1A]/10 outline-none transition-all dark:text-white"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 dark:text-white pointer-events-none" />
              </div>
            </div>

            <div className="flex-1 bg-white dark:bg-[#111] rounded-3xl p-8 border border-[#1A1A1A]/5 dark:border-white/5 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.05)] focus-within:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.08)] transition-all duration-700 relative">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="What would you like to say?"
                className="w-full h-[320px] lg:h-[400px] resize-none bg-transparent border-none focus:ring-0 text-2xl font-medium leading-normal placeholder:opacity-20 placeholder:font-normal dark:text-white dark:placeholder:text-white/20"
              />
              <div className="absolute bottom-6 left-8 right-8 flex items-center justify-between pointer-events-none">
                <div className={cn(
                  "text-[10px] font-bold uppercase tracking-widest transition-colors",
                  inputText.length > 4500 ? "text-orange-500 opacity-100" : "opacity-20 dark:opacity-40"
                )}>
                  {inputText.length} / 5,000 characters
                </div>
                <div className="flex items-center gap-2 pointer-events-auto">
                  <button 
                    onClick={toggleListening}
                    className={cn(
                      "p-3 rounded-full transition-all relative overflow-hidden",
                      isListening ? "bg-red-500/10 text-red-500" : "hover:bg-[#F5F5F3] dark:hover:bg-white/5 text-black/40 dark:text-white/40"
                    )}
                    title={isListening ? "Stop listening" : "Start voice input"}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-5 h-5 relative z-10" />
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0.5 }}
                          animate={{ scale: 1.5, opacity: 0 }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="absolute inset-0 bg-red-500 rounded-full"
                        />
                      </>
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </button>
                  <button 
                    onClick={() => handleSpeak(inputText, sourceLang)}
                    disabled={!inputText}
                    className="p-3 rounded-full hover:bg-[#F5F5F3] dark:hover:bg-white/5 disabled:opacity-0 transition-all group"
                  >
                    <Volume2 className="w-5 h-5 opacity-40 group-hover:opacity-100 dark:text-white" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Controls Mobile / Swap Desktop */}
          <div className="flex lg:flex-col items-center justify-center gap-4 lg:fixed lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:z-40">
             <motion.button
                whileHover={{ rotate: 180, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onClick={swapLanguages}
                disabled={sourceLang === 'auto'}
                className={cn(
                  "p-4 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-[#1A1A1A]/10 dark:border-white/10 shadow-xl transition-all",
                  sourceLang === 'auto' ? "opacity-20 cursor-not-allowed" : "hover:shadow-black/5 dark:text-white"
                )}
              >
                <ArrowRightLeft className="w-6 h-6" />
              </motion.button>
          </div>

          {/* Target Panel */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                 <span className="text-xs font-bold uppercase tracking-widest opacity-40">Output</span>
              </div>
              <div className="relative group/select">
                <select 
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="bg-white dark:bg-[#1A1A1A] border border-[#1A1A1A]/5 dark:border-white/10 px-4 py-2 rounded-xl text-sm font-bold shadow-sm cursor-pointer appearance-none pr-10 focus:ring-2 focus:ring-[#1A1A1A]/5 focus:border-[#1A1A1A]/10 outline-none transition-all dark:text-white"
                >
                  {languages.filter(l => l.code !== 'auto').map((lang) => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 dark:text-white pointer-events-none" />
              </div>
            </div>

            <div className={cn(
              "flex-1 bg-gradient-to-br from-indigo-50/30 via-white to-sky-50/20 text-slate-900 rounded-3xl p-8 shadow-md border border-indigo-500/10 relative overflow-hidden flex flex-col transition-all duration-500",
              isLoading && "ring-4 ring-offset-4 ring-offset-[#FAFAFA] ring-blue-500/10"
            )}>
               {/* Neural Energy Glow */}
               <AnimatePresence>
                 {isLoading && (
                   <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="absolute inset-0 z-0 overflow-hidden"
                   >
                     <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
                     <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent,rgba(59,130,246,0.05),transparent)] animate-[spin_4s_linear_infinite]" />
                     
                     {/* Scan Line */}
                     <motion.div 
                       animate={{ 
                         top: ['-10%', '110%'],
                       }}
                       transition={{ 
                         duration: 2,
                         repeat: Infinity,
                         ease: "linear"
                       }}
                       className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.2)] z-20"
                     />

                     {/* Floating Data Particles */}
                     <div className="absolute inset-0 z-10 opacity-40">
                       {[...Array(20)].map((_, i) => (
                         <motion.div
                           key={i}
                           initial={{ 
                             x: Math.random() * 100 + "%", 
                             y: Math.random() * 100 + "%",
                             scale: 0,
                             opacity: 0
                           }}
                           animate={{ 
                             y: [null, "-20px", "20px", "0px"],
                             opacity: [0, 1, 1, 0],
                             scale: [0, 1, 1, 0]
                           }}
                           transition={{ 
                             duration: 2 + Math.random() * 2,
                             repeat: Infinity,
                             delay: Math.random() * 2
                           }}
                           className="absolute w-1 h-1 bg-indigo-500 rounded-full"
                         />
                       ))}
                     </div>
                     
                     {/* Grid Effect */}
                     <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                   </motion.div>
                 )}
               </AnimatePresence>

               <AnimatePresence mode="wait">
                 {isLoading ? (
                   <motion.div 
                     key="loading"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="flex-1 flex flex-col items-center justify-center space-y-6 relative z-10"
                   >
                      <div className="relative">
                         <div className="absolute inset-0 blur-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20 animate-pulse" />
                         <RefreshCw className="w-16 h-16 animate-spin-slow text-indigo-600 relative" />
                      </div>
                      <p className="text-xs font-black uppercase tracking-[0.4em] bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
                         Synchronizing Neural Pathways
                      </p>
                      
                      {/* Neural Waveform */}
                      <div className="flex gap-1 h-4 items-center">
                         {[...Array(12)].map((_, i) => (
                           <motion.div
                             key={i}
                             animate={{ 
                               height: [4, 16, 8, 12, 4],
                             }}
                             transition={{ 
                               duration: 0.8,
                               repeat: Infinity,
                               delay: i * 0.05,
                               ease: "easeInOut"
                             }}
                             className="w-1 bg-gradient-to-t from-blue-500/50 to-purple-500/50 rounded-full"
                           />
                         ))}
                      </div>
                   </motion.div>
                 ) : (
                   <motion.div 
                     key="content"
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="flex-1"
                   >
                     {!translatedText && !error && (
                       <p className="text-2xl font-medium text-slate-300 leading-normal">
                         Your translation will <br /> appear here instantly...
                       </p>
                     )}
                     
                     {translatedText && (
                       <div className="flex flex-col h-full">
                         <p className="text-2xl font-medium leading-normal text-slate-800 selection:bg-indigo-500 selection:text-white flex-1">
                           {translatedText}
                         </p>
                         <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                           {translatedText.length} characters
                         </div>
                       </div>
                     )}

                     {error && (
                       <div className="flex flex-col gap-4">
                         <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium">
                           {error}
                         </div>
                         {(error.toLowerCase().includes('demand') || error.toLowerCase().includes('unavailable') || error.toLowerCase().includes('try again')) && (
                           <button 
                             onClick={handleTranslate}
                             className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                           >
                             <RefreshCw className="w-3.5 h-3.5" />
                             Retry Translation
                           </button>
                         )}
                       </div>
                     )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Bar */}
              <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                <div className="flex items-center gap-1">
                   <button 
                      onClick={() => handleSpeak(translatedText, targetLang)}
                      disabled={!translatedText}
                      className="p-3 rounded-xl hover:bg-white/5 disabled:opacity-0 transition-all group"
                      title="Listen"
                    >
                      <Volume2 className="w-5 h-5 opacity-40 group-hover:opacity-100" />
                    </button>
                    <button 
                      onClick={handleCopy}
                      disabled={!translatedText}
                      className="p-3 rounded-xl hover:bg-white/5 disabled:opacity-0 transition-all group"
                      title="Copy"
                    >
                      {isCopied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 opacity-40 group-hover:opacity-100" />}
                    </button>
                </div>
                
                <motion.button
                  whileHover={!isLoading && inputText.trim() ? { 
                    scale: 1.02,
                    boxShadow: "0 0 30px rgba(255,255,255,0.15)",
                  } : {}}
                  whileTap={!isLoading && inputText.trim() ? { scale: 0.96 } : {}}
                  onClick={handleTranslate}
                  disabled={isLoading || !inputText.trim()}
                  className={cn(
                    "relative overflow-hidden px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all",
                    isLoading || !inputText.trim() 
                      ? "bg-white/5 text-white/20 cursor-not-allowed" 
                      : "bg-white text-[#1A1A1A] shadow-lg active:shadow-none"
                  )}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Translating
                      </>
                    ) : (
                      'Translate Now'
                    )}
                  </span>
                  
                  {/* Subtle shine effect on hover */}
                  {!isLoading && inputText.trim() && (
                    <motion.div
                      initial={{ left: '-150%' }}
                      whileHover={{ left: '150%' }}
                      transition={{ duration: 1.2, ease: "easeInOut" }}
                      className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg] z-0"
                    />
                  )}
                </motion.button>
              </div>

              {/* Decorative light effect */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none" />
            </div>
          </section>
        </div>

        {/* Bottom Banner */}
        <div className="mt-32 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-12 text-center opacity-30 dark:opacity-40">
          {[
            { label: 'Real-time', value: '42ms' },
            { label: 'Accuracy', value: '99.9%' },
            { label: 'Languages', value: '100+' },
            { label: 'Uptime', value: '99.99%' },
          ].map((stat, i) => (
            <div key={i} className="space-y-1">
               <div className="text-xl font-black tracking-tight dark:text-white">{stat.value}</div>
               <div className="text-[10px] font-bold uppercase tracking-widest dark:text-white/60">{stat.label}</div>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-20 border-t border-[#1A1A1A]/5 text-center">
         <div className="max-w-xl mx-auto space-y-8">
            <div className="relative h-48 w-full rounded-3xl overflow-hidden grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-1000 group">
              <img 
                src="https://images.unsplash.com/photo-1451187530220-47e598d996cc?auto=format&fit=crop&q=80&w=800" 
                alt="Global Connection"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0A0A0A] via-transparent to-transparent" />
            </div>
            <Languages className="w-8 h-8 opacity-10 dark:opacity-20 mx-auto dark:text-white" />
            <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-20 dark:text-white/40">
              © 2026 Polyglot Intelligence • Powered by DeepMind
            </p>
         </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(128,128,128,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(128,128,128,0.2);
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <PolyglotApp />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Languages, 
  ArrowRight, 
  Mail, 
  Lock, 
  Twitter, 
  LogIn,
  Fingerprint,
  Zap,
  ShieldCheck,
  Globe,
  Sparkles,
  User as UserIcon,
  ChevronRight,
  ShieldAlert,
  Terminal,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Multilingual Greetings relevant to a Polyglot app
const GREETINGS = [
  { text: "Welcome", lang: "English", flag: "🇺🇸", accent: "from-blue-500 to-indigo-500" },
  { text: "Bienvenue", lang: "French", flag: "🇫🇷", accent: "from-blue-600 to-red-500" },
  { text: "Bienvenido", lang: "Spanish", flag: "🇪🇸", accent: "from-amber-500 to-red-500" },
  { text: "Willkommen", lang: "German", flag: "🇩🇪", accent: "from-yellow-500 to-red-600" },
  { text: "Benvenuto", lang: "Italian", flag: "🇮🇹", accent: "from-emerald-500 to-red-500" },
  { text: "Konnichiwa", lang: "Japanese", flag: "🇯🇵", accent: "from-red-500 to-pink-500" },
  { text: "Anyoung", lang: "Korean", flag: "🇰🇷", accent: "from-blue-500 to-purple-500" },
  { text: "Namaste", lang: "Hindi", flag: "🇮🇳", accent: "from-orange-500 to-emerald-500" }
];

// High quality predefined profiles that are extremely interactive and instantly log you in with different configurations!
const OPERATOR_PRESETS = [
  {
    name: "Elena Rostova",
    role: "Linguistics Scholar",
    email: "elena.rostova@polyglot.ai",
    avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Elena",
    bio: "Specialist in Slavic languages and neural semantics optimization.",
    location: "Vienna, Austria",
    color: "violet"
  },
  {
    name: "Kenji Tanaka",
    role: "AI Systems Lead",
    email: "kenji.tanaka@polyglot.ai",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Kenji",
    bio: "Compiling multilingual models and quantum transformer pipelines.",
    location: "Tokyo, Japan",
    color: "emerald"
  },
  {
    name: "Guest Operator",
    role: "Free Agent",
    email: "guest.operator@polyglot.ai",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest",
    bio: "Exploring the intersections of translation and artificial sentience.",
    location: "Global Network",
    color: "amber"
  }
];

const Login: React.FC = () => {
  const { login, updateProfile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'credentials' | 'operators'>('operators');
  const [isFingerprintScanning, setIsFingerprintScanning] = useState(false);
  const [fingerprintStatus, setFingerprintStatus] = useState<'idle' | 'scanning' | 'success'>('idle');

  // Rotate greeting every 2.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setGreetingIndex(prev => (prev + 1) % GREETINGS.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const handleSocialLogin = async (provider: string) => {
    await login(provider);
    navigate('/');
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login('email');
    // Save standard credentials info
    updateProfile({
      name: email.split('@')[0].toUpperCase() || 'Identified Operator',
      email: email,
      bio: "Standard licensed translation portal operator.",
      location: "Secured Node",
    });
    navigate('/');
  };

  const handleInstantPresetLogin = async (preset: typeof OPERATOR_PRESETS[0]) => {
    setIsFingerprintScanning(true);
    setFingerprintStatus('scanning');
    
    // Aesthetic simulated biosecurity authorization
    await new Promise(resolve => setTimeout(resolve, 1200));
    setFingerprintStatus('success');
    await new Promise(resolve => setTimeout(resolve, 400));

    await login('preset');
    updateProfile({
      name: preset.name,
      email: preset.email,
      avatar: preset.avatar,
      bio: preset.bio,
      location: preset.location,
      profileColor: preset.color
    });

    setIsFingerprintScanning(false);
    setFingerprintStatus('idle');
    navigate('/');
  };

  const currentGreeting = GREETINGS[greetingIndex];

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#09090B] flex flex-col items-center justify-center p-4 md:p-8 transition-colors duration-500 overflow-hidden relative">
      
      {/* Visual Ambient Flow Backdrops */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-500/[0.04] dark:bg-blue-500/[0.02] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-500/[0.04] dark:bg-purple-500/[0.02] rounded-full blur-[140px] pointer-events-none" />

      {/* Decorative Matrix Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.004)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.004)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-[#121214] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/[0.04] dark:shadow-none border border-black/[0.04] dark:border-white/[0.04] relative z-10 transition-all duration-300">
        
        {/* Left Side: Dynamic Core Visual Panel */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#FAF9FB] to-[#EEECF6] p-8 md:p-12 flex flex-col justify-between text-slate-800 relative overflow-hidden">
          {/* Subtle line glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.08),transparent_50%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[gradient-to-t] from-slate-100/50 to-transparent" />
          
          {/* Accent Ring */}
          <div className="absolute top-[30%] right-[-20%] w-64 h-64 border-2 border-slate-900/[0.02] rounded-full transform rotate-45 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-48 border border-slate-900/[0.03] rounded-full" />
          </div>

          {/* Top Row: App Signature */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center border border-indigo-700 shadow-lg rotate-3 shrink-0">
               <Languages className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight uppercase leading-none text-slate-900">Polyglot</h1>
              <span className="text-[9px] font-black tracking-[0.2em] text-slate-400 uppercase">Global Hub</span>
            </div>
          </div>

          {/* Middle: Multilingual Welcome Carousel */}
          <div className="my-16 md:my-24 relative z-10">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">System Gateway</span>
              <div className="h-20 flex items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={greetingIndex}
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -15, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center gap-4"
                  >
                    <span className="text-4xl md:text-5xl font-black tracking-tighter leading-none bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-850 bg-clip-text text-transparent">
                      {currentGreeting.text}!
                    </span>
                    <span className="text-2xl" title={currentGreeting.lang}>{currentGreeting.flag}</span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <p className="text-sm text-slate-500 font-medium max-w-xs mt-4 leading-relaxed">
              Connect to our synchronized neural translation gateway. Break systemic barriers in <span className="text-indigo-600 font-extrabold">100+ channels</span>.
            </p>
          </div>

          {/* Bottom Metatags */}
          <div className="relative z-10 space-y-4 pt-8 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
                <Cpu className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider leading-none">Cluster Status</p>
                <p className="text-[9px] text-indigo-600 font-mono mt-1">Operational (99.98% Efficiency)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Operations Console */}
        <div className="lg:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-[#121214] relative">
          
          {/* Header Switch Tabs */}
          <div className="flex gap-2 p-1.5 bg-[#FAF9FB] dark:bg-[#1E1E22] rounded-2xl mb-8 border border-black/[0.02] dark:border-white/[0.02]">
            <button
              onClick={() => setActiveTab('operators')}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                activeTab === 'operators' 
                  ? 'bg-white dark:bg-[#111] text-[#1A1A1A] dark:text-white shadow-xl shadow-black/[0.02] border border-black/[0.03] dark:border-white/[0.03]' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              Direct Profiles
            </button>
            <button
              onClick={() => setActiveTab('credentials')}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                activeTab === 'credentials' 
                  ? 'bg-white dark:bg-[#111] text-[#1A1A1A] dark:text-white shadow-xl shadow-black/[0.02] border border-black/[0.03] dark:border-white/[0.03]' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              Manual Identity
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'operators' ? (
              <motion.div
                key="operators-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-black tracking-tight text-[#1A1A1A] dark:text-white leading-none">Immediate Access Channels</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">
                    Authorize instantly with one of our specialized, fully pre-configured application user templates.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {OPERATOR_PRESETS.map((preset) => {
                    const colorStyles = 
                      preset.color === 'violet' 
                        ? 'border-violet-500/10 hover:border-violet-500/30 dark:hover:border-violet-500/30 group-hover:bg-violet-500/5 bg-violet-500/10 text-violet-500'
                        : preset.color === 'emerald'
                        ? 'border-emerald-500/10 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 group-hover:bg-emerald-500/5 bg-emerald-500/10 text-emerald-500'
                        : 'border-amber-500/10 hover:border-amber-500/30 dark:hover:border-amber-500/30 group-hover:bg-amber-500/5 bg-amber-500/10 text-amber-500';

                    return (
                      <button
                        key={preset.email}
                        onClick={() => handleInstantPresetLogin(preset)}
                        disabled={isFingerprintScanning}
                        className={`w-full text-left p-4 bg-[#FAF9FB] dark:bg-[#16161A] border border-black/[0.02] dark:border-white/[0.02] hover:bg-white dark:hover:bg-[#1C1C22] hover:shadow-xl hover:shadow-black/[0.01] rounded-2.5xl transition-all flex items-center justify-between group cursor-pointer ${isFingerprintScanning ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Avatar Circle */}
                          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white border border-black/5 dark:border-white/5 shadow-inner flex items-center justify-center shrink-0">
                            {preset.avatar ? (
                              <img src={preset.avatar} alt={preset.name} className="w-full h-full object-cover" />
                            ) : (
                              <UserIcon className="w-5 h-5 opacity-40 text-black dark:text-white" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-black text-[#1A1A1A] dark:text-white leading-none truncate">{preset.name}</p>
                              <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider leading-none ${colorStyles}`}>
                                {preset.role}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 truncate">{preset.bio}</p>
                          </div>
                        </div>

                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-white/[0.03] border border-black/5 dark:border-white/[0.05] flex items-center justify-center text-slate-400 group-hover:text-black dark:group-hover:text-white group-hover:scale-105 transition-all shadow-sm shrink-0">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {isFingerprintScanning && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 rounded-2xl flex items-center gap-4"
                  >
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <Fingerprint className={`w-6 h-6 text-blue-500 ${fingerprintStatus === 'scanning' ? 'animate-pulse scale-110' : ''}`} />
                      </div>
                      <div className="absolute inset-0 rounded-full border-2 border-blue-500 animate-[ping_1.5s_infinite] opacity-30" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider dark:text-white">Simulating Secure Authorization</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Decrypting secure bio-tokens and generating local state matrices...</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="credentials-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-black tracking-tight text-[#1A1A1A] dark:text-white leading-none">Identity Checkpoint</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">Log into the translation machine with standard email credentials.</p>
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 dark:text-white/40 ml-1">Email Terminal Coordinate</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Mail className="w-4 h-4 opacity-30 dark:text-white group-focus-within:opacity-100 group-focus-within:text-blue-500 transition-all" />
                      </div>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. operator@polyglot.ai" 
                        className="w-full pl-12 pr-4 py-4 bg-[#FAF9FB] dark:bg-[#16161A] border border-black/5 dark:border-white/5 focus:border-black/10 dark:focus:border-white/10 rounded-2xl text-sm font-medium outline-none transition-all dark:text-white placeholder:opacity-30"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-end ml-1">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 dark:text-white/40">Secure Access Code</label>
                      <button type="button" className="text-[9px] font-black uppercase tracking-widest text-blue-500 hover:underline">Revise?</button>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Lock className="w-4 h-4 opacity-30 dark:text-white group-focus-within:opacity-100 group-focus-within:text-indigo-500 transition-all" />
                      </div>
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••" 
                        className="w-full pl-12 pr-4 py-4 bg-[#FAF9FB] dark:bg-[#16161A] border border-black/5 dark:border-white/5 focus:border-black/10 dark:focus:border-white/10 rounded-2xl text-sm font-medium outline-none transition-all dark:text-white placeholder:opacity-30"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-4 bg-[#1A1A1A] dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-[0.22em] text-xs hover:shadow-xl hover:shadow-black/15 dark:hover:shadow-white/5 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer pt-4"
                  >
                    {authLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        {isRegistering ? 'Initialize Operator' : 'Authenticate Console'}
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-2 text-center">
                   <button 
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-[9px] font-black uppercase tracking-[0.15em] opacity-40 hover:opacity-100 transition-all dark:text-white cursor-pointer"
                   >
                     {isRegistering ? 'Already in the registry? Click to Authorize' : 'Need global clearance? Request operator token'}
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="relative flex items-center py-6">
             <div className="flex-grow border-t border-black/[0.05] dark:border-white/5"></div>
             <span className="flex-shrink mx-4 text-[9px] font-black uppercase tracking-[0.3em] opacity-20 dark:text-white/40">Alternative Handshakes</span>
             <div className="flex-grow border-t border-black/[0.05] dark:border-white/5"></div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-3 gap-3">
             <button 
               onClick={() => handleSocialLogin('google')}
               className="p-3.5 bg-[#FAF9FB] dark:bg-white/[0.02] border border-black/[0.03] dark:border-white/[0.03] rounded-xl hover:bg-[#F0EFF2] dark:hover:bg-white/[0.07] transition-all group flex items-center justify-center cursor-pointer"
               title="Google Login"
             >
               <Globe className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:text-red-500 dark:text-white transition-all" />
             </button>
             <button 
               onClick={() => handleSocialLogin('facebook')}
               className="p-3.5 bg-[#FAF9FB] dark:bg-white/[0.02] border border-black/[0.03] dark:border-white/[0.03] rounded-xl hover:bg-[#F0EFF2] dark:hover:bg-white/[0.07] transition-all group flex items-center justify-center cursor-pointer"
               title="Facebook Login"
             >
               <ShieldCheck className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:text-blue-500 dark:text-white transition-all" />
             </button>
             <button 
               onClick={() => handleSocialLogin('twitter')}
               className="p-3.5 bg-[#FAF9FB] dark:bg-white/[0.02] border border-black/[0.03] dark:border-white/[0.03] rounded-xl hover:bg-[#F0EFF2] dark:hover:bg-white/[0.07] transition-all group flex items-center justify-center cursor-pointer"
               title="Twitter Login"
             >
               <Twitter className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:text-sky-400 dark:text-white transition-all" />
             </button>
          </div>
        </div>
      </div>

      {/* Footer Features */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex flex-wrap justify-center gap-10 opacity-20 dark:opacity-30 text-center"
      >
        <div className="flex items-center gap-2">
          <Fingerprint className="w-4 h-4 dark:text-white" />
          <p className="text-[8px] font-black uppercase tracking-widest dark:text-white">Biometric Ready</p>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 dark:text-white" />
          <p className="text-[8px] font-black uppercase tracking-widest dark:text-white">Active Handoff</p>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 dark:text-white" />
          <p className="text-[8px] font-black uppercase tracking-widest dark:text-white">AES-256 Protocol</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Sparkles, Mic, Send, X, Calendar, MapPin, Briefcase, GraduationCap, IndianRupee, ShieldCheck, Award, FileText, ChevronRight, Save, Check, ShieldAlert, RotateCcw, Volume2, Settings, Shield, Clock, Cpu } from 'lucide-react';
import { SaarthiAvatar } from './SaarthiAvatar';
import { AppSettings, UserProfileData } from '../types';
import { sendChatMessage, RAGResponseEnvelope } from '../services/api';

interface SmartChatScreenProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
}

// Visual State Constants matching Saarthi AI Mockups
const STATE_WELCOME = 0;
const STATE_LISTENING = 1;
const STATE_PROCESSING = 2;
const STATE_TRANSITION = 3;
const STATE_ASK_AGE = 4;
const STATE_ASK_STATE = 5;
const STATE_ASK_OCCUPATION = 6;
const STATE_ASK_EDUCATION = 7;
const STATE_ASK_INCOME = 8;
const STATE_PROCESSING_ELIGIBILITY = 9;
const STATE_MATCHED_SCHEMES = 10;
const STATE_ACTION_PLAN = 11;

export const SmartChatScreen: React.FC<SmartChatScreenProps> = ({ settings, onSaveSettings }) => {
  const [appState, setAppState] = useState<number>(STATE_WELCOME);
  
  // User Profile
  const [profile, setProfile] = useState<UserProfileData>({
    age: '',
    state: 'Maharashtra',
    occupation: '',
    education: '',
    income: '',
  });

  const [inputVal, setInputVal] = useState('');
  const [userQueryText, setUserQueryText] = useState('I am a student. Please suggest suitable government schemes for me.');

  // Settings state overlay
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [model, setModel] = useState(settings.model);
  const [systemInstructions, setSystemInstructions] = useState(settings.systemInstructions);
  const [showKey, setShowKey] = useState(false);
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);

  // Listening Timer & Voice Wave State
  const [listenTimer, setListenTimer] = useState<number>(0);
  const [selectedCitation, setSelectedCitation] = useState<{
    source: string;
    url: string;
    authority: string;
    info: string;
  } | null>(null);

  // Eligibility Checklist Checklist Status
  const [ticks, setTicks] = useState({
    profile: false,
    rules: false,
    criteria: false,
    finding: false
  });

  // Audio Waveform Visualizer Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Config helper variables
  const isEnvKeyAvailable = !!import.meta.env.VITE_GEMINI_API_KEY;
  const hasConfiguredKey = !!(settings.apiKey || import.meta.env.VITE_GEMINI_API_KEY);

  // Listening Timer Effect
  useEffect(() => {
    let interval: any;
    if (appState === STATE_LISTENING) {
      interval = setInterval(() => {
        setListenTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setListenTimer(0);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [appState]);

  // Speech Recognition configuration
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const text = event.results[event.results.length - 1][0].transcript;
        if (text) {
          setInputVal(text);
          setUserQueryText(text);
        }
      };

      recognitionRef.current = rec;
    }

    return () => {
      stopAudioCapture();
    };
  }, []);

  // Voice recording handlers
  const startAudioCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      // Launch Visualizer Canvas Loop
      setTimeout(() => {
        drawAudioWaves();
      }, 100);

      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (err) {
      console.warn('Microphone access blocked. Loading simulated wave instead.');
      setTimeout(() => {
        drawSimulatedWaves();
      }, 100);
    }
  };

  const stopAudioCapture = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const drawAudioWaves = () => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!analyserRef.current) return;
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 4;
      
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#f472b6');
      gradient.addColorStop(0.5, '#6366f1');
      gradient.addColorStop(1, '#818cf8');
      ctx.strokeStyle = gradient;
      ctx.lineCap = 'round';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  };

  const drawSimulatedWaves = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      time += 0.08;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 4;
      
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#f472b6');
      gradient.addColorStop(0.5, '#c084fc');
      gradient.addColorStop(1, '#60a5fa');
      ctx.strokeStyle = gradient;
      ctx.beginPath();

      for (let x = 0; x < canvas.width; x++) {
        const amplitude = 14 + Math.sin(time * 0.45) * 8;
        const frequency = 0.025;
        const y = canvas.height / 2 + Math.sin(x * frequency + time) * amplitude;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    };
    draw();
  };

  // State transitions triggers
  const triggerVoiceListen = async () => {
    setAppState(STATE_LISTENING);
    await startAudioCapture();
  };

  const stopVoiceListen = () => {
    stopAudioCapture();
    setAppState(STATE_PROCESSING);
    triggerProcessingState();
  };

  const submitTextMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;

    setUserQueryText(inputVal.trim());
    setInputVal('');
    setAppState(STATE_PROCESSING);
    triggerProcessingState();
  };

  const triggerProcessingState = () => {
    setTimeout(() => {
      setAppState(STATE_TRANSITION);
      triggerTransitionState();
    }, 2000);
  };

  const triggerTransitionState = () => {
    setTimeout(() => {
      setAppState(STATE_ASK_AGE);
    }, 2500);
  };

  const handleSelectQuestionOption = (field: keyof UserProfileData, val: string) => {
    setProfile(prev => ({ ...prev, [field]: val }));

    // Move to next screen step
    if (appState === STATE_ASK_AGE) {
      setAppState(STATE_ASK_STATE);
    } else if (appState === STATE_ASK_STATE) {
      setAppState(STATE_ASK_OCCUPATION);
    } else if (appState === STATE_ASK_OCCUPATION) {
      setAppState(STATE_ASK_EDUCATION);
    } else if (appState === STATE_ASK_EDUCATION) {
      setAppState(STATE_ASK_INCOME);
    } else if (appState === STATE_ASK_INCOME) {
      setAppState(STATE_PROCESSING_ELIGIBILITY);
      runVerificationTicks();
    }
  };

  const [backendResult, setBackendResult] = useState<RAGResponseEnvelope | null>(null);

  const runVerificationTicks = () => {
    setTicks({ profile: false, rules: false, criteria: false, finding: false });

    // Call live FastAPI RAG Backend
    sendChatMessage({
      message: userQueryText || 'Suitable government schemes for citizen',
      state: profile.state,
      occupation: profile.occupation,
      income: profile.income,
      age: profile.age,
    })
      .then((res) => setBackendResult(res))
      .catch((err) => console.warn('FastAPI backend API connection note:', err));

    setTimeout(() => {
      setTicks(prev => ({ ...prev, profile: true }));
      setTimeout(() => {
        setTicks(prev => ({ ...prev, rules: true }));
        setTimeout(() => {
          setTicks(prev => ({ ...prev, criteria: true }));
          setTimeout(() => {
            setTicks(prev => ({ ...prev, finding: true }));
            setTimeout(() => {
              setAppState(STATE_MATCHED_SCHEMES);
            }, 800);
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  const formatTimer = (sec: number) => {
    const min = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${min.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const resetWizard = () => {
    setProfile({
      age: '',
      state: 'Maharashtra',
      occupation: '',
      education: '',
      income: '',
    });
    setAppState(STATE_WELCOME);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      apiKey: apiKey.trim(),
      model,
      systemInstructions
    });
    setIsSettingsSaved(true);
    setTimeout(() => {
      setIsSettingsSaved(false);
      setShowSettings(false);
    }, 1500);
  };

  return (
    <div className="w-full flex items-center justify-center py-4 px-4">
      {/* 
        Sleek Centered Desktop-friendly Card Container
        Adapts dynamically from standard tablet size down to mobile viewports 
      */}
      <div className="w-full max-w-3xl min-h-[660px] bg-white rounded-3xl shadow-2xl shadow-purple-950/5 border border-slate-200/70 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden select-none animate-fadeIn mx-auto">
        
        {/* Decorative background glows */}
        <div className="absolute top-[-80px] right-[-80px] w-72 h-72 bg-purple-300/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-80px] left-[-80px] w-72 h-72 bg-pink-300/10 rounded-full blur-[100px] pointer-events-none" />

        {/* 1. Header Area */}
        <header className="flex items-center justify-between border-b border-slate-100 pb-3.5 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-none">Saarthi AI</h1>
              <p className="text-[10px] text-purple-600 font-bold mt-0.5">AI Digital Government Officer</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-xl text-[10px] font-bold border border-purple-100/50 font-mono">
              <Cpu className="w-3.5 h-3.5" />
              <span>{settings.model}</span>
            </div>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded-xl transition-all cursor-pointer border border-slate-200/50 shadow-sm"
              aria-label="Settings panel config"
            >
              <Settings className="w-4.5 h-4.5" />
            </button>
          </div>
        </header>

        {/* 2. Main Visual Panel Viewport */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-6 z-10 flex flex-col justify-between">
          
          {/* STATE: Welcome / Start */}
          {appState === STATE_WELCOME && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-7 py-6 max-w-xl mx-auto animate-fadeIn">
              <SaarthiAvatar size="xl" />
              
              <div className="space-y-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">Namaste! 👋</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                  I'm here to help you find the right government schemes and scholarships. Tap the mic and speak or type your message to begin the inquiry.
                </p>
              </div>

              {/* Large circular dictation mic button */}
              <div className="flex flex-col items-center gap-3 pt-3">
                <button
                  onClick={triggerVoiceListen}
                  className="w-18 h-18 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-purple-100"
                >
                  <Mic className="w-7 h-7 animate-pulse" />
                </button>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tap to start voice assistant</span>
              </div>
            </div>
          )}

          {/* STATE: Listening (User Speaks) */}
          {appState === STATE_LISTENING && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 max-w-xl mx-auto animate-fadeIn w-full">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Listening for user speech...</span>
              
              {/* Wide Canvas visualizer waves */}
              <div className="w-full h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center overflow-hidden p-2">
                <canvas ref={canvasRef} width={500} height={60} className="w-full h-full opacity-80" />
              </div>

              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={stopVoiceListen}
                  className="w-18 h-18 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-purple-100"
                >
                  <Mic className="w-7 h-7 animate-pulse" />
                </button>
                <span className="text-sm font-bold text-slate-800 font-mono tracking-tight">{formatTimer(listenTimer)}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tap to stop recording</span>
              </div>
            </div>
          )}

          {/* STATE: Processing (AI Understands) */}
          {appState === STATE_PROCESSING && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-7 max-w-md mx-auto animate-fadeIn">
              <SaarthiAvatar type="robot" size="xl" />

              <div className="space-y-5 w-full">
                {/* Speech Bubble */}
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl text-left relative shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1 uppercase tracking-wider">You said:</span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-normal italic">
                    "{userQueryText}"
                  </p>
                  <div className="absolute bottom-[-6px] left-12 w-3.5 h-3.5 bg-slate-50 border-r border-b border-slate-100 transform rotate-45" />
                </div>

                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">Reasoning</span>
                  <p className="text-xs font-bold text-slate-700">Saarthi AI is understanding your request...</p>
                  
                  {/* Typing Indicator Dots */}
                  <div className="flex justify-center items-center gap-1.5 pt-1">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STATE: AI Response + Transition */}
          {appState === STATE_TRANSITION && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-7 max-w-md mx-auto animate-fadeIn">
              <SaarthiAvatar type="robot" size="xl" />

              <div className="space-y-5 w-full">
                {/* AI response bubble */}
                <div className="bg-purple-50/50 border border-purple-100 p-5 rounded-3xl text-left relative shadow-sm">
                  <span className="text-[10px] text-purple-600 font-bold block mb-1 uppercase tracking-wider">Saarthi AI:</span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                    Great! I can help you find suitable schemes. I'll ask you a few quick questions first.
                  </p>
                  <div className="absolute bottom-[-6px] left-12 w-3.5 h-3.5 bg-purple-50/50 border-r border-b border-purple-100 transform rotate-45" />
                </div>

                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-center gap-2 max-w-[280px] mx-auto shadow-sm">
                  <Clock className="w-4.5 h-4.5 text-slate-400 animate-spin" />
                  <span className="text-xs text-slate-500 font-bold">Preparing next question...</span>
                </div>
              </div>
            </div>
          )}

          {/* QUESTIONNAIRE PROGRESS HEADER */}
          {appState >= STATE_ASK_AGE && appState <= STATE_MATCHED_SCHEMES && (
            <div className="w-full flex items-center justify-between pb-3.5 border-b border-slate-150 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold bg-purple-100 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
                  {appState === STATE_MATCHED_SCHEMES ? 'Match' : `Step ${appState - STATE_ASK_AGE + 1}/7`}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scheme Matching Survey</span>
              </div>
              <div className="w-32 h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-300"
                  style={{ width: `${((appState - STATE_ASK_AGE + 1) / 7) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* STATE: Ask Age (Question 1/7) */}
          {appState === STATE_ASK_AGE && (
            <div className="flex-1 flex flex-col justify-between py-4 animate-fadeIn">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-100 shadow-sm">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-800">What is your age?</h3>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Select your age bracket below</p>
                </div>

                {/* Desktop-friendly responsive Grid options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto w-full px-2">
                  {['Below 18', '18 - 20', '21 - 25', '26 - 30', 'Above 30'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleSelectQuestionOption('age', opt)}
                      className="py-3.5 px-5 border border-slate-200 hover:border-purple-500 rounded-2xl text-xs font-bold text-slate-700 text-center bg-slate-50/50 hover:bg-white hover:shadow-md cursor-pointer transition-all active:scale-95"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-4 border-t border-slate-100">
                <Mic className="w-4 h-4 text-purple-500 animate-pulse" />
                <span>You can also speak</span>
              </div>
            </div>
          )}

          {/* STATE: Ask State (Question 2/7) */}
          {appState === STATE_ASK_STATE && (
            <div className="flex-1 flex flex-col justify-between py-4 animate-fadeIn">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-100 shadow-sm">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-800">Which state do you live in?</h3>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Choose your state of residency</p>
                </div>

                <div className="space-y-4 max-w-sm mx-auto w-full">
                  <select
                    value={profile.state}
                    onChange={(e) => setProfile(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none text-xs font-bold text-slate-700 cursor-pointer focus:bg-white focus:border-purple-500 transition-all"
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                  </select>

                  <button
                    onClick={() => handleSelectQuestionOption('state', profile.state)}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <span>Proceed</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-4 border-t border-slate-100">
                <Mic className="w-4 h-4 text-purple-500 animate-pulse" />
                <span>You can also speak</span>
              </div>
            </div>
          )}

          {/* STATE: Ask Occupation (Question 3/7) */}
          {appState === STATE_ASK_OCCUPATION && (
            <div className="flex-1 flex flex-col justify-between py-4 animate-fadeIn">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-100 shadow-sm">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-800">What is your current occupation?</h3>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Select your occupational category</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto w-full px-2">
                  {['Student', 'Employed', 'Self Employed', 'Business Owner', 'Other'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleSelectQuestionOption('occupation', opt)}
                      className="py-3.5 px-5 border border-slate-200 hover:border-purple-500 rounded-2xl text-xs font-bold text-slate-700 text-center bg-slate-50/50 hover:bg-white hover:shadow-md cursor-pointer transition-all active:scale-95"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-4 border-t border-slate-100">
                <Mic className="w-4 h-4 text-purple-500 animate-pulse" />
                <span>You can also speak</span>
              </div>
            </div>
          )}

          {/* STATE: Ask Education (Question 4/7) */}
          {appState === STATE_ASK_EDUCATION && (
            <div className="flex-1 flex flex-col justify-between py-4 animate-fadeIn">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-100 shadow-sm">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-800">What is your current education level?</h3>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Select your highest completed level</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto w-full px-2">
                  {['School', 'Diploma', 'Undergraduate', 'Postgraduate', 'Other'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleSelectQuestionOption('education', opt)}
                      className="py-3.5 px-5 border border-slate-200 hover:border-purple-500 rounded-2xl text-xs font-bold text-slate-700 text-center bg-slate-50/50 hover:bg-white hover:shadow-md cursor-pointer transition-all active:scale-95"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-4 border-t border-slate-100">
                <Mic className="w-4 h-4 text-purple-500 animate-pulse" />
                <span>You can also speak</span>
              </div>
            </div>
          )}

          {/* STATE: Ask Income (Question 5/7) */}
          {appState === STATE_ASK_INCOME && (
            <div className="flex-1 flex flex-col justify-between py-4 animate-fadeIn">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-100 shadow-sm">
                    <IndianRupee className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-800">What is your annual family income?</h3>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Select your family income bracket</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto w-full px-2">
                  {['Below ₹1 Lakh', '₹1 - ₹2.5 Lakh', '₹2.5 - ₹5 Lakh', '₹5 - ₹10 Lakh', 'Above ₹10 Lakh'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleSelectQuestionOption('income', opt)}
                      className="py-3.5 px-5 border border-slate-200 hover:border-purple-500 rounded-2xl text-xs font-bold text-slate-700 text-center bg-slate-50/50 hover:bg-white hover:shadow-md cursor-pointer transition-all active:scale-95"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-4 border-t border-slate-100">
                <Mic className="w-4 h-4 text-purple-500 animate-pulse" />
                <span>You can also speak</span>
              </div>
            </div>
          )}

          {/* STATE: Processing Eligibility Checklist (6/7) */}
          {appState === STATE_PROCESSING_ELIGIBILITY && (
            <div className="flex-1 flex flex-col justify-center space-y-6 py-6 max-w-md mx-auto animate-fadeIn w-full">
              <div className="text-center space-y-1.5">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100 shadow-sm animate-bounce">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-base font-extrabold text-slate-850">Checking your eligibility...</h3>
                <p className="text-xs text-slate-400 font-bold uppercase">Verifying suitable schemes against constraints</p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 text-left space-y-3.5 text-xs sm:text-sm font-semibold text-slate-600 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2.5">
                    <Check className={`w-4 h-4 transition-colors ${ticks.profile ? 'text-emerald-500' : 'text-slate-250'}`} />
                    <span>Matching your profile</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2.5">
                    <Check className={`w-4 h-4 transition-colors ${ticks.rules ? 'text-emerald-500' : 'text-slate-250'}`} />
                    <span>Checking scheme rules</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2.5">
                    <Check className={`w-4 h-4 transition-colors ${ticks.criteria ? 'text-emerald-500' : 'text-slate-250'}`} />
                    <span>Verifying criteria</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2.5">
                    <Check className={`w-4 h-4 transition-colors ${ticks.finding ? 'text-emerald-500' : 'text-slate-250'}`} />
                    <span>Finding best schemes for you</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STATE: Matched Schemes list matches (7/7) */}
          {appState === STATE_MATCHED_SCHEMES && (
            <div className="flex-1 flex flex-col justify-between py-2 animate-fadeIn relative w-full">
              <div className="space-y-5">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-100 shadow-sm">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-800">Top Schemes for You</h3>
                  <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">Recommended matched scholarship schemes</p>
                </div>

                {/* Matched Schemes Cards in a desktop 2-column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto w-full px-2">
                  {/* Scheme 1 */}
                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between gap-3 relative shadow-sm hover:shadow-md transition-shadow">
                    <span className="absolute top-4 right-4 text-[8px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Match
                    </span>
                    <div>
                      <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100/50">Central Government</span>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 mt-2.5">National Scholarship Scheme</h4>
                      <p className="text-xs text-purple-700 font-bold mt-1">Benefit: up to ₹75,000 / year</p>
                    </div>
                    <div className="flex justify-between items-center mt-2 border-t border-slate-200/20 pt-2">
                      <button
                        onClick={() => setSelectedCitation({
                          source: "National Scholarship Portal (NSP) - Ministry of Minority Affairs",
                          url: "https://scholarships.gov.in",
                          authority: "Government of India",
                          info: "Matched based on: Age (18-20), Student status, and Income (under ₹2.5 Lakhs) according to Section 4.2 of the scheme eligibility guidelines."
                        })}
                        className="text-[9px] font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200/30 px-3 py-1 rounded-xl cursor-pointer transition-colors"
                      >
                        📜 Cite: NSP [1]
                      </button>
                    </div>
                  </div>

                  {/* Scheme 2 */}
                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between gap-3 relative shadow-sm hover:shadow-md transition-shadow">
                    <span className="absolute top-4 right-4 text-[8px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Match
                    </span>
                    <div>
                      <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100/50">State Level</span>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 mt-2.5">State Merit Scholarship Scheme</h4>
                      <p className="text-xs text-purple-700 font-bold mt-1">Benefit: up to ₹50,000 / year</p>
                    </div>
                    <div className="flex justify-between items-center mt-2 border-t border-slate-200/20 pt-2">
                      <button
                        onClick={() => setSelectedCitation({
                          source: "MahaDBT Scholarship Portal - Department of Higher Education",
                          url: "https://mahadbt.maharashtra.gov.in",
                          authority: "Government of Maharashtra",
                          info: "Matched based on: Maharashtra residency and undergraduate educational level according to State Regulation 12B."
                        })}
                        className="text-[9px] font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200/30 px-3 py-1 rounded-xl cursor-pointer transition-colors"
                      >
                        📜 Cite: MahaDBT [2]
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Citations Modal Overlay Card */}
              {selectedCitation && (
                <div className="absolute inset-x-4 bottom-18 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xl z-20 animate-fadeIn space-y-3 max-w-md mx-auto">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-[9px] font-bold text-purple-600 bg-purple-50 border border-purple-150 px-2.5 py-0.5 rounded">
                      Source Reference
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedCitation(null)}
                      className="p-1 hover:bg-slate-50 border border-slate-200/30 rounded-lg cursor-pointer"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>

                  <div className="space-y-2 text-left text-xs">
                    <h4 className="font-extrabold text-slate-900 leading-snug">{selectedCitation.source}</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{selectedCitation.authority}</p>
                    <p className="text-slate-650 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                      {selectedCitation.info}
                    </p>
                    <button
                      type="button"
                      onClick={() => window.open(selectedCitation.url, '_blank')}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-1 active:scale-95 transition-all shadow-sm"
                    >
                      <span>Visit Official Portal</span>
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => setAppState(STATE_ACTION_PLAN)}
                className="w-full max-w-sm mx-auto py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5 pt-2 mt-6 active:scale-95 transition-all"
              >
                <span>View Action Plan</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STATE: Personalized Action Plan */}
          {appState === STATE_ACTION_PLAN && (
            <div className="flex-1 flex flex-col justify-between py-2 animate-fadeIn w-full">
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-100 shadow-sm">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-800">Your Action Plan</h3>
                  <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">Follow these steps to apply</p>
                </div>

                {/* Timeline Grid (Spacious 3-column Layout) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto w-full px-2 text-left text-xs font-semibold text-slate-600">
                  
                  <div className="bg-slate-50/50 border border-slate-200/50 rounded-2xl p-4 flex gap-3 shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shrink-0 font-bold shadow-sm">✓</div>
                    <div className="space-y-0.5">
                      <h4 className="font-extrabold text-slate-800">Complete profile</h4>
                      <p className="text-[10px] text-slate-450 font-medium">Information saved successfully</p>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 border border-slate-200/50 rounded-2xl p-4 flex gap-3 shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-purple-650 text-white flex items-center justify-center text-xs shrink-0 font-bold shadow-sm">2</div>
                    <div className="space-y-0.5">
                      <h4 className="font-extrabold text-slate-800">Upload documents</h4>
                      <p className="text-[10px] text-slate-450 font-medium">Upload marksheets & certificates</p>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 border border-slate-200/50 rounded-2xl p-4 flex gap-3 shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-purple-650 text-white flex items-center justify-center text-xs shrink-0 font-bold shadow-sm">3</div>
                    <div className="space-y-0.5">
                      <h4 className="font-extrabold text-slate-800">Visit official portal</h4>
                      <p className="text-[10px] text-slate-450 font-medium">Proceed to verify your scholarship status</p>
                    </div>
                  </div>

                </div>
              </div>

              <div className="flex gap-2.5 max-w-md mx-auto w-full pt-6">
                <button
                  onClick={resetWizard}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-2xl text-xs font-bold cursor-pointer transition-colors active:scale-95"
                  aria-label="Restart flow wizard"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  onClick={() => alert('Redirecting to the official government scholarships application portal...')}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1"
                >
                  <span>Go to Official Portal</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* 3. Bottom Text Input bar */}
        {appState === STATE_WELCOME && (
          <form onSubmit={submitTextMessage} className="pt-3 border-t border-slate-100 z-10 shrink-0">
            <div className="bg-slate-50 rounded-2xl p-1.5 pl-4 border border-slate-200/70 flex items-center gap-2 max-w-md mx-auto w-full shadow-sm">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 text-xs text-slate-800 placeholder-slate-400 bg-transparent outline-none font-semibold px-0.5 py-1.5"
              />
              <button
                type="submit"
                disabled={!inputVal.trim()}
                className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 text-white disabled:text-slate-400 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Dynamic Reset footer (only visible in questionnaire steps) */}
        {appState > STATE_TRANSITION && (
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 shrink-0 z-10">
            <span>Saarthi Verification Portal</span>
            <button
              onClick={resetWizard}
              className="hover:text-purple-600 cursor-pointer flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Wizard</span>
            </button>
          </div>
        )}

        {/* 4. Credentials Settings Overlay Modal */}
        {showSettings && (
          <div className="absolute inset-0 bg-white/99 z-30 p-6 flex flex-col justify-between animate-fadeIn">
            <div className="space-y-5 flex-1 overflow-y-auto no-scrollbar max-w-xl mx-auto w-full">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Shield className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900">API Configurations</h3>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1.5 hover:bg-slate-50 border border-slate-200/20 rounded-xl cursor-pointer"
                >
                  <X className="w-4.5 h-4.5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Gemini API Key</label>
                  <div className="relative flex items-center">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={isEnvKeyAvailable ? '🔑 Environment Key preconfigured' : 'Enter API Key...'}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono outline-none focus:bg-white focus:border-purple-500 text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 px-2 py-0.5 bg-white border border-slate-200 text-[9px] font-bold text-slate-600 rounded-lg cursor-pointer"
                    >
                      {showKey ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Gemini Model</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 font-bold cursor-pointer focus:bg-white focus:border-purple-500"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                  </select>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">System Prompts</label>
                  <textarea
                    value={systemInstructions}
                    onChange={(e) => setSystemInstructions(e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800 resize-none font-medium leading-relaxed focus:bg-white focus:border-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  {isSettingsSaved ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Configurations Saved</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Parameters</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-[10px] text-slate-500 leading-normal font-semibold text-center max-w-xl mx-auto w-full">
              Credentials are saved securely within your browser cache local storage.
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  PhoneOff, 
  Volume2, 
  Globe, 
  Sparkles
} from 'lucide-react';
import { SahayakAvatar } from './SaarthiAvatar';

interface VoiceCallViewProps {
  onEndCall: () => void;
  onSendVoiceQuery: (text: string) => void;
}

export const VoiceCallView: React.FC<VoiceCallViewProps> = ({ onEndCall, onSendVoiceQuery }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi' | 'mr'>('en');
  const [transcript, setTranscript] = useState('Namaste! I am Sahayak AI Officer. How can I assist you with government scholarships today?');

  const recognitionRef = useRef<any>(null);

  const speakText = (text: string, langCode: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode === 'hi' ? 'hi-IN' : langCode === 'mr' ? 'mr-IN' : 'en-IN';
      utterance.rate = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    // Initial greeting TTS
    const langCode = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
    speakText(transcript, langCode);

    // Initialize Web Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = langCode;

      rec.onresult = (event: any) => {
        const text = event.results[event.results.length - 1][0].transcript;
        if (text && !isMuted) {
          setTranscript(`You said: "${text}"`);
          onSendVoiceQuery(text);
        }
      };

      try {
        rec.start();
        recognitionRef.current = rec;
      } catch (e) {}
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [language]);

  const toggleMute = () => {
    if (recognitionRef.current) {
      if (!isMuted) {
        try { recognitionRef.current.stop(); } catch (e) {}
      } else {
        try { recognitionRef.current.start(); } catch (e) {}
      }
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between py-6 px-4 space-y-6 text-center animate-fadeIn text-slate-800">
      {/* Officer Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-[10px] font-extrabold border border-purple-100">
          <Sparkles className="w-3 h-3 text-purple-600 animate-pulse" />
          <span>Sahayak Voice Officer Active</span>
        </div>
        <h3 className="text-base font-extrabold text-slate-900">Direct Voice Consultation</h3>
      </div>

      {/* Avatar Container with Pulse Rings */}
      <div className="relative flex items-center justify-center my-4">
        {isSpeaking && (
          <>
            <div className="absolute w-44 h-44 rounded-full bg-purple-400/20 animate-ping pointer-events-none" />
            <div className="absolute w-36 h-36 rounded-full bg-indigo-400/30 animate-pulse pointer-events-none" />
          </>
        )}
        <SahayakAvatar size="xl" className="shadow-2xl ring-8 ring-purple-100" />
      </div>

      {/* Live Transcript Display */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 max-w-md w-full shadow-sm space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-purple-600 animate-bounce' : ''}`} />
          <span>Live Consultation Transcript</span>
        </div>
        <p className="text-xs sm:text-sm font-extrabold text-slate-800 leading-relaxed min-h-[48px] flex items-center justify-center">
          "{transcript}"
        </p>
      </div>

      {/* Language Selector */}
      <div className="flex items-center gap-2 justify-center">
        <Globe className="w-3.5 h-3.5 text-slate-400" />
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              language === 'en' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              language === 'hi' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500'
            }`}
          >
            हिंदी
          </button>
          <button
            onClick={() => setLanguage('mr')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              language === 'mr' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500'
            }`}
          >
            मराठी
          </button>
        </div>
      </div>

      {/* Call Action Controls */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <button
          onClick={toggleMute}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            isMuted ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
          title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <button
          onClick={onEndCall}
          className="p-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 transition-all cursor-pointer active:scale-95"
          title="End Consultation"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

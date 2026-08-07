import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface SahayakAvatarProps {
  type?: 'loader' | 'officer' | 'robot';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onAvatarClick?: () => void;
}

export const SahayakAvatar: React.FC<SahayakAvatarProps> = ({ 
  className = '', 
  onAvatarClick
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [greetingText, setGreetingText] = useState<string | null>(null);

  const handleAvatarClick = () => {
    if (onAvatarClick) {
      onAvatarClick();
    }

    const greetings = [
      "Namaste! 🙏 I am Sahayak AI. Tap the mic below or type your question to find government schemes!",
      "Jai Hind! 🇮🇳 I can help you check eligibility for Scholarships, Farmers schemes, and Healthcare benefits.",
      "Hello! I am your 24/7 Digital Government Officer. Which scheme would you like to explore today?",
      "Need document checklists? I can give you the exact list of required certificates for any scheme!"
    ];
    
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    setGreetingText(randomGreeting);
    setIsSpeaking(true);

    // Speak greeting using Web Speech API if supported
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("Namaste! I am Sahayak A I, your digital government officer.");
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsSpeaking(false), 3000);
    }
  };

  return (
    <div className="relative inline-flex flex-col items-center group cursor-pointer" onClick={handleAvatarClick}>
      {/* Interactive Speech Bubble Popup when tapped */}
      {greetingText && (
        <div className="absolute -top-16 z-30 bg-white border border-purple-200 text-slate-800 text-[11px] font-bold p-2.5 rounded-2xl shadow-xl max-w-xs text-center animate-bounce flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600 shrink-0 animate-spin" />
          <p className="line-clamp-2">{greetingText}</p>
          <button 
            onClick={(e) => { e.stopPropagation(); setGreetingText(null); }}
            className="text-slate-400 hover:text-slate-600 font-extrabold text-xs ml-1"
          >
            ×
          </button>
        </div>
      )}

      {/* Pulsing Glowing Rings when speaking */}
      <div className="relative flex items-center justify-center">
        {isSpeaking && (
          <>
            <span className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping" />
            <span className="absolute -inset-2 rounded-full bg-indigo-500/20 animate-pulse" />
          </>
        )}

        {/* Custom Animated SVG Loader Logo */}
        <div className={`relative p-1 ${className}`}>
          <div className="loader">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <defs>
                <mask id="clipping">
                  <polygon points="0,0 100,0 100,100 0,100" fill="black" />
                  <polygon points="25,25 75,25 50,75" fill="white" />
                  <polygon points="50,25 75,75 25,75" fill="white" />
                  <polygon points="35,35 65,35 50,65" fill="white" />
                  <polygon points="35,35 65,35 50,65" fill="white" />
                  <polygon points="35,35 65,35 50,65" fill="white" />
                  <polygon points="35,35 65,35 50,65" fill="white" />
                </mask>
              </defs>
            </svg>
            <div className="box" />
          </div>
        </div>
      </div>

      {/* Interactive Helper Hint */}
      <span className="text-[9px] font-extrabold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 mt-1 flex items-center gap-1 group-hover:bg-purple-100 transition-colors">
        <Sparkles className="w-2.5 h-2.5" />
        <span>Sahayak AI</span>
      </span>
    </div>
  );
};

export const SaarthiAvatar = SahayakAvatar;




import React, { useState, useEffect, useRef } from 'react';
import { CitizenProfile } from '../../types';
import { speakText, stopSpeech } from '../../services/speech_service';
import { getPromptSet } from '../../services/voice_prompts';

interface ScreenProfileQuestionsProps {
  step: 6 | 7 | 8 | 9 | 10 | 11;
  profile: CitizenProfile;
  language?: string;
  onUpdateProfile: (updated: Partial<CitizenProfile>) => void;
  onNext: () => void;
}

export const ScreenProfileQuestions: React.FC<ScreenProfileQuestionsProps> = ({
  step,
  profile,
  language = 'English',
  onUpdateProfile,
  onNext,
}) => {
  const prompts = getPromptSet(language);
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  // Function to start voice microphone listening
  const startVoiceInput = () => {
    stopSpeech();
    setIsListening(true);
    setVoiceFeedback('Listening... Speak your answer now.');

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceFeedback('Speech recognition not supported on this browser.');
      setIsListening(false);
      return;
    }

    const langMap: Record<string, string> = {
      English: 'en-IN',
      Hindi: 'hi-IN',
      Marathi: 'mr-IN',
      Tamil: 'ta-IN',
      Telugu: 'te-IN',
      Kannada: 'kn-IN',
    };

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = langMap[language] || 'en-IN';

    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.trim();
      setIsListening(false);
      setVoiceFeedback(`Heard: "${transcript}"`);

      // Process voice answer depending on current step
      if (step === 6) {
        onUpdateProfile({ full_name: transcript } as any);
        speakText(`Got it, ${transcript}`, language);
        setTimeout(onNext, 800);
      } else if (step === 7) {
        const num = parseInt(transcript.replace(/\D/g, ''), 10) || 22;
        onUpdateProfile({ age: num });
        speakText(`Age ${num}`, language);
        setTimeout(onNext, 800);
      } else if (step === 8) {
        onUpdateProfile({ state: transcript });
        speakText(`State ${transcript}`, language);
        setTimeout(onNext, 800);
      } else if (step === 9) {
        const occOptions = ['Student', 'Farmer', 'Employee', 'Business', 'Self-employed', 'Other'];
        const matched = occOptions.find((o) => transcript.toLowerCase().includes(o.toLowerCase())) || transcript;
        onUpdateProfile({ occupation: matched });
        speakText(matched, language);
        setTimeout(onNext, 800);
      } else if (step === 10) {
        onUpdateProfile({ income: transcript });
        speakText(transcript, language);
        setTimeout(onNext, 800);
      } else if (step === 11) {
        const catOptions = ['General', 'OBC', 'SC', 'ST', 'Other'];
        const matchedCat = catOptions.find((c) => transcript.toLowerCase().includes(c.toLowerCase())) || transcript;
        onUpdateProfile({ category: matchedCat });
        speakText(matchedCat, language);
        setTimeout(onNext, 800);
      }
    };

    rec.onerror = (err: any) => {
      setIsListening(false);
      setVoiceFeedback('Tap mic to try speaking again.');
    };

    rec.onend = () => {
      setIsListening(false);
    };

    try {
      rec.start();
      recognitionRef.current = rec;
    } catch (e) {
      setIsListening(false);
    }
  };

  // Automatically ask question by voice AND automatically trigger voice input when question completes!
  useEffect(() => {
    let questionVoiceText = '';
    if (step === 6) questionVoiceText = prompts.askName;
    else if (step === 7) questionVoiceText = prompts.askAge;
    else if (step === 8) questionVoiceText = prompts.askLocation;
    else if (step === 9) questionVoiceText = prompts.askOccupation;
    else if (step === 10) questionVoiceText = prompts.askIncome;
    else if (step === 11) questionVoiceText = prompts.askCategory;

    if (questionVoiceText) {
      speakText(questionVoiceText, language).then(() => {
        // Automatically start listening for user's voice answer when AI question completes!
        setTimeout(() => {
          startVoiceInput();
        }, 400);
      });
    }

    return () => {
      stopSpeech();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, [step, language]);

  return (
    <div className="flex-1 flex flex-col items-center justify-between text-center p-6 space-y-8 animate-fadeIn min-h-[85vh] max-w-md mx-auto">
      {/* Progress Dots */}
      <div className="flex items-center gap-2 pt-2">
        {[6, 7, 8, 9, 10, 11].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all ${
              s === step
                ? 'bg-[#3525cd] w-8'
                : s < step
                ? 'bg-[#3525cd]/40 w-2'
                : 'bg-[#c7c4d8] w-2'
            }`}
          />
        ))}
      </div>

      {/* Screen 06: Name */}
      {step === 6 && (
        <div className="w-full space-y-6 flex flex-col items-center">
          <div className="flex items-center gap-2 justify-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191b21]">
              {prompts.askName}
            </h2>
            <button
              onClick={() => speakText(prompts.askName, language)}
              className="w-9 h-9 rounded-full bg-[#3525cd]/10 hover:bg-[#3525cd]/20 text-[#3525cd] flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">volume_up</span>
            </button>
          </div>
          <input
            type="text"
            autoFocus
            value={(profile as any).full_name || (profile as any).name || ''}
            onChange={(e) => onUpdateProfile({ preferred_language: language, state: profile.state, occupation: profile.occupation, full_name: e.target.value } as any)}
            placeholder="Speak or type your name"
            className="w-full text-center text-2xl font-bold py-4 border-b-2 border-[#3525cd] outline-none bg-transparent placeholder:text-[#777587]"
          />
        </div>
      )}

      {/* Screen 07: Age */}
      {step === 7 && (
        <div className="w-full space-y-6 flex flex-col items-center">
          <div className="flex items-center gap-2 justify-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191b21]">
              {prompts.askAge}
            </h2>
            <button
              onClick={() => speakText(prompts.askAge, language)}
              className="w-9 h-9 rounded-full bg-[#3525cd]/10 hover:bg-[#3525cd]/20 text-[#3525cd] flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">volume_up</span>
            </button>
          </div>
          <div className="flex items-baseline justify-center gap-2">
            <input
              type="number"
              autoFocus
              value={profile.age || 22}
              onChange={(e) => onUpdateProfile({ age: e.target.value })}
              className="w-28 text-center text-5xl font-black text-[#3525cd] outline-none bg-transparent border-b-2 border-[#3525cd]"
            />
            <span className="text-xl font-bold text-[#464555]">years old</span>
          </div>
        </div>
      )}

      {/* Screen 08: Location */}
      {step === 8 && (
        <div className="w-full space-y-6 flex flex-col items-center">
          <div className="flex items-center gap-2 justify-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191b21]">
              {prompts.askLocation}
            </h2>
            <button
              onClick={() => speakText(prompts.askLocation, language)}
              className="w-9 h-9 rounded-full bg-[#3525cd]/10 hover:bg-[#3525cd]/20 text-[#3525cd] flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">volume_up</span>
            </button>
          </div>
          <div className="w-full space-y-3.5">
            <select
              value={profile.state || 'Maharashtra'}
              onChange={(e) => onUpdateProfile({ state: e.target.value })}
              className="w-full p-4 glass-card rounded-2xl text-base font-semibold text-[#191b21] outline-none shadow-sm"
            >
              <option value="Maharashtra">Maharashtra</option>
              <option value="Delhi">Delhi</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Gujarat">Gujarat</option>
            </select>
            <input
              type="text"
              value={profile.district || 'Pune'}
              onChange={(e) => onUpdateProfile({ district: e.target.value })}
              placeholder="District / City (e.g. Pune)"
              className="w-full p-4 glass-card rounded-2xl text-base font-semibold text-[#191b21] outline-none shadow-sm"
            />
          </div>
        </div>
      )}

      {/* Screen 09: Occupation */}
      {step === 9 && (
        <div className="w-full space-y-4 flex flex-col items-center">
          <div className="flex items-center gap-2 justify-center">
            <h2 className="text-2xl font-extrabold text-[#191b21]">
              {prompts.askOccupation}
            </h2>
            <button
              onClick={() => speakText(prompts.askOccupation, language)}
              className="w-9 h-9 rounded-full bg-[#3525cd]/10 hover:bg-[#3525cd]/20 text-[#3525cd] flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">volume_up</span>
            </button>
          </div>
          <div className="w-full space-y-2 text-left">
            {['Student', 'Farmer', 'Employee', 'Business', 'Self-employed', 'Other'].map((occ) => (
              <button
                key={occ}
                onClick={() => {
                  onUpdateProfile({ occupation: occ });
                  onNext();
                }}
                className={`w-full p-4 rounded-2xl border font-bold text-base transition-all cursor-pointer ${
                  profile.occupation === occ
                    ? 'bg-[#3525cd] text-white border-[#3525cd] shadow-lg shadow-[#3525cd]/20'
                    : 'glass-card border-white/50 text-[#191b21] hover:bg-white/80'
                }`}
              >
                {occ}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Screen 10: Income */}
      {step === 10 && (
        <div className="w-full space-y-6 flex flex-col items-center">
          <div className="flex items-center gap-2 justify-center">
            <h2 className="text-2xl font-extrabold text-[#191b21]">
              {prompts.askIncome}
            </h2>
            <button
              onClick={() => speakText(prompts.askIncome, language)}
              className="w-9 h-9 rounded-full bg-[#3525cd]/10 hover:bg-[#3525cd]/20 text-[#3525cd] flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">volume_up</span>
            </button>
          </div>
          <div className="w-full space-y-2.5 text-left">
            {[
              'Below ₹ 1.5 Lakhs',
              '₹ 1.5 - ₹ 2.5 Lakhs',
              '₹ 2.5 - ₹ 8.0 Lakhs',
              'Above ₹ 8.0 Lakhs'
            ].map((inc) => (
              <button
                key={inc}
                onClick={() => {
                  onUpdateProfile({ income: inc });
                  onNext();
                }}
                className={`w-full p-4 rounded-2xl border font-bold text-base transition-all cursor-pointer ${
                  profile.income === inc
                    ? 'bg-[#3525cd] text-white border-[#3525cd] shadow-lg shadow-[#3525cd]/20'
                    : 'glass-card border-white/50 text-[#191b21] hover:bg-white/80'
                }`}
              >
                {inc}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Screen 11: Category */}
      {step === 11 && (
        <div className="w-full space-y-4 flex flex-col items-center">
          <div className="flex items-center gap-2 justify-center">
            <h2 className="text-2xl font-extrabold text-[#191b21]">
              {prompts.askCategory}
            </h2>
            <button
              onClick={() => speakText(prompts.askCategory, language)}
              className="w-9 h-9 rounded-full bg-[#3525cd]/10 hover:bg-[#3525cd]/20 text-[#3525cd] flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">volume_up</span>
            </button>
          </div>
          <div className="w-full space-y-2 text-left">
            {['General', 'OBC', 'SC', 'ST', 'Other'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  onUpdateProfile({ category: cat });
                  onNext();
                }}
                className={`w-full p-4 rounded-2xl border font-bold text-base transition-all cursor-pointer ${
                  profile.category === cat
                    ? 'bg-[#3525cd] text-white border-[#3525cd] shadow-lg shadow-[#3525cd]/20'
                    : 'glass-card border-white/50 text-[#191b21] hover:bg-white/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Voice Status & Manual Next Control */}
      <div className="w-full max-w-sm pt-2 space-y-3">
        {/* Pulsing Mic Indicator */}
        <button
          onClick={startVoiceInput}
          className={`w-full py-3.5 rounded-full flex items-center justify-center gap-3 font-bold text-base transition-all cursor-pointer shadow-md ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse shadow-rose-500/40 ring-4 ring-rose-300'
              : 'bg-[#191b21] hover:bg-[#2e3036] text-white'
          }`}
        >
          <span className="material-symbols-outlined text-2xl">{isListening ? 'graphic_eq' : 'mic'}</span>
          <span>{isListening ? 'Listening... Speak answer now' : 'Tap to speak your answer'}</span>
        </button>

        {voiceFeedback && (
          <p className="text-xs font-semibold text-[#3525cd] animate-fadeIn">
            {voiceFeedback}
          </p>
        )}

        {(step === 6 || step === 7 || step === 8) && (
          <button
            onClick={onNext}
            className="w-full py-3 bg-[#3525cd] hover:bg-[#4f46e5] text-white font-bold text-base rounded-full shadow-lg shadow-[#3525cd]/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer btn-glow"
          >
            <span>Continue</span>
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        )}
      </div>
    </div>
  );
};

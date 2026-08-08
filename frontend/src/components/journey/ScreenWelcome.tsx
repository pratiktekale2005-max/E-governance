import React, { useEffect } from 'react';
import { AIOrb } from '../AIOrb';
import { speakText } from '../../services/speech_service';
import { getPromptSet } from '../../services/voice_prompts';

interface ScreenWelcomeProps {
  language?: string;
  onNext: () => void;
}

export const ScreenWelcome: React.FC<ScreenWelcomeProps> = ({ language = 'English', onNext }) => {
  const prompts = getPromptSet(language);

  useEffect(() => {
    speakText(prompts.welcome, language);
  }, [language]);

  return (
    <div className="flex-1 flex flex-col items-center justify-between text-center p-6 space-y-8 animate-fadeIn min-h-[85vh]">
      <div />

      <div className="space-y-8 flex flex-col items-center max-w-sm">
        <AIOrb size="xl" state="idle" />

        <div className="space-y-3 flex flex-col items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-extrabold text-[#191b21] leading-tight">
              Government help,<br />made simple.
            </h2>
            <button
              onClick={() => speakText(prompts.welcome, language)}
              className="w-8 h-8 rounded-full bg-[#3525cd]/10 text-[#3525cd] flex items-center justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">volume_up</span>
            </button>
          </div>
          <p className="text-base text-[#464555] font-normal leading-relaxed">
            Your personal AI Officer for instant eligibility checks, scheme verification, and application guidance.
          </p>
        </div>
      </div>

      <div className="w-full max-w-sm pt-4">
        <button
          onClick={onNext}
          className="w-full py-4 bg-[#3525cd] hover:bg-[#4f46e5] text-white font-bold text-lg rounded-full shadow-lg shadow-[#3525cd]/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer btn-glow"
        >
          <span>Get Started</span>
          <span className="material-symbols-outlined text-xl">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

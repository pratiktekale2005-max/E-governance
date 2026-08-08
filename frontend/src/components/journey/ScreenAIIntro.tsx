import React, { useState, useEffect } from 'react';
import { AIOrb } from '../AIOrb';
import { speakText } from '../../services/speech_service';
import { getPromptSet } from '../../services/voice_prompts';

interface ScreenAIIntroProps {
  language?: string;
  onNext: () => void;
}

export const ScreenAIIntro: React.FC<ScreenAIIntroProps> = ({ language = 'English', onNext }) => {
  const [subStep, setSubStep] = useState<4 | 5>(4);
  const prompts = getPromptSet(language);

  useEffect(() => {
    if (subStep === 4) {
      speakText(prompts.aiIntro1, language);
    } else {
      speakText(prompts.aiIntro2, language);
    }
  }, [subStep, language]);

  return (
    <div className="flex-1 flex flex-col items-center justify-between text-center p-6 space-y-8 animate-fadeIn min-h-[85vh] max-w-md mx-auto">
      <div />

      <div className="space-y-8 flex flex-col items-center">
        <AIOrb size="xl" state="idle" />

        {subStep === 4 ? (
          <div className="space-y-3 flex flex-col items-center animate-fadeIn">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191b21] leading-snug">
                I'm your AI Officer.
              </h2>
              <button
                onClick={() => speakText(prompts.aiIntro1, language)}
                className="w-8 h-8 rounded-full bg-[#3525cd]/10 text-[#3525cd] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">volume_up</span>
              </button>
            </div>
            <p className="text-base text-[#464555] font-normal leading-relaxed max-w-xs">
              I can help you discover government schemes, verify your eligibility, and guide you through required documents.
            </p>
          </div>
        ) : (
          <div className="space-y-3 flex flex-col items-center animate-fadeIn">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191b21] leading-snug">
                Before we begin...
              </h2>
              <button
                onClick={() => speakText(prompts.aiIntro2, language)}
                className="w-8 h-8 rounded-full bg-[#3525cd]/10 text-[#3525cd] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">volume_up</span>
              </button>
            </div>
            <p className="text-base text-[#464555] font-normal leading-relaxed max-w-xs">
              I'd like to know a little about you. It helps me find schemes that fit you perfectly.
            </p>
          </div>
        )}
      </div>

      <div className="w-full max-w-sm pt-4">
        {subStep === 4 ? (
          <button
            onClick={() => setSubStep(5)}
            className="w-full py-4 bg-[#3525cd] hover:bg-[#4f46e5] text-white font-bold text-lg rounded-full shadow-lg shadow-[#3525cd]/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer btn-glow"
          >
            <span>Continue</span>
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </button>
        ) : (
          <button
            onClick={onNext}
            className="w-full py-4 bg-[#3525cd] hover:bg-[#4f46e5] text-white font-bold text-lg rounded-full shadow-lg shadow-[#3525cd]/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer btn-glow"
          >
            <span>Let's begin</span>
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </button>
        )}
      </div>
    </div>
  );
};

import React, { useEffect } from 'react';
import { AIOrb } from '../AIOrb';

interface ScreenSplashProps {
  onNext: () => void;
}

export const ScreenSplash: React.FC<ScreenSplashProps> = ({ onNext }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onNext();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <div className="flex-1 flex flex-col items-center justify-between text-center p-6 space-y-8 animate-fadeIn min-h-[85vh]">
      <div />

      <div className="flex flex-col items-center justify-center space-y-8">
        <AIOrb size="xl" state="idle" />

        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#191b21]">
            SAHAYAK AI
          </h1>
          <p className="text-base font-semibold tracking-wide text-[#464555]">
            Your AI Officer
          </p>
        </div>
      </div>

      {/* Atmospheric Loading Dots */}
      <div className="flex gap-2 pb-6">
        <div className="w-2 h-2 rounded-full bg-[#3525cd]/40 animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-[#3525cd]/40 animate-pulse [animation-delay:0.2s]" />
        <div className="w-2 h-2 rounded-full bg-[#3525cd]/40 animate-pulse [animation-delay:0.4s]" />
      </div>
    </div>
  );
};

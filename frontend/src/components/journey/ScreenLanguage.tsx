import React, { useEffect } from 'react';
import { AIOrb } from '../AIOrb';
import { speakText } from '../../services/speech_service';

interface ScreenLanguageProps {
  onSelectLang: (langName: string, langCode: string) => void;
}

export const ScreenLanguage: React.FC<ScreenLanguageProps> = ({ onSelectLang }) => {
  useEffect(() => {
    speakText('How would you like to talk to me? Choose your language.', 'en');
  }, []);

  const languages = [
    { code: 'en', name: 'English', native: 'English', letter: 'A' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी', letter: 'अ' },
    { code: 'mr', name: 'Marathi', native: 'मराठी', letter: 'म' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்', letter: 'த' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు', letter: 'తె' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', letter: 'ಕ' },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-between text-center p-6 space-y-6 animate-fadeIn min-h-[85vh] max-w-md mx-auto">
      <div className="space-y-6 flex flex-col items-center w-full">
        <AIOrb size="md" state="idle" />

        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-[#191b21] leading-snug">
            How would you like to talk to me?
          </h2>
          <button
            onClick={() => speakText('How would you like to talk to me? Choose your language.', 'en')}
            className="w-8 h-8 rounded-full bg-[#3525cd]/10 text-[#3525cd] flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">volume_up</span>
          </button>
        </div>
      </div>

      <div className="w-full grid grid-cols-2 gap-3.5">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => {
              speakText(`You selected ${lang.name}.`, lang.name);
              onSelectLang(lang.name, lang.code);
            }}
            className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center gap-1.5 hover:bg-white/80 active:scale-95 transition-all duration-200 cursor-pointer group"
          >
            <span className="text-2xl font-bold text-[#3525cd] group-hover:scale-110 transition-transform">
              {lang.letter}
            </span>
            <span className="text-base font-semibold text-[#191b21]">
              {lang.native}
            </span>
          </button>
        ))}
      </div>

      <div />
    </div>
  );
};

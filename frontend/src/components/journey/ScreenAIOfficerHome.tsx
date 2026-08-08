import React, { useState, useEffect } from 'react';
import { AIOrb } from '../AIOrb';
import { CitizenProfile } from '../../types';
import { speakText } from '../../services/speech_service';
import { getPromptSet } from '../../services/voice_prompts';

interface ScreenAIOfficerHomeProps {
  profile: CitizenProfile;
  onStartVoice: () => void;
  onStartText: (query: string) => void;
}

export const ScreenAIOfficerHome: React.FC<ScreenAIOfficerHomeProps> = ({
  profile,
  onStartVoice,
  onStartText,
}) => {
  const [inputVal, setInputVal] = useState('');
  const userName = (profile as any).full_name || (profile as any).name || 'Citizen';
  const language = profile.preferred_language || 'English';
  const prompts = getPromptSet(language);

  const handleSpeakGreeting = () => {
    speakText(prompts.homeGreeting(userName), language);
  };

  useEffect(() => {
    handleSpeakGreeting();
  }, [language]);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      onStartText(inputVal.trim());
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between text-center p-6 space-y-8 animate-fadeIn min-h-[85vh] max-w-md mx-auto w-full">
      {/* Top Welcome Title with Speaker Button */}
      <div className="text-center pt-2 space-y-2 relative z-20 flex flex-col items-center">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-3xl font-extrabold text-[#191b21]">
            Hello, {userName}.
          </h1>
          <button
            onClick={handleSpeakGreeting}
            title="Listen to AI Officer voice"
            className="w-9 h-9 rounded-full bg-[#3525cd]/10 hover:bg-[#3525cd]/20 text-[#3525cd] flex items-center justify-center transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">volume_up</span>
          </button>
        </div>
        <p className="text-base text-[#464555] font-normal">
          {prompts.homeGreeting(userName)}
        </p>
      </div>

      {/* AI Orb Container */}
      <div className="relative w-64 h-64 flex items-center justify-center my-4">
        <AIOrb size="xl" state="idle" onClick={onStartVoice} />
      </div>

      {/* Actions Section */}
      <div className="w-full space-y-4">
        {/* Primary Action Button */}
        <button
          onClick={onStartVoice}
          className="w-full glass-panel px-8 py-4 rounded-full flex items-center justify-center gap-4 text-[#3525cd] text-xl font-bold transition-all hover:-translate-y-1 hover:shadow-xl active:translate-y-0 active:shadow-md cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-[#3525cd] flex items-center justify-center text-white btn-glow group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-2xl">mic</span>
          </div>
          <span>Talk to me</span>
        </button>

        {/* Secondary Type Input */}
        <form onSubmit={handleTextSubmit} className="w-full">
          <div className="glass-panel rounded-full flex items-center px-4 py-1.5 transition-colors focus-within:border-[#3525cd] focus-within:ring-2 focus-within:ring-[#3525cd]/20">
            <span className="material-symbols-outlined text-[#777587] ml-2">keyboard</span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Or type your request..."
              className="flex-1 bg-transparent border-none outline-none text-[#191b21] font-normal placeholder-[#777587] py-3 px-4 text-base"
            />
            <button
              type="submit"
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#3525cd] hover:bg-[#3525cd]/10 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

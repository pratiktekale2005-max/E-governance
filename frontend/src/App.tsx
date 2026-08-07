import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { SmartChatScreen } from './components/SmartChatScreen';
import { AppSettings } from './types';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>({
    apiKey: '',
    model: 'gemini-2.5-flash',
    systemInstructions: 'You are Saarthi AI, a friendly Digital Government Officer. Your duty is to help users discover appropriate government scholarship schemes and welfare policies by conducting an eligibility questionnaire. Speak in a helpful and polite Indian government representative tone.',
  });

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key') || '';
    const savedModel = localStorage.getItem('gemini_model') || 'gemini-2.5-flash';
    const savedPrompt = localStorage.getItem('gemini_system_prompt') || 'You are Saarthi AI, a friendly Digital Government Officer. Your duty is to help users discover appropriate government scholarship schemes and welfare policies by conducting an eligibility questionnaire. Speak in a helpful and polite Indian government representative tone.';
    
    setSettings({
      apiKey: savedKey,
      model: savedModel,
      systemInstructions: savedPrompt,
    });
  }, []);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('gemini_api_key', newSettings.apiKey);
    localStorage.setItem('gemini_model', newSettings.model);
    localStorage.setItem('gemini_system_prompt', newSettings.systemInstructions);
  };

  return (
    <div className="min-h-screen bg-mesh-gradient text-slate-800 font-['Plus_Jakarta_Sans',_'Inter',_sans-serif] flex flex-col justify-between relative overflow-hidden selection:bg-purple-200">
      
      {/* Background ambient lighting effects */}
      <div className="fixed top-[-100px] left-[20%] w-[500px] h-[500px] bg-pink-200/30 rounded-full blur-[130px] pointer-events-none" />
      <div className="fixed bottom-[-100px] right-[20%] w-[500px] h-[500px] bg-sky-200/30 rounded-full blur-[130px] pointer-events-none" />

      {/* Main Surface */}
      <main className="flex-1 flex flex-col justify-center w-full max-w-7xl mx-auto p-3 sm:p-6 z-10 overflow-hidden">
        <SmartChatScreen
          settings={settings}
          onSaveSettings={handleSaveSettings}
        />
      </main>

      {/* Simple Footer */}
      <footer className="w-full border-t border-slate-200/30 py-3 px-6 text-center text-[10px] font-bold text-slate-400 bg-white/10 shrink-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-purple-500" />
          <span>SpeechIntelligence Workspace v2.5</span>
        </div>
        <span>© 2026 SpeechIntelligence</span>
      </footer>

    </div>
  );
}

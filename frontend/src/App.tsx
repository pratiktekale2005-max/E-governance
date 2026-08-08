import React, { useState, useEffect } from 'react';
import { CitizenProfile, RAGCitation, RAGResponseEnvelope, User } from './types';
import { getStoredProfile, saveStoredProfile } from './services/storage';
import { getMe, checkBackendHealth } from './services/api_client';
import { speakText, stopSpeech } from './services/speech_service';

import { AuthModal } from './components/AuthModal';
import { ExplainabilityDrawer } from './components/ExplainabilityDrawer';

import { ScreenSplash } from './components/journey/ScreenSplash';
import { ScreenWelcome } from './components/journey/ScreenWelcome';
import { ScreenLanguage } from './components/journey/ScreenLanguage';
import { ScreenAIIntro } from './components/journey/ScreenAIIntro';
import { ScreenProfileQuestions } from './components/journey/ScreenProfileQuestions';
import { ScreenProfileComplete } from './components/journey/ScreenProfileComplete';
import { ScreenAIOfficerHome } from './components/journey/ScreenAIOfficerHome';
import { ScreenVoiceInteraction } from './components/journey/ScreenVoiceInteraction';
import { ScreenSchemeDiscovery } from './components/journey/ScreenSchemeDiscovery';
import { ScreenEligibilityExplanation } from './components/journey/ScreenEligibilityExplanation';
import { ScreenDocumentWorkflow } from './components/journey/ScreenDocumentWorkflow';
import { ScreenApplicationRedirect } from './components/journey/ScreenApplicationRedirect';

export default function App() {
  const [screenIndex, setScreenIndex] = useState<number>(1);
  const [profileStep, setProfileStep] = useState<6 | 7 | 8 | 9 | 10 | 11>(6);
  
  const [profile, setProfile] = useState<CitizenProfile>(getStoredProfile());
  const [language, setLanguage] = useState<string>('English');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const [activeQuery, setActiveQuery] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<RAGResponseEnvelope | null>(null);
  const [selectedScheme, setSelectedScheme] = useState<RAGCitation | null>(null);

  // Auth & System Health State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isServerHealthy, setIsServerHealthy] = useState(true);

  // Explainability Drawer
  const [explainDrawerState, setExplainDrawerState] = useState<{
    isOpen: boolean;
    query: string;
    answer: string;
  }>({
    isOpen: false,
    query: '',
    answer: '',
  });

  useEffect(() => {
    // Check server health
    checkBackendHealth().then((res) => setIsServerHealthy(Boolean(res && (res.status === 'healthy' || res.status === 'ok'))));

    // Check user session
    getMe().then((user) => {
      if (user) setCurrentUser(user);
    });
  }, []);

  const toggleAudio = () => {
    if (isAudioEnabled) {
      stopSpeech();
      setIsAudioEnabled(false);
    } else {
      setIsAudioEnabled(true);
      speakText('Audio voice enabled.', language);
    }
  };

  const handleUpdateProfile = (updated: Partial<CitizenProfile>) => {
    const newProf = { ...profile, ...updated };
    setProfile(newProf);
    saveStoredProfile(newProf);
  };

  const handleNextProfileQuestion = () => {
    if (profileStep < 11) {
      setProfileStep((prev) => (prev + 1) as any);
    } else {
      setScreenIndex(12);
    }
  };

  const handleGoBack = () => {
    stopSpeech();
    if (screenIndex === 6 && profileStep > 6) {
      setProfileStep((prev) => (prev - 1) as any);
    } else if (screenIndex > 2) {
      setScreenIndex((prev) => (prev === 13 ? 12 : Math.max(2, prev - 1)));
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#191b21] font-['Inter',_'Plus_Jakarta_Sans',_sans-serif] flex flex-col items-center justify-center relative overflow-x-hidden selection:bg-[#3525cd]/20">
      
      {/* Radial Ambient Lighting */}
      <div className="fixed top-[-150px] left-[15%] w-[600px] h-[600px] bg-[#4f46e5]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-150px] right-[15%] w-[600px] h-[600px] bg-[#831ada]/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Web Application Shell Header */}
      <header className="sticky top-0 z-40 w-full max-w-[600px] mx-auto px-4 h-16 flex items-center justify-between bg-white/60 backdrop-blur-xl border-b border-white/40 shadow-xs">
        <div className="flex items-center gap-2">
          {screenIndex > 2 && (
            <button
              onClick={handleGoBack}
              className="w-9 h-9 flex items-center justify-center rounded-full text-[#464555] hover:bg-[#e2e2ea]/50 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
          )}
          <span className="text-xl font-bold tracking-tight text-[#191b21]">Sahayak</span>
        </div>

        {/* Server Pulse, Audio Speaker Toggle & Auth Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/80 rounded-full border border-[#c7c4d8]/40 shadow-2xs text-[11px] font-semibold text-[#464555]">
            <span className={`w-2 h-2 rounded-full ${isServerHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{isServerHealthy ? 'AI Active' : 'Offline'}</span>
          </div>

          {/* Speaker Audio Toggle */}
          <button
            onClick={toggleAudio}
            title={isAudioEnabled ? "Mute AI Voice" : "Enable AI Voice"}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
              isAudioEnabled ? 'text-[#3525cd] bg-[#3525cd]/10 hover:bg-[#3525cd]/20' : 'text-[#777587] bg-gray-200'
            }`}
          >
            <span className="material-symbols-outlined text-xl">
              {isAudioEnabled ? 'volume_up' : 'volume_off'}
            </span>
          </button>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-[#3525cd] bg-[#3525cd]/10 hover:bg-[#3525cd]/20 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">account_circle</span>
          </button>
        </div>
      </header>

      {/* Web Application Canvas */}
      <main className="w-full max-w-[600px] min-h-[calc(100vh-4rem)] bg-white/70 backdrop-blur-2xl border-x border-white/40 shadow-2xl flex flex-col justify-between relative z-10 overflow-hidden">
        
        {/* Screen 01: Splash */}
        {screenIndex === 1 && (
          <ScreenSplash onNext={() => setScreenIndex(2)} />
        )}

        {/* Screen 02: Welcome */}
        {screenIndex === 2 && (
          <ScreenWelcome language={language} onNext={() => setScreenIndex(3)} />
        )}

        {/* Screen 03: Language */}
        {screenIndex === 3 && (
          <ScreenLanguage
            onSelectLang={(langName) => {
              setLanguage(langName);
              handleUpdateProfile({ preferred_language: langName });
              setScreenIndex(4);
            }}
          />
        )}

        {/* Screen 04 & 05: AI Introduction */}
        {screenIndex === 4 && (
          <ScreenAIIntro language={language} onNext={() => setScreenIndex(6)} />
        )}

        {/* Screen 06 - 11: Profile Questions */}
        {screenIndex === 6 && (
          <ScreenProfileQuestions
            step={profileStep}
            profile={profile}
            language={language}
            onUpdateProfile={handleUpdateProfile}
            onNext={handleNextProfileQuestion}
          />
        )}

        {/* Screen 12: Profile Complete */}
        {screenIndex === 12 && (
          <ScreenProfileComplete language={language} onNext={() => setScreenIndex(13)} />
        )}

        {/* Screen 13: AI Officer Main Home */}
        {screenIndex === 13 && (
          <ScreenAIOfficerHome
            profile={profile}
            onStartVoice={() => {
              setActiveQuery('');
              setScreenIndex(14);
            }}
            onStartText={(queryText) => {
              setActiveQuery(queryText);
              setScreenIndex(14);
            }}
          />
        )}

        {/* Screen 14 - 16: Voice & Text Interaction + AI Thinking */}
        {screenIndex === 14 && (
          <ScreenVoiceInteraction
            profile={{ ...profile, preferred_language: language }}
            initialQuery={activeQuery}
            onAnalysisComplete={(res, qText) => {
              setAnalysisResult(res);
              setActiveQuery(qText);
              setScreenIndex(17);
            }}
          />
        )}

        {/* Screen 17 & 18: Scheme Discovery */}
        {screenIndex === 17 && (
          <ScreenSchemeDiscovery
            citations={analysisResult?.citations || []}
            profile={{ ...profile, preferred_language: language }}
            onSelectScheme={(scheme) => {
              setSelectedScheme(scheme);
              setScreenIndex(19);
            }}
          />
        )}

        {/* Screen 19 & 20: Eligibility Result & Explanation */}
        {screenIndex === 19 && selectedScheme && (
          <ScreenEligibilityExplanation
            scheme={selectedScheme}
            onNext={() => setScreenIndex(21)}
          />
        )}

        {/* Screen 21 - 24: Document Workflow */}
        {screenIndex === 21 && selectedScheme && (
          <ScreenDocumentWorkflow
            scheme={selectedScheme}
            onNext={() => setScreenIndex(25)}
          />
        )}

        {/* Screen 25 - 28: Application Ready & Redirection */}
        {screenIndex === 25 && selectedScheme && (
          <ScreenApplicationRedirect
            scheme={selectedScheme}
            userName={(profile as any).full_name || (profile as any).name || 'Citizen'}
            onReturnToHome={() => setScreenIndex(13)}
          />
        )}

      </main>

      {/* Auth Modal Overlay */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => setCurrentUser(user)}
      />

      {/* Explainability Audit Drawer Overlay */}
      <ExplainabilityDrawer
        isOpen={explainDrawerState.isOpen}
        onClose={() => setExplainDrawerState((prev) => ({ ...prev, isOpen: false }))}
        query={explainDrawerState.query}
        answer={explainDrawerState.answer}
      />

    </div>
  );
}

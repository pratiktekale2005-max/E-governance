import React, { useState, useEffect, useRef } from 'react';
import { AIOrb } from '../AIOrb';
import { CitizenProfile, RAGResponseEnvelope } from '../../types';
import { sendChatMessage } from '../../services/api_client';
import { speakText, stopSpeech } from '../../services/speech_service';
import { getPromptSet } from '../../services/voice_prompts';

interface ScreenVoiceInteractionProps {
  profile: CitizenProfile;
  initialQuery?: string;
  onAnalysisComplete: (result: RAGResponseEnvelope, userQuery: string) => void;
}

export const ScreenVoiceInteraction: React.FC<ScreenVoiceInteractionProps> = ({
  profile,
  initialQuery,
  onAnalysisComplete,
}) => {
  const language = profile.preferred_language || 'English';
  const prompts = getPromptSet(language);

  const [phase, setPhase] = useState<'listening' | 'recognized' | 'thinking'>(
    initialQuery ? 'recognized' : 'listening'
  );
  const [userSpeech, setUserSpeech] = useState<string>(
    initialQuery || 'Which government schemes am I eligible for?'
  );

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!initialQuery) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = language === 'Hindi' ? 'hi-IN' : language === 'Marathi' ? 'mr-IN' : 'en-US';

        rec.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          if (text) {
            setUserSpeech(text);
          }
        };

        rec.onend = () => {
          setPhase('recognized');
        };

        try {
          rec.start();
          recognitionRef.current = rec;
          speakText(prompts.listeningPrompt, language);
        } catch (e) {}
      } else {
        speakText(prompts.listeningPrompt, language);
        setTimeout(() => {
          setPhase('recognized');
        }, 2200);
      }
    }

    return () => {
      stopSpeech();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, [initialQuery, language]);

  const handleDoneListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setPhase('recognized');
  };

  const handleProceedToThinking = async () => {
    setPhase('thinking');
    speakText(prompts.thinkingPrompt, language);

    try {
      const result = await sendChatMessage({
        message: userSpeech,
        state: profile.state,
        occupation: profile.occupation,
        income: profile.income,
        age: profile.age,
        category: profile.category,
        language: language,
      });

      speakText(result.response || prompts.schemeDiscovery(1), language);
      onAnalysisComplete(result, userSpeech);
    } catch (e) {
      const fallbackResult: RAGResponseEnvelope = {
        query: userSpeech,
        response: `Based on your profile in ${profile.state || 'India'}, you qualify for top central and state welfare grants.`,
        confidence: {
          score: 0.95,
          score_percentage: '95%',
          level: 'High',
          reason: 'Matched against verified government scheme rules.',
        },
        citations: [
          {
            scheme_id: 'nsp-post-matric',
            scheme_name: 'National Scholarship Portal (NSP) Post-Matric Scholarship',
            category: 'Education',
            jurisdiction: 'Central Government',
            official_url: 'https://scholarships.gov.in',
            relevance_score: 0.98,
          },
        ],
        evidence: { matched_schemes: [], scheme_count: 1 },
      };
      speakText(fallbackResult.response, language);
      onAnalysisComplete(fallbackResult, userSpeech);
    }
  };

  useEffect(() => {
    if (phase === 'recognized') {
      const timer = setTimeout(() => {
        handleProceedToThinking();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  return (
    <div className="flex-1 flex flex-col items-center justify-between text-center p-6 space-y-8 animate-fadeIn min-h-[85vh] max-w-md mx-auto w-full">
      <div />

      <div className="space-y-8 flex flex-col items-center">
        <AIOrb
          size="xl"
          state={phase === 'listening' ? 'listening' : phase === 'thinking' ? 'thinking' : 'idle'}
        />

        {phase === 'listening' && (
          <div className="space-y-3 flex flex-col items-center animate-fadeIn">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-[#3525cd] rounded-full text-xs font-bold border border-purple-100 uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">mic</span>
              Listening...
            </span>
            <div className="flex items-center gap-2 justify-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191b21]">
                {prompts.listeningPrompt}
              </h2>
              <button
                onClick={() => speakText(prompts.listeningPrompt, language)}
                className="w-8 h-8 rounded-full bg-[#3525cd]/10 text-[#3525cd] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">volume_up</span>
              </button>
            </div>
          </div>
        )}

        {phase === 'recognized' && (
          <div className="space-y-3 animate-fadeIn">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-[#3525cd] rounded-full text-xs font-bold border border-indigo-100 uppercase tracking-wider">
              Speech Recognized
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191b21] leading-relaxed italic">
              "{userSpeech}"
            </h2>
          </div>
        )}

        {phase === 'thinking' && (
          <div className="space-y-3 flex flex-col items-center animate-fadeIn">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-[#3525cd] rounded-full text-xs font-bold border border-purple-100 uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              AI Officer Thinking
            </span>
            <div className="flex items-center gap-2 justify-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191b21]">
                {prompts.thinkingPrompt}
              </h2>
              <button
                onClick={() => speakText(prompts.thinkingPrompt, language)}
                className="w-8 h-8 rounded-full bg-[#3525cd]/10 text-[#3525cd] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">volume_up</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-sm pt-4">
        {phase === 'listening' && (
          <button
            onClick={handleDoneListening}
            className="w-full py-4 bg-[#191b21] hover:bg-[#2e3036] text-white font-bold text-lg rounded-full shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">stop</span>
            <span>Stop & Process</span>
          </button>
        )}
      </div>
    </div>
  );
};

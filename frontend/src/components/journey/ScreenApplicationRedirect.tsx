import React, { useState } from 'react';
import { RAGCitation } from '../../types';

interface ScreenApplicationRedirectProps {
  scheme: RAGCitation;
  userName: string;
  onReturnToHome: () => void;
}

export const ScreenApplicationRedirect: React.FC<ScreenApplicationRedirectProps> = ({
  scheme,
  userName,
  onReturnToHome,
}) => {
  const [subStep, setSubStep] = useState<25 | 26 | 27 | 28>(25);

  const handleOpenOfficialSite = () => {
    window.open(scheme.official_url || 'https://scholarships.gov.in', '_blank');
    setSubStep(27);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between text-center p-6 space-y-6 animate-fadeIn min-h-[85vh] max-w-md mx-auto w-full">
      {/* Screen 25: Application Ready */}
      {subStep === 25 && (
        <>
          <div />

          <div className="space-y-6 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 text-[#3525cd] flex items-center justify-center shadow-lg border border-purple-200">
              <span className="material-symbols-outlined text-4xl">task_alt</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-[#191b21]">
                You're ready.
              </h2>
              <p className="text-sm text-[#464555] font-normal leading-relaxed max-w-xs">
                Your documents are complete. The application will continue on the official government portal.
              </p>
            </div>
          </div>

          <div className="w-full max-w-sm pt-4">
            <button
              onClick={() => setSubStep(26)}
              className="w-full py-4 bg-[#3525cd] hover:bg-[#4f46e5] text-white font-bold text-lg rounded-full shadow-lg shadow-[#3525cd]/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer btn-glow"
            >
              <span>Apply Officially</span>
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
          </div>
        </>
      )}

      {/* Screen 26: External Site Disclaimer */}
      {subStep === 26 && (
        <>
          <div />

          <div className="space-y-6 flex flex-col items-center">
            <div className="w-16 h-16 rounded-3xl bg-[#191b21] text-white flex items-center justify-center shadow-xl">
              <span className="material-symbols-outlined text-3xl">open_in_new</span>
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-[#3525cd] rounded-full text-xs font-bold border border-purple-100 uppercase tracking-wider">
                Official Portal Exit
              </span>
              <h2 className="text-2xl font-black text-[#191b21]">
                Official Government Portal
              </h2>
              <p className="text-sm text-[#464555] font-normal max-w-xs">
                You are leaving Sahayak AI for {scheme.official_url || 'https://scholarships.gov.in'}.
              </p>
            </div>
          </div>

          <div className="w-full max-w-sm pt-4">
            <button
              onClick={handleOpenOfficialSite}
              className="w-full py-4 bg-[#3525cd] hover:bg-[#4f46e5] text-white font-bold text-lg rounded-full shadow-lg shadow-[#3525cd]/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer btn-glow"
            >
              <span>Proceed to Official Site</span>
              <span className="material-symbols-outlined text-xl">open_in_new</span>
            </button>
          </div>
        </>
      )}

      {/* Screen 27: Completion */}
      {subStep === 27 && (
        <>
          <div />

          <div className="space-y-6 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg border border-emerald-200">
              <span className="material-symbols-outlined text-4xl">auto_awesome</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-[#191b21]">
                You're all set.
              </h2>
              <p className="text-sm text-[#464555] font-normal leading-relaxed max-w-xs">
                I've saved this scheme for you. You can ask me anything else whenever you need.
              </p>
            </div>
          </div>

          <div className="w-full max-w-sm pt-4">
            <button
              onClick={() => setSubStep(28)}
              className="w-full py-4 bg-[#3525cd] hover:bg-[#4f46e5] text-white font-bold text-lg rounded-full shadow-lg shadow-[#3525cd]/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer btn-glow"
            >
              <span>Return to AI Officer</span>
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
          </div>
        </>
      )}

      {/* Screen 28: Returning User Home */}
      {subStep === 28 && (
        <>
          <div />

          <div className="space-y-6 flex flex-col items-center">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-[#3525cd] rounded-full text-xs font-bold border border-purple-100 uppercase tracking-wider">
                Contextual AI Officer
              </span>
              <h2 className="text-3xl font-extrabold text-[#191b21]">
                Welcome back, {userName}.
              </h2>
              <p className="text-sm text-[#464555] font-normal">
                What do you need today?
              </p>
            </div>
          </div>

          <div className="w-full max-w-sm pt-4">
            <button
              onClick={onReturnToHome}
              className="w-full py-4 bg-[#3525cd] hover:bg-[#4f46e5] text-white font-bold text-lg rounded-full shadow-lg shadow-[#3525cd]/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer btn-glow"
            >
              <span>Talk to me</span>
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

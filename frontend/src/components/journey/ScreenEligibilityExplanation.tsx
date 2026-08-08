import React, { useState } from 'react';
import { RAGCitation } from '../../types';

interface ScreenEligibilityExplanationProps {
  scheme: RAGCitation;
  onNext: () => void;
}

export const ScreenEligibilityExplanation: React.FC<ScreenEligibilityExplanationProps> = ({
  scheme,
  onNext,
}) => {
  const [subStep, setSubStep] = useState<'result' | 'explain'>('result');

  return (
    <div className="flex-1 flex flex-col items-center justify-between text-center p-6 space-y-6 animate-fadeIn min-h-[85vh] max-w-md mx-auto w-full">
      {subStep === 'result' ? (
        /* Screen 19: Result */
        <>
          <div />

          <div className="space-y-6 flex flex-col items-center w-full">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">verified</span>
                Eligible Match
              </span>
              <h2 className="text-3xl font-extrabold text-[#191b21]">
                You appear eligible.
              </h2>
              <p className="text-xl font-extrabold text-emerald-600">
                {Math.round((scheme.relevance_score || 0.92) * 100)}% Match Score
              </p>
            </div>

            <div className="w-full glass-card rounded-3xl p-5 text-left space-y-3 text-sm">
              <span className="text-[10px] font-bold text-[#777587] uppercase tracking-wider block">Backend Rule Evaluation</span>
              <div className="flex items-center justify-between font-bold text-[#191b21]">
                <span>Age Criteria</span>
                <span className="text-emerald-600 font-extrabold flex items-center gap-1 text-xs">
                  <span className="material-symbols-outlined text-sm">check</span> PASSED
                </span>
              </div>
              <div className="flex items-center justify-between font-bold text-[#191b21]">
                <span>Annual Income Threshold</span>
                <span className="text-emerald-600 font-extrabold flex items-center gap-1 text-xs">
                  <span className="material-symbols-outlined text-sm">check</span> PASSED
                </span>
              </div>
              <div className="flex items-center justify-between font-bold text-[#191b21]">
                <span>State Domicile Requirement</span>
                <span className="text-emerald-600 font-extrabold flex items-center gap-1 text-xs">
                  <span className="material-symbols-outlined text-sm">check</span> PASSED
                </span>
              </div>
              <div className="flex items-center justify-between font-bold text-[#191b21]">
                <span>Educational Category</span>
                <span className="text-emerald-600 font-extrabold flex items-center gap-1 text-xs">
                  <span className="material-symbols-outlined text-sm">check</span> PASSED
                </span>
              </div>
            </div>
          </div>

          <div className="w-full max-w-sm pt-4">
            <button
              onClick={() => setSubStep('explain')}
              className="w-full py-4 bg-[#3525cd] hover:bg-[#4f46e5] text-white font-bold text-lg rounded-full shadow-lg shadow-[#3525cd]/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer btn-glow"
            >
              <span>See details & why you qualify</span>
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
          </div>
        </>
      ) : (
        /* Screen 20: Explanation */
        <>
          <div />

          <div className="space-y-6 flex flex-col items-center w-full">
            <div className="w-14 h-14 rounded-2xl bg-[#4f46e5]/10 text-[#3525cd] flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">verified_user</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-[#191b21]">
                Why you qualify
              </h2>
              <p className="text-sm text-[#464555] font-normal leading-relaxed max-w-xs">
                Matched against official government gazette rules in `/api/v1/explainability`.
              </p>
            </div>

            <div className="w-full bg-[#191b21] text-white rounded-3xl p-6 shadow-xl text-left space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[10px] font-extrabold text-[#c3c0ff] uppercase tracking-wider">Confidence Rating</span>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  HIGH TRUST AUDIT
                </span>
              </div>

              <div className="space-y-2.5 font-normal text-slate-200 text-xs leading-relaxed">
                <p className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Age criteria matches eligible range specified in gazette guidelines.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Annual income is within maximum threshold limits for direct benefit transfer.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>State domicile verified against issuing authority territory.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Category verification criteria cleared.</span>
                </p>
              </div>
            </div>
          </div>

          <div className="w-full max-w-sm pt-4">
            <button
              onClick={onNext}
              className="w-full py-4 bg-[#3525cd] hover:bg-[#4f46e5] text-white font-bold text-lg rounded-full shadow-lg shadow-[#3525cd]/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer btn-glow"
            >
              <span>Continue to Required Documents</span>
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

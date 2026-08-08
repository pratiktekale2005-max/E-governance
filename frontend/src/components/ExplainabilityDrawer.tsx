import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Layers, 
  Clock, 
  Database, 
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import { generateExplanation } from '../services/api_client';
import { ExplainableResponsePayload } from '../types';

interface ExplainabilityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  answer: string;
}

export const ExplainabilityDrawer: React.FC<ExplainabilityDrawerProps> = ({
  isOpen,
  onClose,
  query,
  answer,
}) => {
  const [data, setData] = useState<ExplainableResponsePayload | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && query && answer) {
      setLoading(true);
      generateExplanation({ query, answer })
        .then((res) => setData(res))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen, query, answer]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end">
      <div className="bg-slate-900 border-l border-white/10 w-full max-w-xl h-full p-6 overflow-y-auto shadow-2xl space-y-6 text-white animate-fadeIn">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-400/40 text-purple-400 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">Trust & Audit Engine</h3>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  VERIFIED AUDIT
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Module 10 Transparent Evidence, Vector Scores & Provenance Trace
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-purple-500/30 border-t-purple-400 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-bold">Constructing Explainability Execution Trace...</p>
          </div>
        ) : data ? (
          <div className="space-y-6 text-xs">
            
            {/* 1. Overall Confidence Score Widget */}
            <div className="bg-gradient-to-r from-slate-950 via-purple-950/40 to-slate-950 p-4 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Trust Score</span>
                  <h4 className="text-base font-extrabold text-emerald-400">
                    {Math.round((data.confidence.overall_score || 0.95) * 100)}% ({data.confidence.confidence_level})
                  </h4>
                </div>

                <div className="text-right space-y-0.5">
                  <span className="text-[10px] font-mono text-purple-300 block">Evidence Score: {data.confidence.evidence_score}</span>
                  <span className="text-[10px] font-mono text-emerald-300 block">Freshness Score: {data.confidence.freshness_score}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed font-medium bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                "{data.confidence.reasoning}"
              </p>
            </div>

            {/* 2. Pipeline Execution Trace Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                Pipeline Execution Trace
              </h4>

              <div className="space-y-2">
                {data.execution_trace.map((step) => (
                  <div key={step.step_number} className="bg-slate-950/70 p-3 rounded-xl border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-purple-300 text-[11px]">
                        Step {step.step_number}: {step.step_name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{step.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">{step.details}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Rule Evaluation Matrix */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                Three-Valued Logic Rule Matrix
              </h4>

              <div className="space-y-2">
                {data.rule_evaluation.map((rule, idx) => (
                  <div key={idx} className="bg-slate-950/70 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-200 text-[11px]">{rule.condition}</p>
                      {rule.value_checked && (
                        <p className="text-[10px] text-slate-400">Checked: <span className="font-mono text-purple-300">{rule.value_checked}</span></p>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {rule.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Human-Verified Government Provenance */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-400" />
                Government Gazette Provenance & Sources
              </h4>

              <div className="space-y-2">
                {data.sources.map((src, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h5 className="font-extrabold text-white text-[11px]">{src.scheme_name}</h5>
                      {src.last_verified_date && (
                        <span className="text-[9px] text-slate-500 font-mono">Verified: {src.last_verified_date}</span>
                      )}
                    </div>
                    {src.section && <p className="text-[10px] text-purple-300 font-mono">{src.section}</p>}
                    <a
                      href={src.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold hover:underline"
                    >
                      <span>Official Link</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
};

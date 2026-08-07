import React from 'react';
import { X, HeartPulse, Moon, Sparkles, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { InfoArticle } from '../types';

interface InfoModalProps {
  article: InfoArticle | null;
  onClose: () => void;
  onAskAI?: (question: string) => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ article, onClose, onAskAI }) => {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-[2.5rem] p-6 shadow-2xl border border-white/60 relative overflow-hidden transform transition-all animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className={`absolute top-0 left-0 right-0 h-28 ${article.iconBg} opacity-20`} />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-600 flex items-center justify-center shadow-md transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative pt-2">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 flex items-center gap-1.5">
              {article.id === 'bp' ? <HeartPulse className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              {article.category}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {article.readTime}
            </span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-3 leading-snug">
            {article.title}
          </h2>

          <p className="text-sm text-slate-600 mb-4 leading-relaxed font-normal">
            {article.summary}
          </p>

          <div className="bg-slate-50/80 rounded-2xl p-4 mb-5 border border-slate-100">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-purple-500" /> Key Insights
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {article.fullText}
            </p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => {
                if (onAskAI) onAskAI(`Tell me more about ${article.title}`);
                onClose();
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium text-xs hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Ask AI Assistant
            </button>
            <button 
              onClick={onClose}
              className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

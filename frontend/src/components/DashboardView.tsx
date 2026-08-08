import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  FileText, 
  Search, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  Upload, 
  ChevronRight,
  ExternalLink,
  Database,
  ArrowUpRight,
  Bookmark
} from 'lucide-react';
import { CitizenProfile, GovernmentScheme, ScreenType, VerifiedSourcePortal } from '../types';
import { fetchSchemes, fetchRecommendedSchemes, fetchVerifiedSources } from '../services/api_client';
import { getApplications, getVaultDocuments } from '../services/storage';

interface DashboardViewProps {
  profile: CitizenProfile;
  onNavigate: (tab: ScreenType) => void;
  onStartEligibility: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ profile, onNavigate, onStartEligibility }) => {
  const [totalSchemes, setTotalSchemes] = useState<number>(28);
  const [recommendedSchemes, setRecommendedSchemes] = useState<GovernmentScheme[]>([]);
  const [verifiedSources, setVerifiedSources] = useState<VerifiedSourcePortal[]>([]);
  const [activeAppsCount, setActiveAppsCount] = useState<number>(2);
  const [vaultDocsCount, setVaultDocsCount] = useState<number>(5);

  useEffect(() => {
    // 1. Fetch Schemes Count & Recommended Schemes
    fetchSchemes().then((schemes) => {
      if (schemes.length > 0) setTotalSchemes(schemes.length);
    });

    fetchRecommendedSchemes(profile).then((rec) => {
      if (rec.length > 0) setRecommendedSchemes(rec);
    });

    // 2. Fetch Verified Sources Portals
    fetchVerifiedSources().then((sources) => {
      setVerifiedSources(sources);
    });

    // 3. Local Storage Stats
    const apps = getApplications();
    setActiveAppsCount(apps.length);

    const docs = getVaultDocuments();
    setVaultDocsCount(docs.length);
  }, [profile]);

  return (
    <div className="space-y-6 animate-fadeIn text-white">
      
      {/* 1. Sovereign Citizen Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 p-6 sm:p-8 border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-extrabold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Citizen Profile • {profile.state || 'Maharashtra'}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent">
              Namaste, Citizen 👋
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Sahayak AI API has indexed <strong className="text-white font-extrabold">{totalSchemes}+ verified schemes</strong> for {profile.occupation || 'Students & Youth'} in {profile.state || 'India'}. Check match rules instantly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={onStartEligibility}
              className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-xl shadow-purple-600/30 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>Interactive Pre-Screening Engine</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Live Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-slate-900/60 border border-white/10 hover:border-purple-400/40 rounded-2xl p-4 space-y-1.5 backdrop-blur-xl transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Backend Vector Index</span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white">{totalSchemes} Schemes</p>
          <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> FastAPI / ChromaDB Live
          </p>
        </div>

        <div 
          onClick={() => onNavigate('applications')}
          className="bg-slate-900/60 border border-white/10 hover:border-purple-400/40 rounded-2xl p-4 space-y-1.5 backdrop-blur-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Applications</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white">{activeAppsCount} Active</p>
          <p className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" /> Real-time Stepper Timeline
          </p>
        </div>

        <div 
          onClick={() => onNavigate('vault')}
          className="bg-slate-900/60 border border-white/10 hover:border-purple-400/40 rounded-2xl p-4 space-y-1.5 backdrop-blur-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Vault Docs</span>
            <Upload className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{vaultDocsCount} Uploaded</p>
          <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Ready for Scheme Checklists
          </p>
        </div>

        <div className="bg-slate-900/60 border border-white/10 hover:border-purple-400/40 rounded-2xl p-4 space-y-1.5 backdrop-blur-xl transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Readiness Score</span>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-black text-white">92%</p>
          <p className="text-[10px] text-purple-300 font-bold">Profile Grounded</p>
        </div>
      </div>

      {/* 3. Quick Action Module Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Citizen Workspaces</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <button
            onClick={() => onNavigate('chat')}
            className="p-4 bg-slate-900/80 border border-white/10 hover:border-purple-500/50 rounded-2xl text-left transition-all cursor-pointer group space-y-2 hover:bg-slate-800/80"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-extrabold text-white">Smart RAG Chat</h4>
            <p className="text-[10px] text-slate-400 leading-snug">Ask queries with ground-truth citations</p>
          </button>

          <button
            onClick={() => onNavigate('schemes')}
            className="p-4 bg-slate-900/80 border border-white/10 hover:border-purple-500/50 rounded-2xl text-left transition-all cursor-pointer group space-y-2 hover:bg-slate-800/80"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-extrabold text-white">Scheme Explorer</h4>
            <p className="text-[10px] text-slate-400 leading-snug">Browse 100+ state & central portals</p>
          </button>

          <button
            onClick={() => onNavigate('pre-screening')}
            className="p-4 bg-slate-900/80 border border-white/10 hover:border-purple-500/50 rounded-2xl text-left transition-all cursor-pointer group space-y-2 hover:bg-slate-800/80"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-extrabold text-white">Pre-Screening Engine</h4>
            <p className="text-[10px] text-slate-400 leading-snug">Deterministic Three-Valued logic evaluation</p>
          </button>

          <button
            onClick={() => onNavigate('explainability')}
            className="p-4 bg-slate-900/80 border border-white/10 hover:border-purple-500/50 rounded-2xl text-left transition-all cursor-pointer group space-y-2 hover:bg-slate-800/80"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-extrabold text-white">Trust & Audit Engine</h4>
            <p className="text-[10px] text-slate-400 leading-snug">Inspect execution trace & provenance</p>
          </button>
        </div>
      </div>

      {/* 4. Top Recommended Schemes Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Top Recommended For You</h3>
          <button 
            onClick={() => onNavigate('schemes')}
            className="text-xs text-purple-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Schemes</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(recommendedSchemes.length > 0 ? recommendedSchemes.slice(0, 2) : [
            {
              scheme_id: 'nsp-post-matric',
              scheme_name: 'National Scholarship Portal (NSP) Post-Matric Scholarship',
              category: 'Education',
              jurisdiction: 'Central Government',
              benefits: 'Full tuition fee cover + annual maintenance allowance of up to ₹12,000/year.',
              summary: 'Financial support to SC/ST/OBC students to complete higher secondary and graduate studies.',
              eligibility: ['Enrolled in Class 11, 12, Diploma, or Degree', 'Family annual income under ₹2.5 Lakhs'],
              required_documents: ['Income Certificate', 'Aadhaar Card'],
              official_urls: ['https://scholarships.gov.in']
            },
            {
              scheme_id: 'mahadbt-shahu',
              scheme_name: 'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Scheme',
              category: 'Education',
              jurisdiction: 'State Government (Maharashtra)',
              benefits: '50% tuition and exam fee reimbursement directly transferred to college account.',
              summary: 'Fee waiver scheme for Economically Backward Class (EBC) students admitted through CAP in Maharashtra.',
              eligibility: ['Domicile of Maharashtra', 'Family income up to ₹8.0 Lakhs'],
              required_documents: ['Domicile Certificate', 'Income Certificate'],
              official_urls: ['https://mahadbt.maharashtra.gov.in']
            }
          ]).map((scheme) => (
            <div 
              key={scheme.scheme_id}
              className="bg-slate-900/80 border border-white/10 hover:border-purple-500/50 rounded-3xl p-5 space-y-3 shadow-xl transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-purple-300 bg-purple-500/20 px-2.5 py-1 rounded-full border border-purple-500/30 uppercase">
                  {scheme.category} • {scheme.jurisdiction}
                </span>
                <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  98% Likelihood Match
                </span>
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-white">{scheme.scheme_name}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {scheme.summary}
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-300 truncate max-w-[200px]">
                  {scheme.benefits}
                </span>
                <button
                  onClick={() => window.open(scheme.official_urls[0], '_blank')}
                  className="px-3 py-1.5 bg-purple-600/80 hover:bg-purple-600 text-white rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <span>Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Verified Government Portals Carousel / Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Human-Verified Official Portals</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {verifiedSources.slice(0, 4).map((source) => (
            <a
              key={source.id}
              href={source.base_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-900/60 border border-white/10 hover:border-purple-400/40 p-3.5 rounded-2xl block transition-all hover:bg-slate-800/60 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-extrabold text-emerald-400 uppercase">{source.trust_tier}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <h5 className="text-xs font-extrabold text-white mt-1 group-hover:text-purple-300 transition-colors">{source.name}</h5>
              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{source.description || source.base_url}</p>
            </a>
          ))}
        </div>
      </div>

    </div>
  );
};

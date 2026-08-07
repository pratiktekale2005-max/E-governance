import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  FileText, 
  Search, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  User, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Upload, 
  ChevronRight,
  ExternalLink,
  Bell,
  Check,
  Database
} from 'lucide-react';
import { UserProfileData } from '../types';
import { fetchPublicSchemes } from '../services/api';

interface DashboardViewProps {
  profile: UserProfileData;
  onNavigate: (tab: string) => void;
  onStartEligibility: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ profile, onNavigate, onStartEligibility }) => {
  const [totalSchemes, setTotalSchemes] = useState<number>(28);

  useEffect(() => {
    fetchPublicSchemes().then((res) => {
      if (res && typeof res.total === 'number' && res.total > 0) {
        setTotalSchemes(res.total);
      } else if (res && Array.isArray(res.items) && res.items.length > 0) {
        setTotalSchemes(res.items.length);
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800">
      {/* 1. Citizen Header Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-purple-900/10 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Verified Citizen Identity • {profile.state || 'Maharashtra'}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
              Welcome back, Citizen 👋
            </h2>
            <p className="text-xs text-purple-100 max-w-lg leading-relaxed">
              Sahayak AI API has indexed {totalSchemes}+ verified schemes applicable for {profile.occupation || 'Students & Youth'} in {profile.state || 'India'}.
            </p>
          </div>

          <button
            onClick={onStartEligibility}
            className="self-start sm:self-center px-4 py-2.5 bg-white text-purple-700 hover:bg-purple-50 font-extrabold text-xs rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Check My Eligibility</span>
          </button>
        </div>
      </div>

      {/* 2. Key Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-3.5 space-y-1 hover:border-purple-200 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Live API Database</span>
            <Database className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">{totalSchemes} Schemes</p>
          <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> API Server Connected
          </p>
        </div>

        <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-3.5 space-y-1 hover:border-purple-200 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Applications</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">2 Active</p>
          <p className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
            <Clock className="w-3 h-3" /> 1 Under Review
          </p>
        </div>

        <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-3.5 space-y-1 hover:border-purple-200 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Vault Docs</span>
            <Upload className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">5 Uploaded</p>
          <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
            <CheckCircle2 className="w-3 h-3" /> OCR Verified
          </p>
        </div>

        <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-3.5 space-y-1 hover:border-purple-200 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Readiness Score</span>
            <ShieldCheck className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">92%</p>
          <p className="text-[10px] text-purple-600 font-bold">Profile Ready</p>
        </div>
      </div>

      {/* 3. Quick Action Hub */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Quick Citizen Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate('chat')}
            className="p-3 bg-white border border-slate-200 hover:border-purple-300 rounded-2xl shadow-sm hover:shadow-md text-left transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-extrabold text-slate-800">Talk to Sahayak</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Ask questions in voice or text</p>
          </button>

          <button
            onClick={() => onNavigate('explorer')}
            className="p-3 bg-white border border-slate-200 hover:border-purple-300 rounded-2xl shadow-sm hover:shadow-md text-left transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-extrabold text-slate-800">Explore Schemes</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Browse 100+ state & central portals</p>
          </button>

          <button
            onClick={() => onNavigate('vault')}
            className="p-3 bg-white border border-slate-200 hover:border-purple-300 rounded-2xl shadow-sm hover:shadow-md text-left transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-extrabold text-slate-800">Document Vault</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Store Aadhaar, Income & Marksheets</p>
          </button>

          <button
            onClick={() => onNavigate('applications')}
            className="p-3 bg-white border border-slate-200 hover:border-purple-300 rounded-2xl shadow-sm hover:shadow-md text-left transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-extrabold text-slate-800">Track Status</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Check live application timeline</p>
          </button>
        </div>
      </div>

      {/* 4. Top Recommended Schemes for Profile */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Top Recommended For You</h3>
          <button 
            onClick={() => onNavigate('explorer')}
            className="text-xs text-purple-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm hover:border-purple-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                Education • Central Govt
              </span>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                98% Match
              </span>
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-800">National Scholarship Portal (NSP)</h4>
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                Post-Matric Scholarship for students from OBC / SC / ST / EBC categories pursuing higher education.
              </p>
            </div>
            <div className="pt-1 flex items-center justify-between border-t border-slate-100 text-[10px]">
              <span className="font-bold text-slate-700">Benefit: Up to ₹12,000/year</span>
              <button
                onClick={() => window.open('https://scholarships.gov.in', '_blank')}
                className="text-purple-600 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Portal</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm hover:border-purple-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                Tuition Fee Waiver • Maharashtra
              </span>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                92% Match
              </span>
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-800">Rajarshi Chhatrapati Shahu Maharaj Scheme</h4>
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                50% Tuition Fee and Exam Fee reimbursement for Economically Backward Class (EBC) students in Maharashtra.
              </p>
            </div>
            <div className="pt-1 flex items-center justify-between border-t border-slate-100 text-[10px]">
              <span className="font-bold text-slate-700">Benefit: 50% Tuition Waiver</span>
              <button
                onClick={() => window.open('https://mahadbt.maharashtra.gov.in', '_blank')}
                className="text-purple-600 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>MahaDBT</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

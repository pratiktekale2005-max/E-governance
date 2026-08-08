import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Globe, 
  User as UserIcon, 
  Sliders, 
  Activity, 
  LayoutDashboard, 
  MessageSquare, 
  Search, 
  SlidersHorizontal, 
  FolderLock, 
  FileText, 
  ShieldCheck, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { ScreenType, User } from '../types';
import { checkBackendHealth } from '../services/api_client';

interface NavbarProps {
  activeTab: ScreenType;
  onSelectTab: (tab: ScreenType) => void;
  currentUser: User | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  selectedLang: string;
  onSelectLang: (lang: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onOpenAuthModal,
  onLogout,
  selectedLang,
  onSelectLang,
}) => {
  const [isBackendLive, setIsBackendLive] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    checkBackendHealth().then((res) => {
      setIsBackendLive(res.status === 'ok' || res.status === 'healthy');
    }).catch(() => setIsBackendLive(false));
  }, []);

  const navItems: Array<{ id: ScreenType; label: string; icon: any }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Smart AI Chat', icon: MessageSquare },
    { id: 'schemes', label: 'Schemes Directory', icon: Search },
    { id: 'pre-screening', label: 'Pre-Screening Engine', icon: SlidersHorizontal },
    { id: 'vault', label: 'Document Vault', icon: FolderLock },
    { id: 'applications', label: 'Applications Tracker', icon: FileText },
    { id: 'explainability', label: 'Trust & Audit', icon: ShieldCheck },
  ];

  const languages = ['English', 'हिंदी (Hindi)', 'मराठी (Marathi)', 'தமிழ் (Tamil)', 'తెలుగు (Telugu)', 'ગુજરાતી (Gujarati)'];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-white/10 text-white transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo & Live Ping */}
        <div className="flex items-center gap-3 shrink-0">
          <div 
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
                  SAHAYAK AI
                </span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-full uppercase tracking-wider">
                  OS v2.5
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Digital Government Assistant
              </p>
            </div>
          </div>

          {/* Server Connection Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-white/10 text-[10px] font-mono">
            <span className={`w-2 h-2 rounded-full ${isBackendLive ? 'bg-emerald-400 animate-pulse shadow-glow' : 'bg-amber-400'}`} />
            <span className="text-slate-300 font-extrabold">{isBackendLive ? 'API LIVE' : 'FALLBACK ACTIVE'}</span>
          </div>
        </div>

        {/* Center: Navigation Switcher */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-purple-600/90 text-white shadow-lg shadow-purple-600/30 border border-purple-400/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Language Selector & Auth Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-purple-400/50 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">{selectedLang}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-slate-900 border border-white/10 rounded-2xl p-1.5 shadow-2xl z-50 animate-fadeIn">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      onSelectLang(lang);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                      selectedLang === lang ? 'bg-purple-600/30 text-purple-300' : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Auth Avatar / Login Trigger */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-400/30 rounded-xl hover:border-purple-400 text-white text-xs font-bold transition-all cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-black">
                  {currentUser.full_name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{currentUser.full_name}</span>
                <ChevronDown className="w-3 h-3 text-purple-300" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-2xl p-2 shadow-2xl z-50 space-y-1">
                  <div className="px-3 py-2 border-b border-white/10">
                    <p className="text-xs font-bold text-white truncate">{currentUser.full_name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      onSelectTab('accessibility');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Sliders className="w-3.5 h-3.5 text-purple-400" />
                    <span>Profile & Preferences</span>
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Citizen Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Tab Navigation Bar */}
      <div className="md:hidden flex items-center gap-1 overflow-x-auto no-scrollbar px-4 py-2 bg-slate-950 border-t border-white/5 text-[11px]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap flex items-center gap-1 ${
                isActive ? 'bg-purple-600 text-white' : 'text-slate-400'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};

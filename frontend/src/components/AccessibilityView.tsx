import React, { useState } from 'react';
import { 
  Globe, 
  Eye, 
  User, 
  Save
} from 'lucide-react';
import { UserProfileData } from '../types';
import { saveStoredProfile } from '../services/storage';

interface AccessibilityViewProps {
  profile: UserProfileData;
  onUpdateProfile: (updated: UserProfileData) => void;
}

export const AccessibilityView: React.FC<AccessibilityViewProps> = ({ profile, onUpdateProfile }) => {
  const [editedProfile, setEditedProfile] = useState<UserProfileData>(profile);
  const [selectedLang, setSelectedLang] = useState('English');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [voiceGuide, setVoiceGuide] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
    { code: 'kn', name: 'கன்னட (Kannada)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
    { code: 'ml', name: 'മലയാളം (Malayalam)' }
  ];

  const handleFontSizeChange = (size: 'normal' | 'large' | 'xlarge') => {
    setFontSize(size);
    if (size === 'large') {
      document.documentElement.style.fontSize = '18px';
    } else if (size === 'xlarge') {
      document.documentElement.style.fontSize = '20px';
    } else {
      document.documentElement.style.fontSize = '16px';
    }
  };

  const handleToggleContrast = () => {
    const nextVal = !highContrast;
    setHighContrast(nextVal);
    if (nextVal) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(editedProfile);
    saveStoredProfile(editedProfile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800">
      <div>
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
          Settings, Languages & Accessibility
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Personalize language preferences, text sizing, high-contrast display, and citizen profile.
        </p>
      </div>

      {/* 1. Indian Languages Grid */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-3xl p-5 space-y-3">
        <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-purple-600" />
          Preferred Platform Language
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setSelectedLang(lang.name)}
              className={`p-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer text-left ${
                selectedLang === lang.name
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Accessibility & Screen Reader Toggles */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-3xl p-5 space-y-4">
        <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-purple-600" />
          Visual & Speech Assist Mode
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-extrabold text-slate-800">Font Scaling</h4>
              <p className="text-[10px] text-slate-400">Increase readability</p>
            </div>
            <select
              value={fontSize}
              onChange={(e: any) => handleFontSizeChange(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
            >
              <option value="normal">Default (100%)</option>
              <option value="large">Large (115%)</option>
              <option value="xlarge">Extra Large (130%)</option>
            </select>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-extrabold text-slate-800">High Contrast</h4>
              <p className="text-[10px] text-slate-400">Maximum legibility</p>
            </div>
            <button
              type="button"
              onClick={handleToggleContrast}
              className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                highContrast ? 'bg-purple-600' : 'bg-slate-200'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                highContrast ? 'left-5' : 'left-1'
              }`} />
            </button>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-extrabold text-slate-800">Voice Navigation</h4>
              <p className="text-[10px] text-slate-400">Screen voice guidance</p>
            </div>
            <button
              type="button"
              onClick={() => setVoiceGuide(!voiceGuide)}
              className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                voiceGuide ? 'bg-purple-600' : 'bg-slate-200'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                voiceGuide ? 'left-5' : 'left-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Citizen Profile Edit */}
      <form onSubmit={handleSave} className="bg-slate-50/80 border border-slate-200/80 rounded-3xl p-5 space-y-4">
        <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-purple-600" />
          Edit Citizen Profile Data
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">State of Residence</label>
            <input
              type="text"
              value={editedProfile.state}
              onChange={(e) => setEditedProfile({ ...editedProfile, state: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Occupation</label>
            <input
              type="text"
              value={editedProfile.occupation}
              onChange={(e) => setEditedProfile({ ...editedProfile, occupation: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          <span>{savedSuccess ? 'Profile Preferences Saved ✓' : 'Save Citizen Profile'}</span>
        </button>
      </form>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { KeyRound, ShieldAlert, Cpu, AlignLeft, Save, Check } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsScreenProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ settings, onSaveSettings }) => {
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [model, setModel] = useState(settings.model);
  const [systemInstructions, setSystemInstructions] = useState(settings.systemInstructions);
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setApiKey(settings.apiKey);
    setModel(settings.model);
    setSystemInstructions(settings.systemInstructions);
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      apiKey: apiKey.trim(),
      model,
      systemInstructions,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const isEnvKeyAvailable = !!import.meta.env.VITE_GEMINI_API_KEY;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 animate-fadeIn">
      {/* Page Title */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          System Settings
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Configure API credentials, model parameters, and custom AI behavior.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main settings options column */}
          <div className="md:col-span-2 space-y-6">
            
            {/* API Key Card */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl shadow-purple-900/5 border border-white/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-955">Gemini API Configuration</h3>
                  <p className="text-xs text-slate-500">Provide your Google AI Studio API credentials</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  Gemini API Key
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={
                      isEnvKeyAvailable
                        ? '🔑 Environment variable API Key loaded'
                        : 'Enter your AI Studio API key...'
                    }
                    className="w-full px-4 py-3 rounded-2xl text-sm bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 outline-none transition-all font-mono text-slate-800 pr-24"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 px-3 py-1 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-600 transition-all cursor-pointer shadow-sm"
                  >
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                </div>

                {isEnvKeyAvailable && (
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1.5 pt-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    System is preconfigured with VITE_GEMINI_API_KEY from env files.
                  </p>
                )}
              </div>
            </div>

            {/* Model Params Card */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl shadow-purple-900/5 border border-white/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-955">Model Parameters</h3>
                  <p className="text-xs text-slate-500">Select the LLM model to process chat/voice requests</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Gemini Model
                  </label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl text-sm bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 outline-none transition-all font-semibold text-slate-700 cursor-pointer"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Default - Fast & Multimodal)</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (Advanced Reasoner & Logic)</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Legacy)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Persona Settings */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl shadow-purple-900/5 border border-white/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <AlignLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-955">System Prompt Persona</h3>
                  <p className="text-xs text-slate-500">Inject custom behavior and style rules into the AI context</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  System Instructions
                </label>
                <textarea
                  value={systemInstructions}
                  onChange={(e) => setSystemInstructions(e.target.value)}
                  placeholder="E.g., You are a helpful, professional, friendly voice and chat assistant..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl text-sm bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 outline-none transition-all font-medium text-slate-800 resize-none leading-relaxed"
                />
              </div>
            </div>

          </div>

          {/* Tips and status sidebar column */}
          <div className="space-y-6">
            
            {/* Security Alert Widget */}
            <div className="bg-gradient-to-tr from-amber-500/10 to-orange-500/5 rounded-3xl p-5 border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4" />
                <span>Security Notice</span>
              </div>
              <p className="text-[11px] text-amber-900/80 leading-relaxed font-medium">
                Your API key is stored locally in your web browser's <code>localStorage</code> cache. It is never uploaded to any third-party databases, and is transmitted directly to Google's API endpoints from your client.
              </p>
            </div>

            {/* Quick Summary status */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-white/60 space-y-4 text-xs font-medium text-slate-600">
              <h4 className="font-bold text-slate-800 text-xs">Configuration Summary</h4>
              <div className="space-y-2.5">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span>API Status:</span>
                  <span className={apiKey || isEnvKeyAvailable ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                    {apiKey || isEnvKeyAvailable ? "Key Configured" : "Mocks Active"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span>Active Model:</span>
                  <span className="text-slate-800 font-bold font-mono">{model}</span>
                </div>
                <div className="flex justify-between">
                  <span>Instructions:</span>
                  <span className="text-slate-800 font-bold">
                    {systemInstructions.length > 30 ? `${systemInstructions.slice(0, 30)}...` : systemInstructions || "None"}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-sm transition-all shadow-md shadow-purple-500/20 hover:shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Settings Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

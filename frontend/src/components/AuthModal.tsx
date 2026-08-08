import React, { useState } from 'react';
import { X, ShieldCheck, Mail, Lock, User, Phone, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import { loginUser, registerUser } from '../services/api_client';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('Maharashtra');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await loginUser(email, password);
        onSuccess(res.user);
        onClose();
      } else {
        await registerUser({
          full_name: fullName,
          email,
          password,
          phone_number: phone,
          state,
        });
        // Auto login after registration
        const res = await loginUser(email, password);
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-fadeIn text-white">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-600/30 border border-purple-400/40 text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {mode === 'login' ? 'Citizen Sign In' : 'Register Citizen Account'}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                {mode === 'login' ? 'Access verified scheme tracker & document vault' : 'Create account for personalized eligibility checks'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 text-red-300 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="font-extrabold text-slate-300 block">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Citizen Full Name"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-extrabold text-slate-300 block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@example.gov.in"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-extrabold text-slate-300 block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 transition-all"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-extrabold text-slate-300 block">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-300 block">State</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-lg shadow-purple-600/30 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{mode === 'login' ? 'Sign In to Sahayak' : 'Create Citizen Account'}</span>
              </>
            )}
          </button>
        </form>

        {/* Switch Mode Footer */}
        <div className="text-center pt-2 border-t border-white/10 text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              New Citizen?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-purple-400 font-bold hover:underline cursor-pointer"
              >
                Create Account
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-purple-400 font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

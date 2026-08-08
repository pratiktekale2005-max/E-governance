import React from 'react';

export type OrbState = 'idle' | 'listening' | 'thinking' | 'success';

interface AIOrbProps {
  state?: OrbState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export const AIOrb: React.FC<AIOrbProps> = ({
  state = 'idle',
  size = 'lg',
  className = '',
  onClick,
}) => {
  const containerSize = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64',
  }[size];

  const coreSize = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
    xl: 'w-48 h-48',
  }[size];

  const iconSize = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-5xl',
  }[size];

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center cursor-pointer select-none group ${containerSize} ${className}`}
    >
      {/* Outer Glow Pulse Aura */}
      <div
        className={`absolute inset-0 rounded-full orb-glow transition-all duration-700 ${
          state === 'listening'
            ? 'bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-600 animate-ping opacity-80'
            : state === 'thinking'
            ? 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-sky-400 animate-spin opacity-80'
            : state === 'success'
            ? 'bg-gradient-to-tr from-emerald-500 via-teal-400 to-sky-400 opacity-70'
            : 'bg-[#4f46e5] opacity-60'
        }`}
      />

      {/* Core Sphere with Stitch Gradient */}
      <div
        className={`relative z-10 ${coreSize} rounded-full orb-core shadow-2xl transition-all duration-500 flex items-center justify-center group-hover:scale-105 active:scale-95 ${
          state === 'listening'
            ? 'scale-105 shadow-purple-500/50'
            : state === 'thinking'
            ? 'shadow-indigo-600/50'
            : state === 'success'
            ? '!bg-gradient-to-tr !from-emerald-600 !to-teal-500 shadow-emerald-500/50'
            : 'shadow-indigo-600/40'
        }`}
      >
        {state === 'thinking' ? (
          <div className="w-8 h-8 border-3 border-white/40 border-t-white rounded-full animate-spin" />
        ) : state === 'listening' ? (
          <span className={`material-symbols-outlined text-white ${iconSize} animate-bounce`}>
            graphic_eq
          </span>
        ) : state === 'success' ? (
          <span className={`material-symbols-outlined text-white ${iconSize}`}>
            verified
          </span>
        ) : (
          <span className={`material-symbols-outlined text-white/90 ${iconSize}`}>
            graphic_eq
          </span>
        )}
      </div>
    </div>
  );
};

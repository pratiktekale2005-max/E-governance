import React from 'react';

interface LiquidOrbProps {
  isListening?: boolean;
  onClick?: () => void;
}

export const LiquidOrb: React.FC<LiquidOrbProps> = ({ isListening = true, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="relative flex items-center justify-center my-6 cursor-pointer select-none group"
    >
      {/* Outer Glow & Sound Rings */}
      <div className={`absolute w-72 h-72 rounded-full bg-purple-400/20 blur-2xl transition-all duration-700 ${isListening ? 'animate-pulse scale-110' : 'scale-90 opacity-40'}`} />
      
      {isListening && (
        <>
          <div className="absolute w-64 h-64 rounded-full border border-purple-300/40 animate-ping opacity-30 pointer-events-none" style={{ animationDuration: '3s' }} />
          <div className="absolute w-72 h-72 rounded-full border border-pink-300/30 animate-ping opacity-20 pointer-events-none" style={{ animationDuration: '4.5s' }} />
        </>
      )}

      {/* Main 3D Iridescent Liquid Sphere Container */}
      <div className="relative w-56 h-56 rounded-full p-1 transition-transform duration-500 group-hover:scale-105">
        
        {/* Animated Liquid Surface Blob */}
        <div 
          className="w-full h-full rounded-full animate-liquid-morph animate-float-orb relative overflow-hidden shadow-[0_20px_50px_rgba(168,85,247,0.35)]"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #f472b6 25%, #a855f7 50%, #3b82f6 75%, #06b6d4 100%)',
            backgroundSize: '200% 200%',
          }}
        >
          {/* Swirling Iridescent Layer 1 */}
          <div 
            className="absolute inset-0 opacity-80 mix-blend-overlay animate-spin"
            style={{
              background: 'radial-gradient(circle at 70% 20%, #fef08a 0%, transparent 60%), radial-gradient(circle at 20% 80%, #ec4899 0%, transparent 50%), radial-gradient(circle at 80% 80%, #6366f1 0%, transparent 60%)',
              animationDuration: '15s',
            }}
          />

          {/* Liquid Metallic Highlights */}
          <div 
            className="absolute inset-0 opacity-60 mix-blend-color-dodge"
            style={{
              background: 'radial-gradient(ellipse at 35% 25%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 30%, transparent 65%)',
            }}
          />

          {/* Secondary Gloss Specular Reflection */}
          <div className="absolute top-4 left-8 w-20 h-10 bg-white/70 rounded-full blur-[2px] transform -rotate-45" />
          <div className="absolute top-8 left-12 w-6 h-6 bg-white/90 rounded-full blur-[1px]" />
          
          {/* Deep Core Ambient Shadow for 3D Sphere Volume */}
          <div 
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow: 'inset -15px -20px 40px rgba(15, 23, 42, 0.45), inset 10px 10px 20px rgba(255, 255, 255, 0.8)',
            }}
          />

          {/* Subtle Dynamic Audio Waves inside sphere */}
          {isListening && (
            <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-70">
              <span className="w-1 bg-white/80 rounded-full animate-bounce h-6" style={{ animationDelay: '0ms' }} />
              <span className="w-1 bg-white/80 rounded-full animate-bounce h-10" style={{ animationDelay: '150ms' }} />
              <span className="w-1 bg-white/80 rounded-full animate-bounce h-8" style={{ animationDelay: '300ms' }} />
              <span className="w-1 bg-white/80 rounded-full animate-bounce h-12" style={{ animationDelay: '450ms' }} />
              <span className="w-1 bg-white/80 rounded-full animate-bounce h-5" style={{ animationDelay: '200ms' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

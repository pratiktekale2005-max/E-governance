import React from 'react';

interface SaarthiAvatarProps {
  type?: 'officer' | 'robot';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const SaarthiAvatar: React.FC<SaarthiAvatarProps> = ({ 
  type = 'officer', 
  className = '', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
  };

  const selectedSize = sizeClasses[size];

  if (type === 'robot') {
    return (
      <div className={`rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center relative shadow-sm shrink-0 overflow-hidden ${selectedSize} ${className}`}>
        {/* Robot Head Vector SVG */}
        <svg viewBox="0 0 100 100" className="w-[70%] h-[70%] text-indigo-600 fill-current">
          {/* Antennas */}
          <rect x="47" y="5" width="6" height="15" rx="3" />
          <circle cx="50" cy="5" r="5" />
          {/* Head */}
          <rect x="15" y="20" width="70" height="60" rx="20" fill="currentColor" opacity="0.15" />
          <rect x="15" y="20" width="70" height="60" rx="20" stroke="currentColor" strokeWidth="6" fill="none" />
          {/* Ears */}
          <rect x="5" y="40" width="10" height="20" rx="5" />
          <rect x="85" y="40" width="10" height="20" rx="5" />
          {/* Screen */}
          <rect x="25" y="32" width="50" height="36" rx="10" fill="white" stroke="currentColor" strokeWidth="4" />
          {/* Eyes */}
          <circle cx="40" cy="50" r="5" className="fill-indigo-600 animate-pulse" />
          <circle cx="60" cy="50" r="5" className="fill-indigo-600 animate-pulse" />
          {/* Smile Mouth */}
          <path d="M 45 60 Q 50 64 55 60" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    );
  }

  // Else render Officer Avatar (Indian Namaste Greeting)
  return (
    <div className={`rounded-full bg-gradient-to-tr from-purple-100 to-indigo-100 border border-purple-200/60 flex items-center justify-center relative shadow-md shrink-0 overflow-hidden ${selectedSize} ${className}`}>
      
      {/* Background Indian monument/flag gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-400/20 via-white/40 to-emerald-500/20 opacity-80" />
      
      {/* Vector Illustration of Namaste Officer */}
      <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] relative z-10">
        <defs>
          <clipPath id="avatarClip">
            <circle cx="50" cy="50" r="46" />
          </clipPath>
          <linearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fdba74" />
          </linearGradient>
        </defs>

        <g clipPath="url(#avatarClip)">
          {/* Hair back */}
          <path d="M 22 55 Q 18 35, 30 20 Q 50 10, 70 20 Q 82 35, 78 55 Z" fill="url(#hairGrad)" />

          {/* Shoulders & Neck */}
          <path d="M 33 80 L 40 68 L 60 68 L 67 80 Z" fill="url(#skinGrad)" />
          {/* Saree/Sash (Indigo and Orange border) */}
          <path d="M 20 80 Q 35 60 50 60 Q 65 60 80 80" fill="#e0e7ff" stroke="#6366f1" strokeWidth="4" />
          {/* Tiranga sash strip on shoulder */}
          <path d="M 26 80 L 38 65 L 43 68 L 31 80 Z" fill="#f97316" />
          
          {/* Face */}
          <circle cx="50" cy="42" r="18" fill="url(#skinGrad)" />
          
          {/* Hair front/bangs */}
          <path d="M 32 35 Q 50 20, 68 35 Q 60 22, 50 22 Q 40 22, 32 35 Z" fill="url(#hairGrad)" />
          
          {/* Bindu/Tikka (Red dot) */}
          <circle cx="50" cy="35" r="1.5" fill="#e11d48" />

          {/* Eyes */}
          <ellipse cx="43" cy="42" rx="2" ry="1.2" fill="#1e293b" />
          <ellipse cx="57" cy="42" rx="2" ry="1.2" fill="#1e293b" />
          
          {/* Eyebrows */}
          <path d="M 39 39 Q 43 37 47 40" stroke="#1e293b" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M 53 40 Q 57 37 61 39" stroke="#1e293b" strokeWidth="1.2" fill="none" strokeLinecap="round" />

          {/* Smile */}
          <path d="M 46 50 Q 50 54 54 50" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          
          {/* Folded Hands (Namaste) */}
          {/* Sleeves */}
          <path d="M 30 90 Q 38 78 44 76" stroke="#6366f1" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M 70 90 Q 62 78 56 76" stroke="#6366f1" strokeWidth="6" strokeLinecap="round" fill="none" />
          
          {/* Hands */}
          <path d="M 44 76 Q 50 63 50 63" stroke="url(#skinGrad)" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M 56 76 Q 50 63 50 63" stroke="url(#skinGrad)" strokeWidth="6" strokeLinecap="round" fill="none" />
          
          {/* Details */}
          <path d="M 48 69 L 52 69" stroke="#1e293b" strokeWidth="0.8" />
        </g>
      </svg>
    </div>
  );
};

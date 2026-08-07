import React, { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioWaveformProps {
  duration?: string;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ duration = '0:42' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 2));
      }, 200);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const barHeights = [40, 65, 30, 85, 95, 50, 75, 40, 90, 60, 35, 70, 80, 45, 95, 60, 30, 85, 55, 40];

  return (
    <div className="bg-slate-900 text-white rounded-[2rem] p-4 flex items-center gap-3 w-full max-w-[280px] shadow-lg border border-slate-800">
      <button 
        onClick={() => setIsPlaying(!isPlaying)}
        className="w-10 h-10 rounded-full bg-purple-500 hover:bg-purple-600 transition-colors flex items-center justify-center shrink-0 text-white shadow-md cursor-pointer"
        aria-label={isPlaying ? "Pause audio" : "Play audio"}
      >
        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
      </button>

      <div className="flex-1 flex flex-col justify-center">
        {/* Waveform Bars */}
        <div className="flex items-center gap-[3px] h-8 w-full cursor-pointer">
          {barHeights.map((height, i) => {
            const isCompleted = (i / barHeights.length) * 100 <= progress;
            return (
              <div
                key={i}
                onClick={() => setProgress((i / barHeights.length) * 100)}
                className={`w-[3px] rounded-full transition-all duration-300 ${
                  isCompleted ? 'bg-purple-400' : 'bg-slate-700'
                } ${isPlaying ? 'animate-pulse' : ''}`}
                style={{
                  height: `${isPlaying ? Math.max(15, (height * (0.6 + Math.sin(i + Date.now() / 200) * 0.4))) : height}%`,
                  animationDelay: `${i * 50}ms`,
                }}
              />
            );
          })}
        </div>
        
        {/* Duration / Progress Text */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 font-medium px-0.5">
          <span>{isPlaying ? `${Math.floor((progress / 100) * 42)}s` : '0:00'}</span>
          <span>{duration}</span>
        </div>
      </div>
    </div>
  );
};

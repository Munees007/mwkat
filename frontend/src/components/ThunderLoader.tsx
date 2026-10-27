import React from 'react';

interface ThunderLoaderProps {
  message?: string;
}

export const ThunderLoader: React.FC<ThunderLoaderProps> = ({
  message = 'Fetching Elexon Stream Data...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-16 h-16 bg-cyan-500/20 rounded-full animate-ping" />
        <div className="absolute w-20 h-20 bg-amber-500/10 rounded-full animate-pulse" />

        <div className="relative z-10 p-4 bg-slate-900 border border-slate-700 rounded-full shadow-lg shadow-cyan-500/20">
          <svg
            className="w-8 h-8 text-amber-400 animate-bounce"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M13 2L3 14h7v8l10-12h-7V2z" />
          </svg>
        </div>
      </div>

      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-cyan-400 animate-pulse">
          {message}
        </p>
        <p className="text-xs text-slate-500">
          Processing Day-Ahead Market Cutoffs & Data Chunks...
        </p>
      </div>
    </div>
  );
};

export default ThunderLoader;
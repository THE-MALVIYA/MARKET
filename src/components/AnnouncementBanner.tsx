import React, { useState } from 'react';
import { Sparkles, Terminal, X, ArrowRight } from 'lucide-react';

export const AnnouncementBanner: React.FC = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative z-40 bg-gradient-to-r from-[#0d1527] via-[#09151e] to-[#140f28] border-b border-cyan-500/30 px-4 py-2 shadow-lg shadow-cyan-950/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-bold tracking-wider uppercase flex-shrink-0">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            NEW RELEASE
          </span>
          <p className="text-slate-300 truncate text-[11px] font-mono">
            <span className="text-cyan-300 font-semibold">ToolPlaces v2.4:</span> Enterprise Developer Toolkits & Security Research Suites now active with instant TRC-20 USDT settlement.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-black/50 border border-slate-800 text-slate-400 font-mono text-[10px]">
            <Terminal className="w-3 h-3 text-emerald-400" />
            <span>NETWORK: ONLINE</span>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="text-slate-500 hover:text-slate-300 p-0.5 rounded hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Dismiss Announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

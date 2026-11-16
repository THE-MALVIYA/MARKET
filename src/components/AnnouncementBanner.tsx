import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';

export const AnnouncementBanner: React.FC = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative z-40 bg-[#070907] border-b border-[#1d271d] px-4 py-1.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-[11px] font-mono">
        <div className="flex items-center gap-2.5 overflow-hidden text-zinc-400">
          <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
          <p className="truncate">
            <span className="text-emerald-400 font-semibold">ONION MIRROR v3:</span>{' '}
            <span className="text-zinc-300">cyber7x9q4m2v8k3p5z.onion</span>
            <span className="mx-2 text-zinc-600">·</span>
            <span className="text-amber-400/90">PGP KEY 0x8F4C92E1</span>
            <span className="mx-2 text-zinc-600 hidden sm:inline">·</span>
            <span className="hidden sm:inline text-zinc-400">TRC-20 Escrow Settlement Active</span>
          </p>
        </div>

        <button
          onClick={() => setVisible(false)}
          className="text-zinc-500 hover:text-zinc-200 p-1 transition-colors cursor-pointer shrink-0"
          title="Dismiss Notice"
          aria-label="Dismiss Notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

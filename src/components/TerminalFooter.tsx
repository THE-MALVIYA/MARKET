import React from 'react';
import { Terminal, Shield, Cpu } from 'lucide-react';
import { useMarket } from '../context/MarketContext';

export const TerminalFooter: React.FC = () => {
  const { setActiveTab } = useMarket();

  return (
    <footer className="mt-16 border-t border-[#1d271d] bg-[#040504] relative z-20 font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          {/* Brand Notice */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 bg-[#0a0e0a] border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-sm tracking-wider text-white">
                CYBERPLACES · ONION MARKETPLACE
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-md font-sans">
              Encrypted darknet repository for verified security auditing tools, adversary frameworks, cryptographic engines, and cyber infrastructure packages.
            </p>

            <div className="p-3 bg-[#070907] border border-[#1d271d] text-[11px] text-zinc-400 leading-relaxed space-y-1">
              <div className="font-bold text-emerald-400 uppercase tracking-wider">
                PGP &amp; CHECKSUM VERIFICATION
              </div>
              <p className="text-[11px] text-zinc-400">
                Every release listed on CyberPlaces is cryptographically signed and checked against clean SHA-256 hashes prior to escrow fulfillment.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3 space-y-2 text-xs">
            <h4 className="text-white font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Directory</span>
            </h4>
            <ul className="space-y-1.5 text-zinc-400">
              <li>
                <button
                  onClick={() => setActiveTab('home')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  &gt; Market Index
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  &gt; Full Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  &gt; Escrow Orders
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('support')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  &gt; PGP Support &amp; FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Escrow & Onion Details */}
          <div className="md:col-span-3 space-y-2 text-xs">
            <h4 className="text-white font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>Escrow Gateway</span>
            </h4>
            <div className="text-[11px] text-zinc-400 space-y-1.5">
              <div>Settlement: <span className="text-emerald-400">USDT TRC-20 Direct</span></div>
              <div>Escrow Address: <span className="text-zinc-300 break-all text-[10px]">TL9sU4A1ydN...DFx</span></div>
              <div>Onion Mirror: <span className="text-zinc-300">cyber7x9q4m2...onion</span></div>
              <div>PGP Key ID: <span className="text-amber-400">0x8F4C92E1</span></div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#161e16] text-center text-[11px] text-zinc-500">
          CYBERPLACES &copy; 2026 · Encrypted Security Tooling &amp; Infrastructure Bazaar
        </div>
      </div>
    </footer>
  );
};

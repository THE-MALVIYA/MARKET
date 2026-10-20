import React from 'react';
import { Terminal, Shield, Cpu, Lock } from 'lucide-react';
import { useMarket } from '../context/MarketContext';

export const TerminalFooter: React.FC = () => {
  const { setActiveTab } = useMarket();

  return (
    <footer className="mt-16 border-t border-cyan-500/20 bg-[#04060a] relative z-20 font-mono">
      {/* Terminal status bar */}
      <div className="bg-[#070a10] border-b border-slate-800/80 px-4 py-2 text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-cyan-400 font-bold">SYSTEM STATUS: OPERATIONAL</span>
            <span className="text-slate-600">|</span>
            <span>NODE: CLUSTER-US-EAST</span>
            <span className="text-slate-600">|</span>
            <span className="text-purple-400">ENCRYPTION: TLS 1.3 / AES-256-GCM</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span>UPTIME: 99.99%</span>
            <span>LATENCY: 8ms</span>
            <span className="text-emerald-400 font-bold">INSTANT LICENSING</span>
          </div>
        </div>
      </div>

      {/* Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          {/* Brand Notice */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span className="font-extrabold text-sm tracking-wider text-white">
                CYBERPLACES // DEVELOPER & SECURITY MARKETPLACE
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-md font-sans">
              The premier marketplace for verified developer software, cybersecurity defense tools, automated vulnerability scanners, and cyber cloud DevOps utilities.
            </p>

            <div className="p-3 rounded-lg bg-black/60 border border-cyan-500/30 text-[11px] text-cyan-300/90 leading-relaxed space-y-1">
              <div className="font-bold text-white uppercase tracking-wider">
                CYBER-GRADE SOFTWARE ECOSYSTEM
              </div>
              <p className="text-[10px] text-slate-400">
                Every tool in the CyberPlaces catalog undergoes source validation, binary verification, and cryptographic checksum auditing before distribution.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-2 text-xs">
            <h4 className="text-white font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>NAVIGATION</span>
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <button
                  onClick={() => setActiveTab('home')}
                  className="hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  &gt; Home & Catalog Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className="hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  &gt; Tools Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  &gt; Order Tracking & Licenses
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('support')}
                  className="hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  &gt; Support & Verification FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Platform Tech Specs */}
          <div className="md:col-span-3 space-y-2 text-xs">
            <h4 className="text-white font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>PLATFORM ARCHITECTURE</span>
            </h4>
            <div className="text-[11px] text-slate-400 space-y-1">
              <div>Settlement: <span className="text-cyan-400">USDT-TRC20 Direct</span></div>
              <div>Deposit Address: <span className="text-slate-300 break-all text-[10px]">TL9sU4A1ydN...DFx</span></div>
              <div>Verification: <span className="text-emerald-400">Automated & Manual Review</span></div>
              <div>Runtime: <span className="text-slate-300">Express + Vite + React 18 + TS</span></div>
              <div>Security: <span className="text-purple-400">Encrypted Cloud Infrastructure</span></div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 text-center text-[10px] text-slate-500">
          CYBERPLACES &copy; 2026. All rights reserved. Professional Developer & Cybersecurity Solutions.
        </div>
      </div>
    </footer>
  );
};

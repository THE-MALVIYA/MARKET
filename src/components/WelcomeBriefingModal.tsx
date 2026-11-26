import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Globe,
  Cpu,
  QrCode,
  FileCode2,
  KeyRound,
  ArrowRight,
  X,
  Compass,
  BookOpen
} from 'lucide-react';
import { DeepSeekLogo } from './DeepSeekLogo';
import { useMarket } from '../context/MarketContext';

interface WelcomeBriefingModalProps {
  open: boolean;
  onClose: () => void;
}

export const WelcomeBriefingModal: React.FC<WelcomeBriefingModalProps> = ({ open, onClose }) => {
  const { setActiveTab, products } = useMarket();

  const navigateAndClose = (tab: 'home' | 'products' | 'research' | 'docs' | 'dashboard') => {
    setActiveTab(tab);
    onClose();
  };

  const pillars = [
    {
      icon: Globe,
      title: 'Live 3D Global Threat Earth',
      desc: 'Track real-time cyber-attack arcs across major global cities and countries on our interactive 3D planet directly on the homepage.'
    },
    {
      icon: Cpu,
      title: `${products.length || 14} Verified Deephat & Infra Suites`,
      desc: 'Explore enterprise systems including X-Transaction SQM, Transaction Kit, SQL Flash engines, and post-quantum vaults with live 3D previews.'
    },
    {
      icon: QrCode,
      title: 'Official USDT TRC-20 Scanner Checkout',
      desc: 'Pay cleanly using the integrated Tron TRC-20 payment scanner QR code with automated on-chain TXID ledger verification.'
    },
    {
      icon: KeyRound,
      title: 'Instant License Keys & Manifests',
      desc: 'Confirmed settlements immediately unlock SHA-256 package manifests, unique license keys, and engineering support in your dashboard.'
    }
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 bg-black/82 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-w-4xl w-full my-auto rounded-2xl bg-[#0D1116] border border-[#00D69A]/40 shadow-[0_32px_90px_-15px_rgba(0,214,154,0.28)] overflow-hidden"
          >
            {/* Top accent hairline */}
            <div className="h-1 w-full bg-gradient-to-r from-[#00D69A] via-[#0EA5A4] to-[#E5B84B]" />

            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg bg-[#11161D] border border-[#1E2936] text-[#8F9CA8] hover:text-[#F4F7F6] hover:border-[#00D69A]/50 transition-colors cursor-pointer"
              aria-label="Close platform briefing"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="space-y-3 pr-8">
                <div className="flex flex-wrap items-center gap-3">
                  <DeepSeekLogo />
                  <span className="px-2.5 py-1 rounded-md bg-[#00D69A]/12 border border-[#00D69A]/40 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#00D69A]">
                    COMMAND GRID ONLINE
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F4F7F6] leading-tight">
                  Welcome to DEEPSEEK — Sovereign Deephat &amp; Enterprise Infrastructure Marketplace
                </h2>
                <p className="text-xs sm:text-sm text-[#D1D9E0] leading-relaxed max-w-3xl">
                  DEEPSEEK is an independent software and digital infrastructure platform engineered for security architects, systems operators, and high-throughput developer teams. Every module features transparent technical specs, interactive 3D architecture previews, CLI verification guides, and direct Tron TRC-20 blockchain settlement.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {pillars.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="dsk-panel-3d p-4 rounded-xl flex items-start gap-3.5"
                    >
                      <div className="dsk-icon-3d w-10 h-10 rounded-lg flex items-center justify-center text-[#00D69A] shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xs sm:text-sm font-bold text-[#F4F7F6]">{item.title}</h3>
                        <p className="text-[11px] sm:text-xs text-[#8F9CA8] leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-xl bg-[#11161D] border border-[#1E2936] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-[#D1D9E0]">
                  <ShieldCheck className="w-4 h-4 text-[#00D69A] shrink-0" />
                  <span>
                    All 14+ software suites, live 3D Earth threat telemetry, documentation, and Tron TRC-20 scanner checkout are ready.
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#0EA5A4] shrink-0">
                  <FileCode2 className="w-3.5 h-3.5" />
                  <span>SHA-256 VERIFIED</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => navigateAndClose('products')}
                    className="px-4 py-2.5 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Explore All Software Suites</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateAndClose('research')}
                    className="px-4 py-2.5 rounded-lg bg-[#11161D] hover:bg-[#151C24] border border-[#1E2936] hover:border-[#00D69A]/50 text-[#F4F7F6] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-[#0EA5A4]" />
                    <span>Research &amp; Docs</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => navigateAndClose('home')}
                  className="px-4 py-2.5 rounded-lg bg-[#07090B] hover:bg-[#11161D] border border-[#1E2936] text-xs font-semibold text-[#D1D9E0] cursor-pointer"
                >
                  Enter Homepage &amp; 3D Earth &rarr;
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

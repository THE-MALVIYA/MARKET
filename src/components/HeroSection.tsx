import React from 'react';
import { useMarket } from '../context/MarketContext';
import { Search, ArrowRight, ShieldCheck, Lock, Terminal, Cpu, Database } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { setActiveTab, searchQuery, setSearchQuery, setSelectedCategory, categories, products } = useMarket();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTab('marketplace');
  };

  return (
    <section className="relative border-b border-[#1c261c] bg-[#040504]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 relative z-10">
        {/* Main Darknet Market Directory Gate */}
        <div className="border border-[#1f2b1f] bg-[#070907] p-6 sm:p-10 relative">
          {/* Corner Crosshairs */}
          <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-500/70" />
          <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-500/70" />
          <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-500/70" />
          <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-500/70" />

          <div className="max-w-3xl mx-auto text-center">
            {/* Unboxed Cryptographic Header Line */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-zinc-400 mb-5">
              <span className="text-emerald-400 font-semibold">HIDDEN SERVICE MARKET</span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span>PGP FINGERPRINT: 8F4C 92E1 B7A0 3D54</span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span className="text-amber-400">MULTI-SIG ESCROW</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-mono font-extrabold tracking-tight text-white mb-4 [text-wrap:balance]">
              CYBERPLACES
            </h1>

            <p className="text-base sm:text-lg font-mono text-emerald-400 font-medium mb-3">
              Encrypted Onion Marketplace for Security Tooling &amp; Exploit Infrastructure
            </p>

            <p className="text-zinc-400 text-sm max-w-2xl mx-auto leading-relaxed mb-8">
              Verified zero-day research suites, adversary simulation frameworks, cryptographic node gateways, and automated transaction kits delivered via protected USDT TRC-20 escrow.
            </p>

            {/* Terminal Command Search */}
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mb-6">
              <div className="relative flex items-center bg-[#040504] border border-[#293829] focus-within:border-emerald-500 transition-colors">
                <span className="pl-3.5 pr-1 font-mono text-xs text-emerald-500 select-none hidden sm:inline">
                  onion://search$
                </span>
                <Search className="w-4 h-4 text-emerald-500 ml-3 sm:hidden pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter package name, hash ID, or sector..."
                  className="w-full bg-transparent px-3 py-3.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none font-mono"
                />
                <button
                  type="submit"
                  className="m-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>SEARCH</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Primary Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <button
                onClick={() => setActiveTab('marketplace')}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Browse Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setSearchQuery('Global-T');
                  setActiveTab('marketplace');
                }}
                className="px-5 py-2.5 bg-[#0c100c] hover:bg-[#131a13] text-amber-400 border border-amber-500/40 font-mono text-xs flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Featured: Global-T (7,630 USDT)</span>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className="px-4 py-2.5 bg-[#0a0c0a] hover:bg-[#121612] text-zinc-300 border border-[#222c22] font-mono text-xs transition-colors cursor-pointer whitespace-nowrap"
              >
                Track Orders
              </button>
            </div>

            {/* Sector Links */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-5 border-t border-[#161e16]">
              <span className="text-[11px] font-mono text-zinc-500 mr-1 flex items-center gap-1">
                <Terminal className="w-3 h-3 text-emerald-500" />
                <span>Sectors:</span>
              </span>
              {categories
                .filter((c) => c !== 'All Categories')
                .slice(0, 5)
                .map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setActiveTab('marketplace');
                    }}
                    className="px-2.5 py-1 bg-[#0b0e0b] hover:bg-[#141c14] border border-[#1d271d] hover:border-emerald-500/50 text-[11px] font-mono text-zinc-300 hover:text-emerald-400 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {cat}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* 4-Column Darknet Escrow & Node Spec Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-x border-b border-[#1f2b1f] bg-[#060806] divide-y md:divide-y-0 md:divide-x divide-[#1f2b1f]">
          <div className="p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1">
              <Cpu className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono text-zinc-500">Listed Packages</span>
            </div>
            <div className="font-mono text-xl font-bold text-white tabular-nums">{products.length} Active</div>
            <div className="text-[11px] font-mono text-emerald-500 mt-0.5">SHA-256 Verified</div>
          </div>

          <div className="p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1">
              <Lock className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono text-zinc-500">Circuit Uptime</span>
            </div>
            <div className="font-mono text-xl font-bold text-white tabular-nums">99.98%</div>
            <div className="text-[11px] font-mono text-zinc-400 mt-0.5">Tor v3 Onion Routed</div>
          </div>

          <div className="p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
              <Database className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono text-zinc-500">Escrow Currency</span>
            </div>
            <div className="font-mono text-xl font-bold text-white tabular-nums">USDT TRC-20</div>
            <div className="text-[11px] font-mono text-amber-400/90 mt-0.5">Zero-Log Settlement</div>
          </div>

          <div className="p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono text-zinc-500">Delivery Mode</span>
            </div>
            <div className="font-mono text-xl font-bold text-white">Instant Drop</div>
            <div className="text-[11px] font-mono text-emerald-500 mt-0.5">Automated Escrow Key</div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { useMarket } from '../context/MarketContext';
import { Search, ArrowRight, ShieldCheck, Database, Cpu, Activity, Zap, Terminal } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { setActiveTab, searchQuery, setSearchQuery, setSelectedCategory, categories, adminStats, products } = useMarket();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTab('marketplace');
  };

  return (
    <div className="relative overflow-hidden pt-8 pb-12 border-b border-cyan-500/20">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/10 via-purple-500/5 to-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Environment Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-mono text-xs mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ENTERPRISE DEVELOPER & SECURITY PLATFORM // ACTIVE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-mono text-white mb-3">
            TOOLPLACES
          </h1>

          <p className="text-lg sm:text-xl font-mono text-cyan-400 font-medium mb-3">
            Professional Developer & Security Tooling Marketplace
          </p>

          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed mb-6">
            The trusted marketplace for high-performance developer tools, security auditing toolkits, virtual testing sandboxes, and cloud infrastructure modules.
          </p>

          {/* Search Marketplace Form */}
          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto mb-6">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-cyan-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search software toolkits, packages, modules..."
                className="w-full bg-[#0a0f19] border border-cyan-500/40 rounded-xl pl-12 pr-32 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 font-mono transition-all shadow-xl"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-black font-mono font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                <span>SEARCH</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <button
              onClick={() => setActiveTab('marketplace')}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
            >
              <span>BROWSE PRODUCTS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSearchQuery('Global-T');
                setActiveTab('marketplace');
              }}
              className="px-5 py-2.5 rounded-xl bg-[#0e1422] hover:bg-[#141c30] text-cyan-300 border border-cyan-500/40 font-mono text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>FEATURED: Global-T (4,276 USDT)</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className="px-4 py-2.5 rounded-xl bg-[#0b1019] hover:bg-[#111827] text-slate-300 border border-slate-800 font-mono text-xs transition-all cursor-pointer"
            >
              TRACK ORDERS
            </button>
          </div>

          {/* Popular Categories Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <span className="text-[11px] font-mono text-slate-500 mr-1 flex items-center gap-1">
              <Terminal className="w-3 h-3 text-cyan-400" />
              POPULAR CATEGORIES:
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
                  className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-[11px] font-mono text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  {cat}
                </button>
              ))}
          </div>
        </div>

        {/* Marketplace Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-4 border-t border-slate-800/80">
          <div className="p-4 rounded-xl bg-[#090d16]/80 border border-cyan-500/20 text-center">
            <div className="flex items-center justify-center gap-1.5 text-cyan-400 mb-1">
              <Cpu className="w-4 h-4" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">CATALOG TOOLS</span>
            </div>
            <div className="font-mono text-2xl font-extrabold text-white">{products.length} AVAILABLE</div>
            <div className="text-[10px] font-mono text-emerald-400 mt-0.5">{products.length > 0 ? 'Enterprise Ready' : 'Catalog Ready'}</div>
          </div>

          <div className="p-4 rounded-xl bg-[#090d16]/80 border border-cyan-500/20 text-center">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">UPTIME SLA</span>
            </div>
            <div className="font-mono text-2xl font-extrabold text-white">99.98%</div>
            <div className="text-[10px] font-mono text-cyan-400 mt-0.5">Continuous Availability</div>
          </div>

          <div className="p-4 rounded-xl bg-[#090d16]/80 border border-cyan-500/20 text-center">
            <div className="flex items-center justify-center gap-1.5 text-purple-400 mb-1">
              <Database className="w-4 h-4" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">SETTLEMENT</span>
            </div>
            <div className="font-mono text-2xl font-extrabold text-white">USDT TRC-20</div>
            <div className="text-[10px] font-mono text-purple-300 mt-0.5">Fast Tron Network</div>
          </div>

          <div className="p-4 rounded-xl bg-[#090d16]/80 border border-cyan-500/20 text-center">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">PROVISIONING</span>
            </div>
            <div className="font-mono text-2xl font-extrabold text-white">INSTANT</div>
            <div className="text-[10px] font-mono text-amber-400 mt-0.5">Verified Licensing</div>
          </div>
        </div>
      </div>
    </div>
  );
};

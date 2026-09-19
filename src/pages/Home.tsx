import React from 'react';
import { useMarket } from '../context/MarketContext';
import { HeroSection } from '../components/HeroSection';
import { ProductCard } from '../components/ProductCard';
import { Zap, ArrowRight, ShieldAlert, Sparkles, Layers, Cpu } from 'lucide-react';

export const Home: React.FC = () => {
  const { products, setActiveTab, setSelectedCategory, categories } = useMarket();

  // Featured products (including MT-4001KIT)
  const featuredProducts = products.filter((p) => p.featured);
  // Latest listings
  const latestListings = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 pb-2 border-b border-cyan-500/20">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 font-bold mb-1">
              <Zap className="w-3.5 h-3.5 fill-cyan-400" />
              <span>PRIMARY RESEARCH SUITES</span>
            </div>
            <h2 className="text-2xl font-mono font-extrabold text-white">
              Featured Laboratory Toolkits
            </h2>
          </div>

          <button
            onClick={() => setActiveTab('marketplace')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View All ({products.length}) Toolkits</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Featured Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Category Explorer Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-2xl bg-[#070b13] border border-cyan-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>EXPLORE RESEARCH CATEGORIES</span>
            </h3>
            <span className="text-xs font-mono text-slate-500">6 Specialized Disciplines</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories
              .filter((c) => c !== 'All Categories')
              .map((cat) => {
                const count = products.filter((p) => p.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setActiveTab('marketplace');
                    }}
                    className="p-3.5 rounded-xl bg-[#0d1322]/80 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group cursor-pointer"
                  >
                    <div className="text-xs font-mono font-bold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                      {cat}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">
                      {count} {count === 1 ? 'Toolkit' : 'Toolkits'}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      </section>

      {/* Latest Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold mb-1">
              <Cpu className="w-3.5 h-3.5" />
              <span>FRESH TELEMETRY DEPLOYMENTS</span>
            </div>
            <h2 className="text-2xl font-mono font-extrabold text-white">
              Latest Laboratory Additions
            </h2>
          </div>

          <button
            onClick={() => setActiveTab('marketplace')}
            className="text-xs font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Catalog Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestListings.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

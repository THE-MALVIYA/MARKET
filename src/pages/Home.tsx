import React from 'react';
import { useMarket } from '../context/MarketContext';
import { HeroSection } from '../components/HeroSection';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight, Layers, Cpu, Lock } from 'lucide-react';

export const Home: React.FC = () => {
  const { products, setActiveTab, setSelectedCategory, categories } = useMarket();

  const featuredProducts = products.filter((p) => p.featured);
  const latestListings = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-12 pb-8">
      {/* Darkweb Gateway Hero */}
      <HeroSection />

      {/* Featured Market Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 pb-3 border-b border-[#1c261c]">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-semibold mb-1">
              <Lock className="w-3.5 h-3.5" />
              <span>Verified Priority Releases</span>
            </div>
            <h2 className="text-2xl font-mono font-bold text-white">
              Featured Onion Packages
            </h2>
          </div>

          <button
            onClick={() => setActiveTab('marketplace')}
            className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>View All ({products.length}) Packages</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Sector Directory Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 bg-[#070907] border border-[#1d271d]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#161e16]">
            <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Darknet Market Directories</span>
            </h3>
            <span className="text-xs font-mono text-zinc-500 tabular-nums">
              {categories.filter((c) => c !== 'All Categories').length} Active Sectors
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
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
                    className="p-3 bg-[#0b0e0b] hover:bg-[#111811] border border-[#1b241b] hover:border-emerald-500/50 text-left transition-colors group cursor-pointer"
                  >
                    <div className="text-xs font-mono font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors truncate">
                      {cat}
                    </div>
                    <div className="text-[11px] font-mono text-zinc-500 mt-1 tabular-nums">
                      {count} {count === 1 ? 'Listing' : 'Listings'}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      </section>

      {/* Latest Drops */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#1c261c]">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 font-semibold mb-1">
              <Cpu className="w-3.5 h-3.5" />
              <span>Recent Uploads</span>
            </div>
            <h2 className="text-2xl font-mono font-bold text-white">
              Latest Vendor Releases
            </h2>
          </div>

          <button
            onClick={() => setActiveTab('marketplace')}
            className="text-xs font-mono text-zinc-400 hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>Open Directory</span>
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

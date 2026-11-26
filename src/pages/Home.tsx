import React from 'react';
import { useMarket } from '../context/MarketContext';
import { HeroSection } from '../components/HeroSection';
import { ProductCard } from '../components/ProductCard';
import {
  ArrowRight,
  Layers,
  ShieldCheck,
  FileCode2,
  LifeBuoy,
  Lock,
  ScanLine
} from 'lucide-react';

export const Home: React.FC = () => {
  const { products, isLoadingProducts, setActiveTab, setSelectedCategory, categories } = useMarket();

  const featuredProducts = products.filter((p) => p.featured).slice(0, 6);
  const catalogCategories = categories.filter((c) => c !== 'All Categories');

  const platformCapabilities = [
    {
      icon: ShieldCheck,
      title: 'Secure Checkout',
      desc: 'Deterministic server-calculated totals with encrypted session management and duplicate-TXID protection.'
    },
    {
      icon: ScanLine,
      title: 'Verified Payment Processing',
      desc: 'On-chain Tron TRC-20 transaction lookup tracking real block confirmations and deposit verification.'
    },
    {
      icon: FileCode2,
      title: 'Technical Documentation',
      desc: 'Each suite ships with CLI verification snippets, system compatibility guides, and license manifests.'
    },
    {
      icon: LifeBuoy,
      title: 'Customer Support',
      desc: 'Built-in ticketing portal for order reconciliation, license key questions, and deployment guidance.'
    },
    {
      icon: Lock,
      title: 'Secure Account Management',
      desc: 'Scoped account dashboards containing order ledgers, issued license keys, and authenticated bundle downloads.'
    }
  ];

  return (
    <div className="space-y-20 pb-12">
      <HeroSection />

      {/* Real Platform Capabilities Trust Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {platformCapabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className="dsk-panel-3d p-5 rounded-xl flex flex-col gap-2.5"
              >
                <div className="dsk-icon-3d w-9 h-9 rounded-lg flex items-center justify-center text-[#00D69A]">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-[#F4F7F6] tracking-wide">{cap.title}</h3>
                <p className="text-[11px] text-[#8F9CA8] leading-relaxed">{cap.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-7 pb-4 border-b border-[#1E2936]">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#00D69A] font-semibold block mb-1">
              Curated Infrastructure Catalog
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F4F7F6]">
              Featured Security &amp; Infrastructure Suites
            </h2>
          </div>

          <button
            onClick={() => setActiveTab('products')}
            className="text-xs font-semibold text-[#00D69A] hover:text-[#0EA5A4] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>Explore All ({products.length}) Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="h-[420px] rounded-xl border border-[#1E2936] cp-skeleton" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Dynamic Categories Grid (Strictly real catalog domains) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="dsk-surface p-6 sm:p-8 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#1E2936]">
            <div>
              <h2 className="text-xl font-bold text-[#F4F7F6] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#00D69A]" />
                <span>Browse by Technology Domain</span>
              </h2>
              <p className="text-xs text-[#8F9CA8] mt-1">
                Every category reflects active software packages currently published in the DEEPSEEK catalog.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('categories')}
              className="text-xs font-semibold text-[#0EA5A4] hover:text-[#00D69A] cursor-pointer whitespace-nowrap"
            >
              View Directory &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {catalogCategories.map((cat) => {
              const count = products.filter((p) => p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setActiveTab('products');
                  }}
                  className="dsk-panel-3d p-4 rounded-xl text-left group cursor-pointer flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#F4F7F6] group-hover:text-[#00D69A] transition-colors line-clamp-1">
                      {cat}
                    </div>
                    <div className="text-[11px] font-mono text-[#8F9CA8] mt-1 tabular-nums">
                      {count} {count === 1 ? 'Product' : 'Products'}
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8F9CA8] group-hover:text-[#00D69A] shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why DEEPSEEK Editorial Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="dsk-surface rounded-2xl p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#0EA5A4] font-semibold block">
              Engineering Philosophy
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F4F7F6] leading-tight">
              Precision Distribution for Enterprise Security Teams
            </h2>
            <p className="text-sm text-[#8F9CA8] leading-relaxed">
              DEEPSEEK is an independent Deephat and developer infrastructure marketplace built around transparent specifications, verifiable package manifests, and auditable blockchain settlement. From distributed eBPF telemetry and zero-trust gateways to database flash acceleration, every tool is documented for serious production evaluation.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => setActiveTab('research')}
                className="px-4 py-2.5 rounded-lg bg-[#0D1116] hover:bg-[#151C24] border border-[#1E2936] hover:border-[#00D69A]/50 text-xs font-semibold text-[#F4F7F6] cursor-pointer"
              >
                Read Research Library
              </button>
              <button
                onClick={() => setActiveTab('docs')}
                className="px-4 py-2.5 rounded-lg bg-[#0D1116] hover:bg-[#151C24] border border-[#1E2936] hover:border-[#0EA5A4]/50 text-xs font-semibold text-[#00D69A] cursor-pointer"
              >
                Explore CLI &amp; API Docs
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
            <div className="dsk-panel-3d p-4 rounded-xl">
              <div className="text-xs font-bold text-[#F4F7F6]">Transparent Software Specifications</div>
              <p className="text-[11px] text-[#8F9CA8] mt-1">
                Clear architecture summaries, runtime prerequisites, and version tags before you commit to a license.
              </p>
            </div>
            <div className="dsk-panel-3d p-4 rounded-xl">
              <div className="text-xs font-bold text-[#F4F7F6]">Audited Licensing Pipeline</div>
              <p className="text-[11px] text-[#8F9CA8] mt-1">
                Orders unlock downloadable JSON deployment manifests and unique license keys once settlement confirms.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

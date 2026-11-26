import React, { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { ProductCard } from './ProductCard';
import { ProductDetailShowcase3D } from './ProductDetailShowcase3D';
import {
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Star,
  ShoppingCart,
  Heart,
  CheckCircle2,
  Cpu,
  Terminal,
  FileText,
  Copy,
  Check,
  Layers,
  Server,
  LifeBuoy,
  Box
} from 'lucide-react';

export const ProductDetailView: React.FC = () => {
  const {
    selectedProduct,
    products,
    setActiveTab,
    addToCart,
    toggleWishlist,
    isInWishlist,
    openProductDetails,
    addToast
  } = useMarket();

  const [showcaseMode, setShowcaseMode] = useState<'3d' | 'gallery'>('3d');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [detailTab, setDetailTab] = useState<'specs' | 'install' | 'license'>('specs');
  const [copiedCli, setCopiedCli] = useState(false);

  useEffect(() => {
    setShowcaseMode('3d');
    setActiveImageIndex(0);
    setDetailTab('specs');
  }, [selectedProduct?.id]);

  if (!selectedProduct) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="dsk-surface p-8 rounded-xl">
          <h2 className="text-xl font-bold text-white mb-2">No Product Selected</h2>
          <p className="text-xs text-[#CBD5E1] mb-6">
            Choose a software suite from the catalog to inspect specifications, supported platforms, and licensing terms.
          </p>
          <button
            onClick={() => setActiveTab('products')}
            className="dsk-btn-3d px-5 py-2.5 rounded-lg text-xs cursor-pointer"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const screenshots =
    selectedProduct.screenshots && selectedProduct.screenshots.length > 0
      ? selectedProduct.screenshots
      : selectedProduct.demoScreenshots && selectedProduct.demoScreenshots.length > 0
      ? selectedProduct.demoScreenshots
      : [selectedProduct.image];

  const saved = isInWishlist(selectedProduct.id);
  const pkgSlug = selectedProduct.slug || selectedProduct.name.toLowerCase().replace(/\s+/g, '-');
  const code = selectedProduct.productCode || selectedProduct.id.toUpperCase();

  const relatedProducts = products
    .filter((p) => p.id !== selectedProduct.id)
    .sort((a, b) => {
      const sameCatA = a.category === selectedProduct.category ? 1 : 0;
      const sameCatB = b.category === selectedProduct.category ? 1 : 0;
      if (sameCatA !== sameCatB) return sameCatB - sameCatA;
      return b.rating - a.rating;
    })
    .slice(0, 3);

  const cliSnippet = `# Verify signed DEEPSEEK package manifest before deployment
deepseek-cli verify --code "${code}" --sha256
deepseek-cli install ${pkgSlug}@${selectedProduct.version || 'latest'} \\
  --license-key <YOUR_ISSUED_LICENSE_KEY>`;

  const supportedPlatforms =
    selectedProduct.supportedPlatforms && selectedProduct.supportedPlatforms.length > 0
      ? selectedProduct.supportedPlatforms
      : ['Linux (x86_64 / ARM64)', 'Container / Kubernetes', 'Enterprise Server Environments'];

  const handleCopyCli = () => {
    navigator.clipboard.writeText(cliSnippet);
    setCopiedCli(true);
    addToast({
      type: 'info',
      title: 'CLI Command Copied',
      message: `Installation verification snippet for ${selectedProduct.name} copied.`
    });
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#CBD5E1]">
          <button
            onClick={() => setActiveTab('products')}
            className="inline-flex items-center gap-1.5 text-[#00D69A] hover:text-[#38BDF8] font-medium cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Products</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-[#3A4F66]" />
          <span className="truncate max-w-[220px]">{selectedProduct.category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#3A4F66]" />
          <span className="text-white font-medium">{selectedProduct.name}</span>
        </div>

        <span className="text-xs font-mono text-[#CBD5E1]">
          ID: <span className="text-[#00D69A]">{code}</span>
        </span>
      </div>

      {/* Two-Column Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Live 3D Product Showcase + Optional Screenshots */}
        <div className="lg:col-span-6 space-y-4">
          <div className="dsk-chassis-3d rounded-xl overflow-hidden aspect-[16/10] relative">
            {showcaseMode === '3d' ? (
              <ProductDetailShowcase3D product={selectedProduct} />
            ) : (
              <img
                src={screenshots[activeImageIndex] || selectedProduct.image}
                alt={selectedProduct.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowcaseMode('3d')}
              className={`h-16 px-3.5 rounded-lg border flex items-center gap-2 text-xs font-mono font-semibold transition-all cursor-pointer ${
                showcaseMode === '3d'
                  ? 'border-[#00D69A] bg-[#00D69A]/15 text-[#00D69A] shadow-[0_0_18px_rgba(0,214,154,0.22)]'
                  : 'dsk-btn-secondary-3d text-[#CBD5E1]'
              }`}
            >
              <Box className="w-4 h-4" />
              <span>Live 3D View</span>
            </button>

            {screenshots.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setShowcaseMode('gallery');
                  setActiveImageIndex(idx);
                }}
                className={`w-24 h-16 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                  showcaseMode === 'gallery' && activeImageIndex === idx
                    ? 'border-[#00D69A] opacity-100'
                    : 'border-[#1E2936] opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`${selectedProduct.name} preview ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Metadata Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="dsk-panel-3d p-3.5 rounded-xl">
              <span className="text-[10px] font-mono uppercase text-[#CBD5E1] block">Product ID</span>
              <span className="text-xs font-mono font-bold text-[#00D69A] mt-0.5 block">{code}</span>
            </div>
            <div className="dsk-panel-3d p-3.5 rounded-xl">
              <span className="text-[10px] font-mono uppercase text-[#CBD5E1] block">Version Info</span>
              <span className="text-xs font-mono font-bold text-white mt-0.5 block">
                {selectedProduct.version || 'v2026.1-LTS'}
              </span>
            </div>
            <div className="dsk-panel-3d p-3.5 rounded-xl col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono uppercase text-[#CBD5E1] block">Verification</span>
              <span className="text-xs font-mono font-bold text-[#38BDF8] mt-0.5 block">
                SHA-256 Manifest
              </span>
            </div>
          </div>
        </div>

        {/* Right: Title, Price, Features, Buy Now / Add to Cart */}
        <div className="dsk-surface lg:col-span-6 flex flex-col justify-between rounded-xl p-6 sm:p-8">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono text-[#00D69A] font-semibold">
                {selectedProduct.category}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#E5B84B] tabular-nums">
                <Star className="w-4 h-4 fill-[#E5B84B]" />
                <span className="font-bold">{selectedProduct.rating.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                {selectedProduct.name}
              </h1>
              <p className="text-sm text-[#CBD5E1] leading-relaxed">
                {selectedProduct.description}
              </p>
            </div>

            <div className="dsk-panel-3d p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase text-[#CBD5E1] block">
                  {selectedProduct.licenseType || 'Enterprise Single-Cluster License'}
                </span>
                <div className="text-3xl font-bold font-mono text-white tabular-nums mt-0.5">
                  {selectedProduct.price.toLocaleString()}{' '}
                  <span className="text-sm font-semibold text-[#00D69A]">USDT</span>
                </div>
              </div>
              <div className="text-right text-xs">
                <span className="text-[#00D69A] font-medium block">Tron TRC-20 Settlement</span>
                <span className="text-[#CBD5E1]">Includes license key &amp; manifest download</span>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#CBD5E1] mb-2.5">
                Key Features
              </h3>
              <ul className="space-y-2">
                {selectedProduct.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-[#E2E8F0]">
                    <CheckCircle2 className="w-4 h-4 text-[#00D69A] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-[#253445] flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                addToCart(selectedProduct, 1);
                setActiveTab('checkout');
              }}
              className="dsk-btn-3d flex-1 py-3 px-5 rounded-lg text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Buy Now</span>
            </button>

            <button
              onClick={() => addToCart(selectedProduct, 1)}
              className="dsk-btn-secondary-3d py-3 px-4 rounded-lg text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 text-[#00D69A]" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={() => toggleWishlist(selectedProduct)}
              className={`py-3 px-4 rounded-lg border font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                saved
                  ? 'bg-[#00D69A]/15 border-[#00D69A] text-[#00D69A]'
                  : 'dsk-btn-secondary-3d'
              }`}
            >
              <Heart className={`w-4 h-4 ${saved ? 'fill-[#00D69A]' : ''}`} />
              <span>{saved ? 'Saved' : 'Wishlist'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Technical Specs, Installation & Docs, Licensing & Support Tabs */}
      <section className="dsk-surface rounded-xl overflow-hidden">
        <div className="flex flex-wrap border-b border-[#253445] bg-[#0A0F16]">
          {[
            { id: 'specs', label: 'Technical Specs & System Requirements', icon: Cpu },
            { id: 'install', label: 'Installation & Documentation', icon: Terminal },
            { id: 'license', label: 'License Info & Support', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = detailTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setDetailTab(tab.id as typeof detailTab)}
                className={`px-5 py-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'border-[#00D69A] text-[#00D69A] bg-[#101721]'
                    : 'border-transparent text-[#CBD5E1] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6 sm:p-8">
          {detailTab === 'specs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#00D69A]" />
                  <span>Technical Specifications &amp; Supported Platforms</span>
                </h3>
                <div className="dsk-panel-3d rounded-lg divide-y divide-[#253445] text-xs">
                  <div className="p-3 flex justify-between gap-4">
                    <span className="text-[#CBD5E1]">Package ID</span>
                    <span className="font-mono text-white">{code}</span>
                  </div>
                  <div className="p-3 flex justify-between gap-4">
                    <span className="text-[#CBD5E1]">Architecture</span>
                    <span className="font-mono text-white text-right">
                      {selectedProduct.architecture || 'x86_64 / ARM64 Enterprise Runtime'}
                    </span>
                  </div>
                  <div className="p-3 flex justify-between gap-4">
                    <span className="text-[#CBD5E1]">Supported Platforms</span>
                    <span className="font-mono text-[#38BDF8] text-right">
                      {supportedPlatforms.join(' · ')}
                    </span>
                  </div>
                  <div className="p-3 flex justify-between gap-4">
                    <span className="text-[#CBD5E1]">Release Version</span>
                    <span className="font-mono text-[#00D69A]">
                      {selectedProduct.version || 'v2026.1-LTS'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#E5B84B]" />
                  <span>System Requirements</span>
                </h3>
                <div className="dsk-panel-3d p-4 rounded-lg space-y-2.5">
                  {(selectedProduct.requirements && selectedProduct.requirements.length > 0
                    ? selectedProduct.requirements
                    : [
                        '64-bit Linux (Ubuntu 22.04+, RHEL 9+, Debian 12+)',
                        'Minimum 8GB system RAM recommended',
                        'TLS 1.3 outbound connectivity for manifest checks'
                      ]
                  ).map((req, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-[#E2E8F0]">
                      <ChevronRight className="w-4 h-4 text-[#E5B84B] shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {detailTab === 'install' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Installation Instructions</h3>
                  <p className="text-xs text-[#CBD5E1] mt-0.5">
                    After payment confirmation, download your signed JSON license bundle from the User Dashboard and run verification:
                  </p>
                </div>
                <button
                  onClick={handleCopyCli}
                  className="dsk-btn-secondary-3d px-3 py-1.5 rounded-lg text-xs font-mono text-[#00D69A] flex items-center gap-1.5 cursor-pointer self-start"
                >
                  {copiedCli ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCli ? 'Copied' : 'Copy Command'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-lg bg-[#05080D] border border-[#253445] text-xs font-mono text-[#00D69A] overflow-x-auto leading-relaxed">
                {cliSnippet}
              </pre>

              <div className="dsk-panel-3d flex items-center justify-between p-4 rounded-lg text-xs">
                <span className="text-[#CBD5E1]">
                  Need integration guides, API verification specs, or environment templates?
                </span>
                <button
                  onClick={() => setActiveTab('docs')}
                  className="text-[#00D69A] hover:text-[#38BDF8] font-semibold cursor-pointer"
                >
                  Open Full Documentation &rarr;
                </button>
              </div>
            </div>
          )}

          {detailTab === 'license' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="dsk-panel-3d p-5 rounded-xl space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-white">
                  <ShieldCheck className="w-4 h-4 text-[#00D69A]" />
                  <span>License Terms &amp; Entitlements</span>
                </div>
                <p className="text-[#CBD5E1] leading-relaxed">
                  Each purchase issues a unique cryptographic license key bound to your account and order reference, valid for 12 months of authorized deployment and security updates.
                </p>
              </div>

              <div className="dsk-panel-3d p-5 rounded-xl space-y-3">
                <div className="flex items-center gap-2 font-bold text-white">
                  <LifeBuoy className="w-4 h-4 text-[#38BDF8]" />
                  <span>Engineering Support</span>
                </div>
                <p className="text-[#CBD5E1] leading-relaxed">
                  Need deployment sizing guidance or payment reconciliation for {selectedProduct.name}? Open a ticket with our support team.
                </p>
                <button
                  onClick={() => setActiveTab('support')}
                  className="text-[#00D69A] hover:text-[#38BDF8] font-semibold cursor-pointer"
                >
                  Visit Support Helpdesk &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Products */}
      <section>
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#253445]">
          <h2 className="text-xl font-bold text-white">Related Solutions</h2>
          <button
            onClick={() => setActiveTab('products')}
            className="text-xs font-semibold text-[#00D69A] hover:text-[#38BDF8] cursor-pointer"
          >
            View All Products &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedProducts.map((rel) => (
            <div key={rel.id} onClick={() => openProductDetails(rel)}>
              <ProductCard product={rel} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

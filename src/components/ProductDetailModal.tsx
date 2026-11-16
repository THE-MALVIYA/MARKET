import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import {
  X,
  Star,
  ShoppingCart,
  CheckCircle2,
  Terminal,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, addToCart, setActiveTab } = useMarket();
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  if (!selectedProduct) return null;

  const handleBuyNow = () => {
    addToCart(selectedProduct, 1);
    setSelectedProduct(null);
    setActiveTab('checkout');
  };

  const handleAddToCart = () => {
    addToCart(selectedProduct, 1);
  };

  const screenshots = (selectedProduct.screenshots && selectedProduct.screenshots.length > 0)
    ? selectedProduct.screenshots
    : (selectedProduct.demoScreenshots && selectedProduct.demoScreenshots.length > 0)
      ? selectedProduct.demoScreenshots
      : [selectedProduct.image];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#070907] border border-emerald-500/40 max-w-3xl w-full my-auto overflow-hidden shadow-2xl relative">
        {/* Header Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-3 right-3 z-20 p-2 bg-[#0b0e0b] border border-[#243024] text-zinc-400 hover:text-white hover:border-emerald-500/50 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Images & Spec Manifest */}
          <div className="bg-[#040504] p-5 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#1b241b]">
            <div>
              <div className="relative overflow-hidden aspect-video mb-3 border border-[#1f291f] bg-black">
                <img
                  src={screenshots[activeImageIndex] || selectedProduct.image}
                  alt={selectedProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {selectedProduct.featured && (
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500 text-black">
                      FEATURED
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 mb-4">
                {screenshots.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-12 overflow-hidden border transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-emerald-400 opacity-100'
                        : 'border-[#1f291f] opacity-55 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Manifest Sheet */}
            <div className="p-3 bg-[#080b08] border border-[#1a221a] space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-zinc-500">
                <span>Package Code:</span>
                <span className="text-emerald-400 font-bold">{selectedProduct.productCode || selectedProduct.id}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Build Version:</span>
                <span className="text-zinc-200">{selectedProduct.version || 'v2026.1'}</span>
              </div>
              <div className="flex justify-between text-zinc-500 gap-2">
                <span>Architecture:</span>
                <span className="text-zinc-200 text-right truncate">{selectedProduct.architecture || 'x86_64 / ARM64'}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Signature:</span>
                <span className="text-emerald-400">PGP &amp; SHA-256 Verified</span>
              </div>
            </div>
          </div>

          {/* Right: Info, Specs, Purchase */}
          <div className="p-6 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div>
              {/* Category and Rating */}
              <div className="flex items-center justify-between gap-2 mb-2 text-xs font-mono pr-8">
                <span className="text-emerald-400 truncate">
                  {selectedProduct.category}
                </span>
                <div className="flex items-center gap-1 text-amber-400 shrink-0 tabular-nums">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold">{selectedProduct.rating}</span>
                  <span className="text-zinc-500">/ 5.0</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-mono font-bold text-white mb-3">
                {selectedProduct.name}
              </h2>

              {/* Price Strip */}
              <div className="flex items-baseline justify-between gap-2 mb-4 p-3 bg-[#040504] border border-emerald-500/35">
                <div>
                  <span className="text-[11px] font-mono text-zinc-500 block">Escrow Settlement:</span>
                  <span className="font-mono text-2xl font-bold text-emerald-400 tabular-nums">
                    {selectedProduct.price.toLocaleString()} <span className="text-sm font-semibold">USDT</span>
                  </span>
                </div>
                <span className="text-[11px] font-mono text-amber-400">TRC-20 Escrow</span>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Package Overview</span>
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed bg-[#040504] p-3 border border-[#1a221a]">
                  {selectedProduct.description}
                </p>
              </div>

              {/* Features */}
              <div className="mb-4">
                <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Capabilities &amp; Modules</span>
                </h4>
                <ul className="grid grid-cols-1 gap-1.5">
                  {selectedProduct.features.map((feat, idx) => (
                    <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              {selectedProduct.requirements && selectedProduct.requirements.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Environment Requirements</span>
                  </h4>
                  <div className="p-2.5 bg-[#040504] border border-[#1a221a] text-[11px] font-mono text-zinc-400 space-y-1">
                    {selectedProduct.requirements.map((req, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <ChevronRight className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#1b241b] grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={handleAddToCart}
                className="py-3 px-4 bg-[#0c100c] hover:bg-[#141c14] border border-[#243224] hover:border-emerald-500/50 text-zinc-200 hover:text-emerald-400 font-mono font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

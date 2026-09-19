import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import {
  X,
  Star,
  Zap,
  ShoppingCart,
  CheckCircle2,
  Cpu,
  Layers,
  Terminal,
  ShieldCheck,
  ExternalLink,
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
      : [
          selectedProduct.image,
          'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80'
        ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#090d16] border border-cyan-500/40 rounded-2xl max-w-3xl w-full my-auto overflow-hidden shadow-2xl relative cyber-glow-cyan">
        {/* Header Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-black/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Images & Gallery */}
          <div className="bg-black/60 p-5 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
            <div>
              <div className="relative rounded-xl overflow-hidden aspect-video mb-3 border border-slate-800">
                <img
                  src={screenshots[activeImageIndex] || selectedProduct.image}
                  alt={selectedProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 flex gap-1.5">
                  {selectedProduct.featured && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500 text-black flex items-center gap-1 shadow">
                      <Zap className="w-3 h-3 fill-black" />
                      FEATURED
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/80 text-cyan-400 border border-cyan-800/40">
                    {selectedProduct.productCode || 'TP-PRO'}
                  </span>
                </div>
              </div>

              {/* Thumbnails Gallery */}
              <div className="flex gap-2 mb-4">
                {screenshots.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx ? 'border-cyan-400 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Spec sheet info box */}
            <div className="p-3 rounded-lg bg-[#0c121e] border border-slate-800 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Product ID:</span>
                <span className="text-cyan-300 font-bold">{selectedProduct.id}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Version:</span>
                <span className="text-slate-200">{selectedProduct.version || 'v2026.1'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Architecture:</span>
                <span className="text-slate-200">{selectedProduct.architecture || 'Universal x86_64 / ARM64'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Verification:</span>
                <span className="text-emerald-400">Enterprise Audited</span>
              </div>
            </div>
          </div>

          {/* Right: Info, Features, Actions */}
          <div className="p-6 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div>
              {/* Category and Rating */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-800/50 text-cyan-300">
                  {selectedProduct.category}
                </span>
                <div className="flex items-center gap-1 font-mono text-xs text-emerald-400">
                  <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                  <span className="font-bold">{selectedProduct.rating}</span>
                  <span className="text-slate-500">/ 5.0</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-mono font-extrabold text-white mb-2">
                {selectedProduct.name}
              </h2>

              {/* Price Banner */}
              <div className="flex items-baseline gap-2 mb-4 p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
                <span className="text-xs font-mono text-slate-400">License Price:</span>
                <span className="font-mono text-2xl font-extrabold text-emerald-400">
                  {selectedProduct.price} <span className="text-sm font-semibold">USDT</span>
                </span>
                <span className="text-[11px] font-mono text-cyan-400/80 ml-auto">Verified Release</span>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  Description
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-[#06090e] p-3 rounded-lg border border-slate-800">
                  {selectedProduct.description}
                </p>
              </div>

              {/* Features */}
              <div className="mb-4">
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  Key Features & Specifications
                </h4>
                <ul className="grid grid-cols-1 gap-1.5">
                  {selectedProduct.features.map((feat, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              {selectedProduct.requirements && selectedProduct.requirements.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    System & Environment Requirements
                  </h4>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                    {selectedProduct.requirements.map((req, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <ChevronRight className="w-3 h-3 text-purple-400 flex-shrink-0" />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={handleAddToCart}
                className="py-3 px-4 rounded-xl bg-[#0c121e] hover:bg-[#141d30] border border-cyan-500/40 text-cyan-300 font-mono font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>ADD TO CART</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/30 cursor-pointer"
              >
                <span>BUY NOW</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

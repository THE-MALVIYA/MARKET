import React, { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { ProductLiveVisual } from './ProductLiveVisual';
import {
  X,
  Star,
  ShoppingCart,
  CheckCircle2,
  ShieldCheck,
  ArrowUpRight,
  Box
} from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, addToCart, setActiveTab, activeTab, openProductDetails } = useMarket();
  const [modalMode, setModalMode] = useState<'3d' | 'gallery'>('3d');
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  useEffect(() => {
    setModalMode('3d');
    setActiveImageIndex(0);
  }, [selectedProduct?.id]);

  if (!selectedProduct || activeTab === 'product') return null;

  const screenshots =
    selectedProduct.screenshots && selectedProduct.screenshots.length > 0
      ? selectedProduct.screenshots
      : selectedProduct.demoScreenshots && selectedProduct.demoScreenshots.length > 0
      ? selectedProduct.demoScreenshots
      : [selectedProduct.image];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#11161D] border border-[#1E2936] rounded-xl max-w-3xl w-full my-auto overflow-hidden shadow-2xl relative">
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-3 right-3 z-20 p-2 rounded-lg bg-[#0D1116] border border-[#1E2936] text-[#8F9CA8] hover:text-[#F4F7F6] cursor-pointer"
          aria-label="Close preview"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="bg-[#0D1116] p-5 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#1E2936]">
            <div>
              <div className="relative rounded-lg overflow-hidden aspect-video mb-3 border border-[#1E2936] bg-[#06090E]">
                {modalMode === '3d' ? (
                  <ProductLiveVisual product={selectedProduct} />
                ) : (
                  <img
                    src={screenshots[activeImageIndex] || selectedProduct.image}
                    alt={selectedProduct.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setModalMode('3d')}
                  className={`h-12 px-2.5 rounded border flex items-center gap-1.5 text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                    modalMode === '3d'
                      ? 'border-[#00D69A] bg-[#00D69A]/15 text-[#00D69A]'
                      : 'border-[#1E2936] bg-[#11161D] text-[#8F9CA8] hover:text-[#F4F7F6]'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>3D Live</span>
                </button>
                {screenshots.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setModalMode('gallery');
                      setActiveImageIndex(idx);
                    }}
                    className={`w-16 h-12 rounded overflow-hidden border transition-all cursor-pointer ${
                      modalMode === 'gallery' && activeImageIndex === idx
                        ? 'border-[#00D69A] opacity-100'
                        : 'border-[#1E2936] opacity-55 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#11161D] border border-[#1E2936] space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[#8F9CA8]">
                <span>Product ID:</span>
                <span className="text-[#00D69A] font-bold">{selectedProduct.productCode || selectedProduct.id}</span>
              </div>
              <div className="flex justify-between text-[#8F9CA8]">
                <span>Build Version:</span>
                <span className="text-[#F4F7F6]">{selectedProduct.version || 'v2026.1'}</span>
              </div>
              <div className="flex justify-between text-[#8F9CA8]">
                <span>Attestation:</span>
                <span className="text-[#00D69A]">SHA-256 Verified</span>
              </div>
            </div>
          </div>

          <div className="p-6 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2 text-xs pr-8">
                <span className="text-[#00D69A] font-mono truncate">{selectedProduct.category}</span>
                <div className="flex items-center gap-1 text-[#E5B84B] shrink-0 tabular-nums font-mono">
                  <Star className="w-3.5 h-3.5 fill-[#E5B84B]" />
                  <span className="font-bold">{selectedProduct.rating}</span>
                </div>
              </div>

              <h2 className="text-xl font-bold text-[#F4F7F6] mb-3">{selectedProduct.name}</h2>

              <div className="flex items-baseline justify-between gap-2 mb-4 p-3 rounded-lg bg-[#0D1116] border border-[#1E2936]">
                <span className="font-mono text-xl font-bold text-[#F4F7F6] tabular-nums">
                  {selectedProduct.price.toLocaleString()} <span className="text-xs text-[#00D69A]">USDT</span>
                </span>
                <span className="text-[11px] font-mono text-[#00D69A] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              </div>

              <p className="text-xs text-[#8F9CA8] leading-relaxed mb-4">{selectedProduct.description}</p>

              <ul className="space-y-1.5 mb-4">
                {selectedProduct.features.slice(0, 4).map((feat, idx) => (
                  <li key={idx} className="text-xs text-[#F4F7F6]/90 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00D69A] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-[#1E2936] space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addToCart(selectedProduct, 1)}
                  className="py-2.5 px-3 rounded-lg bg-[#0D1116] hover:bg-[#151C24] border border-[#1E2936] text-[#F4F7F6] font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-[#00D69A]" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={() => {
                    addToCart(selectedProduct, 1);
                    setSelectedProduct(null);
                    setActiveTab('checkout');
                  }}
                  className="py-2.5 px-3 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] font-semibold text-xs flex items-center justify-center cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                </button>
              </div>
              <button
                onClick={() => openProductDetails(selectedProduct)}
                className="w-full py-2 text-xs text-[#00D69A] hover:text-[#0EA5A4] font-medium flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Open Full Specifications, Docs &amp; Reviews</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

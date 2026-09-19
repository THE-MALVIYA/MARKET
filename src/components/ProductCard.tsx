import React from 'react';
import { Product } from '../types';
import { useMarket } from '../context/MarketContext';
import { ShoppingCart, Zap, Star, Shield, Terminal, ArrowUpRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, setSelectedProduct, setActiveTab } = useMarket();

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setActiveTab('checkout');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div
      onClick={() => setSelectedProduct(product)}
      className={`group relative rounded-xl bg-[#090d15]/85 border transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer hover:-translate-y-1 ${
        product.featured
          ? 'border-cyan-500/40 hover:border-cyan-400 hover:shadow-xl hover:shadow-cyan-950/40'
          : 'border-slate-800 hover:border-slate-700 hover:shadow-lg'
      }`}
    >
      {/* Top glowing accent line if featured */}
      {product.featured && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
      )}

      {/* Header section with image */}
      <div>
        <div className="relative h-44 w-full overflow-hidden bg-black/60">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
          />

          {/* Cyber scanline overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090d15] via-transparent to-transparent" />

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
            {product.featured && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500 text-black flex items-center gap-1 shadow-md shadow-cyan-500/30">
                <Zap className="w-2.5 h-2.5 fill-black" />
                FEATURED
              </span>
            )}
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-black/80 text-cyan-300 border border-cyan-800/50 backdrop-blur-sm">
              {product.productCode || 'TOOL-PKG'}
            </span>
          </div>

          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/80 text-emerald-400 border border-emerald-800/50 backdrop-blur-sm flex items-center gap-1">
              <Star className="w-2.5 h-2.5 fill-emerald-400 text-emerald-400" />
              {product.rating}
            </span>
          </div>

          {/* Category Chip at bottom of image */}
          <div className="absolute bottom-2 left-2.5 z-10">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#090d15]/90 border border-slate-700 text-slate-300">
              {product.category}
            </span>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-mono font-bold text-base text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1">
              {product.name}
            </h3>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
            {product.description}
          </p>

          {/* Key Feature bullet */}
          {product.features && product.features[0] && (
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400/80 mb-3 line-clamp-1">
              <Terminal className="w-3 h-3 text-cyan-500 flex-shrink-0" />
              <span className="truncate">{product.features[0]}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Price & Actions */}
      <div className="p-4 pt-0 border-t border-slate-800/60 mt-auto">
        <div className="flex items-baseline justify-between pt-3 mb-3">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Price</span>
            <span className="font-mono font-extrabold text-lg text-emerald-400">
              {product.price}{' '}
              <span className="text-xs font-normal text-emerald-300/80">USDT</span>
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
            VERIFIED
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleAddToCart}
            className="py-2 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 font-mono text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Add to Cart"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add Cart</span>
          </button>
          <button
            onClick={handleBuyNow}
            className="py-2 px-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <span>BUY NOW</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Product } from '../types';
import { useMarket } from '../context/MarketContext';
import { ShoppingCart, Terminal, ArrowUpRight, ShieldCheck } from 'lucide-react';

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
      className={`group relative bg-[#080a08] border transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer hover:-translate-y-0.5 ${
        product.featured
          ? 'border-[#273827] hover:border-emerald-500/70'
          : 'border-[#192119] hover:border-[#2e3d2e]'
      }`}
    >
      {/* Featured Corner Crosshair Accent */}
      {product.featured && (
        <>
          <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-emerald-400 z-20 pointer-events-none" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-emerald-400 z-20 pointer-events-none" />
        </>
      )}

      <div>
        {/* Product Media */}
        <div className="relative h-52 w-full overflow-hidden bg-[#040504] border-b border-[#182018]">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 opacity-85 group-hover:opacity-100 contrast-110"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#080a08] via-black/25 to-transparent" />

          {/* Single subtle tag at top-left if featured */}
          {product.featured && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500 text-black tracking-wider">
                FEATURED
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-4">
          {/* Clean unboxed metadata row */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 mb-2 truncate">
            <span className="text-emerald-400/90 font-medium shrink-0">{product.productCode || 'PKG-00'}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{product.category}</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400 shrink-0 tabular-nums">{product.rating}</span>
          </div>

          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-mono font-bold text-base text-zinc-100 group-hover:text-emerald-400 transition-colors line-clamp-1">
              {product.name}
            </h3>
            <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
          </div>

          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
            {product.description}
          </p>

          {product.features && product.features[0] && (
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 mb-1 line-clamp-1">
              <Terminal className="w-3 h-3 text-emerald-500 flex-shrink-0" />
              <span className="truncate">{product.features[0]}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Escrow Price & Actions */}
      <div className="p-4 pt-3 border-t border-[#161e16] mt-auto bg-[#060806]">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Escrow Price</span>
            <span className="font-mono font-bold text-lg text-emerald-400 tabular-nums">
              {product.price.toLocaleString()}{' '}
              <span className="text-xs font-normal text-emerald-500/80">USDT</span>
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            PGP Signed
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleAddToCart}
            className="py-2 px-3 bg-[#0c100c] hover:bg-[#141b14] text-zinc-300 hover:text-emerald-400 border border-[#222c22] hover:border-emerald-500/40 font-mono text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            title="Add to Cart"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add Cart</span>
          </button>
          <button
            onClick={handleBuyNow}
            className="py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs flex items-center justify-center transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};

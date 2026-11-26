import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { useMarket } from '../context/MarketContext';
import { ProductLiveVisual } from './ProductLiveVisual';
import {
  ShoppingCart,
  Heart,
  Check,
  Star,
  ArrowUpRight
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, openProductDetails, toggleWishlist, isInWishlist } = useMarket();
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 25, active: false });
  const cardRef = useRef<HTMLElement | null>(null);

  const saved = isInWishlist(product.id);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!cardRef.current) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const rect = cardRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    const px = nx - 0.5;
    const py = ny - 0.5;
    setTilt({
      rx: -py * 6.5,
      ry: px * 6.5,
      gx: nx * 100,
      gy: ny * 100,
      active: true
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0, gx: 50, gy: 25, active: false });
  };

  return (
    <article
      ref={cardRef}
      onClick={() => openProductDetails(product)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1100px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(${tilt.active ? '8px' : '0px'})`
      }}
      className="dsk-card-3d dsk-surface group relative h-full hover:border-[#00D69A]/70 rounded-xl overflow-hidden flex flex-col justify-between cursor-pointer"
    >
      {/* Dynamic cursor-reactive specular sheen across machined card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-200"
        style={{
          opacity: tilt.active ? 1 : 0,
          background: `radial-gradient(360px circle at ${tilt.gx}% ${tilt.gy}%, rgba(0, 214, 154, 0.14), rgba(255, 255, 255, 0.04) 38%, transparent 72%)`
        }}
      />

      <div>
        {/* Live 3D Product Visual Stage */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#05080D] border-b border-[#28384A]">
          <ProductLiveVisual product={product} />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0D131B]/75 via-transparent to-black/25 z-10" />

          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-20">
            <span className="px-2 py-0.5 rounded bg-[#070B10]/92 border border-[#2C3C50] shadow-md text-[10px] font-mono font-semibold text-[#00D69A]">
              {product.productCode || product.id.toUpperCase()}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product);
              }}
              aria-label={saved ? 'Remove from Wishlist' : 'Add to Wishlist'}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                saved
                  ? 'bg-[#00D69A]/25 border-[#00D69A] text-[#00D69A] shadow-[0_0_12px_rgba(0,214,154,0.3)]'
                  : 'bg-[#070B10]/90 border-[#2C3C50] text-[#CBD5E1] hover:text-white hover:border-[#00D69A]/60'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-[#00D69A]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="text-[#CBD5E1] font-medium truncate">{product.category}</span>
            <span className="font-mono text-[10px] text-[#00D69A] font-semibold shrink-0">
              {product.version || 'LTS'}
            </span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-base text-white group-hover:text-[#00D69A] transition-colors line-clamp-1">
              {product.name}
            </h3>
            <span className="inline-flex items-center gap-1 text-xs font-mono text-[#E5B84B] shrink-0 tabular-nums">
              <Star className="w-3.5 h-3.5 fill-[#E5B84B]" />
              {product.rating.toFixed(2)}
            </span>
          </div>

          <p className="text-xs text-[#CBD5E1] line-clamp-2 leading-relaxed min-h-[38px]">
            {product.description}
          </p>

          <ul className="space-y-1.5 pt-1">
            {(product.features || []).slice(0, 2).map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2 text-[11px] text-[#E2E8F0]">
                <Check className="w-3.5 h-3.5 text-[#00D69A] shrink-0 mt-0.5" />
                <span className="line-clamp-1">{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Pricing & Actions Footer */}
      <div className="p-5 pt-3.5 border-t border-[#253445] bg-[#0A0F16]/90 mt-auto relative z-20">
        <div className="flex items-baseline justify-between mb-3.5">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9FB0C2] block">
              Enterprise License
            </span>
            <span className="font-mono font-bold text-lg text-white tabular-nums">
              {product.price.toLocaleString()}{' '}
              <span className="text-xs font-semibold text-[#00D69A]">USDT</span>
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#9FB0C2] uppercase">TRC-20</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openProductDetails(product);
            }}
            className="dsk-btn-3d flex-1 py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <span>View Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1);
            }}
            className="dsk-btn-secondary-3d px-3 py-2 rounded-lg hover:text-[#00D69A] text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            title="Add to Cart"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </article>
  );
};

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
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const cardRef = useRef<HTMLElement | null>(null);

  const saved = isInWishlist(product.id);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!cardRef.current) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -py * 4.5, ry: px * 4.5 });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  return (
    <article
      ref={cardRef}
      onClick={() => openProductDetails(product)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`
      }}
      className="dsk-card-3d group h-full bg-[#11161D] border border-[#1E2936] hover:border-[#00D69A]/50 rounded-xl overflow-hidden flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Live 3D Product Visual Stage */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#06090E] border-b border-[#1E2936]">
          <ProductLiveVisual product={product} />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#11161D]/70 via-transparent to-black/25 z-10" />

          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-20">
            <span className="px-2 py-0.5 rounded bg-[#07090B]/90 border border-[#1E2936] text-[10px] font-mono font-semibold text-[#00D69A]">
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
                  ? 'bg-[#00D69A]/20 border-[#00D69A] text-[#00D69A]'
                  : 'bg-[#07090B]/85 border-[#1E2936] text-[#8F9CA8] hover:text-[#F4F7F6] hover:border-[#00D69A]/50'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-[#00D69A]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="text-[#8F9CA8] font-medium truncate">{product.category}</span>
            <span className="font-mono text-[10px] text-[#0EA5A4] shrink-0">
              {product.version || 'LTS'}
            </span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-base text-[#F4F7F6] group-hover:text-[#00D69A] transition-colors line-clamp-1">
              {product.name}
            </h3>
            <span className="inline-flex items-center gap-1 text-xs font-mono text-[#E5B84B] shrink-0 tabular-nums">
              <Star className="w-3.5 h-3.5 fill-[#E5B84B]" />
              {product.rating.toFixed(2)}
            </span>
          </div>

          <p className="text-xs text-[#8F9CA8] line-clamp-2 leading-relaxed min-h-[38px]">
            {product.description}
          </p>

          <ul className="space-y-1.5 pt-1">
            {(product.features || []).slice(0, 2).map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2 text-[11px] text-[#D1D9E0]">
                <Check className="w-3.5 h-3.5 text-[#00D69A] shrink-0 mt-0.5" />
                <span className="line-clamp-1">{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Pricing & Actions Footer */}
      <div className="p-5 pt-3.5 border-t border-[#1E2936] bg-[#0D1116] mt-auto">
        <div className="flex items-baseline justify-between mb-3.5">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8F9CA8] block">
              Enterprise License
            </span>
            <span className="font-mono font-bold text-lg text-[#F4F7F6] tabular-nums">
              {product.price.toLocaleString()}{' '}
              <span className="text-xs font-semibold text-[#00D69A]">USDT</span>
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#8F9CA8] uppercase">TRC-20</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openProductDetails(product);
            }}
            className="flex-1 py-2 px-3 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>View Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1);
            }}
            className="px-3 py-2 rounded-lg bg-[#11161D] hover:bg-[#151C24] border border-[#1E2936] hover:border-[#00D69A]/50 text-[#F4F7F6] hover:text-[#00D69A] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
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

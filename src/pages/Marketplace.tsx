import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { ProductCard } from '../components/ProductCard';
import { ProductLiveVisual } from '../components/ProductLiveVisual';
import {
  Search,
  Grid,
  List,
  ShieldCheck,
  RotateCcw,
  Package,
  Heart,
  ShoppingCart,
  ArrowUpRight
} from 'lucide-react';

export const Marketplace: React.FC = () => {
  const {
    products,
    isLoadingProducts,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    openProductDetails,
    addToCart,
    toggleWishlist,
    isInWishlist
  } = useMarket();

  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [onlyFeatured, setOnlyFeatured] = useState<boolean>(false);

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'All Categories' && p.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      const matchCode = p.productCode ? p.productCode.toLowerCase().includes(q) : false;
      if (!matchName && !matchDesc && !matchCat && !matchCode) {
        return false;
      }
    }
    if (onlyFeatured && !p.featured) {
      return false;
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });

  const resetFilters = () => {
    setSelectedCategory('All Categories');
    setSearchQuery('');
    setOnlyFeatured(false);
    setSortBy('featured');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-5 border-b border-[#1E2936]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F4F7F6]">
              Products Catalog
            </h1>
            <span className="px-2.5 py-0.5 rounded bg-[#0D1116] border border-[#1E2936] text-xs font-mono text-[#00D69A] tabular-nums">
              {sortedProducts.length} Suites
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8F9CA8] mt-1.5">
            Complete catalog of Deephat tools, telemetry platforms, cryptographic modules, and infrastructure suites.
          </p>
        </div>

        <button
          onClick={() => {
            setSearchQuery('TRANSACTION KIT');
            setSelectedCategory('All Categories');
          }}
          className="px-3.5 py-2 rounded-lg bg-[#11161D] border border-[#1E2936] hover:border-[#E5B84B]/60 text-[#E5B84B] text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Spotlight: TRANSACTION KIT</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="dsk-surface rounded-xl p-4 mb-8 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[#8F9CA8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, code, category, or capability..."
              className="w-full rounded-lg bg-[#0D1116] border border-[#1E2936] pl-9 pr-4 py-2 text-xs text-[#F4F7F6] placeholder-[#8F9CA8]/70 focus:border-[#00D69A] focus:outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg bg-[#0D1116] border border-[#1E2936] px-3 py-2 text-xs text-[#F4F7F6] focus:border-[#00D69A] focus:outline-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="w-full rounded-lg bg-[#0D1116] border border-[#1E2936] px-3 py-2 text-xs text-[#F4F7F6] focus:border-[#00D69A] focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Releases</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-2">
            <button
              onClick={() => setOnlyFeatured(!onlyFeatured)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                onlyFeatured
                  ? 'bg-[#00D69A] text-[#07090B] font-semibold border-[#00D69A]'
                  : 'bg-[#0D1116] text-[#8F9CA8] border-[#1E2936] hover:text-[#F4F7F6]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Featured</span>
            </button>

            <div className="flex rounded-lg overflow-hidden bg-[#0D1116] border border-[#1E2936]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-[#00D69A] text-[#07090B]' : 'text-[#8F9CA8] hover:text-[#F4F7F6]'
                }`}
                title="Grid view"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-[#00D69A] text-[#07090B]' : 'text-[#8F9CA8] hover:text-[#F4F7F6]'
                }`}
                title="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {(selectedCategory !== 'All Categories' || searchQuery || onlyFeatured) && (
          <div className="pt-2.5 border-t border-[#1E2936] flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#8F9CA8] text-[11px]">Active Filters:</span>
            {selectedCategory !== 'All Categories' && (
              <span className="font-mono text-[#00D69A]">{selectedCategory}</span>
            )}
            {searchQuery && (
              <span className="font-mono text-[#00D69A]">&quot;{searchQuery}&quot;</span>
            )}
            {onlyFeatured && <span className="font-mono text-[#E5B84B]">Featured Only</span>}
            <button
              onClick={resetFilters}
              className="text-[#8F9CA8] hover:text-[#E5B84B] ml-auto flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>

      {isLoadingProducts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="h-[430px] rounded-xl border border-[#1E2936] cp-skeleton" />
          ))}
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="p-16 rounded-xl bg-[#11161D] border border-[#1E2936] text-center">
          <Package className="w-10 h-10 text-[#8F9CA8] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#F4F7F6] mb-1">No Matching Products Found</h3>
          <p className="text-xs text-[#8F9CA8] max-w-sm mx-auto mb-5">
            Adjust search terms or reset active category filters to view the complete catalog.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] text-xs font-semibold transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[#1E2936] divide-y divide-[#1E2936] bg-[#11161D] overflow-hidden">
          {sortedProducts.map((product) => {
            const saved = isInWishlist(product.id);
            return (
              <div
                key={product.id}
                onClick={() => openProductDetails(product)}
                className="p-4 hover:bg-[#0D1116] transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <ProductLiveVisual product={product} compact className="w-16 h-16 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1 text-[11px] font-mono text-[#8F9CA8]">
                      <span className="text-[#00D69A] font-semibold">
                        {product.productCode || product.id}
                      </span>
                      <span>·</span>
                      <span>{product.category}</span>
                      <span>·</span>
                      <span className="text-[#0EA5A4]">{product.version || 'LTS'}</span>
                    </div>
                    <h3 className="font-bold text-[#F4F7F6] text-sm hover:text-[#00D69A] transition-colors truncate">
                      {product.name}
                    </h3>
                    <p className="text-[#8F9CA8] text-xs line-clamp-1 mt-0.5">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <div className="text-right mr-1">
                    <span className="text-[10px] font-mono text-[#8F9CA8] block">LICENSE</span>
                    <span className="text-base font-bold text-[#F4F7F6] font-mono tabular-nums">
                      {product.price.toLocaleString()} <span className="text-xs text-[#00D69A]">USDT</span>
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product);
                    }}
                    className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                      saved
                        ? 'bg-[#00D69A]/15 border-[#00D69A] text-[#00D69A]'
                        : 'bg-[#0D1116] border-[#1E2936] text-[#8F9CA8] hover:text-[#F4F7F6]'
                    }`}
                    title="Wishlist"
                  >
                    <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-[#00D69A]' : ''}`} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product, 1);
                    }}
                    className="p-2 rounded-lg bg-[#0D1116] hover:bg-[#151C24] border border-[#1E2936] text-[#F4F7F6] cursor-pointer"
                    title="Add to Cart"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openProductDetails(product);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] font-semibold text-xs flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <span>View Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

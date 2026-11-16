import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { ProductCard } from '../components/ProductCard';
import {
  Search,
  Grid,
  List,
  Zap,
  RotateCcw,
  Package
} from 'lucide-react';

export const Marketplace: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    setSelectedProduct,
    addToCart,
    setActiveTab
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Directory Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#1d271d]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white">
              ONION MARKET INDEX
            </h1>
            <span className="text-xs font-mono text-emerald-400 tabular-nums">
              {sortedProducts.length} Packages Available
            </span>
          </div>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Verified security suites, exploit frameworks, and cyber infrastructure listings.
          </p>
        </div>

        {/* Quick highlight for TRANSACTION KIT */}
        <button
          onClick={() => {
            setSearchQuery('TRANSACTION KIT');
            setSelectedCategory('All Categories');
          }}
          className="px-3.5 py-2 bg-[#0a0e0a] border border-amber-500/40 hover:border-amber-400 text-amber-300 text-xs font-mono flex items-center gap-2 transition-colors cursor-pointer group whitespace-nowrap shrink-0"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Filter: TRANSACTION KIT (38,547 USDT)</span>
        </button>
      </div>

      {/* Filter & Query Bar */}
      <div className="bg-[#070907] border border-[#1d271d] p-4 mb-8 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by package name, code, sector or spec..."
              className="w-full bg-[#040504] border border-[#222e22] pl-9 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-600 font-mono focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#040504] border border-[#222e22] px-3 py-2 text-xs text-zinc-200 font-mono focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="w-full bg-[#040504] border border-[#222e22] px-3 py-2 text-xs text-zinc-200 font-mono focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Drops</option>
            </select>
          </div>

          {/* View toggle and featured toggle */}
          <div className="md:col-span-2 flex items-center justify-end gap-2">
            <button
              onClick={() => setOnlyFeatured(!onlyFeatured)}
              className={`px-3 py-2 font-mono text-xs border transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                onlyFeatured
                  ? 'bg-emerald-500 text-black font-bold border-emerald-400'
                  : 'bg-[#040504] text-zinc-400 border-[#222e22] hover:text-zinc-100'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Featured</span>
            </button>

            <div className="flex bg-[#040504] border border-[#222e22]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'
                }`}
                title="Grid view"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'
                }`}
                title="Directory list view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Active filters bar */}
        {(selectedCategory !== 'All Categories' || searchQuery || onlyFeatured) && (
          <div className="pt-2.5 border-t border-[#182018] flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="text-zinc-500 text-[11px]">Active Query:</span>
            {selectedCategory !== 'All Categories' && (
              <span className="text-emerald-400">{selectedCategory}</span>
            )}
            {searchQuery && (
              <span className="text-emerald-400">"{searchQuery}"</span>
            )}
            {onlyFeatured && (
              <span className="text-amber-400">Featured Only</span>
            )}
            <button
              onClick={resetFilters}
              className="text-zinc-400 hover:text-red-400 ml-auto flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Product Catalog Display */}
      {products.length === 0 ? (
        <div className="p-16 bg-[#070907] border border-[#1d271d] text-center font-mono">
          <Package className="w-12 h-12 text-emerald-500/40 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-zinc-200 mb-1">Directory Is Empty</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto mb-5">
            No packages currently mounted in this directory.
          </p>
          <button
            onClick={() => { setSelectedCategory('All Categories'); setSearchQuery(''); }}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-bold transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <span>Explore All Sectors</span>
          </button>
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="p-16 bg-[#070907] border border-[#1d271d] text-center font-mono">
          <Package className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-zinc-200 mb-1">No Matching Packages Found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
            Adjust search parameters or clear active directory filters.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-colors cursor-pointer"
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
        /* Darkweb Index List View */
        <div className="border border-[#1d271d] divide-y divide-[#182018] bg-[#070907] font-mono text-xs">
          {sortedProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className="p-4 hover:bg-[#0c100c] transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 object-cover bg-[#040504] border border-[#1f291f] flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1 text-[11px] text-zinc-500">
                    <span className="text-emerald-400 font-semibold">
                      {product.productCode || 'PKG-PRO'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{product.category}</span>
                    {product.featured && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-400 font-bold">FEATURED</span>
                      </>
                    )}
                  </div>
                  <h3 className="font-bold text-zinc-100 text-sm hover:text-emerald-400 transition-colors truncate">
                    {product.name}
                  </h3>
                  <p className="text-zinc-400 text-xs line-clamp-1 font-sans mt-0.5">
                    {product.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0 self-end md:self-center">
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 block">ESCROW</span>
                  <span className="text-base font-bold text-emerald-400 font-mono tabular-nums">
                    {product.price.toLocaleString()} USDT
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product, 1);
                    }}
                    className="px-3 py-1.5 bg-[#0c100c] hover:bg-[#141c14] text-zinc-300 border border-[#222c22] text-xs cursor-pointer whitespace-nowrap"
                  >
                    Add Cart
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product, 1);
                      setActiveTab('checkout');
                    }}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs cursor-pointer whitespace-nowrap"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

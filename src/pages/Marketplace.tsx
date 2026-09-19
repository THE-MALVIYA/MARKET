import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { ProductCard } from '../components/ProductCard';
import {
  Search,
  SlidersHorizontal,
  Grid,
  List,
  Terminal,
  Zap,
  RotateCcw,
  Package,
  Layers,
  Sparkles
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

  // Filter products
  const filteredProducts = products.filter((p) => {
    // Category filter
    if (selectedCategory !== 'All Categories' && p.category !== selectedCategory) {
      return false;
    }
    // Search query filter
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
    // Only featured filter
    if (onlyFeatured && !p.featured) {
      return false;
    }
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    // Default featured first
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
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-cyan-500/20">
        <div>
          <h1 className="text-2xl sm:text-3xl font-mono font-extrabold text-white flex items-center gap-2.5">
            <span>TOOLPLACES CATALOG</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 font-semibold font-mono">
              {sortedProducts.length} PACKAGES AVAILABLE
            </span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Curated security testing suites, developer utilities, and enterprise infrastructure tools.
          </p>
        </div>

        {/* Quick highlight banner for F-SHOOT v9.7.0 */}
        <button
          onClick={() => {
            setSearchQuery('F-SHOOT');
            setSelectedCategory('All Categories');
          }}
          className="px-3.5 py-2 rounded-xl bg-cyan-950/40 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-xs font-mono flex items-center gap-2 transition-all cursor-pointer group"
        >
          <Zap className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
          <span>Quick Filter: F-SHOOT v9.7.0 (27,453 USDT)</span>
        </button>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="bg-[#090d16] border border-slate-800 p-4 rounded-2xl mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by toolkit name, ID, category or description..."
              className="w-full bg-black/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 font-mono focus:border-cyan-400 focus:outline-none"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-black/60 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-400 focus:outline-none cursor-pointer"
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
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full bg-black/60 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-400 focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Releases</option>
            </select>
          </div>

          {/* View toggle and featured toggle */}
          <div className="md:col-span-2 flex items-center justify-end gap-2">
            <button
              onClick={() => setOnlyFeatured(!onlyFeatured)}
              className={`px-3 py-2 rounded-xl font-mono text-xs border transition-all cursor-pointer flex items-center gap-1.5 ${
                onlyFeatured
                  ? 'bg-cyan-500 text-black font-bold border-cyan-400'
                  : 'bg-black/60 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Featured</span>
            </button>

            <div className="flex bg-black/60 border border-slate-700 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid view"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
                title="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Active filters pill bar */}
        {(selectedCategory !== 'All Categories' || searchQuery || onlyFeatured) && (
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="text-slate-500 text-[11px]">ACTIVE FILTERS:</span>
            {selectedCategory !== 'All Categories' && (
              <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60 text-cyan-300">
                {selectedCategory}
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60 text-cyan-300">
                Query: "{searchQuery}"
              </span>
            )}
            {onlyFeatured && (
              <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60 text-cyan-300">
                Featured Only
              </span>
            )}
            <button
              onClick={resetFilters}
              className="text-slate-400 hover:text-red-400 ml-auto flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          </div>
        )}
      </div>

      {/* Product Catalog Display */}
      {products.length === 0 ? (
        <div className="p-16 rounded-2xl bg-[#090d16] border border-slate-800 text-center font-mono">
          <Package className="w-12 h-12 text-cyan-500/40 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-200 mb-1">Catalog Is Empty</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">
            All previous tool items have been removed from the platform. The catalog is clean and ready for new software packages and developer toolkits.
          </p>
          <button
            onClick={() => { setSelectedCategory('All Categories'); setSearchQuery(''); }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-black text-xs font-mono font-bold transition-all shadow-lg shadow-cyan-500/20 cursor-pointer inline-flex items-center gap-2"
          >
            <span>Explore All Categories</span>
          </button>
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="p-16 rounded-2xl bg-[#090d16] border border-slate-800 text-center font-mono">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-200 mb-1">No Matching Toolkits Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Try adjusting your search query or reset the category filter to explore all available software packages.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-colors cursor-pointer"
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
        /* List view representation */
        <div className="space-y-3 font-mono text-xs">
          {sortedProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className="p-4 rounded-xl bg-[#090d16] border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-lg object-cover bg-black flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black text-cyan-400 border border-slate-800">
                      {product.productCode || 'TP-PRO'}
                    </span>
                    <span className="text-[10px] text-slate-400">{product.category}</span>
                    {product.featured && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500 text-black font-bold">
                        FEATURED
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-100 text-sm hover:text-cyan-300 transition-colors truncate">
                    {product.name}
                  </h3>
                  <p className="text-slate-400 text-xs line-clamp-1 font-sans mt-0.5">
                    {product.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0 self-end md:self-center">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">PRICE</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    {product.price} USDT
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product, 1);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs cursor-pointer"
                  >
                    Add Cart
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product, 1);
                      setActiveTab('checkout');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs cursor-pointer"
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

import React, { useState, useRef, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { DeepSeekLogo } from './DeepSeekLogo';
import { PWAInstallButton } from './PWAInstallButton';
import { ProductLiveVisual } from './ProductLiveVisual';
import {
  Search,
  ShoppingCart,
  ChevronDown,
  LayoutDashboard,
  Compass,
  Layers,
  BookOpen,
  FileCode2,
  LifeBuoy,
  Menu,
  X,
  Heart,
  Package,
  Shield,
  ArrowUpRight,
  LogIn,
  LogOut,
  Info,
  Home as HomeIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    cartItemCount,
    setIsCartOpen,
    searchQuery,
    setSearchQuery,
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    openProductDetails,
    currentUser,
    userRole,
    setAuthModalOpen,
    logout,
    wishlist
  } = useMarket();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showResearchMenu, setShowResearchMenu] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const catMenuRef = useRef<HTMLDivElement | null>(null);
  const resMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
      if (catMenuRef.current && !catMenuRef.current.contains(target)) {
        setShowCategoryMenu(false);
      }
      if (resMenuRef.current && !resMenuRef.current.contains(target)) {
        setShowResearchMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchSuggestions = searchQuery.trim()
    ? products
        .filter((p) => {
          const q = searchQuery.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            (p.productCode && p.productCode.toLowerCase().includes(q)) ||
            p.description.toLowerCase().includes(q)
          );
        })
        .slice(0, 5)
    : [];

  const handleNavClick = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setShowCategoryMenu(false);
    setShowResearchMenu(false);
    setShowUserMenu(false);
  };

  const initials = currentUser
    ? currentUser.username
        .split(/[\s_]+/)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AC';

  return (
    <header className="sticky top-0 z-30 bg-[#070B10]/96 border-b border-[#2A394C] shadow-[0_14px_34px_-12px_rgba(0,0,0,0.92),inset_0_-1px_0_rgba(255,255,255,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Mobile menu toggle + DEEPSEEK Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden dsk-btn-secondary-3d p-2 rounded-lg text-[#CBD5E1] hover:text-white cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            <button
              onClick={() => handleNavClick('home')}
              className="cursor-pointer whitespace-nowrap shrink-0"
            >
              <DeepSeekLogo />
            </button>
          </div>

          {/* Center: Single-Line Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            <button
              onClick={() => handleNavClick('home')}
              className={`relative px-2.5 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 rounded-md ${
                activeTab === 'home' ? 'text-[#00D69A]' : 'text-[#CBD5E1] hover:text-white'
              }`}
            >
              Home
              {activeTab === 'home' && (
                <motion.span
                  layoutId="dsk-nav-indicator"
                  className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-[#00D69A] shadow-[0_0_8px_rgba(0,214,154,0.8)]"
                />
              )}
            </button>

            <button
              onClick={() => handleNavClick('products')}
              className={`relative px-2.5 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 rounded-md ${
                activeTab === 'products' || activeTab === 'product'
                  ? 'text-[#00D69A]'
                  : 'text-[#CBD5E1] hover:text-white'
              }`}
            >
              Products
              {(activeTab === 'products' || activeTab === 'product') && (
                <motion.span
                  layoutId="dsk-nav-indicator"
                  className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-[#00D69A] shadow-[0_0_8px_rgba(0,214,154,0.8)]"
                />
              )}
            </button>

            {/* Categories Dropdown */}
            <div className="relative" ref={catMenuRef}>
              <button
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                className={`relative px-2.5 py-2 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 rounded-md ${
                  activeTab === 'categories' || selectedCategory !== 'All Categories'
                    ? 'text-[#00D69A]'
                    : 'text-[#CBD5E1] hover:text-white'
                }`}
              >
                <span>Categories</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-150 ${
                    showCategoryMenu ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {showCategoryMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.14 }}
                    className="dsk-surface absolute left-0 mt-2 w-72 rounded-xl p-2 z-50"
                  >
                    <button
                      onClick={() => handleNavClick('categories')}
                      className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold text-[#00D69A] hover:bg-[#0D1116] flex items-center justify-between border-b border-[#1E2936] mb-1.5 cursor-pointer"
                    >
                      <span>All Infrastructure Domains</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <div className="max-h-72 overflow-y-auto space-y-0.5">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setShowCategoryMenu(false);
                            setActiveTab('products');
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between ${
                            selectedCategory === cat
                              ? 'bg-[#00D69A]/12 text-[#00D69A] font-semibold'
                              : 'text-[#D1D9E0] hover:bg-[#0D1116] hover:text-[#00D69A]'
                          }`}
                        >
                          <span className="truncate pr-2">{cat}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Research & Documentation Dropdown */}
            <div className="relative" ref={resMenuRef}>
              <button
                onClick={() => setShowResearchMenu(!showResearchMenu)}
                className={`relative px-2.5 py-2 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 rounded-md ${
                  activeTab === 'research' || activeTab === 'docs'
                    ? 'text-[#00D69A]'
                    : 'text-[#CBD5E1] hover:text-white'
                }`}
              >
                <span>Research &amp; Docs</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-150 ${
                    showResearchMenu ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {showResearchMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.14 }}
                    className="dsk-surface absolute left-0 mt-2 w-60 rounded-xl p-2 z-50 space-y-1"
                  >
                    <button
                      onClick={() => handleNavClick('research')}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#0B1017] text-xs flex items-start gap-2.5 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-[#00D69A] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-white">Research Library</div>
                        <div className="text-[11px] text-[#CBD5E1]">Security briefings &amp; whitepapers</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleNavClick('docs')}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#0B1017] text-xs flex items-start gap-2.5 cursor-pointer"
                    >
                      <FileCode2 className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-white">Documentation</div>
                        <div className="text-[11px] text-[#CBD5E1]">CLI verification &amp; API reference</div>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => handleNavClick('about')}
              className={`relative px-2.5 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 rounded-md ${
                activeTab === 'about' ? 'text-[#00D69A]' : 'text-[#CBD5E1] hover:text-white'
              }`}
            >
              About
              {activeTab === 'about' && (
                <motion.span
                  layoutId="dsk-nav-indicator"
                  className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-[#00D69A] shadow-[0_0_8px_rgba(0,214,154,0.8)]"
                />
              )}
            </button>

            <button
              onClick={() => handleNavClick('support')}
              className={`relative px-2.5 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 rounded-md ${
                activeTab === 'support' ? 'text-[#00D69A]' : 'text-[#CBD5E1] hover:text-white'
              }`}
            >
              Support
              {activeTab === 'support' && (
                <motion.span
                  layoutId="dsk-nav-indicator"
                  className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-[#00D69A] shadow-[0_0_8px_rgba(0,214,154,0.8)]"
                />
              )}
            </button>
          </nav>

          {/* Right Controls: Search, Wishlist, Cart, Account, Install App */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search */}
            <div className="relative hidden md:block w-44 xl:w-52" ref={searchContainerRef}>
              <Search className="w-3.5 h-3.5 text-[#8F9CA8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setShowSearchDropdown(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setShowSearchDropdown(false);
                    setActiveTab('products');
                  }
                  if (e.key === 'Escape') {
                    setShowSearchDropdown(false);
                  }
                }}
                placeholder="Search products, IDs..."
                className="dsk-input-3d w-full rounded-lg pl-8 pr-7 py-1.5 text-xs placeholder-[#9FB0C2]/80 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchDropdown(false);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#CBD5E1] hover:text-white cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              <AnimatePresence>
                {showSearchDropdown && searchQuery.trim().length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.14 }}
                    className="dsk-surface absolute right-0 mt-2 w-80 rounded-xl p-2 z-50"
                  >
                    <div className="flex items-center justify-between px-2 py-1 text-[10px] font-mono text-[#CBD5E1] uppercase border-b border-[#253445] mb-1">
                      <span>Catalog Results</span>
                      <span className="text-[#00D69A] tabular-nums">{searchSuggestions.length} shown</span>
                    </div>
                    {searchSuggestions.length === 0 ? (
                      <div className="p-4 text-center text-xs text-[#CBD5E1]">
                        No tools matched &quot;{searchQuery}&quot;
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {searchSuggestions.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setShowSearchDropdown(false);
                              openProductDetails(item);
                            }}
                            className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#0B1017] text-left transition-colors cursor-pointer group"
                          >
                            <ProductLiveVisual product={item} compact className="w-9 h-9 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-white group-hover:text-[#00D69A] truncate">
                                {item.name}
                              </div>
                              <div className="text-[10px] font-mono text-[#CBD5E1] truncate">
                                {item.productCode || item.id} · {item.price.toLocaleString()} USDT
                              </div>
                            </div>
                            <ArrowUpRight className="w-3.5 h-3.5 text-[#CBD5E1] group-hover:text-[#00D69A] shrink-0" />
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            setShowSearchDropdown(false);
                            setActiveTab('products');
                          }}
                          className="w-full py-1.5 text-center text-[11px] font-medium text-[#00D69A] hover:bg-[#00D69A]/10 rounded-lg transition-colors cursor-pointer mt-1"
                        >
                          View all matching tools
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist quick link */}
            <button
              onClick={() => handleNavClick('dashboard')}
              className="dsk-btn-secondary-3d relative p-2 rounded-lg text-[#CBD5E1] hover:text-white cursor-pointer shrink-0"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded bg-[#00D69A] text-[#050709] text-[10px] font-mono font-bold flex items-center justify-center tabular-nums">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="dsk-btn-secondary-3d relative px-2.5 py-2 rounded-lg text-white hover:text-[#00D69A] cursor-pointer flex items-center gap-1.5 text-xs font-medium whitespace-nowrap shrink-0"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="font-mono font-bold text-[#00D69A] tabular-nums">{cartItemCount}</span>
            </button>

            {/* Install App */}
            <div className="hidden sm:block">
              <PWAInstallButton />
            </div>

            {/* User Account */}
            {!currentUser ? (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="dsk-btn-3d px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Account</span>
              </button>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="dsk-btn-secondary-3d flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
                >
                  <div className="w-7 h-7 rounded-md bg-[#00D69A]/15 border border-[#00D69A]/50 flex items-center justify-center text-[11px] font-mono font-bold text-[#00D69A]">
                    {initials}
                  </div>
                  <div className="hidden xl:block text-left">
                    <div className="text-xs font-semibold text-white leading-tight max-w-[92px] truncate">
                      {currentUser.username}
                    </div>
                    <div className="text-[10px] font-mono text-[#CBD5E1] leading-tight uppercase">
                      {userRole === 'admin' ? 'Admin' : 'Account'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#CBD5E1]" />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.14 }}
                      className="dsk-surface absolute right-0 mt-2 w-60 rounded-xl p-2.5 z-50"
                    >
                      <div className="px-2 pb-2.5 mb-2 border-b border-[#1E2936]">
                        <div className="text-xs font-semibold text-[#F4F7F6] truncate">
                          {currentUser.username}
                        </div>
                        <div className="text-[10px] font-mono text-[#8F9CA8] truncate mt-0.5">
                          {currentUser.email}
                        </div>
                      </div>

                      <div className="space-y-0.5 text-xs">
                        <button
                          onClick={() => handleNavClick('dashboard')}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[#F4F7F6] hover:bg-[#0D1116] hover:text-[#00D69A] transition-colors cursor-pointer"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-[#00D69A]" />
                          <span>User Dashboard</span>
                        </button>

                        <button
                          onClick={() => handleNavClick('orders')}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[#F4F7F6] hover:bg-[#0D1116] hover:text-[#00D69A] transition-colors cursor-pointer"
                        >
                          <Package className="w-3.5 h-3.5 text-[#0EA5A4]" />
                          <span>Orders &amp; Licenses</span>
                        </button>

                        {userRole === 'admin' && (
                          <button
                            onClick={() => handleNavClick('admin')}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[#F4F7F6] hover:bg-[#0D1116] hover:text-[#E5B84B] transition-colors cursor-pointer"
                          >
                            <Shield className="w-3.5 h-3.5 text-[#E5B84B]" />
                            <span>Admin Console</span>
                          </button>
                        )}

                        <div className="pt-2 mt-2 border-t border-[#1E2936]">
                          <button
                            onClick={() => {
                              logout();
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[#8F9CA8] hover:text-red-300 hover:bg-[#0D1116] transition-colors cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.16 }}
            className="lg:hidden border-t border-[#1E2936] bg-[#0D1116] overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#8F9CA8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNavClick('products');
                  }}
                  placeholder="Search products, IDs, categories..."
                  className="w-full rounded-lg bg-[#07090B] border border-[#1E2936] pl-9 pr-3 py-2.5 text-xs text-[#F4F7F6] placeholder-[#8F9CA8] focus:outline-none focus:border-[#00D69A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'home' as const, label: 'Home', icon: HomeIcon },
                  { id: 'products' as const, label: 'Products', icon: Compass },
                  { id: 'categories' as const, label: 'Categories', icon: Layers },
                  { id: 'research' as const, label: 'Research Library', icon: BookOpen },
                  { id: 'docs' as const, label: 'Documentation', icon: FileCode2 },
                  { id: 'about' as const, label: 'About', icon: Info },
                  { id: 'support' as const, label: 'Support', icon: LifeBuoy },
                  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border font-medium cursor-pointer ${
                        activeTab === item.id
                          ? 'bg-[#00D69A]/15 border-[#00D69A]/50 text-[#00D69A]'
                          : 'bg-[#11161D] border-[#1E2936] text-[#F4F7F6]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-[#1E2936] flex items-center justify-between">
                <span className="text-xs text-[#8F9CA8]">Standalone App</span>
                <PWAInstallButton />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

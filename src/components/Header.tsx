import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import {
  Shield,
  Search,
  ShoppingCart,
  User,
  SlidersHorizontal,
  ChevronDown,
  Terminal,
  Activity,
  Layers,
  HelpCircle,
  Package,
  Key
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    cartItemCount,
    setIsCartOpen,
    searchQuery,
    setSearchQuery,
    categories,
    selectedCategory,
    setSelectedCategory,
    currentUser,
    userRole,
    switchUserRole
  } = useMarket();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#07090f]/90 backdrop-blur-xl border-b border-cyan-500/20 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2.5 group cursor-pointer text-left"
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 flex items-center justify-center group-hover:border-cyan-400 transition-colors shadow-lg shadow-cyan-500/10">
                  <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#07090f] animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-extrabold text-base tracking-wider bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400 bg-clip-text text-transparent">
                    TOOLPLACES
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 tracking-widest block uppercase">
                  DEVELOPER & SECURITY TOOLS
                </span>
              </div>
            </button>

            {/* Platform Status Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SYSTEM ONLINE
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 font-mono text-xs">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'marketplace'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              Marketplace
            </button>

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                  selectedCategory !== 'All Categories'
                    ? 'text-cyan-300 bg-cyan-950/40 border border-cyan-800/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span>Categories</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showCategoryMenu && (
                <div
                  className="absolute left-0 mt-2 w-56 rounded-xl bg-[#090d16] border border-cyan-500/30 p-2 shadow-2xl z-50 backdrop-blur-xl"
                  onMouseLeave={() => setShowCategoryMenu(false)}
                >
                  <div className="text-[10px] font-mono text-slate-500 px-2 py-1 uppercase tracking-wider">
                    Filter by Sector
                  </div>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setShowCategoryMenu(false);
                        setActiveTab('marketplace');
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors font-mono cursor-pointer flex items-center justify-between ${
                        selectedCategory === cat
                          ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <span>{cat}</span>
                      {selectedCategory === cat && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Orders</span>
            </button>

            <button
              onClick={() => setActiveTab('support')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'support'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              Support
            </button>
          </nav>

          {/* Search bar, Cart, and User Account */}
          <div className="flex items-center gap-3 flex-1 md:flex-initial justify-end">
            {/* Quick Search */}
            <div className="relative hidden sm:block max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'marketplace') setActiveTab('marketplace');
                }}
                placeholder="Search research toolkits..."
                className="w-full bg-[#0d121c] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 hover:text-slate-300 font-mono"
                >
                  CLEAR
                </button>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-lg bg-[#0d121c] border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
              title="View Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-cyan-500 text-black font-mono font-bold text-[10px] shadow-md shadow-cyan-500/40 animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* User Account */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer bg-[#0d121c] border-slate-800 hover:border-cyan-500/40 text-slate-300"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center text-[10px] font-mono font-bold text-black">
                  {currentUser?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-[11px] font-mono font-semibold leading-none text-slate-200">
                    {currentUser?.username || 'Developer'}
                  </div>
                  <div className="text-[9px] font-mono text-cyan-400 capitalize leading-none mt-0.5">
                    Verified Member
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* User Details Dropdown */}
              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-60 rounded-xl bg-[#0b0f19] border border-cyan-500/30 p-3 shadow-2xl z-50 backdrop-blur-xl"
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <div className="pb-2 mb-2 border-b border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-200">
                        {currentUser?.username}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        MEMBER
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5 break-all">
                      {currentUser?.email}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono mt-2">
                      <Key className="w-3 h-3" />
                      <span>Security Clearance: Verified</span>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-slate-400 p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                    <span className="text-slate-300 font-semibold block mb-0.5">TRC-20 Account Active</span>
                    Instant delivery upon proof verification
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Submenu Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
          <button
            onClick={() => setActiveTab('home')}
            className={`cursor-pointer ${activeTab === 'home' ? 'text-cyan-400 font-bold' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`cursor-pointer ${activeTab === 'marketplace' ? 'text-cyan-400 font-bold' : ''}`}
          >
            Marketplace
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`cursor-pointer ${activeTab === 'orders' ? 'text-cyan-400 font-bold' : ''}`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`cursor-pointer ${activeTab === 'support' ? 'text-cyan-400 font-bold' : ''}`}
          >
            Support
          </button>
        </div>
      </div>
    </header>
  );
};

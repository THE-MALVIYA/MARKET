import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import {
  Shield,
  Search,
  ShoppingCart,
  ChevronDown,
  Key
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

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
    currentUser
  } = useMarket();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#050705]/95 backdrop-blur-md border-b border-[#1d271d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-6">
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 group cursor-pointer text-left whitespace-nowrap shrink-0"
          >
            <div className="w-8 h-8 bg-[#0b100b] border border-emerald-500/40 flex items-center justify-center group-hover:border-emerald-400 transition-colors">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-mono font-bold text-base tracking-[0.14em] text-zinc-100 group-hover:text-emerald-400 transition-colors">
              CYBERPLACES
            </span>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 font-mono text-xs">
            <button
              onClick={() => setActiveTab('home')}
              className={`py-1 transition-colors cursor-pointer whitespace-nowrap shrink-0 border-b ${
                activeTab === 'home'
                  ? 'text-emerald-400 border-emerald-400 font-semibold'
                  : 'text-zinc-400 border-transparent hover:text-zinc-100'
              }`}
            >
              Index
            </button>
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`py-1 transition-colors cursor-pointer whitespace-nowrap shrink-0 border-b ${
                activeTab === 'marketplace'
                  ? 'text-emerald-400 border-emerald-400 font-semibold'
                  : 'text-zinc-400 border-transparent hover:text-zinc-100'
              }`}
            >
              Market
            </button>

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                className={`py-1 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 border-b ${
                  selectedCategory !== 'All Categories'
                    ? 'text-emerald-400 border-emerald-400 font-semibold'
                    : 'text-zinc-400 border-transparent hover:text-zinc-100'
                }`}
              >
                <span>Sectors</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showCategoryMenu && (
                <div
                  className="absolute left-0 mt-2 w-64 bg-[#080a08] border border-[#243024] p-1.5 shadow-2xl z-50"
                  onMouseLeave={() => setShowCategoryMenu(false)}
                >
                  <div className="text-[10px] font-mono text-zinc-500 px-2.5 py-1.5 uppercase tracking-wider border-b border-[#182018] mb-1">
                    Market Directories
                  </div>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setShowCategoryMenu(false);
                        setActiveTab('marketplace');
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs transition-colors font-mono cursor-pointer flex items-center justify-between ${
                        selectedCategory === cat
                          ? 'bg-emerald-500/15 text-emerald-300 font-semibold'
                          : 'text-zinc-300 hover:bg-[#111611] hover:text-emerald-300'
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                      {selectedCategory === cat && (
                        <span className="text-[10px] text-emerald-400 ml-2">[x]</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveTab('orders')}
              className={`py-1 transition-colors cursor-pointer whitespace-nowrap shrink-0 border-b ${
                activeTab === 'orders'
                  ? 'text-emerald-400 border-emerald-400 font-semibold'
                  : 'text-zinc-400 border-transparent hover:text-zinc-100'
              }`}
            >
              Escrow Orders
            </button>

            <button
              onClick={() => setActiveTab('support')}
              className={`py-1 transition-colors cursor-pointer whitespace-nowrap shrink-0 border-b ${
                activeTab === 'support'
                  ? 'text-emerald-400 border-emerald-400 font-semibold'
                  : 'text-zinc-400 border-transparent hover:text-zinc-100'
              }`}
            >
              PGP Support
            </button>
          </nav>

          {/* Zone 3: Search, Install App, Cart & Operator Identity */}
          <div className="flex items-center gap-2 flex-1 md:flex-initial justify-end shrink-0">
            <div className="relative hidden xl:block w-48">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'marketplace') setActiveTab('marketplace');
                }}
                placeholder="Query catalog..."
                className="w-full bg-[#090c09] border border-[#1f291f] pl-8 pr-10 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/60 transition-colors font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 hover:text-emerald-400 font-mono cursor-pointer"
                >
                  ESC
                </button>
              )}
            </div>

            {/* Install App Button (Hides automatically in standalone mode) */}
            <PWAInstallButton />

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative px-3 py-1.5 bg-[#0a0e0a] border border-[#243024] hover:border-emerald-500/60 text-zinc-200 hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-2 font-mono text-xs whitespace-nowrap shrink-0"
              title="Open Cart"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cart</span>
              <span className="text-emerald-400 font-bold tabular-nums">[{cartItemCount}]</span>
            </button>

            {/* User Account */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2.5 py-1.5 border transition-colors cursor-pointer bg-[#0a0e0a] border-[#243024] hover:border-emerald-500/50 text-zinc-300 whitespace-nowrap shrink-0"
              >
                <span className="font-mono text-xs text-emerald-400 font-bold">
                  {currentUser?.username || 'cipher_agent'}
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </button>

              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-[#080a08] border border-[#263326] p-3 shadow-2xl z-50"
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <div className="pb-2.5 mb-2.5 border-b border-[#1b241b]">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="font-bold text-zinc-100">
                        {currentUser?.username}
                      </span>
                      <span className="text-[10px] text-emerald-400">
                        VERIFIED NODE
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-zinc-500 mt-0.5 break-all">
                      {currentUser?.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono mt-2">
                      <Key className="w-3 h-3" />
                      <span>Clearance: PGP Authenticated</span>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-zinc-400 p-2 bg-[#040504] border border-[#1a221a]">
                    <span className="text-amber-400 font-semibold block mb-0.5">TRC-20 Escrow Enabled</span>
                    Direct cryptographic settlement active
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Submenu Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-[#182018] text-[11px] font-mono text-zinc-400">
          <button
            onClick={() => setActiveTab('home')}
            className={`cursor-pointer whitespace-nowrap ${activeTab === 'home' ? 'text-emerald-400 font-bold' : ''}`}
          >
            Index
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`cursor-pointer whitespace-nowrap ${activeTab === 'marketplace' ? 'text-emerald-400 font-bold' : ''}`}
          >
            Market
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`cursor-pointer whitespace-nowrap ${activeTab === 'orders' ? 'text-emerald-400 font-bold' : ''}`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`cursor-pointer whitespace-nowrap ${activeTab === 'support' ? 'text-emerald-400 font-bold' : ''}`}
          >
            Support
          </button>
        </div>
      </div>
    </header>
  );
};

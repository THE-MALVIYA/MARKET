/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MarketProvider, useMarket } from './context/MarketContext';
import { CyberParticles } from './components/CyberParticles';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { Header } from './components/Header';
import { TerminalFooter } from './components/TerminalFooter';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { ToastContainer } from './components/Toast';

// Pages and views
import { Home } from './pages/Home';
import { Marketplace } from './pages/Marketplace';
import { CheckoutView } from './components/CheckoutView';
import { OrdersView } from './components/OrdersView';
import { SupportView } from './components/SupportView';

const MainContent: React.FC = () => {
  const { activeTab } = useMarket();

  return (
    <main className="flex-1 relative z-10">
      {activeTab === 'home' && <Home />}
      {activeTab === 'marketplace' && <Marketplace />}
      {activeTab === 'checkout' && <CheckoutView />}
      {activeTab === 'orders' && <OrdersView />}
      {activeTab === 'support' && <SupportView />}
    </main>
  );
};

export default function App() {
  return (
    <MarketProvider>
      <div className="min-h-screen bg-[#03060a] text-slate-100 flex flex-col relative selection:bg-cyan-500 selection:text-black font-sans antialiased">
        {/* Subtle Cyberpunk Matrix/Grid and Particle Atmosphere */}
        <CyberParticles />

        {/* Global Platform Announcement Banner */}
        <AnnouncementBanner />

        {/* Market Header */}
        <Header />

        {/* Dynamic Main App Section */}
        <MainContent />

        {/* Terminal Status & Compliance Footer */}
        <TerminalFooter />

        {/* Interactive Overlays */}
        <ProductDetailModal />
        <CartDrawer />
        <ToastContainer />
      </div>
    </MarketProvider>
  );
}


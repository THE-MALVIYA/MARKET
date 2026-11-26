/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MarketProvider, useMarket } from './context/MarketContext';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { Header } from './components/Header';
import { TerminalFooter } from './components/TerminalFooter';
import { CinematicIntro3D } from './components/CinematicIntro3D';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ProductDetailView } from './components/ProductDetailView';
import { CartDrawer } from './components/CartDrawer';
import { ToastContainer } from './components/Toast';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AuthModal } from './components/AuthModal';
import { WelcomeBriefingModal } from './components/WelcomeBriefingModal';
import { SpatialBackdrop3D } from './components/SpatialBackdrop3D';
import { AnimatePresence, motion } from 'motion/react';

// Pages and views
import { Home } from './pages/Home';
import { Marketplace } from './pages/Marketplace';
import { DashboardView } from './components/DashboardView';
import { ResearchLibraryView } from './components/ResearchLibraryView';
import { DocumentationView } from './components/DocumentationView';
import { CheckoutView } from './components/CheckoutView';
import { OrdersView } from './components/OrdersView';
import { SupportView } from './components/SupportView';
import { AdminDashboard } from './components/AdminDashboard';
import {
  AboutView,
  CategoriesDirectoryView,
  LegalView
} from './components/AboutAndLegalViews';

const MainContent: React.FC = () => {
  const { activeTab } = useMarket();

  return (
    <main className="flex-1 relative z-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.16 }}
        >
          {activeTab === 'home' && <Home />}
          {activeTab === 'products' && <Marketplace />}
          {activeTab === 'categories' && <CategoriesDirectoryView />}
          {activeTab === 'product' && <ProductDetailView />}
          {activeTab === 'research' && <ResearchLibraryView />}
          {activeTab === 'docs' && <DocumentationView />}
          {activeTab === 'about' && <AboutView />}
          {activeTab === 'support' && <SupportView />}
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'orders' && <OrdersView />}
          {activeTab === 'checkout' && <CheckoutView />}
          {activeTab === 'admin' && <AdminDashboard />}
          {activeTab === 'legal' && <LegalView />}
        </motion.div>
      </AnimatePresence>
    </main>
  );
};

export default function App() {
  const [introDone, setIntroDone] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);

  return (
    <MarketProvider>
      {!introDone ? (
        <CinematicIntro3D
          onComplete={() => {
            setIntroDone(true);
            setShowBriefing(true);
          }}
        />
      ) : (
        <div className="min-h-screen bg-[#050709] text-white flex flex-col relative selection:bg-[#00D69A] selection:text-[#050709] font-sans antialiased overflow-x-hidden dsk-website-reveal">
          <SpatialBackdrop3D />
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-x-0 bottom-0 h-[38vh] opacity-30 dsk-3d-horizon z-0"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.9) 75%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.9) 75%)'
            }}
          />
          <AnnouncementBanner />
          <Header />
          <MainContent />
          <TerminalFooter onReplayIntro={() => setIntroDone(false)} />
          <ProductDetailModal />
          <CartDrawer />
          <AuthModal />
          <WelcomeBriefingModal open={showBriefing} onClose={() => setShowBriefing(false)} />
          <ToastContainer />
          <OfflineIndicator />
        </div>
      )}
    </MarketProvider>
  );
}


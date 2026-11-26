import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { HeroInfrastructure3D } from './HeroInfrastructure3D';

export const HeroSection: React.FC = () => {
  const { setActiveTab } = useMarket();

  return (
    <section className="relative bg-transparent border-b border-[#253344] overflow-hidden">
      {/* Subtle architectural radial sheen behind 3D stage (never over WebGL backdrop-filter) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 65% 75% at 72% 45%, rgba(14, 165, 164, 0.16), transparent 65%), radial-gradient(ellipse 50% 60% at 20% 20%, rgba(0, 214, 154, 0.08), transparent 60%)'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left: High-contrast Typography & Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.22em] text-[#00D69A] font-bold">
              <span>DEEPSEEK</span>
              <span className="text-[#3A4F66]">/</span>
              <span className="text-[#E2E8F0]">ENTERPRISE SOFTWARE INFRASTRUCTURE</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-white leading-[1.06] drop-shadow-[0_6px_22px_rgba(0,0,0,0.85)]">
              ENGINEERED FOR THE NEXT ERA OF DEEPHAT.
            </h1>

            <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed max-w-xl">
              Discover advanced security software, developer infrastructure, and enterprise technology solutions built for modern digital environments.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => setActiveTab('products')}
                className="dsk-btn-3d px-6 py-3.5 rounded-lg text-xs sm:text-sm tracking-wide flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <span>EXPLORE PRODUCTS</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('about')}
                className="dsk-btn-secondary-3d px-6 py-3.5 rounded-lg text-xs sm:text-sm tracking-wide cursor-pointer whitespace-nowrap"
              >
                DISCOVER DEEPSEEK
              </button>
            </div>
          </div>

          {/* Right: Dedicated WebGL2 Three.js 3D Infrastructure Stage */}
          <div className="lg:col-span-6">
            <div className="dsk-chassis-3d relative h-[360px] sm:h-[440px] lg:h-[490px] w-full rounded-2xl overflow-hidden">
              <HeroInfrastructure3D />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

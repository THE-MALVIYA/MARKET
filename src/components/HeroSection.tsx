import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { HeroInfrastructure3D } from './HeroInfrastructure3D';

export const HeroSection: React.FC = () => {
  const { setActiveTab } = useMarket();

  return (
    <section className="relative bg-[#07090B] border-b border-[#1E2936] overflow-hidden">
      {/* Subtle architectural radial sheen behind 3D stage (never over WebGL backdrop-filter) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 65% 75% at 72% 45%, rgba(14, 165, 164, 0.12), transparent 65%), radial-gradient(ellipse 50% 60% at 20% 20%, rgba(0, 214, 154, 0.06), transparent 60%)'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left: High-contrast Typography & Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.2em] text-[#00D69A] font-semibold">
              <span>DEEPSEEK</span>
              <span className="text-[#1E2936]">/</span>
              <span className="text-[#8F9CA8]">ENTERPRISE SOFTWARE INFRASTRUCTURE</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight text-[#F4F7F6] leading-[1.08]">
              ENGINEERED FOR THE NEXT ERA OF DEEPHAT.
            </h1>

            <p className="text-sm sm:text-base text-[#8F9CA8] leading-relaxed max-w-xl">
              Discover advanced security software, developer infrastructure, and enterprise technology solutions built for modern digital environments.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => setActiveTab('products')}
                className="px-6 py-3.5 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shadow-lg shadow-[#00D69A]/15"
              >
                <span>EXPLORE PRODUCTS</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('about')}
                className="px-6 py-3.5 rounded-lg bg-[#11161D] hover:bg-[#151C24] text-[#F4F7F6] border border-[#1E2936] hover:border-[#00D69A]/50 font-semibold text-xs sm:text-sm tracking-wide transition-colors cursor-pointer whitespace-nowrap"
              >
                DISCOVER DEEPSEEK
              </button>
            </div>
          </div>

          {/* Right: Dedicated WebGL2 Three.js 3D Infrastructure Stage */}
          <div className="lg:col-span-6">
            <div
              className="relative h-[360px] sm:h-[440px] lg:h-[490px] w-full rounded-2xl border border-[#1E2936] bg-[#0B0E13] overflow-hidden"
              style={{
                boxShadow:
                  '0 34px 85px -24px rgba(0, 0, 0, 0.96), 0 0 55px -22px rgba(0, 214, 154, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
              }}
            >
              <HeroInfrastructure3D />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

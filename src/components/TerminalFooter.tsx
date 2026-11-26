import React from 'react';
import { useMarket } from '../context/MarketContext';
import { DeepSeekLogo } from './DeepSeekLogo';

interface TerminalFooterProps {
  onReplayIntro?: () => void;
}

export const TerminalFooter: React.FC<TerminalFooterProps> = ({ onReplayIntro }) => {
  const { setActiveTab, openLegalDoc, siteSettings } = useMarket();

  return (
    <footer className="mt-20 border-t border-[#2A394C] bg-[#080C12]/96 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
          {/* Brand Summary */}
          <div className="md:col-span-4 space-y-4">
            <DeepSeekLogo />
            <p className="text-xs text-[#CBD5E1] leading-relaxed max-w-sm">
              Independent enterprise marketplace for Deephat software, distributed telemetry platforms, cryptographic key management, and developer infrastructure.
            </p>
            <p className="text-[11px] text-[#9FB0C2] leading-relaxed max-w-sm">
              DEEPSEEK is an independent software marketplace and is not affiliated with DeepSeek AI.
            </p>
          </div>

          {/* Marketplace */}
          <div className="md:col-span-2 space-y-2.5 text-xs">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px] mb-3">
              Marketplace
            </h4>
            <ul className="space-y-2 text-[#CBD5E1]">
              <li>
                <button onClick={() => setActiveTab('products')} className="hover:text-[#00D69A] cursor-pointer">
                  Products Catalog
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('categories')} className="hover:text-[#00D69A] cursor-pointer">
                  Categories
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-[#00D69A] cursor-pointer">
                  User Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('orders')} className="hover:text-[#00D69A] cursor-pointer">
                  Orders &amp; Licenses
                </button>
              </li>
            </ul>
          </div>

          {/* Knowledge & Support */}
          <div className="md:col-span-3 space-y-2.5 text-xs">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px] mb-3">
              Engineering &amp; Company
            </h4>
            <ul className="space-y-2 text-[#CBD5E1]">
              <li>
                <button onClick={() => setActiveTab('about')} className="hover:text-[#00D69A] cursor-pointer">
                  About DEEPSEEK
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('research')} className="hover:text-[#00D69A] cursor-pointer">
                  Research Library
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('docs')} className="hover:text-[#00D69A] cursor-pointer">
                  Documentation
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('support')} className="hover:text-[#00D69A] cursor-pointer">
                  Support Helpdesk
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('admin')} className="hover:text-[#E5B84B] cursor-pointer">
                  Administrator Console
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Billing Policies */}
          <div className="md:col-span-3 space-y-2.5 text-xs">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px] mb-3">
              Legal &amp; Settlement
            </h4>
            <ul className="space-y-2 text-[#CBD5E1]">
              <li>
                <button onClick={() => openLegalDoc('terms')} className="hover:text-[#00D69A] cursor-pointer">
                  Terms &amp; Conditions
                </button>
              </li>
              <li>
                <button onClick={() => openLegalDoc('privacy')} className="hover:text-[#00D69A] cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => openLegalDoc('refund')} className="hover:text-[#00D69A] cursor-pointer">
                  Refund &amp; Licensing Policy
                </button>
              </li>
              <li>
                <button onClick={() => openLegalDoc('payment')} className="hover:text-[#00D69A] cursor-pointer">
                  Payment &amp; TRC-20 Information
                </button>
              </li>
              <li>
                <button onClick={() => openLegalDoc('contact')} className="hover:text-[#00D69A] cursor-pointer">
                  Contact Information
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[#253445] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#CBD5E1]">
          <span>&copy; 2017 DEEPSEEK Marketplace. All rights reserved.</span>
          <div className="flex items-center gap-4">
            {onReplayIntro && (
              <button
                type="button"
                onClick={onReplayIntro}
                className="text-xs text-[#00D69A] hover:text-[#38BDF8] font-medium cursor-pointer"
              >
                Replay 3D Intro
              </button>
            )}
            <span className="font-mono text-[11px]">
              {siteSettings?.supportEmail || 'support@deepseek-infra.io'} · {siteSettings?.trc20Network || 'Tron TRC-20'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

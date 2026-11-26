import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useMarket } from '../context/MarketContext';

export const AnnouncementBanner: React.FC = () => {
  const { setActiveTab, siteSettings } = useMarket();

  if (siteSettings && !siteSettings.announcementActive) {
    return null;
  }

  return (
    <div className="bg-[#070B10] border-b border-[#253445] py-2 px-4 text-xs relative z-40 shadow-[0_4px_16px_rgba(0,0,0,0.65)]">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-[#CBD5E1]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00D69A] shrink-0" />
          <span>
            {siteSettings?.announcementText ||
              'DEEPSEEK Independent Deephat & Infrastructure Marketplace · USDT (TRC-20) On-Chain Settlement'}
          </span>
        </div>

        <button
          onClick={() => setActiveTab('products')}
          className="text-[11px] font-semibold text-[#00D69A] hover:text-[#34F5BE] transition-colors cursor-pointer whitespace-nowrap"
        >
          Browse Catalog &rarr;
        </button>
      </div>
    </div>
  );
};

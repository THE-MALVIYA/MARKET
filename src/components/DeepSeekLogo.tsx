import React from 'react';

interface DeepSeekLogoProps {
  compact?: boolean;
}

export const DeepSeekLogo: React.FC<DeepSeekLogoProps> = ({ compact = false }) => {
  return (
    <div className="flex items-center gap-2.5 shrink-0 select-none">
      {/* Original Geometric Vault-Prism Mark (no external brand similarity) */}
      <div className="dsk-icon-3d w-9 h-9 rounded-lg flex items-center justify-center relative overflow-hidden">
        <svg
          width="22"
          height="22"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <polygon
            points="14,2 25,8.5 25,19.5 14,26 3,19.5 3,8.5"
            stroke="#00D69A"
            strokeWidth="1.7"
            fill="rgba(0, 214, 154, 0.14)"
          />
          <polygon
            points="14,6.5 20.5,10.25 20.5,17.75 14,21.5 7.5,17.75 7.5,10.25"
            stroke="#38BDF8"
            strokeWidth="1.3"
            fill="rgba(14, 165, 164, 0.16)"
          />
          <path
            d="M14 2V10.25M25 8.5L17.5 12.75M25 19.5L17.5 15.25M14 26V17.75M3 19.5L10.5 15.25M3 8.5L10.5 12.75"
            stroke="#2B3D52"
            strokeWidth="1.15"
          />
          <rect
            x="11.5"
            y="11.5"
            width="5"
            height="5"
            transform="rotate(45 14 14)"
            fill="#FFFFFF"
          />
        </svg>
      </div>

      {!compact && (
        <div className="text-left">
          <span className="font-extrabold text-sm sm:text-base tracking-[0.14em] text-white block leading-none">
            DEEPSEEK
          </span>
          <span className="text-[9px] font-mono text-[#CBD5E1] tracking-[0.16em] hidden sm:block mt-1">
            CYBER INFRASTRUCTURE
          </span>
        </div>
      )}
    </div>
  );
};

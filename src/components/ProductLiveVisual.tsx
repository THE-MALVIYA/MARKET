import React, { useMemo, useState } from 'react';
import { Product } from '../types';
import {
  ShieldCheck,
  Cpu,
  Globe,
  Lock,
  Activity,
  Database,
  Zap,
  Radar,
  Crosshair,
  Server
} from 'lucide-react';

interface ProductLiveVisualProps {
  product: Product;
  compact?: boolean;
  className?: string;
}

interface VisualTheme {
  primary: string;
  secondary: string;
  glow: string;
  tag: string;
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

function getThemeForProduct(product: Product): VisualTheme {
  const key = `${product.id} ${product.category} ${product.name}`.toLowerCase();

  if (key.includes('xtransaction') || key.includes('settlement')) {
    return {
      primary: '#00D69A',
      secondary: '#38BDF8',
      glow: 'rgba(0, 214, 154, 0.34)',
      tag: 'SQM MESH',
      Icon: Globe
    };
  }
  if (key.includes('transaction kit') || key.includes('fault')) {
    return {
      primary: '#E5B84B',
      secondary: '#00D69A',
      glow: 'rgba(229, 184, 75, 0.32)',
      tag: 'FLAGSHIP',
      Icon: Cpu
    };
  }
  if (key.includes('sql-flash') || key.includes('database')) {
    return {
      primary: '#38BDF8',
      secondary: '#00D69A',
      glow: 'rgba(56, 189, 248, 0.32)',
      tag: 'NVME CORE',
      Icon: Database
    };
  }
  if (key.includes('cryptopro') || key.includes('cryptographic')) {
    return {
      primary: '#A78BFA',
      secondary: '#00D69A',
      glow: 'rgba(167, 139, 250, 0.32)',
      tag: 'PQC VAULT',
      Icon: Lock
    };
  }
  if (key.includes('cobalt') || key.includes('core impact') || key.includes('metasploit') || key.includes('penetration')) {
    return {
      primary: '#FB7185',
      secondary: '#E5B84B',
      glow: 'rgba(251, 113, 133, 0.3)',
      tag: 'SIM ENGINE',
      Icon: Crosshair
    };
  }
  if (key.includes('nessus') || key.includes('cymulate') || key.includes('vulnerability') || key.includes('breach')) {
    return {
      primary: '#2DD4BF',
      secondary: '#F59E0B',
      glow: 'rgba(45, 212, 191, 0.3)',
      tag: 'SCANNER',
      Icon: Radar
    };
  }
  if (key.includes('global-t') || key.includes('telemetry') || key.includes('sp-kit')) {
    return {
      primary: '#00D69A',
      secondary: '#0EA5A4',
      glow: 'rgba(0, 214, 154, 0.3)',
      tag: 'LIVE STREAM',
      Icon: Activity
    };
  }
  if (key.includes('global-c') || key.includes('compute')) {
    return {
      primary: '#60A5FA',
      secondary: '#00D69A',
      glow: 'rgba(96, 165, 250, 0.3)',
      tag: 'HPC NODE',
      Icon: Server
    };
  }
  return {
    primary: '#00D69A',
    secondary: '#0EA5A4',
    glow: 'rgba(0, 214, 154, 0.28)',
    tag: 'INFRA SUITE',
    Icon: Zap
  };
}

export const ProductLiveVisual: React.FC<ProductLiveVisualProps> = ({
  product,
  compact = false,
  className = ''
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const theme = useMemo(() => getThemeForProduct(product), [product]);
  const Icon = theme.Icon;
  const code = product.productCode || product.id.toUpperCase();
  const hasCustomLocalAsset = Boolean(product.image && product.image.startsWith('/assets/'));

  if (compact) {
    return (
      <div
        className={`relative overflow-hidden rounded-lg bg-[#070B10] border border-[#1E2936] flex items-center justify-center ${className}`}
      >
        <div
          className="absolute inset-0 opacity-45"
          style={{
            background: `radial-gradient(circle at 50% 45%, ${theme.glow}, transparent 72%)`
          }}
        />
        {hasCustomLocalAsset && !imgFailed ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover relative z-10"
          />
        ) : (
          <div className="relative z-10 flex flex-col items-center justify-center">
            <Icon className="w-5 h-5" style={{ color: theme.primary }} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-[#06090E] flex items-center justify-center select-none ${className}`}
    >
      {/* 3D Perspective Deep-Space Grid Floor */}
      <div
        aria-hidden="true"
        className="dsk-live-grid absolute inset-x-[-20%] bottom-[-32%] h-[78%] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, ${theme.primary}24 1px, transparent 1px), linear-gradient(to bottom, ${theme.primary}24 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
          transform: 'perspective(380px) rotateX(68deg)'
        }}
      />

      {/* Volumetric Radial Lighting */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 46%, ${theme.glow}, rgba(7, 9, 11, 0.25) 62%, #06090E 100%)`
        }}
      />

      {/* Live Orbiting Holographic Telemetry Rings */}
      <div
        aria-hidden="true"
        className="dsk-orbit-ring absolute w-44 h-44 rounded-full pointer-events-none"
        style={{
          border: `1px dashed ${theme.primary}45`
        }}
      />
      <div
        aria-hidden="true"
        className="dsk-orbit-ring-rev absolute w-56 h-24 rounded-full pointer-events-none"
        style={{
          border: `1px solid ${theme.secondary}30`,
          transform: 'rotateX(72deg)'
        }}
      />

      {/* Floating 3D Isometric Software/Hardware Package */}
      <div className="dsk-box-float relative z-10 flex items-center justify-center">
        <div
          className="dsk-box-3d relative w-[124px] h-[146px] transition-transform duration-300 group-hover:scale-105"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Left 3D Spine */}
          <div
            className="absolute top-0 bottom-0 left-[-18px] w-[18px] rounded-l-sm flex items-center justify-center border border-[#1E2936]"
            style={{
              background: `linear-gradient(180deg, #0D141C 0%, #070A0F 100%)`,
              transform: 'rotateY(-90deg) translateZ(9px)',
              transformOrigin: 'right center',
              boxShadow: `inset 0 0 12px ${theme.glow}`
            }}
          >
            <span
              className="font-mono text-[7px] font-bold tracking-[0.18em] whitespace-nowrap"
              style={{ color: theme.primary, writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              {code}
            </span>
          </div>

          {/* Front 3D Packaging Face */}
          <div
            className="relative w-full h-full rounded-md overflow-hidden border flex flex-col justify-between p-2.5 shadow-2xl"
            style={{
              borderColor: `${theme.primary}66`,
              background: `linear-gradient(155deg, #131B24 0%, #080C12 72%, #05080C 100%)`,
              boxShadow: `0 18px 34px -10px rgba(0,0,0,0.92), 0 0 22px -6px ${theme.glow}`
            }}
          >
            {/* Dynamic Moving Light Sweep */}
            <div className="dsk-box-sheen pointer-events-none absolute inset-0" />

            {hasCustomLocalAsset && !imgFailed ? (
              <>
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  onError={() => setImgFailed(true)}
                  className="absolute inset-0 w-full h-full object-cover opacity-95"
                />
                <div className="relative z-10 flex items-center justify-between">
                  <span
                    className="px-1.5 py-0.5 rounded bg-[#07090B]/85 text-[7px] font-mono font-bold"
                    style={{ color: theme.primary }}
                  >
                    3D LIVE
                  </span>
                </div>
              </>
            ) : (
              <>
                {/* Top Label Strip */}
                <div className="relative z-10 flex items-center justify-between gap-1">
                  <span
                    className="font-mono text-[7px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#07090B]/80 border border-[#1E2936]"
                    style={{ color: theme.primary }}
                  >
                    {theme.tag}
                  </span>
                  <ShieldCheck className="w-3 h-3" style={{ color: theme.secondary }} />
                </div>

                {/* Central 3D Emissive Emblem */}
                <div className="relative z-10 flex flex-col items-center justify-center my-auto">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center border mb-1.5"
                    style={{
                      borderColor: `${theme.primary}55`,
                      background: `radial-gradient(circle, ${theme.glow}, rgba(7, 9, 11, 0.9))`,
                      boxShadow: `0 0 18px ${theme.glow}`
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: theme.primary }} />
                  </div>
                  <div className="text-[11px] font-extrabold text-[#F4F7F6] text-center leading-tight line-clamp-2 px-1">
                    {product.name}
                  </div>
                </div>

                {/* Bottom Animated Telemetry Bars */}
                <div className="relative z-10 space-y-1 pt-1 border-t border-[#1E2936]/80">
                  <div className="flex items-end justify-center gap-1 h-3">
                    {[0.45, 0.85, 0.6, 1, 0.7, 0.9, 0.5].map((h, i) => (
                      <span
                        key={i}
                        className="dsk-wave-bar w-1 rounded-full"
                        style={{
                          height: `${Math.round(h * 100)}%`,
                          backgroundColor: i % 2 === 0 ? theme.primary : theme.secondary,
                          animationDelay: `${i * 0.14}s`
                        }}
                      />
                    ))}
                  </div>
                  <div className="text-[7px] font-mono text-[#8F9CA8] text-center truncate">
                    {product.version || 'v2026 LTS'}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

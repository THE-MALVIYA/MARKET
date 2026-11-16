import React, { useState } from 'react';
import { Copy, Check, QrCode, Maximize2, X, AlertTriangle } from 'lucide-react';
import { useMarket } from '../context/MarketContext';

interface QRCodeDisplayProps {
  address: string;
  amount?: number;
  orderNumber?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  address = 'TL9sU4A1ydN9AT2LTaC7P94K4y4BdAgDFx',
  amount,
  orderNumber
}) => {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { addToast } = useMarket();

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    addToast({
      type: 'info',
      title: 'Address Copied',
      message: 'USDT (TRC-20) escrow address copied to clipboard.'
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const renderSvgQr = (size = 220) => (
    <div className="relative p-3 bg-[#040504] border border-emerald-500/40 group">
      <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
      <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
      <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
      <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />

      <svg
        width={size}
        height={size}
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto"
      >
        <rect width="240" height="240" fill="#050705" />

        {/* Top-Left Target */}
        <rect x="20" y="20" width="50" height="50" stroke="#22c55e" strokeWidth="6" fill="none" />
        <rect x="35" y="35" width="20" height="20" fill="#22c55e" />

        {/* Top-Right Target */}
        <rect x="170" y="20" width="50" height="50" stroke="#22c55e" strokeWidth="6" fill="none" />
        <rect x="185" y="35" width="20" height="20" fill="#22c55e" />

        {/* Bottom-Left Target */}
        <rect x="20" y="170" width="50" height="50" stroke="#22c55e" strokeWidth="6" fill="none" />
        <rect x="35" y="185" width="20" height="20" fill="#22c55e" />

        {/* Matrix Blocks */}
        <rect x="85" y="25" width="10" height="10" fill="#4ade80" />
        <rect x="105" y="25" width="10" height="10" fill="#4ade80" />
        <rect x="125" y="25" width="10" height="10" fill="#4ade80" />
        <rect x="145" y="25" width="10" height="10" fill="#4ade80" />

        <rect x="85" y="45" width="10" height="10" fill="#f59e0b" opacity="0.85" />
        <rect x="115" y="45" width="10" height="10" fill="#4ade80" />
        <rect x="135" y="45" width="10" height="10" fill="#4ade80" />

        <rect x="85" y="60" width="20" height="10" fill="#4ade80" />
        <rect x="120" y="60" width="10" height="10" fill="#4ade80" />
        <rect x="145" y="60" width="10" height="10" fill="#4ade80" />

        <rect x="25" y="85" width="10" height="10" fill="#4ade80" />
        <rect x="45" y="85" width="10" height="10" fill="#4ade80" />
        <rect x="60" y="95" width="10" height="10" fill="#4ade80" />
        <rect x="175" y="85" width="10" height="10" fill="#4ade80" />
        <rect x="205" y="85" width="10" height="10" fill="#4ade80" />

        <rect x="25" y="110" width="10" height="10" fill="#4ade80" />
        <rect x="45" y="125" width="10" height="10" fill="#4ade80" />
        <rect x="60" y="140" width="10" height="10" fill="#4ade80" />
        <rect x="175" y="115" width="20" height="10" fill="#4ade80" />
        <rect x="175" y="135" width="10" height="10" fill="#4ade80" />
        <rect x="205" y="135" width="10" height="10" fill="#4ade80" />

        <rect x="85" y="170" width="10" height="10" fill="#4ade80" />
        <rect x="105" y="170" width="20" height="10" fill="#4ade80" />
        <rect x="135" y="170" width="10" height="10" fill="#4ade80" />
        <rect x="155" y="170" width="10" height="10" fill="#4ade80" />

        <rect x="85" y="190" width="20" height="10" fill="#4ade80" />
        <rect x="120" y="190" width="10" height="10" fill="#f59e0b" opacity="0.9" />
        <rect x="145" y="190" width="20" height="10" fill="#4ade80" />

        <rect x="105" y="210" width="10" height="10" fill="#4ade80" />
        <rect x="135" y="210" width="10" height="10" fill="#4ade80" />
        <rect x="165" y="210" width="10" height="10" fill="#4ade80" />
        <rect x="190" y="200" width="20" height="10" fill="#4ade80" />

        {/* Center Badge */}
        <rect x="92" y="92" width="56" height="56" fill="#040504" stroke="#22c55e" strokeWidth="3" />
        <text
          x="120"
          y="121"
          textAnchor="middle"
          fill="#22c55e"
          fontFamily="monospace"
          fontSize="11"
          fontWeight="bold"
        >
          USDT
        </text>
        <text
          x="120"
          y="134"
          textAnchor="middle"
          fill="#f59e0b"
          fontFamily="monospace"
          fontSize="8"
        >
          TRC20
        </text>
      </svg>
    </div>
  );

  return (
    <div className="bg-[#070907] border border-[#1f2c1f] p-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#182018]">
        <div className="flex items-center gap-2">
          <QrCode className="w-4 h-4 text-emerald-400" />
          <span className="font-mono text-sm font-bold text-zinc-100">ESCROW DEPOSIT GATEWAY</span>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 font-semibold">
          TRC-20 NETWORK
        </span>
      </div>

      <div className="mt-4 flex flex-col items-center">
        {renderSvgQr(200)}

        <button
          onClick={() => setShowModal(true)}
          className="mt-2 text-xs text-zinc-400 hover:text-emerald-400 flex items-center gap-1.5 transition-colors cursor-pointer py-1 font-mono"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Expand QR Matrix</span>
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {amount !== undefined && (
          <div className="flex items-center justify-between p-2.5 bg-[#040504] border border-[#1a221a]">
            <span className="text-xs font-mono text-zinc-400">Amount Due:</span>
            <span className="font-mono font-bold text-base text-emerald-400 tabular-nums">{amount.toLocaleString()} USDT</span>
          </div>
        )}

        {orderNumber && (
          <div className="flex items-center justify-between p-2.5 bg-[#040504] border border-[#1a221a]">
            <span className="text-xs font-mono text-zinc-400">Escrow Ref:</span>
            <span className="font-mono text-xs font-semibold text-amber-400">{orderNumber}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-mono text-zinc-400 mb-1">
            USDT (TRC-20) Deposit Address:
          </label>
          <div className="flex items-center gap-2 bg-[#040504] border border-emerald-500/35 p-2">
            <code className="text-xs font-mono text-emerald-400 break-all select-all flex-1">
              {address}
            </code>
            <button
              onClick={handleCopy}
              className={`px-2.5 py-1.5 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                copied
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'bg-[#0e140e] text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/40'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-2.5 bg-[#0b0e08] border border-amber-500/30 flex items-start gap-2 text-[11px] font-mono text-amber-300/90">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong>NOTICE:</strong> Send USDT strictly via Tron TRC-20. After wallet confirmation, upload your TXID screenshot proof below.
          </span>
        </div>
      </div>

      {/* Expanded Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#070907] border border-emerald-500/50 max-w-sm w-full p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 p-1.5 text-zinc-400 hover:text-white hover:bg-[#121812] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-mono font-bold text-zinc-100 text-center mb-1">
              USDT TRC-20 ESCROW QR
            </h3>
            <p className="text-xs font-mono text-zinc-400 text-center mb-4">
              Scan with any Tron TRC-20 wallet
            </p>

            {renderSvgQr(260)}

            <div className="mt-4 text-center">
              <code className="text-xs font-mono text-emerald-400 break-all block mb-3">
                {address}
              </code>
              <button
                onClick={handleCopy}
                className="w-full py-2 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Address Copied!' : 'Copy Payment Address'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

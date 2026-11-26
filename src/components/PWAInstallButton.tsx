import React, { useState } from 'react';
import { Download, Smartphone, X, Share, MoreVertical, ExternalLink } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isInIframe, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="px-2.5 py-2 rounded-lg bg-[#0D1116] hover:bg-[#00D69A] text-[#00D69A] hover:text-[#07090B] border border-[#1E2936] hover:border-[#00D69A] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        title="Install DEEPSEEK App"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden xl:inline">Install App</span>
      </button>

      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#11161D] border border-[#1E2936] rounded-xl max-w-md w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-[#8F9CA8] hover:text-[#F4F7F6] hover:bg-[#0D1116] cursor-pointer"
              aria-label="Close install instructions"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#0D1116] border border-[#1E2936] flex items-center justify-center text-[#00D69A]">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F4F7F6]">Install DEEPSEEK App</h3>
                <p className="text-[11px] text-[#0EA5A4]">Standalone Application Mode</p>
              </div>
            </div>

            {isIOS ? (
              <div className="p-4 rounded-lg bg-[#0D1116] border border-[#1E2936] space-y-2.5 text-xs text-[#F4F7F6]">
                <p className="font-mono text-[#00D69A] text-[11px] font-semibold">
                  iPhone / iPad (Safari):
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-[#8F9CA8]">
                  <li>
                    Tap <Share className="w-3.5 h-3.5 inline text-[#00D69A] mx-0.5" />{' '}
                    <strong className="text-[#F4F7F6]">Share</strong> in Safari&apos;s toolbar.
                  </li>
                  <li>
                    Select <strong className="text-[#F4F7F6]">Add to Home Screen</strong>.
                  </li>
                  <li>
                    Tap <strong className="text-[#F4F7F6]">Add</strong> to launch full-screen.
                  </li>
                </ol>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-[#0D1116] border border-[#1E2936] space-y-2.5 text-xs text-[#8F9CA8]">
                <p className="font-mono text-[#00D69A] text-[11px] font-semibold">
                  Chrome / Edge (Desktop &amp; Android):
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-xs">
                  <li>Open this page in Chrome or Edge outside an embedded frame.</li>
                  <li>
                    Open the browser menu <MoreVertical className="w-3.5 h-3.5 inline text-[#00D69A]" /> and select{' '}
                    <strong className="text-[#F4F7F6]">&quot;Install app&quot;</strong>.
                  </li>
                  <li>Confirm installation to launch DEEPSEEK as a standalone desktop or mobile app.</li>
                </ol>

                {isInIframe && (
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 w-full py-2.5 px-3 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors no-underline"
                  >
                    <span>Open Direct Tab to Install</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="mt-4 w-full py-2 rounded-lg bg-[#0D1116] hover:bg-[#151C24] border border-[#1E2936] text-[#F4F7F6] text-xs font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

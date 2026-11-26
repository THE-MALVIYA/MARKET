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
        className="dsk-btn-secondary-3d px-2.5 py-2 rounded-lg text-[#00D69A] hover:text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
        title="Install DEEPSEEK App"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden xl:inline">Install App</span>
      </button>

      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/86 flex items-center justify-center p-4">
          <div className="dsk-surface rounded-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-[#CBD5E1] hover:text-white dsk-btn-secondary-3d cursor-pointer"
              aria-label="Close install instructions"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="dsk-icon-3d w-9 h-9 rounded-lg flex items-center justify-center text-[#00D69A]">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Install DEEPSEEK App</h3>
                <p className="text-[11px] text-[#00D69A]">Standalone Application Mode</p>
              </div>
            </div>

            {isIOS ? (
              <div className="p-4 rounded-lg dsk-panel-3d space-y-2.5 text-xs text-white">
                <p className="font-mono text-[#00D69A] text-[11px] font-semibold">
                  iPhone / iPad (Safari):
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-[#CBD5E1]">
                  <li>
                    Tap <Share className="w-3.5 h-3.5 inline text-[#00D69A] mx-0.5" />{' '}
                    <strong className="text-white">Share</strong> in Safari&apos;s toolbar.
                  </li>
                  <li>
                    Select <strong className="text-white">Add to Home Screen</strong>.
                  </li>
                  <li>
                    Tap <strong className="text-white">Add</strong> to launch full-screen.
                  </li>
                </ol>
              </div>
            ) : (
              <div className="p-4 rounded-lg dsk-panel-3d space-y-2.5 text-xs text-[#CBD5E1]">
                <p className="font-mono text-[#00D69A] text-[11px] font-semibold">
                  Chrome / Edge (Desktop &amp; Android):
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-xs">
                  <li>Open this page in Chrome or Edge outside an embedded frame.</li>
                  <li>
                    Open the browser menu <MoreVertical className="w-3.5 h-3.5 inline text-[#00D69A]" /> and select{' '}
                    <strong className="text-white">&quot;Install app&quot;</strong>.
                  </li>
                  <li>Confirm installation to launch DEEPSEEK as a standalone desktop or mobile app.</li>
                </ol>

                {isInIframe && (
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 w-full py-2.5 px-3 rounded-lg dsk-btn-3d text-xs flex items-center justify-center gap-1.5 no-underline"
                  >
                    <span>Open Direct Tab to Install</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="mt-4 w-full py-2 rounded-lg dsk-btn-secondary-3d text-white text-xs font-medium cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

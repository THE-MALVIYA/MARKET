import React, { useState } from 'react';
import { Download, Smartphone, X, Share, MoreVertical, ExternalLink } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isInIframe, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Suppress install button when already running in standalone app mode
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
        className="px-2.5 py-1.5 bg-[#0a0e0a] hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/40 font-mono font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        title="Install CyberPlaces as Standalone App"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">App</span>
      </button>

      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#070907] border border-emerald-500/50 max-w-md w-full p-6 relative font-mono">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-3 right-3 p-1.5 text-zinc-400 hover:text-white cursor-pointer"
              aria-label="Close install instructions"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 bg-[#0b100b] border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  INSTALL CYBERPLACES APP
                </h3>
                <p className="text-[11px] text-emerald-400">
                  Standalone App Mode (No URL Bar)
                </p>
              </div>
            </div>

            {isIOS ? (
              <div className="p-3.5 bg-[#040504] border border-[#1d271d] space-y-2.5 text-xs text-zinc-300 font-sans">
                <p className="font-mono text-emerald-400 text-[11px] font-bold">
                  iPhone / iPad (Safari):
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-zinc-300">
                  <li className="flex items-start gap-1.5">
                    <span>1.</span>
                    <span>
                      Tap the <Share className="w-3.5 h-3.5 inline text-emerald-400 mx-0.5" /> <strong>Share</strong> button in Safari&apos;s toolbar.
                    </span>
                  </li>
                  <li>
                    Scroll down and select <strong>Add to Home Screen</strong>.
                  </li>
                  <li>
                    Tap <strong>Add</strong> — CyberPlaces will launch full-screen without any browser URL bar.
                  </li>
                </ol>
              </div>
            ) : (
              <div className="p-3.5 bg-[#040504] border border-[#1d271d] space-y-2.5 text-xs text-zinc-300 font-sans">
                <p className="font-mono text-emerald-400 text-[11px] font-bold">
                  Android Chrome / Desktop Browser:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-zinc-300">
                  <li>
                    Open this page directly in Chrome / Edge (not inside an embedded preview frame).
                  </li>
                  <li>
                    Tap the browser menu <MoreVertical className="w-3.5 h-3.5 inline text-emerald-400" /> and choose <strong>&quot;Install app&quot;</strong> (or <strong>Add to Home screen &rarr; Install</strong>).
                  </li>
                  <li>
                    Choosing <strong>Install</strong> installs the full standalone APK/WebAPK with app icon and <strong>zero browser URL bar</strong>.
                  </li>
                </ol>

                {isInIframe && (
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 w-full py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-colors no-underline"
                  >
                    <span>Open Direct Tab to Install</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="mt-4 w-full py-2 bg-[#0c100c] hover:bg-[#141c14] border border-[#222e22] text-zinc-200 text-xs font-mono transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

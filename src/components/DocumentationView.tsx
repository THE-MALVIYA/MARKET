import React, { useState } from 'react';
import {
  FileCode2,
  Terminal,
  ShieldCheck,
  KeyRound,
  Copy,
  Check,
  Server
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';

export const DocumentationView: React.FC = () => {
  const { addToast, setActiveTab } = useMarket();
  const [activeDoc, setActiveDoc] = useState<'quickstart' | 'verification' | 'api' | 'licensing'>('quickstart');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyBlock = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    addToast({
      type: 'info',
      title: 'Snippet Copied',
      message: 'Documentation command copied to clipboard.'
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickstartCode = `# Verify downloaded DEEPSEEK package manifest locally
sha256sum -c deepseek-release.tar.gz.sha256

# Inspect issued license manifest JSON downloaded from Dashboard
cat DEEPSEEK-Global-T.json | jq '{ licenseKey, orderNumber, downloadManifestHash }'`;

  const verifyCode = `# Verify SHA-256 package checksum and GPG release signature
sha256sum -c global-t-v4.1.2.tar.gz.sha256
gpg --verify global-t-v4.1.2.tar.gz.asc global-t-v4.1.2.tar.gz`;

  const apiCode = `// Fetch verified catalog listings via REST API
const response = await fetch('/api/products');
const { products } = await response.json();

// Retrieve authenticated orders using Bearer token
const ordersRes = await fetch('/api/orders', {
  headers: { Authorization: 'Bearer <session-token>' }
});

// Submit a 64-character TRC-20 TXID hash for blockchain verification
await fetch('/api/orders/DSK-1042/verify-tx', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer <session-token>'
  },
  body: JSON.stringify({ txHash: '<64-char-trc20-txid>' })
});`;

  const sections = [
    { id: 'quickstart', label: 'Package Quickstart', icon: Terminal },
    { id: 'verification', label: 'Checksum Verification', icon: ShieldCheck },
    { id: 'api', label: 'Platform REST API', icon: Server },
    { id: 'licensing', label: 'Enterprise Licensing', icon: KeyRound }
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="pb-5 border-b border-[#253445] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00D69A] mb-1.5">
            <FileCode2 className="w-3.5 h-3.5" />
            <span>DEVELOPER DOCUMENTATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Integration &amp; Deployment Docs
          </h1>
          <p className="text-xs sm:text-sm text-[#CBD5E1] mt-1 max-w-2xl">
            Reference guides for verifying SHA-256 package manifests, authenticating REST endpoints, and managing TRC-20 settlements.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('support')}
          className="dsk-btn-secondary-3d px-4 py-2 rounded-lg text-xs hover:text-[#00D69A] cursor-pointer self-start"
        >
          Contact Engineering Support
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <aside className="dsk-surface lg:col-span-3 rounded-xl p-2 space-y-1">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const active = activeDoc === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveDoc(sec.id)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                  active
                    ? 'bg-[#00D69A]/15 text-[#00D69A] font-semibold'
                    : 'text-[#CBD5E1] hover:text-white hover:bg-[#0B1017]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </aside>

        <div className="dsk-surface lg:col-span-9 p-6 sm:p-8 rounded-xl space-y-6">
          {activeDoc === 'quickstart' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Manifest Verification &amp; Quickstart</h2>
              <p className="text-sm text-[#CBD5E1] leading-relaxed">
                After payment confirmation, download your signed JSON license manifest directly from your DEEPSEEK User Dashboard and validate package digests prior to deployment.
              </p>

              <div className="relative">
                <button
                  onClick={() => copyBlock('qs', quickstartCode)}
                  className="dsk-btn-secondary-3d absolute top-3 right-3 px-2.5 py-1 rounded text-[11px] font-mono text-[#00D69A] flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === 'qs' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === 'qs' ? 'Copied' : 'Copy'}</span>
                </button>
                <pre className="p-4 rounded-lg bg-[#05080D] border border-[#253445] text-xs font-mono text-[#00D69A] overflow-x-auto leading-relaxed">
                  {quickstartCode}
                </pre>
              </div>
            </div>
          )}

          {activeDoc === 'verification' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Cryptographic Checksum Verification</h2>
              <p className="text-sm text-[#CBD5E1] leading-relaxed">
                Every release package indexed by DEEPSEEK pairs a detached signature with a SHA-256 digest manifest. Validate artifacts locally before executing inside production environments.
              </p>

              <div className="relative">
                <button
                  onClick={() => copyBlock('ver', verifyCode)}
                  className="dsk-btn-secondary-3d absolute top-3 right-3 px-2.5 py-1 rounded text-[11px] font-mono text-[#00D69A] flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === 'ver' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === 'ver' ? 'Copied' : 'Copy'}</span>
                </button>
                <pre className="p-4 rounded-lg bg-[#05080D] border border-[#253445] text-xs font-mono text-[#00D69A] overflow-x-auto leading-relaxed">
                  {verifyCode}
                </pre>
              </div>
            </div>
          )}

          {activeDoc === 'api' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Platform REST API Reference</h2>
              <p className="text-sm text-[#CBD5E1] leading-relaxed">
                Programmatically query available software suites, inspect payment configuration, and submit Tron TRC-20 transaction hashes for automated verification.
              </p>

              <div className="dsk-panel-3d rounded-lg divide-y divide-[#253445] text-xs font-mono">
                <div className="p-3 flex items-center justify-between gap-4">
                  <span className="text-[#00D69A]">GET /api/products</span>
                  <span className="text-[#CBD5E1]">List all verified catalog suites</span>
                </div>
                <div className="p-3 flex items-center justify-between gap-4">
                  <span className="text-[#00D69A]">GET /api/orders/payment-config</span>
                  <span className="text-[#CBD5E1]">Fetch active TRC-20 address &amp; confirmations</span>
                </div>
                <div className="p-3 flex items-center justify-between gap-4">
                  <span className="text-[#E5B84B]">POST /api/orders/:orderNumber/verify-tx</span>
                  <span className="text-[#CBD5E1]">Verify submitted TXID via TronGrid</span>
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => copyBlock('api', apiCode)}
                  className="dsk-btn-secondary-3d absolute top-3 right-3 px-2.5 py-1 rounded text-[11px] font-mono text-[#00D69A] flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === 'api' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === 'api' ? 'Copied' : 'Copy'}</span>
                </button>
                <pre className="p-4 rounded-lg bg-[#05080D] border border-[#253445] text-xs font-mono text-[#00D69A] overflow-x-auto leading-relaxed">
                  {apiCode}
                </pre>
              </div>
            </div>
          )}

          {activeDoc === 'licensing' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Enterprise Licensing &amp; Acceptable Use</h2>
              <p className="text-sm text-[#CBD5E1] leading-relaxed">
                All tools hosted on DEEPSEEK are licensed strictly for defensive engineering, infrastructure monitoring, and authorized security assessments.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="dsk-panel-3d p-4 rounded-lg space-y-1.5">
                  <div className="font-semibold text-[#00D69A]">Single-Cluster License</div>
                  <p className="text-[#CBD5E1] leading-relaxed">
                    Covers one production cluster and non-production staging nodes within a single legal entity.
                  </p>
                </div>
                <div className="dsk-panel-3d p-4 rounded-lg space-y-1.5">
                  <div className="font-semibold text-[#E5B84B]">On-Chain Settlement &amp; Fulfillment</div>
                  <p className="text-[#CBD5E1] leading-relaxed">
                    USDT TRC-20 transaction hashes are verified for uniqueness and finality before license issuance.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

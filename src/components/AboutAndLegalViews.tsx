import React from 'react';
import { useMarket } from '../context/MarketContext';
import { ArrowRight, ShieldCheck, Layers, Cpu, Mail, FileText } from 'lucide-react';
import { LegalDocId } from '../types';

export const AboutView: React.FC = () => {
  const { setActiveTab, products, categories } = useMarket();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="dsk-surface p-8 sm:p-10 rounded-2xl space-y-5">
        <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#00D69A] font-semibold block">
          About DEEPSEEK
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white max-w-3xl leading-tight">
          Enterprise Deephat &amp; Infrastructure Software Distribution
        </h1>
        <p className="text-sm sm:text-base text-[#CBD5E1] max-w-3xl leading-relaxed">
          DEEPSEEK operates as an independent international technology marketplace dedicated to defensive security software, distributed observability engines, cryptographic verification platforms, and infrastructure acceleration suites.
        </p>
        <p className="text-xs text-[#9FB0C2] max-w-3xl leading-relaxed">
          Note: DEEPSEEK is an independent software marketplace operating in Deephat and infrastructure tooling and is not affiliated with DeepSeek AI.
        </p>

        <div className="pt-2 flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab('products')}
            className="dsk-btn-3d px-5 py-2.5 rounded-lg text-xs flex items-center gap-2 cursor-pointer"
          >
            <span>Explore {products.length} Software Suites</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className="dsk-btn-secondary-3d px-5 py-2.5 rounded-lg text-xs cursor-pointer"
          >
            Contact Support
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="dsk-panel-3d p-6 rounded-xl space-y-2.5">
          <ShieldCheck className="w-5 h-5 text-[#00D69A]" />
          <h3 className="text-sm font-bold text-white">Authorized Security Posture</h3>
          <p className="text-xs text-[#CBD5E1] leading-relaxed">
            Catalog tooling focuses on infrastructure observability, vulnerability posture validation, cryptographic key hygiene, and authorized defensive assessments.
          </p>
        </div>

        <div className="dsk-panel-3d p-6 rounded-xl space-y-2.5">
          <Cpu className="w-5 h-5 text-[#38BDF8]" />
          <h3 className="text-sm font-bold text-white">Transparent Technical Specs</h3>
          <p className="text-xs text-[#CBD5E1] leading-relaxed">
            Every product detail view lists architecture targets, operating system requirements, version history, and verification CLI workflows prior to checkout.
          </p>
        </div>

        <div className="dsk-panel-3d p-6 rounded-xl space-y-2.5">
          <Layers className="w-5 h-5 text-[#00D69A]" />
          <h3 className="text-sm font-bold text-white">
            {Math.max(0, categories.length - 1)} Active Categories
          </h3>
          <p className="text-xs text-[#CBD5E1] leading-relaxed">
            Organized across telemetry, stream processing, zero-trust gateways, cryptography, vulnerability scanning, and database storage engines.
          </p>
        </div>
      </div>
    </div>
  );
};

export const CategoriesDirectoryView: React.FC = () => {
  const { categories, products, setSelectedCategory, setActiveTab } = useMarket();
  const realCats = categories.filter((c) => c !== 'All Categories');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="pb-5 border-b border-[#253445]">
        <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#00D69A] font-semibold block mb-1">
          Catalog Taxonomy
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Technology &amp; Security Categories
        </h1>
        <p className="text-xs sm:text-sm text-[#CBD5E1] mt-1">
          Browse all software domains currently stocked in the DEEPSEEK repository.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {realCats.map((cat) => {
          const matching = products.filter((p) => p.category === cat);
          return (
            <div
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setActiveTab('products');
              }}
              className="dsk-card-3d dsk-surface p-6 rounded-xl hover:border-[#00D69A]/60 cursor-pointer flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono text-[#00D69A]">
                    {matching.length} {matching.length === 1 ? 'SUITE' : 'SUITES'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#CBD5E1]" />
                </div>
                <h3 className="text-base font-bold text-white">{cat}</h3>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-[#253445]">
                {matching.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs text-[#CBD5E1]">
                    <span className="truncate pr-2 text-[#E2E8F0]">{item.name}</span>
                    <span className="font-mono text-[#00D69A] shrink-0 tabular-nums">
                      {item.price.toLocaleString()} USDT
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const LegalView: React.FC = () => {
  const { activeLegalDoc, openLegalDoc, siteSettings, paymentConfig } = useMarket();

  const docs: Record<
    LegalDocId,
    { title: string; updated: string; sections: { heading: string; body: string }[] }
  > = {
    terms: {
      title: 'Terms & Conditions',
      updated: '2026-04-01',
      sections: [
        {
          heading: '1. Scope of Software Licensing',
          body: 'All software packages distributed through DEEPSEEK are licensed strictly for authorized infrastructure operations, defensive security research, testing environments owned or explicitly authorized by the licensee, and enterprise engineering workloads.'
        },
        {
          heading: '2. Independent Marketplace Status',
          body: 'DEEPSEEK is an independent software and developer infrastructure marketplace and has no affiliation, endorsement, or partnership with DeepSeek AI or unrelated third-party AI entities.'
        },
        {
          heading: '3. Account Integrity & Verification',
          body: 'Customers are responsible for maintaining accurate account credentials and ensuring submitted blockchain transaction hashes correspond to genuine, authorized USDT settlement transfers.'
        }
      ]
    },
    privacy: {
      title: 'Privacy Policy',
      updated: '2026-04-01',
      sections: [
        {
          heading: '1. Data Collected',
          body: 'DEEPSEEK collects account registration identifiers (username, email address, optional organization), order histories, submitted TRC-20 transaction hashes, and customer support inquiries strictly to fulfill software licensing.'
        },
        {
          heading: '2. Credential & Session Security',
          body: 'Passwords are protected using salted scrypt cryptographic derivation. Authentication tokens are held in active application memory and never exposed in plaintext server logs.'
        },
        {
          heading: '3. Data Retention',
          body: 'License issuance records and payment audit trails are retained to preserve active entitlements and support verification requests.'
        }
      ]
    },
    refund: {
      title: 'Refund & Licensing Policy',
      updated: '2026-04-01',
      sections: [
        {
          heading: '1. Digital Software Delivery',
          body: 'Once a blockchain payment is confirmed and cryptographic license keys or installation manifests are issued and downloaded, orders are generally final due to the non-revocable nature of digital software assets.'
        },
        {
          heading: '2. Duplicate or Failed Transfers',
          body: 'If an order enters Payment Failed due to an underpayment or expired checkout window prior to license issuance, open a support ticket with your TXID hash for engineering billing reconciliation.'
        }
      ]
    },
    payment: {
      title: 'Payment & Blockchain Settlement Information',
      updated: '2026-04-01',
      sections: [
        {
          heading: '1. Supported Settlement Network',
          body: `Settlements are processed in USDT exclusively over the ${
            paymentConfig?.network || 'Tron TRC-20'
          } network. Always verify the receiving address displayed during active checkout before broadcasting funds.`
        },
        {
          heading: '2. Confirmation Thresholds',
          body: `Submitted transaction hashes (TXID) are verified against the Tron network ledger. Orders require ${
            paymentConfig?.requiredConfirmations || 19
          } block confirmations before transitioning to Payment Confirmed and issuing license keys.`
        },
        {
          heading: '3. Duplicate TXID Protection',
          body: 'Each blockchain transaction hash can only be bound to a single order reference across the platform.'
        }
      ]
    },
    contact: {
      title: 'Contact & Corporate Support Information',
      updated: '2026-04-01',
      sections: [
        {
          heading: '1. Direct Engineering Support',
          body: `For billing reconciliation, enterprise licensing inquiries, or compliance verification, contact our operations desk at ${
            siteSettings?.supportEmail || 'support@deepseek-infra.io'
          } or submit a ticket directly inside the Support Helpdesk.`
        },
        {
          heading: '2. License Dispatch Channel',
          body: `Verified delivery notifications and package retrieval instructions are coordinated via ${
            siteSettings?.dispatchChannel || '@getfilex_bot'
          } alongside direct manifest downloads in your User Dashboard.`
        }
      ]
    }
  };

  const current = docs[activeLegalDoc];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <aside className="md:col-span-4 space-y-1.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#CBD5E1] px-3 pb-2">
            Policies &amp; Governance
          </div>
          {(
            [
              { id: 'terms', label: 'Terms & Conditions' },
              { id: 'privacy', label: 'Privacy Policy' },
              { id: 'refund', label: 'Refund Policy' },
              { id: 'payment', label: 'Payment Information' },
              { id: 'contact', label: 'Contact Information' }
            ] as { id: LegalDocId; label: string }[]
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => openLegalDoc(item.id)}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                activeLegalDoc === item.id
                  ? 'bg-[#00D69A]/15 text-[#00D69A] font-semibold border border-[#00D69A]/40'
                  : 'dsk-btn-secondary-3d text-[#CBD5E1]'
              }`}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </aside>

        <div className="dsk-surface md:col-span-8 p-6 sm:p-8 rounded-2xl space-y-6">
          <div className="pb-4 border-b border-[#253445] flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-white">{current.title}</h1>
            <span className="text-[11px] font-mono text-[#CBD5E1]">Effective {current.updated}</span>
          </div>

          <div className="space-y-6">
            {current.sections.map((sec) => (
              <div key={sec.heading} className="space-y-1.5">
                <h2 className="text-sm font-bold text-[#00D69A]">{sec.heading}</h2>
                <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">{sec.body}</p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#253445] flex items-center gap-2 text-xs text-[#CBD5E1]">
            <Mail className="w-4 h-4 text-[#38BDF8]" />
            <span>Questions? Reach us at {siteSettings?.supportEmail || 'support@deepseek-infra.io'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

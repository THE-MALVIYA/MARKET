import React, { useState } from 'react';
import { Shield, Send, CheckCircle2, LifeBuoy, FileText, ChevronDown } from 'lucide-react';
import { useMarket } from '../context/MarketContext';

export const SupportView: React.FC = () => {
  const { submitSupportTicket, paymentConfig, siteSettings, tickets, currentUser, setActiveTab } = useMarket();
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketCategory, setTicketCategory] = useState('License Verification');
  const [submittedTicketNumber, setSubmittedTicketNumber] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is DEEPSEEK?',
      a: 'DEEPSEEK is an independent enterprise Deephat software marketplace and developer infrastructure platform offering defensive telemetry suites, cryptographic key managers, storage accelerators, and security assessment tools.'
    },
    {
      q: 'How does USDT TRC-20 blockchain verification work?',
      a: `When you generate an order at checkout, our backend provides the active TRC-20 settlement address and exact USDT amount. After broadcasting your transfer, submit your 64-character TXID hash. Our verifier checks transaction uniqueness across orders and confirms ${paymentConfig?.requiredConfirmations || 19} block confirmations before issuing license keys.`
    },
    {
      q: 'How are license keys and installation packages delivered?',
      a: `Once settlement reaches Payment Confirmed, unique license keys (DSK-XXXX-...) and downloadable package manifests become available in your Orders and User Dashboard, with dispatch notices via ${siteSettings?.dispatchChannel || '@getfilex_bot'}.`
    },
    {
      q: 'Can I preview a transaction hash or upload a receipt screenshot?',
      a: 'Yes. Blockchain TXID verification is the authoritative automated check, and you may optionally attach a transfer receipt screenshot to assist billing reconciliation if an underpayment or timeout occurs.'
    }
  ];

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    setSubmitting(true);
    const created = await submitSupportTicket(
      ticketCategory,
      ticketSubject.trim(),
      ticketMessage.trim()
    );
    setSubmitting(false);

    if (created) {
      setSubmittedTicketNumber(created.ticketNumber);
      setTicketSubject('');
      setTicketMessage('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-2xl mx-auto mb-10 pb-6 border-b border-[#253445]">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#00D69A] mb-2">
          <LifeBuoy className="w-3.5 h-3.5" />
          <span>ENTERPRISE SUPPORT DESK</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Support &amp; Licensing Helpdesk
        </h1>
        <p className="text-xs sm:text-sm text-[#CBD5E1]">
          Blockchain settlement verification assistance, deployment guidance, and licensing inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-7 space-y-4">
          <h3 className="text-sm font-bold text-[#00D69A] flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4" />
            <span>Frequently Asked Questions</span>
          </h3>

          <div className="space-y-2.5">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="dsk-panel-3d rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-4 flex items-center justify-between gap-2 text-xs font-semibold text-white hover:text-[#00D69A] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#CBD5E1] transition-transform shrink-0 ${
                      openFaq === idx ? 'rotate-180 text-[#00D69A]' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="p-4 pt-2 text-xs text-[#CBD5E1] leading-relaxed border-t border-[#253445]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="dsk-surface p-4 rounded-xl border-[#E5B84B]/40 text-xs text-[#CBD5E1] leading-relaxed">
            <div className="font-semibold text-[#E5B84B] flex items-center gap-1.5 mb-1">
              <Shield className="w-4 h-4" />
              <span>Authorized Use &amp; Package Verification</span>
            </div>
            <p>
              All DEEPSEEK distributions undergo SHA-256 checksum validation and cryptographic signature auditing prior to catalog publication. Direct inquiries: {siteSettings?.supportEmail || 'support@deepseek-infra.io'}.
            </p>
          </div>
        </div>

        <div className="md:col-span-5 space-y-4">
          <div className="dsk-surface p-5 sm:p-6 rounded-xl">
            <h3 className="text-sm font-bold text-white mb-1.5">
              Open Support Ticket
            </h3>
            <p className="text-xs text-[#CBD5E1] mb-4">
              Submit an inquiry regarding TXID confirmation, license activation, or technical specs.
            </p>

            {submittedTicketNumber ? (
              <div className="dsk-panel-3d p-5 rounded-xl border-[#00D69A]/40 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-[#00D69A] mx-auto" />
                <div>
                  <div className="font-bold text-[#00D69A] text-xs">Ticket Created</div>
                  <div className="text-xs font-mono text-[#CBD5E1] mt-1">
                    Reference ID: <span className="text-white font-bold">{submittedTicketNumber}</span>
                  </div>
                </div>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setSubmittedTicketNumber(null)}
                    className="dsk-btn-3d px-3.5 py-2 rounded-lg text-xs cursor-pointer"
                  >
                    New Ticket
                  </button>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="dsk-btn-secondary-3d px-3.5 py-2 rounded-lg text-xs cursor-pointer"
                  >
                    Track in Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-[#CBD5E1] block mb-1 font-medium">Category</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="dsk-input-3d w-full rounded-lg p-2.5"
                  >
                    <option value="License Verification">License &amp; TXID Verification</option>
                    <option value="Technical Specifications">Technical Specifications</option>
                    <option value="Deployment Support">Deployment &amp; CLI Setup</option>
                    <option value="Enterprise Inquiries">Enterprise Volume Licensing</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#CBD5E1] block mb-1 font-medium">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Order DSK-1024 blockchain verification"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="dsk-input-3d w-full rounded-lg p-2.5 placeholder-[#9FB0C2]/70"
                  />
                </div>

                <div>
                  <label className="text-[#CBD5E1] block mb-1 font-medium">Details</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Include your order reference, TXID hash, or technical question..."
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    className="dsk-input-3d w-full rounded-lg p-2.5 placeholder-[#9FB0C2]/70"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="dsk-btn-3d w-full py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : 'Submit Support Ticket'}</span>
                </button>
              </form>
            )}
          </div>

          {currentUser && tickets.length > 0 && (
            <div className="dsk-surface p-4 rounded-xl text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Your Recent Tickets ({tickets.length})</span>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="text-[#00D69A] hover:underline cursor-pointer"
                >
                  View all
                </button>
              </div>
              {tickets.slice(0, 2).map((t) => (
                <div key={t.id} className="dsk-panel-3d p-2.5 rounded-lg flex items-center justify-between gap-2">
                  <span className="truncate text-[#E2E8F0]">{t.subject}</span>
                  <span className="font-mono text-[10px] text-[#00D69A] shrink-0">{t.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Shield, Send, CheckCircle2, Terminal, FileText, ChevronDown } from 'lucide-react';
import { useMarket } from '../context/MarketContext';

export const SupportView: React.FC = () => {
  const { addToast } = useMarket();
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Payment Verification');
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is CyberPlaces?',
      a: 'CyberPlaces is an encrypted onion marketplace providing verified security testing suites, penetration frameworks, cryptographic toolkits, and cyber infrastructure modules.'
    },
    {
      q: 'How does USDT TRC-20 escrow and proof verification work?',
      a: 'When you initiate checkout, an escrow reference and the TRC-20 deposit address are generated. Transfer the exact USDT amount on Tron TRC-20 and upload your confirmation screenshot. Once captured, the verification relay confirms the hash and unlocks your package bundle via Telegram bot delivery.'
    },
    {
      q: 'How are toolkits delivered after proof submission?',
      a: 'Immediately after uploading payment proof, encrypted archive links, license keys, and setup files are accessible through the official Telegram delivery bot (@getfilex_bot) and tracked inside Escrow Orders.'
    }
  ];

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;

    const fakeTicketId = 'PGP-' + Math.floor(100000 + Math.random() * 900000);
    setSubmittedTicketId(fakeTicketId);
    setTicketSubject('');
    setTicketMessage('');

    addToast({
      type: 'success',
      title: 'Encrypted Ticket Dispatched',
      message: `Ticket ${fakeTicketId} routed to support queue.`
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      <div className="text-center max-w-2xl mx-auto mb-10 pb-6 border-b border-[#1d271d]">
        <div className="text-xs font-mono text-emerald-400 mb-2">
          PGP SUPPORT RELAY · FINGERPRINT 0x8F4C92E1
        </div>
        <h1 className="text-3xl font-mono font-bold text-white mb-2">
          SUPPORT &amp; ESCROW FAQ
        </h1>
        <p className="text-xs font-mono text-zinc-400">
          Escrow settlement rules, PGP key verification, and encrypted operator helpdesk.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-7 space-y-4">
          <h3 className="text-sm font-mono font-bold text-emerald-400 flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </h3>

          <div className="space-y-2.5">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#070907] border border-[#1d271d] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-4 flex items-center justify-between gap-2 text-xs font-mono font-bold text-zinc-200 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-500 transition-transform ${
                      openFaq === idx ? 'rotate-180 text-emerald-400' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="p-4 pt-2 text-xs text-zinc-400 leading-relaxed font-sans border-t border-[#161e16]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 bg-[#070907] border border-amber-500/35 text-xs text-zinc-300 leading-relaxed space-y-1 font-mono">
            <div className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
              <Shield className="w-4 h-4" />
              <span>ZERO-LOG CRYPTOGRAPHIC ESCROW</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              All CyberPlaces releases undergo SHA-256 checksum validation and PGP signature auditing prior to marketplace indexing.
            </p>
          </div>
        </div>

        <div className="md:col-span-5">
          <div className="p-5 bg-[#070907] border border-[#223022]">
            <h3 className="text-sm font-mono font-bold text-white mb-2 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>DISPATCH SUPPORT TICKET</span>
            </h3>
            <p className="text-[11px] font-mono text-zinc-400 mb-4">
              Send an inquiry regarding escrow verification, access keys, or package binaries.
            </p>

            {submittedTicketId ? (
              <div className="p-4 bg-[#040504] border border-emerald-500/40 text-center font-mono space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div>
                  <div className="font-bold text-emerald-400 text-xs">TICKET DISPATCHED</div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Reference ID: <span className="text-white font-bold">{submittedTicketId}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSubmittedTicketId(null)}
                  className="px-3 py-1.5 bg-emerald-500 text-black font-bold text-xs cursor-pointer"
                >
                  Open Another Ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-zinc-400 block mb-1">Inquiry Sector</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full bg-[#040504] border border-[#222e22] p-2 text-zinc-200 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Payment Verification">Payment Verification</option>
                    <option value="Technical Specifications">Technical Specifications</option>
                    <option value="License Activation Key">License Activation</option>
                    <option value="Cyber Inquiries">Custom Package Request</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Escrow TXID verification inquiry..."
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="w-full bg-[#040504] border border-[#222e22] p-2 text-zinc-200 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Encrypted Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Enter order reference or inquiry details..."
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    className="w-full bg-[#040504] border border-[#222e22] p-2 text-zinc-200 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none font-sans text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Ticket</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

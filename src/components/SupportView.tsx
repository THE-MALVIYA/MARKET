import React, { useState } from 'react';
import { Shield, HelpCircle, Send, CheckCircle2, Terminal, AlertTriangle, FileText, ChevronDown } from 'lucide-react';
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
      q: 'What is ToolPlaces?',
      a: 'ToolPlaces is an enterprise-grade digital software and developer toolkit marketplace providing audited security testing software, cloud infrastructure utilities, and automation modules.'
    },
    {
      q: 'How does USDT TRC-20 payment and proof verification work?',
      a: 'When you place an order, an order reference (e.g. TP-2026-XXXXXX) and the TRC-20 deposit address are generated. After transferring via your Tron-compatible wallet, upload your transaction receipt screenshot. Once submitted, our verification system confirms the blockchain transaction and activates your software license.'
    },
    {
      q: 'How are licenses delivered after confirmation?',
      a: 'Once your payment proof is confirmed, cryptographic keys, container images, and repository access links are immediately made available in your Orders view with 24/7 technical support.'
    }
  ];

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;

    const fakeTicketId = 'TICK-' + Math.floor(100000 + Math.random() * 900000);
    setSubmittedTicketId(fakeTicketId);
    setTicketSubject('');
    setTicketMessage('');

    addToast({
      type: 'success',
      title: 'Support Ticket Dispatched',
      message: `Ticket ${fakeTicketId} created. Our engineering team will review it.`
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-mono text-xs mb-3">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>TOOLPLACES CUSTOMER & TECHNICAL SUPPORT</span>
        </div>
        <h1 className="text-3xl font-mono font-extrabold text-white mb-2">
          SUPPORT & KNOWLEDGE BASE
        </h1>
        <p className="text-xs font-mono text-slate-400">
          Frequently asked questions, settlement guidelines, and direct engineering helpdesk.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: FAQs */}
        <div className="md:col-span-7 space-y-4">
          <h3 className="text-sm font-mono font-bold text-cyan-300 flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4" />
            <span>COMMONLY ASKED QUESTIONS</span>
          </h3>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-[#090d16] border border-slate-800 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-4 flex items-center justify-between gap-2 text-xs font-mono font-bold text-slate-200 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      openFaq === idx ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="p-4 pt-0 text-xs text-slate-400 leading-relaxed font-sans border-t border-slate-800/40 mt-1">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Verification Quality Assurance Card */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200/90 leading-relaxed space-y-1 font-mono">
            <div className="font-bold text-purple-300 flex items-center gap-1.5 mb-1">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>QUALITY & SECURITY ASSURANCE STATEMENT</span>
            </div>
            <p className="text-[11px] text-slate-300">
              ToolPlaces products are verified for high reliability, binary authenticity, and compliance with ethical security testing standards.
            </p>
          </div>
        </div>

        {/* Right: Dispatch Ticket */}
        <div className="md:col-span-5">
          <div className="p-5 rounded-2xl bg-[#090d16] border border-cyan-500/30">
            <h3 className="text-sm font-mono font-bold text-white mb-2 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>OPEN SUPPORT TICKET</span>
            </h3>
            <p className="text-[11px] font-mono text-slate-400 mb-4">
              Send an inquiry regarding order status, license keys, or technical specifications.
            </p>

            {submittedTicketId ? (
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-center font-mono space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div>
                  <div className="font-bold text-cyan-300 text-xs">TICKET CREATED SUCCESSFULLY</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Reference ID: <span className="text-white font-bold">{submittedTicketId}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSubmittedTicketId(null)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 text-black font-bold text-xs cursor-pointer"
                >
                  Create Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Inquiry Sector</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full bg-black/60 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-cyan-400"
                  >
                    <option value="Payment Verification">Payment Verification</option>
                    <option value="Technical Specifications">Technical Specifications</option>
                    <option value="License Activation Key">License Activation</option>
                    <option value="Enterprise Inquiries">Enterprise & Custom Build</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Subject Header</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Order payment verification inquiry..."
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="w-full bg-black/60 border border-slate-700 rounded-lg p-2 text-slate-200 placeholder-slate-600 focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Message Body</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your inquiry or order details..."
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    className="w-full bg-black/60 border border-slate-700 rounded-lg p-2 text-slate-200 placeholder-slate-600 focus:border-cyan-400 font-sans text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>SUBMIT TICKET</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

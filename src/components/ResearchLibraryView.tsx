import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  X,
  FileText
} from 'lucide-react';

interface ResearchPaper {
  id: string;
  title: string;
  category: string;
  author: string;
  publishedAt: string;
  readTime: string;
  severity?: 'Advisory' | 'Architecture' | 'Benchmark';
  summary: string;
  keyTakeaways: string[];
  body: string[];
}

const RESEARCH_PAPERS: ResearchPaper[] = [
  {
    id: 'res-ebpf-telemetry',
    title: 'Low-Overhead Kernel Observability with eBPF for Cloud Infrastructure',
    category: 'Telemetry & Observability',
    author: 'DEEPSEEK Systems Research Group',
    publishedAt: '2026-04-10',
    readTime: '8 min read',
    severity: 'Architecture',
    summary:
      'Evaluating deterministic ring-buffer telemetry pipelines across multi-tenant Kubernetes clusters while keeping CPU overhead bounded.',
    keyTakeaways: [
      'Zero-copy ring buffers reduce syscall monitoring allocation overhead compared to legacy perf arrays.',
      'Verifier-compliant probe chains allow live policy hot-reloading without kernel module restarts.',
      'OpenTelemetry trace correlation improves lateral movement detection speed.'
    ],
    body: [
      'Modern cloud security operations require high-fidelity visibility into process execution, socket transitions, and namespace mounts without degrading production application latency.',
      'By combining CO-RE (Compile Once – Run Everywhere) BTF type metadata with bounded per-CPU ring buffers, telemetry agents like Global-T capture sub-millisecond system events across heterogeneous Linux kernels.',
      'Teams deploying these pipelines in regulated environments should enforce signed eBPF bytecode manifests and read-only map access controls for non-supervisor workloads.'
    ]
  },
  {
    id: 'res-post-quantum',
    title: 'Post-Quantum Key Encapsulation Migration Checklist for Enterprise HSMs',
    category: 'Cryptographic Security',
    author: 'Applied Cryptography Lab',
    publishedAt: '2026-03-29',
    readTime: '11 min read',
    severity: 'Advisory',
    summary:
      'Practical roadmap for adopting ML-KEM (Kyber) and ML-DSA (Dilithium) hybrid key exchanges alongside FIPS 140-3 hardware security modules.',
    keyTakeaways: [
      'Hybrid X25519 + ML-KEM-768 negotiation preserves backward compatibility during phased upgrades.',
      'PKCS#11 firmware validation should be staged in air-gapped validation clusters prior to key rotation.',
      'Certificate payload sizing requires updated TLS handshake buffer thresholds on edge load balancers.'
    ],
    body: [
      'Long-lived encrypted traffic archives remain exposed to harvest-now, decrypt-later collection strategies unless asymmetric handshakes transition toward lattice-based primitives.',
      'Hybrid deployments pair classical elliptic curve negotiation with NIST-standardized post-quantum mechanisms so security guarantees hold even if one primitive exhibits unexpected weakness.',
      'Using modular cryptographic engines such as Cryptopro allows organizations to audit entropy sources, automate rotation cadences, and verify compliance telemetry continuously.'
    ]
  },
  {
    id: 'res-nvme-sql',
    title: 'Eliminating WAL Write Amplification in High-Throughput Security Audit Databases',
    category: 'Database Infrastructure',
    author: 'Storage Engineering Desk',
    publishedAt: '2026-03-14',
    readTime: '6 min read',
    severity: 'Benchmark',
    summary:
      'Analyzing NVMe flash-cache tiering and atomic write-ahead log pinning for high-ingestion SIEM and compliance telemetry stores.',
    keyTakeaways: [
      'Dedicated PCIe Gen4/Gen5 NVMe WAL partitioning reduces synchronous commit jitter under peak load.',
      'Hot-page pinning prevents background compaction jobs from evicting active index blocks.',
      'ACID checkpoint verification remains intact during abrupt power-loss testing.'
    ],
    body: [
      'Security telemetry lakes and audit ledgers ingest millions of immutable event rows per hour, frequently bottlenecked by sequential write-ahead log (WAL) fsync contention.',
      'Flash-tier acceleration modules isolate synchronous transaction logs onto dedicated low-latency NVMe namespaces while maintaining deterministic crash recovery guarantees.',
      'Structured validation suites confirm substantial tail-latency stabilization across PostgreSQL 16 and MariaDB clusters running continuous threat-hunting queries.'
    ]
  },
  {
    id: 'res-authorized-bas',
    title: 'Designing Safe Continuous Breach & Attack Simulation Guardrails',
    category: 'Security Validation',
    author: 'Defensive Validation Team',
    publishedAt: '2026-02-22',
    readTime: '9 min read',
    severity: 'Architecture',
    summary:
      'Establishing strict authorization scopes, automated rollback controls, and non-destructive telemetry probes for enterprise purple-team exercises.',
    keyTakeaways: [
      'Every automated validation campaign requires cryptographically signed scope manifests.',
      'Synthetic test artifacts must clean up deterministically within bounded execution windows.',
      'Mapping validation outputs directly to SIEM/EDR rule IDs eliminates alert blind spots.'
    ],
    body: [
      'Continuous security validation helps engineering teams confirm that firewall rules, EDR policies, and email filtering controls behave as intended after infrastructure changes.',
      'Unlike ad-hoc testing, enterprise BAS governance requires deterministic telemetry tagging so SOC analysts can distinguish authorized validation drills from genuine anomalies.',
      'Platforms paired with strict allowlists and automatic rollback safeguards enable frequent posture verification without risking production stability.'
    ]
  }
];

export const ResearchLibraryView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [activePaper, setActivePaper] = useState<ResearchPaper | null>(null);

  const topics = ['All', ...Array.from(new Set(RESEARCH_PAPERS.map((p) => p.category)))];

  const filtered = RESEARCH_PAPERS.filter((paper) => {
    if (selectedTopic !== 'All' && paper.category !== selectedTopic) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        paper.title.toLowerCase().includes(q) ||
        paper.summary.toLowerCase().includes(q) ||
        paper.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="pb-5 border-b border-[#1E2936] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00D69A] mb-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>DEEPSEEK RESEARCH LIBRARY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F4F7F6]">
            Security Research &amp; Advisories
          </h1>
          <p className="text-xs sm:text-sm text-[#8F9CA8] mt-1 max-w-2xl">
            Peer-reviewed defensive architecture briefings, cryptographic migration guides, and infrastructure engineering papers.
          </p>
        </div>
        <span className="text-xs font-mono text-[#8F9CA8] tabular-nums">
          {filtered.length} Publications
        </span>
      </div>

      <div className="p-4 rounded-xl bg-[#11161D] border border-[#1E2936] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8F9CA8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search research briefings, topics..."
            className="w-full rounded-lg bg-[#0D1116] border border-[#1E2936] pl-9 pr-4 py-2 text-xs text-[#F4F7F6] placeholder-[#8F9CA8] focus:border-[#00D69A] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                selectedTopic === topic
                  ? 'bg-[#00D69A]/15 border-[#00D69A] text-[#00D69A]'
                  : 'bg-[#0D1116] border-[#1E2936] text-[#8F9CA8] hover:text-[#F4F7F6]'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((paper) => (
          <article
            key={paper.id}
            onClick={() => setActivePaper(paper)}
            className="p-6 rounded-xl bg-[#11161D] border border-[#1E2936] hover:border-[#00D69A]/55 transition-all cursor-pointer flex flex-col justify-between gap-4 shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between gap-2 text-[11px] font-mono mb-3">
                <span className="text-[#00D69A] font-semibold">{paper.category}</span>
                <span className={paper.severity === 'Advisory' ? 'text-[#E5B84B]' : 'text-[#8F9CA8]'}>
                  {paper.severity}
                </span>
              </div>

              <h2 className="text-lg font-bold text-[#F4F7F6] hover:text-[#00D69A] transition-colors mb-2.5 leading-snug">
                {paper.title}
              </h2>

              <p className="text-xs text-[#8F9CA8] leading-relaxed mb-4">
                {paper.summary}
              </p>
            </div>

            <div className="pt-4 border-t border-[#1E2936] flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-[#8F9CA8] font-mono text-[11px] tabular-nums">
                <span>{paper.publishedAt}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {paper.readTime}
                </span>
              </div>
              <span className="text-[#00D69A] font-semibold flex items-center gap-1">
                <span>Read Briefing</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </article>
        ))}
      </div>

      {activePaper && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#11161D] border border-[#1E2936] rounded-xl max-w-2xl w-full p-6 sm:p-8 relative max-h-[88vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setActivePaper(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#0D1116] border border-[#1E2936] text-[#8F9CA8] hover:text-[#F4F7F6] cursor-pointer"
              aria-label="Close reader"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#00D69A] mb-2">
              <FileText className="w-3.5 h-3.5" />
              <span>{activePaper.category}</span>
              <span className="text-[#1E2936]">|</span>
              <span className="text-[#8F9CA8] tabular-nums">{activePaper.publishedAt}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#F4F7F6] mb-2 pr-8">
              {activePaper.title}
            </h2>
            <p className="text-xs text-[#8F9CA8] mb-6">
              Published by {activePaper.author} · {activePaper.readTime}
            </p>

            <div className="p-4 rounded-lg bg-[#0D1116] border border-[#1E2936] mb-6">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#00D69A] mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Key Findings</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-[#F4F7F6]/90 list-disc list-inside">
                {activePaper.keyTakeaways.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 text-sm text-[#8F9CA8] leading-relaxed">
              {activePaper.body.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

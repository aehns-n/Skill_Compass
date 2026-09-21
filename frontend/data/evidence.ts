export interface EvidenceItem {
  source: string;
  detail: string;
  result: string;
  weight?: string;
  verificationStatus: "VERIFIED" | "IN_PROGRESS" | "SYSTEM_AUDITED";
}

export interface CalculationBreakdown {
  formula: string;
  items: { metric: string; value: string; impact: string }[];
}

export interface EvidenceRecord {
  competencyId: string;
  headline: string;
  score: number;
  items: EvidenceItem[];
  breakdown: CalculationBreakdown;
  note: string;
  methodology: string;
}

// ---------------------------------------------------------------------------
// 1. Cybersecurity Analyst / Engineer Evidence Sets
// ---------------------------------------------------------------------------

export const cyberEvidence: EvidenceRecord = {
  competencyId: "22222222-2222-2222-2222-222222222201",
  headline: "Network & OS Fundamentals — 28% (Diagnostic Assessment Baseline)",
  score: 28,
  items: [
    {
      source: "Diagnostic Assessment",
      detail: "TCP/IP Protocol Stack & 3-Way Handshake (SYN/ACK)",
      result: "1 / 4 correct (25.0%)",
      weight: "0.35",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Diagnostic Assessment",
      detail: "Linux System Auditing (journalctl, /var/log/auth.log)",
      result: "1 / 3 correct (33.3%)",
      weight: "0.25",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Diagnostic Assessment",
      detail: "Deep Packet Inspection via Wireshark PCAP filters",
      result: "1 / 3 correct (33.3%)",
      weight: "0.25",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Diagnostic Assessment",
      detail: "Core Network Security Services (DNSSEC, TLS 1.3, SSH)",
      result: "0 / 2 correct (0.0%)",
      weight: "0.15",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Prior Training Record",
      detail: "NIST SP 800-61 Rev 2 Incident Handling Fundamentals",
      result: "Completed 18 months ago (Decayed weight)",
      weight: "0.00 (Decayed)",
      verificationStatus: "SYSTEM_AUDITED",
    },
    {
      source: "Assessment Audit Timestamp",
      detail: "Evaluation protocol: SEC-OPS-DIAG-v2 / NIST-800",
      result: "Logged at initial diagnostic baseline run",
      weight: "—",
      verificationStatus: "SYSTEM_AUDITED",
    },
  ],
  breakdown: {
    formula: "Score = Σ(Cybersecurity Subtopic Score × Item Difficulty Weight) × Recency Factor",
    items: [
      { metric: "TCP/IP Handshake & Flags (Difficulty: High)", value: "1/4 = 25.0%", impact: "+8.8 pts" },
      { metric: "Linux Syslog & Systemd (Difficulty: Med)", value: "1/3 = 33.3%", impact: "+8.3 pts" },
      { metric: "Wireshark Packet Dissection (Difficulty: High)", value: "1/3 = 33.3%", impact: "+8.3 pts" },
      { metric: "Final Calibrated Deterministic Score", value: "28.0%", impact: "28 points (Gap: 57 pts)" },
    ],
  },
  note: "Competency scores are derived from empirical question evidence and protocol analysis. AI assists with diagnostic probe generation, while deterministic scoring maintains the immutable evidence ledger.",
  methodology: "Deterministic rule-based scoring engine calibrates question cognitive load against MITRE ATT&CK and NIST SP 800-53 security engineering benchmarks.",
};

export const cyberEvidenceAfter: EvidenceRecord = {
  competencyId: "22222222-2222-2222-2222-222222222201",
  headline: "Network & OS Fundamentals — 84% (Post-Learning Targeted Reassessment)",
  score: 84,
  items: [
    {
      source: "Targeted Reassessment",
      detail: "Grounded TCP/IP & Wireshark PCAP dissection questions",
      result: "5 / 6 correct (83.3% raw)",
      weight: "0.60 (High recency)",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Targeted Reassessment",
      detail: "Linux auth log triage & unauthorized escalation detection",
      result: "4 / 4 correct (100.0%)",
      weight: "0.20",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Interactive Module Completion",
      detail: "Wireshark Packet Analysis & TCP Protocol Inspection Lab",
      result: "100% completed & verified exercises",
      weight: "0.10",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Interactive Module Completion",
      detail: "Linux Security Hardening & Auditd Log Configuration",
      result: "100% verified concepts",
      weight: "0.05",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Historical Baseline Weight",
      detail: "Carried from diagnostic assessment (decayed)",
      result: "3 / 12 items carried",
      weight: "0.05 (Prior baseline)",
      verificationStatus: "SYSTEM_AUDITED",
    },
    {
      source: "Assessment Audit Timestamp",
      detail: "Evaluation protocol: SEC-OPS-TARGET-v2",
      result: "Logged today after targeted learning completion",
      weight: "—",
      verificationStatus: "SYSTEM_AUDITED",
    },
  ],
  breakdown: {
    formula: "Score = (Targeted Reassessment × 0.70) + (Diagnostic Residual × 0.15) + (Practical Lab Verification × 0.15)",
    items: [
      { metric: "Targeted Reassessment (83.3% @ 0.70 weight)", value: "5/6 correct", impact: "+58.3 pts" },
      { metric: "Wireshark Practical Lab Verification", value: "100% completed", impact: "+15.0 pts" },
      { metric: "Linux Hardening Hands-on Lab", value: "100% completed", impact: "+6.5 pts" },
      { metric: "Updated Calibrated Competency", value: "84.0%", impact: "84 points (Benchmark: 85%)" },
    ],
  },
  note: "The updated score blends targeted reassessment results with completed security lab evidence. Deterministic scoring verifies the gap closed from 57 points to 1 point.",
  methodology: "Recency-weighted Bayesian competency update. As targeted assessments demonstrate mastery on previously failed topics, the cybersecurity competency model updates deterministically.",
};

// ---------------------------------------------------------------------------
// 2. Network Engineer Evidence Sets
// ---------------------------------------------------------------------------

export const networkEvidence: EvidenceRecord = {
  competencyId: "22222222-2222-2222-2222-222222222301",
  headline: "Routing & Switching Fundamentals — 32% (Diagnostic Assessment Baseline)",
  score: 32,
  items: [
    {
      source: "Diagnostic Assessment",
      detail: "OSPF Link-State Advertisements (LSA) & SPF calculation",
      result: "1 / 4 correct (25.0%)",
      weight: "0.35",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Diagnostic Assessment",
      detail: "VLAN 802.1Q Trunking & Spanning Tree Protocol (STP)",
      result: "1 / 3 correct (33.3%)",
      weight: "0.30",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Diagnostic Assessment",
      detail: "IPv4/IPv6 Dual-Stack Subnetting & CIDR calculations",
      result: "1 / 3 correct (33.3%)",
      weight: "0.20",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Diagnostic Assessment",
      detail: "BGP Path Vector Routing & AS-Path Filtering",
      result: "0 / 2 correct (0.0%)",
      weight: "0.15",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Assessment Audit Timestamp",
      detail: "Evaluation protocol: NET-ENG-DIAG-v2",
      result: "Logged at initial diagnostic baseline run",
      weight: "—",
      verificationStatus: "SYSTEM_AUDITED",
    },
  ],
  breakdown: {
    formula: "Score = Σ(Networking Subtopic Score × Item Difficulty Weight) × Recency Factor",
    items: [
      { metric: "OSPF Link-State Protocol (Difficulty: High)", value: "1/4 = 25.0%", impact: "+8.8 pts" },
      { metric: "VLAN 802.1Q & STP (Difficulty: High)", value: "1/3 = 33.3%", impact: "+10.0 pts" },
      { metric: "CIDR Subnetting (Difficulty: Med)", value: "1/3 = 33.3%", impact: "+6.7 pts" },
      { metric: "Final Calibrated Deterministic Score", value: "32.0%", impact: "32 points (Gap: 53 pts)" },
    ],
  },
  note: "Network routing and switching competency scores are derived strictly from empirical question evidence and protocol simulations.",
  methodology: "Deterministic rule-based scoring engine calibrates questions against Cisco CCNA/CCNP and IEEE 802 standards.",
};

export const networkEvidenceAfter: EvidenceRecord = {
  competencyId: "22222222-2222-2222-2222-222222222301",
  headline: "Routing & Switching Fundamentals — 82% (Post-Learning Targeted Reassessment)",
  score: 82,
  items: [
    {
      source: "Targeted Reassessment",
      detail: "Grounded OSPF Hello/Dead Timers & Router ID Election",
      result: "5 / 6 correct (83.3% raw)",
      weight: "0.60 (High recency)",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Targeted Reassessment",
      detail: "VLAN Trunking Protocol & STP Root Bridge Election",
      result: "4 / 4 correct (100.0%)",
      weight: "0.20",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Interactive Module Completion",
      detail: "OSPF Multi-Area Routing & Neighbor Adjacency Lab",
      result: "100% completed & verified exercises",
      weight: "0.10",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Interactive Module Completion",
      detail: "VLAN & Trunking IEEE 802.1Q Configuration Lab",
      result: "100% verified concepts",
      weight: "0.05",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Historical Baseline Weight",
      detail: "Carried from diagnostic assessment (decayed)",
      result: "3 / 12 items carried",
      weight: "0.05 (Prior baseline)",
      verificationStatus: "SYSTEM_AUDITED",
    },
    {
      source: "Assessment Audit Timestamp",
      detail: "Evaluation protocol: NET-ENG-TARGET-v2",
      result: "Logged today after targeted learning completion",
      weight: "—",
      verificationStatus: "SYSTEM_AUDITED",
    },
  ],
  breakdown: {
    formula: "Score = (Targeted Reassessment × 0.70) + (Diagnostic Residual × 0.15) + (Practical Lab Verification × 0.15)",
    items: [
      { metric: "Targeted Reassessment (83.3% @ 0.70 weight)", value: "5/6 correct", impact: "+58.3 pts" },
      { metric: "OSPF Routing Practical Simulation Lab", value: "100% completed", impact: "+15.0 pts" },
      { metric: "VLAN Trunking Practical Lab", value: "100% completed", impact: "+4.5 pts" },
      { metric: "Updated Calibrated Competency", value: "82.0%", impact: "82 points (Gap: 3 pts)" },
    ],
  },
  note: "The updated score blends targeted reassessment results with completed network configuration labs. Deterministic scoring verifies the gap closed from 53 points to 3 points.",
  methodology: "Recency-weighted Bayesian competency update for enterprise networking architecture.",
};

// ---------------------------------------------------------------------------
// 3. Data Engineer / SQL Evidence Sets
// ---------------------------------------------------------------------------

export const sqlEvidence: EvidenceRecord = {
  competencyId: "22222222-2222-2222-2222-222222222101",
  headline: "SQL & Data Modeling — 34% (Diagnostic Assessment Baseline)",
  score: 34,
  items: [
    {
      source: "Diagnostic Assessment",
      detail: "Relational Schema Normalization (3NF/BCNF) & ERDs",
      result: "1 / 4 correct (25.0%)",
      weight: "0.35",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Diagnostic Assessment",
      detail: "Analytical SQL Window Functions (DENSE_RANK, LAG/LEAD)",
      result: "1 / 4 correct (25.0%)",
      weight: "0.30",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Diagnostic Assessment",
      detail: "Common Table Expressions (CTEs) & Recursive Queries",
      result: "1 / 2 correct (50.0%)",
      weight: "0.20",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Diagnostic Assessment",
      detail: "Query Execution Plan Cost & B-Tree Index Optimization",
      result: "1 / 2 correct (50.0%)",
      weight: "0.15",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Assessment Audit Timestamp",
      detail: "Evaluation protocol: DATA-ENG-DIAG-v2",
      result: "Logged at initial diagnostic baseline run",
      weight: "—",
      verificationStatus: "SYSTEM_AUDITED",
    },
  ],
  breakdown: {
    formula: "Score = Σ(SQL Topic Score × Item Difficulty Weight) × Recency Factor",
    items: [
      { metric: "Normalization & Schemas (Difficulty: High)", value: "1/4 = 25.0%", impact: "+8.8 pts" },
      { metric: "Window Functions (Difficulty: High)", value: "1/4 = 25.0%", impact: "+7.5 pts" },
      { metric: "CTEs & Subqueries (Difficulty: Med)", value: "1/2 = 50.0%", impact: "+10.0 pts" },
      { metric: "Final Calibrated Deterministic Score", value: "34.0%", impact: "34 points (Gap: 51 pts)" },
    ],
  },
  note: "Data engineering competency scores are calculated from structured assessment evidence and query execution benchmarks.",
  methodology: "Deterministic rule-based scoring engine weights questions by SQL complexity and database normalization rigor.",
};

export const sqlEvidenceAfter: EvidenceRecord = {
  competencyId: "22222222-2222-2222-2222-222222222101",
  headline: "SQL & Data Modeling — 86% (Post-Learning Targeted Reassessment)",
  score: 86,
  items: [
    {
      source: "Targeted Reassessment",
      detail: "Grounded Window Functions (PARTITION BY, ORDER BY, ROWS BETWEEN)",
      result: "5 / 6 correct (83.3% raw)",
      weight: "0.60 (High recency)",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Targeted Reassessment",
      detail: "Star Schema Dimensional Modeling & Surrogate Keys",
      result: "4 / 4 correct (100.0%)",
      weight: "0.20",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Interactive Module Completion",
      detail: "Advanced Analytical SQL & Window Functions Module",
      result: "100% completed & verified exercises",
      weight: "0.10",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Interactive Module Completion",
      detail: "Data Modeling in Third Normal Form & Star Schemas",
      result: "100% verified concepts",
      weight: "0.05",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Historical Baseline Weight",
      detail: "Carried from diagnostic assessment (decayed)",
      result: "4 / 12 items carried",
      weight: "0.05 (Prior baseline)",
      verificationStatus: "SYSTEM_AUDITED",
    },
    {
      source: "Assessment Audit Timestamp",
      detail: "Evaluation protocol: DATA-ENG-TARGET-v2",
      result: "Logged today after learning completion",
      weight: "—",
      verificationStatus: "SYSTEM_AUDITED",
    },
  ],
  breakdown: {
    formula: "Score = (Targeted Reassessment × 0.70) + (Diagnostic Residual × 0.15) + (Practical Verification × 0.15)",
    items: [
      { metric: "Targeted Reassessment (83.3% @ 0.70 weight)", value: "5/6 correct", impact: "+58.3 pts" },
      { metric: "Window Functions Practical Module", value: "100% completed", impact: "+16.5 pts" },
      { metric: "Data Modeling Practical Exercises", value: "100% completed", impact: "+6.0 pts" },
      { metric: "Updated Calibrated Competency", value: "86.0%", impact: "86 points (Threshold: 85%)" },
    ],
  },
  note: "The updated score blends targeted reassessment results with completed SQL modeling labs. Deterministic scoring verifies benchmark attainment.",
  methodology: "Recency-weighted Bayesian competency update for enterprise data architecture.",
};

// ---------------------------------------------------------------------------
// 4. Python Legacy Sets (Retained for Backward Compatibility)
// ---------------------------------------------------------------------------

export const pythonEvidence: EvidenceRecord = {
  competencyId: "python",
  headline: "Python / Data Science — 34% (Diagnostic Assessment Baseline)",
  score: 34,
  items: [
    {
      source: "Diagnostic Assessment",
      detail: "Overall Python battery (12 total items)",
      result: "4 / 12 correct (33.3% raw)",
      weight: "0.45",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Diagnostic Assessment",
      detail: "Data Cleaning & Transformation subtopic",
      result: "2 / 6 correct (33.3%)",
      weight: "0.25",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Diagnostic Assessment",
      detail: "Pandas DataFrame operations",
      result: "1 / 4 correct (25.0%)",
      weight: "0.20",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Diagnostic Assessment",
      detail: "General Python syntax & control flow",
      result: "1 / 2 correct (50.0%)",
      weight: "0.10",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Prior Training Record",
      detail: "Introductory Python for Public Servants (Completed 14 months ago)",
      result: "Completed 14 months ago (Decayed weight)",
      weight: "0.00 (Decayed)",
      verificationStatus: "SYSTEM_AUDITED",
    },
    {
      source: "Assessment Audit Timestamp",
      detail: "Evaluation protocol: PY-DATA-DIAG-v2",
      result: "Logged today at initial baseline run",
      weight: "—",
      verificationStatus: "SYSTEM_AUDITED",
    },
  ],
  breakdown: {
    formula: "Score = Σ(Topic Score × Question Difficulty Weight) × Recency Factor",
    items: [
      { metric: "Data Cleaning (Difficulty: Med-High)", value: "2/6 = 33.3%", impact: "+11.2 pts" },
      { metric: "Pandas Operations (Difficulty: High)", value: "1/4 = 25.0%", impact: "+8.4 pts" },
      { metric: "Syntax & Control Flow (Difficulty: Low)", value: "1/2 = 50.0%", impact: "+14.4 pts" },
      { metric: "Final Calibrated Deterministic Score", value: "34.0%", impact: "34 points" },
    ],
  },
  note: "Competency scores are calculated from structured assessment evidence. AI assists with question generation, while deterministic logic calculates and tracks numerical competency.",
  methodology: "Deterministic rule-based scoring engine weights questions by calibrated cognitive difficulty.",
};

export const pythonEvidenceAfter: EvidenceRecord = {
  competencyId: "python",
  headline: "Python / Data Science — 72% (Post-Learning Targeted Reassessment)",
  score: 72,
  items: [
    {
      source: "Targeted Reassessment",
      detail: "Data Handling & Pandas grounded questions (6 items)",
      result: "5 / 6 correct (83.3% raw)",
      weight: "0.60 (High recency)",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Targeted Reassessment",
      detail: "Pandas grouping & aggregation items",
      result: "4 / 4 correct (100.0%)",
      weight: "0.25",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Interactive Module Completion",
      detail: "Python: Data Handling / Data Cleaning with Pandas",
      result: "100% completed & verified exercises",
      weight: "0.15",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Interactive Module Completion",
      detail: "Python Fundamentals Module",
      result: "100% verified concepts",
      weight: "0.00 (Prerequisite gate cleared)",
      verificationStatus: "VERIFIED",
    },
    {
      source: "Historical Baseline Weight",
      detail: "Carried from diagnostic assessment (decayed)",
      result: "4 / 12 items carried",
      weight: "0.15 (Prior baseline)",
      verificationStatus: "SYSTEM_AUDITED",
    },
    {
      source: "Assessment Audit Timestamp",
      detail: "Evaluation protocol: PY-DATA-TARGET-v2",
      result: "Logged today after learning completion",
      weight: "—",
      verificationStatus: "SYSTEM_AUDITED",
    },
  ],
  breakdown: {
    formula: "Score = (Targeted Reassessment × 0.70) + (Diagnostic Residual × 0.15) + (Practical Verification × 0.15)",
    items: [
      { metric: "Targeted Reassessment (83.3% @ 0.70 weight)", value: "5/6 correct", impact: "+58.3 pts" },
      { metric: "Interactive Module Practical Verification", value: "100% completed", impact: "+8.6 pts" },
      { metric: "Diagnostic Baseline Residual (34% @ 0.15 weight)", value: "Prior evidence", impact: "+5.1 pts" },
      { metric: "Updated Calibrated Competency", value: "72.0%", impact: "72 points (+38)" },
    ],
  },
  note: "The updated score blends targeted reassessment results with prior evidence. Deterministic scoring verifies the gap reduction against role requirements.",
  methodology: "Recency-weighted Bayesian competency update.",
};

// ---------------------------------------------------------------------------
// 5. Dynamic Role & Competency Resolver
// ---------------------------------------------------------------------------

export function getEvidenceForRoleAndCompetency(params: {
  roleId?: string | null;
  competencyId?: string | null;
  competencyName?: string | null;
  after?: boolean;
  score?: number;
  beforeScore?: number;
  targetScore?: number;
}): EvidenceRecord {
  const { roleId, competencyId, competencyName, after = false, score } = params;

  // Determine domain
  const isCyber =
    roleId === "11111111-1111-1111-1111-111111111102" ||
    (competencyId && competencyId.startsWith("22222222-2222-2222-2222-2222222222")) ||
    (competencyName && /security|cyber|network & os|siem|threat|forensics|iam|vulnerability/i.test(competencyName));

  const isNetwork =
    roleId === "11111111-1111-1111-1111-111111111103" ||
    (competencyId && competencyId.startsWith("22222222-2222-2222-2222-2222222223")) ||
    (competencyName && /routing|switching|network infra|hardware|automation|sd-wan|monitoring/i.test(competencyName));

  let baseRecord: EvidenceRecord;

  if (isCyber) {
    baseRecord = after ? cyberEvidenceAfter : cyberEvidence;
  } else if (isNetwork) {
    baseRecord = after ? networkEvidenceAfter : networkEvidence;
  } else {
    // Default Data Engineer / SQL
    const isPythonSkill = competencyName && /python/i.test(competencyName);
    if (isPythonSkill) {
      baseRecord = after ? pythonEvidenceAfter : pythonEvidence;
    } else {
      baseRecord = after ? sqlEvidenceAfter : sqlEvidence;
    }
  }

  // Clone and adapt if custom score or competencyName provided
  const displayComp = competencyName || baseRecord.headline.split(" — ")[0];
  const displayScore = score ?? baseRecord.score;
  const headlineSuffix = after
    ? "Post-Learning Targeted Reassessment"
    : "Diagnostic Assessment Baseline";

  return {
    ...baseRecord,
    competencyId: competencyId || baseRecord.competencyId,
    headline: `${displayComp} — ${displayScore}% (${headlineSuffix})`,
    score: displayScore,
  };
}

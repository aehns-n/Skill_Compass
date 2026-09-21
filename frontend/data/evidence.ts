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

export const pythonEvidence: EvidenceRecord = {
  competencyId: "python",
  headline: "Python — 34% (Diagnostic Assessment Baseline)",
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
      detail: "iGOT Karmayogi / Ministry Portal",
      result: "Introductory Python for Public Servants (Completed 14 months ago)",
      weight: "0.00 (Decayed)",
      verificationStatus: "SYSTEM_AUDITED",
    },
    {
      source: "Assessment Audit Timestamp",
      detail: "Evaluation protocol: MoSPI-STAT-DIAG-v2",
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
  note: "Competency scores are calculated from structured assessment evidence. AI assists with question generation and explanation, while deterministic logic calculates and tracks numerical competency.",
  methodology: "Deterministic rule-based scoring engine weights questions by calibrated cognitive difficulty and penalizes obsolete training records with time-decay functions.",
};

export const pythonEvidenceAfter: EvidenceRecord = {
  competencyId: "python",
  headline: "Python — 72% (Post-Learning Targeted Reassessment)",
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
      detail: "Evaluation protocol: MoSPI-STAT-TARGET-v2",
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
  note: "The updated score blends targeted reassessment results with prior evidence. Deterministic scoring verifies the gap closed from 41 points to 3 points against the 75% requirement.",
  methodology: "Recency-weighted Bayesian competency update. As targeted assessments demonstrate mastery on previously failed topics, the competency model updates deterministically with full provenance.",
};


export type Tier = "NOVICE" | "DEVELOPING" | "PROFICIENT" | "MASTER";

export interface Competency {
  id: string;
  name: string;
  category: "Technical" | "Statistics" | "Professional" | "Domain";
  description: string;
}

export interface RoleRequirement {
  competencyId: string;
  required: number;
  priority: "HIGH" | "MEDIUM" | "LOW" | "NONE";
  benchmarkRationale: string;
}

export interface Role {
  id: string;
  title: string;
  department: string;
  description: string;
  summary: string;
  requirements: RoleRequirement[];
}

export const competencies: Competency[] = [
  {
    id: "python",
    name: "Python",
    category: "Technical",
    description: "Scripting, survey data extraction, pandas DataFrame transformations, and reproducible pipelines.",
  },
  {
    id: "sampling",
    name: "Sampling",
    category: "Statistics",
    description: "Sample frame design, stratified/cluster sampling, survey weights, and design effect calculations.",
  },
  {
    id: "visualization",
    name: "Data Visualization",
    category: "Technical",
    description: "Communicating official indicators via charts, maps, dashboards, and publication-ready graphics.",
  },
  {
    id: "sql",
    name: "SQL",
    category: "Technical",
    description: "Querying census & survey databases, complex joins, aggregations, and data validation routines.",
  },
  {
    id: "data-cleaning",
    name: "Data Cleaning",
    category: "Technical",
    description: "Anomaly detection, missing value imputation, sentinel code resolution, and deduplication.",
  },
  {
    id: "stat-fundamentals",
    name: "Statistical Fundamentals",
    category: "Statistics",
    description: "Measures of central tendency, dispersion, hypothesis testing, confidence intervals, and variance.",
  },
  {
    id: "advanced-stats",
    name: "Advanced Statistical Analysis",
    category: "Statistics",
    description: "Multivariate regression, time-series forecasting, survey inference, and econometric modeling.",
  },
  {
    id: "reporting",
    name: "Report Writing & Dissemination",
    category: "Professional",
    description: "Drafting official bulletins, metadata documentation, and executive summaries for policymakers.",
  },
];

export const roles: Role[] = [
  {
    id: "statistical-officer",
    title: "Statistical Officer",
    department: "Ministry of Statistics & Programme Implementation (MoSPI)",
    description:
      "Responsible for survey design, automated microdata processing, sampling validation, and publishing official national indicators. The central demonstration scenario for SkillCompass.",
    summary:
      "Core operational backbone for modern survey processing. Requires strong programming pipelines in Python alongside rigorous survey sampling.",
    requirements: [
      {
        competencyId: "python",
        required: 75,
        priority: "HIGH",
        benchmarkRationale: "Critical for automated data pipelines, quality checks, and replacing manual spreadsheet processing.",
      },
      {
        competencyId: "sampling",
        required: 80,
        priority: "MEDIUM",
        benchmarkRationale: "Core statistical function for designing stratified national sample frames and applying weights.",
      },
      {
        competencyId: "visualization",
        required: 70,
        priority: "MEDIUM",
        benchmarkRationale: "Necessary for creating accessible dashboards and reports for policy analysts.",
      },
      {
        competencyId: "sql",
        required: 70,
        priority: "NONE",
        benchmarkRationale: "Required for querying official microdata registries; candidate already meets this threshold.",
      },
    ],
  },
  {
    id: "field-surveyor",
    title: "Field Survey Supervisor",
    department: "National Sample Survey Office (NSSO)",
    description:
      "Coordinates primary field enumeration, verifies respondent coverage, manages CAPI/CAWI data capture, and conducts preliminary validation.",
    summary:
      "Focuses on field data capture integrity, sampling frame adherence, and on-ground discrepancy resolution.",
    requirements: [
      {
        competencyId: "sampling",
        required: 75,
        priority: "HIGH",
        benchmarkRationale: "Essential for verifying household selection protocols and preventing non-sampling bias.",
      },
      {
        competencyId: "stat-fundamentals",
        required: 65,
        priority: "MEDIUM",
        benchmarkRationale: "Needed for understanding field error rates and standard deviation thresholds.",
      },
      {
        competencyId: "reporting",
        required: 70,
        priority: "MEDIUM",
        benchmarkRationale: "Crucial for transmitting incident and non-response reports from the field.",
      },
    ],
  },
  {
    id: "data-analyst",
    title: "Statistical Data Analyst",
    department: "National Statistical Systems Directorate",
    description:
      "Performs deep statistical analytics, cross-survey triangulations, automated dashboards, and ad-hoc analytical briefs.",
    summary:
      "High-computational role requiring advanced Python data pipelines and enterprise database querying.",
    requirements: [
      {
        competencyId: "python",
        required: 85,
        priority: "HIGH",
        benchmarkRationale: "High proficiency needed for complex pandas wrangling, feature engineering, and modeling.",
      },
      {
        competencyId: "sql",
        required: 80,
        priority: "HIGH",
        benchmarkRationale: "Critical for multi-table analytical joins across historical survey databases.",
      },
      {
        competencyId: "visualization",
        required: 75,
        priority: "MEDIUM",
        benchmarkRationale: "Essential for communicating statistical findings directly to ministry leadership.",
      },
    ],
  },
];

export const competencyById = (id: string) =>
  competencies.find((c) => c.id === id);

export const tierFor = (score: number): Tier =>
  score < 40 ? "NOVICE" : score < 70 ? "DEVELOPING" : score < 90 ? "PROFICIENT" : "MASTER";

export const gapFor = (required: number, current: number) =>
  Math.max(0, required - current);

/**
 * Prototype thresholds — synthetic/representative demo values,
 * NOT official government standards.
 */
export const PROTOTYPE_NOTICE =
  "All competency thresholds and scores in this prototype are synthetic/representative demo values, not official government standards.";


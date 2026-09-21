export interface GraphNode {
  id: string;
  label: string;
  category: "foundation" | "intermediate" | "advanced";
  score?: number; // current learner score, if assessed
  requiredScore?: number;
  status: "weak_blocking" | "adequate" | "gated" | "ready";
  description: string;
  prerequisites: string[];
}

export interface GraphEdge {
  from: string;
  to: string;
  type: "direct_prerequisite" | "methodological_foundation";
  description: string;
}

export const graphNodes: GraphNode[] = [
  {
    id: "python",
    label: "Python",
    category: "foundation",
    score: 34,
    requiredScore: 75,
    status: "weak_blocking",
    description: "Fundamental programming syntax, data structures, and script automation for survey microdata.",
    prerequisites: [],
  },
  {
    id: "stat-fundamentals",
    label: "Statistical Fundamentals",
    category: "foundation",
    score: 66,
    requiredScore: 65,
    status: "adequate",
    description: "Measures of central tendency, variance, probability distributions, and basic inference.",
    prerequisites: [],
  },
  {
    id: "sampling",
    label: "Sampling",
    category: "foundation",
    score: 62,
    requiredScore: 80,
    status: "weak_blocking",
    description: "Sampling frames, stratified multi-stage selection, non-response weights, and variance estimation.",
    prerequisites: [],
  },
  {
    id: "visualization",
    label: "Visualization",
    category: "foundation",
    score: 48,
    requiredScore: 70,
    status: "weak_blocking",
    description: "Visual encoding of statistical indicators, map layers, distributions, and publication figures.",
    prerequisites: [],
  },
  {
    id: "data-cleaning",
    label: "Data Cleaning",
    category: "intermediate",
    requiredScore: 70,
    status: "gated",
    description: "Pandas DataFrame transformations, missing code imputation (-999), outlier filtering, and schema validation.",
    prerequisites: ["python"],
  },
  {
    id: "advanced-stats",
    label: "Advanced Statistical Analysis",
    category: "advanced",
    requiredScore: 75,
    status: "gated",
    description: "Multivariate regression, survey-weighted econometrics, cross-tabulation modeling, and hypothesis testing on clean survey data.",
    prerequisites: ["data-cleaning", "stat-fundamentals", "sampling", "visualization"],
  },
];

export const graphEdges: GraphEdge[] = [
  {
    from: "python",
    to: "data-cleaning",
    type: "direct_prerequisite",
    description: "Must master Python syntax, control flow, and data structures before handling pandas DataFrames and survey cleaning scripts.",
  },
  {
    from: "data-cleaning",
    to: "advanced-stats",
    type: "direct_prerequisite",
    description: "Advanced statistical modeling requires verified, clean, non-sentinel microdata inputs.",
  },
  {
    from: "stat-fundamentals",
    to: "advanced-stats",
    type: "methodological_foundation",
    description: "Provides theoretical grounding for interpreting regression coefficients, p-values, and standard errors.",
  },
  {
    from: "sampling",
    to: "advanced-stats",
    type: "methodological_foundation",
    description: "Required to incorporate sampling weights, cluster primary sampling units (PSUs), and design effects into models.",
  },
  {
    from: "visualization",
    to: "advanced-stats",
    type: "methodological_foundation",
    description: "Essential for exploratory data inspection and communicating complex multi-variable interactions.",
  },
];


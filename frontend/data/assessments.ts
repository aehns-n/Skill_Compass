export interface Question {
  id: string;
  competencyId: string;
  topic: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  groundingLesson?: string;
  difficulty?: "Foundational" | "Intermediate" | "Advanced";
}

export const diagnosticQuestions: Question[] = [
  {
    id: "dq1",
    competencyId: "python",
    topic: "Python — Data Structures",
    difficulty: "Foundational",
    prompt:
      "Which Python data structure is most appropriate for counting occurrences of categorical codes in an official survey stream of 50,000 responses?",
    options: [
      "A set, because duplicates are removed automatically",
      "A dictionary with category code keys and integer frequency counts",
      "A tuple of (category, count) pairs sorted alphabetically",
      "A nested list of booleans, one per enumerated respondent",
    ],
    correctIndex: 1,
    explanation:
      "Dictionaries (or collections.Counter) provide O(1) key lookups and mutable frequency counters, making them optimal for frequency tables across categorical codes.",
  },
  {
    id: "dq2",
    competencyId: "python",
    topic: "Python — Pandas Grouping",
    difficulty: "Intermediate",
    prompt:
      "In pandas, which vectorized operation computes the average household income per district across a DataFrame of survey records?",
    options: [
      "df.groupby('district')['income'].mean()",
      "df.sort_values('district').mean()",
      "df.pivot('income', 'district')",
      "df['income'].apply(len)",
    ],
    correctIndex: 0,
    explanation:
      "df.groupby('district')['income'].mean() applies split-apply-combine to compute column averages across distinct district strata without slow Python loops.",
  },
  {
    id: "dq3",
    competencyId: "python",
    topic: "Python — Sentinel Code Handling",
    difficulty: "Intermediate",
    prompt:
      "A field cleaning script must detect sentinel non-response codes (-999) or NaN values in respondent age columns. Which snippet handles this safely?",
    options: [
      "if row.age == NaN: continue",
      "if not row.age: pass",
      "if pd.isna(row.age) or row.age == -999: continue",
      "try: row.age except: skip",
    ],
    correctIndex: 2,
    explanation:
      "pd.isna() is required because IEEE 754 NaN != NaN in Python. Sentinel values like -999 must also be explicitly intercepted before statistical processing.",
  },
  {
    id: "dq4",
    competencyId: "python",
    topic: "Python — Modular Functions",
    difficulty: "Foundational",
    prompt:
      "What does the following survey weight accumulator return for compute_total([2, 3, 5])?\n\ndef compute_total(values):\n    total = 0\n    for v in values:\n        total += v\n    return total",
    options: ["5", "10", "25", "A generator object"],
    correctIndex: 1,
    explanation:
      "The accumulator function loops over each element, summing 2 + 3 + 5 = 10, and returns an integer scalar.",
  },
  {
    id: "dq5",
    competencyId: "python",
    topic: "Python — Exception Handling",
    difficulty: "Intermediate",
    prompt:
      "Which construct allows a batch microdata ingestion pipeline to log malformed CSV records without terminating the entire import job?",
    options: [
      "assert row.is_valid()",
      "try / except (ValueError, KeyError) as e: log_anomaly(e)",
      "global exception filter in sys.excepthook",
      "raise SystemExit on unexpected column types",
    ],
    correctIndex: 1,
    explanation:
      "Local try-except blocks around row-parsing logic isolate anomalies to specific rows, allowing corrupt records to be quarantined while clean data continues processing.",
  },
  {
    id: "dq6",
    competencyId: "python",
    topic: "Python — List Comprehensions",
    difficulty: "Foundational",
    prompt:
      "Which Python comprehension filters an enumerated list of household sizes to extract only even, non-zero values squared?",
    options: [
      "[x**2 for x in sizes if x % 2 == 0 and x > 0]",
      "[x**2 in sizes for x even]",
      "squares(sizes.where(even))",
      "[x^2 for x in sizes if x/2]",
    ],
    correctIndex: 0,
    explanation:
      "List comprehension syntax [expr for item in iterable if condition] correctly squares values where x % 2 == 0 and x > 0.",
  },
  {
    id: "dq7",
    competencyId: "sampling",
    topic: "Sampling — Frame Coverage Bias",
    difficulty: "Intermediate",
    prompt:
      "An official socio-economic survey samples only households with registered broadband landline connections. What is the primary methodological risk?",
    options: [
      "Coverage/Selection bias — the sampling frame systematically excludes lower-income rural households",
      "Increased random sampling variance only",
      "Zero risk provided the nominal sample size exceeds N=10,000",
      "Interviewer cognitive bias during administration",
    ],
    correctIndex: 0,
    explanation:
      "Sampling frame undercoverage cannot be fixed by increasing sample size; if systematic segments of the target population cannot be drawn, estimates suffer incurable selection bias.",
  },
  {
    id: "dq8",
    competencyId: "sampling",
    topic: "Sampling — Stratified Selection",
    difficulty: "Intermediate",
    prompt:
      "When is stratified random sampling preferred over simple random sampling (SRS) in national household surveys?",
    options: [
      "When the population consists of heterogeneous sub-populations with homogeneous internal characteristics (e.g. urban vs rural)",
      "Only when fieldwork budgets are completely unlimited",
      "When response rates are guaranteed to be 100%",
      "When collecting purely qualitative anecdotal evidence",
    ],
    correctIndex: 0,
    explanation:
      "Stratification reduces sampling variance by grouping homogeneous units into strata, guaranteeing representation for small minority sub-populations (such as tribal or remote districts).",
  },
  {
    id: "dq9",
    competencyId: "sampling",
    topic: "Sampling — Survey Weights",
    difficulty: "Advanced",
    prompt:
      "Survey design weights (inverse probability weights) are applied in microdata analysis primarily to:",
    options: [
      "Arbitrarily inflate respondent counts to match round numbers",
      "Correct for unequal selection probabilities across clusters and restore unbiased population estimates",
      "Impute missing expenditure values using machine learning",
      "Convert raw survey counts into percentage formats",
    ],
    correctIndex: 1,
    explanation:
      "In multi-stage cluster sampling, units often have unequal probabilities of selection. Applying inverse probability weights ensures each sample unit represents its true population share.",
  },
  {
    id: "dq10",
    competencyId: "sampling",
    topic: "Sampling — Design Effect (Deff)",
    difficulty: "Advanced",
    prompt:
      "Cluster sampling in official surveys typically yields a Design Effect (Deff) greater than 1.0. This indicates that:",
    options: [
      "The effective sample size is smaller than the nominal sample size due to intra-cluster correlation",
      "The point estimates are mathematically biased",
      "The survey is self-weighting and requires no post-stratification",
      "Sampling confidence intervals shrink compared to simple random sampling",
    ],
    correctIndex: 0,
    explanation:
      "Deff = Var(complex) / Var(SRS). Because households within the same village or block tend to be similar (intra-cluster correlation), clustering increases variance, meaning effective sample size n_eff = n / Deff.",
  },
  {
    id: "dq11",
    competencyId: "visualization",
    topic: "Data Visualization — Indicator Trends",
    difficulty: "Foundational",
    prompt:
      "Which chart format best communicates the multi-year trajectory of the Labour Force Participation Rate across 15 consecutive quarters?",
    options: [
      "A 3D pie chart with exploded slices",
      "A continuous time-series line chart with labeled benchmark points",
      "A word cloud sized by quarterly growth rate",
      "A circular radar diagram with 15 radial vertices",
    ],
    correctIndex: 1,
    explanation:
      "Line charts provide an unbroken Cartesian axis mapping time continuously to position, making trends, inflection points, and seasonality instantly recognizable.",
  },
  {
    id: "dq12",
    competencyId: "visualization",
    topic: "Data Visualization — Scale Integrity",
    difficulty: "Intermediate",
    prompt:
      "Truncating the vertical baseline (non-zero origin) on an official bar chart comparing district poverty rates is considered poor practice because:",
    options: [
      "Bar length encodes numerical magnitude visually; truncating the baseline distorts proportional comparisons",
      "It requires higher ink consumption during printing",
      "It obscures the citation of the data source",
      "It is acceptable as long as asterisks are present in footnotes",
    ],
    correctIndex: 0,
    explanation:
      "Human perception reads bar charts by comparing the total physical length of bars. Non-zero baselines exaggerate tiny relative differences, misleading public policy decisions.",
  },
  {
    id: "dq13",
    competencyId: "sql",
    topic: "SQL — Strata Aggregation",
    difficulty: "Foundational",
    prompt:
      "Which SQL query returns the total number of enumerated households per administrative region from the microdata registry?",
    options: [
      "SELECT region, COUNT(*) AS total_hh FROM households GROUP BY region;",
      "SELECT region FROM households WHERE COUNT(*) > 1;",
      "SELECT SUM(region) FROM households;",
      "SELECT region, AVG(*) FROM households ORDER BY region;",
    ],
    correctIndex: 0,
    explanation:
      "GROUP BY region alongside COUNT(*) aggregates raw rows into distinct regional counts efficiently.",
  },
  {
    id: "dq14",
    competencyId: "sql",
    topic: "SQL — Relational Integrity",
    difficulty: "Intermediate",
    prompt:
      "To retain all surveyed households in the result even when an associated household expenditure record is missing in a secondary table, use:",
    options: [
      "INNER JOIN",
      "LEFT JOIN from households to expenditure",
      "CROSS JOIN",
      "UNION ALL",
    ],
    correctIndex: 1,
    explanation:
      "A LEFT JOIN preserves every row from the primary household registry table while joining matching rows from the expenditure table and filling unmatched rows with NULL.",
  },
];

/** Targeted reassessment — grounded in the Python Data Handling learning material. */
export const targetedQuestions: Question[] = [
  {
    id: "tq1",
    competencyId: "python",
    topic: "Python — Sentinel Code Imputation",
    difficulty: "Intermediate",
    groundingLesson: "Lesson 1: Sentinel Value Imputation & Missing Data",
    prompt:
      "In the survey cleaning lesson, which pandas method correctly replaces the survey non-response sentinel code -999 in 'monthly_income' with the column's valid median?",
    options: [
      "df['monthly_income'].drop(-999)",
      "df['monthly_income'].replace(-999, df['monthly_income'][df['monthly_income'] != -999].median())",
      "df.filter(monthly_income = -999)",
      "df.median(monthly_income, -999)",
    ],
    correctIndex: 1,
    explanation:
      "Grounded in Lesson 1: To prevent the sentinel code -999 from contaminating the median calculation, filter out -999 when computing the median, then use .replace() or .fillna().",
  },
  {
    id: "tq2",
    competencyId: "python",
    topic: "Python — Datetime Type Coercion",
    difficulty: "Intermediate",
    groundingLesson: "Lesson 3: Safe Numeric Coercion & String Sanitization",
    prompt:
      "According to the survey preprocessing guidelines, why must interview timestamp strings be converted with pd.to_datetime() prior to analysis?",
    options: [
      "To compress CSV storage size by 80%",
      "To enable time-based grouping, quarterly resampling, and interview duration delta calculations",
      "Because Python dictionaries cannot store string timestamps",
      "To automatically remove duplicate household records",
    ],
    correctIndex: 1,
    explanation:
      "Grounded in Lesson 3: Datetime objects expose .dt accessors, facilitating interview duration audits, monthly trends, and survey wave synchronizations.",
  },
  {
    id: "tq3",
    competencyId: "python",
    topic: "Python — Groupby & Ranking",
    difficulty: "Intermediate",
    groundingLesson: "Lesson 4: District-Level Split-Apply-Combine Aggregations",
    prompt:
      "Which pandas snippet computes the average household income per district and ranks districts from highest to lowest?",
    options: [
      "df.groupby('district')['income_num'].mean().sort_values(ascending=False)",
      "df.mean('district', 'income_num').sort()",
      "df.sort_values('income_num').groupby('district')",
      "df.pivot_table('district').mean()",
    ],
    correctIndex: 0,
    explanation:
      "Grounded in Lesson 4: .groupby('district')['income_num'].mean() aggregates values by district, and .sort_values(ascending=False) orders them in descending order for official league tables.",
  },
  {
    id: "tq4",
    competencyId: "python",
    topic: "Python — Deduplication on Composite Keys",
    difficulty: "Intermediate",
    groundingLesson: "Lesson 2: Duplicate Resolution Across Primary Sampling Units",
    prompt:
      "The survey quality checklist prescribes that duplicate respondent entries must be audited and pruned using which pandas workflow?",
    options: [
      "Ignore duplicates because pandas handles them automatically during indexing",
      "Audit duplicates via df.duplicated(subset=['district', 'hh_id']), review audit log, then call drop_duplicates()",
      "Delete every alternating row across the entire dataset",
      "Sort by respondent ID and drop all null entries",
    ],
    correctIndex: 1,
    explanation:
      "Grounded in Lesson 2: Deduplication requires specifying the composite primary key subset=['district', 'hh_id'] to avoid dropping legitimately identical responses from different enumeration blocks.",
  },
  {
    id: "tq5",
    competencyId: "python",
    topic: "Python — Robust Central Tendency",
    difficulty: "Intermediate",
    groundingLesson: "Lesson 1: Robust Central Tendency Under Skewed Data",
    prompt:
      "When analyzing right-skewed household agricultural asset microdata with high-net-worth outliers, which summary statistic is mathematically robust?",
    options: [
      "Arithmetic mean",
      "Median (50th percentile)",
      "Maximum observation",
      "Cumulative sum",
    ],
    correctIndex: 1,
    explanation:
      "Grounded in Lesson 1: The median has a 50% breakdown point, remaining unaffected by extreme outliers in heavy-tailed asset distributions.",
  },
  {
    id: "tq6",
    competencyId: "python",
    topic: "Python — Safe Numerical Coercion",
    difficulty: "Intermediate",
    groundingLesson: "Lesson 3: Safe Numeric Coercion & String Sanitization",
    prompt:
      "Which vectorized operation safely converts survey revenue strings containing currency commas (e.g. '45,200') into valid numeric floats without throwing parsing errors on corrupted text?",
    options: [
      "df['rev'].astype(float) directly",
      "pd.to_numeric(df['rev'].astype(str).str.replace(',', ''), errors='coerce')",
      "int(df['rev'])",
      "df['rev'].round(2)",
    ],
    correctIndex: 1,
    explanation:
      "Grounded in Lesson 3: .str.replace(',', '') strips formatting, and pd.to_numeric(errors='coerce') safely coerces unparseable anomalies into NaN rather than crashing the batch pipeline.",
  },
];


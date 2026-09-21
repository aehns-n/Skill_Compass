export interface LessonContent {
  title: string;
  objective: string;
  explanation: string;
  codeSnippet?: string;
  keyTakeaway: string;
}

export interface LearningModule {
  id: string;
  skillId: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  whyRecommended: string;
  prerequisites: string[];
  concepts: string[];
  lessons: LessonContent[];
  content: string[]; // For backwards compatibility
}

export interface LearningPath {
  id: string;
  targetCompetencyId: string;
  title: string;
  rationale: string;
  modules: LearningModule[];
}

export const pythonLearningPath: LearningPath = {
  id: "python-path",
  targetCompetencyId: "python",
  title: "Python for Statistical Officers",
  rationale:
    "Recommended because Python is currently your largest competency gap (41 points) for the Statistical Officer role, and it is an unblockable prerequisite for Data Cleaning and Advanced Statistical Analysis.",
  modules: [
    {
      id: "m1",
      skillId: "python",
      title: "Python Fundamentals",
      description:
        "Core syntax, data structures, functions, and control flow for parsing administrative and survey data files.",
      difficulty: "Beginner",
      duration: "3 hrs",
      whyRecommended:
        "Python is your largest role-relevant gap (34% vs 75% required). Mastering syntax, lists, and dicts is the mandatory foundation before DataFrame operations.",
      prerequisites: [],
      concepts: [
        "Lists, dictionaries, and sets for survey records",
        "Control flow (if/elif/else, loops) for validation",
        "Writing modular functions for repeated checks",
        "Reading and writing CSV/text file streams",
      ],
      lessons: [
        {
          title: "Lesson 1: Survey Records as Python Data Structures",
          objective: "Represent questionnaire responses cleanly in memory.",
          explanation: "In official surveys, each enumerated household is represented as a dictionary where keys represent variable codes (e.g., 'hh_id', 'district', 'income') and values represent respondent answers.",
          codeSnippet: "survey_response = {\n  'hh_id': 'DEL-0149',\n  'district': 'North West',\n  'members': 4,\n  'monthly_expenditure': 28500\n}",
          keyTakeaway: "Dictionaries provide $O(1)$ key lookups for survey variable validation.",
        },
        {
          title: "Lesson 2: Control Flow for Boundary Checks",
          objective: "Filter invalid responses with boolean guards.",
          explanation: "Automate validation rules, such as verifying that age >= 0 and age <= 120, logging anomaly flags instead of halting processing.",
          codeSnippet: "def validate_age(record):\n    return 0 <= record.get('age', -1) <= 120",
          keyTakeaway: "Defensive validation prevents malformed field survey rows from crashing batch scripts.",
        },
      ],
      content: [
        "Lesson 1 — Variables, lists, and dictionaries: represent a survey response as a dictionary of fields.",
        "Lesson 2 — Control flow: filter invalid responses with conditional logic and loops.",
        "Lesson 3 — Functions: wrap repeated cleaning steps into reusable functions.",
        "Lesson 4 — Comprehensions: count response categories in a single expression.",
      ],
    },
    {
      id: "m2",
      skillId: "python",
      title: "Data Handling / Data Cleaning with Pandas",
      description:
        "Load, inspect, and sanitize official microdata using pandas: resolve sentinel codes (-999), handle missing values, deduplicate PSUs, and aggregate indicators.",
      difficulty: "Intermediate",
      duration: "4 hrs",
      whyRecommended:
        "Directly targets the diagnostic weak points you missed (Pandas DataFrame queries, missing values, group aggregations). Completing this module unblocks downstream Statistical Analysis.",
      prerequisites: ["Python Fundamentals"],
      concepts: [
        "DataFrame indexing, slicing, and column vectorization",
        "Sentinel code resolution (e.g. converting -999, 9999 to NaN)",
        "Missing data strategy (imputation vs deletion)",
        "Deduplication & strict data type coercion",
        "Groupby split-apply-combine for district statistics",
      ],
      lessons: [
        {
          title: "Lesson 1: Sentinel Value Imputation & Missing Data",
          objective: "Replace survey non-response codes with column medians.",
          explanation: "Field microdata frequently uses sentinel codes such as -999 or 9999 to represent 'Not Applicable' or 'Refused to Answer'. In pandas, calculating means without sanitizing sentinel codes causes severe negative bias.",
          codeSnippet: "# Identify sentinel codes and replace with column median\nimport pandas as pd\nimport numpy as np\n\ndf['income'] = df['income'].replace(-999, np.nan)\nmedian_val = df['income'].median()\ndf['income'] = df['income'].fillna(median_val)",
          keyTakeaway: "Always inspect sentinel code registries before computing summary statistics.",
        },
        {
          title: "Lesson 2: Duplicate Resolution Across Primary Sampling Units",
          objective: "Identify and eliminate duplicate respondent records.",
          explanation: "Duplicated household entries can distort sample weighting and inflate population estimates. Use df.duplicated() with subset parameters to audit records.",
          codeSnippet: "# Detect duplicates on composite key (district + household_id)\ndups = df.duplicated(subset=['district', 'hh_id'], keep='first')\nclean_df = df.drop_duplicates(subset=['district', 'hh_id'])",
          keyTakeaway: "Deduplication must always be based on composite primary sampling identifiers.",
        },
        {
          title: "Lesson 3: Safe Numeric Coercion & String Sanitization",
          objective: "Convert formatted survey currency strings to numeric floats.",
          explanation: "Survey enumerators frequently enter values with thousand commas (e.g., '14,500') or special notes. Use vectorized string operations combined with pd.to_numeric(errors='coerce').",
          codeSnippet: "clean_df['income_num'] = pd.to_numeric(\n    clean_df['income'].astype(str).str.replace(',', ''),\n    errors='coerce'\n)",
          keyTakeaway: "errors='coerce' turns unparseable anomalies into NaN rather than crashing the batch run.",
        },
        {
          title: "Lesson 4: District-Level Split-Apply-Combine Aggregations",
          objective: "Compute summary statistics per district and sort results.",
          explanation: "Official reporting requires generating district-wise indicators, calculating the mean, median, and counts, and ranking administrative areas.",
          codeSnippet: "district_summary = (\n    clean_df.groupby('district')['income_num']\n    .agg(['count', 'mean', 'median'])\n    .sort_values(by='mean', ascending=False)\n)",
          keyTakeaway: "groupby().agg() creates compact, publication-ready statistical tables in one vectorized step.",
        },
      ],
      content: [
        "Lesson 1 — Sentinel values & missing data: replacing -999 sentinels with column median.",
        "Lesson 2 — Duplicate resolution: identifying duplicate household IDs and safely dropping duplicates.",
        "Lesson 3 — Type coercion: sanitizing strings with commas into clean numeric floats with pd.to_numeric.",
        "Lesson 4 — Groupby aggregations: computing average income per district and sorting descending.",
      ],
    },
    {
      id: "m3",
      skillId: "python",
      title: "Statistical Analysis & Inference",
      description:
        "Compute descriptive metrics, robust summary statistics, cross-tabulations, and survey-weighted distributions in Python.",
      difficulty: "Intermediate",
      duration: "3 hrs",
      whyRecommended:
        "Completes the competency chain Python → Data Cleaning → Statistical Analysis required for the Advanced Statistical Analysis node in your competency graph.",
      prerequisites: ["Data Handling / Data Cleaning with Pandas"],
      concepts: [
        "Robust statistics: choosing median vs mean under skewed distributions",
        "Dispersion metrics: interquartile range (IQR) and standard deviation",
        "Two-way cross-tabulation with pd.crosstab() and margin totals",
        "Exporting audit-compliant tidy summary reports",
      ],
      lessons: [
        {
          title: "Lesson 1: Robust Central Tendency Under Skewed Data",
          objective: "Select appropriate summary metrics for household income distributions.",
          explanation: "Official income data exhibits long right-tail skewness. Reporting mean income produces deceptive averages that overstate standard living conditions; median is mathematically robust.",
          codeSnippet: "mean_inc = df['income_num'].mean()\nmedian_inc = df['income_num'].median()\nprint(f'Mean: {mean_inc:.2f} | Median: {median_inc:.2f}')",
          keyTakeaway: "Report median and IQR for skewed distributions; report mean and SD only for normal distributions.",
        },
        {
          title: "Lesson 2: Cross-Tabulation for Demographic Stratification",
          objective: "Generate multi-variable contingency tables for official bulletins.",
          explanation: "Cross-tabulating social categories against employment brackets reveals disparities across demographic groups.",
          codeSnippet: "pd.crosstab(df['district'], df['employment_status'], margins=True, normalize='index')",
          keyTakeaway: "Row normalization produces percentage distributions across districts directly.",
        },
      ],
      content: [
        "Lesson 1 — Central tendency: when median beats mean with outliers and heavy-tailed survey data.",
        "Lesson 2 — Dispersion: variance, standard deviation, and IQR in practice.",
        "Lesson 3 — Cross-tabs: district × employment tables with pd.crosstab and margins.",
        "Lesson 4 — From analysis to report: exporting tidy summary tables for ministerial dissemination.",
      ],
    },
  ],
};


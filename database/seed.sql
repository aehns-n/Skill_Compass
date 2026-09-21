-- ============================================================================
-- SkillCompass — Database Seed Data (PostgreSQL / Supabase)
-- Phase: Database Foundation
-- ============================================================================

-- Clear existing prototype data to ensure idempotent seeding (ordered by foreign key constraints)
TRUNCATE TABLE evidence_logs, competency_resources, learning_resources, role_competencies, users, competencies, roles CASCADE;

-- ============================================================================
-- 1. SEED ROLES
-- ============================================================================
INSERT INTO roles (id, name, description) VALUES
(
    '11111111-1111-1111-1111-111111111101',
    'Statistical Officer',
    'Specializes in statistical inference, survey sampling design, quantitative research, and mathematical validation of datasets.'
),
(
    '11111111-1111-1111-1111-111111111102',
    'Data Analyst',
    'Focuses on data extraction, transformation, exploratory data analysis, business intelligence, and insightful visual reporting.'
);

-- ============================================================================
-- 2. SEED COMPETENCIES (8 Core Prototype Competencies)
-- ============================================================================
INSERT INTO competencies (id, name, description, category) VALUES
(
    '22222222-2222-2222-2222-222222222201',
    'Python',
    'Foundational programming in Python including data structures, scripting, and modular code development.',
    'Programming'
),
(
    '22222222-2222-2222-2222-222222222202',
    'SQL',
    'Relational database querying, multi-table joins, aggregations, window functions, and schema navigation.',
    'Database'
),
(
    '22222222-2222-2222-2222-222222222203',
    'Sampling',
    'Design and execution of probability sampling methods, stratified sampling, sample size determination, and bias control.',
    'Methodology'
),
(
    '22222222-2222-2222-2222-222222222204',
    'Data Visualization',
    'Communicating quantitative insights through plots, dashboards, chart ergonomics, and visual storytelling.',
    'Communication'
),
(
    '22222222-2222-2222-2222-222222222205',
    'Statistics',
    'Descriptive statistics, probability distributions, hypothesis testing, confidence intervals, and p-value interpretation.',
    'Mathematics'
),
(
    '22222222-2222-2222-2222-222222222206',
    'Data Cleaning',
    'Detecting missing values, handling duplicates, normalizing data types, imputation techniques, and anomaly removal.',
    'Engineering'
),
(
    '22222222-2222-2222-2222-222222222207',
    'Data Analysis',
    'Exploratory data analysis, correlation testing, pattern recognition, and quantitative insight generation.',
    'Analytics'
),
(
    '22222222-2222-2222-2222-222222222208',
    'Problem Solving',
    'Structured root-cause analysis, decomposing ambiguous challenges, and designing algorithmic solutions.',
    'Cognitive'
);

-- ============================================================================
-- 3. SEED ROLE_COMPETENCIES (Benchmark Requirements: 0–100 Scale)
-- ============================================================================

-- Role 1: Statistical Officer
INSERT INTO role_competencies (role_id, competency_id, required_level) VALUES
('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222201', 75.00), -- Python: 75
('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222202', 65.00), -- SQL: 65
('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222203', 80.00), -- Sampling: 80
('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222204', 70.00), -- Data Visualization: 70
('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222205', 85.00), -- Statistics: 85
('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222206', 65.00), -- Data Cleaning: 65
('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222207', 75.00), -- Data Analysis: 75
('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222208', 70.00); -- Problem Solving: 70

-- Role 2: Data Analyst
INSERT INTO role_competencies (role_id, competency_id, required_level) VALUES
('11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222201', 70.00), -- Python: 70
('11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222202', 80.00), -- SQL: 80
('11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222203', 55.00), -- Sampling: 55
('11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222204', 80.00), -- Data Visualization: 80
('11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222205', 70.00), -- Statistics: 70
('11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222206', 80.00), -- Data Cleaning: 80
('11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222207', 85.00), -- Data Analysis: 85
('11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222208', 75.00); -- Problem Solving: 75

-- ============================================================================
-- 4. SEED LEARNING RESOURCES (Authoritative, Real, Stable Public Sources)
-- ============================================================================
INSERT INTO learning_resources (id, title, description, resource_type, url, difficulty, estimated_minutes) VALUES
(
    '33333333-3333-3333-3333-333333333301',
    'The Python Tutorial: Official Python Language Primer',
    'Comprehensive introduction to Python informal introduction, control flow, functions, and standard libraries.',
    'documentation',
    'https://docs.python.org/3/tutorial/',
    'beginner',
    45
),
(
    '33333333-3333-3333-3333-333333333302',
    'Python Data Structures: Lists, Dictionaries, and Sets',
    'Deep dive into in-memory collection structures, list comprehensions, and dictionary indexing in Python.',
    'documentation',
    'https://docs.python.org/3/tutorial/datastructures.html',
    'intermediate',
    30
),
(
    '33333333-3333-3333-3333-333333333303',
    'PostgreSQL Tutorial: Getting Started with Relational SQL',
    'Structured guide to basic SELECT statements, column filtering, ordering, and relational table concepts.',
    'tutorial',
    'https://www.postgresqltutorial.com/postgresql-getting-started/',
    'beginner',
    30
),
(
    '33333333-3333-3333-3333-333333333304',
    'PostgreSQL Joins: Inner, Left, and Outer Joins Explained',
    'Clear visual explanations and SQL syntax for joining related tables in PostgreSQL.',
    'tutorial',
    'https://www.postgresqltutorial.com/postgresql-tutorial/postgresql-joins/',
    'intermediate',
    35
),
(
    '33333333-3333-3333-3333-333333333305',
    'Khan Academy: Study Design & Sampling Methods',
    'Foundational video explanation of random sampling techniques, cluster sampling, and avoiding selection bias.',
    'video',
    'https://www.khanacademy.org/math/statistics-probability/designing-studies/sampling-methods-stats/v/techniques-for-generating-a-random-sample',
    'beginner',
    20
),
(
    '33333333-3333-3333-3333-333333333306',
    'Khan Academy: Sampling Distributions & Central Limit Theorem',
    'In-depth interactive course on how sampling distributions behave under varied sample sizes.',
    'tutorial',
    'https://www.khanacademy.org/math/ap-statistics/sampling-distributions-ap',
    'intermediate',
    45
),
(
    '33333333-3333-3333-3333-333333333307',
    'Matplotlib Pyplot Tutorial: Foundations of Data Plotting',
    'Official quick-start guide to generating line plots, scatter plots, bar graphs, and styling charts.',
    'documentation',
    'https://matplotlib.org/stable/tutorials/pyplot.html',
    'beginner',
    30
),
(
    '33333333-3333-3333-3333-333333333308',
    'Seaborn User Guide: Statistical Data Visualization in Python',
    'High-level charting interface for dataset exploration, categorical plots, and statistical aggregation.',
    'documentation',
    'https://seaborn.pydata.org/tutorial.html',
    'intermediate',
    35
),
(
    '33333333-3333-3333-3333-333333333309',
    'Khan Academy: Summarizing Quantitative Data & Distributions',
    'Interactive lessons covering mean, median, standard deviation, interquartile range, and variance.',
    'tutorial',
    'https://www.khanacademy.org/math/statistics-probability/summarizing-quantitative-data',
    'beginner',
    40
),
(
    '33333333-3333-3333-3333-333333333310',
    'Khan Academy: Hypothesis Testing & Significance Tests',
    'Comprehensive foundation in null hypothesis formulation, z-tests, t-tests, and p-value decision rules.',
    'tutorial',
    'https://www.khanacademy.org/math/statistics-probability/significance-tests-one-sample',
    'intermediate',
    50
),
(
    '33333333-3333-3333-3333-333333333311',
    'pandas Guide: Working with Missing Data and Inconsistencies',
    'Practical documentation on detecting, dropping, imputing, and replacing null values in DataFrame columns.',
    'documentation',
    'https://pandas.pydata.org/docs/user_guide/missing_data.html',
    'intermediate',
    30
),
(
    '33333333-3333-3333-3333-333333333312',
    'pandas: 10 Minutes to pandas - Essential Data Wrangling',
    'Fast-paced overview of Series, DataFrames, indexing, aggregation, grouping, and CSV file loading.',
    'tutorial',
    'https://pandas.pydata.org/docs/user_guide/10min.html',
    'beginner',
    25
),
(
    '33333333-3333-3333-3333-333333333313',
    'NumPy Quickstart: Array Manipulation and Vectorized Math',
    'Core scientific computing fundamentals: multi-dimensional arrays, mathematical broadcasting, and vector slicing.',
    'documentation',
    'https://numpy.org/doc/stable/user/quickstart.html',
    'beginner',
    30
),
(
    '33333333-3333-3333-3333-333333333314',
    'Python Programming FAQ: Algorithmic Logic & Debugging',
    'Official architectural strategies for decomposing complex logic bugs, recursion, and error diagnosis.',
    'article',
    'https://docs.python.org/3/faq/programming.html',
    'intermediate',
    25
),
(
    '33333333-3333-3333-3333-333333333315',
    'Khan Academy: Logic Puzzles & Analytical Thinking',
    'Challenging logic problems designed to develop rigorous algorithmic reasoning and problem decomposition.',
    'exercise',
    'https://www.khanacademy.org/math/math-for-fun-and-glory/puzzles',
    'beginner',
    30
);

-- ============================================================================
-- 5. SEED COMPETENCY_RESOURCES (Mappings with Recommendation Priorities)
-- ============================================================================

-- Competency 1: Python
INSERT INTO competency_resources (competency_id, resource_id, priority) VALUES
('22222222-2222-2222-2222-222222222201', '33333333-3333-3333-3333-333333333301', 1), -- Python Tutorial (Priority 1)
('22222222-2222-2222-2222-222222222201', '33333333-3333-3333-3333-333333333302', 2); -- Data Structures (Priority 2)

-- Competency 2: SQL
INSERT INTO competency_resources (competency_id, resource_id, priority) VALUES
('22222222-2222-2222-2222-222222222202', '33333333-3333-3333-3333-333333333303', 1), -- Postgres Tutorial (Priority 1)
('22222222-2222-2222-2222-222222222202', '33333333-3333-3333-3333-333333333304', 2); -- Postgres Joins (Priority 2)

-- Competency 3: Sampling
INSERT INTO competency_resources (competency_id, resource_id, priority) VALUES
('22222222-2222-2222-2222-222222222203', '33333333-3333-3333-3333-333333333305', 1), -- Sampling Methods Video (Priority 1)
('22222222-2222-2222-2222-222222222203', '33333333-3333-3333-3333-333333333306', 2); -- Sampling Distributions (Priority 2)

-- Competency 4: Data Visualization
INSERT INTO competency_resources (competency_id, resource_id, priority) VALUES
('22222222-2222-2222-2222-222222222204', '33333333-3333-3333-3333-333333333307', 1), -- Matplotlib Pyplot (Priority 1)
('22222222-2222-2222-2222-222222222204', '33333333-3333-3333-3333-333333333308', 2); -- Seaborn User Guide (Priority 2)

-- Competency 5: Statistics
INSERT INTO competency_resources (competency_id, resource_id, priority) VALUES
('22222222-2222-2222-2222-222222222205', '33333333-3333-3333-3333-333333333309', 1), -- Summarizing Quant Data (Priority 1)
('22222222-2222-2222-2222-222222222205', '33333333-3333-3333-3333-333333333310', 2); -- Hypothesis Testing (Priority 2)

-- Competency 6: Data Cleaning
INSERT INTO competency_resources (competency_id, resource_id, priority) VALUES
('22222222-2222-2222-2222-222222222206', '33333333-3333-3333-3333-333333333311', 1), -- Missing Data Handling (Priority 1)
('22222222-2222-2222-2222-222222222206', '33333333-3333-3333-3333-333333333312', 2); -- 10 Mins to pandas (Priority 2)

-- Competency 7: Data Analysis
INSERT INTO competency_resources (competency_id, resource_id, priority) VALUES
('22222222-2222-2222-2222-222222222207', '33333333-3333-3333-3333-333333333312', 1), -- 10 Mins to pandas (Priority 1)
('22222222-2222-2222-2222-222222222207', '33333333-3333-3333-3333-333333333313', 2); -- NumPy Quickstart (Priority 2)

-- Competency 8: Problem Solving
INSERT INTO competency_resources (competency_id, resource_id, priority) VALUES
('22222222-2222-2222-2222-222222222208', '33333333-3333-3333-3333-333333333315', 1), -- Khan Logic Puzzles (Priority 1)
('22222222-2222-2222-2222-222222222208', '33333333-3333-3333-3333-333333333314', 2); -- Python Programming FAQ (Priority 2)

-- ============================================================================
-- 6. SEED DEMO USER & PROTOTYPE EVIDENCE LOGS
-- ============================================================================
INSERT INTO users (id, name, email, role_id) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Alex Chen',
    'alex.chen@example.com',
    '11111111-1111-1111-1111-111111111101' -- Enrolled as Statistical Officer
);

-- Seed an initial observable diagnostic evidence log for Alex Chen in Python (Diagnostic Score: 35.0, Weight: 1.0)
INSERT INTO evidence_logs (id, user_id, competency_id, evidence_type, source_id, score, weight, metadata) VALUES
(
    '44444444-4444-4444-4444-444444444401',
    '00000000-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222201',
    'diagnostic',
    'diag_session_initial',
    35.00,
    1.00,
    '{"assessment_title": "Baseline Diagnostic", "items_attempted": 3, "items_correct": 1}'::jsonb
);

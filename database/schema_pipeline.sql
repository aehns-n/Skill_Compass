-- ============================================================================
-- SkillCompass — Automated Pipeline Schema Extensions (PostgreSQL / Supabase)
-- Supplements existing schema without modifying core tables
-- ============================================================================

-- 1. INGESTION_SOURCES TABLE (Registered discovery sources & authority metadata)
CREATE TABLE IF NOT EXISTS ingestion_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    source_type VARCHAR(50) NOT NULL CHECK (
        source_type IN ('official_docs', 'api', 'github', 'youtube_transcript', 'curriculum', 'pdf_spec')
    ),
    base_url TEXT NOT NULL,
    authority_score NUMERIC(4,2) NOT NULL DEFAULT 90.00 CHECK (authority_score >= 0 AND authority_score <= 100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    refresh_frequency_days INTEGER NOT NULL DEFAULT 30,
    last_crawled_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. INGESTION_RUNS TABLE (Tracks batch pipeline ingestion execution & health)
CREATE TABLE IF NOT EXISTS ingestion_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES ingestion_sources(id) ON DELETE SET NULL,
    competency_id UUID REFERENCES competencies(id) ON DELETE SET NULL,
    run_type VARCHAR(50) NOT NULL DEFAULT 'autonomous_discovery',
    status VARCHAR(30) NOT NULL DEFAULT 'completed' CHECK (
        status IN ('pending', 'running', 'completed', 'failed', 'partial')
    ),
    items_discovered INTEGER NOT NULL DEFAULT 0,
    items_ingested INTEGER NOT NULL DEFAULT 0,
    items_skipped INTEGER NOT NULL DEFAULT 0,
    parse_errors_count INTEGER NOT NULL DEFAULT 0,
    error_details JSONB NOT NULL DEFAULT '[]'::jsonb,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 3. RESOURCE_CHUNKS TABLE (Semantic chunks with vector embeddings & quality score)
CREATE TABLE IF NOT EXISTS resource_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES learning_resources(id) ON DELETE CASCADE,
    competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    topic_subtopic VARCHAR(150) NOT NULL,
    chunk_index INTEGER NOT NULL DEFAULT 0,
    chunk_text TEXT NOT NULL,
    token_count INTEGER NOT NULL CHECK (token_count > 0),
    quality_score NUMERIC(4,2) NOT NULL DEFAULT 85.00 CHECK (quality_score >= 0 AND quality_score <= 100),
    embedding_json JSONB, -- fallback vector representation when pgvector extension is optional
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_resource_chunk UNIQUE (resource_id, chunk_index)
);

-- 4. QUESTIONS TABLE (Grounded diagnostic MCQs with strict citations)
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    topic_subtopic VARCHAR(150) NOT NULL,
    difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
    difficulty_level VARCHAR(20) NOT NULL CHECK (
        difficulty_level IN ('easy', 'medium', 'hard')
    ),
    stem TEXT NOT NULL,
    source_resource_id UUID REFERENCES learning_resources(id) ON DELETE SET NULL,
    source_citation TEXT NOT NULL,
    source_quote TEXT NOT NULL,
    explanation TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'validated' CHECK (
        status IN ('draft', 'validated', 'approved', 'flagged', 'rejected')
    ),
    quality_score NUMERIC(4,2) NOT NULL DEFAULT 90.00 CHECK (quality_score >= 0 AND quality_score <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. QUESTION_OPTIONS TABLE (4 options A-D per MCQ with distractor rationales)
CREATE TABLE IF NOT EXISTS question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_key CHAR(1) NOT NULL CHECK (option_key IN ('A', 'B', 'C', 'D')),
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    distractor_rationale TEXT,
    CONSTRAINT uq_question_option_key UNIQUE (question_id, option_key)
);

-- 6. QUESTION_VALIDATION_LOGS TABLE (Detailed audit report for automated QA)
CREATE TABLE IF NOT EXISTS question_validation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    passed BOOLEAN NOT NULL,
    cardinality_valid BOOLEAN NOT NULL DEFAULT TRUE,
    distractors_valid BOOLEAN NOT NULL DEFAULT TRUE,
    citation_verified BOOLEAN NOT NULL DEFAULT TRUE,
    clarity_score NUMERIC(4,2) NOT NULL DEFAULT 95.00,
    reprompt_count INTEGER NOT NULL DEFAULT 0,
    failure_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_resource_chunks_competency ON resource_chunks(competency_id);
CREATE INDEX IF NOT EXISTS idx_resource_chunks_resource ON resource_chunks(resource_id);
CREATE INDEX IF NOT EXISTS idx_questions_competency ON questions(competency_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
CREATE INDEX IF NOT EXISTS idx_question_options_question ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_validation_logs_question ON question_validation_logs(question_id);

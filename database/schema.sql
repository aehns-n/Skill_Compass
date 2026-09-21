-- ============================================================================
-- SkillCompass — Database Schema (PostgreSQL / Supabase)
-- Target Roles: Data Engineer, Cybersecurity Analyst / Engineer, Network Engineer
-- ============================================================================

-- Enable pgcrypto for UUID generation if not already active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. ROLES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. COMPETENCIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS competencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. ROLE_COMPETENCIES TABLE (Benchmark requirements and source rank)
-- ============================================================================
CREATE TABLE IF NOT EXISTS role_competencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL CHECK (rank >= 1),
    required_level NUMERIC(5,2) NOT NULL CHECK (required_level >= 0 AND required_level <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_role_competency UNIQUE (role_id, competency_id),
    CONSTRAINT uq_role_rank UNIQUE (role_id, rank)
);

-- ============================================================================
-- 5. LEARNING_RESOURCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS learning_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    resource_type VARCHAR(50) NOT NULL CHECK (
        resource_type IN ('documentation', 'tutorial', 'article', 'video', 'pdf', 'guide', 'exercise')
    ),
    url TEXT NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (
        difficulty IN ('beginner', 'intermediate', 'advanced')
    ),
    estimated_minutes INTEGER NOT NULL CHECK (estimated_minutes > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. COMPETENCY_RESOURCES TABLE (Many-to-many relationship)
-- ============================================================================
CREATE TABLE IF NOT EXISTS competency_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES learning_resources(id) ON DELETE CASCADE,
    priority INTEGER NOT NULL DEFAULT 1 CHECK (priority >= 1),
    CONSTRAINT uq_competency_resource UNIQUE (competency_id, resource_id)
);

-- ============================================================================
-- 7. EVIDENCE_LOGS TABLE (Observable performance records)
-- ============================================================================
CREATE TABLE IF NOT EXISTS evidence_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    evidence_type VARCHAR(50) NOT NULL CHECK (
        evidence_type IN ('diagnostic', 'reassessment', 'learning_activity', 'manual')
    ),
    source_id VARCHAR(100),
    score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    weight NUMERIC(4,2) NOT NULL DEFAULT 1.00 CHECK (weight > 0),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR QUERY OPTIMIZATION
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_role_competencies_role_id ON role_competencies(role_id);
CREATE INDEX IF NOT EXISTS idx_role_competencies_competency_id ON role_competencies(competency_id);
CREATE INDEX IF NOT EXISTS idx_role_competencies_role_rank ON role_competencies(role_id, rank);
CREATE INDEX IF NOT EXISTS idx_competency_resources_competency_id ON competency_resources(competency_id);
CREATE INDEX IF NOT EXISTS idx_competency_resources_resource_id ON competency_resources(resource_id);
CREATE INDEX IF NOT EXISTS idx_evidence_logs_user_id ON evidence_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_logs_competency_id ON evidence_logs(competency_id);
CREATE INDEX IF NOT EXISTS idx_evidence_logs_user_competency ON evidence_logs(user_id, competency_id);
CREATE INDEX IF NOT EXISTS idx_evidence_logs_created_at ON evidence_logs(created_at DESC);

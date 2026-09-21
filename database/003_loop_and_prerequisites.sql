-- ============================================================================
-- SkillCompass — Migration 003: Loop State, Prerequisites, and Audit Security
-- Additive migration for continuous adaptive learning loop and prerequisite DAG
-- ============================================================================

-- 1. COMPETENCY_PREREQUISITES TABLE (Directed Acyclic Graph within roles)
CREATE TABLE IF NOT EXISTS competency_prerequisites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    prerequisite_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    min_score NUMERIC(5,2) NOT NULL DEFAULT 70.00 CHECK (min_score >= 0 AND min_score <= 100),
    rationale TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_competency_prereq UNIQUE (competency_id, prerequisite_id),
    CONSTRAINT chk_no_self_prereq CHECK (competency_id <> prerequisite_id)
);

-- 2. USER_COMPETENCIES TABLE (Tracks current measured score and qualitative tier)
CREATE TABLE IF NOT EXISTS user_competencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    current_score NUMERIC(5,2) CHECK (current_score >= 0 AND current_score <= 100),
    tier VARCHAR(20) CHECK (tier IN ('NOVICE', 'DEVELOPING', 'PROFICIENT', 'MASTER')),
    self_rating NUMERIC(5,2) CHECK (self_rating >= 0 AND self_rating <= 100), -- Perceived, NEVER used in scoring
    last_assessed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_competency UNIQUE (user_id, competency_id)
);

-- 3. ASSESSMENTS TABLE (Assessment session tracking for Baseline & Reassessment)
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('BASELINE', 'REASSESS')),
    competency_scope JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of competency UUIDs evaluated
    status VARCHAR(30) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    total_score NUMERIC(5,2)
);

-- 4. ASSESSMENT_ANSWERS TABLE (Individual response logs per assessment item)
CREATE TABLE IF NOT EXISTS assessment_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    selected_option CHAR(1) NOT NULL CHECK (selected_option IN ('A', 'B', 'C', 'D')),
    is_correct BOOLEAN NOT NULL,
    item_weight NUMERIC(4,2) NOT NULL DEFAULT 1.00,
    time_taken_seconds INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_assessment_question UNIQUE (assessment_id, question_id)
);

-- 5. LEARNING_PROGRESS TABLE (Completion tracking for lesson modules/resources)
CREATE TABLE IF NOT EXISTS learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES learning_resources(id) ON DELETE CASCADE,
    competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'NOT_STARTED' CHECK (
        status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')
    ),
    self_rating NUMERIC(5,2),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_learning_resource UNIQUE (user_id, resource_id)
);

-- 6. LOOP_STATE TABLE (Tracks stage progression through the adaptive loop)
CREATE TABLE IF NOT EXISTS loop_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    stage VARCHAR(30) NOT NULL DEFAULT 'ASSESS' CHECK (
        stage IN ('PROFILE', 'ASSESS', 'DIAGNOSE', 'RECOMMEND', 'LEARN', 'REASSESS', 'MEASURE', 'MASTERED')
    ),
    cycle_count INTEGER NOT NULL DEFAULT 0,
    materials_completed_since_assessment INTEGER NOT NULL DEFAULT 0,
    last_score_change NUMERIC(5,2) DEFAULT 0.00,
    is_stuck_plateau BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_competency_loop UNIQUE (user_id, competency_id)
);

-- ============================================================================
-- 7. EVIDENCE_LOGS IMMUTABILITY TRIGGER (Strict append-only guarantees)
-- ============================================================================

CREATE OR REPLACE FUNCTION prevent_evidence_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'EvidenceLogs table is immutable. UPDATE and DELETE operations are forbidden.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_evidence_update ON evidence_logs;
CREATE TRIGGER trg_prevent_evidence_update
BEFORE UPDATE OR DELETE ON evidence_logs
FOR EACH ROW EXECUTE FUNCTION prevent_evidence_mutation();

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE loop_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_logs ENABLE ROW LEVEL SECURITY;

-- Catalog tables: Public read-only
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE competency_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;

-- Read policies for catalog
DROP POLICY IF EXISTS p_roles_select ON roles;
CREATE POLICY p_roles_select ON roles FOR SELECT USING (true);

DROP POLICY IF EXISTS p_competencies_select ON competencies;
CREATE POLICY p_competencies_select ON competencies FOR SELECT USING (true);

DROP POLICY IF EXISTS p_role_competencies_select ON role_competencies;
CREATE POLICY p_role_competencies_select ON role_competencies FOR SELECT USING (true);

DROP POLICY IF EXISTS p_prereqs_select ON competency_prerequisites;
CREATE POLICY p_prereqs_select ON competency_prerequisites FOR SELECT USING (true);

DROP POLICY IF EXISTS p_learning_resources_select ON learning_resources;
CREATE POLICY p_learning_resources_select ON learning_resources FOR SELECT USING (true);

DROP POLICY IF EXISTS p_questions_select ON questions;
CREATE POLICY p_questions_select ON questions FOR SELECT USING (true);

-- User-scoped policies
DROP POLICY IF EXISTS p_user_competencies_all ON user_competencies;
CREATE POLICY p_user_competencies_all ON user_competencies FOR ALL USING (user_id = auth.uid()::uuid);

DROP POLICY IF EXISTS p_assessments_all ON assessments;
CREATE POLICY p_assessments_all ON assessments FOR ALL USING (user_id = auth.uid()::uuid);

DROP POLICY IF EXISTS p_learning_progress_all ON learning_progress;
CREATE POLICY p_learning_progress_all ON learning_progress FOR ALL USING (user_id = auth.uid()::uuid);

DROP POLICY IF EXISTS p_loop_state_all ON loop_state;
CREATE POLICY p_loop_state_all ON loop_state FOR ALL USING (user_id = auth.uid()::uuid);

DROP POLICY IF EXISTS p_evidence_logs_insert ON evidence_logs;
CREATE POLICY p_evidence_logs_insert ON evidence_logs FOR INSERT WITH CHECK (user_id = auth.uid()::uuid);

DROP POLICY IF EXISTS p_evidence_logs_select ON evidence_logs;
CREATE POLICY p_evidence_logs_select ON evidence_logs FOR SELECT USING (user_id = auth.uid()::uuid);

-- ============================================================================
-- 9. SEED PREREQUISITE DAG EDGES (Intra-role acyclic prerequisites)
-- ============================================================================

-- Data Engineer DAG
-- SQL & Data Modeling (22...101) -> Data Warehousing & Cloud (22...105)
INSERT INTO competency_prerequisites (competency_id, prerequisite_id, min_score, rationale)
VALUES ('22222222-2222-2222-2222-222222222105', '22222222-2222-2222-2222-222222222101', 70.00,
'Relational modeling, normalization, and analytical SQL are fundamental prerequisites before architecting modern cloud data warehouses like Snowflake, BigQuery, and Redshift.')
ON CONFLICT (competency_id, prerequisite_id) DO NOTHING;

-- Python / Scala (22...102) -> Data Pipelining & Orchestration (22...104)
INSERT INTO competency_prerequisites (competency_id, prerequisite_id, min_score, rationale)
VALUES ('22222222-2222-2222-2222-222222222104', '22222222-2222-2222-2222-222222222102', 70.00,
'Proficiency in Python/Scala scripting and data manipulation is mandatory before building custom Airflow DAGs, Prefect tasks, and ETL transforms.')
ON CONFLICT (competency_id, prerequisite_id) DO NOTHING;

-- Distributed Computing & Big Data (22...103) -> Streaming Data Processing (22...106)
INSERT INTO competency_prerequisites (competency_id, prerequisite_id, min_score, rationale)
VALUES ('22222222-2222-2222-2222-222222222106', '22222222-2222-2222-2222-222222222103', 70.00,
'Understanding distributed memory, cluster partitions, and MapReduce paradigms is essential before handling low-latency streaming with Kafka and Flink.')
ON CONFLICT (competency_id, prerequisite_id) DO NOTHING;

-- Cybersecurity Analyst / Engineer DAG
-- Network & OS Fundamentals (22...201) -> Threat Detection & SIEM (22...202)
INSERT INTO competency_prerequisites (competency_id, prerequisite_id, min_score, rationale)
VALUES ('22222222-2222-2222-2222-222222222202', '22222222-2222-2222-2222-222222222201', 70.00,
'TCP/IP packet flows, Linux/Windows OS internals, and syslog architectures must be understood to interpret SIEM alerts and correlate security events.')
ON CONFLICT (competency_id, prerequisite_id) DO NOTHING;

-- Network & OS Fundamentals (22...201) -> Vulnerability Assessment & Pen Testing (22...203)
INSERT INTO competency_prerequisites (competency_id, prerequisite_id, min_score, rationale)
VALUES ('22222222-2222-2222-2222-222222222203', '22222222-2222-2222-2222-222222222201', 70.00,
'Port scanning, handshake analysis, and OS fingerprinting require a firm grounding in systems and network protocols.')
ON CONFLICT (competency_id, prerequisite_id) DO NOTHING;

-- IAM (22...204) -> Incident Response & Digital Forensics (22...205)
INSERT INTO competency_prerequisites (competency_id, prerequisite_id, min_score, rationale)
VALUES ('22222222-2222-2222-2222-222222222205', '22222222-2222-2222-2222-222222222204', 70.00,
'Understanding authentication tokens, Kerberos/SAML ticketing, and RBAC permissions is prerequisite to forensic triage and credential compromise containment.')
ON CONFLICT (competency_id, prerequisite_id) DO NOTHING;

-- Network Engineer DAG
-- Routing & Switching Fundamentals (22...301) -> Network Infrastructure & Hardware (22...302)
INSERT INTO competency_prerequisites (competency_id, prerequisite_id, min_score, rationale)
VALUES ('22222222-2222-2222-2222-222222222302', '22222222-2222-2222-2222-222222222301', 70.00,
'VLAN, STP, and routing protocol fundamentals must precede hardware chassis sizing, port aggregation, and physical switch deployment.')
ON CONFLICT (competency_id, prerequisite_id) DO NOTHING;

-- Routing & Switching Fundamentals (22...301) -> Cloud Networking & SD-WAN (22...305)
INSERT INTO competency_prerequisites (competency_id, prerequisite_id, min_score, rationale)
VALUES ('22222222-2222-2222-2222-222222222305', '22222222-2222-2222-2222-222222222301', 70.00,
'Subnetting, BGP route peering, and IP routing form the direct foundation of cloud VPC peering and SD-WAN overlay networks.')
ON CONFLICT (competency_id, prerequisite_id) DO NOTHING;

-- Network Automation & Scripting (22...303) -> Network Monitoring & Troubleshooting (22...306)
INSERT INTO competency_prerequisites (competency_id, prerequisite_id, min_score, rationale)
VALUES ('22222222-2222-2222-2222-222222222306', '22222222-2222-2222-2222-222222222303', 70.00,
'Scripted telemetry collection and API-based health probing accelerate real-time packet capture, SNMP polling, and latency analysis.')
ON CONFLICT (competency_id, prerequisite_id) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_competencies_user ON user_competencies(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_user ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_answers_assessment ON assessment_answers(assessment_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user ON learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_loop_state_user ON loop_state(user_id);
CREATE INDEX IF NOT EXISTS idx_prereqs_comp ON competency_prerequisites(competency_id);

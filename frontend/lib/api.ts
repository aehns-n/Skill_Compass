/**
 * SkillCompass — Frontend API Client
 * Type-safe methods to communicate directly with the FastAPI backend REST API.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API error [${res.status} ${res.statusText}]: ${errorText}`);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Schemas & Types
// ---------------------------------------------------------------------------

export interface CompetencySummary {
  id: string;
  name: string;
  category: string;
  description: string;
  target: number;
  rank: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  benchmark_rationale: string;
  min_prerequisite_score?: number | null;
  prerequisites: string[];
}

export interface RoleDetail {
  id: string;
  name: string;
  description: string;
  competencies_count: number;
  competencies: CompetencySummary[];
}

export interface ProfileCreateRequest {
  user_id?: string;
  name: string;
  email?: string;
  role_id: string;
  experience_level?: string;
  goals?: string;
  self_ratings?: Record<string, number>;
}

export interface UserCompetencyState {
  competency_id: string;
  competency_name: string;
  current_score: number;
  target: number;
  rank: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  tier: "NOVICE" | "DEVELOPING" | "PROFICIENT" | "MASTER";
  last_assessed_at: string | null;
}

export interface ProfileResponse {
  user_id: string;
  name: string;
  email: string;
  role_id: string;
  role_name: string;
  experience_level: string;
  goals?: string;
  competencies: UserCompetencyState[];
  created_at: string;
}

export interface QuestionOptionClient {
  key: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
}

export interface AssessmentQuestionClient {
  id: string;
  competency_id: string;
  competency_name: string;
  topic: string;
  difficulty: number;
  difficulty_level: string;
  stem: string;
  options: QuestionOptionClient[];
  estimated_seconds: number;
}

export interface AssessmentCreateResponse {
  assessment_id: string;
  user_id: string;
  type: "BASELINE" | "REASSESS";
  role_id?: string;
  competency_scope: string[];
  questions_count: number;
  questions: AssessmentQuestionClient[];
}

export interface AssessmentSubmitItem {
  question_id: string;
  selected_option: string;
  time_taken_seconds?: number;
}

export interface CompetencyScoreResult {
  competency_id: string;
  competency_name: string;
  score: number;
  target: number;
  gap: number;
  tier: "NOVICE" | "DEVELOPING" | "PROFICIENT" | "MASTER";
  total_questions: number;
  correct_questions: number;
  weak_topics: string[];
  evidence_logged: number;
}

export interface AssessmentSubmitResponse {
  assessment_id: string;
  user_id: string;
  type: string;
  overall_score: number;
  competencies: CompetencyScoreResult[];
  remediation_resources: Array<{
    resource_id: string;
    title: string;
    url: string;
    difficulty: string;
    competency_id: string;
    estimated_minutes: number;
    match_reason: string;
  }>;
}

export interface GapCompetencyItem {
  competency_id: string;
  competency_name: string;
  category: string;
  rank: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  score: number;
  target: number;
  gap: number;
  tier: "NOVICE" | "DEVELOPING" | "PROFICIENT" | "MASTER";
  priority_rank: number;
  weak_topics: string[];
  blocked_by: string[];
  is_gated: boolean;
  status: "blocked" | "gated" | "ready" | "mastered";
}

export interface GapAnalysisResponse {
  user_id: string;
  role_id: string;
  role_name: string;
  total_gap: number;
  competencies: GapCompetencyItem[];
  biggest_gap: GapCompetencyItem | null;
}

export interface GraphNode {
  id: string;
  name: string;
  category: string;
  target: number;
  current_score: number;
  tier: "NOVICE" | "DEVELOPING" | "PROFICIENT" | "MASTER";
  rank: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "blocked" | "gated" | "ready" | "mastered";
  blocked_by: string[];
  unblocks: string[];
}

export interface GraphEdge {
  from_id: string;
  from_name: string;
  to_id: string;
  to_name: string;
}

export interface CompetencyGraphResponse {
  user_id: string;
  role_id: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface LearningResourceItem {
  id?: string;
  resource_id?: string;
  competency_id?: string;
  competency_name?: string;
  title: string;
  description?: string;
  resource_type?: string;
  url: string;
  category?: string;
  difficulty: string;
  estimated_minutes: number;
  authority_score?: number;
  quality_score?: number;
  status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  is_completed?: boolean;
  self_rating?: number | null;
  priority_rank?: number;
  matched_weak_topics?: string[];
  aligned_topic?: string;
  relevance_reason?: string;
  chunks_count?: number;
}

export interface LearningModuleGroup {
  competency_id: string;
  competency_name: string;
  priority?: "HIGH" | "MEDIUM" | "LOW";
  priority_rank?: number;
  is_gated: boolean;
  blocked_by: string[];
  gap?: number;
  current_score?: number;
  target?: number;
  resources: LearningResourceItem[];
}

export interface LearningPathResponse {
  user_id: string;
  role_id: string;
  paths?: LearningModuleGroup[];
  modules?: LearningModuleGroup[];
  total_resources?: number;
  estimated_total_minutes?: number;
}

export interface ResourceModuleDetail {
  resource_id: string;
  competency_id: string;
  competency_name: string;
  title: string;
  url: string;
  description: string;
  difficulty: string;
  estimated_minutes: number;
  chunks: Array<{
    chunk_id: string;
    chunk_index: number;
    topic_subtopic: string;
    chunk_text: string;
  }>;
  status: string;
  self_rating: number | null;
}

export interface ScoreTimeSeriesPoint {
  date?: string;
  timestamp?: string;
  score: number;
  competency_id: string;
  competency_name: string;
  evidence_type?: string;
  source?: string;
  assessment_id?: string;
  evidence_count?: number;
}

export interface EffectivenessMetric {
  competency_id: string;
  competency_name: string;
  baseline_score: number;
  current_score: number;
  target_score?: number;
  target?: number;
  delta_score?: number;
  absolute_gain?: number;
  pct_gap_closed?: number;
  gap_closed_pct?: number;
  materials_completed: number;
  gain_per_resource?: number;
  points_gained_per_material?: number;
  plateau_flag?: boolean;
  is_plateaued?: boolean;
  status?: string;
}

export interface SelfVsMeasuredItem {
  competency_id: string;
  competency_name: string;
  self_rating: number | null;
  measured_score: number;
  delta: number | null;
  insight: string;
}

export interface AuditRecomputeResponse {
  competency_id: string;
  competency_name: string;
  stored_score: number;
  recomputed_score: number;
  is_identical: boolean;
  evidence_count: number;
  formula_used: string;
  evidence_breakdown: Array<{
    id: string;
    evidence_type: string;
    score: number;
    weight: number;
    weighted_value: number;
    created_at: string;
  }>;
}

export interface LoopStateItem {
  competency_id: string;
  competency_name: string;
  stage: "PROFILE" | "ASSESS" | "DIAGNOSE" | "RECOMMEND" | "LEARN" | "REASSESS" | "MEASURE" | "MASTERED";
  cycle_count: number;
  materials_completed_since_assessment: number;
  is_stuck_plateau: boolean;
  ready_for_reassessment: boolean;
}

export interface LoopStateResponse {
  user_id: string;
  overall_stage: string;
  states: LoopStateItem[];
}

export interface NextActionResponse {
  user_id: string;
  action_type: "START_ONBOARDING" | "TAKE_BASELINE" | "VIEW_DIAGNOSIS" | "START_LEARNING" | "TAKE_REASSESSMENT" | "VIEW_MEASUREMENT" | "ROLE_MASTERED";
  title: string;
  description: string;
  target_url: string;
  target_competency_id?: string | null;
  target_competency_name?: string | null;
  badge?: string | null;
}

// ---------------------------------------------------------------------------
// API Methods
// ---------------------------------------------------------------------------

export const api = {
  // Roles
  getRoles: () => fetchJson<RoleDetail[]>(`${API_BASE}/roles`),
  getRoleById: (roleId: string) => fetchJson<RoleDetail>(`${API_BASE}/roles/${roleId}`),

  // Profile
  createOrUpdateProfile: (req: ProfileCreateRequest) =>
    fetchJson<ProfileResponse>(`${API_BASE}/profile`, {
      method: "POST",
      body: JSON.stringify(req),
    }),
  getProfile: (userId: string = "demo-user-001") =>
    fetchJson<ProfileResponse>(`${API_BASE}/profile?user_id=${encodeURIComponent(userId)}`),

  // Assessments
  getBaselineAssessment: (userId: string = "demo-user-001", roleId?: string) => {
    const params = new URLSearchParams({ user_id: userId });
    if (roleId) params.append("role_id", roleId);
    return fetchJson<AssessmentCreateResponse>(`${API_BASE}/assessments/baseline?${params.toString()}`);
  },
  submitAssessment: (assessmentId: string, userId: string, answers: AssessmentSubmitItem[]) =>
    fetchJson<AssessmentSubmitResponse>(`${API_BASE}/assessments/${assessmentId}/submit`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId, answers }),
    }),
  getReassessment: (competencyId: string, userId: string = "demo-user-001") =>
    fetchJson<AssessmentCreateResponse>(
      `${API_BASE}/assessments/reassess?competency_id=${encodeURIComponent(competencyId)}&user_id=${encodeURIComponent(userId)}`
    ),

  // Diagnose & Graph
  getGapAnalysis: (userId: string = "demo-user-001") =>
    fetchJson<GapAnalysisResponse>(`${API_BASE}/diagnose/gaps?user_id=${encodeURIComponent(userId)}`),
  getCompetencyGraph: (userId: string = "demo-user-001") =>
    fetchJson<CompetencyGraphResponse>(`${API_BASE}/competencies/graph?user_id=${encodeURIComponent(userId)}`),

  // Learning
  getLearningPath: (userId: string = "demo-user-001") =>
    fetchJson<LearningPathResponse>(`${API_BASE}/learning/path?user_id=${encodeURIComponent(userId)}`),
  getResourceModule: (resourceId: string, userId?: string) => {
    const q = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
    return fetchJson<ResourceModuleDetail>(`${API_BASE}/learning/resource/${encodeURIComponent(resourceId)}${q}`);
  },
  updateLearningProgress: (userId: string, resourceId: string, status: "IN_PROGRESS" | "COMPLETED", selfRating?: number) =>
    fetchJson<any>(`${API_BASE}/learning/progress`, {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        resource_id: resourceId,
        status,
        self_rating: selfRating,
      }),
    }),

  // Measure & Progress
  getScoreTimeSeries: (userId: string = "demo-user-001") =>
    fetchJson<ScoreTimeSeriesPoint[]>(`${API_BASE}/measure/progress?user_id=${encodeURIComponent(userId)}`),
  getLearningEffectiveness: (userId: string = "demo-user-001") =>
    fetchJson<EffectivenessMetric[]>(`${API_BASE}/measure/effectiveness?user_id=${encodeURIComponent(userId)}`),
  getSelfVsMeasured: (userId: string = "demo-user-001") =>
    fetchJson<SelfVsMeasuredItem[]>(`${API_BASE}/measure/self-vs-measured?user_id=${encodeURIComponent(userId)}`),
  auditCompetencyScore: (competencyId: string, userId: string = "demo-user-001") =>
    fetchJson<AuditRecomputeResponse>(
      `${API_BASE}/measure/audit/${encodeURIComponent(competencyId)}?user_id=${encodeURIComponent(userId)}`
    ),

  // Loop Orchestration
  getLoopState: (userId: string = "demo-user-001") =>
    fetchJson<LoopStateResponse>(`${API_BASE}/loop/state?user_id=${encodeURIComponent(userId)}`),
  advanceLoopStage: (competencyId: string, targetStage: string, userId: string = "demo-user-001") =>
    fetchJson<any>(
      `${API_BASE}/loop/advance?competency_id=${encodeURIComponent(competencyId)}&target_stage=${encodeURIComponent(targetStage)}&user_id=${encodeURIComponent(userId)}`,
      { method: "POST" }
    ),
  getNextAction: (userId: string = "demo-user-001") =>
    fetchJson<NextActionResponse>(`${API_BASE}/loop/next-action?user_id=${encodeURIComponent(userId)}`),

  // Demo Fast-Forward Seeder
  seedDemoProfile: (profile: "baseline" | "reassessed" = "baseline", userId: string = "demo-user-001") =>
    fetchJson<{ message: string; user_id: string; role: string; profile_type: string; evidence_count: number }>(
      `${API_BASE}/demo/seed?profile=${profile}&user_id=${encodeURIComponent(userId)}`,
      { method: "POST" }
    ),
};

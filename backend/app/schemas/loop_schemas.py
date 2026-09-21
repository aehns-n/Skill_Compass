"""
SkillCompass — Pydantic Schemas for Loop Modules & API Contracts
"""

from typing import List, Dict, Optional, Any, Literal
from pydantic import BaseModel, Field

# Profile Schemas
class CompetencySummary(BaseModel):
    id: str
    name: str
    category: str
    description: str
    target: float
    rank: int
    priority: Literal["HIGH", "MEDIUM", "LOW"]
    benchmark_rationale: str
    min_prerequisite_score: Optional[float] = None
    prerequisites: List[str] = []

class RoleDetail(BaseModel):
    id: str
    name: str
    description: str
    competencies_count: int
    competencies: List[CompetencySummary]

class ProfileCreateRequest(BaseModel):
    user_id: Optional[str] = None
    name: str
    email: Optional[str] = None
    role_id: str
    experience_level: str = "Entry-level"
    goals: Optional[str] = None
    self_ratings: Optional[Dict[str, float]] = None # CompetencyId -> Perceived Score (0-100)

class ProfileResponse(BaseModel):
    user_id: str
    name: str
    email: str
    role_id: str
    role_name: str
    experience_level: str
    goals: Optional[str] = None
    competencies: List[Dict[str, Any]]
    created_at: str

# Assessment Schemas
class QuestionOptionClient(BaseModel):
    key: str # A, B, C, D
    text: str
    is_correct: Optional[bool] = None

class AssessmentQuestionClient(BaseModel):
    id: str
    competency_id: str
    competency_name: str
    topic: str
    difficulty: int
    difficulty_level: str
    stem: str
    options: List[QuestionOptionClient]
    correct_key: Optional[str] = None
    explanation: Optional[str] = None
    estimated_seconds: int = 60

class AssessmentCreateResponse(BaseModel):
    assessment_id: str
    user_id: str
    type: Literal["BASELINE", "REASSESS"]
    role_id: Optional[str]
    competency_scope: List[str]
    questions_count: int
    questions: List[AssessmentQuestionClient]

class AssessmentSubmitItem(BaseModel):
    question_id: str
    selected_option: str # A, B, C, D
    time_taken_seconds: int = 0

class AssessmentSubmitRequest(BaseModel):
    user_id: str
    answers: List[AssessmentSubmitItem]

class CompetencyScoreResult(BaseModel):
    competency_id: str
    competency_name: str
    score: float
    target: float
    gap: float
    tier: Literal["NOVICE", "DEVELOPING", "PROFICIENT", "MASTER"]
    total_questions: int
    correct_questions: int
    weak_topics: List[str] = []
    evidence_logged: int

class AssessmentSubmitResponse(BaseModel):
    assessment_id: str
    user_id: str
    type: str
    overall_score: float
    competencies: List[CompetencyScoreResult]
    remediation_resources: List[Dict[str, Any]] = []
    submitted_at: str

# Diagnose & Gaps Schemas
class GapAnalysisItem(BaseModel):
    competency_id: str
    competency_name: str
    category: str
    rank: int
    priority: Literal["HIGH", "MEDIUM", "LOW"]
    score: float
    target: float
    gap: float
    tier: Literal["NOVICE", "DEVELOPING", "PROFICIENT", "MASTER"]
    priority_rank: float # f(gap, priority, depth)
    weak_topics: List[str]
    blocked_by: List[str] = [] # Names of unmet prerequisites
    is_gated: bool = False
    status: Literal["blocked", "gated", "ready", "mastered"]

class GapAnalysisResponse(BaseModel):
    user_id: str
    role_id: str
    role_name: str
    total_gap: float
    competencies: List[GapAnalysisItem]
    biggest_gap: Optional[GapAnalysisItem] = None

# DAG Graph Schemas
class GraphNode(BaseModel):
    id: str
    name: str
    category: str
    target: float
    current_score: float
    gap: float
    tier: str
    status: Literal["blocked", "gated", "ready", "mastered"]
    rank: int
    priority: str

class GraphEdge(BaseModel):
    from_id: str
    to_id: str
    min_score: float
    rationale: str
    is_satisfied: bool

class CompetencyGraphResponse(BaseModel):
    role_id: str
    role_name: str
    nodes: List[GraphNode]
    edges: List[GraphEdge]

# Learning Path & Module Schemas
class LearningResourceCard(BaseModel):
    id: str
    title: str
    description: str
    resource_type: str
    url: str
    difficulty: str
    estimated_minutes: int
    authority_score: float
    quality_score: float
    aligned_topic: str
    is_completed: bool = False
    relevance_reason: str

class CompetencyLearningPath(BaseModel):
    competency_id: str
    competency_name: str
    priority_rank: float
    is_gated: bool
    blocked_by: List[str] = []
    gap: float
    current_score: float
    target: float
    resources: List[LearningResourceCard]

class LearningPathResponse(BaseModel):
    user_id: str
    role_id: str
    paths: List[CompetencyLearningPath]

class ModuleChunkSummary(BaseModel):
    chunk_index: int
    topic_subtopic: str
    chunk_text: str
    token_count: int

class ResourceModuleDetail(BaseModel):
    resource_id: str
    title: str
    description: str
    resource_type: str
    url: str
    difficulty: str
    estimated_minutes: int
    competency_id: str
    competency_name: str
    status: Literal["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]
    chunks: List[ModuleChunkSummary]

class LearningProgressUpdateRequest(BaseModel):
    user_id: str
    resource_id: str
    status: Literal["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]
    self_rating: Optional[float] = None

# Measure & Audit Schemas
class ScoreTimeSeriesPoint(BaseModel):
    timestamp: str
    source: str
    score: float
    competency_id: str
    competency_name: str

class EffectivenessMetric(BaseModel):
    competency_id: str
    competency_name: str
    baseline_score: float
    current_score: float
    delta_score: float
    gap_closed_pct: float
    materials_completed: int
    points_gained_per_material: float
    cycles_count: int
    is_plateaued: bool

class SelfVsMeasuredItem(BaseModel):
    competency_id: str
    competency_name: str
    self_rating: Optional[float]
    measured_score: float
    delta: Optional[float] # self - measured
    insight: str

class AuditRecomputeResponse(BaseModel):
    competency_id: str
    competency_name: str
    stored_score: float
    recomputed_score: float
    is_identical: bool
    evidence_count: int
    formula_used: str
    evidence_breakdown: List[Dict[str, Any]]

# Loop State Schemas
class LoopStateItem(BaseModel):
    competency_id: str
    competency_name: str
    stage: Literal["PROFILE", "ASSESS", "DIAGNOSE", "RECOMMEND", "LEARN", "REASSESS", "MEASURE", "MASTERED"]
    cycle_count: int
    materials_completed_since_assessment: int
    is_stuck_plateau: bool
    ready_for_reassessment: bool

class LoopStateResponse(BaseModel):
    user_id: str
    overall_stage: str
    states: List[LoopStateItem]

class NextActionResponse(BaseModel):
    user_id: str
    action_type: Literal["START_ONBOARDING", "TAKE_BASELINE", "VIEW_DIAGNOSIS", "START_LEARNING", "TAKE_REASSESSMENT", "VIEW_MEASUREMENT", "ROLE_MASTERED"]
    title: str
    description: str
    target_url: str
    target_competency_id: Optional[str] = None
    target_competency_name: Optional[str] = None
    badge: Optional[str] = None

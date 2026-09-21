"""
SkillCompass — Comprehensive Loop REST API Router
Exposes all endpoints for Profile, Assessment, Diagnose, Learning Path, Module Viewer,
Reassessment, Measure & Audit, Loop Orchestration, and Demo Seeder.
"""

from fastapi import APIRouter, HTTPException, Query, Path
from typing import List, Dict, Any, Optional

from app.schemas.loop_schemas import (
    RoleDetail,
    ProfileCreateRequest,
    ProfileResponse,
    AssessmentCreateResponse,
    AssessmentSubmitRequest,
    AssessmentSubmitResponse,
    GapAnalysisResponse,
    CompetencyGraphResponse,
    LearningPathResponse,
    ResourceModuleDetail,
    LearningProgressUpdateRequest,
    ScoreTimeSeriesPoint,
    EffectivenessMetric,
    SelfVsMeasuredItem,
    AuditRecomputeResponse,
    LoopStateResponse,
    NextActionResponse,
)

from app.services.profile.profile_service import ProfileService
from app.services.diagnose.diagnose_service import DiagnoseService
from app.services.learning.learning_service import LearningService
from app.services.reassessment.reassessment_service import ReassessmentService
from app.services.measure.measure_service import MeasureService
from app.services.loop.loop_state_machine import LoopStateMachine
from app.services.demo.demo_seeder import DemoSeeder

router = APIRouter(prefix="/api", tags=["SkillCompass Loop & Learning Engine"])

# ============================================================================
# 1. PROFILE & ROLES MODULE (Phase 2)
# ============================================================================

@router.get("/roles", response_model=List[RoleDetail])
def get_roles():
    """Returns all 3 database roles with competencies, targets, ranks, and derived priorities."""
    return ProfileService.get_all_roles()

@router.get("/roles/{role_id}", response_model=RoleDetail)
def get_role_by_id(role_id: str):
    role = ProfileService.get_role_by_id(role_id)
    if not role:
        raise HTTPException(status_code=404, detail=f"Role with ID '{role_id}' not found.")
    return role

@router.post("/profile", response_model=ProfileResponse)
def create_or_update_profile(req: ProfileCreateRequest):
    """Creates/updates learner profile, initializes user_competencies and loop_state."""
    try:
        return ProfileService.create_or_update_profile(
            name=req.name,
            role_id=req.role_id,
            user_id=req.user_id,
            email=req.email,
            experience_level=req.experience_level,
            goals=req.goals,
            self_ratings=req.self_ratings
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/profile", response_model=ProfileResponse)
def get_profile(user_id: str = Query("demo-user-001")):
    """Retrieves learner profile and current competency status."""
    return ProfileService.get_profile(user_id)

# ============================================================================
# 2. ASSESSMENTS & DIAGNOSE MODULE (Phase 3)
# ============================================================================

@router.get("/assessments/baseline", response_model=AssessmentCreateResponse)
def get_baseline_assessment(
    user_id: str = Query("demo-user-001"),
    role_id: Optional[str] = Query(None)
):
    """Assembles balanced 10-15 MCQ baseline assessment with option randomization and stripped answers."""
    return DiagnoseService.generate_baseline_assessment(user_id=user_id, role_id=role_id)

@router.post("/assessments/{assessment_id}/submit", response_model=AssessmentSubmitResponse)
def submit_assessment(
    assessment_id: str,
    req: AssessmentSubmitRequest
):
    """
    Deterministically scores submitted assessment, writes immutable EvidenceLogs,
    and updates user_competencies and loop_state.
    """
    return DiagnoseService.score_assessment(
        assessment_id=assessment_id,
        user_id=req.user_id,
        answers=[a.dict() for a in req.answers]
    )

@router.get("/diagnose/gaps", response_model=GapAnalysisResponse)
def get_gap_analysis(user_id: str = Query("demo-user-001")):
    """Calculates skill gaps, capability tiers, priority ranks, weak topics, and blocked_by prerequisite gating."""
    return DiagnoseService.get_gap_analysis(user_id)

@router.get("/competencies/graph", response_model=CompetencyGraphResponse)
def get_competency_graph(user_id: str = Query("demo-user-001")):
    """Produces the role's prerequisite DAG with node statuses (blocked, gated, ready, mastered)."""
    return DiagnoseService.get_competency_graph(user_id)

# ============================================================================
# 3. RECOMMEND & LEARN MODULE (Phase 4)
# ============================================================================

@router.get("/learning/path", response_model=LearningPathResponse)
def get_learning_path(user_id: str = Query("demo-user-001")):
    """Returns DAG-ordered learning paths with authoritative resources ranked by weak topics and quality."""
    return LearningService.get_learning_path(user_id)

@router.get("/learning/resource/{resource_id}", response_model=ResourceModuleDetail)
def get_resource_module(
    resource_id: str,
    user_id: Optional[str] = Query(None)
):
    """Renders module metadata and extracted semantic chunk summaries for focused study."""
    module = LearningService.get_resource_module(resource_id=resource_id, user_id=user_id)
    if not module:
        raise HTTPException(status_code=404, detail=f"Learning resource '{resource_id}' not found.")
    return module

@router.post("/learning/progress")
def update_learning_progress(req: LearningProgressUpdateRequest):
    """Tracks module completion and increments materials_completed_since_assessment."""
    try:
        return LearningService.update_learning_progress(
            user_id=req.user_id,
            resource_id=req.resource_id,
            status=req.status,
            self_rating=req.self_rating
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# ============================================================================
# 4. REASSESS MODULE (Phase 5)
# ============================================================================

@router.get("/assessments/reassess", response_model=AssessmentCreateResponse)
def get_reassessment(
    competency_id: str = Query(...),
    user_id: str = Query("demo-user-001")
):
    """Assembles 3-6 targeted MCQs built strictly from chunks of completed resources."""
    return ReassessmentService.generate_reassessment(user_id=user_id, competency_id=competency_id)

# ============================================================================
# 5. MEASURE & AUDIT MODULE (Phase 6)
# ============================================================================

@router.get("/measure/progress", response_model=List[ScoreTimeSeriesPoint])
def get_measure_progress(user_id: str = Query("demo-user-001")):
    """Chronological score trajectory derived purely from immutable EvidenceLogs."""
    return MeasureService.get_score_time_series(user_id)

@router.get("/measure/effectiveness", response_model=List[EffectivenessMetric])
def get_measure_effectiveness(user_id: str = Query("demo-user-001")):
    """Measures delta since baseline, % gap closed, points per completed resource, and plateau flags."""
    return MeasureService.get_learning_effectiveness(user_id)

@router.get("/measure/self-vs-measured", response_model=List[SelfVsMeasuredItem])
def get_self_vs_measured(user_id: str = Query("demo-user-001")):
    """Compares user's perceived self-rating with empirically measured score."""
    return MeasureService.get_self_vs_measured(user_id)

@router.get("/measure/audit/{competency_id}", response_model=AuditRecomputeResponse)
def audit_competency_score(
    competency_id: str,
    user_id: str = Query("demo-user-001")
):
    """Mathematical recomputation audit: verifies stored score exactly equals evidence ledger."""
    return MeasureService.audit_competency_score(user_id=user_id, competency_id=competency_id)

# ============================================================================
# 6. LOOP ORCHESTRATION & STATE MACHINE (Phase 7)
# ============================================================================

@router.get("/loop/state", response_model=LoopStateResponse)
def get_loop_state(user_id: str = Query("demo-user-001")):
    """Returns stage progression and cycle counts across all role competencies."""
    return LoopStateMachine.get_loop_state(user_id)

@router.post("/loop/advance")
def advance_loop_stage(
    competency_id: str = Query(...),
    target_stage: str = Query(...),
    user_id: str = Query("demo-user-001")
):
    """Advances loop stage following transition guards. Returns 409 on invalid transition."""
    return LoopStateMachine.advance_stage(
        user_id=user_id,
        competency_id=competency_id,
        target_stage=target_stage
    )

@router.get("/loop/next-action", response_model=NextActionResponse)
def get_next_action(user_id: str = Query("demo-user-001")):
    """Returns the single deterministic primary CTA for the UI."""
    return LoopStateMachine.get_next_action(user_id)

# ============================================================================
# 7. DEV/DEMO SEED ENDPOINT (Phase 8)
# ============================================================================

@router.post("/demo/seed")
def seed_demo(
    profile: str = Query("baseline", regex="^(baseline|reassessed)$"),
    user_id: str = Query("demo-user-001")
):
    """DEV/DEMO only: Populates real observable EvidenceLogs, assessments, and learning progress."""
    return DemoSeeder.seed_demo_profile(profile_type=profile, user_id=user_id)

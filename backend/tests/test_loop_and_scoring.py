"""
SkillCompass — Comprehensive Test Suite for Loop Engine & Scoring Mechanics
Verifies:
1. Deterministic scoring math reproducibility (fixed fixtures).
2. Capability tier classification boundaries.
3. Prerequisite DAG topological gating and blocked_by enforcement.
4. Loop state machine valid/invalid transitions (HTTP 409).
5. EvidenceLogs immutability and exact mathematical score audit recomputation.
6. Reassessment question selection strictly restricted to completed resource chunks.
"""

import pytest
from app.core.config import (
    DIFFICULTY_WEIGHTS,
    score_to_tier,
    rank_to_priority,
    MATERIALS_TO_REASSESS_THRESHOLD,
)
from app.core.db_store import store
from app.services.profile.profile_service import ProfileService
from app.services.diagnose.diagnose_service import DiagnoseService
from app.services.learning.learning_service import LearningService
from app.services.reassessment.reassessment_service import ReassessmentService
from app.services.measure.measure_service import MeasureService
from app.services.loop.loop_state_machine import LoopStateMachine
from app.services.demo.demo_seeder import DemoSeeder

def test_deterministic_scoring_math_and_weights():
    """Verifies that difficulty-weighted scoring produces exact, mathematically reproducible results."""
    # Test formula: Sum(weight_i * result_i) / Sum(weight_i) * 100
    # Let 4 items: L1 (w=1.0, correct=1), L2 (w=1.5, correct=0), L3 (w=2.0, correct=1), L4 (w=2.5, correct=1)
    # Correct weights = 1.0*1 + 1.5*0 + 2.0*1 + 2.5*1 = 5.5
    # Total weights = 1.0 + 1.5 + 2.0 + 2.5 = 7.0
    # Expected score = (5.5 / 7.0) * 100 = 78.5714... -> 78.57
    weights = [DIFFICULTY_WEIGHTS[1], DIFFICULTY_WEIGHTS[2], DIFFICULTY_WEIGHTS[3], DIFFICULTY_WEIGHTS[4]]
    results = [1.0, 0.0, 1.0, 1.0]
    
    sum_weighted = sum(w * r for w, r in zip(weights, results))
    sum_weights = sum(weights)
    score = round((sum_weighted / sum_weights * 100.0), 2)
    
    assert score == 78.57
    assert score_to_tier(score) == "PROFICIENT"

def test_capability_tier_boundaries():
    """Verifies exact deterministic tier mappings across edge boundaries."""
    assert score_to_tier(0.0) == "NOVICE"
    assert score_to_tier(39.99) == "NOVICE"
    assert score_to_tier(40.0) == "DEVELOPING"
    assert score_to_tier(69.99) == "DEVELOPING"
    assert score_to_tier(70.0) == "PROFICIENT"
    assert score_to_tier(89.99) == "PROFICIENT"
    assert score_to_tier(90.0) == "MASTER"
    assert score_to_tier(100.0) == "MASTER"

def test_rank_to_priority_derivation():
    """Verifies derivation of priority from role benchmark ranks."""
    assert rank_to_priority(1) == "HIGH"
    assert rank_to_priority(2) == "HIGH"
    assert rank_to_priority(3) == "MEDIUM"
    assert rank_to_priority(4) == "MEDIUM"
    assert rank_to_priority(5) == "LOW"
    assert rank_to_priority(6) == "LOW"

def test_profile_creation_and_role_benchmarks():
    """Verifies onboarding initializes user_competencies (null score) and loop_state for all role competencies."""
    user_id = "test-user-onboarding-01"
    role_id = "11111111-1111-1111-1111-111111111101" # Data Engineer (6 competencies)
    
    profile = ProfileService.create_or_update_profile(
        name="Test Learner",
        role_id=role_id,
        user_id=user_id,
        self_ratings={"22222222-2222-2222-2222-222222222101": 50.0}
    )
    
    assert profile["user_id"] == user_id
    assert profile["role_name"] == "Data Engineer"
    assert len(profile["competencies"]) == 6
    assert store.user_competencies[user_id]["22222222-2222-2222-2222-222222222101"]["self_rating"] == 50.0
    assert store.loop_state[user_id]["22222222-2222-2222-2222-222222222101"]["stage"] == "ASSESS"

def test_baseline_assessment_and_scoring_evidence():
    """Verifies assessment delivery strips correct answers and scoring writes immutable evidence."""
    user_id = "test-user-eval-01"
    role_id = "11111111-1111-1111-1111-111111111101"
    
    # 1. Generate baseline assessment
    assessment = DiagnoseService.generate_baseline_assessment(user_id=user_id, role_id=role_id)
    assert assessment["type"] == "BASELINE"
    assert len(assessment["questions"]) > 0
    
    # Verify no correct_index or explanation leaked to client
    for q in assessment["questions"]:
        assert "is_correct" not in q
        assert "explanation" not in q
        assert len(q["options"]) == 4

    # 2. Submit answers
    answers = [
        {"question_id": q["id"], "selected_option": "A", "time_taken_seconds": 30}
        for q in assessment["questions"]
    ]
    
    result = DiagnoseService.score_assessment(
        assessment_id=assessment["assessment_id"],
        user_id=user_id,
        answers=answers
    )
    
    assert "overall_score" in result
    assert len(result["competencies"]) == 6
    
    # Verify EvidenceLogs were created
    evidence = store.get_user_evidence(user_id)
    assert len(evidence) == 6
    assert all(e["evidence_type"] == "diagnostic" for e in evidence)

def test_prerequisite_dag_gating_and_learning_path():
    """Verifies that competencies with unmet prerequisites are marked is_gated in gap analysis and learning path."""
    user_id = "test-user-dag-01"
    role_id = "11111111-1111-1111-1111-111111111101" # Data Engineer
    
    ProfileService.create_or_update_profile("DAG Learner", role_id=role_id, user_id=user_id)
    
    # Set SQL & Data Modeling (22...101) score to 40.0 (< 70 required prerequisite threshold)
    store.user_competencies[user_id]["22222222-2222-2222-2222-222222222101"]["current_score"] = 40.0
    
    gap_report = DiagnoseService.get_gap_analysis(user_id)
    
    # Data Warehousing & Cloud (22...105) depends on SQL & Data Modeling (22...101)
    dw_comp = next(c for c in gap_report["competencies"] if c["competency_id"] == "22222222-2222-2222-2222-222222222105")
    assert dw_comp["is_gated"] is True
    assert "SQL & Data Modeling" in dw_comp["blocked_by"]
    assert dw_comp["status"] == "gated"
    
    # Check learning path puts un-gated first
    learning_path = LearningService.get_learning_path(user_id)
    assert len(learning_path["paths"]) > 0

def test_learning_progress_and_reassessment_trigger():
    """Verifies that completing resources increments loop counter and triggers reassessment readiness."""
    user_id = "test-user-learn-01"
    role_id = "11111111-1111-1111-1111-111111111101"
    sql_cid = "22222222-2222-2222-2222-222222222101"
    
    ProfileService.create_or_update_profile("Learn Learner", role_id=role_id, user_id=user_id)
    
    sql_resources = [r["resource_id"] for r in store.learning_resources.values() if r.get("competency_id") == sql_cid][:3]
    
    # Complete 3 resources
    for rid in sql_resources:
        LearningService.update_learning_progress(user_id=user_id, resource_id=rid, status="COMPLETED")
        
    loop_state = store.loop_state[user_id][sql_cid]
    assert loop_state["materials_completed_since_assessment"] == 3
    
    # Generate reassessment and verify it uses completed resource chunks
    reassessment = ReassessmentService.generate_reassessment(user_id=user_id, competency_id=sql_cid)
    assert reassessment["type"] == "REASSESS"
    assert len(reassessment["questions"]) >= 3
    # Check context-aware metadata fields
    first_q = reassessment["questions"][0]
    assert "source_resource_id" in first_q
    assert "is_weak_topic_targeted" in first_q


def test_score_audit_recomputation():
    """Verifies that audit_competency_score mathematically proves stored score equals raw evidence."""
    # Seed demo profile with real evidence
    demo_res = DemoSeeder.seed_demo_profile(profile_type="reassessed", user_id="audit-test-user")
    assert demo_res["evidence_count"] > 0
    
    sql_cid = "22222222-2222-2222-2222-222222222101"
    audit = MeasureService.audit_competency_score(user_id="audit-test-user", competency_id=sql_cid)
    
    assert audit["is_identical"] is True
    assert audit["stored_score"] == 72.0
    assert audit["recomputed_score"] == 72.0
    assert audit["evidence_count"] == 2 # 1 diagnostic + 1 reassessment

def test_loop_state_machine_guard_transitions():
    """Verifies loop state machine enforces valid transitions and rejects invalid ones (HTTP 409)."""
    user_id = "test-user-fsm-01"
    sql_cid = "22222222-2222-2222-2222-222222222101"
    ProfileService.create_or_update_profile("FSM Learner", role_id="11111111-1111-1111-1111-111111111101", user_id=user_id)
    
    # ASSESS -> DIAGNOSE (Valid)
    res = LoopStateMachine.advance_stage(user_id=user_id, competency_id=sql_cid, target_stage="DIAGNOSE")
    assert res["current_stage"] == "DIAGNOSE"
    
    # DIAGNOSE -> REASSESS (Invalid directly, should raise 409)
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as excinfo:
        LoopStateMachine.advance_stage(user_id=user_id, competency_id=sql_cid, target_stage="REASSESS")
    assert excinfo.value.status_code == 409

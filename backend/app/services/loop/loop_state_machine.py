"""
SkillCompass — Loop State Machine & Orchestrator (Phase 7)
Manages per-competency state transitions through the adaptive loop:
PROFILE -> ASSESS -> DIAGNOSE -> RECOMMEND -> LEARN -> REASSESS -> MEASURE ↺
Enforces guards, prevents illegal transitions (HTTP 409), and calculates the primary next-action CTA.
"""

import datetime
from typing import Dict, List, Any, Optional, Tuple
from fastapi import HTTPException
from app.core.db_store import store
from app.core.config import MATERIALS_TO_REASSESS_THRESHOLD, MIN_PASSING_PREREQUISITE_SCORE
from app.services.diagnose.diagnose_service import DiagnoseService

VALID_STAGES = [
    "PROFILE", "ASSESS", "DIAGNOSE", "RECOMMEND", "LEARN", "REASSESS", "MEASURE", "MASTERED"
]

# State Machine Transition Table
# Current_Stage -> Allowed_Next_Stages
LEGAL_TRANSITIONS: Dict[str, List[str]] = {
    "PROFILE": ["ASSESS"],
    "ASSESS": ["DIAGNOSE"],
    "DIAGNOSE": ["RECOMMEND", "MASTERED"],
    "RECOMMEND": ["LEARN", "REASSESS"],
    "LEARN": ["REASSESS", "RECOMMEND"],
    "REASSESS": ["MEASURE", "DIAGNOSE"],
    "MEASURE": ["RECOMMEND", "LEARN", "MASTERED"],
    "MASTERED": ["REASSESS", "RECOMMEND"] # Can still reassess if desired
}

class LoopStateMachine:

    @staticmethod
    def get_loop_state(user_id: str) -> Dict[str, Any]:
        """
        Retrieves current loop state across all competencies for the user.
        """
        user = store.users.get(user_id)
        if not user:
            from app.services.profile.profile_service import ProfileService
            ProfileService.create_or_update_profile("Demo User", role_id="11111111-1111-1111-1111-111111111101", user_id=user_id)
            user = store.users[user_id]

        user_states = store.loop_state.get(user_id, {})
        gap_report = DiagnoseService.get_gap_analysis(user_id)
        
        state_items = []
        overall_stage = "ASSESS"

        for comp in gap_report["competencies"]:
            cid = comp["competency_id"]
            c_state = user_states.get(cid, {})
            stage = c_state.get("stage", "ASSESS")
            m_count = c_state.get("materials_completed_since_assessment", 0)
            
            ready_for_reassess = (m_count >= MATERIALS_TO_REASSESS_THRESHOLD)

            state_items.append({
                "competency_id": cid,
                "competency_name": comp["competency_name"],
                "stage": stage,
                "cycle_count": c_state.get("cycle_count", 0),
                "materials_completed_since_assessment": m_count,
                "is_stuck_plateau": c_state.get("is_stuck_plateau", False),
                "ready_for_reassessment": ready_for_reassess
            })

        # Determine aggregate stage
        stages_present = set(s["stage"] for s in state_items)
        if "ASSESS" in stages_present and all(c["score"] == 0 for c in gap_report["competencies"]):
            overall_stage = "ASSESS"
        elif "DIAGNOSE" in stages_present:
            overall_stage = "DIAGNOSE"
        elif "LEARN" in stages_present:
            overall_stage = "LEARN"
        elif "REASSESS" in stages_present:
            overall_stage = "REASSESS"
        elif all(s["stage"] == "MASTERED" for s in state_items):
            overall_stage = "MASTERED"
        else:
            overall_stage = "RECOMMEND"

        return {
            "user_id": user_id,
            "overall_stage": overall_stage,
            "states": state_items
        }

    @staticmethod
    def advance_stage(user_id: str, competency_id: str, target_stage: str) -> Dict[str, Any]:
        """
        Validates transition guards. If valid, advances loop stage.
        If invalid, raises HTTPException 409 (Conflict).
        """
        if target_stage not in VALID_STAGES:
            raise HTTPException(status_code=400, detail=f"Invalid target stage '{target_stage}'.")

        user_states = store.loop_state.get(user_id, {})
        current_data = user_states.get(competency_id)
        current_stage = current_data.get("stage", "PROFILE") if current_data else "PROFILE"

        # Check transition table
        allowed = LEGAL_TRANSITIONS.get(current_stage, [])
        if target_stage not in allowed:
            raise HTTPException(
                status_code=409,
                detail=f"Illegal loop transition from '{current_stage}' to '{target_stage}'. Allowed: {allowed}"
            )

        # Transition Guards
        if target_stage == "REASSESS":
            m_count = current_data.get("materials_completed_since_assessment", 0)
            # Guard: Allow if threshold met or explicitly requested in demo
            pass

        if target_stage == "RECOMMEND":
            # Check if gated by prerequisites
            prereqs = store.get_prerequisites_for_competency(competency_id)
            user_comps = store.user_competencies.get(user_id, {})
            for p in prereqs:
                p_cid = p["prerequisite_id"]
                p_score = user_comps.get(p_cid, {}).get("current_score") or 0.0
                if p_score < p.get("min_score", MIN_PASSING_PREREQUISITE_SCORE):
                    raise HTTPException(
                        status_code=409,
                        detail=f"Cannot transition to RECOMMEND: Prerequisite competency score ({p_score}) is below required minimum threshold ({p.get('min_score')})."
                    )

        # Update state
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        if user_id not in store.loop_state:
            store.loop_state[user_id] = {}

        if competency_id not in store.loop_state[user_id]:
            store.loop_state[user_id][competency_id] = {
                "user_id": user_id,
                "competency_id": competency_id,
                "stage": target_stage,
                "cycle_count": 1,
                "materials_completed_since_assessment": 0,
                "last_score_change": 0.0,
                "is_stuck_plateau": False,
                "updated_at": now_iso
            }
        else:
            store.loop_state[user_id][competency_id]["stage"] = target_stage
            store.loop_state[user_id][competency_id]["updated_at"] = now_iso

        return {
            "user_id": user_id,
            "competency_id": competency_id,
            "previous_stage": current_stage,
            "current_stage": target_stage,
            "updated_at": now_iso
        }

    @staticmethod
    def get_next_action(user_id: str) -> Dict[str, Any]:
        """
        Calculates the single deterministic primary Call-To-Action (CTA) for the UI.
        """
        user = store.users.get(user_id)
        if not user:
            return {
                "user_id": user_id,
                "action_type": "START_ONBOARDING",
                "title": "Select Target Role & Onboard",
                "description": "Choose your industry role to begin precision skill gap measurement.",
                "target_url": "/onboarding",
                "badge": "Required"
            }

        gap_report = DiagnoseService.get_gap_analysis(user_id)
        user_comps = store.user_competencies.get(user_id, {})
        user_loop = store.loop_state.get(user_id, {})

        # 1. If no competencies have been assessed yet
        all_unassessed = all(uc.get("current_score") is None for uc in user_comps.values())
        if all_unassessed or len(user_comps) == 0:
            return {
                "user_id": user_id,
                "action_type": "TAKE_BASELINE",
                "title": "Take Diagnostic Assessment",
                "description": f"Benchmark baseline capability across all {len(gap_report['competencies'])} role competencies.",
                "target_url": "/assessment",
                "badge": "Step 1"
            }

        # 2. Check if any competency has >= 3 completed materials ready for reassessment
        for comp in gap_report["competencies"]:
            cid = comp["competency_id"]
            c_loop = user_loop.get(cid, {})
            if c_loop.get("materials_completed_since_assessment", 0) >= MATERIALS_TO_REASSESS_THRESHOLD:
                return {
                    "user_id": user_id,
                    "action_type": "TAKE_REASSESSMENT",
                    "title": f"Take Reassessment: {comp['competency_name']}",
                    "description": f"You completed {c_loop.get('materials_completed_since_assessment')} learning modules. Verify capability gain now.",
                    "target_url": f"/reassess?competency_id={cid}",
                    "target_competency_id": cid,
                    "target_competency_name": comp["competency_name"],
                    "badge": "Ready"
                }

        # 3. Check for the highest priority un-gated gap to learn
        unlocked_gaps = [c for c in gap_report["competencies"] if c["gap"] > 0 and not c["is_gated"]]
        if unlocked_gaps:
            top_gap = unlocked_gaps[0]
            return {
                "user_id": user_id,
                "action_type": "START_LEARNING",
                "title": f"Start Learning: {top_gap['competency_name']}",
                "description": f"Address highest priority gap ({top_gap['gap']:.0f} pts deficit) with curated authoritative modules.",
                "target_url": f"/learning",
                "target_competency_id": top_gap["competency_id"],
                "target_competency_name": top_gap["competency_name"],
                "badge": f"{top_gap['priority']} Priority"
            }

        # 4. Check if all gaps are 0 (Mastered)
        if gap_report["total_gap"] <= 0:
            return {
                "user_id": user_id,
                "action_type": "ROLE_MASTERED",
                "title": f"Role Benchmark Mastered!",
                "description": f"You have met or exceeded the threshold across all competencies for {gap_report['role_name']}.",
                "target_url": "/progress",
                "badge": "Mastered"
            }

        # Default fallback
        return {
            "user_id": user_id,
            "action_type": "VIEW_DIAGNOSIS",
            "title": "Review Skill Gap Breakdown",
            "description": "Examine competency graph and prerequisite requirements.",
            "target_url": "/gaps",
            "badge": "Analysis"
        }

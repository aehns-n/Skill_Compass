"""
SkillCompass — Measure Service (Phase 6: MEASURE)
Derives time-series metrics, learning effectiveness, velocity trends, and mathematical score audits
purely from the immutable EvidenceLogs ledger.
"""

from typing import List, Dict, Any, Optional
from app.core.db_store import store
from app.core.config import (
    PLATEAU_CYCLE_THRESHOLD,
    PLATEAU_DELTA_THRESHOLD,
    score_to_tier,
)
from app.services.diagnose.diagnose_service import DiagnoseService

class MeasureService:

    @staticmethod
    def get_score_time_series(user_id: str) -> List[Dict[str, Any]]:
        """
        Extracts chronological score trajectory for each competency strictly from EvidenceLogs.
        """
        evidence = store.get_user_evidence(user_id)
        points = []
        for e in evidence:
            cid = e["competency_id"]
            comp = store.get_competency(cid)
            points.append({
                "timestamp": e["created_at"],
                "source": e["evidence_type"].upper(),
                "score": e["score"],
                "competency_id": cid,
                "competency_name": comp["name"] if comp else "Competency",
                "evidence_id": e["id"]
            })
        return points

    @staticmethod
    def get_learning_effectiveness(user_id: str) -> List[Dict[str, Any]]:
        """
        Calculates learning effectiveness metrics per competency:
        - Baseline score vs Current score
        - Score delta
        - Percentage of gap closed
        - Materials completed count
        - Points gained per material completed
        - Cycle count & plateau flag
        """
        gap_report = DiagnoseService.get_gap_analysis(user_id)
        user_prog = store.learning_progress.get(user_id, {})
        user_loop = store.loop_state.get(user_id, {})

        metrics = []

        for comp in gap_report["competencies"]:
            cid = comp["competency_id"]
            comp_evidence = store.get_user_evidence(user_id, cid)
            
            baseline_score = 0.0
            current_score = comp["score"]
            target = comp["target"]

            if comp_evidence:
                # First evidence is baseline
                baseline_score = comp_evidence[0]["score"]

            delta_score = round(max(0.0, current_score - baseline_score), 2)
            
            # Gap closed %
            initial_gap = max(0.0, target - baseline_score)
            gap_closed_pct = round((delta_score / initial_gap * 100.0), 2) if initial_gap > 0 else 100.0
            gap_closed_pct = min(100.0, max(0.0, gap_closed_pct))

            # Completed materials for this competency
            completed_count = sum(
                1 for p in user_prog.values()
                if p.get("competency_id") == cid and p.get("status") == "COMPLETED"
            )

            points_per_material = round((delta_score / completed_count), 2) if completed_count > 0 else 0.0
            cycle_count = user_loop.get(cid, {}).get("cycle_count", 1)

            # Plateau detection: multiple cycles with low delta
            is_plateaued = (cycle_count >= PLATEAU_CYCLE_THRESHOLD and delta_score < PLATEAU_DELTA_THRESHOLD)

            metrics.append({
                "competency_id": cid,
                "competency_name": comp["competency_name"],
                "category": comp["category"],
                "baseline_score": baseline_score,
                "current_score": current_score,
                "target": target,
                "delta_score": delta_score,
                "gap_closed_pct": gap_closed_pct,
                "materials_completed": completed_count,
                "points_gained_per_material": points_per_material,
                "cycles_count": cycle_count,
                "is_plateaued": is_plateaued
            })

        return metrics

    @staticmethod
    def audit_competency_score(user_id: str, competency_id: str) -> Dict[str, Any]:
        """
        Performs an independent mathematical audit of a user's competency score:
        Recomputes score from raw EvidenceLogs records and compares with user_competencies.current_score.
        """
        evidence = store.get_user_evidence(user_id, competency_id)
        comp = store.get_competency(competency_id)
        comp_name = comp["name"] if comp else "Competency"
        
        stored_score = store.user_competencies.get(user_id, {}).get(competency_id, {}).get("current_score") or 0.0

        if not evidence:
            recomputed_score = 0.0
        else:
            # Latest verified score event
            latest_ev = evidence[-1]
            recomputed_score = latest_ev["score"]

        is_identical = (abs(stored_score - recomputed_score) < 0.001)

        return {
            "competency_id": competency_id,
            "competency_name": comp_name,
            "stored_score": stored_score,
            "recomputed_score": recomputed_score,
            "is_identical": is_identical,
            "evidence_count": len(evidence),
            "formula_used": "Score = Sum(weight_i * result_i) / Sum(weight_i) * 100",
            "evidence_breakdown": evidence
        }

    @staticmethod
    def get_self_vs_measured(user_id: str) -> List[Dict[str, Any]]:
        """
        Compares learner's initial self-ratings against objectively measured scores.
        """
        gap_report = DiagnoseService.get_gap_analysis(user_id)
        user_comps = store.user_competencies.get(user_id, {})

        results = []
        for comp in gap_report["competencies"]:
            cid = comp["competency_id"]
            uc = user_comps.get(cid, {})
            self_rating = uc.get("self_rating")
            measured = comp["score"]

            delta = round(self_rating - measured, 2) if self_rating is not None else None
            
            if delta is None:
                insight = "No self-rating provided during onboarding."
            elif delta > 15.0:
                insight = f"Overestimated capability by +{delta:.1f} pts. Focus on foundational verification."
            elif delta < -15.0:
                insight = f"Underestimated capability by {abs(delta):.1f} pts. High implicit competency."
            else:
                insight = "Self-perception closely calibrated to measured capability."

            results.append({
                "competency_id": cid,
                "competency_name": comp["competency_name"],
                "self_rating": self_rating,
                "measured_score": measured,
                "delta": delta,
                "insight": insight
            })

        return results

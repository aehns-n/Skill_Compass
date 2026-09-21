"""
SkillCompass — Demo Seeder Service (Phase 8: DEV/DEMO Only)
Seeds real database rows, EvidenceLogs, learning progress, and assessments for demo walkthroughs.
"""

import uuid
import datetime
from typing import Dict, Any
from app.core.db_store import store
from app.core.config import score_to_tier
from app.services.profile.profile_service import ProfileService

class DemoSeeder:

    @staticmethod
    def seed_demo_profile(profile_type: str = "baseline", user_id: str = "demo-user-001") -> Dict[str, Any]:
        """
        Seeds synthetic user data with real observable EvidenceLogs:
        - 'baseline': Data Engineer with initial diagnostic completed (SQL: 34%, Python: 45%, Spark: 30%, Airflow: 40%, DW: 35%, Streaming: 25%)
        - 'reassessed': Data Engineer after learning modules (SQL reassessed: 34% -> 72%, completed 3 SQL resources)
        """
        role_id = "11111111-1111-1111-1111-111111111101" # Data Engineer
        
        # 1. Create or reset user profile
        ProfileService.create_or_update_profile(
            name="A. Sharma",
            role_id=role_id,
            user_id=user_id,
            experience_level="1-3 years",
            goals="Transitioning from Junior Developer to Enterprise Data Engineer",
            self_ratings={
                "22222222-2222-2222-2222-222222222101": 55.0, # SQL self rating
                "22222222-2222-2222-2222-222222222102": 60.0, # Python self rating
            }
        )

        # Clear any prior evidence for clean demo state
        store.evidence_logs = [e for e in store.evidence_logs if e["user_id"] != user_id]
        store.learning_progress[user_id] = {}

        now = datetime.datetime.now(datetime.timezone.utc)
        baseline_time = (now - datetime.timedelta(days=7)).isoformat()
        
        # Baseline scores for Data Engineer competencies
        baseline_scores = {
            "22222222-2222-2222-2222-222222222101": 34.0, # SQL & Data Modeling (Target 85)
            "22222222-2222-2222-2222-222222222102": 62.0, # Python / Scala (Target 80)
            "22222222-2222-2222-2222-222222222103": 48.0, # Distributed Computing (Target 75)
            "22222222-2222-2222-2222-222222222104": 50.0, # Airflow Orchestration (Target 80)
            "22222222-2222-2222-2222-222222222105": 38.0, # Data Warehousing (Target 75)
            "22222222-2222-2222-2222-222222222106": 42.0, # Streaming (Target 70)
        }

        # Seed baseline EvidenceLogs
        baseline_assessment_id = str(uuid.uuid4())
        for cid, score in baseline_scores.items():
            tier = score_to_tier(score)
            store.evidence_logs.append({
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "competency_id": cid,
                "evidence_type": "diagnostic",
                "source_id": baseline_assessment_id,
                "score": score,
                "weight": 1.0,
                "metadata": {
                    "tier": tier,
                    "weak_topics": ["Window Functions", "Query Plan Optimization"] if "101" in cid else ["General Architecture"]
                },
                "created_at": baseline_time
            })
            
            store.user_competencies[user_id][cid]["current_score"] = score
            store.user_competencies[user_id][cid]["tier"] = tier
            store.user_competencies[user_id][cid]["last_assessed_at"] = baseline_time
            
            store.loop_state[user_id][cid]["stage"] = "RECOMMEND"
            store.loop_state[user_id][cid]["cycle_count"] = 1
            store.loop_state[user_id][cid]["materials_completed_since_assessment"] = 0

        # If 'reassessed' requested, add completed learning resources and reassessment event
        if profile_type == "reassessed":
            sql_cid = "22222222-2222-2222-2222-222222222101"
            sql_resources = [
                r["resource_id"] for r in store.learning_resources.values()
                if r.get("competency_id") == sql_cid
            ][:3]

            # Mark 3 SQL resources as completed
            for i, rid in enumerate(sql_resources):
                c_time = (now - datetime.timedelta(days=4 - i)).isoformat()
                store.learning_progress[user_id][rid] = {
                    "user_id": user_id,
                    "resource_id": rid,
                    "competency_id": sql_cid,
                    "status": "COMPLETED",
                    "self_rating": 80.0,
                    "completed_at": c_time,
                    "updated_at": c_time
                }

            # Add reassessment evidence event (34% -> 72%)
            reassess_assessment_id = str(uuid.uuid4())
            new_score = 72.0
            new_tier = score_to_tier(new_score)
            reassess_time = (now - datetime.timedelta(hours=2)).isoformat()

            store.evidence_logs.append({
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "competency_id": sql_cid,
                "evidence_type": "reassessment",
                "source_id": reassess_assessment_id,
                "score": new_score,
                "weight": 1.0,
                "metadata": {
                    "tier": new_tier,
                    "delta": 38.0,
                    "weak_topics": []
                },
                "created_at": reassess_time
            })

            store.user_competencies[user_id][sql_cid]["current_score"] = new_score
            store.user_competencies[user_id][sql_cid]["tier"] = new_tier
            store.user_competencies[user_id][sql_cid]["last_assessed_at"] = reassess_time

            store.loop_state[user_id][sql_cid]["stage"] = "MEASURE"
            store.loop_state[user_id][sql_cid]["cycle_count"] = 2
            store.loop_state[user_id][sql_cid]["materials_completed_since_assessment"] = 3
            store.loop_state[user_id][sql_cid]["last_score_change"] = 38.0

        return {
            "message": f"Demo profile '{profile_type}' successfully seeded with real EvidenceLogs.",
            "user_id": user_id,
            "role": "Data Engineer",
            "profile_type": profile_type,
            "evidence_count": len(store.get_user_evidence(user_id))
        }

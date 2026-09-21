"""
SkillCompass — Profile Service (Phase 2)
Handles learner onboarding, role benchmarks, profile initialization, and self-ratings.
"""

import uuid
import datetime
from typing import List, Dict, Any, Optional
from app.core.db_store import store
from app.core.config import rank_to_priority

class ProfileService:
    @staticmethod
    def get_all_roles() -> List[Dict[str, Any]]:
        """Returns all database roles with their competencies, targets, ranks, and derived priorities."""
        roles_list = []
        for role_id, role in store.roles.items():
            rcs = store.get_role_competencies(role_id)
            # Sort by rank ascending
            rcs.sort(key=lambda x: x["rank"])
            
            comps_summary = []
            for rc in rcs:
                comp = store.get_competency(rc["competency_id"])
                prereqs = store.get_prerequisites_for_competency(rc["competency_id"])
                prereq_names = [
                    store.get_competency(p["prerequisite_id"])["name"]
                    for p in prereqs if store.get_competency(p["prerequisite_id"])
                ]
                comps_summary.append({
                    "id": rc["competency_id"],
                    "name": comp["name"] if comp else "Unknown",
                    "category": comp["category"] if comp else "General",
                    "description": comp["description"] if comp else "",
                    "target": rc["target"],
                    "rank": rc["rank"],
                    "priority": rank_to_priority(rc["rank"]),
                    "benchmark_rationale": comp["description"] if comp else "",
                    "prerequisites": prereq_names,
                })
            
            roles_list.append({
                "id": role_id,
                "name": role["name"],
                "description": role["description"],
                "competencies_count": len(comps_summary),
                "competencies": comps_summary
            })
        return roles_list

    @staticmethod
    def get_role_by_id(role_id: str) -> Optional[Dict[str, Any]]:
        for r in ProfileService.get_all_roles():
            if r["id"] == role_id:
                return r
        return None

    @staticmethod
    def create_or_update_profile(
        name: str,
        role_id: str,
        user_id: Optional[str] = None,
        email: Optional[str] = None,
        experience_level: str = "Entry-level",
        goals: Optional[str] = None,
        self_ratings: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Creates or updates a user profile. Initializes user_competencies rows (score null)
        and loop_state rows (stage = ASSESS) for each competency in the chosen role.
        """
        if not user_id:
            user_id = str(uuid.uuid4())
            
        role = store.get_role(role_id)
        if not role:
            raise ValueError(f"Role ID {role_id} not found in database.")

        store.users[user_id] = {
            "id": user_id,
            "name": name,
            "email": email or f"{name.lower().replace(' ', '.')}@example.com",
            "role_id": role_id,
            "role_name": role["name"],
            "experience_level": experience_level,
            "goals": goals or "Targeting role competency mastery",
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }

        # Initialize user competencies and loop state for the role
        if user_id not in store.user_competencies:
            store.user_competencies[user_id] = {}
        if user_id not in store.loop_state:
            store.loop_state[user_id] = {}

        rcs = store.get_role_competencies(role_id)
        for rc in rcs:
            cid = rc["competency_id"]
            self_score = (self_ratings or {}).get(cid)
            
            # user_competencies row
            if cid not in store.user_competencies[user_id]:
                store.user_competencies[user_id][cid] = {
                    "user_id": user_id,
                    "competency_id": cid,
                    "current_score": None,
                    "tier": None,
                    "self_rating": self_score, # Stored, NEVER used in scoring math
                    "last_assessed_at": None,
                    "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                    "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
                }
            elif self_score is not None:
                store.user_competencies[user_id][cid]["self_rating"] = self_score

            # loop_state row initialized to ASSESS stage
            if cid not in store.loop_state[user_id]:
                store.loop_state[user_id][cid] = {
                    "user_id": user_id,
                    "competency_id": cid,
                    "stage": "ASSESS",
                    "cycle_count": 0,
                    "materials_completed_since_assessment": 0,
                    "last_score_change": 0.0,
                    "is_stuck_plateau": False,
                    "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
                }

        return ProfileService.get_profile(user_id)

    @staticmethod
    def get_profile(user_id: str) -> Dict[str, Any]:
        user = store.users.get(user_id)
        if not user:
            # Return default demo profile if user not initialized yet
            role_id = "11111111-1111-1111-1111-111111111101" # Data Engineer
            return ProfileService.create_or_update_profile(
                name="A. Sharma",
                role_id=role_id,
                user_id=user_id,
                experience_level="1-3 years"
            )

        user_comps = []
        user_c_dict = store.user_competencies.get(user_id, {})
        for cid, uc in user_c_dict.items():
            comp = store.get_competency(cid)
            user_comps.append({
                "competency_id": cid,
                "competency_name": comp["name"] if comp else "Unknown",
                "category": comp["category"] if comp else "General",
                "current_score": uc.get("current_score"),
                "tier": uc.get("tier"),
                "self_rating": uc.get("self_rating"),
                "last_assessed_at": uc.get("last_assessed_at")
            })

        return {
            "user_id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role_id": user["role_id"],
            "role_name": user["role_name"],
            "experience_level": user["experience_level"],
            "goals": user.get("goals"),
            "competencies": user_comps,
            "created_at": user["created_at"]
        }

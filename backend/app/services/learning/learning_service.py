"""
SkillCompass — Learning Service (Phase 4: RECOMMEND + LEARN)
Handles DAG-ordered learning path assembly, weak-topic ranked resource recommendation,
lesson module chunk rendering, and learning progress tracking with loop state incrementation.
"""

import datetime
from typing import List, Dict, Any, Optional
from app.core.db_store import store
from app.core.config import MATERIALS_TO_REASSESS_THRESHOLD
from app.services.diagnose.diagnose_service import DiagnoseService

class LearningService:

    @staticmethod
    def get_learning_path(user_id: str) -> Dict[str, Any]:
        """
        Builds a personalized learning path. Orders competencies by DAG prerequisites
        and priority rank. Recommends resources ranked by weak topics, authority, and quality.
        """
        gap_report = DiagnoseService.get_gap_analysis(user_id)
        role_id = gap_report["role_id"]
        user_progress = store.learning_progress.get(user_id, {})

        competency_paths = []

        # Sort competencies so non-gated, high-priority gaps come first
        sorted_comps = sorted(
            gap_report["competencies"],
            key=lambda c: (c["is_gated"], -c["priority_rank"], -c["gap"])
        )

        for comp in sorted_comps:
            cid = comp["competency_id"]
            if comp["gap"] <= 0:
                continue # Skip mastered competencies with 0 gap

            weak_topics = set(comp.get("weak_topics", []))
            
            # Fetch resources for this competency
            available_resources = [
                r for r in store.learning_resources.values() 
                if r.get("competency_id") == cid
            ]

            # Score each resource for personalized ranking
            scored_resources = []
            for res in available_resources:
                rid = res["resource_id"]
                prog = user_progress.get(rid, {})
                is_completed = (prog.get("status") == "COMPLETED")
                
                # Check weak topic match
                res_topic = res.get("topic_subtopic", "")
                is_weak_match = any(wt.lower() in res_topic.lower() or wt.lower() in res["title"].lower() for wt in weak_topics)
                
                # Ranking score
                match_weight = 40.0 if is_weak_match else 0.0
                quality_weight = float(res.get("quality_score", 85.0)) * 0.4
                auth_weight = float(res.get("authority_score", 90.0)) * 0.2
                rank_score = match_weight + quality_weight + auth_weight
                
                reason = "Direct match for identified weak focus area" if is_weak_match else "High-authority foundational specification"
                
                scored_resources.append({
                    "id": rid,
                    "title": res["title"],
                    "description": res["description"],
                    "resource_type": res.get("resource_type", "documentation"),
                    "url": res["url"],
                    "difficulty": res.get("difficulty", "intermediate"),
                    "estimated_minutes": res.get("estimated_minutes", 20),
                    "authority_score": float(res.get("authority_score", 90.0)),
                    "quality_score": float(res.get("quality_score", 85.0)),
                    "aligned_topic": res_topic,
                    "is_completed": is_completed,
                    "relevance_reason": reason,
                    "_rank_score": rank_score
                })

            # Sort resources by rank score descending (weak matches first, then uncompleted)
            scored_resources.sort(key=lambda x: (x["is_completed"], -x["_rank_score"]))
            
            # Clean internal scoring key
            cleaned_resources = []
            for r in scored_resources:
                item = dict(r)
                item.pop("_rank_score", None)
                cleaned_resources.append(item)

            competency_paths.append({
                "competency_id": cid,
                "competency_name": comp["competency_name"],
                "priority_rank": comp["priority_rank"],
                "is_gated": comp["is_gated"],
                "blocked_by": comp["blocked_by"],
                "gap": comp["gap"],
                "current_score": comp["score"],
                "target": comp["target"],
                "resources": cleaned_resources[:6] # Top 6 recommended
            })

        return {
            "user_id": user_id,
            "role_id": role_id,
            "paths": competency_paths
        }

    @staticmethod
    def get_resource_module(resource_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Returns full module detail including extracted semantic chunks for focused reading.
        """
        res = store.learning_resources.get(resource_id)
        if not res:
            return None

        cid = res["competency_id"]
        comp = store.get_competency(cid)
        comp_name = comp["name"] if comp else "Competency"

        # Get semantic chunks for this resource
        chunks = [
            ch for ch in store.resource_chunks.values() 
            if ch.get("resource_id") == resource_id
        ]
        chunks.sort(key=lambda x: x.get("chunk_index", 0))

        chunk_summaries = []
        for ch in chunks:
            chunk_summaries.append({
                "chunk_index": ch.get("chunk_index", 0),
                "topic_subtopic": ch.get("topic_subtopic", "General"),
                "chunk_text": ch.get("chunk_text", ""),
                "token_count": ch.get("token_count", 250)
            })

        status = "NOT_STARTED"
        if user_id and user_id in store.learning_progress:
            status = store.learning_progress[user_id].get(resource_id, {}).get("status", "NOT_STARTED")

        return {
            "resource_id": resource_id,
            "title": res["title"],
            "description": res["description"],
            "resource_type": res.get("resource_type", "documentation"),
            "url": res["url"],
            "difficulty": res.get("difficulty", "intermediate"),
            "estimated_minutes": res.get("estimated_minutes", 20),
            "competency_id": cid,
            "competency_name": comp_name,
            "status": status,
            "chunks": chunk_summaries
        }

    @staticmethod
    def update_learning_progress(
        user_id: str,
        resource_id: str,
        status: str,
        self_rating: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Updates resource completion status in learning_progress and increments
        materials_completed_since_assessment in loop_state.
        """
        res = store.learning_resources.get(resource_id)
        if not res:
            raise ValueError(f"Resource ID {resource_id} not found.")

        cid = res["competency_id"]
        if user_id not in store.learning_progress:
            store.learning_progress[user_id] = {}

        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        # Check if already completed previously to prevent double counting
        prev_status = store.learning_progress[user_id].get(resource_id, {}).get("status")
        
        store.learning_progress[user_id][resource_id] = {
            "user_id": user_id,
            "resource_id": resource_id,
            "competency_id": cid,
            "status": status,
            "self_rating": self_rating,
            "completed_at": now_iso if status == "COMPLETED" else None,
            "updated_at": now_iso
        }

        # Update loop state
        if user_id not in store.loop_state:
            store.loop_state[user_id] = {}
        if cid not in store.loop_state[user_id]:
            store.loop_state[user_id][cid] = {
                "user_id": user_id,
                "competency_id": cid,
                "stage": "LEARN",
                "cycle_count": 1,
                "materials_completed_since_assessment": 0,
                "last_score_change": 0.0,
                "is_stuck_plateau": False,
                "updated_at": now_iso
            }

        if status == "COMPLETED" and prev_status != "COMPLETED":
            count = store.loop_state[user_id][cid].get("materials_completed_since_assessment", 0) + 1
            store.loop_state[user_id][cid]["materials_completed_since_assessment"] = count
            store.loop_state[user_id][cid]["stage"] = "LEARN"
            store.loop_state[user_id][cid]["updated_at"] = now_iso

        return {
            "user_id": user_id,
            "resource_id": resource_id,
            "competency_id": cid,
            "status": status,
            "materials_completed_since_assessment": store.loop_state[user_id][cid].get("materials_completed_since_assessment", 0),
            "ready_for_reassessment": store.loop_state[user_id][cid].get("materials_completed_since_assessment", 0) >= MATERIALS_TO_REASSESS_THRESHOLD,
            "updated_at": now_iso
        }

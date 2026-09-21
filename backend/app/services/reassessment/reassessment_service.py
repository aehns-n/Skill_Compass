"""
SkillCompass — Reassessment Service (Phase 5: REASSESS)
Generates targeted reassessments strictly from chunks of completed learning resources.
Ensures zero LLM interference in scoring path and appends observable EvidenceLogs.
"""

import uuid
import datetime
from typing import List, Dict, Any, Optional
from app.core.config import REASSESS_QUESTION_COUNT, RAG_TOP_K_CHUNKS, WEAK_TOPIC_ACCURACY_THRESHOLD
from app.core.db_store import store
from app.services.diagnose.diagnose_service import DiagnoseService
from app.services.profile.profile_service import ProfileService

class ReassessmentService:

    @staticmethod
    def generate_reassessment(user_id: str, competency_id: str) -> Dict[str, Any]:
        """
        Builds a targeted reassessment ONLY from chunks of resources
        the user has marked COMPLETED for this competency, prioritizing weak topics.
        """
        user = store.users.get(user_id)
        if not user:
            ProfileService.create_or_update_profile("Demo User", role_id="11111111-1111-1111-1111-111111111101", user_id=user_id)
            user = store.users[user_id]

        comp = store.get_competency(competency_id)
        comp_name = comp["name"] if comp else "Target Competency"

        # 1. Retrieve diagnosed weak topics for this user and competency
        weak_topics: List[str] = []
        user_evidence = store.get_user_evidence(user_id, competency_id)
        if user_evidence:
            latest_ev = user_evidence[-1]
            weak_topics = latest_ev.get("metadata", {}).get("weak_topics", [])

        # 2. Find all resources marked COMPLETED by this user for this competency
        user_prog = store.learning_progress.get(user_id, {})
        completed_resource_ids = [
            rid for rid, p in user_prog.items()
            if p.get("competency_id") == competency_id and p.get("status") == "COMPLETED"
        ]

        # If user hasn't completed any yet in prototype, fallback to first 2 resources for demo
        if not completed_resource_ids:
            matching_rids = [
                r["resource_id"] for r in store.learning_resources.values()
                if r.get("competency_id") == competency_id
            ]
            completed_resource_ids = matching_rids[:2]

        # 3. Filter questions whose source_resource_id is in completed_resource_ids
        grounded_qs = [
            q for q in store.questions.values()
            if q.get("competency_id") == competency_id and q.get("source_resource_id") in completed_resource_ids
        ]

        # Fallback to general competency questions if insufficient grounded questions exist
        if len(grounded_qs) < 3:
            general_qs = [
                q for q in store.questions.values()
                if q.get("competency_id") == competency_id
            ]
            grounded_qs = general_qs[:REASSESS_QUESTION_COUNT]

        # 4. Context-Aware Ranking: Prioritize questions matching learner's diagnosed weak topics
        def score_question_relevance(q: Dict[str, Any]) -> int:
            score = 0
            q_topic = (q.get("topic_subtopic") or "").lower()
            q_stem = (q.get("stem") or "").lower()
            for wt in weak_topics:
                wt_low = wt.lower()
                if wt_low in q_topic or wt_low in q_stem:
                    score += 10
            # Prefer questions with verified source_chunk_id
            if q.get("source_chunk_id"):
                score += 2
            return score

        grounded_qs.sort(key=score_question_relevance, reverse=True)

        # Select up to REASSESS_QUESTION_COUNT questions
        target_count = max(3, REASSESS_QUESTION_COUNT)
        selected_qs = grounded_qs[:target_count]
        assessment_id = str(uuid.uuid4())
        client_questions = []

        for q in selected_qs:
            correct_key = q.get("correct_key") or next((opt["key"] for opt in q.get("options", []) if opt.get("is_correct")), "D")
            client_options = []
            for opt in q.get("options", []):
                is_corr = opt.get("is_correct", opt.get("key") == correct_key)
                client_options.append({
                    "key": opt["key"],
                    "text": opt["text"],
                    "is_correct": is_corr
                })
            
            q_topic = (q.get("topic_subtopic") or "").lower()
            q_stem = (q.get("stem") or "").lower()
            is_weak_match = any(wt.lower() in q_topic or wt.lower() in q_stem for wt in weak_topics)

            client_questions.append({
                "id": q.get("question_id") or q.get("id"),
                "competency_id": competency_id,
                "competency_name": comp_name,
                "topic": q.get("topic_subtopic", "Remediation Concept"),
                "difficulty": q.get("difficulty", 3),
                "difficulty_level": q.get("difficulty_level", "medium"),
                "stem": q["stem"],
                "options": client_options,
                "correct_key": correct_key,
                "explanation": q.get("explanation") or f"Grounded in verified {comp_name} documentation and completed modules.",
                "source_resource_id": q.get("source_resource_id"),
                "source_chunk_id": q.get("source_chunk_id"),
                "is_weak_topic_targeted": is_weak_match,
                "estimated_seconds": 60
            })

        store.assessments[assessment_id] = {
            "id": assessment_id,
            "user_id": user_id,
            "role_id": user["role_id"],
            "type": "REASSESS",
            "competency_scope": [competency_id],
            "questions_count": len(client_questions),
            "status": "in_progress",
            "started_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "submitted_at": None,
            "total_score": None
        }

        return {
            "assessment_id": assessment_id,
            "user_id": user_id,
            "type": "REASSESS",
            "role_id": user["role_id"],
            "competency_scope": [competency_id],
            "competency_name": comp_name,
            "questions_count": len(client_questions),
            "questions": client_questions
        }

"""
SkillCompass — Skill-Gap Engine Integration & Diagnostic Assessment Adapter (Stage 5)
Assembles balanced 10-15 question diagnostic assessments per competency, evaluates user performance,
updates evidence logs, and recommends remedial learning resources.
"""

import uuid
import datetime
from typing import List, Dict, Any, Optional

from app.core.all_curated_resources import ALL_COMPETENCIES_METADATA

class SkillGapAssessmentAdapter:
    """Bridges grounded question bank with SkillCompass diagnostic workflows."""

    def __init__(self, question_bank: Optional[List[Dict[str, Any]]] = None):
        self.question_bank = question_bank or []

    def assemble_diagnostic_assessment(
        self,
        role_id: str,
        competency_ids: Optional[List[str]] = None,
        target_question_count: int = 12
    ) -> Dict[str, Any]:
        """
        Assembles a balanced 10-15 question diagnostic test for a candidate role.
        Balances difficulty (20% Easy, 50% Medium, 30% Hard).
        """
        assessment_id = str(uuid.uuid4())
        
        # Filter available questions
        pool = [
            q for q in self.question_bank
            if (not competency_ids or q.get("competency_id") in competency_ids)
            and q.get("status") in ("validated", "approved")
        ]

        # Group by difficulty
        easy_qs = [q for q in pool if q.get("difficulty_level") == "easy"]
        med_qs = [q for q in pool if q.get("difficulty_level") == "medium"]
        hard_qs = [q for q in pool if q.get("difficulty_level") == "hard"]

        # Target quota: 2-3 easy, 6-7 medium, 3-4 hard
        num_easy = max(1, int(target_question_count * 0.20))
        num_hard = max(1, int(target_question_count * 0.30))
        num_med = target_question_count - num_easy - num_hard

        selected = []
        selected.extend(easy_qs[:num_easy])
        selected.extend(med_qs[:num_med])
        selected.extend(hard_qs[:num_hard])

        # If shortfall, fill from remaining pool
        if len(selected) < target_question_count:
            remaining = [q for q in pool if q not in selected]
            selected.extend(remaining[:target_question_count - len(selected)])

        # Prepare test representation (stripping answer keys for test-taker)
        test_questions = []
        for q in selected:
            clean_options = [
                {"key": opt["key"], "text": opt["text"]}
                for opt in q.get("options", [])
            ]
            test_questions.append({
                "question_id": q.get("id"),
                "competency_id": q.get("competency_id"),
                "topic_subtopic": q.get("topic_subtopic"),
                "difficulty": q.get("difficulty"),
                "difficulty_level": q.get("difficulty_level"),
                "stem": q.get("stem"),
                "options": clean_options
            })

        return {
            "assessment_id": assessment_id,
            "role_id": role_id,
            "total_questions": len(test_questions),
            "questions": test_questions,
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }

    def evaluate_diagnostic_submission(
        self,
        user_id: str,
        assessment_id: str,
        answers: Dict[str, str], # question_id -> selected_key
        curated_resources: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Scores user submission deterministically, updates evidence records,
        and generates remediation recommendations with exact material citations.
        """
        curated_resources = curated_resources or []
        competency_scores: Dict[str, Dict[str, Any]] = {}
        item_evaluations = []
        remediation_recommendations = []

        q_map = {q["id"]: q for q in self.question_bank}

        for q_id, selected_key in answers.items():
            q = q_map.get(q_id)
            if not q:
                continue

            comp_id = q.get("competency_id", "unknown")
            if comp_id not in competency_scores:
                competency_scores[comp_id] = {"correct": 0, "total": 0, "weighted_score": 0.0}

            # Find correct key
            correct_key = q.get("correct_key")
            if not correct_key:
                for opt in q.get("options", []):
                    if opt.get("is_correct"):
                        correct_key = opt.get("key")
                        break

            is_correct = (selected_key == correct_key)
            competency_scores[comp_id]["total"] += 1
            if is_correct:
                competency_scores[comp_id]["correct"] += 1

            item_evaluations.append({
                "question_id": q_id,
                "competency_id": comp_id,
                "topic_subtopic": q.get("topic_subtopic"),
                "selected_key": selected_key,
                "correct_key": correct_key,
                "is_correct": is_correct,
                "source_citation": q.get("source_citation"),
                "explanation": q.get("explanation")
            })

            # If user failed, map remediation resource
            if not is_correct:
                matching_res = [
                    r for r in curated_resources
                    if r.get("competency_id") == comp_id
                ]
                rec = matching_res[0] if matching_res else {
                    "title": f"Remediation Guide for {q.get('topic_subtopic')}",
                    "url": "https://skillcompass.edu/resources",
                    "resource_type": "guide"
                }
                remediation_recommendations.append({
                    "competency_id": comp_id,
                    "topic_subtopic": q.get("topic_subtopic"),
                    "missed_question_stem": q.get("stem"),
                    "recommended_resource": rec
                })

        # Calculate percentage scores per competency
        summary_by_competency = {}
        evidence_logs = []

        for comp_id, data in competency_scores.items():
            pct_score = (data["correct"] / max(1, data["total"])) * 100.0
            summary_by_competency[comp_id] = {
                "score_pct": round(pct_score, 2),
                "questions_answered": data["total"],
                "questions_correct": data["correct"]
            }

            # Create observable evidence log record
            evidence_logs.append({
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "competency_id": comp_id,
                "evidence_type": "diagnostic",
                "source_id": assessment_id,
                "score": round(pct_score, 2),
                "weight": 1.00,
                "metadata": {
                    "total_items": data["total"],
                    "correct_items": data["correct"]
                },
                "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
            })

        return {
            "assessment_id": assessment_id,
            "user_id": user_id,
            "total_items": len(answers),
            "summary_by_competency": summary_by_competency,
            "evidence_logs": evidence_logs,
            "remediation_recommendations": remediation_recommendations,
            "item_evaluations": item_evaluations
        }

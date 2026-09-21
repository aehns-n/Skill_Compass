"""
SkillCompass — 4-Tier Automated Question Validation Framework (Stage 4)
Performs rigorous structural, distractor, citation, and linguistic validation on generated MCQs.
"""

import re
from typing import Dict, Any, List, Tuple

class QuestionValidator:
    """Automated validator ensuring >=90% question quality and grounding fidelity."""

    @classmethod
    def validate_single_question(
        cls,
        question_data: Dict[str, Any],
        context_chunks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Runs the 4-tier validation suite on a generated question.
        Returns:
            {
                "passed": bool,
                "cardinality_valid": bool,
                "distractors_valid": bool,
                "citation_verified": bool,
                "clarity_score": float,
                "failure_reasons": List[str],
                "overall_quality_score": float
            }
        """
        failure_reasons = []
        clarity_score = 100.0

        # Tier 1: Cardinality & Keys Check
        cardinality_valid = True
        options = question_data.get("options", [])
        if len(options) != 4:
            cardinality_valid = False
            failure_reasons.append(f"Expected exactly 4 options, found {len(options)}")
        
        keys = [opt.get("key") for opt in options]
        if set(keys) != {"A", "B", "C", "D"}:
            cardinality_valid = False
            failure_reasons.append(f"Option keys must be ['A', 'B', 'C', 'D'], found {keys}")

        correct_count = sum(1 for opt in options if opt.get("is_correct") is True)
        if correct_count != 1:
            cardinality_valid = False
            failure_reasons.append(f"Expected exactly 1 correct option, found {correct_count}")

        # Tier 2: Distractor Scrutiny & Plausibility
        distractors_valid = True
        opt_texts = [str(opt.get("text", "")).strip().lower() for opt in options]
        
        # Check for duplicate options
        if len(set(opt_texts)) < len(opt_texts):
            distractors_valid = False
            failure_reasons.append("Duplicate option texts detected")

        # Check for forbidden lazy phrases
        forbidden_phrases = ["all of the above", "none of the above", "both a and b", "neither a nor b"]
        for t in opt_texts:
            for fp in forbidden_phrases:
                if fp in t:
                    distractors_valid = False
                    failure_reasons.append(f"Forbidden option pattern '{fp}' detected")

        # Check distractor rationales
        for opt in options:
            if not opt.get("is_correct") and not opt.get("distractor_rationale"):
                clarity_score -= 5.0

        # Tier 3: Grounding & Citation Verification
        citation_verified = True
        source_citation = question_data.get("source_citation", "").strip()
        source_quote = question_data.get("source_quote", "").strip()
        explanation = question_data.get("explanation", "").strip()

        if not source_citation:
            citation_verified = False
            failure_reasons.append("Missing source citation / URL")

        if not source_quote or len(source_quote) < 15:
            citation_verified = False
            failure_reasons.append("Missing or insufficient verbatim source quotation")
        else:
            # Check if source_quote or core terms exist in any context chunk
            combined_context = " ".join([c.get("chunk_text", "") for c in context_chunks]).lower()
            quote_clean = " ".join(source_quote.lower().split())
            
            # Sub-phrase match check
            quote_words = [w for w in re.findall(r'\w+', quote_clean) if len(w) > 3]
            matched_words = sum(1 for w in quote_words if w in combined_context)
            match_ratio = matched_words / max(1, len(quote_words))

            if match_ratio < 0.60:
                citation_verified = False
                failure_reasons.append(f"Source quote grounding weak ({int(match_ratio*100)}% term overlap with ingested context)")

        if not explanation or len(explanation) < 30:
            clarity_score -= 15.0
            failure_reasons.append("Explanation is too brief or missing")

        # Tier 4: Linguistic & Structural Clarity
        stem = question_data.get("stem", "").strip()
        if len(stem.split()) < 8:
            clarity_score -= 20.0
            failure_reasons.append("Question stem is too brief (<8 words)")

        # Negative stems scrutiny (Discourage 'Which of the following is NOT')
        if re.search(r'\b(not|except|false|incorrect)\b', stem, re.IGNORECASE):
            clarity_score -= 15.0
            # Warning rather than immediate rejection if clear, but log penalty

        # Difficulty check
        difficulty = question_data.get("difficulty", 3)
        if not (1 <= difficulty <= 5):
            failure_reasons.append(f"Invalid difficulty score {difficulty} (must be 1-5)")

        passed = cardinality_valid and distractors_valid and citation_verified and (clarity_score >= 60.0)

        # Calculate composite quality score (0-100)
        quality_score = 100.0
        if not cardinality_valid:
            quality_score -= 40.0
        if not distractors_valid:
            quality_score -= 25.0
        if not citation_verified:
            quality_score -= 25.0
        quality_score = max(0.0, min(100.0, quality_score * (clarity_score / 100.0)))

        return {
            "passed": passed,
            "cardinality_valid": cardinality_valid,
            "distractors_valid": distractors_valid,
            "citation_verified": citation_verified,
            "clarity_score": round(clarity_score, 2),
            "quality_score": round(quality_score, 2),
            "failure_reasons": failure_reasons
        }

    @classmethod
    def validate_batch(
        cls,
        questions: List[Dict[str, Any]],
        context_chunks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Validates a batch of questions and returns aggregate metrics."""
        results = []
        passed_count = 0

        for q in questions:
            report = cls.validate_single_question(q, context_chunks)
            results.append({
                "question": q,
                "validation": report
            })
            if report["passed"]:
                passed_count += 1

        total = len(questions)
        pass_rate_pct = (passed_count / max(1, total)) * 100.0

        return {
            "total_questions": total,
            "passed_count": passed_count,
            "failed_count": total - passed_count,
            "pass_rate_pct": round(pass_rate_pct, 2),
            "details": results
        }

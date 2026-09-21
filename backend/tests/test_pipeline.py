"""
SkillCompass — Comprehensive Pipeline & Question Generation Test Suite
Tests Stage 1 through Stage 5 components and end-to-end execution.
"""

import pytest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.all_curated_resources import generate_curated_resources_dataset, ALL_COMPETENCIES_METADATA
from app.services.ingestion.freshness_validator import FreshnessAndAuthorityValidator
from app.services.ingestion.connectors import OfficialDocsConnector, GitHubCurriculumConnector, TranscriptConnector
from app.services.ingestion.pipeline import MaterialIngestionPipeline
from app.services.vectorization.extractors import HTMLExtractor, MarkdownExtractor, TranscriptExtractor
from app.services.vectorization.chunker import SemanticChunker
from app.services.vectorization.embedder import EmbeddingService
from app.services.vectorization.vector_store import VectorStore
from app.services.question_generator.validator import QuestionValidator
from app.services.question_generator.generator import GroundedQuestionGenerator
from app.services.skill_gap.assessment_adapter import SkillGapAssessmentAdapter
from app.services.pipeline_orchestrator import SkillCompassPipeline

def test_stage_1_curated_resources_coverage():
    """Verify that all 17 competencies have exactly 10 curated resources (170 total)."""
    resources = generate_curated_resources_dataset()
    assert len(resources) == 170, f"Expected 170 resources, got {len(resources)}"
    
    # Check all 17 competencies are covered
    comp_ids = set(r["competency_id"] for r in resources)
    assert len(comp_ids) == 17, f"Expected 17 distinct competencies, got {len(comp_ids)}"
    
    # Check that all resources have high authority scores
    for r in resources:
        assert r["authority_score"] >= 90.0, f"Resource {r['title']} has low authority {r['authority_score']}"
        assert r["url"].startswith("http"), f"Resource {r['title']} has invalid URL"
        assert len(r["alignment_notes"]) > 20, f"Resource {r['title']} missing alignment notes"

def test_stage_2_freshness_and_authority_validation():
    """Verify freshness and authority scoring rules."""
    validator = FreshnessAndAuthorityValidator()
    
    # Authoritative and fresh resource
    res_valid = {
        "url": "https://www.postgresql.org/docs/current/queries-with.html",
        "resource_type": "documentation",
        "category": "Data Architecture",
        "last_updated": "2024-03-01"
    }
    check = validator.validate_resource(res_valid)
    assert check["is_valid"] is True
    assert check["authority_score"] >= 95.0

    # Stale resource in fast-moving category (>12 months)
    res_stale = {
        "url": "https://docs.aws.amazon.com/vpc/latest/userguide/",
        "resource_type": "documentation",
        "category": "Cloud Networking", # Fast moving
        "last_updated": "2022-01-01" # > 24 months old
    }
    check_stale = validator.validate_resource(res_stale)
    assert check_stale["is_fresh"] is False
    assert check_stale["is_valid"] is False

def test_stage_2_connectors_and_ingestion_error_rate():
    """Verify that ingestion pipeline achieves <2% parse error rate."""
    pipeline = MaterialIngestionPipeline()
    comp = ALL_COMPETENCIES_METADATA[0]
    
    run_log = pipeline.run_discovery_for_competency(
        competency_id=comp["id"],
        competency_name=comp["name"],
        category=comp["category"],
        topic_keywords=comp["subtopics"]
    )
    
    assert run_log["items_discovered"] > 0
    assert run_log["items_ingested"] > 0
    assert run_log["error_rate_pct"] < 2.0
    assert run_log["status"] == "completed"

def test_stage_3_multi_format_extractors():
    """Verify HTML, Markdown, and Transcript text extractors."""
    html_sample = "<html><head><title>SQL Guide</title><style>.x{color:red;}</style></head><body><h1>Header</h1><p>Sample paragraph.</p><pre>SELECT * FROM tbl;</pre></body></html>"
    extracted_html = HTMLExtractor.extract(html_sample)
    assert extracted_html["title"] == "SQL Guide"
    assert "Sample paragraph." in extracted_html["text"]
    assert "SELECT * FROM tbl;" in extracted_html["code_blocks"][0]

    md_sample = "# Topic Title\n\nSome text.\n\n```python\ndef test():\n    pass\n```"
    extracted_md = MarkdownExtractor.extract(md_sample)
    assert len(extracted_md["headings"]) > 0
    assert len(extracted_md["code_blocks"]) > 0

    trans_sample = "[00:15] Welcome to the lecture. [01:30] Today we discuss BGP."
    extracted_trans = TranscriptExtractor.extract(trans_sample)
    assert "[00:15]" not in extracted_trans["text"]
    assert "Welcome to the lecture." in extracted_trans["text"]

def test_stage_3_semantic_chunker_and_quality():
    """Verify semantic chunking within 300-500 tokens and quality score."""
    chunker = SemanticChunker(target_tokens=350, max_tokens=500)
    sample_text = ("In database systems, index optimization is paramount. " * 30) + "\n\n" + ("B-Tree indexes provide logarithmic search times. " * 30)
    
    chunks = chunker.chunk_text(
        text=sample_text,
        resource_id="res-001",
        competency_id="comp-001",
        topic_subtopic="SQL Indexing"
    )
    
    assert len(chunks) >= 1
    for c in chunks:
        assert c["token_count"] <= 550
        assert c["quality_score"] >= 70.0
        assert c["topic_subtopic"] == "SQL Indexing"

def test_stage_3_vector_store_retrieval_latency():
    """Verify vector search retrieval latency is under 200ms."""
    store = VectorStore()
    chunker = SemanticChunker()
    
    sample_chunks = chunker.chunk_text(
        text="PostgreSQL recursive CTE queries with window functions enable hierarchy traversal and analytics.",
        resource_id="res-101",
        competency_id="22222222-2222-2222-2222-222222222101",
        topic_subtopic="SQL: Window Functions"
    )
    store.add_chunks(sample_chunks)
    
    search_res = store.search(
        query="recursive CTE window function",
        competency_id="22222222-2222-2222-2222-222222222101",
        top_k=3
    )
    
    assert len(search_res["results"]) > 0
    assert search_res["retrieval_latency_ms"] < 200.0, f"Latency {search_res['retrieval_latency_ms']}ms exceeded 200ms target"

def test_stage_4_question_validator_rules():
    """Verify 4-tier validation filters against valid and corrupted MCQs."""
    validator = QuestionValidator()
    
    context = [{
        "chunk_text": "PostgreSQL EXPLAIN ANALYZE command executes the query and shows execution time along with plan costs.",
        "source_title": "PostgreSQL Planner Guide",
        "source_url": "https://postgresql.org/docs/explain"
    }]

    # Valid MCQ
    valid_q = {
        "stem": "What is the primary function of executing EXPLAIN ANALYZE on a complex SQL query?",
        "options": [
            {"key": "A", "text": "It executes the query and displays actual runtime alongside estimated planner costs.", "is_correct": True, "distractor_rationale": None},
            {"key": "B", "text": "It truncates the table data and resets surrogate primary key sequences.", "is_correct": False, "distractor_rationale": "Wrong"},
            {"key": "C", "text": "It disables MVCC and runs exclusively in uncommitted memory buffers.", "is_correct": False, "distractor_rationale": "Wrong"},
            {"key": "D", "text": "It converts all hash joins into external merge joins on disk.", "is_correct": False, "distractor_rationale": "Wrong"}
        ],
        "source_citation": "PostgreSQL Planner Guide (https://postgresql.org/docs/explain)",
        "source_quote": "EXPLAIN ANALYZE command executes the query and shows execution time along with plan costs",
        "explanation": "EXPLAIN ANALYZE actually executes the statement to output true execution run times and plan statistics.",
        "difficulty": 3
    }

    val_res = validator.validate_single_question(valid_q, context)
    assert val_res["passed"] is True
    assert val_res["cardinality_valid"] is True
    assert val_res["distractors_valid"] is True
    assert val_res["citation_verified"] is True
    assert val_res["quality_score"] >= 85.0

    # Corrupted MCQ (Two correct answers, forbidden distractor)
    invalid_q = dict(valid_q)
    invalid_q["options"] = [
        {"key": "A", "text": "Option A", "is_correct": True},
        {"key": "B", "text": "All of the above", "is_correct": True}, # 2 correct + forbidden phrase
        {"key": "C", "text": "Option C", "is_correct": False},
        {"key": "D", "text": "Option D", "is_correct": False}
    ]
    val_invalid = validator.validate_single_question(invalid_q, context)
    assert val_invalid["passed"] is False
    assert val_invalid["cardinality_valid"] is False
    assert val_invalid["distractors_valid"] is False

def test_stage_5_skill_gap_diagnostic_assessment_and_scoring():
    """Verify diagnostic assessment assembly, deterministic scoring, and remediation mapping."""
    # Create sample question bank
    sample_bank = [
        {
            "id": f"q-{i}",
            "competency_id": "22222222-2222-2222-2222-222222222101",
            "topic_subtopic": "SQL: Window Functions",
            "difficulty": 3,
            "difficulty_level": "medium" if i % 2 == 0 else "hard",
            "stem": f"Diagnostic inquiry {i} on window frame bounds?",
            "options": [
                {"key": "A", "text": "Correct Option", "is_correct": True},
                {"key": "B", "text": "Wrong Option B", "is_correct": False},
                {"key": "C", "text": "Wrong Option C", "is_correct": False},
                {"key": "D", "text": "Wrong Option D", "is_correct": False}
            ],
            "correct_key": "A",
            "source_citation": "PostgreSQL Docs",
            "explanation": "Comprehensive explanation of window frames.",
            "status": "validated"
        }
        for i in range(15)
    ]

    adapter = SkillGapAssessmentAdapter(sample_bank)
    assessment = adapter.assemble_diagnostic_assessment(
        role_id="11111111-1111-1111-1111-111111111101",
        target_question_count=12
    )

    assert assessment["total_questions"] == 12
    assert len(assessment["questions"]) == 12

    # Simulate submission where user answers 8 correct and 4 wrong
    user_answers = {}
    for i, q in enumerate(assessment["questions"]):
        user_answers[q["question_id"]] = "A" if i < 8 else "B"

    eval_result = adapter.evaluate_diagnostic_submission(
        user_id="learner-101",
        assessment_id=assessment["assessment_id"],
        answers=user_answers
    )

    assert eval_result["total_items"] == 12
    comp_score = eval_result["summary_by_competency"]["22222222-2222-2222-2222-222222222101"]
    assert comp_score["questions_correct"] == 8
    assert comp_score["questions_answered"] == 12
    assert round(comp_score["score_pct"], 1) == 66.7
    assert len(eval_result["evidence_logs"]) == 1
    assert len(eval_result["remediation_recommendations"]) == 4

def test_full_end_to_end_pipeline_execution():
    """Verify master pipeline orchestrator runs cleanly across all stages."""
    pipeline = SkillCompassPipeline()
    metrics = pipeline.run_full_pipeline(questions_per_topic=1)
    
    assert metrics["status"] == "success"
    assert metrics["stage_1_curated_resources_count"] == 170
    assert metrics["stage_2_discovered_materials_count"] > 0
    assert metrics["stage_3_total_chunks_indexed"] > 100
    assert metrics["stage_4_total_questions_generated"] > 40
    assert metrics["stage_4_validation_pass_rate_pct"] >= 90.0
    assert metrics["stage_5_skill_gap_ready"] is True

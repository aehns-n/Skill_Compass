"""
SkillCompass — Pipeline REST API Endpoints
Provides endpoints for ingestion, vector search, question generation, and diagnostics.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from app.services.pipeline_orchestrator import SkillCompassPipeline

router = APIRouter(prefix="/api/pipeline", tags=["Pipeline & Question Generation"])

# Global singleton pipeline instance
pipeline_instance = SkillCompassPipeline()

class IngestRequest(BaseModel):
    competency_id: Optional[str] = None
    competency_name: Optional[str] = None
    category: Optional[str] = "General"
    topic_keywords: Optional[List[str]] = None

class VectorSearchRequest(BaseModel):
    query: str
    competency_id: Optional[str] = None
    top_k: int = 5

class QuestionGenRequest(BaseModel):
    competency_id: str
    competency_name: str
    topic_subtopic: str
    num_questions: int = 3
    role_id: Optional[str] = None

class AssessmentSubmitRequest(BaseModel):
    user_id: str
    assessment_id: str
    answers: Dict[str, str]

@router.post("/initialize")
def initialize_pipeline():
    """Executes full pipeline initialization and indexing."""
    metrics = pipeline_instance.run_full_pipeline(questions_per_topic=2)
    return {"message": "Pipeline initialized successfully", "metrics": metrics}

@router.get("/dashboard-metrics")
def get_dashboard_metrics():
    """Returns top-level pipeline operational and quality metrics."""
    if not pipeline_instance.pipeline_metrics:
        pipeline_instance.run_full_pipeline(questions_per_topic=1)
    return {
        "metrics": pipeline_instance.pipeline_metrics,
        "vector_report": pipeline_instance.vector_store.generate_quality_report(),
        "total_curated_resources": len(pipeline_instance.curated_resources),
        "total_discovered_resources": len(pipeline_instance.auto_discovered_resources),
        "total_questions_in_bank": len(pipeline_instance.question_bank)
    }

@router.post("/ingest")
def trigger_ingestion(req: IngestRequest):
    """Triggers autonomous material discovery and ingestion."""
    if req.competency_id and req.competency_name:
        log = pipeline_instance.ingestion_pipeline.run_discovery_for_competency(
            competency_id=req.competency_id,
            competency_name=req.competency_name,
            category=req.category,
            topic_keywords=req.topic_keywords
        )
        return {"run_log": log}
    else:
        logs = pipeline_instance.ingestion_pipeline.run_all_competencies_discovery()
        return {"total_runs": len(logs), "runs": logs}

@router.post("/vector-search")
def search_vector_store(req: VectorSearchRequest):
    """Performs semantic vector search with sub-200ms latency tracking."""
    res = pipeline_instance.vector_store.search(
        query=req.query,
        competency_id=req.competency_id,
        top_k=req.top_k
    )
    return res

@router.get("/vector-quality")
def get_vector_quality_report():
    """Generates embedding quality report across competency domains."""
    return pipeline_instance.vector_store.generate_quality_report()

@router.post("/generate-questions")
def generate_questions(req: QuestionGenRequest):
    """Generates and validates diagnostic MCQs grounded in ingested context."""
    res = pipeline_instance.question_generator.generate_questions_for_topic(
        competency_id=req.competency_id,
        competency_name=req.competency_name,
        topic_subtopic=req.topic_subtopic,
        num_questions=req.num_questions,
        role_id=req.role_id
    )
    return res

@router.get("/questions")
def list_questions(
    competency_id: Optional[str] = None,
    difficulty_level: Optional[str] = None,
    status: Optional[str] = None
):
    """Lists questions from the Question Bank with optional filters."""
    qs = pipeline_instance.question_bank
    if competency_id:
        qs = [q for q in qs if q.get("competency_id") == competency_id]
    if difficulty_level:
        qs = [q for q in qs if q.get("difficulty_level") == difficulty_level]
    if status:
        qs = [q for q in qs if q.get("status") == status]
    return {"total": len(qs), "questions": qs}

@router.post("/assessment/assemble")
def assemble_assessment(
    role_id: str,
    competency_ids: Optional[List[str]] = None,
    count: int = 12
):
    """Assembles a balanced diagnostic assessment for the Skill-Gap Engine."""
    assessment = pipeline_instance.assessment_adapter.assemble_diagnostic_assessment(
        role_id=role_id,
        competency_ids=competency_ids,
        target_question_count=count
    )
    return assessment

@router.post("/assessment/submit")
def submit_assessment(req: AssessmentSubmitRequest):
    """Evaluates assessment submission, logs evidence, and returns remediation recommendations."""
    res = pipeline_instance.assessment_adapter.evaluate_diagnostic_submission(
        user_id=req.user_id,
        assessment_id=req.assessment_id,
        answers=req.answers,
        curated_resources=pipeline_instance.curated_resources
    )
    return res

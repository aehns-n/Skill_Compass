"""
SkillCompass — Autonomous Material Ingestion Pipeline Orchestrator (Stage 2)
Discovers, validates, parses, deduplicates, and logs candidate learning materials.
"""

import uuid
import datetime
from typing import List, Dict, Any, Optional

from app.services.ingestion.connectors import (
    OfficialDocsConnector,
    GitHubCurriculumConnector,
    TranscriptConnector
)
from app.services.ingestion.freshness_validator import FreshnessAndAuthorityValidator
from app.core.all_curated_resources import ALL_COMPETENCIES_METADATA

class MaterialIngestionPipeline:
    """Orchestrates autonomous ingestion and discovery runs across competencies."""

    def __init__(self):
        self.connectors = [
            OfficialDocsConnector(),
            GitHubCurriculumConnector(),
            TranscriptConnector()
        ]
        self.validator = FreshnessAndAuthorityValidator()
        self.ingested_hashes = set()
        self.ingestion_logs: List[Dict[str, Any]] = []

    def run_discovery_for_competency(
        self,
        competency_id: str,
        competency_name: str,
        category: str = "General",
        topic_keywords: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Runs discovery and ingestion for a specific competency domain."""
        if not topic_keywords:
            topic_keywords = ["Fundamentals", "Production Architecture", "Best Practices"]

        run_id = str(uuid.uuid4())
        started_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        discovered_items = []
        ingested_items = []
        skipped_items = []
        parse_errors = []

        # 1. Query all connectors
        for connector in self.connectors:
            try:
                items = connector.fetch_materials(competency_id, competency_name, topic_keywords)
                discovered_items.extend(items)
            except Exception as e:
                parse_errors.append({
                    "connector": connector.name,
                    "error": str(e),
                    "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
                })

        # 2. Validate, deduplicate, and ingest
        for item in discovered_items:
            try:
                content = item.get("raw_content", "")
                if not content or len(content.strip()) < 40:
                    skipped_items.append({"title": item.get("source_title"), "reason": "Content payload too short"})
                    continue

                # Deduplication check
                content_hash = self.validator.compute_content_hash(content)
                if content_hash in self.ingested_hashes:
                    skipped_items.append({"title": item.get("source_title"), "reason": "Duplicate content detected"})
                    continue

                # Authority and freshness validation
                val_res = self.validator.validate_resource({
                    "url": item.get("source_url", ""),
                    "resource_type": item.get("source_type", "documentation"),
                    "category": category,
                    "last_updated": datetime.datetime.now().strftime("%Y-%m-%d")
                })

                if not val_res["is_valid"]:
                    skipped_items.append({
                        "title": item.get("source_title"),
                        "reason": val_res.get("rejection_reason", "Validation failed")
                    })
                    continue

                # Ingested successfully
                self.ingested_hashes.add(content_hash)
                ingested_record = {
                    "resource_id": str(uuid.uuid4()),
                    "competency_id": competency_id,
                    "competency_name": competency_name,
                    "title": item.get("source_title"),
                    "url": item.get("source_url"),
                    "resource_type": item.get("source_type"),
                    "format": item.get("format", "text"),
                    "content": content,
                    "content_hash": content_hash,
                    "authority_score": val_res["authority_score"],
                    "freshness_months": val_res["age_months"],
                    "ingested_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                    "source_origin": "auto_discovered"
                }
                ingested_items.append(ingested_record)

            except Exception as e:
                parse_errors.append({
                    "item_title": item.get("source_title"),
                    "error": str(e)
                })

        # Calculate error rate
        total_processed = len(discovered_items)
        error_rate_pct = (len(parse_errors) / max(1, total_processed)) * 100.0

        run_log = {
            "run_id": run_id,
            "competency_id": competency_id,
            "competency_name": competency_name,
            "status": "completed" if error_rate_pct < 2.0 else "partial",
            "items_discovered": total_processed,
            "items_ingested": len(ingested_items),
            "items_skipped": len(skipped_items),
            "parse_errors_count": len(parse_errors),
            "error_rate_pct": round(error_rate_pct, 2),
            "parse_errors": parse_errors,
            "ingested_items": ingested_items,
            "started_at": started_at,
            "completed_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }

        self.ingestion_logs.append(run_log)
        return run_log

    def run_all_competencies_discovery(self) -> List[Dict[str, Any]]:
        """Executes discovery across all registered competencies."""
        all_results = []
        for comp in ALL_COMPETENCIES_METADATA:
            res = self.run_discovery_for_competency(
                competency_id=comp["id"],
                competency_name=comp["name"],
                category=comp["category"],
                topic_keywords=comp["subtopics"]
            )
            all_results.append(res)
        return all_results

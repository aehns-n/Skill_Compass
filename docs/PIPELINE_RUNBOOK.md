# SkillCompass — Pipeline Operations Runbook & Extension Guide

## 1. Quickstart Commands

### A. Run Comprehensive Test Suite
```bash
python -m pytest backend/tests/test_pipeline.py -v
```

### B. Launch Operational Monitoring Dashboard (Streamlit)
```bash
python -m streamlit run backend/dashboard.py
```

### C. Launch FastAPI Application Server
```bash
python -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger documentation is accessible at: `http://localhost:8000/docs`

---

## 2. Seeding & Database Integration

To apply the database schema extensions and seed the 170 curated resources to PostgreSQL or Supabase:

```sql
-- 1. Apply schema extensions
\i database/schema_pipeline.sql

-- 2. Seed 170 curated learning resources & mappings
\i database/seed_pipeline_resources.sql
```

---

## 3. REST API Endpoint Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/pipeline/initialize` | Executes end-to-end ingestion, chunking, vector indexing & question generation. |
| `GET` | `/api/pipeline/dashboard-metrics` | Returns live ingestion, vector quality, and question pass rate metrics. |
| `POST` | `/api/pipeline/ingest` | Triggers autonomous material discovery for a specific competency or all competencies. |
| `POST` | `/api/pipeline/vector-search` | Executes semantic vector retrieval with retrieval latency benchmark. |
| `GET` | `/api/pipeline/vector-quality` | Generates intra-competency similarity and token distribution report. |
| `POST` | `/api/pipeline/generate-questions`| Generates and validates diagnostic MCQs grounded in ingested context. |
| `GET` | `/api/pipeline/questions` | Queries validated question bank with difficulty and status filters. |
| `POST` | `/api/pipeline/assessment/assemble` | Assembles a balanced 10-15 question diagnostic test for a target role. |
| `POST` | `/api/pipeline/assessment/submit` | Evaluates test submission, logs evidence, and returns remediation recommendations. |

---

## 4. How to Extend Pipeline to New Competencies

To register a new competency domain into the automated pipeline:

1. **Add Competency Metadata:**
   Open `backend/app/core/all_curated_resources.py` and append the new competency definition to `ALL_COMPETENCIES_METADATA`:
   ```python
   {
       "id": "new-competency-uuid",
       "name": "Kubernetes & Cloud Orchestration",
       "role_id": "target-role-uuid",
       "category": "Cloud Infrastructure",
       "subtopics": [
           "Pod Lifecycle & Deployments",
           "Ingress Controllers & Service Mesh",
           "Persistent Volumes & CSI",
           "Horizontal Pod Autoscaling",
           "RBAC & Network Policies"
       ]
   }
   ```

2. **Register Domain Authority:**
   Open `backend/app/services/ingestion/freshness_validator.py` and register any authoritative documentation domains:
   ```python
   AUTHORITY_DOMAIN_SCORES["kubernetes.io"] = 99.0
   ```

3. **Re-run Pipeline Generator:**
   ```bash
   python backend/generate_seed_sql.py
   ```
   The pipeline will automatically curate resources, index semantic chunks, and generate grounded diagnostic questions for the new competency.

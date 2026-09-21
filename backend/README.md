# SkillCompass — Backend & Pipeline Quickstart Guide

This guide explains how to configure, start, test, and monitor the **SkillCompass Backend & Question Generation Pipeline**.

---

## 1. Prerequisites

- **Python:** 3.10, 3.11, 3.12, 3.13, or 3.14
- **Package Manager:** `pip` / `venv` or `conda`
- **Optional (for live DB):** PostgreSQL / Supabase instance

---

## 2. Environment Setup

### 2.1 Navigate to the Backend Directory
Open your terminal (PowerShell, Command Prompt, or Bash):

```bash
cd e:\Projects\Skill_Compass\backend
```

### 2.2 Create and Activate a Virtual Environment (Recommended)

**On Windows (PowerShell):**
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

**On Windows (CMD):**
```cmd
python -m venv .venv
.venv\Scripts\activate.bat
```

**On macOS / Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 2.3 Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 3. Configuration (.env)

Create a `.env` file in the `backend` directory (or workspace root) if you are connecting to external databases or LLM providers:

```env
# Server Settings
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development

# Database (PostgreSQL / Supabase)
DATABASE_URL=postgresql://postgres:password@localhost:5432/skillcompass
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-or-service-key

# LLM & Embedding Providers (Optional for Live API Calls)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
EMBEDDING_PROVIDER=local_deterministic   # Options: local_deterministic, text-embedding-3-small
```

---

## 4. Starting the Services

### 4.1 Start the FastAPI REST API Server

From the `backend/` directory:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Or using the Python module runner:
```bash
python -m uvicorn app.main:app --reload --port 8000
```

Once started:
- **API Base URL:** [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Documentation:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### 4.2 Start the Pipeline Operations & Monitoring Dashboard

SkillCompass includes an interactive visual dashboard powered by Streamlit to monitor ingestion rates, validation pass rates, and question banking:

From the `backend/` directory:
```bash
streamlit run dashboard.py
```

Once started, open your browser at [http://localhost:8501](http://localhost:8501).

---

## 5. Running the Pipeline Programmatically

To trigger an autonomous ingestion, vectorization, and question-generation run directly from the command line:

```bash
# Run the pipeline orchestrator
python -m app.services.pipeline_orchestrator
```

Or trigger it via HTTP REST API:
```bash
curl -X POST http://localhost:8000/api/pipeline/run \
  -H "Content-Type: application/json" \
  -d '{"competency_id": "11111111-1111-1111-1111-111111111101", "role_id": "11111111-1111-1111-1111-111111111111", "num_questions": 5}'
```

---

## 6. Running Tests

To run the full pipeline test suite (9 test suites verifying coverage, freshness, extractors, vector store latency, 4-tier validation, and skill-gap adapters):

From the workspace root (`e:\Projects\Skill_Compass`):

```bash
pytest backend/tests/test_pipeline.py -v
```

---

## 7. Key API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Service health check and API metadata |
| `GET` | `/api/pipeline/stats` | Aggregated pipeline metrics (resources, chunks, questions, pass rate) |
| `GET` | `/api/pipeline/resources` | List all curated learning resources with filtering by competency |
| `POST`| `/api/pipeline/ingest` | Ingest and parse arbitrary technical document content |
| `POST`| `/api/pipeline/generate-questions` | Generate and validate grounded MCQs for a competency & topic |
| `GET` | `/api/pipeline/assessment/{role_id}/{competency_id}` | Generate a 10–15 question diagnostic assessment |
| `POST`| `/api/pipeline/assessment/submit` | Deterministically score submission & return remediation resources |

---

## 8. Directory Structure

```
backend/
├── app/
│   ├── api/
│   │   └── pipeline_router.py         # FastAPI REST endpoints
│   ├── core/
│   │   ├── all_curated_resources.py   # 170 curated resource metadata entries
│   │   └── curated_resources_data.py  # Seed structures
│   ├── services/
│   │   ├── ingestion/                 # Connectors, freshness & authority validator
│   │   ├── vectorization/             # Extractors, chunker, vector store
│   │   ├── question_generator/        # RAG prompts, generator, 4-tier validator
│   │   ├── skill_gap/                 # Assessment adapter & scoring
│   │   └── pipeline_orchestrator.py   # End-to-end multi-stage coordinator
│   └── main.py                        # FastAPI entrypoint
├── tests/
│   └── test_pipeline.py               # Comprehensive pytest test suite
├── dashboard.py                       # Streamlit pipeline ops visualizer
├── requirements.txt                   # Dependencies
└── README.md                          # This quickstart guide
```

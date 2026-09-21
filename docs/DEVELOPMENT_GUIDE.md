# SkillCompass — 24-Hour Hackathon Development Guide

## 1. Team Organization & Role Allocation

To build and deliver a working, beautiful, end-to-end prototype within a **24-hour hackathon**, the 4-person engineering team is divided into clear, non-overlapping ownership streams:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             TEAM RESPONSIBILITY MATRIX                      │
├─────────────────┬───────────────────────────────────────────────────────────┤
│ Developer 1     │ Frontend Lead: Next.js UI, App Router, Assessment Wizard, │
│                 │ Interactive Competency Radar Dashboard, Learning Path     │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ Developer 2     │ Backend Core Lead: FastAPI setup, Routing, API Schemas,   │
│                 │ Assessment & Reassessment API Endpoints, Dependencies     │  
├─────────────────┼───────────────────────────────────────────────────────────┤
│ Developer 3     │ Intelligence Engine Lead: Deterministic Competency Math,  │
│                 │ Evidence Ledger Aggregation, Recommendation DAG Sorting   │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ Developer 4     │ Data & AI Lead: PostgreSQL/Supabase Schema DDL, Seed SQL, │
│                 │ Static Data Fixtures, OpenAI/Groq API Client & Prompts    │
└─────────────────┴───────────────────────────────────────────────────────────┘
```

---

## 2. 24-Hour Chronological Sprint Timeline

```
Hours 00:00 - 02:00 │ Milestone 1: Alignment, Git Repo Setup, DB Schema & Seed DDL
Hours 02:00 - 06:00 │ Milestone 2: Independent Core Development (Mock APIs & UI Scaffolding)
Hours 06:00 - 12:00 │ Milestone 3: Engine Logic Implementation & API Integration
Hours 12:00 - 16:00 │ Milestone 4: End-to-End Diagnostic Assessment & Dashboard Linkage
Hours 16:00 - 20:00 │ Milestone 5: Reassessment Flow, Score Recalibration, UI Polish
Hours 20:00 - 22:00 │ Milestone 6: Edge Case Hardening, Fallback Checks, Seed Verification
Hours 22:00 - 24:00 │ Milestone 7: Final Demo Scripting, Rehearsal, & Project Submission
```

---

## 3. Git Workflow & Branching Strategy

To prevent merge conflicts and lockups, team members work on isolated feature branches and merge to `main` via short-lived PRs or direct fast-forward merges after local verification:

### 3.1 Branch Naming Convention
- `feat/frontend-dashboard` (Dev 1)
- `feat/api-assessment` (Dev 2)
- `feat/competency-engine` (Dev 3)
- `feat/db-ai-integration` (Dev 4)

### 3.2 Rules of Engagement
1. **Never break `main`:** Test locally before merging.
2. **Lock shared schema early:** Dev 2 and Dev 4 finalize database table names and Pydantic schemas in Milestone 1. Neither team modifies schemas without informing the others.
3. **Frontend builds against mocked contracts:** Dev 1 uses `lib/api.ts` with mock JSON fixtures until Dev 2 has endpoints live.

---

## 4. Local Environment Setup (NO DOCKER)

SkillCompass runs directly on developer workstations without containerization overhead.

### 4.1 Prerequisites
- **Node.js:** v18.17+ or v20+
- **Python:** v3.11+
- **PostgreSQL:** Local PostgreSQL instance or remote free-tier Supabase project

---

### 4.2 Database Setup (Developer 4 Lead)

1. Open your Supabase SQL Editor or local `psql` shell.
2. Execute the canonical schema DDL:
   ```bash
   # If using local psql:
   psql -U postgres -d skillcompass -f database/schema.sql
   psql -U postgres -d skillcompass -f database/seed.sql
   ```
3. Verify that all 13 tables are created and the 6 default competencies, 1 benchmark role, and 18 questions are seeded.

---

### 4.3 Backend Setup (Developers 2, 3, 4)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install pinned dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create the `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   Configure environment variables:
   ```ini
   DATABASE_URL="postgresql+asyncpg://postgres:yourpassword@localhost:5432/skillcompass"
   OPENAI_API_KEY="sk-..."
   ENVIRONMENT="development"
   CORS_ORIGINS="http://localhost:3000"
   ```
5. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
6. Open your browser and navigate to:
   - Interactive Swagger API Docs: `http://localhost:8000/docs`
   - Health Check: `http://localhost:8000/health`

---

### 4.4 Frontend Setup (Developer 1)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create the `.env.local` configuration file:
   ```ini
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   NEXT_PUBLIC_DEMO_USER_ID=00000000-0000-0000-0000-000000000001
   ```
4. Start the Next.js local development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000`.

---

## 5. Testing & Verification Guide

### 5.1 Backend Unit & Determinism Testing
Developer 3 should implement deterministic unit tests for the competency engine:

```bash
cd backend
pytest tests/test_competency_engine.py -v
```

*Example verification test:*
```python
def test_competency_deterministic_scoring():
    evidence = [
        {"weight": 1.0, "result": 1.0},
        {"weight": 1.5, "result": 0.0},
    ]
    # Sum(w*r) = 1.0, Sum(w) = 2.5 -> Score = 40.0
    score = calculate_score(evidence)
    assert round(score, 2) == 40.0
    gap = calculate_gap(required=75.0, current=score)
    assert round(gap, 2) == 35.0
```

### 5.2 API Contract Testing with cURL
Developers can test endpoints quickly using cURL or the built-in Swagger UI at `http://localhost:8000/docs`:

```bash
# 1. Start Assessment
curl -X POST "http://localhost:8000/api/v1/assessment/start" \
     -H "Content-Type: application/json" \
     -d '{"user_id": "00000000-0000-0000-0000-000000000001", "role_id": "11111111-1111-1111-1111-111111111111"}'

# 2. Query Competencies
curl -X GET "http://localhost:8000/api/v1/users/00000000-0000-0000-0000-000000000001/competencies"
```

---

## 6. Demo Script & Rehearsal Checklist (Hour 22–24)

For judging and evaluation, rehearse this exact 3-minute demonstration story:

1. **The Hook (30 sec):**  
   Introduce the problem: *"Completion certificates don't equal job readiness. Meet Alex Chen, an aspiring Junior Data Scientist."*
2. **The Diagnostic (45 sec):**  
   Show Alex selecting the benchmark role and taking a real-time 10-question diagnostic exam. Submit answers with deliberate mistakes in *Data Structures*.
3. **The Diagnosis & Radar (45 sec):**  
   Show the instant dashboard: Overall readiness 58%. The radar chart clearly highlights *Data Structures* as a high-priority gap ($41.6\%$ deficit). Explain that the score is calculated via deterministic evidence, not AI guessing.
4. **Targeted Micro-Learning & Reassessment (45 sec):**  
   Show the dynamic learning path. Mark the targeted 15-minute resource complete. Launch the 3-question targeted reassessment. Answer correctly.
5. **The Measurable Proof (15 sec):**  
   Return to the dashboard. Show the score jumping from $33\% \rightarrow 75\%$, the gap shrinking to $0$, and the status transitioning from `NOVICE` to `PROFICIENT`. Conclude with: *"Verifiable competency achieved."*

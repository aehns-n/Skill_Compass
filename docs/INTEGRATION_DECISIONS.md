# SkillCompass — Integration & Architectural Decisions Record (ADR)

## Phase 0: System Audit & Decision Log

| Issue / Gap Identified | Options Considered | Decision & Implementation Strategy | Rationale |
| :--- | :--- | :--- | :--- |
| **1. Priority & Rationale** | A) Add new DB columns to `role_competencies`<br/>B) Derive dynamically in API | **Option B (Derive in API)**: Rank 1–2 = `HIGH`, Rank 3–4 = `MED`, Rank 5+ = `LOW`. Rationale is sourced directly from `competencies.description`. | Keeps DB schema clean and additive while fully satisfying UI contracts. |
| **2. Prerequisite DAG** | A) Frontend-only graph JSON<br/>B) Additive DB table `competency_prerequisites` | **Option B (Database Table)**: Add `competency_prerequisites` with `(competency_id, prerequisite_id, min_score, rationale)`. Enforce acyclicity on seed. | Single source of truth. Server-side gating prevents learners from skipping foundational topics. |
| **3. Lesson Modules** | A) Separate LMS courses table<br/>B) Treat `learning_resources` as modules | **Option B (`learning_resources` as modules)**: Resource chunks serve as unit summaries/content; progress tracked in `learning_progress`. | Unifies continuous ingestion pipeline directly with learner consumption. |
| **4. Reassessment Scope** | A) Generic question pool<br/>B) Chunk-filtered pool tied to completed resources | **Option B (Completed resource chunks only)**: Filter questions/chunks by `resource_id IN (user_completed_resources)`. | Honors the core thesis: testing whether learning from specific completed materials converted to competency. |
| **5. Evidence Immutability** | A) Application-level convention<br/>B) DB Trigger / RLS constraint | **Option B (Database Trigger & RLS)**: PostgreSQL trigger raises exception on `UPDATE` or `DELETE` on `evidence_logs`. | Absolute reproducibility: every score must be verifiable from audit logs alone. |
| **6. Hardcoded MoSPI Data** | A) Map old IDs to new roles<br/>B) Completely delete old frontend mock literals | **Option B (Total Deletion)**: Delete `frontend/data/*.ts`. All roles (Data Engineer, Cybersecurity, Network Engineer) and questions are fetched dynamically from API. | Zero risk of stale or hallucinated data. True DB single source of truth. |
| **7. Scoring Weights** | Hardcoded in multiple files vs centralized config | **Centralized Config (`backend/app/core/config.py`)**: L1=1.0, L2=1.5, L3=2.0, L4=2.5, L5=3.0. | Deterministic scoring math across baseline, diagnostic, reassessment, and audit modules. |

---

## Page-to-Endpoint & Database Mapping Matrix

| Frontend Page / Feature | Backend REST Endpoint | Database Tables Used | Handled Logic / Missing Piece |
| :--- | :--- | :--- | :--- |
| **`/` (Landing Page)** | `GET /roles` | `roles`, `competencies`, `role_competencies` | Updated copy to Data Engineer story, dynamic role cards |
| **`/onboarding`** | `GET /roles`, `POST /profile` | `users`, `user_competencies`, `loop_state` | Dynamically renders DB roles; initializes competency state & `loop_state` |
| **`/assessment` (Baseline)** | `GET /assessments/baseline`, `POST /assessments/{id}/submit` | `questions`, `question_options`, `assessments`, `assessment_answers`, `evidence_logs`, `user_competencies` | Assembles 10–15 MCQs keyed to target difficulty; deterministic weighted scoring; writes immutable EvidenceLogs |
| **`/assessment/results`** | `GET /assessments/{id}/results`, `GET /diagnose/gaps` | `assessments`, `evidence_logs`, `user_competencies` | Displays verified score, tier, gap deficit, and weak topics |
| **`/dashboard`** | `GET /profile`, `GET /diagnose/gaps`, `GET /loop/next-action`, `GET /measure/progress` | `users`, `user_competencies`, `loop_state`, `evidence_logs` | Radar chart (current vs target), primary CTA driven by loop state machine |
| **`/graph` (DAG Visualizer)** | `GET /competencies/graph` | `competencies`, `competency_prerequisites`, `user_competencies` | Node states: `blocked` / `gated` / `ready` / `mastered` with prerequisite edges |
| **`/gaps`** | `GET /diagnose/gaps` | `role_competencies`, `user_competencies`, `competency_prerequisites` | Priority-ranked gaps, depth calculation, blocked_by alerts |
| **`/learning`** | `GET /learning/path` | `learning_resources`, `competency_resources`, `learning_progress`, `competency_prerequisites` | Recommends materials for unlocked competencies ranked by weak topics & quality |
| **`/learn/module`** | `GET /learning/resource/{id}`, `POST /learning/progress` | `learning_resources`, `resource_chunks`, `learning_progress`, `loop_state` | Module reader, chunk summary view, updates progress & increments loop counter |
| **`/reassess`** | `GET /assessments/reassess`, `POST /assessments/{id}/submit` | `questions`, `resource_chunks`, `learning_progress`, `assessments`, `evidence_logs` | Questions sampled strictly from completed resources; scoring reuses deterministic engine |
| **`/reassess/result`** | `GET /assessments/{id}/results`, `GET /measure/audit/{competency_id}` | `assessments`, `evidence_logs`, `user_competencies` | Pre vs post score delta, verified capability progression, evidence audit trail |
| **`/progress`** | `GET /measure/progress`, `GET /measure/effectiveness`, `GET /measure/self-vs-measured`, `GET /measure/audit/{id}` | `evidence_logs`, `user_competencies`, `learning_progress` | Time-series, points gained per resource, plateau detection, self-rating comparison |
| **`DemoNavigator`** | `POST /demo/seed?profile=...` | `users`, `user_competencies`, `evidence_logs`, `loop_state`, `learning_progress` | DEV/DEMO-only seed endpoint generating real database state and observable evidence |

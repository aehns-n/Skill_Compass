# SkillCompass — End-to-End Data Flow

## 1. Overview

This document provides a comprehensive, step-by-step trace of the complete SkillCompass competency lifecycle. It describes the 16 distinct phases of data transformation, from initial role onboarding to measured competency growth.

---

## 2. The 16-Step End-to-End Data Journey

```mermaid
sequenceDiagram
    autonumber
    actor User as Learner
    participant UI as Next.js Frontend
    participant API as FastAPI Router
    participant AE as Assessment Engine
    participant CE as Competency Engine
    participant RE as Recommendation Engine
    participant AIS as AI Service
    participant DB as PostgreSQL Database

    Note over User, DB: Phase 1: Onboarding & Baseline Diagnostic
    User->>UI: 1. Selects Target Role (e.g. Junior Data Scientist)
    UI->>API: 2. Request role benchmark requirements
    API->>DB: Fetch role_competencies (target scores)
    DB-->>API: Required competency benchmarks
    API-->>UI: Displays role targets
    User->>UI: 3. Clicks "Start Diagnostic Assessment"
    UI->>API: POST /api/v1/assessment/start
    API->>AE: 4. Map questions to required competencies
    AE->>DB: Query balanced sample from questions table
    DB-->>AE: 12 diagnostic questions
    AE-->>API: Stripped questions (no answers/explanations)
    API-->>UI: Render Assessment Wizard
    
    Note over User, DB: Phase 2: Diagnostic Evaluation & Gap Discovery
    User->>UI: 5. Submits completed answers
    UI->>API: POST /api/v1/assessment/submit
    API->>AE: 6. Grade answers against answer key
    AE->>DB: Write records to competency_evidence & assessment_answers
    AE->>CE: 7. Calculate baseline competency scores
    CE->>DB: Read evidence, compute weighted scores
    CE->>DB: 8. Compare Current vs. Required (R_c - S_c)
    CE->>DB: 9. Upsert user_competencies with skill gaps & status
    DB-->>CE: Competency records committed
    CE-->>API: Calculated profile & gap vector
    API-->>UI: Return diagnostic results + breakdown
    UI->>User: Displays Real-time Competency Radar & Gap Metrics

    Note over User, DB: Phase 3: Adaptive Recommendation & Learning
    User->>UI: Clicks "View My Learning Path"
    UI->>API: GET /api/v1/users/{id}/learning-path
    API->>RE: 10. Generate personalized learning path
    RE->>DB: Query active skill gaps & check prerequisite DAG
    RE->>DB: Join learning_resources for unlocked gaps
    RE-->>API: Ordered list of micro-learning modules
    API-->>UI: Render interactive Learning Path
    User->>UI: 11. Learner completes targeted resource
    UI->>API: PUT /api/v1/learning/{resource_id}/status (COMPLETED)
    API->>DB: Update learning_progress record
    API-->>UI: 200 OK (reassessment_ready: true)

    Note over User, DB: Phase 4: Targeted Reassessment & Growth Measurement
    User->>UI: 12. Clicks "Take Targeted Reassessment"
    UI->>API: POST /api/v1/reassessment/start { competency_id }
    API->>AIS: Generate or fetch 3 targeted questions for competency
    AIS-->>API: Targeted questions
    API-->>UI: Render 3-question focused quiz
    User->>UI: 13. Submits reassessment answers
    UI->>API: POST /api/v1/reassessment/submit
    API->>AE: 14. Grade answers & create new competency_evidence
    AE->>DB: Insert new evidence rows (source='REASSESSMENT')
    AE->>CE: 15. Recalculate competency score
    CE->>DB: Compute updated weighted score, reduced gap, new status
    CE->>DB: Update user_competencies
    CE-->>API: Return delta metrics (old_score, new_score, gap_reduction)
    API-->>UI: 200 OK (recalibration summary)
    UI->>User: 16. Dashboard triggers celebration animation & shows verifiable growth
```

---

## 3. Deep Dive into Key Data Transformations

### Steps 1–4: Profile Onboarding & Question Calibration
- **Input:** User chooses `role_id = 11111111-1111-1111-1111-111111111111` (*Junior Data Scientist*).
- **Transformation:** The system joins `role_competencies` and `question_competencies` to assemble a balanced multi-competency test session containing exactly 2 questions per competency.
- **Output:** Client receives a sanitized session object with questions, option choices, and difficulty ratings.

### Steps 5–9: Raw Grading to Competency Ledger
- **Input:** JSON array of `{question_id, selected_answer}` pairs.
- **Transformation:**
  1. `AssessmentEngine` compares `selected_answer` against canonical `correct_answer`.
  2. For every item, inserts a row into `assessment_answers` containing binary `is_correct`.
  3. Inserts corresponding rows into `competency_evidence` with the question's calibrated weight $w_i$.
  4. `CompetencyEngine` applies the deterministic formula:
     $$\text{Score} = \left(\frac{\sum w_i r_i}{\sum w_i}\right) \times 100$$
  5. Computes $\text{SkillGap} = \max(0, R_c - \text{Score})$.
- **Output:** Materialized records in `user_competencies` indicating exact scores (e.g. Python: $34.0$, Gap: $41.0$).

### Steps 10–11: DAG Traversing & Learning Path Formulation
- **Input:** List of competency gaps for the user.
- **Transformation:**
  1. Engine checks if prerequisites for deficient competencies are satisfied ($S \ge 70$).
  2. Blocks locked topics (e.g., *Pandas* is locked if *Python Basics* has not met proficiency).
  3. Unlocked topics are sorted descending by gap magnitude.
  4. Matches unlocked competencies with entries in `learning_resources`.
- **Output:** Sequential learning path payload delivered to Next.js frontend.

### Steps 12–16: Targeted Reassessment & Verifiable Measurement
- **Input:** User completes micro-resource and requests reassessment on *Python Basics*.
- **Transformation:**
  1. System serves 3 focused questions addressing previously missed concepts.
  2. User answers correctly (e.g., 3/3).
  3. New evidence rows are appended to `competency_evidence` with `source='REASSESSMENT'`.
  4. `CompetencyEngine` recalculates the cumulative weighted score.
  5. Current score rises (e.g., from $34.0 \rightarrow 72.0$), collapsing the gap from $41.0 \rightarrow 3.0$.
- **Output:** Dashboard visually reflects the updated score, gap reduction, and upgraded status (`NOVICE` $\rightarrow$ `PROFICIENT`).

# SkillCompass — Documentation System

Welcome to the engineering and architectural documentation for **SkillCompass**, an AI-powered Competency Intelligence & Adaptive Learning Platform built for the 24-hour hackathon.

---

## 1. Core Positioning & Guiding Principle

> **Core Positioning:**  
> **"COURSE COMPLETION ≠ COMPETENCY"**

Traditional education and corporate upskilling measure passive hours spent watching videos or memorizing multiple-choice questions. SkillCompass establishes a new paradigm: continuous, evidence-backed diagnostic measurement that bridges the gap between learning and verified job readiness.

```
┌────────────────────────────────────────────────────────┐
│                   TECHNICAL PRINCIPLE                  │
│                                                        │
│  "AI interprets and generates.                         │
│   Structured logic calculates and tracks competency."  │
└────────────────────────────────────────────────────────┘
```

- **AI/LLM:** Generates questions, drafts step-by-step diagnostic feedback, explains user errors, and maps semantic concepts.
- **Deterministic Engine:** Calculates weighted scores, determines skill gaps, evaluates prerequisite graphs, and updates the immutable evidence ledger.

---

## 2. The Core Competency Loop

SkillCompass powers a continuous, closed-loop 7-stage learning journey:

```
PROFILE ──► ASSESS ──► DIAGNOSE ──► RECOMMEND ──► LEARN ──► REASSESS ──► MEASURE ──↺
```

1. **PROFILE:** Select target industry role and inspect benchmark skill expectations.
2. **ASSESS:** Take a balanced, multi-competency baseline diagnostic assessment.
3. **DIAGNOSE:** Calculate exact skill gap vectors using transparent, deterministic math.
4. **RECOMMEND:** Formulate a prioritized learning path respecting prerequisite dependencies (DAG).
5. **LEARN:** Engage with bite-sized, targeted micro-learning interventions.
6. **REASSESS:** Take a 3-question focused reassessment specifically on deficit concepts.
7. **MEASURE:** Ingest new performance evidence, recalibrate competency scores, and verify growth.

---

## 3. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14 + React + TypeScript** | Responsive App Router, radar charts, dynamic assessment wizard |
| **Styling** | **Tailwind CSS + Vanilla CSS** | Premium design system, glassmorphism, micro-animations |
| **Backend API** | **Python 3.11 + FastAPI** | High-performance asynchronous REST API, auto OpenAPI docs |
| **Database** | **PostgreSQL (Supabase or Local)** | Relational integrity, ACID audit evidence logging |
| **AI / LLM** | **OpenAI / Groq API (JSON Mode)** | Contextual explanation generation, dynamic test items |

*Zero Docker, zero microservices, zero infrastructure bloat.*

---

## 4. Documentation Index & Recommended Reading Path

To gain a complete and cohesive understanding of the architecture, developers and technical judges should read the documentation in the following sequence:

| Step | Document | Purpose & Summary |
| :---: | :--- | :--- |
| **1** | [**PROJECT_ARCHITECTURE.md**](file:///e:/PROJECT/Skill_Compass/docs/PROJECT_ARCHITECTURE.md) | **Foundations & Scope:** Executive overview, core problem statement, philosophy, technology selection rationale, MVP boundaries, and non-goals. |
| **2** | [**HIGH_LEVEL_ARCHITECTURE.md**](file:///e:/PROJECT/Skill_Compass/docs/HIGH_LEVEL_ARCHITECTURE.md) | **System Topology:** 5-tier architecture breakdown (Presentation, API, Business Logic, Persistence, AI), component boundaries, and request/response topologies. |
| **3** | [**FILE_STRUCTURE.md**](file:///e:/PROJECT/Skill_Compass/docs/FILE_STRUCTURE.md) | **Repository Blueprint:** File map across frontend, backend, database, ai, data, and docs with explicit rules on what belongs where. |
| **4** | [**DATABASE_SCHEMA.md**](file:///e:/PROJECT/Skill_Compass/docs/DATABASE_SCHEMA.md) | **Data Model & DDL:** PostgreSQL relational entity-relationship specifications, column data types, foreign keys, unique constraints, and performance indexes. |
| **5** | [**LOW_LEVEL_ARCHITECTURE.md**](file:///e:/PROJECT/Skill_Compass/docs/LOW_LEVEL_ARCHITECTURE.md) | **Service Internals:** Deep dive into `AssessmentEngine`, `CompetencyEngine`, `RecommendationEngine`, and `AIService` class contracts. |
| **6** | [**COMPETENCY_ENGINE.md**](file:///e:/PROJECT/Skill_Compass/docs/COMPETENCY_ENGINE.md) | **Scoring Mechanics:** Mathematical formulations, weighted evidence aggregation, skill-gap calculations, and prerequisite DAG resolution. |
| **7** | [**API_ARCHITECTURE.md**](file:///e:/PROJECT/Skill_Compass/docs/API_ARCHITECTURE.md) | **REST API Contracts:** Complete specification of endpoints (`/assessment`, `/users`, `/roles`, `/reassessment`), request/response JSON schemas, and error codes. |
| **8** | [**DATA_FLOW.md**](file:///e:/PROJECT/Skill_Compass/docs/DATA_FLOW.md) | **End-to-End Trace:** 16-step chronological trace of data transformation through the system with comprehensive Mermaid sequence diagrams. |
| **9** | [**DEVELOPMENT_GUIDE.md**](file:///e:/PROJECT/Skill_Compass/docs/DEVELOPMENT_GUIDE.md) | **Team Execution Plan:** 4-person developer task division, Git branching strategy, local installation commands (no Docker), test guide, and demo rehearsal script. |

---

## 5. Cross-System Architectural Consistency Matrix

All entities, tables, and endpoints adhere to unified conventions across the entire documentation system:

```
Role Requirements (role_competencies)
       ↓
Diagnostic Assessment (assessments + assessment_answers)
       ↓
Immutable Evidence (competency_evidence)
       ↓
Deterministic Recalibration (user_competencies: current_score, skill_gap, status)
       ↓
Prerequisite Resolution (competencies.prerequisite_id DAG)
       ↓
Targeted Learning (learning_resources + competency_resources)
       ↓
Targeted Reassessment (reassessments -> new competency_evidence)
       ↓
Verifiable Score Growth (user_competencies updated)
```

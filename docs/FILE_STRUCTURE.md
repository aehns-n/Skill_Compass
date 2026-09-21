# SkillCompass — Project File Structure

## 1. Repository Overview

The SkillCompass project is organized as a clean, single-repository modular monolith. This structure enables a 4-person development team to collaborate with zero friction, clear ownership boundaries, and independent testing capability without the maintenance tax of microservices.

```
SkillCompass/
│
├── frontend/             # Next.js 14 Web Application (React + TypeScript)
├── backend/              # Python FastAPI REST Service
├── database/             # PostgreSQL migrations, schema DDL, and seed scripts
├── ai/                   # LLM prompt templates and evaluation guidelines
├── data/                 # Canonical JSON domain datasets (Roles, Competencies, Questions)
├── docs/                 # Complete architectural, API, and engineering specifications
├── .gitignore            # Workspace version control exclusions
└── README.md             # Project landing page and high-level summary
```

---

## 2. Directory Hierarchy & File Breakdown

### 2.1 Frontend (`frontend/`)

Built with Next.js 14 (App Router), React, and TypeScript.

```
frontend/
├── public/                       # Static public assets
│   ├── favicon.ico               # Browser favicon
│   └── images/                   # Diagrams, logos, badges
├── src/
│   ├── app/                      # Next.js App Router pages & routes
│   │   ├── layout.tsx            # Global root layout, fonts, and theme providers
│   │   ├── page.tsx              # Landing page / Hero view
│   │   ├── dashboard/            # Learner competency dashboard
│   │   │   └── page.tsx          # Real-time radar chart, skill-gap metrics, progress
│   │   ├── assessment/           # Diagnostic assessment flow
│   │   │   └── page.tsx          # Multi-item assessment wizard with progress bar
│   │   ├── reassessment/         # Targeted reassessment flow
│   │   │   └── page.tsx          # Focused post-learning quiz
│   │   ├── learning/             # Recommended learning path view
│   │   │   └── page.tsx          # Prerequisite-ordered resource cards
│   │   └── profile/              # Role selection & learner preferences
│   │       └── page.tsx          # Target role picker and baseline stats
│   ├── components/               # Modular, reusable React UI components
│   │   ├── ui/                   # Primitive design system components (Button, Modal, Card, Badge)
│   │   ├── assessment/           # QuestionCard, OptionSelector, Timer, ProgressBar
│   │   ├── dashboard/            # CompetencyRadarChart, GapList, MetricCard, LevelIndicator
│   │   └── learning/             # ResourceCard, ActionItem, LearningPathTimeline
│   ├── lib/                      # Client utilities and shared API abstractions
│   │   ├── api.ts                # Typed Fetch / Axios client wrapper for FastAPI endpoints
│   │   ├── constants.ts          # UI constants, route definitions, score thresholds
│   │   └── utils.ts              # Classname helpers, date formatters, math helpers
│   └── types/                    # Frontend TypeScript data interfaces
│       ├── api.ts                # API request/response contracts
│       ├── competency.ts         # Competency, SkillGap, and Evidence interfaces
│       └── assessment.ts         # Question, AssessmentSession, AnswerSubmission types
├── package.json                  # Node dependencies and build scripts
├── tsconfig.json                 # Strict TypeScript compiler options
├── tailwind.config.ts            # Design tokens, color palette, animations
└── .env.local                    # Local frontend environment variables (API URLs)
```

#### Purpose & Responsibilities
- **Belongs here:** UI presentation, user interactions, local client-side state, form handling, API integration client, animations.
- **MUST NOT belong here:** Direct database connections, proprietary scoring math, hardcoded business logic, LLM API keys.

---

### 2.2 Backend (`backend/`)

Built with Python 3.11, FastAPI, SQLAlchemy 2.0 (Async), and Pydantic v2.

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                   # FastAPI app entry point, CORS middleware, router inclusion
│   ├── api/                      # REST API routes and controllers
│   │   ├── __init__.py
│   │   ├── deps.py               # Dependency injection (DB session, auth mocks)
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py         # Aggregated v1 API router
│   │       ├── users.py          # /api/v1/users (Profile, Role assignment)
│   │       ├── roles.py          # /api/v1/roles (Role taxonomy and requirements)
│   │       ├── assessment.py     # /api/v1/assessment (Start, submit, results)
│   │       ├── reassessment.py   # /api/v1/reassessment (Targeted quiz, recalibration)
│   │       ├── competencies.py   # /api/v1/competencies (Scores, gap vectors)
│   │       └── learning.py       # /api/v1/learning (Path generation, resource status)
│   ├── core/                     # Application configurations & security
│   │   ├── __init__.py
│   │   ├── config.py             # Pydantic BaseSettings, environment variables
│   │   └── database.py           # SQLAlchemy async engine, sessionmaker, Base class
│   ├── models/                   # SQLAlchemy ORM database models
│   │   ├── __init__.py           # Model exports for Alembic/SQLAlchemy
│   │   ├── user.py               # User table
│   │   ├── role.py               # Role, RoleCompetency tables
│   │   ├── competency.py         # Competency, UserCompetency, CompetencyEvidence tables
│   │   ├── question.py           # Question, QuestionCompetency, Assessment, AssessmentAnswer
│   │   └── learning.py           # LearningResource, CompetencyResource, LearningProgress
│   ├── schemas/                  # Pydantic validation and serialization models
│   │   ├── __init__.py
│   │   ├── user.py               # UserRead, UserCreate, RoleSelectSchema
│   │   ├── assessment.py         # AssessmentStart, AssessmentSubmit, QuestionPublic
│   │   ├── competency.py         # CompetencyScoreRead, SkillGapRead, CompetencyGraphRead
│   │   └── learning.py           # LearningPathRead, ResourceStatusUpdate
│   └── services/                 # Core deterministic business logic & engines
│       ├── __init__.py
│       ├── assessment_service.py # Question sampling, raw grading, submission validation
│       ├── competency_service.py # Deterministic scoring engine, evidence ledger, gap math
│       ├── recommendation_service.py # Prerequisite topological sorting, resource ordering
│       └── ai_service.py         # External LLM prompt execution, JSON parse, fallback handler
├── requirements.txt              # Pinned Python package dependencies
├── .env                          # Local backend secrets (DB URI, OpenAI Key)
└── .env.example                  # Template of required backend environment variables
```

#### Purpose & Responsibilities
- **Belongs here:** REST API contracts, validation, database interactions, deterministic scoring logic, prerequisite resolution, LLM client calls.
- **MUST NOT belong here:** Frontend HTML/JSX, client-side UI state, unvalidated SQL statements.

---

### 2.3 Database (`database/`)

Schema definitions, data migrations, and deterministic seed scripts.

```
database/
├── schema.sql                    # Pure PostgreSQL DDL (Tables, Foreign Keys, Indexes, Constraints)
├── seed.sql                      # Idempotent SQL script populating roles, competencies, thresholds, and resources
└── README.md                     # Database setup instructions, migration steps, reset commands
```

#### Purpose & Responsibilities
- **Belongs here:** Canonical database definitions, indexes, integrity constraints, and baseline seed fixtures.
- **MUST NOT belong here:** Business application code or dynamic user runtime state.

---

### 2.4 AI Layer (`ai/`)

Centralized repository for LLM prompt engineering, few-shot examples, and strict JSON output templates.

```
ai/
└── prompts/
    ├── question_generation.txt   # System prompt for generating questions targeting specific competencies
    ├── skill_mapping.txt         # System prompt for semantic concept-to-competency alignment
    └── feedback.txt              # System prompt for contextual diagnosis of student answer errors
```

#### Purpose & Responsibilities
- **Belongs here:** Version-controlled prompt strings, variable interpolation keys, JSON format specifications, few-shot rubrics.
- **MUST NOT belong here:** Production credentials or scoring logic.

---

### 2.5 Static Domain Data (`data/`)

Canonical bootstrap datasets loaded into the database or used for offline validation.

```
data/
├── roles.json                    # Benchmark roles and metadata (e.g., Junior Data Scientist)
├── competencies.json             # Competency taxonomy, parent IDs, categories, descriptions
├── questions.json                # Pre-calibrated assessment question bank with answers and weights
└── learning_resources.json       # Curated micro-learning resources, URLs, durations, and types
```

#### Purpose & Responsibilities
- **Belongs here:** Ground-truth JSON representations of benchmark curriculum and question items.
- **MUST NOT belong here:** Temporary logs, user-generated runtime submissions.

---

### 2.6 Documentation (`docs/`)

The single source of truth for platform architecture, database design, scoring mechanics, and team execution.

```
docs/
├── README.md                     # Documentation index and recommended reading path
├── PROJECT_ARCHITECTURE.md       # Problem statement, philosophy, loop, and MVP boundaries
├── FILE_STRUCTURE.md             # Repository directory map, responsibilities, and guardrails
├── HIGH_LEVEL_ARCHITECTURE.md    # Multi-tier system architecture and request/response topologies
├── LOW_LEVEL_ARCHITECTURE.md     # Component-level internals, algorithms, and class designs
├── DATABASE_SCHEMA.md            # Entity-relationship data model, field definitions, and indexes
├── API_ARCHITECTURE.md           # REST API specification, request/response contracts, and error codes
├── COMPETENCY_ENGINE.md          # Mathematical formulas, evidence weighting, and gap mechanics
├── DATA_FLOW.md                  # Complete 16-step end-to-end trace with sequence diagrams
└── DEVELOPMENT_GUIDE.md          # 4-developer hackathon division, Git workflow, and run commands
```

---

## 3. Separation of Concerns & Dependency Direction

To maintain stability throughout the 24-hour sprint, strict dependency directions are enforced:

```mermaid
flowchart TD
    UI[Frontend: Next.js Client] -->|HTTP REST Requests (JSON)| API[Backend: FastAPI Controllers]
    API --> SCHEMAS[Pydantic Validation Schemas]
    API --> SERVICES[Services / Business Logic Engines]
    SERVICES --> MODELS[SQLAlchemy ORM Models]
    SERVICES --> AISERVICE[AI Service]
    AISERVICE -->|Prompts| PROMPTS[Prompt Templates in ai/]
    MODELS --> DB[(PostgreSQL Database)]
```

### Critical Architectural Guardrails
1. **Frontend never queries the database directly:** All database access is mediated by FastAPI API endpoints.
2. **AI never writes directly to user competency tables:** The `AIService` returns interpretations, generated questions, or feedback strings to the `AssessmentService`. The `CompetencyEngine` evaluates evidence and commits score updates.
3. **Services are decoupled from HTTP request objects:** `CompetencyEngine` and `RecommendationEngine` accept pure domain objects or primitives and return domain results, making them 100% unit-testable without spinning up an HTTP server.
4. **Shared Types Consistency:** Frontend TypeScript interfaces in `frontend/src/types/` mirror the backend Pydantic schemas in `backend/app/schemas/` 1:1.

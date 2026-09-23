# SkillCompass 🎯

### AI-Powered Competency Intelligence & Adaptive Learning Platform

> **Course completion ≠ competency.**

SkillCompass is an AI-powered competency intelligence platform that identifies what a learner can currently demonstrate, uncovers role-specific skill gaps, recommends targeted learning, and measures competency growth through reassessment.

🔗 **Live Application:** https://skill-compass-jet.vercel.app

---

## 📌 Overview

Most learning platforms focus on course completion and content consumption.

SkillCompass focuses on a different question:

> **What can a learner actually demonstrate?**

The platform connects a learner's target role with a structured competency framework, evaluates their current knowledge through diagnostic assessments, identifies competency gaps, recommends targeted learning resources, and reassesses the learner to measure improvement.

The goal is to move from simply tracking course completion to measuring **actual competency growth**.

---

## 💡 The Problem

Traditional learning platforms primarily answer:

> **Did the learner complete the course?**

But completing a course does not necessarily mean that the learner can apply the knowledge effectively.

Two learners may complete the same courses while having significantly different levels of competency.

SkillCompass addresses this gap by focusing on:

- What the learner currently knows
- What the learner can demonstrate
- What competencies are required for their target role
- Where the learner's skill gaps are
- What they should learn next
- Whether their competency actually improved

> **Knowing what someone completed is not the same as knowing what they can do.**

---

## 🚀 Our Approach

SkillCompass follows a continuous competency intelligence loop:

```text
PROFILE
   ↓
ASSESS
   ↓
DIAGNOSE
   ↓
RECOMMEND
   ↓
LEARN
   ↓
REASSESS
   ↓
MEASURE
   ↺
Profile

The learner selects a target role and is evaluated against the competencies relevant to that role.

Assess

A role-specific diagnostic assessment evaluates the learner's current knowledge.

Diagnose

Assessment results are mapped to individual competencies to identify strengths and skill gaps.

Recommend

The platform prioritizes identified gaps and connects them with relevant learning resources.

Learn

The learner follows targeted resources based on their identified competency gaps.

Reassess

The learner can take a targeted reassessment to demonstrate whether their competency has improved.

Measure

The platform updates competency evidence and provides a measurable view of progress.

✨ Key Features
🎯 Role-Based Competency Mapping

Learners are evaluated against competencies relevant to their selected role.

Current role frameworks include:

Data Engineer
Cybersecurity Analyst / Engineer
Network Engineer

Each role is mapped to a structured competency framework.

📝 Diagnostic Assessment

SkillCompass uses competency-mapped assessments to establish a learner's current level.

Assessment questions are associated with:

Competency
Difficulty
Correct answer
Explanation
Assessment evidence

The assessment is designed to identify specific areas of weakness rather than producing only one overall score.

📊 Competency Scoring

Competency scores are calculated from assessment evidence using structured and deterministic logic.

For the current assessment model:

Current Score =
(Correct Answers / Total Questions) × 100

This makes the scoring process transparent and explainable.

🔎 Skill-Gap Detection

The platform compares demonstrated competency against the required level for the selected role.

Skill Gap =
max(0, Required Level - Current Competency)

This allows the system to identify:

Competencies that meet the target
Competencies that need improvement
High-priority competency gaps
📚 Personalized Learning Recommendations

Instead of presenting learners with a large generic course catalog, SkillCompass connects identified competency gaps with relevant learning resources.

The goal is simple:

Identify the gap first. Recommend learning second.

🔄 Reassessment & Competency Growth

Completing a learning resource does not automatically increase a learner's competency score.

The learner must demonstrate improvement through reassessment.

Assess
   ↓
Identify Gap
   ↓
Learn
   ↓
Reassess
   ↓
Update Competency

This creates an evidence-based learning loop.

🤖 AI + Structured Intelligence

A core design principle of SkillCompass is:

AI interprets and generates. Structured logic calculates and tracks competency.

AI can assist with tasks such as:

Question generation
Explanations
Feedback
Semantic interpretation
Learning-content analysis

However, competency measurement is handled through structured assessment evidence and deterministic logic rather than allowing an LLM to arbitrarily assign competency scores.

This makes the system more transparent, explainable, and auditable.

🏗️ System Architecture

                         ┌─────────────────────┐
                         │      Next.js        │
                         │      Frontend       │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │       FastAPI       │
                         │     Backend API     │
                         └──────────┬──────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 ▼                  ▼                  ▼
        ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
        │   Assessment   │ │  Competency    │ │ Recommendation │
        │     Engine     │ │     Engine     │ │     Engine     │
        └────────────────┘ └────────────────┘ └────────────────┘
                 │                  │                  │
                 └──────────────────┼──────────────────┘
                                    ▼
                         ┌─────────────────────┐
                         │ PostgreSQL /        │
                         │ Supabase            │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      AI / LLM       │
                         │       Layer         │
                         └─────────────────────┘

🛠️ Technology Stack
Layer	Technology
Frontend	Next.js, React, TypeScript
Styling	Tailwind CSS
Backend	Python, FastAPI
Database	PostgreSQL, Supabase
AI	LLM-based AI services
Frontend Deployment	Vercel
Backend Deployment	Render
🗄️ Database Architecture

SkillCompass uses a relational data model to connect learners, roles, competencies, learning resources, and assessment evidence.

Core Entities
users
roles
competencies
role_competencies
learning_resources
competency_resources
evidence_logs
Relationships

                    ┌──────────────┐
                    │    Roles     │
                    └──────┬───────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Role Competencies│
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │   Competencies   │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │    Learning      │
                  │    Resources     │
                  └──────────────────┘


┌──────────────┐
│    Users     │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  Evidence Logs   │
└──────────────────┘

This structure separates:

Role requirements
Competency definitions
Learning resources
Learner evidence
Competency measurements

📂 Project Structure
Skill_Compass/
├── .gitignore
├── README.md
├── pytest.ini
│
├── ai/                                    # AI Prompts & Generation Templates
│   ├── __init__.py
│   └── prompts/
│       ├── __init__.py
│       └── question_generation_prompts.py # Prompt templates for LLM question & assessment generation
│
├── backend/                               # FastAPI Python Backend
│   ├── .env
│   ├── .env.example
│   ├── README.md
│   ├── requirements.txt
│   ├── dashboard.py                       # Streamlit / interactive operational pipeline dashboard
│   ├── generate_seed_sql.py               # Utility script to convert curated resources to SQL seeds
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                        # FastAPI application entry point, CORS & route mounting
│   │   ├── api/
│   │   │   ├── loop_router.py             # Closed-loop competency API endpoints (Profile, Measure, Diagnose, Learn, Reassess)
│   │   │   └── pipeline_router.py         # Pipeline & ingestion admin / status endpoints
│   │   ├── core/
│   │   │   ├── config.py                  # Environment settings, database connection strings, API keys
│   │   │   ├── db_store.py                # Database connection pools & query helper functions
│   │   │   ├── curated_resources_data.py  # Seed definitions for curated learning resources
│   │   │   └── all_curated_resources.py   # Aggregated curated knowledge resources
│   │   ├── schemas/
│   │   │   └── loop_schemas.py            # Pydantic v2 schemas for request validation & API responses
│   │   └── services/
│   │       ├── pipeline_orchestrator.py   # End-to-end ingestion & vectorization workflow coordinator
│   │       ├── demo/
│   │       │   └── demo_seeder.py         # Demo user seeding & test fixture population
│   │       ├── diagnose/
│   │       │   └── diagnose_service.py    # Skill gap analysis, target benchmark vs actual score delta
│   │       ├── ingestion/
│   │       │   ├── connectors.py          # External data source connectors (GitHub, YouTube, ArXiv, etc.)
│   │       │   ├── freshness_validator.py # Resource freshness, staleness & validity checks
│   │       │   └── pipeline.py            # Ingestion batch pipeline controller
│   │       ├── learning/
│   │       │   └── learning_service.py    # Personalized learning path generation & prerequisite resolution
│   │       ├── loop/
│   │       │   └── loop_state_machine.py  # 5-stage closed loop state machine (Profile -> Measure -> Diagnose -> Learn -> Reassess)
│   │       ├── measure/
│   │       │   └── measure_service.py     # Competency scoring engine & diagnostic assessment evaluation
│   │       ├── profile/
│   │       │   └── profile_service.py     # User profiling, target role assignment, benchmark expectations
│   │       ├── question_generator/
│   │       │   ├── generator.py           # LLM & rubric-based dynamic question generator
│   │       │   └── validator.py           # Verification of question syntax, options, and difficulty balance
│   │       ├── reassessment/
│   │       │   └── reassessment_service.py# Post-learning targeted reassessment & delta recalibration
│   │       ├── skill_gap/
│   │       │   └── assessment_adapter.py  # Translates assessment results to competency score updates
│   │       └── vectorization/
│   │           ├── chunker.py             # Content document splitter & text chunking
│   │           ├── embedder.py            # Vector embedding generator (OpenAI / HuggingFace)
│   │           ├── extractors.py          # Text extraction from PDF, HTML, markdown, and transcripts
│   │           └── vector_store.py        # Vector search and storage (pgvector / ChromaDB)
│   └── tests/
│       ├── conftest.py                    # Pytest configuration and database fixtures
│       ├── test_loop_and_scoring.py       # Unit tests for scoring engine & state machine transitions
│       └── test_pipeline.py               # Ingestion pipeline unit & integration tests
│
├── database/                              # PostgreSQL DDL Schemas & Seed Data
│   ├── README.md
│   ├── schema.sql                         # Base relational schema (Users, Roles, Competencies, Questions)
│   ├── schema_pipeline.sql                # Vector pipeline & content ingestion schema (pgvector)
│   ├── 003_loop_and_prerequisites.sql     # Prerequisite graphs, loop logs & evidence ledger schema
│   ├── seed.sql                           # Baseline seed data (Roles, core competencies, questions)
│   └── seed_pipeline_resources.sql        # Pre-seeded learning resources & indexed metadata
│
├── docs/                                  # Architectural & Engineering Specifications
│   ├── README.md                          # Documentation roadmap & reading guide
│   ├── PROJECT_REPORT_SHEET.md            # Comprehensive project overview & milestone tracker
│   ├── PROJECT_ARCHITECTURE.md            # Core philosophy, design principles, and problem framing
│   ├── HIGH_LEVEL_ARCHITECTURE.md         # Multi-tier system architecture & component diagrams
│   ├── LOW_LEVEL_ARCHITECTURE.md          # Algorithms, math models, class designs, and data flow
│   ├── DATABASE_SCHEMA.md                 # Entity-relationship diagrams and table specifications
│   ├── API_ARCHITECTURE.md                # REST API contract definitions & route specifications
│   ├── COMPETENCY_ENGINE.md               # Evidence decay formulas, scoring math, and recalibration rules
│   ├── DATA_FLOW.md                       # Step-by-step trace of the end-to-end data lifecycle
│   ├── PIPELINE_ARCHITECTURE.md           # RAG ingestion, vectorization & freshness architecture
│   ├── PIPELINE_RUNBOOK.md                # Pipeline operational runbook & troubleshooting guide
│   ├── INTEGRATION_DECISIONS.md           # System integration decisions & trade-offs
│   ├── DEVELOPMENT_GUIDE.md               # Local development setup, conventions & contribution guide
│   ├── FILE_STRUCTURE.md                  # Detailed directory structure reference
│   └── implementation_plan.md             # Implementation milestone plan
│
└── frontend/                              # Next.js 14 Web Application
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── next.config.mjs
    ├── postcss.config.mjs
    ├── .env.example
    ├── app/                               # Next.js App Router
    │   ├── layout.tsx                     # Global layout, fonts, header, and navigation shell
    │   ├── globals.css                    # Tailwind & global stylesheet
    │   ├── page.tsx                       # Landing page & loop entry point
    │   ├── onboarding/                    # Step 1: Role selection & profile creation
    │   │   └── page.tsx
    │   ├── assessment/                    # Step 2: Diagnostic capability assessment
    │   │   ├── page.tsx                   # Interactive question runner
    │   │   └── results/page.tsx           # Initial assessment score report
    │   ├── dashboard/                     # Learner dashboard: Radar charts, competency overview
    │   │   └── page.tsx
    │   ├── gaps/                          # Step 3: Skill gap analysis & benchmark delta
    │   │   └── page.tsx
    │   ├── graph/                         # Interactive competency dependency & knowledge graph
    │   │   └── page.tsx
    │   ├── learning/                      # Step 4: Personalized learning roadmap & resources
    │   │   └── page.tsx
    │   ├── learn/module/                  # Micro-learning module reader & practice view
    │   │   └── page.tsx
    │   ├── reassess/                      # Step 5: Targeted reassessment runner
    │   │   ├── page.tsx                   # Post-learning verification test
    │   │   └── result/page.tsx            # Reassessment delta & competency growth view
    │   └── progress/                      # Historical competency evolution & evidence ledger
    │       └── page.tsx
    ├── components/                        # Reusable React UI Components
    │   ├── ui.tsx                         # Reusable primitives (Card, Badge, Button, Progress, Modal)
    │   ├── Shell.tsx                      # Top-level application shell with sidebar & navigation
    │   ├── LoopWorkflowStepper.tsx        # 5-step loop progress indicator banner
    │   ├── NextActionBanner.tsx           # Dynamic contextual banner prompting user's next logical step
    │   ├── DemoNavigator.tsx              # Quick navigation switch between stages for demo purposes
    │   ├── AssessmentRunner.tsx           # Multi-item interactive question quiz engine
    │   ├── CompetencyCard.tsx             # Competency rating, gap badge & progress card
    │   ├── CompetencyGraph.tsx            # Directed competency graph & prerequisite visualizer
    │   └── CompetencyHeatmap.tsx          # Skill matrix & competency level heatmap
    ├── context/
    │   └── PrototypeContext.tsx           # Global state manager for user progress, loop state, and active role
    ├── data/                              # Static prototype datasets & mock fallbacks
    │   ├── roles.ts                       # Benchmark roles (e.g., Full Stack Engineer, ML Engineer)
    │   ├── competencyGraph.ts             # Competency nodes and prerequisite edges
    │   ├── assessments.ts                 # Pre-calibrated assessment question bank
    │   ├── learningPaths.ts               # Curated learning resources mapped to competencies
    │   └── evidence.ts                    # Sample evidence ledger records
    └── lib/
        └── api.ts                         # Client API wrapper connecting to FastAPI backend


Make sure you have the following installed:

Node.js
Python 3.x
PostgreSQL or access to a Supabase database
Git
1. Clone the Repository
git clone <repository-url>
cd SkillCompass
2. Frontend Setup
cd frontend
npm install

Create a .env.local file:

NEXT_PUBLIC_API_URL=http://localhost:8000

Start the development server:

npm run dev

The frontend will be available at:

http://localhost:3000
3. Backend Setup

Open a new terminal:

cd backend

Create a virtual environment:

python -m venv .venv

Activate the virtual environment.

Windows:

.venv\Scripts\activate

macOS / Linux:

source .venv/bin/activate

Install dependencies:

pip install -r requirements.txt

Configure the required environment variables in .env.

Start the backend:

uvicorn main:app --reload

The API will be available at:

http://localhost:8000
🔐 Environment Variables

Never commit real credentials or API keys to the repository.

Example backend environment:

DATABASE_URL=your_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
AI_API_KEY=your_ai_api_key
ENVIRONMENT=development

Frontend:

NEXT_PUBLIC_API_URL=http://localhost:8000

Keep private credentials such as service-role keys and AI API keys on the backend. They should never be exposed through public frontend environment variables.

🔬 Competency Intelligence Model

SkillCompass separates role requirements from learner evidence.

The core flow is:

Role Requirement
       +
Learner Evidence
       ↓
Current Competency
       ↓
Skill Gap
       ↓
Priority
       ↓
Learning Recommendation

This allows the platform to reason about individual competencies rather than relying only on an overall learning score.

🎯 Why SkillCompass?

Traditional learning platforms often focus on:

What courses did you complete?

SkillCompass focuses on:

What can you currently demonstrate?

What competency gaps remain?

What should you learn next?

Did that learning actually improve your competency?

The fundamental shift is from content consumption to measurable competency growth.

🔮 Future Roadmap

SkillCompass is designed to evolve beyond static diagnostic assessments.

Adaptive Assessment

Future versions can explore:

Misconception-driven distractors
Shadow questions / parallel forms
Computerized Adaptive Testing (CAT)
Item Response Theory (IRT)
Scenario-based assessments
Practical Competency Evidence

Future versions can incorporate:

Code tracing
Debugging tasks
Output prediction
Coding challenges
Repository-based evidence
Practical simulations
Advanced Retrieval

Potential future capabilities include:

Hybrid vector + BM25 retrieval
Contextual chunking
Parent-document retrieval
Graph-based competency retrieval
GraphRAG
Precision Remediation

The platform can evolve from broad course recommendations toward precise remediation:

Misconception
      ↓
Knowledge Gap
      ↓
Relevant Learning Content
      ↓
Micro-Learning
      ↓
Targeted Reassessment
Continuous Knowledge Intelligence

Future iterations can explore:

Knowledge freshness detection
Content deprecation detection
Persistent vector databases
Human-in-the-loop validation
Custom role ingestion
Job-description-based competency mapping
Organization-specific competency frameworks
Local AI

The architecture can potentially support private or local AI execution using technologies such as:

Ollama
vLLM
llama.cpp

These capabilities are part of the future roadmap and are not represented as current functionality unless implemented.

🌐 Live Application
Open SkillCompass

Experience the platform:

https://skill-compass-jet.vercel.app

📌 Project Status

Status: Working Prototype

The current version demonstrates the core competency intelligence workflow, including:

Role-based competency mapping
Diagnostic assessment
Competency scoring
Skill-gap detection
Gap prioritization
Learning recommendations
Reassessment
Competency tracking

Advanced adaptive assessment, practical competency evaluation, advanced retrieval, and continuous knowledge intelligence are part of the future roadmap.

🎯 Project Vision

SkillCompass aims to move learning systems from simply tracking what people consume to understanding what people can actually demonstrate.

STATIC ASSESSMENT
        ↓
EVIDENCE-BASED COMPETENCY
        ↓
ADAPTIVE ASSESSMENT
        ↓
PERSONALIZED REMEDIATION
        ↓
CONTINUOUS COMPETENCY INTELLIGENCE

Know the gap. Learn what matters. Measure the growth.

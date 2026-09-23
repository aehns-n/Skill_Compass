# Skill_Compass
SkillCompass is an AI-powered competency intelligence platform that identifies skill gaps, assesses current capabilities, and creates personalized learning paths. It continuously measures competency through targeted assessments and reassessment, helping learners focus on what matters and enabling organizations to track measurable skill growth.

---

SkillCompass
AI-Powered Competency Intelligence & Adaptive Learning Platform

Course completion does not equal competency.

SkillCompass is an AI-powered competency intelligence platform designed to identify what a learner can currently demonstrate, uncover role-specific skill gaps, recommend targeted learning, and measure competency growth through reassessment.

Live Application: https://skill-compass-jet.vercel.app

Problem

Traditional learning platforms primarily measure content consumption:

Did the learner complete the course?

But completing a course does not necessarily mean that the learner can apply the knowledge effectively.

Two learners may complete the same courses while having significantly different levels of competency.

SkillCompass focuses on a different question:

What can the learner actually demonstrate, what are they missing, and what should they learn next?

Our Approach

SkillCompass follows a continuous competency loop:

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

The system establishes a learner's current competency through a role-specific diagnostic assessment. It then compares demonstrated competency against the requirements of the selected role, identifies the most important skill gaps, and recommends relevant learning resources.

After learning, the learner can be reassessed to validate whether competency has actually improved.

Key Features
1. Role-Based Competency Mapping

Learners select a target role and are evaluated against the competencies relevant to that role.

The current platform includes roles such as:

Data Engineer
Cybersecurity Analyst / Engineer
Network Engineer

Each role is mapped to a structured competency framework.

2. Diagnostic Assessment

SkillCompass uses competency-mapped assessments to establish a learner's current level.

Questions are associated with:

Competency
Difficulty
Correct answer
Explanation
Assessment evidence

The assessment is designed to identify specific areas of weakness rather than producing only one overall score.

3. Competency Calculation

Competency scores are calculated from assessment evidence using structured, deterministic logic.

Current Score =
Correct Answers / Total Questions × 100

This makes the scoring process transparent and explainable.

4. Skill-Gap Detection

The platform compares demonstrated competency against the required level for the selected role.

Skill Gap =
max(0, Required Level - Current Competency)

This allows the system to distinguish between:

Skills that already meet the target
Skills that need improvement
Skills requiring higher-priority intervention
5. Priority-Based Learning

Not every skill gap has the same importance.

SkillCompass prioritizes gaps using competency requirements and role-specific priority information, allowing learners to focus on the areas that matter most for their target role.

6. Personalized Learning Recommendations

Identified gaps are connected to relevant learning resources.

Instead of presenting a large generic course catalog, SkillCompass aims to answer:

What should I learn next based on what I currently lack?

7. Reassessment & Competency Growth

Learning completion does not automatically increase a competency score.

The learner must demonstrate improvement through reassessment.

This creates a measurable loop:

Assess → Identify Gap → Learn → Reassess → Update Competency
AI + Structured Intelligence

A core design principle of SkillCompass is:

AI interprets and generates. Structured logic calculates and tracks competency.

AI can be used for tasks such as:

Question generation
Explanations
Feedback
Semantic mapping
Learning-content interpretation

However, the competency engine does not blindly rely on an LLM to assign arbitrary competency scores.

Assessment evidence is processed through deterministic scoring and gap-calculation logic, making the system more explainable and auditable.

System Architecture
                    ┌─────────────────────┐
                    │      Next.js        │
                    │     Frontend        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       FastAPI       │
                    │     Backend API     │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             ▼                 ▼                 ▼
   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
   │   Assessment    │ │   Competency    │ │ Recommendation  │
   │     Engine      │ │     Engine      │ │     Engine      │
   └─────────────────┘ └─────────────────┘ └─────────────────┘
             │                 │                 │
             └─────────────────┼─────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │ PostgreSQL /        │
                    │ Supabase            │
                    └─────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     AI / LLM        │
                    │   Intelligence      │
                    └─────────────────────┘
Technology Stack
Frontend
Next.js
React
TypeScript
Tailwind CSS
Backend
Python
FastAPI
Database
PostgreSQL
Supabase
AI
LLM API
AI-assisted question generation
Semantic interpretation and feedback
Deployment
Vercel — Frontend
Render — Backend
Database Design

The platform uses a relational competency model built around roles, competencies, learning resources, and assessment evidence.

Core entities include:

users
roles
competencies
role_competencies
learning_resources
competency_resources
evidence_logs

Relationships:

Role
  │
  ├── Role Competencies ──→ Competencies
  │                              │
  │                              ↓
  │                     Learning Resources
  │
  ↓
Users
  │
  ↓
Evidence Logs

This structure allows the platform to separate:

Role requirements
Competency definitions
Learning resources
Learner evidence
Competency measurements
Current Capabilities

The current version focuses on the core competency intelligence workflow:

Role selection
Competency mapping
Diagnostic assessment
Deterministic competency scoring
Skill-gap calculation
Gap prioritization
Learning recommendations
Reassessment
Competency tracking

The platform uses a structured competency framework and representative learning resources.

Future Roadmap

SkillCompass is designed to evolve beyond static diagnostic assessments.

Advanced Retrieval
Hybrid retrieval using dense vector search + BM25
Parent-document retrieval
Contextual chunking
Graph-based competency retrieval
Adaptive Assessment
Misconception-driven distractors
Shadow questions / parallel forms
Computerized Adaptive Testing (CAT)
Item Response Theory (IRT)
Scenario-based and practical assessments
Practical Competency Evidence

Future versions can evaluate competency through:

Code tracing
Debugging scenarios
Output prediction
Coding tasks
Repository-based evidence
Practical simulations
Precision Remediation

Instead of recommending an entire course, the system can eventually identify:

Misconception
      ↓
Exact Knowledge Gap
      ↓
Relevant Learning Chunk
      ↓
Micro-Learning
      ↓
Targeted Reassessment
Continuous Knowledge Intelligence

Future iterations can incorporate:

Knowledge freshness detection
Content deprecation detection
Persistent vector databases
Human-in-the-loop content validation
Custom role and job-description ingestion
Organization-specific competency frameworks
Local AI

The architecture can also support private/local model execution through technologies such as:

Ollama
vLLM
llama.cpp

This can reduce dependency on external model APIs and provide greater control over sensitive competency data.

Why SkillCompass?

Traditional learning platforms often answer:

What courses did you complete?

SkillCompass aims to answer:

What can you currently demonstrate?

What competency gaps remain?

What should you learn next?

Did that learning actually improve your competency?

That shift — from content consumption to measurable competency — is the foundation of SkillCompass.

Project Vision

SkillCompass aims to evolve from a competency assessment platform into a continuous intelligence layer for learning and workforce development.

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

Live Application

Open SkillCompass

Project Status

Status: Working Prototype

The current version demonstrates the core competency intelligence workflow. Advanced adaptive assessment, practical competency evaluation, advanced retrieval, and continuous knowledge intelligence are part of the future roadmap.


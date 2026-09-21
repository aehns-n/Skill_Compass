# SkillCompass — Database Layer (PostgreSQL / Supabase)

## 1. Database Purpose & Architectural Role

The SkillCompass database layer serves as the rock-solid relational foundation for the platform. It enforces relational integrity, stores role benchmarks, indexes curated learning resources, and maintains an append-only ledger of observable performance evidence (`evidence_logs`).

```
┌────────────────────────────────────────────────────────┐
│                   TECHNICAL PRINCIPLE                  │
│                                                        │
│  "AI interprets and generates.                         │
│   Structured logic calculates and tracks competency."  │
└────────────────────────────────────────────────────────┘
```

The database never stores arbitrary black-box AI scores as competency truth. Instead, it captures observable events in `evidence_logs`, allowing deterministic business logic to evaluate real-time capability against role benchmarks.

---

## 2. Relational Schema Summary

The database comprises **7 core tables**:

| Table | Purpose | Primary Key | Foreign Keys / Constraints |
| :--- | :--- | :--- | :--- |
| **`roles`** | Target industry roles (e.g. Statistical Officer, Data Analyst). | `id (UUID)` | `name UNIQUE` |
| **`users`** | Registered learners and their active target role. | `id (UUID)` | `role_id -> roles(id)`, `email UNIQUE` |
| **`competencies`** | Atomic skill taxonomy (8 core skills). | `id (UUID)` | `name UNIQUE` |
| **`role_competencies`**| Required competency levels (0–100) per role. | `id (UUID)` | `role_id -> roles`, `competency_id -> competencies`, `UNIQUE(role_id, competency_id)` |
| **`learning_resources`**| Curated learning modules with authoritative URLs. | `id (UUID)` | `difficulty`, `resource_type`, `estimated_minutes > 0` |
| **`competency_resources`**| Many-to-many relationship with priority order. | `id (UUID)` | `competency_id -> competencies`, `resource_id -> learning_resources`, `UNIQUE(competency_id, resource_id)` |
| **`evidence_logs`** | Observable performance records used for scoring. | `id (UUID)` | `user_id -> users`, `competency_id -> competencies`, `score BETWEEN 0 AND 100`, `weight > 0` |

---

## 3. Entity Relationships

```
roles
  ├───► users
  └───► role_competencies ◄─── competencies
                                  ├───► competency_resources ◄─── learning_resources
                                  └───► evidence_logs ◄─── users
```

1. **`roles` $\rightarrow$ `users`:** Each learner is optionally enrolled in a target role (`ON DELETE SET NULL`).
2. **`roles` $\rightarrow$ `role_competencies` $\leftarrow$ `competencies`:** Defines benchmark requirements for a role. A unique composite constraint prevents duplicate mappings.
3. **`competencies` $\rightarrow$ `competency_resources` $\leftarrow$ `learning_resources`:** Maps learning materials to competencies with a `priority` integer for the recommendation engine.
4. **`users` $\rightarrow$ `evidence_logs` $\leftarrow$ `competencies`:** Tracks discrete test scores, assessments, and activities with weights and metadata.

---

## 4. How to Run in Supabase

### Option A: Supabase Web Dashboard (Recommended for Hackathon)
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard) and navigate to your project.
2. Click on the **SQL Editor** in the left navigation sidebar.
3. Click **New query**.
4. Copy the entire contents of [`database/schema.sql`](file:///e:/PROJECT/Skill_Compass/database/schema.sql) and paste into the editor.
5. Click **Run** (green button). Verify "Success. No rows returned."
6. Open another new query tab, copy the contents of [`database/seed.sql`](file:///e:/PROJECT/Skill_Compass/database/seed.sql), and paste it in.
7. Click **Run**. Verify data insertion.

### Option B: Local PostgreSQL or psql CLI
If connecting directly via `psql` or a local PostgreSQL instance:
```bash
# 1. Execute schema DDL
psql -h localhost -U postgres -d skillcompass -f database/schema.sql

# 2. Populate prototype seed data
psql -h localhost -U postgres -d skillcompass -f database/seed.sql
```

---

## 5. Required Environment Variables for Backend

The FastAPI backend connects to PostgreSQL using asyncpg/SQLAlchemy. Add the following to `backend/.env`:

```ini
# Supabase Transaction Pooler (Port 6543) or Direct Connection (Port 5432)
DATABASE_URL="postgresql+asyncpg://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# Alternative for local PostgreSQL:
# DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/skillcompass"
```

---

## 6. Verification & Validation Queries

After running `schema.sql` and `seed.sql`, run the following SQL queries in the Supabase SQL Editor to verify complete database integrity:

### 1. Verify Role and Competency Counts (Expected: 2 roles, 8 competencies)
```sql
SELECT 
    (SELECT COUNT(*) FROM roles) AS total_roles,
    (SELECT COUNT(*) FROM competencies) AS total_competencies,
    (SELECT COUNT(*) FROM role_competencies) AS total_requirements,
    (SELECT COUNT(*) FROM learning_resources) AS total_resources,
    (SELECT COUNT(*) FROM competency_resources) AS total_mappings;
```
*Expected Result:*
- `total_roles`: 2
- `total_competencies`: 8
- `total_requirements`: 16
- `total_resources`: 15
- `total_mappings`: 16

### 2. Verify Role Competency Benchmarks (Both roles have exactly 8 competencies)
```sql
SELECT 
    r.name AS role_name,
    COUNT(rc.competency_id) AS mapped_competencies,
    ROUND(AVG(rc.required_level), 1) AS avg_required_level
FROM roles r
JOIN role_competencies rc ON r.id = rc.role_id
GROUP BY r.name;
```

### 3. Verify Every Competency Has at least One Recommended Resource
```sql
SELECT 
    c.name AS competency_name,
    COUNT(cr.resource_id) AS resource_count,
    MIN(cr.priority) AS top_priority
FROM competencies c
LEFT JOIN competency_resources cr ON c.id = cr.competency_id
GROUP BY c.name
ORDER BY resource_count ASC;
```
*Expected Result:* `resource_count` $\ge 2$ for all 8 competencies.

### 4. Verify Integrity Constraints Reject Invalid Data
```sql
-- Test 1: Should fail CHECK (required_level >= 0 AND required_level <= 100)
-- INSERT INTO role_competencies (role_id, competency_id, required_level) 
-- VALUES ('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222201', 150.00);

-- Test 2: Should fail UNIQUE constraint on duplicate role-competency pair
-- INSERT INTO role_competencies (role_id, competency_id, required_level) 
-- VALUES ('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222201', 75.00);
```

### 5. Inspect Seeded Evidence Log for Demo User
```sql
SELECT 
    u.name AS user_name,
    c.name AS competency,
    el.evidence_type,
    el.score,
    el.weight,
    el.metadata
FROM evidence_logs el
JOIN users u ON el.user_id = u.id
JOIN competencies c ON el.competency_id = c.id;
```

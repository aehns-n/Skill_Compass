# SkillCompass — Database Layer (PostgreSQL / Supabase)

## 1. Database Purpose & Architectural Role

The SkillCompass database layer serves as the relational foundation for the platform. It enforces relational integrity, stores role benchmarks, tracks source-derived rankings, indexes curated learning resources, and maintains an append-only ledger of observable performance evidence (`evidence_logs`).

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

| Table | Purpose | Primary Key | Key Fields & Constraints |
| :--- | :--- | :--- | :--- |
| **`roles`** | Target industry roles (Data Engineer, Cybersecurity Analyst / Engineer, Network Engineer). | `id (UUID)` | `name UNIQUE` |
| **`users`** | Registered learners and their active target role. | `id (UUID)` | `role_id -> roles(id)`, `email UNIQUE` |
| **`competencies`** | Reusable competency taxonomy (17 core skills). | `id (UUID)` | `name UNIQUE`, `category` |
| **`role_competencies`**| Associates roles with competencies, preserving source rank and prototype required levels. | `id (UUID)` | `rank (source priority)`, `required_level (0–100)`, `UNIQUE(role_id, competency_id)`, `UNIQUE(role_id, rank)` |
| **`learning_resources`**| Curated learning modules with authoritative URLs. | `id (UUID)` | `difficulty`, `resource_type`, `estimated_minutes > 0` |
| **`competency_resources`**| Many-to-many relationship with priority order. | `id (UUID)` | `competency_id -> competencies`, `resource_id -> learning_resources`, `UNIQUE(competency_id, resource_id)` |
| **`evidence_logs`** | Observable performance records used for scoring. | `id (UUID)` | `user_id -> users`, `competency_id -> competencies`, `score BETWEEN 0 AND 100`, `weight > 0` |

---

## 3. Entity Relationships

```
                    ┌──────────────┐
                    │    USERS     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    ROLES     │
                    └──────┬───────┘
                           │
                           ▼
                ┌────────────────────┐
                │ ROLE_COMPETENCIES  │
                └─────────┬──────────┘
                          │
                          ▼
                  ┌──────────────┐
                  │ COMPETENCIES │
                  └──────┬───────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
      ┌─────────────────┐   ┌────────────────┐
      │ EVIDENCE_LOGS   │   │ LEARNING       │
      │                 │   │ RESOURCES      │
      └─────────────────┘   └───────┬────────┘
                                    │
                                    ▼
                          COMPETENCY_RESOURCES
```

---

## 4. Source-Based Rank vs. Prototype Required Level

It is critical to distinguish between these two attributes in `role_competencies`:

| Attribute | Meaning | Source | Scale | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **`rank`** | Relative priority / sequence of competencies within the role. | **Reference Material** (Explicitly specified in project requirements) | Integer ($1, 2, 3...$) | Preserves the exact authoritative ordering from the curriculum reference. |
| **`required_level`** | Target competency benchmark used by the scoring engine. | **SkillCompass Prototype** (Configurable baseline) | Numeric ($0.00 - 100.00$) | Allows the Competency Engine to compute $\text{SkillGap} = \max(0, \text{required\_level} - \text{current\_score})$. |

> **Important Note:** The source material defines rankings and domain scope; it does not provide official government/industry percentage standards. Prototype required levels are provided for demonstration and are fully customizable.

---

## 5. Roles & Competency Taxonomy (17 Unique Competencies)

### Role 1: Data Engineer (6 Competencies)
| Rank | Competency | Category | Prototype Target | Description / Focus |
| :---: | :--- | :--- | :---: | :--- |
| 1 | **SQL & Data Modeling** | Data Architecture | 85.00 | Relational schemas, normalization, analytical SQL, window functions, CTEs. |
| 2 | **Python / Scala** | Programming | 80.00 | Data manipulation libraries such as Pandas and PySpark, OOP, scripting. |
| 3 | **Distributed Computing & Big Data** | Big Data | 75.00 | Apache Spark, Hadoop ecosystem, MapReduce concepts. |
| 4 | **Data Pipelining & Orchestration** | Data Engineering | 80.00 | Apache Airflow, Prefect, ETL/ELT design, DAG management. |
| 5 | **Data Warehousing & Cloud** | Cloud & Infrastructure | 75.00 | Snowflake, BigQuery, AWS Redshift, data lakehouse architectures. |
| 6 | **Streaming Data Processing** | Stream Processing | 70.00 | Apache Kafka, Flink, real-time ingestion pipelines. |

### Role 2: Cybersecurity Analyst / Engineer (5 Competencies)
*Note: The reference material provided exactly 5 visible competencies. In accordance with strict guidelines, no 6th competency has been invented.*
| Rank | Competency | Category | Prototype Target | Description / Focus |
| :---: | :--- | :--- | :---: | :--- |
| 1 | **Network & OS Fundamentals** | Systems & Networks | 85.00 | TCP/IP, OSI model, Linux/Windows administration, security protocols. |
| 2 | **Threat Detection & SIEM** | Security Operations | 80.00 | Log analysis, Splunk, Elastic Security, SOC monitoring. |
| 3 | **Vulnerability Assessment & Pen Testing** | Offensive Security | 75.00 | Nmap, Wireshark, Burp Suite, OWASP Top 10, penetration testing. |
| 4 | **Identity & Access Management (IAM)** | Access Control | 75.00 | Zero Trust architecture, RBAC, Active Directory, OAuth/SAML. |
| 5 | **Incident Response & Digital Forensics** | Incident Response | 70.00 | Malware analysis, containment strategies, memory analysis. |

### Role 3: Network Engineer (6 Competencies)
| Rank | Competency | Category | Prototype Target | Description / Focus |
| :---: | :--- | :--- | :---: | :--- |
| 1 | **Routing & Switching Fundamentals** | Networking | 85.00 | VLANs, STP, subnetting, IPv4/IPv6, OSPF, BGP routing protocols. |
| 2 | **Network Infrastructure & Hardware** | Hardware & Infrastructure | 80.00 | Routers, switches, firewalls. |
| 3 | **Network Automation & Scripting** | Automation | 70.00 | Python, Netmiko, NAPALM, Ansible, REST APIs for network devices. |
| 4 | **Network Security & Firewalls** | Network Security | 80.00 | VPNs (IPsec/SSL), ACLs, IDS/IPS. |
| 5 | **Cloud Networking & SD-WAN** | Cloud Networking | 75.00 | AWS VPC, Azure Virtual Networks, Software-Defined WAN (SD-WAN). |
| 6 | **Network Monitoring & Troubleshooting** | Monitoring | 75.00 | Wireshark, SNMP, Nagios, packet capturing, latency optimization. |

---

## 6. How to Run in Supabase

### Option A: Supabase SQL Editor (Recommended)
1. Navigate to your Supabase project dashboard at `https://supabase.com/dashboard`.
2. Click on **SQL Editor** in the left sidebar.
3. Open a **New query**, paste the entire contents of [`database/schema.sql`](file:///e:/PROJECT/Skill_Compass/database/schema.sql), and click **Run**.
4. Open another new query tab, paste the contents of [`database/seed.sql`](file:///e:/PROJECT/Skill_Compass/database/seed.sql), and click **Run**.
5. Verify "Success. No rows returned."

### Option B: Local PostgreSQL or psql CLI
```bash
# 1. Execute schema DDL
psql -h localhost -U postgres -d skillcompass -f database/schema.sql

# 2. Populate seed data
psql -h localhost -U postgres -d skillcompass -f database/seed.sql
```

---

## 7. Required Environment Variables for Backend

The FastAPI backend connects to PostgreSQL using asyncpg/SQLAlchemy. Add the connection URI to `backend/.env`:

```ini
# Supabase Transaction Pooler (Port 6543) or Direct Connection (Port 5432)
DATABASE_URL="postgresql+asyncpg://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
```

---

## 8. Verification & Validation SQL Queries

Run these verification queries in Supabase to confirm the updated dataset:

### 1. Verify Entity Counts
```sql
SELECT 
    (SELECT COUNT(*) FROM roles) AS total_roles,
    (SELECT COUNT(*) FROM competencies) AS total_competencies,
    (SELECT COUNT(*) FROM role_competencies) AS total_requirements,
    (SELECT COUNT(*) FROM learning_resources) AS total_resources,
    (SELECT COUNT(*) FROM competency_resources) AS total_mappings;
```
*Expected Result:*
- `total_roles`: 3
- `total_competencies`: 17
- `total_requirements`: 17
- `total_resources`: 15
- `total_mappings`: 17

### 2. Verify Competency Counts & Rank Ordering Per Role
```sql
SELECT 
    r.name AS role_name,
    COUNT(rc.competency_id) AS competencies_count,
    MIN(rc.rank) AS min_rank,
    MAX(rc.rank) AS max_rank
FROM roles r
JOIN role_competencies rc ON r.id = rc.role_id
GROUP BY r.name
ORDER BY r.name;
```
*Expected Result:*
- `Cybersecurity Analyst / Engineer`: 5 competencies (rank 1 to 5)
- `Data Engineer`: 6 competencies (rank 1 to 6)
- `Network Engineer`: 6 competencies (rank 1 to 6)

### 3. Verify Detailed Role-Competency Ranks and Targets
```sql
SELECT 
    r.name AS role_name,
    rc.rank,
    c.name AS competency_name,
    rc.required_level AS prototype_target
FROM roles r
JOIN role_competencies rc ON r.id = rc.role_id
JOIN competencies c ON rc.competency_id = c.id
ORDER BY r.name, rc.rank;
```

### 4. Verify All Competencies Have Mapped Resources
```sql
SELECT 
    c.name AS competency_name,
    COUNT(cr.resource_id) AS mapped_resources
FROM competencies c
LEFT JOIN competency_resources cr ON c.id = cr.competency_id
GROUP BY c.name
ORDER BY mapped_resources ASC, c.name;
```
*Expected Result:* Every competency has `mapped_resources >= 1`.

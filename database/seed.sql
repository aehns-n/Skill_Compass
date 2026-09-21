-- ============================================================================
-- SkillCompass — Database Seed Data (PostgreSQL / Supabase)
-- Target Roles: Data Engineer, Cybersecurity Analyst / Engineer, Network Engineer
-- ============================================================================

-- Clear existing prototype data to ensure idempotent seeding (ordered by foreign keys)
TRUNCATE TABLE evidence_logs, competency_resources, learning_resources, role_competencies, users, competencies, roles CASCADE;

-- ============================================================================
-- 1. SEED ROLES (3 Target Industry Roles)
-- ============================================================================
INSERT INTO roles (id, name, description) VALUES
(
    '11111111-1111-1111-1111-111111111101',
    'Data Engineer',
    'Designs, builds, and operationalizes scalable data pipelines, distributed storage, and analytics warehouses.'
),
(
    '11111111-1111-1111-1111-111111111102',
    'Cybersecurity Analyst / Engineer',
    'Protects digital infrastructure through threat detection, vulnerability analysis, identity management, and incident response.'
),
(
    '11111111-1111-1111-1111-111111111103',
    'Network Engineer',
    'Plans, configures, automates, and maintains high-availability routing, switching, cloud connectivity, and network security.'
);

-- ============================================================================
-- 2. SEED COMPETENCIES (17 Discrete Core Competencies)
-- ============================================================================

-- Competencies for Data Engineer (6)
INSERT INTO competencies (id, name, description, category) VALUES
(
    '22222222-2222-2222-2222-222222222101',
    'SQL & Data Modeling',
    'Relational schemas, normalization, analytical SQL, window functions, and Common Table Expressions (CTEs).',
    'Data Architecture'
),
(
    '22222222-2222-2222-2222-222222222102',
    'Python / Scala',
    'Data manipulation libraries such as Pandas and PySpark, object-oriented programming, and production scripting.',
    'Programming'
),
(
    '22222222-2222-2222-2222-222222222103',
    'Distributed Computing & Big Data',
    'Apache Spark, Hadoop ecosystem, distributed memory execution, and MapReduce processing concepts.',
    'Big Data'
),
(
    '22222222-2222-2222-2222-222222222104',
    'Data Pipelining & Orchestration',
    'Workflow scheduling using Apache Airflow, Prefect, robust ETL/ELT pipeline design, and DAG management.',
    'Data Engineering'
),
(
    '22222222-2222-2222-2222-222222222105',
    'Data Warehousing & Cloud',
    'Cloud analytical warehouses (Snowflake, BigQuery, AWS Redshift) and modern data lakehouse architectures.',
    'Cloud & Infrastructure'
),
(
    '22222222-2222-2222-2222-222222222106',
    'Streaming Data Processing',
    'Real-time streaming ingestion pipelines, event brokers, Apache Kafka, and Apache Flink.',
    'Stream Processing'
);

-- Competencies for Cybersecurity Analyst / Engineer (5 sourced from reference material)
INSERT INTO competencies (id, name, description, category) VALUES
(
    '22222222-2222-2222-2222-222222222201',
    'Network & OS Fundamentals',
    'TCP/IP stack, OSI model, Linux and Windows system administration, core ports, and security protocols.',
    'Systems & Networks'
),
(
    '22222222-2222-2222-2222-222222222202',
    'Threat Detection & SIEM',
    'Security Information and Event Management (SIEM), centralized log analysis, Splunk, Elastic Security, and SOC monitoring.',
    'Security Operations'
),
(
    '22222222-2222-2222-2222-222222222203',
    'Vulnerability Assessment & Pen Testing',
    'Network scanning with Nmap, packet analysis via Wireshark, web security with Burp Suite, OWASP Top 10, and penetration testing.',
    'Offensive Security'
),
(
    '22222222-2222-2222-2222-222222222204',
    'Identity & Access Management (IAM)',
    'Zero Trust security architecture, Role-Based Access Control (RBAC), Active Directory, OAuth 2.0, and SAML authentication.',
    'Access Control'
),
(
    '22222222-2222-2222-2222-222222222205',
    'Incident Response & Digital Forensics',
    'Incident triage, malware analysis, containment strategies, forensic chain of custody, and memory inspection.',
    'Incident Response'
);

-- Competencies for Network Engineer (6)
INSERT INTO competencies (id, name, description, category) VALUES
(
    '22222222-2222-2222-2222-222222222301',
    'Routing & Switching Fundamentals',
    'VLAN configuration, Spanning Tree Protocol (STP), IP subnetting, IPv4/IPv6 dual stack, OSPF, and BGP routing protocols.',
    'Networking'
),
(
    '22222222-2222-2222-2222-222222222302',
    'Network Infrastructure & Hardware',
    'Physical and virtual enterprise network hardware: chassis routers, multilayer switches, and perimeter firewalls.',
    'Hardware & Infrastructure'
),
(
    '22222222-2222-2222-2222-222222222303',
    'Network Automation & Scripting',
    'Automating network provisioning and telemetry using Python, Netmiko, NAPALM, Ansible, and device REST APIs.',
    'Automation'
),
(
    '22222222-2222-2222-2222-222222222304',
    'Network Security & Firewalls',
    'Virtual Private Networks (IPsec and SSL VPNs), Access Control Lists (ACLs), stateful inspection, and IDS/IPS tuning.',
    'Network Security'
),
(
    '22222222-2222-2222-2222-222222222305',
    'Cloud Networking & SD-WAN',
    'Cloud VPC architectures (AWS VPC, Azure Virtual Networks), transit gateways, and Software-Defined WAN (SD-WAN).',
    'Cloud Networking'
),
(
    '22222222-2222-2222-2222-222222222306',
    'Network Monitoring & Troubleshooting',
    'Deep packet analysis with Wireshark, SNMP telemetry, Nagios, latency optimization, and jitter diagnosis.',
    'Monitoring'
);

-- ============================================================================
-- 3. SEED ROLE_COMPETENCIES (Rank from reference material + Prototype required_level)
-- ============================================================================

-- Role 1: Data Engineer (6 competencies)
INSERT INTO role_competencies (role_id, competency_id, rank, required_level) VALUES
('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222101', 1, 85.00), -- SQL & Data Modeling
('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222102', 2, 80.00), -- Python / Scala
('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222103', 3, 75.00), -- Distributed Computing & Big Data
('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222104', 4, 80.00), -- Data Pipelining & Orchestration
('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222105', 5, 75.00), -- Data Warehousing & Cloud
('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222106', 6, 70.00); -- Streaming Data Processing

-- Role 2: Cybersecurity Analyst / Engineer (5 competencies from reference)
INSERT INTO role_competencies (role_id, competency_id, rank, required_level) VALUES
('11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222201', 1, 85.00), -- Network & OS Fundamentals
('11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222202', 2, 80.00), -- Threat Detection & SIEM
('11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222203', 3, 75.00), -- Vulnerability Assessment & Pen Testing
('11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222204', 4, 75.00), -- Identity & Access Management (IAM)
('11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222205', 5, 70.00); -- Incident Response & Digital Forensics

-- Role 3: Network Engineer (6 competencies)
INSERT INTO role_competencies (role_id, competency_id, rank, required_level) VALUES
('11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222301', 1, 85.00), -- Routing & Switching Fundamentals
('11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222302', 2, 80.00), -- Network Infrastructure & Hardware
('11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222303', 3, 70.00), -- Network Automation & Scripting
('11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222304', 4, 80.00), -- Network Security & Firewalls
('11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222305', 5, 75.00), -- Cloud Networking & SD-WAN
('11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222306', 6, 75.00); -- Network Monitoring & Troubleshooting

-- ============================================================================
-- 4. SEED LEARNING RESOURCES (Authoritative, Real, Stable Public Documentation)
-- ============================================================================
INSERT INTO learning_resources (id, title, description, resource_type, url, difficulty, estimated_minutes) VALUES
(
    '33333333-3333-3333-3333-333333333101',
    'PostgreSQL Official Tutorial: SQL Language Foundations',
    'Official PostgreSQL documentation covering relational querying, multi-table joins, subqueries, and window functions.',
    'documentation',
    'https://www.postgresql.org/docs/current/tutorial.html',
    'beginner',
    35
),
(
    '33333333-3333-3333-3333-333333333102',
    'The Python Tutorial: Official Language Primer',
    'Authoritative guide to Python syntax, data structures, object-oriented concepts, and standard library modules.',
    'documentation',
    'https://docs.python.org/3/tutorial/',
    'beginner',
    45
),
(
    '33333333-3333-3333-3333-333333333103',
    'Apache Spark Quick Start Guide',
    'Getting started with Spark DataFrames, distributed datasets, PySpark interactive shell, and cluster deployment basics.',
    'documentation',
    'https://spark.apache.org/docs/latest/quick-start.html',
    'intermediate',
    40
),
(
    '33333333-3333-3333-3333-333333333104',
    'Apache Airflow Tutorial: Orchestrating Data Pipelines',
    'Official guide to authoring Directed Acyclic Graphs (DAGs), defining tasks, operators, and scheduling robust ETL pipelines.',
    'tutorial',
    'https://airflow.apache.org/docs/apache-airflow/stable/tutorial/index.html',
    'intermediate',
    40
),
(
    '33333333-3333-3333-3333-333333333105',
    'AWS Redshift Database Developer Guide',
    'Architecture overview of cloud data warehousing, columnar storage, distribution keys, and MPP query execution.',
    'documentation',
    'https://docs.aws.amazon.com/redshift/latest/dg/welcome.html',
    'intermediate',
    35
),
(
    '33333333-3333-3333-3333-333333333106',
    'Apache Kafka Quickstart: Event Streaming Fundamentals',
    'Step-by-step introduction to event topics, producers, consumers, partition scaling, and real-time streaming architectures.',
    'tutorial',
    'https://kafka.apache.org/documentation/#quickstart',
    'intermediate',
    30
),
(
    '33333333-3333-3333-3333-333333333201',
    'Linux Journey: Operating System & Network Essentials',
    'Interactive community curriculum covering Linux CLI, process hierarchy, user permissions, and TCP/IP networking.',
    'tutorial',
    'https://linuxjourney.com/',
    'beginner',
    35
),
(
    '33333333-3333-3333-3333-333333333202',
    'Splunk Search Tutorial: SIEM & Log Analysis',
    'Hands-on tutorial for querying security logs, building alerts, correlating incidents, and generating SOC dashboards.',
    'tutorial',
    'https://docs.splunk.com/Documentation/Splunk/latest/SearchTutorial/WelcometotheSearchTutorial',
    'intermediate',
    45
),
(
    '33333333-3333-3333-3333-333333333203',
    'OWASP Top 10 Security Risks',
    'Industry standard awareness document detailing critical vulnerabilities including injection, broken auth, and SSRF.',
    'guide',
    'https://owasp.org/www-project-top-ten/',
    'intermediate',
    30
),
(
    '33333333-3333-3333-3333-333333333204',
    'NIST SP 800-63: Digital Identity & Access Management Guidelines',
    'Federal guidelines on identity proofing, multi-factor authentication (MFA), and zero trust identity assertion.',
    'pdf',
    'https://csrc.nist.gov/publications/detail/sp/800-63-3/final',
    'advanced',
    40
),
(
    '33333333-3333-3333-3333-333333333205',
    'NIST SP 800-61 Rev 2: Computer Security Incident Handling Guide',
    'Authoritative playbook on incident response lifecycle: preparation, detection, containment, eradication, and post-incident analysis.',
    'pdf',
    'https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final',
    'advanced',
    45
),
(
    '33333333-3333-3333-3333-333333333301',
    'Cisco Networking Academy: Routing & Switching Concepts',
    'Foundational guide to IP routing mechanisms, packet forwarding, router lookup tables, and subnet design.',
    'article',
    'https://www.cisco.com/c/en/us/support/docs/ip/routing-information-protocol-rip/13769-39.html',
    'beginner',
    30
),
(
    '33333333-3333-3333-3333-333333333302',
    'Ansible Network Automation Documentation',
    'Official Ansible documentation for automating switch and router configurations, ACL deployment, and idempotency.',
    'documentation',
    'https://docs.ansible.com/ansible/latest/network/index.html',
    'intermediate',
    35
),
(
    '33333333-3333-3333-3333-333333333303',
    'AWS Virtual Private Cloud (VPC) User Guide',
    'Comprehensive documentation on cloud subnets, route tables, internet gateways, VPC peering, and security groups.',
    'documentation',
    'https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html',
    'intermediate',
    40
),
(
    '33333333-3333-3333-3333-333333333304',
    'Wireshark User Guide: Packet Inspection & Network Troubleshooting',
    'Practical reference on capturing live traffic, applying display filters, TCP handshake diagnosis, and latency analysis.',
    'documentation',
    'https://www.wireshark.org/docs/wsug_html_chunked/',
    'intermediate',
    35
);

-- ============================================================================
-- 5. SEED COMPETENCY_RESOURCES (Mappings with Recommendation Priorities)
-- ============================================================================

-- Data Engineer Mappings
INSERT INTO competency_resources (competency_id, resource_id, priority) VALUES
('22222222-2222-2222-2222-222222222101', '33333333-3333-3333-3333-333333333101', 1), -- SQL & Data Modeling -> Postgres Tutorial
('22222222-2222-2222-2222-222222222102', '33333333-3333-3333-3333-333333333102', 1), -- Python / Scala -> Python Tutorial
('22222222-2222-2222-2222-222222222103', '33333333-3333-3333-3333-333333333103', 1), -- Distributed Computing -> Spark Quickstart
('22222222-2222-2222-2222-222222222104', '33333333-3333-3333-3333-333333333104', 1), -- Data Pipelining -> Airflow Tutorial
('22222222-2222-2222-2222-222222222105', '33333333-3333-3333-3333-333333333105', 1), -- Data Warehousing -> AWS Redshift Guide
('22222222-2222-2222-2222-222222222106', '33333333-3333-3333-3333-333333333106', 1); -- Streaming Data -> Kafka Quickstart

-- Cybersecurity Analyst / Engineer Mappings
INSERT INTO competency_resources (competency_id, resource_id, priority) VALUES
('22222222-2222-2222-2222-222222222201', '33333333-3333-3333-3333-333333333201', 1), -- Network & OS -> Linux Journey
('22222222-2222-2222-2222-222222222202', '33333333-3333-3333-3333-333333333202', 1), -- Threat Detection & SIEM -> Splunk Tutorial
('22222222-2222-2222-2222-222222222203', '33333333-3333-3333-3333-333333333203', 1), -- Vulnerability Assessment -> OWASP Top 10
('22222222-2222-2222-2222-222222222204', '33333333-3333-3333-3333-333333333204', 1), -- IAM -> NIST SP 800-63
('22222222-2222-2222-2222-222222222205', '33333333-3333-3333-3333-333333333205', 1); -- Incident Response -> NIST SP 800-61

-- Network Engineer Mappings
INSERT INTO competency_resources (competency_id, resource_id, priority) VALUES
('22222222-2222-2222-2222-222222222301', '33333333-3333-3333-3333-333333333301', 1), -- Routing & Switching -> Cisco Routing Concepts
('22222222-2222-2222-2222-222222222302', '33333333-3333-3333-3333-333333333301', 2), -- Hardware -> Cisco Routing Concepts (Priority 2)
('22222222-2222-2222-2222-222222222303', '33333333-3333-3333-3333-333333333302', 1), -- Automation -> Ansible Network Guide
('22222222-2222-2222-2222-222222222304', '33333333-3333-3333-3333-333333333203', 2), -- Security & Firewalls -> OWASP Top 10 (Priority 2)
('22222222-2222-2222-2222-222222222305', '33333333-3333-3333-3333-333333333303', 1), -- Cloud Networking -> AWS VPC Guide
('22222222-2222-2222-2222-222222222306', '33333333-3333-3333-3333-333333333304', 1); -- Monitoring -> Wireshark Guide

-- ============================================================================
-- 6. SEED DEMO USER & PROTOTYPE EVIDENCE LOG
-- ============================================================================
INSERT INTO users (id, name, email, role_id) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Jordan Taylor',
    'jordan.taylor@example.com',
    '11111111-1111-1111-1111-111111111101' -- Enrolled as Data Engineer
);

-- Seed initial observable diagnostic evidence for Jordan in SQL & Data Modeling (Diagnostic Score: 40.0, Weight: 1.0)
INSERT INTO evidence_logs (id, user_id, competency_id, evidence_type, source_id, score, weight, metadata) VALUES
(
    '44444444-4444-4444-4444-444444444401',
    '00000000-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222101',
    'diagnostic',
    'diag_session_initial',
    40.00,
    1.00,
    '{"assessment_title": "Baseline Diagnostic", "topic": "SQL & Data Modeling", "items_attempted": 5, "items_correct": 2}'::jsonb
);

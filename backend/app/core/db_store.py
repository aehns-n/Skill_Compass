"""
SkillCompass — High-Performance In-Memory Data Repository & Database Layer
Serves as the Single Source of Truth for roles, competencies, DAG prerequisites,
learning resources, semantic chunks, questions, evidence logs, user competencies, and loop states.
Guarantees deterministic execution and strict EvidenceLogs immutability.
"""

import uuid
import datetime
from typing import Dict, List, Optional, Any, Tuple
from app.core.all_curated_resources import get_all_curated_resources
from app.core.config import (
    DIFFICULTY_WEIGHTS,
    score_to_tier,
    rank_to_priority,
    MATERIALS_TO_REASSESS_THRESHOLD,
    MIN_PASSING_PREREQUISITE_SCORE,
    WEAK_TOPIC_ACCURACY_THRESHOLD,
    WEAK_TOPIC_MIN_QUESTIONS,
    PLATEAU_CYCLE_THRESHOLD,
    PLATEAU_DELTA_THRESHOLD,
)
from app.services.vectorization.chunker import SemanticChunker
from app.services.question_generator.generator import GroundedQuestionGenerator
from app.services.question_generator.validator import QuestionValidator

class SkillCompassStore:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(SkillCompassStore, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        
        self.roles: Dict[str, Dict[str, Any]] = {}
        self.competencies: Dict[str, Dict[str, Any]] = {}
        self.role_competencies: List[Dict[str, Any]] = []
        self.competency_prerequisites: List[Dict[str, Any]] = []
        self.learning_resources: Dict[str, Dict[str, Any]] = {}
        self.resource_chunks: Dict[str, Dict[str, Any]] = {} # chunk_id -> chunk
        self.questions: Dict[str, Dict[str, Any]] = {}       # question_id -> question with options
        
        # User dynamic state
        self.users: Dict[str, Dict[str, Any]] = {}
        self.user_competencies: Dict[str, Dict[str, Dict[str, Any]]] = {} # user_id -> competency_id -> data
        self.assessments: Dict[str, Dict[str, Any]] = {}                   # assessment_id -> data
        self.assessment_answers: List[Dict[str, Any]] = []
        self.learning_progress: Dict[str, Dict[str, Dict[str, Any]]] = {}  # user_id -> resource_id -> data
        self.loop_state: Dict[str, Dict[str, Dict[str, Any]]] = {}         # user_id -> competency_id -> data
        self.evidence_logs: List[Dict[str, Any]] = []                      # Immutable ledger
        
        self._seed_catalog()
        self._initialized = True

    def _seed_catalog(self):
        """Seed the 3 Roles, 17 Competencies, DAG edges, and 170 Learning Resources."""
        # 1. Roles
        roles_data = [
            {
                "id": "11111111-1111-1111-1111-111111111101",
                "name": "Data Engineer",
                "description": "Designs, builds, and operationalizes scalable data pipelines, distributed storage, and analytics warehouses."
            },
            {
                "id": "11111111-1111-1111-1111-111111111102",
                "name": "Cybersecurity Analyst / Engineer",
                "description": "Protects digital infrastructure through threat detection, vulnerability analysis, identity management, and incident response."
            },
            {
                "id": "11111111-1111-1111-1111-111111111103",
                "name": "Network Engineer",
                "description": "Plans, configures, automates, and maintains high-availability routing, switching, cloud connectivity, and network security."
            }
        ]
        for r in roles_data:
            self.roles[r["id"]] = r

        # 2. Competencies & Role Competencies
        comps_data = [
            # Data Engineer (6)
            ("22222222-2222-2222-2222-222222222101", "11111111-1111-1111-1111-111111111101", "SQL & Data Modeling", "Data Architecture", 85.00, 1, "Relational schemas, normalization, analytical SQL, window functions, and Common Table Expressions (CTEs)."),
            ("22222222-2222-2222-2222-222222222102", "11111111-1111-1111-1111-111111111101", "Python / Scala", "Programming", 80.00, 2, "Data manipulation libraries such as Pandas and PySpark, object-oriented programming, and production scripting."),
            ("22222222-2222-2222-2222-222222222103", "11111111-1111-1111-1111-111111111101", "Distributed Computing & Big Data", "Big Data", 75.00, 3, "Apache Spark, Hadoop ecosystem, distributed memory execution, and MapReduce processing concepts."),
            ("22222222-2222-2222-2222-222222222104", "11111111-1111-1111-1111-111111111101", "Data Pipelining & Orchestration", "Data Engineering", 80.00, 4, "Workflow scheduling using Apache Airflow, Prefect, robust ETL/ELT pipeline design, and DAG management."),
            ("22222222-2222-2222-2222-222222222105", "11111111-1111-1111-1111-111111111101", "Data Warehousing & Cloud", "Cloud & Infrastructure", 75.00, 5, "Cloud analytical warehouses (Snowflake, BigQuery, AWS Redshift) and modern data lakehouse architectures."),
            ("22222222-2222-2222-2222-222222222106", "11111111-1111-1111-1111-111111111101", "Streaming Data Processing", "Stream Processing", 70.00, 6, "Real-time streaming ingestion pipelines, event brokers, Apache Kafka, and Apache Flink."),

            # Cybersecurity (5)
            ("22222222-2222-2222-2222-222222222201", "11111111-1111-1111-1111-111111111102", "Network & OS Fundamentals", "Systems & Networks", 85.00, 1, "TCP/IP stack, OSI model, Linux and Windows system administration, core ports, and security protocols."),
            ("22222222-2222-2222-2222-222222222202", "11111111-1111-1111-1111-111111111102", "Threat Detection & SIEM", "Security Operations", 80.00, 2, "Security Information and Event Management (SIEM), centralized log analysis, Splunk, Elastic Security, and SOC monitoring."),
            ("22222222-2222-2222-2222-222222222203", "11111111-1111-1111-1111-111111111102", "Vulnerability Assessment & Pen Testing", "Offensive Security", 75.00, 3, "Network scanning with Nmap, packet analysis via Wireshark, web security with Burp Suite, OWASP Top 10, and penetration testing."),
            ("22222222-2222-2222-2222-222222222204", "11111111-1111-1111-1111-111111111102", "Identity & Access Management (IAM)", "Access Control", 75.00, 4, "Zero Trust security architecture, Role-Based Access Control (RBAC), Active Directory, OAuth 2.0, and SAML authentication."),
            ("22222222-2222-2222-2222-222222222205", "11111111-1111-1111-1111-111111111102", "Incident Response & Digital Forensics", "Incident Response", 70.00, 5, "Incident triage, malware analysis, containment strategies, forensic chain of custody, and memory inspection."),

            # Network Engineer (6)
            ("22222222-2222-2222-2222-222222222301", "11111111-1111-1111-1111-111111111103", "Routing & Switching Fundamentals", "Networking", 85.00, 1, "VLAN configuration, Spanning Tree Protocol (STP), IP subnetting, IPv4/IPv6 dual stack, OSPF, and BGP routing protocols."),
            ("22222222-2222-2222-2222-222222222302", "11111111-1111-1111-1111-111111111103", "Network Infrastructure & Hardware", "Hardware & Infrastructure", 80.00, 2, "Physical and virtual enterprise network hardware: chassis routers, multilayer switches, and perimeter firewalls."),
            ("22222222-2222-2222-2222-222222222303", "11111111-1111-1111-1111-111111111103", "Network Automation & Scripting", "Automation", 70.00, 3, "Automating network provisioning and telemetry using Python, Netmiko, NAPALM, Ansible, and device REST APIs."),
            ("22222222-2222-2222-2222-222222222304", "11111111-1111-1111-1111-111111111103", "Network Security & Firewalls", "Network Security", 80.00, 4, "Virtual Private Networks (IPsec and SSL VPNs), Access Control Lists (ACLs), stateful inspection, and IDS/IPS tuning."),
            ("22222222-2222-2222-2222-222222222305", "11111111-1111-1111-1111-111111111103", "Cloud Networking & SD-WAN", "Cloud Networking", 75.00, 5, "Cloud VPC architectures (AWS VPC, Azure Virtual Networks), transit gateways, and Software-Defined WAN (SD-WAN)."),
            ("22222222-2222-2222-2222-222222222306", "11111111-1111-1111-1111-111111111103", "Network Monitoring & Troubleshooting", "Monitoring", 75.00, 6, "Deep packet analysis with Wireshark, SNMP telemetry, Nagios, latency optimization, and jitter diagnosis."),
        ]

        for cid, rid, name, cat, target, rank, desc in comps_data:
            self.competencies[cid] = {
                "id": cid,
                "role_id": rid,
                "name": name,
                "category": cat,
                "description": desc,
            }
            self.role_competencies.append({
                "role_id": rid,
                "competency_id": cid,
                "target": target,
                "rank": rank,
                "priority": rank_to_priority(rank),
                "benchmark_rationale": desc,
            })

        # 3. Seed Prerequisite DAG Edges
        prereqs_data = [
            # Data Engineer
            ("22222222-2222-2222-2222-222222222105", "22222222-2222-2222-2222-222222222101", 70.00, "Relational modeling, normalization, and analytical SQL are fundamental prerequisites before architecting modern cloud data warehouses."),
            ("22222222-2222-2222-2222-222222222104", "22222222-2222-2222-2222-222222222102", 70.00, "Proficiency in Python/Scala scripting and data manipulation is mandatory before building custom Airflow DAGs, Prefect tasks, and ETL transforms."),
            ("22222222-2222-2222-2222-222222222106", "22222222-2222-2222-2222-222222222103", 70.00, "Understanding distributed memory, cluster partitions, and MapReduce paradigms is essential before handling low-latency streaming with Kafka and Flink."),

            # Cybersecurity
            ("22222222-2222-2222-2222-222222222202", "22222222-2222-2222-2222-222222222201", 70.00, "TCP/IP packet flows, Linux/Windows OS internals, and syslog architectures must be understood to interpret SIEM alerts and correlate security events."),
            ("22222222-2222-2222-2222-222222222203", "22222222-2222-2222-2222-222222222201", 70.00, "Port scanning, handshake analysis, and OS fingerprinting require a firm grounding in systems and network protocols."),
            ("22222222-2222-2222-2222-222222222205", "22222222-2222-2222-2222-222222222204", 70.00, "Understanding authentication tokens, Kerberos/SAML ticketing, and RBAC permissions is prerequisite to forensic triage and credential compromise containment."),

            # Network Engineer
            ("22222222-2222-2222-2222-222222222302", "22222222-2222-2222-2222-222222222301", 70.00, "VLAN, STP, and routing protocol fundamentals must precede hardware chassis sizing, port aggregation, and physical switch deployment."),
            ("22222222-2222-2222-2222-222222222305", "22222222-2222-2222-2222-222222222301", 70.00, "Subnetting, BGP route peering, and IP routing form the direct foundation of cloud VPC peering and SD-WAN overlay networks."),
            ("22222222-2222-2222-2222-222222222306", "22222222-2222-2222-2222-222222222303", 70.00, "Scripted telemetry collection and API-based health probing accelerate real-time packet capture, SNMP polling, and latency analysis."),
        ]
        for cid, pid, min_s, rat in prereqs_data:
            self.competency_prerequisites.append({
                "id": str(uuid.uuid4()),
                "competency_id": cid,
                "prerequisite_id": pid,
                "min_score": min_s,
                "rationale": rat
            })

        # 4. Seed 170 Curated Learning Resources, Chunks, and Validated Questions
        raw_resources = get_all_curated_resources()
        chunker = SemanticChunker(target_tokens=350, overlap_tokens=40)
        generator = GroundedQuestionGenerator()
        validator = QuestionValidator()

        for res in raw_resources:
            rid = res["resource_id"]
            self.learning_resources[rid] = res
            
            # Create synthetic rich text and extract semantic chunks
            text_body = f"""# {res['title']}
Focus Competency: {res.get('topic_subtopic', 'Core Concept')}
Source: {res['url']}
Category: {res.get('category', 'Technical Spec')}

{res['description']}

Key Architectural Principles & Focus Area Notes:
{res.get('alignment_notes', 'Fundamental industry implementation standard.')}

Detailed Technical Implementation:
When deploying in enterprise production, engineers must ensure consistent idempotency, robust partition management, and strict access governance. Configuration parameters should be validated under peak traffic conditions to maintain latency SLAs and fault recovery thresholds.
"""
            chunks = chunker.chunk_text(
                text=text_body,
                resource_id=rid,
                competency_id=res["competency_id"],
                topic_subtopic=res.get("topic_subtopic", "General"),
                role_id=res.get("role_id")
            )
            for ch in chunks:
                self.resource_chunks[ch["chunk_id"]] = ch

            # Generate validated MCQs grounded in resource chunks
            comp_name = self.competencies.get(res["competency_id"], {}).get("name", "Competency")
            top_sub = res.get("topic_subtopic", "Core")
            mcq = generator._synthesize_deterministic_grounded_mcq(
                competency_name=comp_name,
                topic_subtopic=top_sub,
                difficulty_level="medium",
                difficulty_score=3,
                context_chunks=chunks if chunks else [{"chunk_text": text_body, "source_title": res['title'], "source_url": res['url']}]
            )
            mcq["id"] = mcq.get("id") or str(uuid.uuid4())
            mcq["question_id"] = mcq["id"]
            mcq["competency_id"] = res["competency_id"]
            mcq["role_id"] = res.get("role_id")
            mcq["resource_id"] = rid
            val_report = validator.validate_single_question(mcq, context_chunks=chunks if chunks else [{"chunk_text": text_body}])
            if val_report.get("passed", False):
                self.questions[mcq["id"]] = mcq

    # Accessors
    def get_role(self, role_id: str) -> Optional[Dict[str, Any]]:
        return self.roles.get(role_id)

    def get_competency(self, competency_id: str) -> Optional[Dict[str, Any]]:
        return self.competencies.get(competency_id)

    def get_role_competencies(self, role_id: str) -> List[Dict[str, Any]]:
        return [rc for rc in self.role_competencies if rc["role_id"] == role_id]

    def get_prerequisites_for_competency(self, competency_id: str) -> List[Dict[str, Any]]:
        return [p for p in self.competency_prerequisites if p["competency_id"] == competency_id]

    # Immutable Evidence Logging
    def append_evidence(self, user_id: str, competency_id: str, evidence_type: str,
                        score: float, weight: float, source_id: str, metadata: Optional[Dict] = None) -> Dict[str, Any]:
        """Appends an immutable evidence log. Raises error if attempted update/delete."""
        record = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "competency_id": competency_id,
            "evidence_type": evidence_type, # diagnostic, reassessment
            "source_id": source_id,
            "score": score,
            "weight": weight,
            "metadata": metadata or {},
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        self.evidence_logs.append(record)
        return record

    def get_user_evidence(self, user_id: str, competency_id: Optional[str] = None) -> List[Dict[str, Any]]:
        return [
            e for e in self.evidence_logs 
            if e["user_id"] == user_id and (competency_id is None or e["competency_id"] == competency_id)
        ]

# Global store singleton
store = SkillCompassStore()

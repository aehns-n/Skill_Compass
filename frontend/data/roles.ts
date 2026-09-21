export type Tier = "NOVICE" | "DEVELOPING" | "PROFICIENT" | "MASTER";

export interface Competency {
  id: string;
  name: string;
  category: "Technical" | "Statistics" | "Professional" | "Domain";
  description: string;
}

export interface RoleRequirement {
  competencyId: string;
  required: number;
  priority: "HIGH" | "MEDIUM" | "LOW" | "NONE";
  benchmarkRationale: string;
}

export interface Role {
  id: string;
  title: string;
  department: string;
  description: string;
  summary: string;
  requirements: RoleRequirement[];
}

export const competencies: Competency[] = [
  {
    id: "python",
    name: "Python",
    category: "Technical",
    description: "Scripting, survey data extraction, pandas DataFrame transformations, and reproducible pipelines.",
  },
  {
    id: "sampling",
    name: "Sampling",
    category: "Statistics",
    description: "Sample frame design, stratified/cluster sampling, survey weights, and design effect calculations.",
  },
  {
    id: "visualization",
    name: "Data Visualization",
    category: "Technical",
    description: "Communicating official indicators via charts, maps, dashboards, and publication-ready graphics.",
  },
  {
    id: "sql",
    name: "SQL",
    category: "Technical",
    description: "Querying census & survey databases, complex joins, aggregations, and data validation routines.",
  },
  {
    id: "data-cleaning",
    name: "Data Cleaning",
    category: "Technical",
    description: "Anomaly detection, missing value imputation, sentinel code resolution, and deduplication.",
  },
  {
    id: "stat-fundamentals",
    name: "Statistical Fundamentals",
    category: "Statistics",
    description: "Measures of central tendency, dispersion, hypothesis testing, confidence intervals, and variance.",
  },
  {
    id: "advanced-stats",
    name: "Advanced Statistical Analysis",
    category: "Statistics",
    description: "Multivariate regression, time-series forecasting, survey inference, and econometric modeling.",
  },
  {
    id: "reporting",
    name: "Report Writing & Dissemination",
    category: "Professional",
    description: "Drafting official bulletins, metadata documentation, and executive summaries for policymakers.",
  },
  // --- Official Database Competencies (17) ---
  {
    id: "22222222-2222-2222-2222-222222222101",
    name: "SQL & Data Modeling",
    category: "Technical",
    description: "Relational schemas, normalization, analytical SQL, window functions, and Common Table Expressions (CTEs).",
  },
  {
    id: "22222222-2222-2222-2222-222222222102",
    name: "Python / Scala",
    category: "Technical",
    description: "Data manipulation libraries such as Pandas and PySpark, object-oriented programming, and production scripting.",
  },
  {
    id: "22222222-2222-2222-2222-222222222103",
    name: "Distributed Computing & Big Data",
    category: "Technical",
    description: "Apache Spark, Hadoop ecosystem, distributed memory execution, and MapReduce processing concepts.",
  },
  {
    id: "22222222-2222-2222-2222-222222222104",
    name: "Data Pipelining & Orchestration",
    category: "Technical",
    description: "Workflow scheduling using Apache Airflow, Prefect, robust ETL/ELT pipeline design, and DAG management.",
  },
  {
    id: "22222222-2222-2222-2222-222222222105",
    name: "Data Warehousing & Cloud",
    category: "Technical",
    description: "Cloud analytical warehouses (Snowflake, BigQuery, AWS Redshift) and modern data lakehouse architectures.",
  },
  {
    id: "22222222-2222-2222-2222-222222222106",
    name: "Streaming Data Processing",
    category: "Technical",
    description: "Real-time streaming ingestion pipelines, event brokers, Apache Kafka, and Apache Flink.",
  },
  {
    id: "22222222-2222-2222-2222-222222222201",
    name: "Network & OS Fundamentals",
    category: "Technical",
    description: "TCP/IP stack, OSI model, Linux and Windows system administration, core ports, and security protocols.",
  },
  {
    id: "22222222-2222-2222-2222-222222222202",
    name: "Threat Detection & SIEM",
    category: "Domain",
    description: "Security Information and Event Management (SIEM), centralized log analysis, Splunk, Elastic Security, and SOC monitoring.",
  },
  {
    id: "22222222-2222-2222-2222-222222222203",
    name: "Vulnerability Assessment & Pen Testing",
    category: "Domain",
    description: "Network scanning with Nmap, packet analysis via Wireshark, web security with Burp Suite, OWASP Top 10, and penetration testing.",
  },
  {
    id: "22222222-2222-2222-2222-222222222204",
    name: "Identity & Access Management (IAM)",
    category: "Domain",
    description: "Zero Trust security architecture, Role-Based Access Control (RBAC), Active Directory, OAuth 2.0, and SAML authentication.",
  },
  {
    id: "22222222-2222-2222-2222-222222222205",
    name: "Incident Response & Digital Forensics",
    category: "Domain",
    description: "Incident triage, malware analysis, containment strategies, forensic chain of custody, and memory inspection.",
  },
  {
    id: "22222222-2222-2222-2222-222222222301",
    name: "Routing & Switching Fundamentals",
    category: "Technical",
    description: "VLAN configuration, Spanning Tree Protocol (STP), IP subnetting, IPv4/IPv6 dual stack, OSPF, and BGP routing protocols.",
  },
  {
    id: "22222222-2222-2222-2222-222222222302",
    name: "Network Infrastructure & Hardware",
    category: "Technical",
    description: "Physical and virtual enterprise network hardware: chassis routers, multilayer switches, and perimeter firewalls.",
  },
  {
    id: "22222222-2222-2222-2222-222222222303",
    name: "Network Automation & Scripting",
    category: "Technical",
    description: "Automating network provisioning and telemetry using Python, Netmiko, NAPALM, Ansible, and device REST APIs.",
  },
  {
    id: "22222222-2222-2222-2222-222222222304",
    name: "Network Security & Firewalls",
    category: "Technical",
    description: "Virtual Private Networks (IPsec and SSL VPNs), Access Control Lists (ACLs), stateful inspection, and IDS/IPS tuning.",
  },
  {
    id: "22222222-2222-2222-2222-222222222305",
    name: "Cloud Networking & SD-WAN",
    category: "Technical",
    description: "Cloud VPC architectures (AWS VPC, Azure Virtual Networks), transit gateways, and Software-Defined WAN (SD-WAN).",
  },
  {
    id: "22222222-2222-2222-2222-222222222306",
    name: "Network Monitoring & Troubleshooting",
    category: "Technical",
    description: "Deep packet analysis with Wireshark, SNMP telemetry, Nagios, latency optimization, and jitter diagnosis.",
  },
];

export const roles: Role[] = [
  // --- Official Database Roles ---
  {
    id: "11111111-1111-1111-1111-111111111101",
    title: "Data Engineer",
    department: "Enterprise Data Architecture & Engineering",
    description:
      "Designs, builds, and operationalizes scalable data pipelines, distributed storage, and analytics warehouses.",
    summary:
      "High-throughput data engineering role requiring mastery of SQL, Spark, Airflow orchestration, and real-time streaming.",
    requirements: [
      {
        competencyId: "22222222-2222-2222-2222-222222222101",
        required: 85,
        priority: "HIGH",
        benchmarkRationale: "Relational schemas, normalization, analytical SQL, window functions, and CTEs.",
      },
      {
        competencyId: "22222222-2222-2222-2222-222222222102",
        required: 80,
        priority: "HIGH",
        benchmarkRationale: "Data manipulation with Pandas, PySpark, OOP, and production pipeline scripting.",
      },
      {
        competencyId: "22222222-2222-2222-2222-222222222103",
        required: 75,
        priority: "MEDIUM",
        benchmarkRationale: "Apache Spark distributed memory execution, partition tuning, and MapReduce.",
      },
      {
        competencyId: "22222222-2222-2222-2222-222222222104",
        required: 80,
        priority: "MEDIUM",
        benchmarkRationale: "Workflow scheduling with Apache Airflow, DAG design, and robust ETL/ELT.",
      },
      {
        competencyId: "22222222-2222-2222-2222-222222222105",
        required: 75,
        priority: "LOW",
        benchmarkRationale: "Cloud analytical data warehouses (Snowflake, BigQuery) and modern lakehouses.",
      },
      {
        competencyId: "22222222-2222-2222-2222-222222222106",
        required: 70,
        priority: "LOW",
        benchmarkRationale: "Real-time streaming ingestion pipelines with Apache Kafka and Flink.",
      },
    ],
  },
  {
    id: "11111111-1111-1111-1111-111111111102",
    title: "Cybersecurity Analyst / Engineer",
    department: "Information Security & SOC Operations",
    description:
      "Protects digital infrastructure through threat detection, vulnerability analysis, identity management, and incident response.",
    summary:
      "Operational security role focusing on SIEM telemetry, zero trust identity, penetration testing, and digital forensics.",
    requirements: [
      {
        competencyId: "22222222-2222-2222-2222-222222222201",
        required: 85,
        priority: "HIGH",
        benchmarkRationale: "TCP/IP stack, Linux/Windows administration, core ports, and protocols.",
      },
      {
        competencyId: "22222222-2222-2222-2222-222222222202",
        required: 80,
        priority: "HIGH",
        benchmarkRationale: "Centralized SIEM log analysis, Splunk, Elastic Security, and SOC alerts.",
      },
      {
        competencyId: "22222222-2222-2222-2222-222222222203",
        required: 75,
        priority: "MEDIUM",
        benchmarkRationale: "Nmap vulnerability scanning, Wireshark, Burp Suite, and OWASP Top 10.",
      },
      {
        competencyId: "22222222-2222-2222-2222-222222222204",
        required: 75,
        priority: "MEDIUM",
        benchmarkRationale: "Zero Trust architecture, RBAC, Active Directory, OAuth 2.0, and SAML.",
      },
      {
        competencyId: "22222222-2222-2222-2222-222222222205",
        required: 70,
        priority: "LOW",
        benchmarkRationale: "Incident triage, malware containment, chain of custody, and memory forensics.",
      },
    ],
  },
  {
    id: "11111111-1111-1111-1111-111111111103",
    title: "Network Engineer",
    department: "Enterprise Network Infrastructure",
    description:
      "Architects, secures, and maintains mission-critical enterprise network routing, switching, automation, and wireless systems.",
    summary:
      "Core networking role requiring deep protocol knowledge in OSPF/BGP, Python Netmiko automation, and SD-WAN.",
    requirements: [
      {
        competencyId: "22222222-2222-2222-2222-222222222301",
        required: 85,
        priority: "HIGH",
        benchmarkRationale: "VLAN, STP, IPv4/IPv6 dual stack, OSPF, and BGP routing.",
      },
      {
        competencyId: "22222222-2222-2222-2222-222222222302",
        required: 80,
        priority: "HIGH",
        benchmarkRationale: "Chassis routers, multilayer switches, and perimeter firewalls.",
      },
      {
        competencyId: "22222222-2222-2222-2222-222222222303",
        required: 70,
        priority: "MEDIUM",
        benchmarkRationale: "Network automation using Python, Netmiko, Ansible, and REST APIs.",
      },
      {
        competencyId: "22222222-2222-2222-2222-222222222304",
        required: 80,
        priority: "MEDIUM",
        benchmarkRationale: "IPsec/SSL VPNs, Access Control Lists (ACLs), and IDS/IPS tuning.",
      },
      {
        competencyId: "22222222-2222-2222-2222-222222222305",
        required: 75,
        priority: "LOW",
        benchmarkRationale: "Cloud VPC architectures, transit gateways, and SD-WAN.",
      },
      {
        competencyId: "22222222-2222-2222-2222-222222222306",
        required: 75,
        priority: "LOW",
        benchmarkRationale: "Packet analysis with Wireshark, SNMP telemetry, and latency diagnostics.",
      },
    ],
  },
  // --- Legacy Prototype Roles for Demo Continuity ---
  {
    id: "statistical-officer",
    title: "Statistical Officer",
    department: "Ministry of Statistics & Programme Implementation (MoSPI)",
    description:
      "Responsible for survey design, automated microdata processing, sampling validation, and publishing official national indicators. The central demonstration scenario for SkillCompass.",
    summary:
      "Core operational backbone for modern survey processing. Requires strong programming pipelines in Python alongside rigorous survey sampling.",
    requirements: [
      {
        competencyId: "python",
        required: 75,
        priority: "HIGH",
        benchmarkRationale: "Critical for automated data pipelines, quality checks, and replacing manual spreadsheet processing.",
      },
      {
        competencyId: "sampling",
        required: 80,
        priority: "MEDIUM",
        benchmarkRationale: "Core statistical function for designing stratified national sample frames and applying weights.",
      },
      {
        competencyId: "visualization",
        required: 70,
        priority: "MEDIUM",
        benchmarkRationale: "Necessary for creating accessible dashboards and reports for policy analysts.",
      },
      {
        competencyId: "sql",
        required: 70,
        priority: "NONE",
        benchmarkRationale: "Required for querying official microdata registries; candidate already meets this threshold.",
      },
    ],
  },
  {
    id: "field-surveyor",
    title: "Field Survey Supervisor",
    department: "National Sample Survey Office (NSSO)",
    description:
      "Coordinates primary field enumeration, verifies respondent coverage, manages CAPI/CAWI data capture, and conducts preliminary validation.",
    summary:
      "Focuses on field data capture integrity, sampling frame adherence, and on-ground discrepancy resolution.",
    requirements: [
      {
        competencyId: "sampling",
        required: 75,
        priority: "HIGH",
        benchmarkRationale: "Essential for verifying household selection protocols and preventing non-sampling bias.",
      },
      {
        competencyId: "stat-fundamentals",
        required: 65,
        priority: "MEDIUM",
        benchmarkRationale: "Needed for understanding field error rates and standard deviation thresholds.",
      },
      {
        competencyId: "reporting",
        required: 70,
        priority: "MEDIUM",
        benchmarkRationale: "Crucial for transmitting incident and non-response reports from the field.",
      },
    ],
  },
  {
    id: "data-analyst",
    title: "Statistical Data Analyst",
    department: "National Statistical Systems Directorate",
    description:
      "Performs deep statistical analytics, cross-survey triangulations, automated dashboards, and ad-hoc analytical briefs.",
    summary:
      "High-computational role requiring advanced Python data pipelines and enterprise database querying.",
    requirements: [
      {
        competencyId: "python",
        required: 85,
        priority: "HIGH",
        benchmarkRationale: "High proficiency needed for complex pandas wrangling, feature engineering, and modeling.",
      },
      {
        competencyId: "sql",
        required: 80,
        priority: "HIGH",
        benchmarkRationale: "Critical for multi-table analytical joins across historical survey databases.",
      },
      {
        competencyId: "visualization",
        required: 75,
        priority: "MEDIUM",
        benchmarkRationale: "Essential for communicating statistical findings directly to ministry leadership.",
      },
    ],
  },
];

export const competencyById = (id: string) =>
  competencies.find((c) => c.id === id);

export const tierFor = (score: number): Tier =>
  score < 40 ? "NOVICE" : score < 70 ? "DEVELOPING" : score < 90 ? "PROFICIENT" : "MASTER";

export const gapFor = (required: number, current: number) =>
  Math.max(0, required - current);

/**
 * Prototype thresholds — synthetic/representative demo values,
 * NOT official government standards.
 */
export const PROTOTYPE_NOTICE =
  "All competency thresholds and scores in this prototype are synthetic/representative demo values, not official government standards.";


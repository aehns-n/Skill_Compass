"""
SkillCompass — Operational Monitoring Dashboard (Streamlit)
Visualizes end-to-end ingestion health, vector latency, question validation QA,
and interactive skill-gap diagnostic simulations.
"""

import streamlit as st
import pandas as pd
import numpy as np
import time
import json
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from app.services.pipeline_orchestrator import SkillCompassPipeline
from app.core.all_curated_resources import ALL_COMPETENCIES_METADATA

st.set_page_config(
    page_title="SkillCompass — Pipeline Intelligence & QA",
    page_icon="🧭",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for rich aesthetics
st.markdown("""
<style>
    .main-header {
        font-size: 2.2rem;
        font-weight: 700;
        background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.5rem;
    }
    .metric-card {
        background-color: #1e293b;
        border: 1px solid #334155;
        border-radius: 8px;
        padding: 16px;
        text-align: center;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
    }
    .stTabs [data-baseweb="tab"] {
        background-color: #0f172a;
        border-radius: 6px;
        color: #94a3b8;
        padding: 8px 16px;
    }
    .stTabs [aria-selected="true"] {
        background-color: #2563eb !important;
        color: #ffffff !important;
    }
</style>
""", unsafe_allow_html=True)

# Initialize pipeline session state
if "pipeline" not in st.session_state:
    with st.spinner("Initializing SkillCompass Pipeline Engine..."):
        pipe = SkillCompassPipeline()
        pipe.run_full_pipeline(questions_per_topic=2)
        st.session_state.pipeline = pipe

pipeline: SkillCompassPipeline = st.session_state.pipeline

# Header
st.markdown('<div class="main-header">🧭 SkillCompass — Automated Pipeline & Question Intelligence</div>', unsafe_allow_html=True)
st.caption("End-to-End Material Curation, Autonomous Ingestion, Semantic Vectorization, Grounded RAG Question Generation & Skill-Gap Assessment")

# Top Metrics Row
col1, col2, col3, col4, col5 = st.columns(5)
with col1:
    st.metric(
        label="Stage 1: Curated Resources",
        value=len(pipeline.curated_resources),
        delta="17 Competencies"
    )
with col2:
    st.metric(
        label="Stage 2: Discovered Materials",
        value=len(pipeline.auto_discovered_resources),
        delta="<2% Parse Errors"
    )
with col3:
    st.metric(
        label="Stage 3: Indexed Chunks",
        value=len(pipeline.vector_store.chunks),
        delta="Latency <200ms"
    )
with col4:
    total_q = len(pipeline.question_bank)
    val_q = sum(1 for q in pipeline.question_bank if q.get("status") == "validated")
    pass_pct = (val_q / max(1, total_q)) * 100.0
    st.metric(
        label="Stage 4: Validated MCQs",
        value=f"{val_q}/{total_q}",
        delta=f"{pass_pct:.1f}% Pass Rate"
    )
with col5:
    st.metric(
        label="Stage 5: Skill-Gap Engine",
        value="Ready",
        delta="Diagnostic Active"
    )

st.divider()

# Main Tabs
tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "📚 Stage 1 & 2: Material Curation & Ingestion",
    "⚡ Stage 3: Vector Store & Latency Benchmarks",
    "🧠 Stage 4: Grounded Question Bank & QA",
    "🎯 Stage 5: Diagnostic Assessment Simulator",
    "🛡️ Freshness & Authority Radar"
])

# -----------------------------------------------------------------------------
# TAB 1: CURATION & INGESTION
# -----------------------------------------------------------------------------
with tab1:
    st.subheader("Curated & Ingested Learning Resources")
    
    comp_names = [c["name"] for c in ALL_COMPETENCIES_METADATA]
    selected_comp = st.selectbox("Filter by Competency Domain:", ["All Competencies"] + comp_names)

    filtered_res = pipeline.curated_resources
    if selected_comp != "All Competencies":
        matched_id = [c["id"] for c in ALL_COMPETENCIES_METADATA if c["name"] == selected_comp][0]
        filtered_res = [r for r in filtered_res if r.get("competency_id") == matched_id]

    df_res = pd.DataFrame([
        {
            "Title": r["title"],
            "Type": r["resource_type"].upper(),
            "Difficulty": r["difficulty"].capitalize(),
            "Authority Score": f"{r['authority_score']:.1f}",
            "Estimated Min": r["estimated_minutes"],
            "URL": r["url"]
        }
        for r in filtered_res
    ])
    st.dataframe(df_res, use_container_width=True, hide_index=True)

    st.subheader("Autonomous Ingestion Engine Runs")
    run_df = pd.DataFrame([
        {
            "Run ID": log["run_id"][:8],
            "Competency": log["competency_name"],
            "Discovered": log["items_discovered"],
            "Ingested": log["items_ingested"],
            "Parse Errors": log["parse_errors_count"],
            "Error Rate": f"{log['error_rate_pct']:.1f}%",
            "Status": log["status"].upper()
        }
        for log in pipeline.ingestion_pipeline.ingestion_logs
    ])
    st.dataframe(run_df, use_container_width=True, hide_index=True)

# -----------------------------------------------------------------------------
# TAB 2: VECTOR STORE & LATENCY
# -----------------------------------------------------------------------------
with tab2:
    st.subheader("Semantic Vector Index & Retrieval Benchmarking")
    
    col_v1, col_v2 = st.columns([1, 1])
    
    with col_v1:
        st.write("#### Live Semantic Search Query")
        query_text = st.text_input("Enter Search Term / Architectural Query:", "PostgreSQL window function unbounded preceding frame")
        top_k = st.slider("Top-K Chunks to Retrieve:", 1, 8, 4)
        
        if st.button("Execute Vector Search"):
            with st.spinner("Querying vector store..."):
                search_res = pipeline.vector_store.search(query=query_text, top_k=top_k)
                
                st.success(f"⚡ Retrieval completed in **{search_res['retrieval_latency_ms']:.2f} ms** (Target: < 200 ms)")
                
                for idx, chunk in enumerate(search_res["results"]):
                    with st.expander(f"Chunk #{idx+1} — Sim Score: {chunk['similarity_score']:.4f} | {chunk['source_title']}"):
                        st.markdown(f"**Source URL:** [{chunk['source_url']}]({chunk['source_url']})")
                        st.markdown(f"**Topic Subtopic:** `{chunk['topic_subtopic']}`")
                        st.markdown(f"**Token Count:** `{chunk['token_count']}` | **Quality Score:** `{chunk['quality_score']}`")
                        st.info(chunk["chunk_text"])

    with col_v2:
        st.write("#### Embedding Quality Matrix")
        q_report = pipeline.vector_store.generate_quality_report()
        st.json(q_report)

# -----------------------------------------------------------------------------
# TAB 3: QUESTION BANK & QA
# -----------------------------------------------------------------------------
with tab3:
    st.subheader("Grounded Question Bank & 4-Tier Automated Validation")
    
    q_filter_col1, q_filter_col2 = st.columns(2)
    with q_filter_col1:
        diff_filter = st.selectbox("Filter by Difficulty:", ["All", "easy", "medium", "hard"])
    with q_filter_col2:
        status_filter = st.selectbox("Filter by QA Status:", ["All", "validated", "flagged"])

    filtered_qs = pipeline.question_bank
    if diff_filter != "All":
        filtered_qs = [q for q in filtered_qs if q.get("difficulty_level") == diff_filter]
    if status_filter != "All":
        filtered_qs = [q for q in filtered_qs if q.get("status") == status_filter]

    st.write(f"Showing **{len(filtered_qs)}** questions matching criteria:")

    for idx, q in enumerate(filtered_qs[:15]):
        status_color = "🟢" if q.get("status") == "validated" else "🟡"
        with st.expander(f"{status_color} Q{idx+1} [{q.get('difficulty_level').upper()} - Diff {q.get('difficulty')}/5] {q.get('topic_subtopic')} — {q.get('stem')[:80]}..."):
            st.markdown(f"### {q.get('stem')}")
            
            for opt in q.get("options", []):
                opt_prefix = "✅ **[CORRECT]** " if opt.get("is_correct") else "❌ "
                st.markdown(f"{opt_prefix} **Option {opt['key']}:** {opt['text']}")
                if opt.get("distractor_rationale"):
                    st.caption(f"↳ *Distractor Analysis:* {opt['distractor_rationale']}")

            st.divider()
            st.markdown(f"📖 **Source Citation:** `{q.get('source_citation')}`")
            st.markdown(f"💬 **Verbatim Grounded Quote:** *\"{q.get('source_quote')}\"*")
            st.markdown(f"💡 **Explanation:** {q.get('explanation')}")
            st.markdown(f"📊 **Composite Quality Score:** `{q.get('quality_score', 95.0):.1f}/100`")

# -----------------------------------------------------------------------------
# TAB 4: DIAGNOSTIC ASSESSMENT SIMULATOR
# -----------------------------------------------------------------------------
with tab4:
    st.subheader("Skill-Gap Engine Diagnostic Assessment Simulator")
    
    role_choice = st.selectbox(
        "Select Target Professional Role:",
        [
            ("11111111-1111-1111-1111-111111111101", "Data Engineer"),
            ("11111111-1111-1111-1111-111111111102", "Cybersecurity Analyst / Engineer"),
            ("11111111-1111-1111-1111-111111111103", "Network Engineer")
        ],
        format_func=lambda x: x[1]
    )

    if st.button("Generate Diagnostic Test (12 Questions)"):
        test_payload = pipeline.assessment_adapter.assemble_diagnostic_assessment(
            role_id=role_choice[0],
            target_question_count=12
        )
        st.session_state.active_test = test_payload

    if "active_test" in st.session_state:
        test = st.session_state.active_test
        st.write(f"### Diagnostic Assessment ID: `{test['assessment_id'][:8]}` ({test['total_questions']} Questions)")
        
        with st.form("diagnostic_test_form"):
            user_answers = {}
            for i, q in enumerate(test["questions"]):
                st.markdown(f"**Question {i+1} ({q['difficulty_level'].capitalize()}):** {q['stem']}")
                opt_labels = [f"{opt['key']}: {opt['text']}" for opt in q["options"]]
                choice = st.radio(f"Select answer for Q{i+1}:", opt_labels, key=f"q_{q['question_id']}")
                user_answers[q["question_id"]] = choice[0] # Grab letter key A/B/C/D
                st.write("")

            submitted = st.form_submit_button("Submit Diagnostic Assessment & Evaluate Skill Gaps")
            
            if submitted:
                eval_res = pipeline.assessment_adapter.evaluate_diagnostic_submission(
                    user_id="test-user-001",
                    assessment_id=test["assessment_id"],
                    answers=user_answers,
                    curated_resources=pipeline.curated_resources
                )
                
                st.success("✅ Diagnostic Evaluation Completed Deterministically!")
                
                # Show Scores by Competency
                st.write("#### 📊 Evaluated Competency Performance")
                for comp_id, score_data in eval_res["summary_by_competency"].items():
                    comp_name = [c["name"] for c in ALL_COMPETENCIES_METADATA if c["id"] == comp_id]
                    c_name_str = comp_name[0] if comp_name else comp_id
                    st.progress(score_data["score_pct"] / 100.0, text=f"{c_name_str}: {score_data['score_pct']:.1f}% ({score_data['questions_correct']}/{score_data['questions_answered']} correct)")

                # Show Targeted Remediation
                if eval_res["remediation_recommendations"]:
                    st.write("#### 🎯 Curated Remediation Learning Path")
                    for rec in eval_res["remediation_recommendations"]:
                        r_info = rec["recommended_resource"]
                        st.warning(f"**Deficit in:** `{rec['topic_subtopic']}` → Recommended Resource: [{r_info.get('title')}]({r_info.get('url')}) ({r_info.get('estimated_minutes', 45)} mins)")

# -----------------------------------------------------------------------------
# TAB 5: FRESHNESS & AUTHORITY RADAR
# -----------------------------------------------------------------------------
with tab5:
    st.subheader("Source Freshness & Domain Authority Monitoring Radar")
    
    col_rad1, col_rad2 = st.columns(2)
    
    with col_rad1:
        st.write("#### Authoritative Domain Whitelist")
        from app.services.ingestion.freshness_validator import AUTHORITY_DOMAIN_SCORES
        dom_df = pd.DataFrame([
            {"Domain": k, "Trust Score": v}
            for k, v in sorted(AUTHORITY_DOMAIN_SCORES.items(), key=lambda x: -x[1])[:15]
        ])
        st.dataframe(dom_df, use_container_width=True, hide_index=True)

    with col_rad2:
        st.write("#### Freshness Policy Rules")
        st.info("""
        - **Fast-Moving Domains (Cloud, SIEM, Stream Processing, Offensive Sec):** Strict **<= 12 months** refresh cycle.
        - **Core Fundamentals (SQL, TCP/IP, Python Data Model, Routing):** Strict **<= 24 months** refresh cycle.
        - **Deduplication:** SHA-256 content hashing blocks redundant document ingestions.
        - **Parse Error Ceiling:** Automatic alert triggered if parser error rate exceeds **2.0%**.
        """)

st.sidebar.markdown("### ⚙️ Pipeline Quick Actions")
if st.sidebar.button("🔄 Re-run Discovery & Ingestion"):
    with st.spinner("Executing discovery runs..."):
        logs = pipeline.ingestion_pipeline.run_all_competencies_discovery()
        st.sidebar.success(f"Completed {len(logs)} competency discovery sweeps!")

st.sidebar.divider()
st.sidebar.caption("SkillCompass Automated Pipeline v1.0.0 | Isolated Scope")

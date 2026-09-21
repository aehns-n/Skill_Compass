"""
SkillCompass — Generates database/seed_pipeline_resources.sql from all_curated_resources.py
"""
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.core.all_curated_resources import generate_curated_resources_dataset

def main():
    resources = generate_curated_resources_dataset()
    sql_lines = [
        "-- ============================================================================",
        "-- SkillCompass — Stage 1 Curated Learning Resources Seed (170 Resources)",
        "-- 10 Authoritative Resources for each of the 17 Competencies",
        "-- ============================================================================",
        "",
        "-- Insert into learning_resources",
        "INSERT INTO learning_resources (id, title, description, resource_type, url, difficulty, estimated_minutes, created_at)",
        "VALUES"
    ]

    val_lines = []
    for r in resources:
        title = r["title"].replace("'", "''")
        desc = r["description"].replace("'", "''")
        url = r["url"].replace("'", "''")
        val_lines.append(f"('{r['id']}', '{title}', '{desc}', '{r['resource_type']}', '{url}', '{r['difficulty']}', {r['estimated_minutes']}, NOW())")

    sql_lines.append(",\n".join(val_lines) + ";")
    sql_lines.append("")
    sql_lines.append("-- Insert into competency_resources (mapping with priority)")
    sql_lines.append("INSERT INTO competency_resources (id, competency_id, resource_id, priority)")
    sql_lines.append("VALUES")

    cr_lines = []
    for idx, r in enumerate(resources):
        cr_id = f"44444444-4444-4444-4444-{(idx+1):012d}"
        priority = (idx % 10) + 1
        cr_lines.append(f"('{cr_id}', '{r['competency_id']}', '{r['id']}', {priority})")

    sql_lines.append(",\n".join(cr_lines) + ";")
    sql_lines.append("")

    out_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "database", "seed_pipeline_resources.sql"))
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(sql_lines))

    print(f"Successfully generated {len(resources)} resources into {out_path}")

if __name__ == "__main__":
    main()

"use client";

import Link from "next/link";
import { ArrowRight, GitFork, Network, Sparkles, BookOpen } from "lucide-react";
import { Shell } from "@/components/Shell";
import { CompetencyGraph } from "@/components/CompetencyGraph";

export default function GraphPage() {
  return (
    <Shell
      title="Competency Dependency Graph"
      breadcrumb={["Competency Graph"]}
    >
      <div className="card mb-6 border-brand-200 bg-gradient-to-r from-brand-50/80 via-white to-brand-50/30 p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Network className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-brand-950">
              Prerequisite-Aware Skill Intelligence (Not Keyword Search)
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-brand-900/80 max-w-4xl">
              In official statistical workflows, advanced capabilities depend strictly on foundational mastery. Advanced Statistical Analysis requires clean, verified microdata; Data Cleaning requires Python fundamentals. SkillCompass detects where the prerequisite bottleneck lies and prescribes targeted interventions along the dependency chain.
            </p>
          </div>
        </div>
      </div>

      <CompetencyGraph />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-ink-200 pt-6">
        <Link href="/dashboard" className="btn-secondary">
          Back to Dashboard
        </Link>
        <Link href="/gaps" className="btn-primary">
          Continue to Skill Gap Analysis <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Shell>
  );
}

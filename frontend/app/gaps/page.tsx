"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  Sparkles,
  Target,
  Route,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";
import { Shell } from "@/components/Shell";
import { StatCard, PriorityBadge } from "@/components/ui";
import { usePrototype } from "@/context/PrototypeContext";
import { competencyById } from "@/data/roles";
import { pythonLearningPath } from "@/data/learningPaths";

export default function GapsPage() {
  const { biggestGap, diagnosticDone, pythonAfter } = usePrototype();

  if (!diagnosticDone || !biggestGap) {
    return (
      <Shell title="Skill Gap Analysis" breadcrumb={["Skill Gaps"]}>
        <div className="card p-10 text-center border-ink-200 bg-white max-w-lg mx-auto">
          <p className="text-lg font-bold text-ink-900">No Assessment Data Yet</p>
          <p className="mt-1 text-sm text-ink-500">
            Complete the role diagnostic to calculate and inspect your competency gaps.
          </p>
          <Link href="/assessment" className="btn-primary mt-5">
            Start Diagnostic Assessment
          </Link>
        </div>
      </Shell>
    );
  }

  const name = competencyById(biggestGap.competencyId)?.name ?? biggestGap.competencyId;
  const isPythonReassessed = pythonAfter != null;

  return (
    <Shell title="Skill Gap Analysis & Intervention" breadcrumb={["Skill Gaps"]}>
      {/* Primary Role Gap Alert Hero */}
      <div className="card border-red-200 bg-gradient-to-br from-red-50/80 via-white to-red-50/30 p-6 sm:p-8 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700 ring-4 ring-red-50">
              <AlertTriangle className="h-6 w-6" />
            </span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-700">
                Primary Role-Relevant Skill Gap Detected
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-ink-900">
                {name} —{" "}
                <span className="text-red-600 tabular-nums">
                  {isPythonReassessed ? "3 points remaining" : `${biggestGap.gap} points`}
                </span>
              </h2>
              <p className="mt-1 text-xs text-ink-600 max-w-2xl leading-relaxed">
                SkillCompass identifies Python as the single largest bottleneck for the Statistical Officer role. Downstream modules in survey data processing are blocked until this gap is resolved.
              </p>
            </div>
          </div>

          <PriorityBadge priority={biggestGap.priority} />
        </div>

        {/* 3 Metrics Row */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Current Baseline"
            value={`${biggestGap.current}%`}
            sub="Diagnosed across 12 items"
          />
          <StatCard
            label="Role Requirement"
            value={`${biggestGap.required}%`}
            sub="Official MoSPI benchmark"
          />
          <StatCard
            label="Competency Gap"
            value={isPythonReassessed ? "3 pts" : `${biggestGap.gap} pts`}
            sub={isPythonReassessed ? "Gap closed by +38 pts!" : "Must close to unblock downstream nodes"}
            accent="text-red-600"
          />
        </div>
      </div>

      {/* Recommended Sequential Intervention */}
      <div className="mt-8 card p-6 sm:p-8 border-ink-200 bg-white shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-100 pb-4">
          <div>
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-700">
              <Route className="h-4 w-4" /> Ordered Intervention Protocol
            </span>
            <h3 className="mt-1 text-lg font-bold text-ink-900">
              Recommended 3-Stage Competency Intervention
            </h3>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            Prerequisite Sequenced (3 Modules)
          </span>
        </div>

        <p className="mt-4 text-xs text-ink-600 max-w-3xl leading-relaxed">
          Unlike catalog search engines that recommend random courses mentioning “Python”, SkillCompass constructs an exact sequence grounded in the competency dependency tree:
        </p>

        {/* 3 Sequential Step Cards */}
        <div className="mt-6 space-y-4">
          {pythonLearningPath.modules.map((m, idx) => (
            <div
              key={m.id}
              className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-ink-200 bg-ink-50/50 p-5 transition hover:border-brand-300 hover:bg-white hover:shadow-xs"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-sm font-black text-brand-800 ring-2 ring-white">
                  {idx + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-ink-900">{m.title}</h4>
                    <span className="rounded bg-white px-2 py-0.5 text-[10px] font-bold text-ink-600 border border-ink-200">
                      {m.duration}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink-600 max-w-2xl leading-relaxed">
                    {m.description}
                  </p>
                  <p className="mt-2 text-[11px] font-medium text-brand-700">
                    Why: {m.whyRecommended}
                  </p>
                </div>
              </div>

              <div className="self-end sm:self-center">
                <span className="text-xs font-semibold text-ink-500">
                  {m.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Primary CTA */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-ink-100 pt-6">
          <Link href="/graph" className="btn-secondary">
            Inspect Prerequisite Graph
          </Link>
          <Link
            href="/learning"
            className="btn-primary px-6 py-3 text-sm font-bold shadow-md shadow-brand-600/20"
          >
            Start Personalized Learning Path <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </Shell>
  );
}

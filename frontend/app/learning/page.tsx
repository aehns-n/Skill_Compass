"use client";

import Link from "next/link";
import {
  Clock,
  BookOpen,
  Route,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  Target,
  ShieldCheck,
} from "lucide-react";
import { Shell } from "@/components/Shell";
import { ProgressBar } from "@/components/ui";
import { pythonLearningPath } from "@/data/learningPaths";
import { usePrototype } from "@/context/PrototypeContext";

const difficultyColor: Record<string, string> = {
  Beginner: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Intermediate: "bg-amber-50 text-amber-800 border-amber-200",
  Advanced: "bg-purple-50 text-purple-800 border-purple-200",
};

export default function LearningPage() {
  const { learningProgress, biggestGap, diagnosticDone, pythonAfter } = usePrototype();

  if (!diagnosticDone) {
    return (
      <Shell title="Personalized Learning Roadmap" breadcrumb={["Roadmap"]}>
        <div className="card p-10 text-center border-ink-200 bg-white max-w-lg mx-auto">
          <p className="text-lg font-bold text-ink-900">No Assessment Baseline Found</p>
          <p className="mt-1 text-sm text-ink-500">
            Complete the diagnostic assessment first so SkillCompass can generate a personalized intervention roadmap.
          </p>
          <Link href="/assessment" className="btn-primary mt-5">
            Start Diagnostic Assessment
          </Link>
        </div>
      </Shell>
    );
  }

  const path = pythonLearningPath;

  return (
    <Shell
      title="Personalized Competency Roadmap"
      breadcrumb={["Roadmap", "Python for Statistical Officers"]}
    >
      {/* Personalized Rationale Callout Banner */}
      <div className="card border-brand-200 bg-gradient-to-r from-brand-50/80 via-white to-brand-50/30 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Route className="h-5 w-5" />
            </span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-800">
                Prescribed Adaptive Learning Pathway
              </span>
              <h2 className="text-lg font-bold text-ink-900">{path.title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-ink-600 max-w-3xl">
                {path.rationale}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-800">
              Target Gap: 41 Points
            </span>
          </div>
        </div>
      </div>

      {/* Sequential Module Cards */}
      <div className="mt-6 space-y-5">
        {path.modules.map((m, idx) => {
          const pct = learningProgress[m.id] ?? 0;
          const isCompleted = pct >= 100;
          const isPrimaryDemoModule = m.id === "m2";

          return (
            <div
              key={m.id}
              className={`card p-6 sm:p-7 transition-all border ${
                isPrimaryDemoModule
                  ? "border-brand-300 bg-gradient-to-br from-white via-brand-50/20 to-white shadow-md ring-1 ring-brand-400/50"
                  : "border-ink-200 bg-white hover:border-ink-300 shadow-card"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black ring-2 ring-white ${
                      isCompleted
                        ? "bg-emerald-600 text-white"
                        : "bg-brand-100 text-brand-800"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : `0${idx + 1}`}
                  </span>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-ink-400">
                        Step {idx + 1} of {path.modules.length}
                      </span>
                      {isPrimaryDemoModule && (
                        <span className="rounded-md bg-amber-100 px-2 py-0.2 text-[10px] font-bold text-amber-900 border border-amber-200">
                          Primary Interactive Demo Module
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1 text-base font-bold text-ink-900">
                      {m.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-ink-600 max-w-2xl">
                      {m.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                      difficultyColor[m.difficulty]
                    }`}
                  >
                    {m.difficulty}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-ink-500 bg-ink-50 px-2.5 py-1 rounded-full border border-ink-200">
                    <Clock className="h-3.5 w-3.5" /> {m.duration}
                  </span>
                </div>
              </div>

              {/* Personalized Reason Badge */}
              <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-2.5 text-xs leading-relaxed text-brand-900">
                <span className="font-bold text-brand-950">Why recommended: </span>
                {m.whyRecommended}
              </div>

              {/* Key Concept Pills */}
              <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="font-bold text-ink-400 text-[11px] uppercase tracking-wider mr-1">
                  Covers:
                </span>
                {m.concepts.map((c, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-ink-50 px-2 py-1 text-[11px] font-medium text-ink-700 border border-ink-200"
                  >
                    {c}
                  </span>
                ))}
              </div>

              {/* Progress and Start Button */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-ink-100 pt-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-ink-500 font-medium">
                    Prerequisites:{" "}
                    <strong className="text-ink-700">
                      {m.prerequisites.length > 0
                        ? m.prerequisites.join(", ")
                        : "None (Root Entry Point)"}
                    </strong>
                  </span>
                  {pct > 0 && (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                      {pct}% Completed
                    </span>
                  )}
                </div>

                <Link
                  href="/learn/module"
                  className="btn-primary text-xs font-bold"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  {pct >= 100 ? "Review Material" : pct > 0 ? "Continue Module" : "Start Module"}
                </Link>
              </div>

              {pct > 0 && (
                <div className="mt-3">
                  <ProgressBar value={pct} color="bg-emerald-500" height="h-1.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Shell>
  );
}

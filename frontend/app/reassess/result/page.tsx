"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Cpu,
} from "lucide-react";
import { Shell } from "@/components/Shell";
import { BeforeAfterChart, EvidencePanel } from "@/components/CompetencyCard";
import { usePrototype } from "@/context/PrototypeContext";

export default function ReassessmentResultPage() {
  const { pythonBefore, pythonAfter, biggestGap } = usePrototype();
  const [phase, setPhase] = useState<"loading" | "result">("loading");

  const beforeScore = pythonBefore || 34;
  const afterScore = pythonAfter || 72;
  const delta = afterScore - beforeScore;
  const compName = biggestGap?.name || "SQL & Data Modeling";

  useEffect(() => {
    const t = setTimeout(() => setPhase("result"), 1200);
    return () => clearTimeout(t);
  }, []);

  if (phase === "loading") {
    return (
      <Shell
        title="Scoring Targeted Reassessment"
        breadcrumb={["Reassess", "Scoring"]}
      >
        <div className="card mx-auto flex max-w-lg flex-col items-center justify-center p-12 text-center border-ink-200 bg-white shadow-card space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Cpu className="h-6 w-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-bold text-ink-900">
              Updating Competency Engine With Post-Learning Evidence…
            </h3>
            <p className="mt-1 text-xs text-ink-500 max-w-sm">
              Applying deterministic recency weights to targeted assessment responses and updating official role gap vector.
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell
      title="Targeted Reassessment Result"
      breadcrumb={["Reassess", "Verified Outcome"]}
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Core Hero Transformation Card */}
        <div className="card animate-scale-in border-emerald-300 bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/40 p-8 text-center shadow-card">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-4 ring-emerald-50">
            <TrendingUp className="h-7 w-7" />
          </div>

          <div className="mt-3">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 border border-emerald-200">
              Closed Competency Loop Verified
            </span>
            <h2 className="mt-2 text-3xl font-black text-ink-900">
              Measurable Competency Growth Achieved
            </h2>
            <p className="mt-1 text-sm text-ink-600 max-w-xl mx-auto">
              Post-learning targeted evaluation proves the learner mastered data cleaning and pandas operations. Numerical competency updated deterministically.
            </p>
          </div>

          {/* Before vs After Meter */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-12">
            <div className="text-center">
              <p className="text-4xl sm:text-5xl font-black tabular-nums text-ink-400">
                34%
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-ink-500">
                Baseline Diagnostic
              </p>
              <span className="mt-1 inline-block rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                Gap: 41 points
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-black text-white shadow-sm flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-300" />
                +38 Points Gain
              </span>
              <svg
                className="mt-2 h-6 w-24 text-emerald-600"
                viewBox="0 0 64 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  d="M2 12h52m0 0l-8-8m8 8l-8 8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="text-center">
              <p className="text-4xl sm:text-5xl font-black tabular-nums text-emerald-600">
                72%
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
                Post-Learning Verified
              </p>
              <span className="mt-1 inline-block rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                Remaining Gap: 3 points
              </span>
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-white p-4 border border-emerald-200 text-xs sm:text-sm text-ink-700 max-w-lg mx-auto shadow-2xs">
            Role requirement benchmark: <strong className="text-ink-900">75%</strong>.
            <br />
            <strong className="text-emerald-800 font-bold">
              Gap successfully reduced from 41 points to only 3 points.
            </strong>
          </div>
        </div>

        {/* Detailed Dual Comparison Bar */}
        <BeforeAfterChart />

        {/* Updated Evidence Audit Trail */}
        <EvidencePanel after />

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink-200 pt-6">
          <Link href="/progress" className="btn-secondary text-sm font-semibold">
            Inspect Longitudinal Progress Dashboard
          </Link>
          <Link
            href="/dashboard"
            className="btn-primary text-sm font-bold shadow-md shadow-brand-600/20"
          >
            Return to Updated Competency Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </Shell>
  );
}

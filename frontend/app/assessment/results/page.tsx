"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  BarChart3,
} from "lucide-react";
import { Shell } from "@/components/Shell";
import { LoadingState } from "@/components/ui";
import { usePrototype } from "@/context/PrototypeContext";
import { competencyById } from "@/data/roles";

export default function DiagnosticResultsPage() {
  const router = useRouter();
  const { scores, biggestGap, role } = usePrototype();
  const [phase, setPhase] = useState<"scoring" | "ready">("scoring");

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase("ready");
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Shell
      title="Diagnostic Assessment Scoring"
      breadcrumb={["Assessment", "Scoring & Results"]}
    >
      {phase === "scoring" ? (
        <div className="mx-auto max-w-xl card p-10 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Cpu className="h-7 w-7 animate-spin" />
          </div>
          <h2 className="text-lg font-bold text-ink-900">
            Executing Deterministic Scoring Engine…
          </h2>
          <p className="text-xs leading-relaxed text-ink-500 max-w-md mx-auto">
            Aggregating responses across 14 calibrated competency items. Applying difficulty weights and generating baseline role gap vector for {role?.title ?? "Statistical Officer"}.
          </p>
        </div>
      ) : (
        <div className="mx-auto max-w-2xl animate-scale-in space-y-6">
          {/* Main Success Card */}
          <div className="card p-8 text-center border-ink-200 bg-white shadow-card">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-4 ring-emerald-100/60">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h2 className="mt-4 text-2xl font-black text-ink-900">
              Baseline Competency Profile Computed
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600 max-w-lg mx-auto">
              Evaluation complete. Answers were scored per competency using deterministic rules. SkillCompass has benchmarked your current proficiency against the official role requirements.
            </p>

            {/* Gap Highlight Banner */}
            {biggestGap && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50/70 p-4 text-left">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-red-700">
                      Primary Role-Relevant Skill Gap Detected
                    </p>
                    <p className="text-base font-bold text-ink-900">
                      Python: <span className="text-red-600 tabular-nums">34%</span>{" "}
                      (Required: <span className="font-semibold text-ink-800">75%</span> ·{" "}
                      <strong className="text-red-700">41 points gap</strong>)
                    </p>
                    <p className="mt-1 text-xs text-ink-600">
                      Python serves as an unblockable foundational prerequisite for Data Cleaning and Advanced Statistical Analysis.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Competency Summary Table */}
            <div className="mt-6 rounded-xl border border-ink-100 bg-ink-50/50 p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {scores.map((s) => {
                  const comp = competencyById(s.competencyId);
                  const isPython = s.competencyId === "python";
                  return (
                    <div
                      key={s.competencyId}
                      className={`rounded-lg p-3 border ${
                        isPython
                          ? "bg-red-50/80 border-red-200 text-red-950"
                          : "bg-white border-ink-200 text-ink-900"
                      }`}
                    >
                      <p className="text-[11px] font-semibold truncate text-ink-500">
                        {comp?.name ?? s.competencyId}
                      </p>
                      <p className="mt-1 text-2xl font-black tabular-nums">
                        {s.current}%
                      </p>
                      <p className="text-[10px] text-ink-500">
                        req: {s.required}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="btn-primary px-6 py-3 text-sm font-bold shadow-md shadow-brand-600/20"
              >
                Proceed to Competency Dashboard <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}

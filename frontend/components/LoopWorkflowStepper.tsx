"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UserCheck,
  ClipboardList,
  Activity,
  GitBranch,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { usePrototype } from "@/context/PrototypeContext";
import { api, type LoopStateResponse, type NextActionResponse } from "@/lib/api";

const LOOP_STEPS = [
  { stage: "PROFILE", label: "1. Profile", path: "/onboarding", icon: UserCheck, desc: "Role & Self-Rating" },
  { stage: "ASSESS", label: "2. Assess", path: "/assessment", icon: ClipboardList, desc: "Diagnostic Exam" },
  { stage: "DIAGNOSE", label: "3. Diagnose", path: "/dashboard", icon: Activity, desc: "Gap Analysis" },
  { stage: "RECOMMEND", label: "4. Roadmap", path: "/gaps", icon: GitBranch, desc: "DAG Gating" },
  { stage: "LEARN", label: "5. Learn", path: "/learning", icon: BookOpen, desc: "Authoritative Chunks" },
  { stage: "REASSESS", label: "6. Reassess", path: "/reassess", icon: CheckCircle2, desc: "Grounded Rescoring" },
  { stage: "MEASURE", label: "7. Measure", path: "/progress", icon: TrendingUp, desc: "Evidence & Audit" },
];

export function LoopWorkflowStepper() {
  const pathname = usePathname();
  const { diagnosticDone, targetedDone, pythonAfter, biggestGap } = usePrototype();
  const [loopState, setLoopState] = useState<LoopStateResponse | null>(null);
  const [nextAction, setNextAction] = useState<NextActionResponse | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchLoopInfo() {
      try {
        const [stateRes, actionRes] = await Promise.all([
          api.getLoopState("demo-user-001"),
          api.getNextAction("demo-user-001"),
        ]);
        if (isMounted) {
          setLoopState(stateRes);
          setNextAction(actionRes);
        }
      } catch {
        // fallback
      }
    }
    fetchLoopInfo();
    return () => {
      isMounted = false;
    };
  }, [pathname, diagnosticDone, targetedDone, pythonAfter]);

  // Determine active stage from route or backend overall_stage
  const currentStageIndex = (() => {
    if (pathname.includes("/onboarding")) return 0;
    if (pathname.includes("/assessment")) return 1;
    if (pathname.includes("/dashboard")) return 2;
    if (pathname.includes("/gaps") || pathname.includes("/graph")) return 3;
    if (pathname.includes("/learning") || pathname.includes("/learn")) return 4;
    if (pathname.includes("/reassess")) return 5;
    if (pathname.includes("/progress")) return 6;

    if (!diagnosticDone) return 0;
    if (targetedDone || pythonAfter != null) return 6;
    return 2;
  })();

  const activeCompState = loopState?.states?.[0];
  const cycleCount = activeCompState?.cycle_count || 1;
  const materialsCount = activeCompState?.materials_completed_since_assessment || 0;
  const isThresholdReady = activeCompState?.ready_for_reassessment || materialsCount >= 3;

  return (
    <div className="mb-6 rounded-2xl border border-ink-200 bg-white p-4 shadow-sm">
      {/* Header with Cycle Count and Reassessment Threshold Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white shadow-xs">
            <RefreshCw className="h-4 w-4 animate-spin-slow" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-900">
                Continuous Competency Loop Orchestrator
              </h3>
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700 border border-brand-200">
                Cycle #{cycleCount}
              </span>
            </div>
            <p className="text-[11px] text-ink-500">
              Deterministic 7-step sequence governed by prerequisite DAG & evidence-based reassessment triggers.
            </p>
          </div>
        </div>

        {/* 3-Materials Threshold Badge */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[10px] font-semibold text-ink-500 uppercase tracking-wide">
              Reassessment Trigger
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-ink-800">
              <span>{materialsCount}/3 Materials</span>
              {isThresholdReady ? (
                <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] text-emerald-800 font-bold">
                  UNLOCKED
                </span>
              ) : (
                <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[10px] text-amber-800 font-bold">
                  3 Needed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 7-Step Sequence Interactive Bar */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {LOOP_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent = idx === currentStageIndex;
          const isPassed = idx < currentStageIndex;

          return (
            <Link
              key={step.stage}
              href={step.path}
              className={`group flex flex-col rounded-xl border p-2.5 transition-all ${
                isCurrent
                  ? "border-brand-600 bg-brand-50/80 ring-2 ring-brand-500 shadow-xs"
                  : isPassed
                  ? "border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50/60"
                  : "border-ink-100 bg-ink-50/40 opacity-70 hover:opacity-100 hover:border-ink-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold ${
                    isCurrent
                      ? "bg-brand-600 text-white"
                      : isPassed
                      ? "bg-emerald-600 text-white"
                      : "bg-ink-200 text-ink-600"
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                </span>
                <Icon
                  className={`h-4 w-4 ${
                    isCurrent
                      ? "text-brand-600"
                      : isPassed
                      ? "text-emerald-600"
                      : "text-ink-400"
                  }`}
                />
              </div>

              <p
                className={`mt-2 text-xs font-bold truncate ${
                  isCurrent
                    ? "text-brand-950"
                    : isPassed
                    ? "text-emerald-950"
                    : "text-ink-700"
                }`}
              >
                {step.label}
              </p>
              <span className="text-[10px] text-ink-400 truncate">{step.desc}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

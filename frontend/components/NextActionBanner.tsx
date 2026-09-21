"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap, ShieldAlert, CheckCircle2 } from "lucide-react";
import { api, type NextActionResponse } from "@/lib/api";
import { usePrototype } from "@/context/PrototypeContext";

export function NextActionBanner() {
  const { diagnosticDone, pythonAfter, targetedDone } = usePrototype();
  const [nextAction, setNextAction] = useState<NextActionResponse | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadAction() {
      try {
        const res = await api.getNextAction("demo-user-001");
        if (isMounted && res) {
          setNextAction(res);
        }
      } catch {
        // fallback handled below
      }
    }
    loadAction();
    return () => {
      isMounted = false;
    };
  }, [diagnosticDone, pythonAfter, targetedDone]);

  if (!nextAction) {
    // Default fallback based on client state
    if (!diagnosticDone) {
      return (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-brand-200 bg-gradient-to-r from-brand-50 via-white to-brand-50/40 p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Zap className="h-4 w-4 fill-current" />
            </span>
            <div>
              <span className="rounded bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-800">
                Next Deterministic Action
              </span>
              <h4 className="text-sm font-bold text-ink-900">Take Baseline Diagnostic Assessment</h4>
              <p className="text-xs text-ink-500">Benchmark your starting capabilities across target role requirements.</p>
            </div>
          </div>
          <Link href="/assessment" className="btn-primary px-4 py-2 text-xs font-bold">
            Start Assessment <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      );
    }
    return null;
  }

  const isMastered = nextAction.action_type === "ROLE_MASTERED";
  const isReassessReady = nextAction.action_type === "TAKE_REASSESSMENT";

  return (
    <div
      className={`mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 shadow-xs ${
        isMastered
          ? "border-emerald-300 bg-emerald-50/70"
          : isReassessReady
          ? "border-amber-300 bg-amber-50/70"
          : "border-brand-200 bg-gradient-to-r from-brand-50 via-white to-brand-50/40"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            isMastered
              ? "bg-emerald-600 text-white"
              : isReassessReady
              ? "bg-amber-600 text-white"
              : "bg-brand-600 text-white"
          }`}
        >
          {isMastered ? <CheckCircle2 className="h-5 w-5" /> : <Zap className="h-4 w-4 fill-current" />}
        </span>
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                isMastered
                  ? "bg-emerald-100 text-emerald-800"
                  : isReassessReady
                  ? "bg-amber-100 text-amber-800"
                  : "bg-brand-100 text-brand-800"
              }`}
            >
              Next Step: {nextAction.action_type.replace(/_/g, " ")}
            </span>
            {nextAction.badge && (
              <span className="text-[10px] font-semibold text-ink-500">
                · {nextAction.badge}
              </span>
            )}
          </div>
          <h4 className="mt-0.5 text-sm font-bold text-ink-900">{nextAction.title}</h4>
          <p className="text-xs text-ink-600 max-w-2xl">{nextAction.description}</p>
        </div>
      </div>

      <Link
        href={nextAction.target_url}
        className={`px-4 py-2 text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition ${
          isMastered
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : isReassessReady
            ? "bg-amber-600 text-white hover:bg-amber-700"
            : "btn-primary"
        }`}
      >
        <span>Execute Step</span> <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

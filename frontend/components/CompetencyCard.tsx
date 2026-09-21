"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  ChevronDown,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Calculator,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { PriorityBadge, ProgressBar, TierBadge } from "@/components/ui";
import type { CompetencyScore } from "@/context/PrototypeContext";
import { pythonEvidence, pythonEvidenceAfter } from "@/data/evidence";
import { competencyById } from "@/data/roles";

export function CompetencyCard({
  score,
  highlighted = false,
}: {
  score: CompetencyScore;
  highlighted?: boolean;
}) {
  const comp = competencyById(score.competencyId);
  const name = comp?.name ?? score.competencyId;
  const gap = Math.max(0, score.required - score.current);

  return (
    <div
      className={`card p-5 transition-all hover:shadow-raised ${
        highlighted
          ? "border-red-300 bg-red-50/20 ring-2 ring-red-400"
          : "border-ink-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
              {comp?.category ?? "Skill"}
            </span>
            {highlighted && (
              <span className="rounded-md bg-red-100 px-1.5 py-0.2 text-[10px] font-bold text-red-700">
                Largest Role Gap
              </span>
            )}
          </div>
          <h3 className="mt-0.5 text-base font-bold text-ink-900">{name}</h3>
          <div className="mt-2 flex items-center gap-2">
            <TierBadge score={score.current} />
            <PriorityBadge priority={score.priority} />
          </div>
        </div>

        {gap > 0 ? (
          <div className="text-right">
            <span
              className={`inline-block rounded-lg px-2.5 py-1 text-xs font-bold tabular-nums ${
                gap >= 30
                  ? "bg-red-100 text-red-700 border border-red-200"
                  : "bg-amber-100 text-amber-800 border border-amber-200"
              }`}
            >
              {gap} pts gap
            </span>
            <p className="mt-1 text-[11px] text-ink-400 font-medium">
              Target: {score.required}%
            </p>
          </div>
        ) : (
          <div className="text-right">
            <span className="inline-block rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
              Target Met
            </span>
            <p className="mt-1 text-[11px] text-emerald-600 font-semibold">
              Exceeds {score.required}%
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-1.5">
        <div className="flex justify-between text-xs font-medium text-ink-600">
          <span className="font-semibold text-ink-800 tabular-nums">
            Current: {score.current}%
          </span>
          <span className="text-ink-500 tabular-nums">
            Required: {score.required}%
          </span>
        </div>
        <ProgressBar
          value={score.current}
          color={
            gap >= 30
              ? "bg-red-500"
              : gap > 0
              ? "bg-amber-500"
              : "bg-emerald-500"
          }
          requiredMarker={score.required}
          height="h-2.5"
        />
      </div>

      {highlighted && (
        <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3 text-xs">
          <span className="font-medium text-red-700">
            Blocks downstream advanced analysis
          </span>
          <Link
            href="/gaps"
            className="flex items-center gap-1 font-bold text-brand-600 hover:text-brand-800"
          >
            Diagnose Gap <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

export function EvidencePanel({ after = false }: { after?: boolean }) {
  const [open, setOpen] = useState(true);
  const rec = after ? pythonEvidenceAfter : pythonEvidence;

  return (
    <div className="card overflow-hidden border-ink-200 shadow-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between border-b border-ink-200 bg-ink-50/70 px-5 py-4 text-left transition hover:bg-ink-100/70"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-100 text-brand-700">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-bold text-ink-900">
              Evidence Behind Competency Score
            </p>
            <p className="text-xs font-medium text-ink-500">{rec.headline}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-700">
          <span>{open ? "Collapse Audit Trail" : "Inspect Provenance"}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="animate-fade-in p-5 space-y-5">
          {/* Provenance Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-ink-200 text-left font-semibold text-ink-500">
                  <th className="pb-2">Evidence Source</th>
                  <th className="pb-2">Subtopic / Verification Item</th>
                  <th className="pb-2 text-center">Weight</th>
                  <th className="pb-2 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {rec.items.map((it, i) => (
                  <tr key={i} className="hover:bg-ink-50/50">
                    <td className="py-2.5 pr-3 font-semibold text-ink-800">
                      {it.source}
                    </td>
                    <td className="py-2.5 pr-3 text-ink-600">{it.detail}</td>
                    <td className="py-2.5 pr-3 text-center tabular-nums text-ink-500 font-mono">
                      {it.weight ?? "1.0"}
                    </td>
                    <td className="py-2.5 text-right font-bold tabular-nums text-ink-900">
                      {it.result}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mathematical Breakdown */}
          <div className="rounded-xl border border-ink-200 bg-ink-50/50 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-ink-800">
              <Calculator className="h-4 w-4 text-brand-600" />
              Deterministic Calculation Formula:
            </div>
            <p className="mt-1 font-mono text-[11px] text-ink-600 bg-white p-2 rounded border border-ink-200">
              {rec.breakdown.formula}
            </p>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {rec.breakdown.items.map((it, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs border border-ink-100"
                >
                  <span className="text-ink-600">{it.metric}</span>
                  <span className="font-bold text-ink-900">{it.impact}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Philosophy Note */}
          <div className="rounded-lg bg-brand-50/80 border border-brand-200/60 p-3.5 text-xs leading-relaxed text-brand-900">
            <p className="font-semibold text-brand-950">
              Core Architecture Guarantee:
            </p>
            <p className="mt-1">{rec.note}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function BeforeAfterChart() {
  const before = 34;
  const after = 72;
  const required = 75;

  return (
    <div className="card border-emerald-200 bg-gradient-to-br from-white via-emerald-50/20 to-emerald-50/40 p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-ink-100 pb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Demonstrated Competency Growth
          </span>
          <h3 className="text-base font-bold text-ink-900">
            Python — Before vs After Learning Intervention
          </h3>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
          +38 Percentage Points
        </span>
      </div>

      <div className="mt-6 space-y-6">
        <div>
          <div className="mb-1.5 flex justify-between text-xs font-medium">
            <span className="text-ink-600 font-semibold">
              Before (Role Diagnostic Baseline):
            </span>
            <span className="font-bold tabular-nums text-red-600">
              {before}% (41 pts gap)
            </span>
          </div>
          <ProgressBar
            value={before}
            color="bg-red-500"
            height="h-3"
            requiredMarker={required}
          />
        </div>

        <div className="flex items-center justify-center gap-3 py-1">
          <span className="h-px flex-1 bg-ink-200" />
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white shadow-xs">
            <TrendingUp className="h-3.5 w-3.5" />
            Growth Delta: +38 pts
          </span>
          <span className="h-px flex-1 bg-ink-200" />
        </div>

        <div>
          <div className="mb-1.5 flex justify-between text-xs font-medium">
            <span className="text-emerald-800 font-bold">
              After (Targeted Reassessment):
            </span>
            <span className="font-black tabular-nums text-emerald-700">
              {after}% (Remaining gap: 3 pts)
            </span>
          </div>
          <ProgressBar
            value={after}
            color="bg-emerald-500"
            height="h-3.5"
            requiredMarker={required}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg bg-white p-3 text-xs border border-emerald-200 shadow-2xs">
          <span className="text-ink-600">
            Statistical Officer Threshold: <strong>{required}%</strong>
          </span>
          <span className="font-bold text-emerald-800">
            Role Gap Reduced: 41 pts ➔ 3 pts
          </span>
        </div>
      </div>
    </div>
  );
}

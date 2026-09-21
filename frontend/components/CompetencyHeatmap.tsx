"use client";

import React, { useState } from "react";
import type { CompetencyScore } from "@/context/PrototypeContext";
import { competencyById } from "@/data/roles";

function heatStyle(current: number, required: number) {
  const gap = Math.max(0, required - current);
  if (gap === 0) {
    return {
      bg: "bg-emerald-600 text-white border-emerald-700",
      status: "Requirement Met",
      pill: "bg-emerald-700/80 text-white",
    };
  }
  if (gap > 30) {
    return {
      bg: "bg-red-600 text-white border-red-700",
      status: "Critical Role Gap",
      pill: "bg-red-700/80 text-white",
    };
  }
  if (gap > 15) {
    return {
      bg: "bg-amber-500 text-white border-amber-600",
      status: "Moderate Gap",
      pill: "bg-amber-600/80 text-white",
    };
  }
  return {
    bg: "bg-amber-100 text-amber-950 border-amber-300",
    status: "Minor Gap",
    pill: "bg-amber-200 text-amber-900",
  };
}

export function CompetencyHeatmap({ scores }: { scores: CompetencyScore[] }) {
  const [activeCompetency, setActiveCompetency] = useState<string | null>(null);

  return (
    <div className="card p-6 shadow-card border-ink-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200 pb-4">
        <div>
          <h3 className="text-base font-bold text-ink-900">
            Competency Gap Heatmap
          </h3>
          <p className="mt-0.5 text-xs text-ink-500">
            Multi-dimensional visualization of current competency vs role benchmark
          </p>
        </div>
        <span className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-700">
          {scores.length} Assessed Competencies
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {scores.map((s) => {
          const comp = competencyById(s.competencyId);
          const name = comp?.name ?? s.competencyId;
          const gap = Math.max(0, s.required - s.current);
          const style = heatStyle(s.current, s.required);

          return (
            <div
              key={s.competencyId}
              onMouseEnter={() => setActiveCompetency(s.competencyId)}
              onMouseLeave={() => setActiveCompetency(null)}
              className={`relative flex flex-col justify-between rounded-xl border p-4 shadow-xs transition-all hover:scale-[1.02] hover:shadow-md ${style.bg}`}
            >
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wide opacity-90">
                  {comp?.category ?? "Competency"}
                </span>
                <p className="mt-1 text-sm font-bold leading-snug">{name}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/20">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black tabular-nums">{s.current}%</span>
                  <span className="text-xs opacity-90">Target: {s.required}%</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className={`rounded-md px-1.5 py-0.5 font-bold ${style.pill}`}>
                    {gap > 0 ? `${gap} pts gap` : "Target Met"}
                  </span>
                  <span className="font-semibold">{style.status}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Heatmap Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-ink-50 p-3 text-xs text-ink-600">
        <span className="font-bold uppercase tracking-wider text-[11px] text-ink-500">
          Heatmap Legend:
        </span>
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-3.5 w-3.5 rounded bg-emerald-600" />
            Requirement Met (Gap: 0)
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-3.5 w-3.5 rounded bg-amber-100 border border-amber-300" />
            Minor Gap (1–15 pts)
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-3.5 w-3.5 rounded bg-amber-500" />
            Moderate Gap (16–30 pts)
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-3.5 w-3.5 rounded bg-red-600" />
            Critical Gap (&gt;30 pts)
          </span>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { tierFor } from "@/data/roles";

export function ProgressBar({
  value,
  max = 100,
  color = "bg-brand-500",
  requiredMarker,
  height = "h-2.5",
  animate = true,
}: {
  value: number;
  max?: number;
  color?: string;
  requiredMarker?: number;
  height?: string;
  animate?: boolean;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={`relative w-full ${height} rounded-full bg-ink-200/80 overflow-visible`}>
      <div
        className={`${height} rounded-full ${color} transition-all duration-700 ease-out shadow-xs`}
        style={{ width: `${pct}%` }}
      />
      {requiredMarker != null && (
        <div
          className="absolute -top-1 -bottom-1 w-0.5 bg-slate-900 shadow-sm"
          style={{ left: `calc(${Math.min(100, requiredMarker)}% - 1px)` }}
          title={`Required Benchmark: ${requiredMarker}%`}
        >
          <span className="absolute -top-3.5 -translate-x-1/2 rounded bg-slate-900 px-1 py-0.2 text-[8px] font-bold text-white uppercase tracking-tighter opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
            {requiredMarker}%
          </span>
        </div>
      )}
    </div>
  );
}

const priorityStyles: Record<string, string> = {
  HIGH: "bg-red-50 text-red-700 border-red-200",
  MEDIUM: "bg-amber-50 text-amber-800 border-amber-200",
  LOW: "bg-blue-50 text-blue-700 border-blue-200",
  NONE: "bg-emerald-50 text-emerald-800 border-emerald-200",
};

export function PriorityBadge({ priority }: { priority: string }) {
  const label =
    priority === "NONE" ? "No immediate intervention" : `${priority} priority`;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${
        priorityStyles[priority] ?? priorityStyles.NONE
      }`}
    >
      {label}
    </span>
  );
}

const tierStyles: Record<string, string> = {
  NOVICE: "bg-red-50 text-red-700 border-red-200",
  DEVELOPING: "bg-amber-50 text-amber-800 border-amber-200",
  PROFICIENT: "bg-emerald-50 text-emerald-800 border-emerald-200",
  MASTER: "bg-brand-50 text-brand-700 border-brand-200",
};

export function TierBadge({ score }: { score: number }) {
  const tier = tierFor(score);
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tierStyles[tier]}`}
    >
      {tier}
    </span>
  );
}

export function StatCard({
  label,
  value,
  sub,
  accent = "text-ink-900",
  badge,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: string;
  badge?: string;
}) {
  return (
    <div className="card p-5 border-ink-200 bg-white shadow-card transition hover:shadow-raised">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-500">{label}</p>
        {badge && (
          <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold text-ink-600">
            {badge}
          </span>
        )}
      </div>
      <p className={`mt-2 text-3xl font-black tabular-nums tracking-tight ${accent}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-500 font-medium leading-relaxed">{sub}</p>}
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="card flex flex-col items-center justify-center p-10 text-center border-ink-200 bg-white">
      <p className="text-lg font-bold text-ink-900">{title}</p>
      <p className="mt-1 max-w-md text-sm text-ink-500">{body}</p>
    </div>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="card flex items-center justify-center gap-3 p-10 border-ink-200 bg-white">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      <span className="text-sm font-medium text-ink-700">{label}</span>
    </div>
  );
}

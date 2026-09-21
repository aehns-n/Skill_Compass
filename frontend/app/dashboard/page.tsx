"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Network,
  TrendingUp,
  Sparkles,
  Award,
  BookOpen,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Shell } from "@/components/Shell";
import { StatCard, ProgressBar } from "@/components/ui";
import { CompetencyCard, EvidencePanel } from "@/components/CompetencyCard";
import { CompetencyHeatmap } from "@/components/CompetencyHeatmap";
import { competencyById, PROTOTYPE_NOTICE } from "@/data/roles";
import { usePrototype } from "@/context/PrototypeContext";

export default function DashboardPage() {
  const { scores, biggestGap, diagnosticDone, role, pythonAfter } = usePrototype();

  if (!diagnosticDone) {
    return (
      <Shell title="Competency Dashboard" breadcrumb={["Dashboard"]}>
        <div className="card p-12 text-center border-ink-200 bg-white shadow-card max-w-xl mx-auto">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-ink-900">
            Diagnostic Assessment Required
          </h2>
          <p className="mt-2 text-sm text-ink-500 leading-relaxed">
            To generate your evidence-backed competency profile and detect role-relevant skill gaps, take the 14-question baseline assessment.
          </p>
          <div className="mt-6">
            <Link href="/assessment" className="btn-primary px-6 py-3 font-bold">
              Start Diagnostic Assessment <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  const avgCurrent = Math.round(
    scores.reduce((a, s) => a + s.current, 0) / scores.length
  );
  const totalGap = scores.reduce((a, s) => a + Math.max(0, s.required - s.current), 0);
  const met = scores.filter((s) => s.current >= s.required).length;

  const compareData = scores.map((s) => ({
    name: competencyById(s.competencyId)?.name ?? s.competencyId,
    Current: s.current,
    Required: s.required,
  }));

  const biggestName = biggestGap
    ? competencyById(biggestGap.competencyId)?.name
    : null;

  return (
    <Shell title="Competency Intelligence Dashboard" breadcrumb={["Dashboard"]}>
      {/* 4 Executive Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Target Role Model"
          value={role?.title ?? "Statistical Officer"}
          sub="MoSPI Cadre Standard"
          badge="Benchmark Active"
        />
        <StatCard
          label="Average Competency"
          value={`${avgCurrent}%`}
          sub="Across 4 required competencies"
          accent={pythonAfter != null ? "text-emerald-700" : "text-brand-700"}
        />
        <StatCard
          label="Benchmarks Met"
          value={`${met} / ${scores.length}`}
          sub={met === scores.length ? "All benchmarks satisfied" : "SQL satisfied; 3 in progress"}
          accent={met === scores.length ? "text-emerald-600" : "text-amber-600"}
        />
        <StatCard
          label="Total Role Gap"
          value={`${totalGap} pts`}
          sub={
            pythonAfter != null
              ? "Python gap shrunk from 41 ➔ 3 pts"
              : biggestName
              ? `Largest: ${biggestName} (${biggestGap?.gap} pts)`
              : "No gaps detected"
          }
          accent={totalGap > 40 ? "text-red-600" : "text-amber-600"}
        />
      </div>

      {/* Primary Callout: Python Identified as the Largest Role-Relevant Gap */}
      {biggestGap && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 via-white to-red-50/40 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700 ring-4 ring-red-50">
                <AlertTriangle className="h-6 w-6" />
              </span>
              <div>
                <span className="rounded-md bg-red-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-red-800">
                  Priority Intervention Required
                </span>
                <h2 className="mt-1 text-xl font-bold text-ink-900">
                  Largest Role-Relevant Gap: {biggestName} — {biggestGap.gap} Points
                </h2>
                <p className="mt-1 text-xs text-ink-600 max-w-2xl leading-relaxed">
                  Current proficiency is <strong className="text-red-700 tabular-nums">{biggestGap.current}%</strong> against the role requirement of <strong className="text-ink-800 tabular-nums">{biggestGap.required}%</strong>. In the competency graph, Python is an unblockable prerequisite for Data Cleaning and Advanced Statistical Analysis.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/graph" className="btn-secondary text-xs">
                <Network className="h-3.5 w-3.5" /> Prerequisite Graph
              </Link>
              <Link href="/learning" className="btn-primary text-xs">
                Start Learning Path <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Left Skill-Gap Cards, Right Visual Analytics */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Left Column: Skill Gap Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-500">
              Role Competency Cards ({scores.length})
            </h2>
            <span className="text-xs text-ink-400 font-medium">
              Sorted by Priority & Gap
            </span>
          </div>

          {scores.map((s) => (
            <CompetencyCard
              key={s.competencyId}
              score={s}
              highlighted={s.competencyId === biggestGap?.competencyId}
            />
          ))}

          {/* Quick Graph Navigation Banner */}
          <div className="card p-5 border-brand-200 bg-brand-50/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-brand-950">
                  Prerequisite Dependency Tree
                </p>
                <p className="text-xs text-brand-700">
                  View how Python gates Data Cleaning and Advanced Statistics
                </p>
              </div>
              <Link href="/graph" className="btn-primary text-xs">
                Inspect Graph <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Charts & Heatmap & Evidence */}
        <div className="space-y-6">
          {/* Dual Bar Comparison: Required vs Current */}
          <div className="card p-6 border-ink-200 bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-ink-900">
                  Required vs Current Competency
                </h3>
                <p className="text-xs text-ink-500">
                  Direct benchmark comparison per competency
                </p>
              </div>
              <span className="text-xs font-semibold text-ink-500">
                Scale: 0–100%
              </span>
            </div>

            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={compareData} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748b" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#64748b" />
                  <Tooltip
                    formatter={(v: number) => [`${v}%`, ""]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                  <Bar dataKey="Required" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Required Threshold" />
                  <Bar
                    dataKey="Current"
                    fill={pythonAfter != null ? "#059669" : "#4f46e5"}
                    radius={[4, 4, 0, 0]}
                    name="Current Competency"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Competency Heatmap */}
          <CompetencyHeatmap scores={scores} />

          {/* Expandable Evidence Inspector */}
          <EvidencePanel after={pythonAfter != null} />
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-ink-400">
        {PROTOTYPE_NOTICE}
      </p>
    </Shell>
  );
}

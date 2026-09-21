"use client";

import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp,
  Award,
  Calendar,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { Shell } from "@/components/Shell";
import { StatCard } from "@/components/ui";
import { BeforeAfterChart, EvidencePanel } from "@/components/CompetencyCard";
import { usePrototype } from "@/context/PrototypeContext";
import { pythonLearningPath } from "@/data/learningPaths";

export default function ProgressPage() {
  const {
    assessmentHistory,
    learningProgress,
    targetedDone,
    diagnosticDone,
    pythonAfter,
  } = usePrototype();

  if (!diagnosticDone) {
    return (
      <Shell title="Progress & Measured Growth" breadcrumb={["Progress"]}>
        <div className="card p-10 text-center border-ink-200 bg-white max-w-lg mx-auto">
          <p className="text-lg font-bold text-ink-900">No Historical Progress Logged</p>
          <p className="mt-1 text-sm text-ink-500">
            Complete the baseline diagnostic assessment to start tracking longitudinal competency growth.
          </p>
          <Link href="/assessment" className="btn-primary mt-5">
            Start Diagnostic Assessment
          </Link>
        </div>
      </Shell>
    );
  }

  const isReassessed = targetedDone || pythonAfter != null;

  const chartData = [
    { point: "Diagnostic Baseline", score: 34, benchmark: 75 },
    ...(isReassessed
      ? [{ point: "Post-Learning Reassessment", score: 72, benchmark: 75 }]
      : []),
  ];

  return (
    <Shell
      title="Longitudinal Competency Growth & Audit"
      breadcrumb={["Progress & Growth"]}
    >
      {/* 4 Executive Growth Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Python Baseline"
          value="34%"
          sub="Diagnostic assessment"
          badge="Day 1"
        />
        <StatCard
          label="Python Post-Intervention"
          value={isReassessed ? "72%" : "34%"}
          sub={isReassessed ? "Targeted reassessment verified" : "Awaiting reassessment"}
          accent={isReassessed ? "text-emerald-700" : "text-ink-400"}
          badge={isReassessed ? "Verified" : "Pending"}
        />
        <StatCard
          label="Measured Skill Gain"
          value={isReassessed ? "+38 pts" : "0 pts"}
          sub={isReassessed ? "Statistically significant jump" : "Take module & reassessment"}
          accent={isReassessed ? "text-emerald-600" : "text-ink-400"}
        />
        <StatCard
          label="Role Gap Reduction"
          value={isReassessed ? "41 ➔ 3" : "41 pts"}
          sub={isReassessed ? "Remaining gap: 3 pts (75% benchmark)" : "Points below required benchmark"}
          accent={isReassessed ? "text-emerald-800" : "text-red-600"}
        />
      </div>

      {/* Main Grid: Left Trend & History, Right Before/After & Learning */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {/* Longitudinal Chart */}
          <div className="card p-6 border-ink-200 bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-ink-900">
                  Python Competency Trajectory
                </h3>
                <p className="text-xs text-ink-500">
                  Pre-intervention vs Post-intervention evaluation points
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                {isReassessed ? "+38 pts improvement" : "Baseline Point"}
              </span>
            </div>

            <div className="mt-4 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="point" tick={{ fontSize: 11 }} stroke="#64748b" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#64748b" />
                  <Tooltip
                    formatter={(v: number) => [`${v}%`, "Competency Score"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                  />
                  <ReferenceLine
                    y={75}
                    stroke="#dc2626"
                    strokeDasharray="4 4"
                    label={{ value: "Required: 75%", fill: "#dc2626", fontSize: 10, position: "top" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#059669"
                    strokeWidth={3}
                    dot={{ r: 6, fill: "#059669", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Assessment Audit History Log */}
          <div className="card p-6 border-ink-200 bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <h3 className="text-sm font-bold text-ink-900">
                Official Assessment History Log
              </h3>
              <span className="text-xs text-ink-400">Audit Provenance</span>
            </div>

            <ul className="mt-3 divide-y divide-ink-100">
              {assessmentHistory.map((h) => (
                <li key={h.id} className="flex items-center justify-between py-3 text-xs">
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 font-bold">
                      <FileCheck className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-bold text-ink-900 text-sm">{h.label}</p>
                      <p className="text-[11px] text-ink-500 font-medium">
                        {h.date} • {h.evidenceCount} Structured Questions Evaluated
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black tabular-nums text-ink-900">
                      Python: {h.pythonScore}%
                    </span>
                    {h.delta && (
                      <p className="text-xs font-bold text-emerald-700">
                        {h.delta}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Before/After Meter & Learning Completion Progress */}
        <div className="space-y-6">
          <BeforeAfterChart />

          {/* Learning Progress Breakdown */}
          <div className="card p-6 border-ink-200 bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <h3 className="text-sm font-bold text-ink-900">
                Curriculum Progression Matrix
              </h3>
              <span className="text-xs font-semibold text-brand-700">
                Python Intervention
              </span>
            </div>

            <ul className="mt-4 space-y-4">
              {pythonLearningPath.modules.map((m, idx) => {
                const pct = learningProgress[m.id] ?? (idx === 0 ? 100 : idx === 1 && isReassessed ? 100 : 25);
                const isComplete = pct >= 100;

                return (
                  <li key={m.id}>
                    <div className="flex justify-between text-xs font-semibold text-ink-700">
                      <span className="flex items-center gap-1.5">
                        {isComplete ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                        )}
                        {m.title}
                      </span>
                      <span className="tabular-nums">{pct}%</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full rounded-full bg-ink-100 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-700 ${
                          isComplete ? "bg-emerald-500" : "bg-brand-600"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <EvidencePanel after={isReassessed} />
        </div>
      </div>
    </Shell>
  );
}

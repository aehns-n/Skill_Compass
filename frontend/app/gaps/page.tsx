"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Route,
  CheckCircle2,
  Lock,
  Zap,
  Layers,
  RefreshCw,
  BookOpen,
  Target,
  Cpu,
  ChevronRight,
} from "lucide-react";
import { Shell } from "@/components/Shell";
import { StatCard, PriorityBadge, ProgressBar } from "@/components/ui";
import { usePrototype } from "@/context/PrototypeContext";
import { competencyById } from "@/data/roles";
import { api, type GapAnalysisResponse, type GapCompetencyItem } from "@/lib/api";

const tierBadges: Record<string, { label: string; cls: string }> = {
  NOVICE: { label: "Novice (<40%)", cls: "bg-red-50 text-red-700 border-red-200" },
  DEVELOPING: { label: "Developing (40-69%)", cls: "bg-amber-50 text-amber-800 border-amber-200" },
  PROFICIENT: { label: "Proficient (70-89%)", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  MASTER: { label: "Master (≥90%)", cls: "bg-emerald-50 text-emerald-800 border-emerald-200" },
};

export default function GapsPage() {
  const { biggestGap, diagnosticDone, pythonAfter, role } = usePrototype();
  const [gapData, setGapData] = useState<GapAnalysisResponse | null>(null);
  const [learningPaths, setLearningPaths] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedComp, setSelectedComp] = useState<string | null>(null);

  const fetchGaps = async () => {
    setLoading(true);
    try {
      const [gRes, pRes] = await Promise.allSettled([
        api.getGapAnalysis("demo-user-001"),
        api.getLearningPath("demo-user-001"),
      ]);

      if (gRes.status === "fulfilled" && gRes.value) {
        setGapData(gRes.value);
        if (gRes.value.biggest_gap) {
          setSelectedComp(gRes.value.biggest_gap.competency_id);
        }
      }

      if (pRes.status === "fulfilled" && pRes.value) {
        const paths = pRes.value.paths ?? pRes.value.modules ?? [];
        setLearningPaths(paths);
      }
    } catch (err) {
      console.warn("Could not fetch live gap analysis, falling back to local context:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGaps();
  }, [role?.id]);

  if (!diagnosticDone && !gapData) {
    return (
      <Shell title="Skill Gap Analysis" breadcrumb={["Skill Gaps"]}>
        <div className="card p-10 text-center border-ink-200 bg-white max-w-lg mx-auto shadow-card">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700 mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <p className="text-lg font-bold text-ink-900">No Assessment Baseline Logged</p>
          <p className="mt-1 text-sm text-ink-500">
            Complete your role baseline diagnostic to trigger the gap analysis engine and compute capability tiers for {role?.title ?? "your role"}.
          </p>
          <Link href="/assessment" className="btn-primary mt-5 inline-flex items-center gap-2">
            Start Diagnostic Assessment <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Shell>
    );
  }

  // Determine active primary gap
  const livePrimary = gapData?.biggest_gap;
  const compName = livePrimary?.competency_name ?? biggestGap?.name ?? "Primary Competency";
  const compGap = livePrimary?.gap ?? biggestGap?.gap ?? 41;
  const compCurrent = livePrimary?.score ?? biggestGap?.current ?? 34;
  const compTarget = livePrimary?.target ?? biggestGap?.required ?? 75;
  const compTier = livePrimary?.tier ?? "NOVICE";
  const weakTopics = livePrimary?.weak_topics ?? ["Core Protocol Fundamentals", "Optimization Techniques"];
  const isPythonReassessed = pythonAfter != null;

  return (
    <Shell title="DIAGNOSE: Gap Analysis & Remediation Engine" breadcrumb={["Skill Gaps"]}>
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200">
            Diagnose Engine
          </span>
          <span className="text-xs text-ink-500 font-medium">
            Role: <strong className="text-ink-900">{gapData?.role_name ?? role?.title ?? "Selected Role"}</strong>
          </span>
        </div>
        <button
          onClick={fetchGaps}
          disabled={loading}
          className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Gap Analysis
        </button>
      </div>

      {/* Primary Role Gap Alert Hero */}
      <div className="card border-red-200 bg-gradient-to-br from-red-50/90 via-white to-red-50/40 p-6 sm:p-8 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700 ring-4 ring-red-50">
              <AlertTriangle className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-red-700">
                  Primary Skill Bottleneck Detected
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${
                    tierBadges[compTier]?.cls ?? "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {tierBadges[compTier]?.label ?? compTier}
                </span>
                <span className="rounded bg-white px-2 py-0.5 text-[11px] font-bold text-ink-700 border border-ink-200">
                  {role?.title ?? "Role Benchmark"}
                </span>
              </div>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-ink-900">
                {compName} —{" "}
                <span className="text-red-600 tabular-nums">
                  {isPythonReassessed ? "Target Met (+38 pts gain)" : `${compGap} points gap`}
                </span>
              </h2>
              <p className="mt-2 text-sm text-ink-700 max-w-2xl leading-relaxed">
                SkillCompass evaluated your performance across required benchmarks for <strong>{role?.title ?? "your role"}</strong>.{" "}
                <strong className="text-red-700 font-bold">{compName}</strong> was pinpointed as the primary competency bottleneck requiring structured remediation before downstream competencies can unlock.
              </p>

              {/* Weak Topics Chips */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-ink-700">Weak Topics Detected:</span>
                {weakTopics.map((topic, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-md bg-red-100/80 px-2.5 py-1 text-xs font-semibold text-red-900 border border-red-200"
                  >
                    <Target className="h-3 w-3 text-red-600" />
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <PriorityBadge priority="HIGH" />
        </div>

        {/* 3 Metrics Row */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Current Baseline"
            value={`${compCurrent}%`}
            sub={`Tier: ${compTier}`}
          />
          <StatCard
            label="Role Target Benchmark"
            value={`${compTarget}%`}
            sub="Official Passing Score"
          />
          <StatCard
            label="Competency Gap"
            value={isPythonReassessed ? "3 pts" : `${compGap} pts`}
            sub={isPythonReassessed ? "Gap closed by +38 pts!" : "Required to unblock downstream nodes"}
            accent="text-red-600"
          />
        </div>
      </div>

      {/* Full Competency Gaps Matrix */}
      {gapData && gapData.competencies && gapData.competencies.length > 0 && (
        <div className="mt-8 card p-6 border-ink-200 bg-white shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-100 pb-4">
            <div>
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
                <Layers className="h-4 w-4" /> Role Competency Matrix
              </span>
              <h3 className="mt-1 text-lg font-bold text-ink-900">
                {role?.title ?? "Role"} Competency Gaps & Gating Status
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-500 font-medium">
                Total Role Gap: <strong className="text-red-600 font-bold">{gapData.total_gap} pts</strong>
              </span>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs text-ink-700">
              <thead className="bg-ink-50 text-[11px] font-bold uppercase text-ink-600 tracking-wider border-b border-ink-200">
                <tr>
                  <th className="px-4 py-3">Competency</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Current / Target</th>
                  <th className="px-4 py-3">Gap</th>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Gating & Weak Topics</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {gapData.competencies.map((comp) => {
                  const isPrimary = comp.competency_id === livePrimary?.competency_id;
                  const isBlocked = comp.status === "blocked" || comp.is_gated;
                  return (
                    <tr
                      key={comp.competency_id}
                      className={`transition hover:bg-ink-50/60 ${
                        isPrimary ? "bg-red-50/30" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-bold text-ink-900">
                        <div className="flex items-center gap-2">
                          {isPrimary && (
                            <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                          )}
                          <span>{comp.competency_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-500">{comp.category}</td>
                      <td className="px-4 py-3 tabular-nums">
                        <span className="font-bold text-ink-900">{comp.score}%</span> / {comp.target}%
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-black tabular-nums ${
                            comp.gap > 20
                              ? "text-red-600"
                              : comp.gap > 0
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {comp.gap > 0 ? `-${comp.gap} pts` : "Met (0)"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                            tierBadges[comp.tier]?.cls ?? "bg-ink-100 text-ink-700 border-ink-200"
                          }`}
                        >
                          {comp.tier}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        {isBlocked ? (
                          <div className="flex items-center gap-1.5 text-amber-700 font-semibold">
                            <Lock className="h-3.5 w-3.5 shrink-0" />
                            <span>Gated (needs {(comp.blocked_by || []).join(", ") || "prerequisite"})</span>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {comp.weak_topics.slice(0, 2).map((w, idx) => (
                              <span
                                key={idx}
                                className="rounded bg-ink-100 px-1.5 py-0.5 text-[10px] text-ink-700 font-medium"
                              >
                                {w}
                              </span>
                            ))}
                            {comp.weak_topics.length === 0 && (
                              <span className="text-[11px] text-emerald-600 font-medium">Ready</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={isBlocked ? "/graph" : `/learning`}
                          className={`btn-xs ${
                            isPrimary ? "btn-primary" : "btn-secondary"
                          } text-[11px] inline-flex items-center gap-1`}
                        >
                          {isBlocked ? "View Prereqs" : "Remediate"}
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recommended Sequential Intervention for Chosen Role */}
      <div className="mt-8 card p-6 sm:p-8 border-ink-200 bg-white shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-100 pb-4">
          <div>
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-700">
              <Route className="h-4 w-4" /> Ordered DAG Intervention Protocol
            </span>
            <h3 className="mt-1 text-lg font-bold text-ink-900">
              Prerequisite-Gated Learning Path for {role?.title ?? "Chosen Role"}
            </h3>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            Prerequisite Sequenced
          </span>
        </div>

        <p className="mt-4 text-xs text-ink-600 max-w-3xl leading-relaxed">
          Unlike catalog search engines that recommend random generic courses, SkillCompass constructs an exact sequence grounded in the role dependency DAG for <strong>{role?.title ?? "your chosen role"}</strong>:
        </p>

        {/* Sequential Step Cards for Selected Role */}
        <div className="mt-6 space-y-4">
          {learningPaths.length > 0 ? (
            learningPaths.map((lp, idx) => {
              const topRes = lp.resources?.[0];
              const isGated = lp.is_gated;

              return (
                <div
                  key={lp.competency_id}
                  className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-ink-200 bg-ink-50/50 p-5 transition hover:border-brand-300 hover:bg-white hover:shadow-xs"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-sm font-black text-brand-800 ring-2 ring-white">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-ink-900">{lp.competency_name}</h4>
                        {lp.gap > 0 && (
                          <span className="rounded bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 border border-red-200">
                            Gap: {lp.gap} pts
                          </span>
                        )}
                        {isGated ? (
                          <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200 flex items-center gap-1">
                            <Lock className="h-3 w-3" /> Gated by {(lp.blocked_by || []).join(", ")}
                          </span>
                        ) : (
                          <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                            Prerequisites Satisfied
                          </span>
                        )}
                      </div>
                      {topRes && (
                        <p className="mt-1 text-xs font-semibold text-brand-900">
                          Primary Learning Unit: <span className="font-normal text-ink-700">{topRes.title}</span>
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-ink-600 max-w-2xl leading-relaxed">
                        {topRes?.description ?? `Targeted intervention to reach ${lp.target ?? 75}% benchmark.`}
                      </p>
                    </div>
                  </div>

                  <div className="self-end sm:self-center shrink-0">
                    <Link
                      href="/learning"
                      className="btn-secondary text-xs font-bold py-1.5 px-3"
                    >
                      View Modules
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            (role?.requirements ?? []).map((req, idx) => {
              const comp = competencyById(req.competencyId);
              return (
                <div
                  key={req.competencyId}
                  className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-ink-200 bg-ink-50/50 p-5"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-sm font-black text-brand-800 ring-2 ring-white">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-ink-900">{comp?.name ?? req.competencyId}</h4>
                        <span className="rounded bg-white px-2 py-0.5 text-[10px] font-bold text-brand-700 border border-brand-200">
                          Target: ≥ {req.required}%
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-ink-600 max-w-2xl leading-relaxed">
                        {comp?.description ?? req.benchmarkRationale}
                      </p>
                    </div>
                  </div>
                  <div className="self-end sm:self-center">
                    <PriorityBadge priority={req.priority} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Primary CTA */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-ink-100 pt-6">
          <Link href="/graph" className="btn-secondary">
            Inspect Prerequisite Graph
          </Link>
          <Link
            href="/learning"
            className="btn-primary px-6 py-3 text-sm font-bold shadow-md shadow-brand-600/20"
          >
            Start Personalized Learning Path <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </Shell>
  );
}

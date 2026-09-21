"use client";

import { useEffect, useState } from "react";
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
  RefreshCw,
  Calculator,
  AlertTriangle,
  Flame,
  Activity,
  UserCheck,
  Check,
  X,
} from "lucide-react";
import { Shell } from "@/components/Shell";
import { StatCard, ProgressBar } from "@/components/ui";
import { BeforeAfterChart, EvidencePanel } from "@/components/CompetencyCard";
import { usePrototype } from "@/context/PrototypeContext";
import {
  api,
  type ScoreTimeSeriesPoint,
  type EffectivenessMetric,
  type SelfVsMeasuredItem,
  type AuditRecomputeResponse,
} from "@/lib/api";

export default function ProgressPage() {
  const {
    assessmentHistory,
    targetedDone,
    diagnosticDone,
    pythonAfter,
    pythonBefore,
    biggestGap,
    role,
    reassessedCompetencyId,
    reassessedCompetencyName,
    reassessedBeforeScore,
    reassessedAfterScore,
  } = usePrototype();

  const [timeSeries, setTimeSeries] = useState<ScoreTimeSeriesPoint[]>([]);
  const [effectiveness, setEffectiveness] = useState<EffectivenessMetric[]>([]);
  const [selfVsMeasured, setSelfVsMeasured] = useState<SelfVsMeasuredItem[]>([]);
  const [auditData, setAuditData] = useState<AuditRecomputeResponse | null>(null);
  const [auditLoading, setAuditLoading] = useState<boolean>(false);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const primaryCompId =
    reassessedCompetencyId ||
    biggestGap?.competencyId ||
    role?.requirements[0]?.competencyId ||
    "22222222-2222-2222-2222-222222222201";

  const loadMeasureData = async () => {
    setLoading(true);
    try {
      const [tsRes, effRes, svmRes] = await Promise.allSettled([
        api.getScoreTimeSeries("demo-user-001"),
        api.getLearningEffectiveness("demo-user-001"),
        api.getSelfVsMeasured("demo-user-001"),
      ]);

      if (tsRes.status === "fulfilled" && tsRes.value) {
        setTimeSeries(tsRes.value);
      }
      if (effRes.status === "fulfilled" && effRes.value) {
        setEffectiveness(effRes.value);
      }
      if (svmRes.status === "fulfilled" && svmRes.value) {
        setSelfVsMeasured(svmRes.value);
      }
    } catch (err) {
      console.warn("Failed to load measure data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeasureData();
  }, []);

  const handleRunAudit = async (compId: string = primaryCompId) => {
    setAuditLoading(true);
    setShowAuditModal(true);
    try {
      const res = await api.auditCompetencyScore(compId, "demo-user-001");
      setAuditData(res);
    } catch (err) {
      console.error("Audit recomputation failed:", err);
    } finally {
      setAuditLoading(false);
    }
  };

  if (!diagnosticDone && timeSeries.length === 0 && effectiveness.length === 0) {
    return (
      <Shell title="Progress & Measured Growth" breadcrumb={["Progress"]}>
        <div className="card p-10 text-center border-ink-200 bg-white max-w-lg mx-auto shadow-card">
          <p className="text-lg font-bold text-ink-900">No Historical Progress Logged</p>
          <p className="mt-1 text-sm text-ink-500">
            Complete the baseline diagnostic assessment to start tracking longitudinal competency growth and audit proofs.
          </p>
          <Link href="/assessment" className="btn-primary mt-5 inline-flex items-center gap-2">
            Start Diagnostic Assessment <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Shell>
    );
  }

  const isReassessed =
    targetedDone ||
    reassessedAfterScore != null ||
    pythonAfter != null ||
    timeSeries.some(
      (t) =>
        (t.evidence_type || t.source || "").toLowerCase().includes("reassess") ||
        (t.evidence_type || t.source || "").toLowerCase().includes("target")
    );

  const compLabel =
    reassessedCompetencyName ||
    biggestGap?.name ||
    role?.requirements[0]?.benchmarkRationale ||
    role?.title ||
    "Primary Competency";

  const beforeScore =
    reassessedBeforeScore ??
    pythonBefore ??
    (biggestGap ? biggestGap.current : 30);

  const afterScore =
    reassessedAfterScore ??
    pythonAfter ??
    (isReassessed ? Math.min(100, beforeScore + 38) : beforeScore);

  const gain = Math.max(0, afterScore - beforeScore);

  // Compute live effectiveness highlights
  const primaryEff =
    effectiveness.find((e) => e.competency_id === primaryCompId) ??
    effectiveness[0];

  const gapClosedPct =
    primaryEff?.gap_closed_pct ??
    primaryEff?.pct_gap_closed ??
    (isReassessed ? 92 : 0);

  const gainPerMat =
    primaryEff?.points_gained_per_material ??
    primaryEff?.gain_per_resource ??
    (isReassessed ? 12.6 : 0);

  const isPlateau =
    primaryEff?.is_plateaued ??
    primaryEff?.plateau_flag ??
    false;

  // Chart data: map from backend timeSeries or fall back to 2 points
  const chartData =
    timeSeries.length > 0
      ? timeSeries.map((t) => {
          const isBase =
            (t.evidence_type || t.source || "").toLowerCase().includes("diag") ||
            (t.evidence_type || t.source || "").toLowerCase().includes("base");
          const dateStr = t.timestamp ? t.timestamp.slice(0, 10) : t.date ? t.date.slice(0, 10) : "";
          return {
            point: isBase ? "Diagnostic Baseline" : `${t.competency_name || "Targeted"} Reassessment`,
            score: Math.round(t.score),
            benchmark: 75,
            date: dateStr,
          };
        })
      : [
          { point: "Diagnostic Baseline", score: beforeScore, benchmark: 75, date: "Day 1" },
          ...(isReassessed
            ? [{ point: "Post-Learning Reassessment", score: afterScore, benchmark: 75, date: "Day 3" }]
            : []),
        ];

  return (
    <Shell
      title="MEASURE: Longitudinal Progress, Effectiveness & Audit"
      breadcrumb={["Progress & Growth"]}
    >
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            Measure Engine
          </span>
          <span className="text-xs text-ink-500 font-medium">
            Role: <strong className="text-ink-900">{role?.title ?? "Data Engineer"}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRunAudit(primaryCompId)}
            className="btn-primary text-xs flex items-center gap-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 border-emerald-700 shadow-sm"
          >
            <Calculator className="h-3.5 w-3.5" />
            Audit Mathematical Score
          </button>
          <button
            onClick={loadMeasureData}
            disabled={loading}
            className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* 4 Executive Growth Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={`${compLabel} Baseline`}
          value={`${beforeScore}%`}
          sub="Diagnostic assessment"
          badge="Initial"
        />
        <StatCard
          label="Measured Current Score"
          value={isReassessed ? `${afterScore}%` : `${beforeScore}%`}
          sub={isReassessed ? "Verified in evidence ledger" : "Awaiting reassessment"}
          accent={isReassessed ? "text-emerald-700" : "text-ink-400"}
          badge={isReassessed ? "Verified" : "Pending"}
        />
        <StatCard
          label="Intervention Gap Closed"
          value={`${gapClosedPct}%`}
          sub={isReassessed ? "Substantial progress toward 75%" : "Intervention in progress"}
          accent={gapClosedPct > 50 ? "text-emerald-600" : "text-amber-600"}
        />
        <StatCard
          label="Gain / Material Studied"
          value={gainPerMat > 0 ? `+${gainPerMat.toFixed(1)} pts` : "0 pts"}
          sub={isPlateau ? "⚠️ Plateau detected (<3 pts)" : "High intervention yield"}
          accent={isPlateau ? "text-amber-600" : "text-brand-700"}
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
                  {compLabel} Longitudinal Trajectory
                </h3>
                <p className="text-xs text-ink-500">
                  Evidence-backed score evolution over assessment cycles
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                {isReassessed ? `+${gain} pts improvement` : "Baseline Active"}
              </span>
            </div>

            <div className="mt-4 h-64">
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
                    label={{ value: "Target Benchmark: 75%", fill: "#dc2626", fontSize: 10, position: "top" }}
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
              <span className="text-xs text-ink-400">Ledger Provenance</span>
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
                      Score: {h.pythonScore}%
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

        {/* Right Column: Self-vs-Measured & Effectiveness Matrix */}
        <div className="space-y-6">
          {/* Self-Rating vs Empirical Score Radar / Comparison */}
          <div className="card p-6 border-ink-200 bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-brand-600" />
                <h3 className="text-sm font-bold text-ink-900">
                  Self-Rating vs Measured Reality
                </h3>
              </div>
              <span className="text-xs text-ink-400">Calibration</span>
            </div>

            <p className="mt-3 text-xs text-ink-600">
              Comparing your initial onboarding self-assessment against empirical questions answered in the baseline diagnostic:
            </p>

            <div className="mt-4 space-y-4">
              {selfVsMeasured && selfVsMeasured.length > 0 ? (
                selfVsMeasured.map((item) => {
                  const selfVal = item.self_rating ?? 50;
                  const measVal = item.measured_score;
                  const delta = item.delta ?? measVal - selfVal;
                  const isOverconfident = delta < -10;
                  const isUnderconfident = delta > 10;

                  return (
                    <div
                      key={item.competency_id}
                      className="rounded-lg border border-ink-100 bg-ink-50/50 p-3.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-ink-900">
                          {item.competency_name}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            isOverconfident
                              ? "bg-amber-100 text-amber-900"
                              : isUnderconfident
                              ? "bg-blue-100 text-blue-900"
                              : "bg-emerald-100 text-emerald-900"
                          }`}
                        >
                          {isOverconfident
                            ? `Overconfident (${delta} pts)`
                            : isUnderconfident
                            ? `Underestimated (+${delta} pts)`
                            : "Well Calibrated"}
                        </span>
                      </div>

                      <div className="mt-2.5 grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="flex justify-between text-[11px] text-ink-500 mb-1">
                            <span>Perceived:</span>
                            <span className="font-bold text-ink-800">{selfVal}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-ink-200">
                            <div
                              className="h-1.5 rounded-full bg-ink-500"
                              style={{ width: `${selfVal}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] text-ink-500 mb-1">
                            <span>Measured:</span>
                            <span className="font-bold text-brand-700">{measVal}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-ink-200">
                            <div
                              className="h-1.5 rounded-full bg-brand-600"
                              style={{ width: `${measVal}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <p className="mt-2 text-[11px] text-ink-600 leading-snug">
                        {item.insight}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-ink-500 text-center py-4">
                  Self-assessment comparisons will calculate automatically once baseline scores are stored.
                </div>
              )}
            </div>
          </div>

          {/* Intervention Effectiveness Breakdown */}
          {effectiveness && effectiveness.length > 0 && (
            <div className="card p-6 border-ink-200 bg-white shadow-card">
              <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-ink-900">
                    Intervention Effectiveness Metrics
                  </h3>
                </div>
                <span className="text-xs font-semibold text-emerald-700">Live Engine</span>
              </div>

              <div className="mt-4 space-y-3">
                {effectiveness.map((eff) => (
                  <div
                    key={eff.competency_id}
                    className="flex items-center justify-between rounded-lg border border-ink-100 bg-white p-3 text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-ink-900">{eff.competency_name}</h4>
                      <p className="text-[11px] text-ink-500 mt-0.5">
                        Baseline: {eff.baseline_score}% ➔ Current: {eff.current_score}% ({(eff.delta_score ?? eff.absolute_gain ?? (eff.current_score - eff.baseline_score)) >= 0 ? `+${eff.delta_score ?? eff.absolute_gain ?? (eff.current_score - eff.baseline_score)}` : (eff.delta_score ?? eff.absolute_gain ?? (eff.current_score - eff.baseline_score))} pts)
                      </p>
                      <p className="text-[10px] text-ink-400">
                        {eff.materials_completed} materials studied • Yield: +{eff.points_gained_per_material ?? eff.gain_per_resource ?? 0} pts/res
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-sm text-emerald-700">
                        {eff.gap_closed_pct ?? eff.pct_gap_closed ?? 0}%
                      </span>
                      <p className="text-[10px] font-bold text-ink-500">Gap Closed</p>
                      {eff.plateau_flag && (
                        <span className="inline-block mt-1 rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800">
                          Plateau Alert
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <EvidencePanel
            after={isReassessed}
            competencyId={primaryCompId}
            competencyName={compLabel}
            roleId={role?.id}
            currentScore={isReassessed ? afterScore : beforeScore}
            targetScore={75}
          />
        </div>
      </div>

      {/* Mathematical Score Audit Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="card max-w-2xl w-full p-6 border-ink-200 bg-white shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-ink-900">
                  Evidence Ledger Mathematical Audit Proof
                </h3>
              </div>
              <button
                onClick={() => setShowAuditModal(false)}
                className="text-ink-400 hover:text-ink-700 font-bold"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {auditLoading ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-emerald-600" />
                <p className="text-sm font-semibold text-ink-700">
                  Recomputing score directly from raw evidence logs…
                </p>
              </div>
            ) : auditData ? (
              <div className="space-y-4">
                {/* Result Proof Banner */}
                <div
                  className={`rounded-xl border p-4 ${
                    auditData.is_identical
                      ? "border-emerald-300 bg-emerald-50/80 text-emerald-900"
                      : "border-red-300 bg-red-50 text-red-900"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {auditData.is_identical ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="font-bold text-sm">
                        {auditData.is_identical
                          ? "Audit Verification Passed: Exact Mathematical Identity"
                          : "Audit Discrepancy Detected"}
                      </h4>
                      <p className="text-xs mt-1 leading-relaxed">
                        Stored Score: <strong>{auditData.stored_score}%</strong> | Recomputed from Raw Ledger:{" "}
                        <strong>{auditData.recomputed_score}%</strong>. Recomputed across {auditData.evidence_count} immutable evidence entries.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Formula */}
                <div className="rounded-lg bg-ink-50 p-3 text-xs text-ink-700 font-mono">
                  <span className="font-bold text-ink-500 font-sans block mb-1">
                    Mathematical Audit Formula:
                  </span>
                  {auditData.formula_used}
                </div>

                {/* Evidence Item Breakdown */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-2">
                    Evidence Ledger Breakdown ({auditData.evidence_breakdown.length} items)
                  </h4>
                  <div className="overflow-x-auto border border-ink-200 rounded-lg">
                    <table className="w-full text-left text-xs text-ink-700">
                      <thead className="bg-ink-50 text-[10px] uppercase font-bold text-ink-500">
                        <tr>
                          <th className="p-2">Type</th>
                          <th className="p-2">Score</th>
                          <th className="p-2">Weight</th>
                          <th className="p-2">Weighted Value</th>
                          <th className="p-2">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-100 text-[11px]">
                        {auditData.evidence_breakdown.map((ev) => (
                          <tr key={ev.id}>
                            <td className="p-2 font-semibold text-ink-900">{ev.evidence_type}</td>
                            <td className="p-2">{ev.score}%</td>
                            <td className="p-2">{ev.weight}</td>
                            <td className="p-2 font-bold text-emerald-700">{ev.weighted_value.toFixed(1)}</td>
                            <td className="p-2 text-ink-400">{ev.created_at ? ev.created_at.slice(0, 16) : "Recent"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    onClick={() => setShowAuditModal(false)}
                    className="btn-primary text-xs px-4 py-2"
                  >
                    Close Audit Proof
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </Shell>
  );
}

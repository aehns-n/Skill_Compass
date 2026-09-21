"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  BookOpen,
  Route,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  Target,
  ShieldCheck,
  RefreshCw,
  Repeat,
  Flame,
  Layers,
} from "lucide-react";
import { Shell } from "@/components/Shell";
import { ProgressBar } from "@/components/ui";
import { usePrototype } from "@/context/PrototypeContext";
import { competencyById } from "@/data/roles";
import {
  api,
  type LearningPathResponse,
  type LearningModuleGroup,
  type LearningResourceItem,
  type LoopStateResponse,
} from "@/lib/api";

const difficultyColor: Record<string, string> = {
  beginner: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Beginner: "bg-emerald-50 text-emerald-800 border-emerald-200",
  intermediate: "bg-amber-50 text-amber-800 border-amber-200",
  Intermediate: "bg-amber-50 text-amber-800 border-amber-200",
  advanced: "bg-purple-50 text-purple-800 border-purple-200",
  Advanced: "bg-purple-50 text-purple-800 border-purple-200",
};

export default function LearningPage() {
  const { learningProgress, biggestGap, diagnosticDone, pythonAfter, setLearningProgress, role } = usePrototype();
  const [learningPathData, setLearningPathData] = useState<LearningPathResponse | null>(null);
  const [loopState, setLoopState] = useState<LoopStateResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pathRes, loopRes] = await Promise.allSettled([
        api.getLearningPath("demo-user-001"),
        api.getLoopState("demo-user-001"),
      ]);

      if (pathRes.status === "fulfilled" && pathRes.value) {
        setLearningPathData(pathRes.value);
        const map: Record<string, boolean> = {};
        const groups = pathRes.value.paths ?? pathRes.value.modules ?? [];
        groups.forEach((mod) => {
          (mod.resources || []).forEach((r) => {
            const rid = r.id || r.resource_id;
            if (rid && (r.status === "COMPLETED" || r.is_completed)) {
              map[rid] = true;
            }
          });
        });
        setCompletedItems(map);
      }

      if (loopRes.status === "fulfilled" && loopRes.value) {
        setLoopState(loopRes.value);
      }
    } catch (err) {
      console.warn("Could not load live learning path:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [role?.id]);

  const handleToggleComplete = async (resourceId: string, moduleIdFallback?: string) => {
    setActionInProgress(resourceId);
    try {
      const newStatus = completedItems[resourceId] ? "IN_PROGRESS" : "COMPLETED";
      await api.updateLearningProgress("demo-user-001", resourceId, newStatus);
      setCompletedItems((prev) => ({
        ...prev,
        [resourceId]: newStatus === "COMPLETED",
      }));
      if (moduleIdFallback && newStatus === "COMPLETED") {
        setLearningProgress(moduleIdFallback, 100);
      }
      // Refresh loop state to update threshold counter
      const updatedLoop = await api.getLoopState("demo-user-001");
      setLoopState(updatedLoop);
    } catch (err) {
      console.warn("Error updating resource progress:", err);
      // Fallback locally
      setCompletedItems((prev) => ({
        ...prev,
        [resourceId]: !prev[resourceId],
      }));
      if (moduleIdFallback) setLearningProgress(moduleIdFallback, 100);
    } finally {
      setActionInProgress(null);
    }
  };

  const activeModules: LearningModuleGroup[] = learningPathData?.paths ?? learningPathData?.modules ?? [];

  if (!diagnosticDone && activeModules.length === 0 && !loading) {
    return (
      <Shell title="Personalized Learning Roadmap" breadcrumb={["Roadmap"]}>
        <div className="card p-10 text-center border-ink-200 bg-white max-w-lg mx-auto shadow-card">
          <p className="text-lg font-bold text-ink-900">No Assessment Baseline Found</p>
          <p className="mt-1 text-sm text-ink-500">
            Complete the diagnostic assessment first so SkillCompass can generate a personalized intervention roadmap for {role?.title ?? "your role"}.
          </p>
          <Link href="/assessment" className="btn-primary mt-5 inline-flex items-center gap-2">
            Start Diagnostic Assessment <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Shell>
    );
  }

  // Calculate studied count for primary competency
  const primaryCompId = activeModules[0]?.competency_id || biggestGap?.competencyId || "22222222-2222-2222-2222-222222222101";
  const compLoop = loopState?.states.find((s) => s.competency_id === primaryCompId);
  const studiedCount = compLoop?.materials_completed_since_assessment ?? Object.values(completedItems).filter(Boolean).length;
  const targetThreshold = 3;
  const isThresholdMet = studiedCount >= targetThreshold || compLoop?.ready_for_reassessment;
  const cycleCount = compLoop?.cycle_count ?? 1;
  const primaryTitle = activeModules[0]?.competency_name ?? biggestGap?.name ?? (role?.title ? `${role.title}: Remediation Path` : "Targeted Remediation Path");

  return (
    <Shell
      title={`Personalized Competency Roadmap — ${role?.title ?? "Role Pathways"}`}
      breadcrumb={["Roadmap", role?.title ?? "Adaptive Learning Pathway"]}
    >
      {/* Loop Cycle & Reassessment Threshold Banner */}
      <div className="card border-brand-200 bg-gradient-to-r from-brand-50/90 via-white to-brand-50/40 p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
              <Route className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-800">
                  Targeted Learning Sequence
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-900">
                  <Repeat className="h-3 w-3" />
                  Cycle #{cycleCount}
                </span>
                <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-bold text-ink-700 border border-ink-200">
                  Role: {role?.title ?? "Target Role"}
                </span>
              </div>
              <h2 className="text-lg font-bold text-ink-900 mt-0.5">
                {primaryTitle}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-ink-600 max-w-3xl">
                Curriculum items are dynamically tailored to the competencies and weak topics of <strong>{role?.title ?? "your chosen role"}</strong>. Study and complete at least 3 materials to trigger targeted reassessment and update your evidence ledger.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh Roadmap
            </button>
          </div>
        </div>

        {/* 3-Materials Reassessment Unlock Progress */}
        <div className="mt-5 rounded-xl border border-brand-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-ink-900 flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-amber-500" />
              Reassessment Unlock Meter:{" "}
              <span className="text-brand-700 font-extrabold tabular-nums">
                {studiedCount} of {targetThreshold} Materials Completed
              </span>
            </span>
            {isThresholdMet ? (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Target Reassessment Unlocked!
              </span>
            ) : (
              <span className="text-xs text-ink-500 font-medium">
                Complete {Math.max(0, targetThreshold - studiedCount)} more resource(s) to unlock reassessment
              </span>
            )}
          </div>
          <div className="mt-2.5">
            <ProgressBar
              value={Math.min(100, Math.round((studiedCount / targetThreshold) * 100))}
              color={isThresholdMet ? "bg-emerald-500" : "bg-brand-600"}
              height="h-2.5"
            />
          </div>

          {isThresholdMet && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-brand-100 pt-3">
              <p className="text-xs text-emerald-900 font-medium">
                You have fulfilled the prerequisite study threshold for {primaryTitle}. Take the targeted reassessment to record empirical evidence and close your role gap.
              </p>
              <Link
                href={`/reassess?competency_id=${encodeURIComponent(primaryCompId)}`}
                className="btn-primary text-xs font-bold px-4 py-2 bg-emerald-600 hover:bg-emerald-700 border-emerald-700 inline-flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Take Targeted Reassessment Now
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Role-Specific Learning Modules */}
      <div className="mt-6 space-y-6">
        {loading && activeModules.length === 0 ? (
          <div className="card p-12 text-center text-sm text-ink-500 space-y-2">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-brand-600" />
            <p className="font-semibold text-ink-800">Generating role-specific learning paths…</p>
            <p className="text-xs text-ink-400">Selecting authoritative materials for {role?.title ?? "your role"}.</p>
          </div>
        ) : activeModules.length > 0 ? (
          activeModules.map((group, gIdx) => {
            const isGated = group.is_gated;
            const compGap = group.gap ?? 0;
            return (
              <div
                key={group.competency_id}
                className={`card p-6 border transition-all shadow-card ${
                  isGated ? "border-amber-200 bg-amber-50/20 opacity-90" : "border-ink-200 bg-white"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                        isGated ? "bg-amber-100 text-amber-900" : "bg-brand-100 text-brand-800"
                      }`}
                    >
                      {gIdx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-ink-900">{group.competency_name}</h3>
                        {compGap > 0 && (
                          <span className="rounded bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 border border-red-200">
                            Gap: {compGap} pts
                          </span>
                        )}
                      </div>
                      {isGated ? (
                        <span className="flex items-center gap-1 text-xs text-amber-700 font-semibold mt-0.5">
                          <Lock className="h-3.5 w-3.5" />
                          Prerequisite Gated: Requires {(group.blocked_by || []).join(", ")}
                        </span>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
                          ✓ Ready for remediation
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {group.priority && (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                          group.priority === "HIGH"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {group.priority} Priority
                      </span>
                    )}
                  </div>
                </div>

                {/* Resources List */}
                <div className="mt-4 space-y-3">
                  {group.resources && group.resources.length > 0 ? (
                    group.resources.map((res) => {
                      const resId = res.id || res.resource_id || "";
                      const isDone = completedItems[resId] || res.is_completed || res.status === "COMPLETED";
                      const isPending = actionInProgress === resId;

                      return (
                        <div
                          key={resId}
                          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border p-4 transition ${
                            isDone
                              ? "border-emerald-200 bg-emerald-50/30"
                              : "border-ink-200 bg-ink-50/40 hover:bg-white"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => handleToggleComplete(resId)}
                              disabled={isPending}
                              title={isDone ? "Mark as Incomplete" : "Mark as Completed"}
                              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition ${
                                isDone
                                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                  : "border border-ink-300 bg-white text-transparent hover:border-brand-500 hover:text-brand-300"
                              }`}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xs font-bold text-ink-900">{res.title}</h4>
                                <span
                                  className={`rounded border px-1.5 py-0.2 text-[10px] font-bold ${
                                    difficultyColor[res.difficulty] ?? "bg-ink-100 text-ink-700 border-ink-200"
                                  }`}
                                >
                                  {res.difficulty}
                                </span>
                                <span className="text-[11px] text-ink-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {res.estimated_minutes} min
                                </span>
                              </div>
                              {res.description && (
                                <p className="text-[11px] text-ink-600 mt-1 line-clamp-2 max-w-2xl leading-relaxed">
                                  {res.description}
                                </p>
                              )}
                              {res.relevance_reason && (
                                <p className="mt-1 text-[10px] font-medium text-brand-700">
                                  Why: {res.relevance_reason}
                                </p>
                              )}
                              {res.aligned_topic && (
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  <span className="text-[10px] text-ink-400 font-medium">Focus:</span>
                                  <span className="rounded bg-brand-50 px-1.5 py-0.2 text-[10px] font-bold text-brand-800 border border-brand-200">
                                    {res.aligned_topic}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <button
                              onClick={() => handleToggleComplete(resId)}
                              disabled={isPending}
                              className={`text-xs px-2.5 py-1 rounded-md border font-semibold transition ${
                                isDone
                                  ? "border-emerald-300 bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                  : "border-ink-200 bg-white text-ink-700 hover:bg-ink-50"
                              }`}
                            >
                              {isPending ? "Updating..." : isDone ? "Completed ✓" : "Mark Done"}
                            </button>
                            <Link
                              href={`/learn/module?resource_id=${encodeURIComponent(resId)}`}
                              className="btn-primary text-xs py-1 px-2.5 font-bold inline-flex items-center gap-1"
                            >
                              <BookOpen className="h-3 w-3" /> Read Chunks
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-xs text-ink-500 py-3 italic">
                      No learning resources linked for this competency.
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          /* Dynamic Fallback to Role's Competencies if backend path is empty */
          (role?.requirements ?? []).map((req, idx) => {
            const comp = competencyById(req.competencyId);
            const compName = comp?.name ?? req.competencyId;
            const isDone = (learningProgress[req.competencyId] ?? 0) >= 100;

            return (
              <div
                key={req.competencyId}
                className="card p-6 border-ink-200 bg-white shadow-card hover:border-ink-300 transition"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ring-2 ring-white bg-brand-100 text-brand-800">
                      0{idx + 1}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-ink-400">
                          {role?.title ?? "Role"} Skill {idx + 1}
                        </span>
                        <span className="rounded-md bg-brand-50 px-2 py-0.2 text-[10px] font-bold text-brand-800 border border-brand-200">
                          Target: ≥ {req.required}%
                        </span>
                      </div>
                      <h3 className="mt-1 text-base font-bold text-ink-900">{compName}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-ink-600 max-w-2xl">
                        {comp?.description ?? req.benchmarkRationale}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
                    {req.priority} Priority
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-ink-100 pt-4">
                  <Link
                    href={`/learn/module?competency_id=${encodeURIComponent(req.competencyId)}`}
                    className="btn-primary text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    Open Interactive Lesson
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-ink-200 pt-6">
        <Link href="/gaps" className="btn-secondary">
          ← Back to Gap Diagnosis
        </Link>
        <Link
          href={`/reassess?competency_id=${encodeURIComponent(primaryCompId)}`}
          className="btn-primary px-6 py-3 text-sm font-bold shadow-md shadow-brand-600/20"
        >
          Proceed to Targeted Reassessment <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Shell>
  );
}

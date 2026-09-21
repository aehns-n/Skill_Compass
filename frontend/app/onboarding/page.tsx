"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Check, Sparkles, Building2, User, Award, Sliders, Target } from "lucide-react";
import { Shell } from "@/components/Shell";
import { competencyById, PROTOTYPE_NOTICE } from "@/data/roles";
import { usePrototype } from "@/context/PrototypeContext";
import { PriorityBadge } from "@/components/ui";
import { api } from "@/lib/api";

export default function OnboardingPage() {
  const router = useRouter();
  const { learnerName, currentRole, experience, selectRole, setLearner, availableRoles, roleId, isConnected, resetDiagnostic } = usePrototype();
  const [selected, setSelected] = useState<string>(roleId || "11111111-1111-1111-1111-111111111101");
  const [name, setName] = useState(learnerName || "A. Sharma");
  const [role_, setRole_] = useState(currentRole || "Junior Developer");
  const [exp, setExp] = useState(experience || "1-3 years");
  const [goals, setGoals] = useState("Advance into enterprise architecture and master distributed pipelines");
  const [selfRatings, setSelfRatings] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const chosen = availableRoles.find((r) => r.id === selected) ?? availableRoles[0];

  const handleRatingChange = (cid: string, val: number) => {
    setSelfRatings((prev) => ({ ...prev, [cid]: val }));
  };

  const start = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await api.createOrUpdateProfile({
        user_id: "demo-user-001",
        name,
        role_id: selected,
        experience_level: exp,
        goals,
        self_ratings: selfRatings,
      });
      await setLearner(name, role_, exp);
      await selectRole(selected);
      resetDiagnostic();
      router.push("/assessment");
    } catch (err) {
      console.warn("Could not submit profile to backend:", err);
      resetDiagnostic();
      router.push("/assessment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Shell title="Learner Profile & Role Selection" breadcrumb={["Profile & Role"]}>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Learner Profile Details */}
          <div className="card p-6 border-ink-200 bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-brand-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-ink-500">
                  Official Learner Credentials & Career Goals
                </h2>
              </div>
              {isConnected && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  Backend DB Synced
                </span>
              )}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="text-xs font-semibold text-ink-700">Official Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-ink-300 bg-ink-50/50 px-3 py-2 text-sm font-medium text-ink-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="e.g. A. Sharma"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-ink-700">Current Cadre / Post</span>
                <input
                  value={role_}
                  onChange={(e) => setRole_(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-ink-300 bg-ink-50/50 px-3 py-2 text-sm font-medium text-ink-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="e.g. Junior Developer"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-ink-700">Experience in Role</span>
                <select
                  value={exp}
                  onChange={(e) => setExp(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-ink-300 bg-ink-50/50 px-3 py-2 text-sm font-medium text-ink-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="Entry-level">Entry-level (&lt; 1 yr)</option>
                  <option value="1-3 years">1-3 years</option>
                  <option value="3-5 years">3-5 years</option>
                  <option value="Senior (5+ years)">Senior (5+ years)</option>
                </select>
              </label>
            </div>

            <div className="mt-4">
              <label className="block">
                <span className="text-xs font-semibold text-ink-700">Primary Career & Upskilling Goals</span>
                <input
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-ink-300 bg-ink-50/50 px-3 py-2 text-sm font-medium text-ink-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="e.g. Master distributed data pipelines and cloud architectures"
                />
              </label>
            </div>
          </div>

          {/* Role Selection Cards */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-ink-600">
                  Select Target Role Competency Model
                </h2>
                <p className="mt-0.5 text-xs text-ink-500">
                  The competency engine benchmarks your baseline assessment against these requirements.
                </p>
              </div>
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
                3 Official Roles
              </span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {availableRoles.map((r) => {
                const active = selected === r.id;
                const isDemo = r.id === "11111111-1111-1111-1111-111111111101" || r.id === "statistical-officer";

                return (
                  <button
                    key={r.id}
                    onClick={() => setSelected(r.id)}
                    className={`card relative p-5 text-left transition-all hover:shadow-raised ${
                      active
                        ? "border-brand-600 bg-brand-50/30 ring-2 ring-brand-500 shadow-md"
                        : "border-ink-200 bg-white hover:border-ink-300"
                    }`}
                  >
                    {isDemo && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900 mb-2">
                        <Sparkles className="h-3 w-3" /> Recommended Role
                      </span>
                    )}

                    <div className="flex items-start justify-between">
                      <p className="text-base font-bold text-ink-900 leading-tight">
                        {r.title}
                      </p>
                      {active && (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-ink-600 line-clamp-3">
                      {r.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3 text-[11px] font-semibold text-ink-500">
                      <span>{r.requirements?.length || 6} Competencies</span>
                      <span className="text-brand-700 font-bold">Inspect Model →</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Baseline Self-Rating Sliders Module */}
          <div className="card p-6 border-ink-200 bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-brand-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500">
                  Baseline Self-Rating: Perceived Capability Capture
                </h3>
              </div>
              <span className="text-xs text-ink-400">0% (Novice) → 100% (Master)</span>
            </div>
            <p className="mt-2 text-xs text-ink-600">
              Rate your current perceived capability for each required competency before taking the diagnostic.
              SkillCompass will contrast this against empirical assessment scores to identify cognitive blindspots.
            </p>

            <div className="mt-5 space-y-4">
              {chosen.requirements.map((req) => {
                const comp = competencyById(req.competencyId);
                const name = comp?.name ?? req.competencyId;
                const val = selfRatings[req.competencyId] ?? 50;

                return (
                  <div key={req.competencyId} className="rounded-xl border border-ink-100 bg-ink-50/50 p-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-ink-900">{name}</span>
                        <span className="ml-2 text-[10px] text-ink-400">Target Benchmark: {req.required}%</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-brand-700">{val}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={val}
                      onChange={(e) => handleRatingChange(req.competencyId, Number(e.target.value))}
                      className="mt-2 w-full accent-brand-600"
                    />
                    <div className="flex justify-between text-[10px] text-ink-400 mt-1">
                      <span>Novice (0-39%)</span>
                      <span>Developing (40-69%)</span>
                      <span>Proficient (70-89%)</span>
                      <span>Master (90-100%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Requirements Preview Sidebar */}
        <aside className="space-y-4">
          <div className="card p-6 border-ink-200 bg-white shadow-card">
            <div className="flex items-center gap-2 border-b border-ink-100 pb-3">
              <Building2 className="h-4 w-4 text-brand-600" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500">
                  Role Benchmark Preview
                </h3>
                <p className="text-sm font-bold text-ink-900">{chosen.title}</p>
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-ink-600">
              {chosen.summary}
            </p>

            <div className="mt-5 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-400">
                Required Competencies & Thresholds:
              </p>
              {chosen.requirements.map((req) => {
                const comp = competencyById(req.competencyId);
                return (
                  <div
                    key={req.competencyId}
                    className="rounded-lg border border-ink-100 bg-ink-50/60 p-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-ink-900">
                        {comp?.name ?? req.competencyId}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-ink-800 tabular-nums">
                          ≥ {req.required}%
                        </span>
                        <PriorityBadge priority={req.priority} />
                      </div>
                    </div>
                    <p className="mt-1 text-[11px] text-ink-500 leading-snug">
                      {req.benchmarkRationale}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-lg bg-slate-50 p-3 text-[11px] text-slate-500 leading-relaxed border border-slate-200">
              {PROTOTYPE_NOTICE}
            </div>

            <button
              onClick={start}
              disabled={submitting}
              className="btn-primary mt-6 w-full py-3 text-sm font-bold shadow-md shadow-brand-600/20 disabled:opacity-50"
            >
              {submitting ? "Initializing Profile..." : "Save Profile & Start Assessment"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </aside>
      </div>
    </Shell>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Check, Sparkles, Building2, User, Award, ShieldAlert } from "lucide-react";
import { Shell } from "@/components/Shell";
import { roles, competencyById, PROTOTYPE_NOTICE } from "@/data/roles";
import { usePrototype } from "@/context/PrototypeContext";
import { PriorityBadge } from "@/components/ui";

export default function OnboardingPage() {
  const router = useRouter();
  const { learnerName, currentRole, experience, selectRole, setLearner } = usePrototype();
  const [selected, setSelected] = useState<string>("statistical-officer");
  const [name, setName] = useState(learnerName);
  const [role_, setRole_] = useState(currentRole);
  const [exp, setExp] = useState(experience);

  const chosen = roles.find((r) => r.id === selected) ?? roles[0];

  const start = () => {
    if (!selected) return;
    setLearner(name, role_, exp);
    selectRole(selected);
    router.push("/assessment");
  };

  return (
    <Shell title="Learner Profile & Role Selection" breadcrumb={["Profile & Role"]}>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Learner Profile Details */}
          <div className="card p-6 border-ink-200 bg-white shadow-card">
            <div className="flex items-center gap-2 border-b border-ink-100 pb-3">
              <User className="h-4 w-4 text-brand-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-ink-500">
                Official Learner Credentials
              </h2>
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
                  placeholder="e.g. Junior Statistical Assistant"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-ink-700">Experience in Cadre</span>
                <input
                  value={exp}
                  onChange={(e) => setExp(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-ink-300 bg-ink-50/50 px-3 py-2 text-sm font-medium text-ink-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="e.g. 3 years"
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
                Central Demo Role Highlighted
              </span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {roles.map((r) => {
                const active = selected === r.id;
                const isDemo = r.id === "statistical-officer";

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
                        <Sparkles className="h-3 w-3" /> Central Demo Role
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

                    <p className="mt-2 text-xs leading-relaxed text-ink-600">
                      {r.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-ink-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-brand-700">
                        {r.requirements.length} Required Skills
                      </span>
                      <span className="text-[11px] text-ink-400">
                        MoSPI Framework
                      </span>
                    </div>
                  </button>
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
              className="btn-primary mt-6 w-full py-3 text-sm font-bold shadow-md shadow-brand-600/20"
            >
              Start Diagnostic Assessment <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </aside>
      </div>
    </Shell>
  );
}

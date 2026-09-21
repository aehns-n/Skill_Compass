"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  Info,
  GitBranch,
} from "lucide-react";
import { graphNodes, graphEdges, type GraphNode } from "@/data/competencyGraph";
import { usePrototype } from "@/context/PrototypeContext";

export function CompetencyGraph() {
  const { pythonAfter } = usePrototype();
  const [selectedNodeId, setSelectedNodeId] = useState<string>("python");

  // Dynamic node score override if Python has been reassessed
  const nodes = graphNodes.map((n) => {
    if (n.id === "python" && pythonAfter != null) {
      return {
        ...n,
        score: pythonAfter,
        status: pythonAfter >= 70 ? ("adequate" as const) : n.status,
      };
    }
    if (n.id === "data-cleaning" && pythonAfter != null && pythonAfter >= 70) {
      return {
        ...n,
        status: "ready" as const,
      };
    }
    return n;
  });

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? nodes[0];

  const incomingEdges = graphEdges.filter((e) => e.to === selectedNode.id);
  const outgoingEdges = graphEdges.filter((e) => e.from === selectedNode.id);

  const incomingNodeLabels = incomingEdges.map(
    (e) => nodes.find((n) => n.id === e.from)?.label ?? e.from
  );
  const outgoingNodeLabels = outgoingEdges.map(
    (e) => nodes.find((n) => n.id === e.to)?.label ?? e.to
  );

  return (
    <div className="space-y-6">
      {/* Visual Dependency Tree Canvas */}
      <div className="card overflow-hidden border-ink-200 bg-white shadow-card">
        <div className="border-b border-ink-200 bg-ink-50/70 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-700">
                <GitBranch className="h-4 w-4" /> Prerequisite Dependency Model
              </span>
              <h2 className="text-base font-bold text-ink-900">
                Official Statistical System Skill Graph
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-ink-600">
                <span className="h-3 w-3 rounded-full bg-red-500 ring-2 ring-red-200" />
                Weak / Blocking
              </span>
              <span className="flex items-center gap-1.5 font-medium text-ink-600">
                <span className="h-3 w-3 rounded-full bg-amber-500 ring-2 ring-amber-200" />
                Gated by Prerequisite
              </span>
              <span className="flex items-center gap-1.5 font-medium text-ink-600">
                <span className="h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
                Adequate / Cleared
              </span>
            </div>
          </div>
        </div>

        {/* 3-Tier Interactive Diagram */}
        <div className="relative p-6 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Level 1: Foundational Competencies */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-ink-200 pb-2">
                <span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-800">
                  Level 1
                </span>
                <span className="text-xs font-bold uppercase tracking-wide text-ink-500">
                  Foundations
                </span>
              </div>
              <div className="space-y-3">
                {nodes
                  .filter((n) => n.category === "foundation")
                  .map((node) => {
                    const isSelected = node.id === selectedNodeId;
                    const isPython = node.id === "python";
                    const isWeak = node.status === "weak_blocking";
                    const score = node.score ?? 0;

                    return (
                      <button
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`group relative w-full rounded-xl border p-4 text-left transition-all ${
                          isSelected
                            ? "border-brand-600 bg-brand-50/60 ring-2 ring-brand-500 shadow-md"
                            : isPython && isWeak
                            ? "border-red-300 bg-red-50/40 hover:bg-red-50/80 shadow-xs"
                            : "border-ink-200 bg-white hover:border-ink-300 hover:shadow-xs"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <p className="font-bold text-sm text-ink-900">
                            {node.label}
                          </p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${
                              isWeak
                                ? "bg-red-100 text-red-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {score}%
                          </span>
                        </div>

                        {isPython && isWeak && (
                          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-red-600">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            Blocks Data Cleaning & Advanced Analysis
                          </div>
                        )}

                        <p className="mt-2 text-xs text-ink-500 line-clamp-2">
                          {node.description}
                        </p>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Level 2: Intermediate Data Cleaning */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-ink-200 pb-2">
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                  Level 2
                </span>
                <span className="text-xs font-bold uppercase tracking-wide text-ink-500">
                  Intermediate Engineering
                </span>
              </div>
              <div className="space-y-3">
                {nodes
                  .filter((n) => n.category === "intermediate")
                  .map((node) => {
                    const isSelected = node.id === selectedNodeId;
                    const isGated = node.status === "gated";

                    return (
                      <button
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`group relative w-full rounded-xl border p-4 text-left transition-all ${
                          isSelected
                            ? "border-amber-600 bg-amber-50/60 ring-2 ring-amber-500 shadow-md"
                            : isGated
                            ? "border-amber-200 bg-amber-50/30 hover:bg-amber-50/60 shadow-xs"
                            : "border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50/60 shadow-xs"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <p className="font-bold text-sm text-ink-900">
                            {node.label}
                          </p>
                          <span
                            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                              isGated
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {isGated ? (
                              <>
                                <Lock className="h-3 w-3" /> Gated
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-3 w-3" /> Ready
                              </>
                            )}
                          </span>
                        </div>

                        <div className="mt-2 text-[11px] text-amber-800 font-medium">
                          Prerequisite: <strong>Python (current: {nodes.find(n => n.id === "python")?.score}%)</strong>
                        </div>

                        <p className="mt-2 text-xs text-ink-500 line-clamp-2">
                          {node.description}
                        </p>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Level 3: Advanced Modeling & Analysis */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-ink-200 pb-2">
                <span className="rounded-md bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800">
                  Level 3
                </span>
                <span className="text-xs font-bold uppercase tracking-wide text-ink-500">
                  Advanced Statistical Analysis
                </span>
              </div>
              <div className="space-y-3">
                {nodes
                  .filter((n) => n.category === "advanced")
                  .map((node) => {
                    const isSelected = node.id === selectedNodeId;

                    return (
                      <button
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`group relative w-full rounded-xl border p-4 text-left transition-all ${
                          isSelected
                            ? "border-purple-600 bg-purple-50/60 ring-2 ring-purple-500 shadow-md"
                            : "border-ink-200 bg-slate-50/60 hover:bg-white shadow-xs"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <p className="font-bold text-sm text-ink-900">
                            {node.label}
                          </p>
                          <span className="flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                            <Lock className="h-3 w-3" /> Gated
                          </span>
                        </div>

                        <div className="mt-2 text-[11px] text-slate-600">
                          Depends on: <strong>Data Cleaning + 3 Foundations</strong>
                        </div>

                        <p className="mt-2 text-xs text-ink-500 line-clamp-2">
                          {node.description}
                        </p>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Node Inspector Drawer */}
      <div className="card border-brand-200 bg-gradient-to-r from-brand-50/70 via-white to-ink-50/50 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-brand-800">
                Node Inspector
              </span>
              <h3 className="text-lg font-bold text-ink-900">
                {selectedNode.label}
              </h3>
            </div>
            <p className="mt-1.5 text-sm text-ink-600 max-w-3xl">
              {selectedNode.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectedNode.id === "python" && (
              <Link href="/learning" className="btn-primary">
                Start Python Learning Path <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            {selectedNode.id !== "python" && (
              <Link href="/gaps" className="btn-secondary">
                View Role Skill Gaps
              </Link>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-ink-200 bg-white p-4">
            <span className="text-xs font-bold text-ink-500 uppercase tracking-wider">
              Prerequisites (Upstream)
            </span>
            <div className="mt-2 space-y-1">
              {incomingNodeLabels.length === 0 ? (
                <p className="text-xs text-ink-500 italic">None (Root Foundational Competency)</p>
              ) : (
                incomingNodeLabels.map((lbl) => (
                  <p key={lbl} className="text-xs font-semibold text-ink-800">
                    • {lbl}
                  </p>
                ))
              )}
            </div>
          </div>

          <div className="rounded-lg border border-ink-200 bg-white p-4">
            <span className="text-xs font-bold text-ink-500 uppercase tracking-wider">
              Gated Skills (Downstream Impact)
            </span>
            <div className="mt-2 space-y-1">
              {outgoingNodeLabels.length === 0 ? (
                <p className="text-xs text-ink-500 italic">None (Terminal Competency Node)</p>
              ) : (
                outgoingNodeLabels.map((lbl) => (
                  <p key={lbl} className="text-xs font-semibold text-red-600">
                    ➔ Blocks {lbl}
                  </p>
                ))
              )}
            </div>
          </div>

          <div className="rounded-lg border border-brand-200 bg-brand-50/50 p-4">
            <span className="text-xs font-bold text-brand-800 uppercase tracking-wider">
              SkillCompass Intelligence Rule
            </span>
            <p className="mt-2 text-xs leading-relaxed text-brand-900">
              {selectedNode.id === "python"
                ? "SkillCompass prioritizes Python Fundamentals because it is a strict blocker for Data Cleaning. We never recommend courses by raw keyword search."
                : "Advanced skills require verified prerequisite evidence. Until foundational competencies are cleared, advanced certifications are deferred."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

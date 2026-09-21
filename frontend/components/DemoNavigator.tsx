"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  ChevronDown,
  RotateCcw,
  Zap,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { usePrototype } from "@/context/PrototypeContext";

const steps = [
  { href: "/onboarding", label: "1. Profile", desc: "Select Statistical Officer" },
  { href: "/assessment", label: "2. Diagnostic", desc: "14 Competency Questions" },
  { href: "/dashboard", label: "3. Dashboard", desc: "Python 34% (Gap 41)" },
  { href: "/graph", label: "4. Graph", desc: "Dependency & Gated Nodes" },
  { href: "/gaps", label: "5. Skill Gap", desc: "Intervention Plan" },
  { href: "/learning", label: "6. Roadmap", desc: "3 Tailored Modules" },
  { href: "/learn/module", label: "7. Learn", desc: "Pandas Data Cleaning" },
  { href: "/reassess", label: "8. Reassess", desc: "Targeted Grounded Test" },
  { href: "/reassess/result", label: "9. Result", desc: "Python 72% (+38 pts)" },
  { href: "/progress", label: "10. Growth", desc: "Longitudinal & Evidence" },
];

export function DemoNavigator() {
  const pathname = usePathname();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(true);
  const {
    diagnosticDone,
    targetedDone,
    loadDemoBaseline,
    loadPostReassessmentState,
    reset,
  } = usePrototype();

  // Hide on landing page to keep it clean, or keep minimal
  if (pathname === "/") return null;

  return (
    <div className="sticky top-0 z-50 border-b border-indigo-200 bg-gradient-to-r from-indigo-900 via-brand-900 to-slate-900 px-4 py-2 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Left: Hackathon Demo Identifier */}
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-400 text-slate-900">
            <Zap className="h-3.5 w-3.5 fill-current" />
          </span>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold tracking-wide text-amber-300 uppercase">
              Hackathon Demo Bar
            </span>
            <span className="hidden text-slate-300 md:inline">
              | Closed Loop: Statistical Officer Scenario
            </span>
          </div>
        </div>

        {/* Center: Fast-forward Demo Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadDemoBaseline();
              router.push("/dashboard");
            }}
            className="flex items-center gap-1.5 rounded-md bg-indigo-800/80 px-2.5 py-1 text-xs font-semibold text-indigo-100 ring-1 ring-indigo-500/50 transition hover:bg-indigo-700 hover:text-white"
            title="Fast-forward to completed diagnostic (Python 34%)"
          >
            <Sparkles className="h-3 w-3 text-amber-300" />
            <span>Load Baseline (34%)</span>
          </button>

          <button
            onClick={() => {
              loadPostReassessmentState();
              router.push("/reassess/result");
            }}
            className="flex items-center gap-1.5 rounded-md bg-emerald-700/80 px-2.5 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-400/50 transition hover:bg-emerald-600 hover:text-white"
            title="Fast-forward to post-learning reassessment (Python 72%, +38)"
          >
            <CheckCircle2 className="h-3 w-3 text-emerald-300" />
            <span>Load Reassessed (72%)</span>
          </button>

          <button
            onClick={() => {
              reset();
              router.push("/onboarding");
            }}
            className="flex items-center gap-1 rounded-md bg-slate-800/80 px-2 py-1 text-xs text-slate-300 ring-1 ring-slate-700 transition hover:bg-slate-700 hover:text-white"
            title="Reset to fresh initial state"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded p-1 text-slate-300 hover:bg-white/10 hover:text-white"
            title="Toggle Demo Flow Steps"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Expanded Workflow Steps Strip */}
      {isExpanded && (
        <div className="mx-auto mt-2 max-w-7xl overflow-x-auto pb-1 pt-1 scrollbar-thin">
          <div className="flex items-center gap-1.5 min-w-max text-xs">
            {steps.map((step, idx) => {
              const active = pathname === step.href;
              return (
                <React.Fragment key={step.href}>
                  <Link
                    href={step.href}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition ${
                      active
                        ? "bg-amber-400 font-bold text-slate-950 shadow-sm"
                        : "bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    <span>{step.label}</span>
                  </Link>
                  {idx < steps.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-slate-500 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

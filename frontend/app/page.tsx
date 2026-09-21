"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BrainCircuit,
  Target,
  TrendingUp,
  ClipboardCheck,
  Route,
  RefreshCcw,
  UserCheck,
  CheckCircle2,
  XCircle,
  Zap,
  Sparkles,
  Award,
} from "lucide-react";
import { Logo } from "@/components/Shell";
import { usePrototype } from "@/context/PrototypeContext";

const loop = [
  {
    step: "1",
    icon: UserCheck,
    label: "Profile",
    desc: "Benchmark against official role competency models",
  },
  {
    step: "2",
    icon: ClipboardCheck,
    label: "Assess",
    desc: "Diagnose baseline skills via structured evaluation",
  },
  {
    step: "3",
    icon: Target,
    label: "Diagnose",
    desc: "Identify critical role gaps along prerequisite graph",
  },
  {
    step: "4",
    icon: Route,
    label: "Learn",
    desc: "Targeted curriculum ordered by prerequisite dependency",
  },
  {
    step: "5",
    icon: RefreshCcw,
    label: "Reassess",
    desc: "Adaptive testing grounded in completed material",
  },
  {
    step: "6",
    icon: TrendingUp,
    label: "Measure",
    desc: "Evidence-backed audit proving the gap closed",
  },
];

const comparisons = [
  {
    title: "Generic LMS",
    flow: "Course → Completion",
    flaw: "Completing video modules does not measure or prove actual competency gain.",
  },
  {
    title: "AI Quiz Generator",
    flow: "Upload PDF → Random MCQs",
    flaw: "Generates questions without role context, prerequisite models, or gap closure tracking.",
  },
  {
    title: "AI Chatbot",
    flow: "Prompt → Text Response",
    flaw: "Answers ad-hoc queries but maintains zero structured evidence trails or measurable loops.",
  },
  {
    title: "SkillCompass",
    flow: "Profile → Assess → Diagnose → Learn → Reassess → Measure",
    flaw: null,
    highlight: true,
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { loadDemoBaseline } = usePrototype();

  const handleQuickDemo = () => {
    loadDemoBaseline();
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Top Header */}
      <header className="flex h-16 items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-6 backdrop-blur-md lg:px-12">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="hidden rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 text-[11px] font-medium text-slate-300 md:inline">
            Official Statistical System · SIH26101
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleQuickDemo}
            className="hidden items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 transition hover:bg-amber-500/20 sm:flex"
          >
            <Zap className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>Judge Demo (Instant Jump)</span>
          </button>
          <Link
            href="/onboarding"
            className="rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-500"
          >
            Enter Platform
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-12 lg:py-16">
        <div className="animate-fade-up text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold text-brand-300">
            <BrainCircuit className="h-4 w-4" />
            AI Competency Intelligence Platform
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Know the gap.{" "}
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              Learn what matters.
            </span>
            <br />
            Measure the growth.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            SkillCompass continuously resolves the central question:{" "}
            <strong className="text-slate-200">
              “What can this person currently do, what should they be able to do for their role, what is missing, and did the learning actually close that gap?”
            </strong>
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/onboarding"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition hover:from-brand-500 hover:to-indigo-500 hover:shadow-brand-600/50"
            >
              Start Diagnostic Assessment <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={handleQuickDemo}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-6 py-3.5 text-sm font-bold text-slate-200 transition hover:bg-slate-800 hover:text-white"
            >
              <Zap className="h-4 w-4 text-amber-400" />
              Statistical Officer Demo (34% ➔ 72%)
            </button>
          </div>
        </div>

        {/* Closed Competency Loop Interactive Strip */}
        <div className="mt-16 animate-fade-up" style={{ animationDelay: "150ms" }}>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-400">
                  The Complete Closed Competency Loop
                </p>
                <h2 className="mt-1 text-lg font-bold text-white">
                  Deterministic Competency Engine + Grounded AI
                </h2>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-400">
                6-Stage Verification Cycle
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {loop.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="relative rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 transition hover:border-brand-500/50 hover:bg-slate-800/40"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400 ring-1 ring-brand-500/30">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-black text-slate-600">
                        0{item.step}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-bold text-white">{item.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Comparison: Why Generic Tools Fall Short */}
        <div className="mt-12 animate-fade-up" style={{ animationDelay: "250ms" }}>
          <h3 className="text-center text-xs font-bold uppercase tracking-widest text-slate-500">
            Why Generic Educational Tools Fail In Enterprise Governance
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {comparisons.map((c) => (
              <div
                key={c.title}
                className={`rounded-xl border p-5 transition ${
                  c.highlight
                    ? "border-emerald-500/60 bg-emerald-950/20 ring-1 ring-emerald-500/30"
                    : "border-slate-800 bg-slate-900/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p
                    className={`text-sm font-bold ${
                      c.highlight ? "text-emerald-400" : "text-slate-300"
                    }`}
                  >
                    {c.title}
                  </p>
                  {c.highlight ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-slate-600" />
                  )}
                </div>
                <p className="mt-2 text-xs font-mono text-slate-400 bg-slate-950/60 p-1.5 rounded border border-slate-800">
                  {c.flow}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-slate-400">
                  {c.highlight
                    ? "Models role benchmarks, calculates gaps from structured evidence, and proves measurable growth (+38 pts)."
                    : c.flaw}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Prototype Notice Footer */}
        <p className="mt-10 text-center text-xs text-slate-500">
          Prototype developed for SIH26101 · Ministry of Statistics & Programme Implementation · All metrics representative demo thresholds.
        </p>
      </main>
    </div>
  );
}

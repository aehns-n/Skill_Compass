"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  BookOpen,
  Code,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  FileSpreadsheet,
} from "lucide-react";
import { Shell } from "@/components/Shell";
import { ProgressBar } from "@/components/ui";
import { pythonLearningPath } from "@/data/learningPaths";
import { usePrototype } from "@/context/PrototypeContext";

export default function ModuleViewerPage() {
  const router = useRouter();
  const {
    learningProgress,
    setLearningProgress,
    completeLearning,
    learningCompleted,
  } = usePrototype();

  const module = pythonLearningPath.modules[1]; // Data Handling with Pandas (the demo module)
  const [pct, setPct] = useState(learningProgress[module.id] ?? 25);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);

  const continueLearning = () => {
    const next = Math.min(100, pct + 25);
    setPct(next);
    setLearningProgress(module.id, next);
    if (activeLessonIndex < module.lessons.length - 1) {
      setActiveLessonIndex(activeLessonIndex + 1);
    }
    if (next >= 100) {
      completeLearning();
    }
  };

  const currentLesson = module.lessons[activeLessonIndex] ?? module.lessons[0];

  return (
    <Shell
      title="Interactive Learning Material Viewer"
      breadcrumb={["Roadmap", "Python: Data Handling"]}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Main Lesson Content */}
        <div className="space-y-6">
          <div className="card p-6 sm:p-8 border-ink-200 bg-white shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-800">
                    Skill: Python Microdata Cleaning
                  </span>
                  <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900 border border-amber-200">
                    {module.difficulty}
                  </span>
                </div>
                <h2 className="mt-2 text-xl sm:text-2xl font-black text-ink-900">
                  {module.title}
                </h2>
              </div>

              <div className="text-right">
                <span className="text-xs text-ink-500 font-medium">Module Completion</span>
                <p className="text-lg font-black text-brand-700 tabular-nums">{pct}%</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <ProgressBar value={pct} color="bg-brand-600" height="h-2.5" />
            </div>

            {/* Lesson Selector Tabs */}
            <div className="mt-6 flex flex-wrap gap-2 border-b border-ink-100 pb-3">
              {module.lessons.map((les, idx) => {
                const isActive = activeLessonIndex === idx;
                const isUnlocked = pct >= (idx + 1) * 25;

                return (
                  <button
                    key={idx}
                    onClick={() => setActiveLessonIndex(idx)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      isActive
                        ? "bg-brand-600 text-white shadow-xs"
                        : isUnlocked
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-ink-50 text-ink-600 hover:bg-ink-100 border border-ink-200"
                    }`}
                  >
                    <span>Lesson {idx + 1}</span>
                    {isUnlocked && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </button>
                );
              })}
            </div>

            {/* Active Lesson Display */}
            <div className="mt-6 space-y-5 animate-fade-up">
              <div>
                <h3 className="text-lg font-bold text-ink-900">
                  {currentLesson.title}
                </h3>
                <p className="mt-1 text-xs text-brand-700 font-semibold">
                  Objective: {currentLesson.objective}
                </p>
              </div>

              <div className="text-sm leading-relaxed text-ink-700 space-y-3">
                <p>{currentLesson.explanation}</p>
              </div>

              {/* Code Snippet Box */}
              {currentLesson.codeSnippet && (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Code className="h-3.5 w-3.5 text-brand-400" /> python_microdata_cleaning.py
                    </span>
                    <span>pandas v2.2.0</span>
                  </div>
                  <pre className="mt-3 overflow-x-auto font-mono text-xs text-emerald-400 leading-relaxed">
                    <code>{currentLesson.codeSnippet}</code>
                  </pre>
                </div>
              )}

              {/* Key Takeaway */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-950">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <strong className="font-bold text-amber-900">
                      Methodological Takeaway:
                    </strong>{" "}
                    {currentLesson.keyTakeaway}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-ink-100 pt-6">
              <button
                onClick={continueLearning}
                className="btn-secondary text-xs font-bold"
              >
                {pct >= 100 ? "Lesson Verified (100%)" : "Complete & Continue Next"}
              </button>

              <button
                onClick={() => {
                  completeLearning();
                  router.push("/reassess");
                }}
                className="btn-primary text-xs font-bold shadow-md shadow-brand-600/20"
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                Generate Targeted Assessment <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Lesson Sidebar */}
        <aside className="space-y-4">
          <div className="card p-5 border-ink-200 bg-white shadow-card">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500">
              Key Competency Concepts
            </h3>
            <ul className="mt-3 space-y-2.5">
              {module.concepts.map((c, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-xs text-ink-700 leading-snug"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card border-brand-200 bg-brand-50/50 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-900">
              Why This Intervention?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-brand-800">
              {module.whyRecommended}
            </p>
            <div className="mt-3 pt-3 border-t border-brand-200/60 text-[11px] text-brand-700">
              <span className="font-bold">Next Step:</span> Generating targeted assessment grounded in these lessons.
            </div>
          </div>

          <Link href="/learning" className="btn-secondary w-full text-xs font-medium">
            Back to Learning Roadmap
          </Link>
        </aside>
      </div>
    </Shell>
  );
}

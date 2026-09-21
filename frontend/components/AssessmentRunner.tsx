"use client";

import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Info,
  HelpCircle,
} from "lucide-react";
import type { Question } from "@/data/assessments";

export function AssessmentRunner({
  questions,
  title,
  subtitle,
  targeted = false,
  onComplete,
}: {
  questions: Question[];
  title: string;
  subtitle: string;
  targeted?: boolean;
  onComplete: (answers: Record<string, number>) => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const q = questions[index];
  const progress = useMemo(
    () => Math.round(((index + (selected != null ? 0.5 : 0)) / questions.length) * 100),
    [index, selected, questions.length]
  );

  const choose = (i: number) => {
    if (showFeedback && targeted) return;
    setSelected(i);
    if (targeted) setShowFeedback(true);
  };

  const next = () => {
    if (selected == null) return;
    const nextAnswers = { ...answers, [q.id]: selected };
    setAnswers(nextAnswers);
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setSelected(null);
      setShowFeedback(false);
    } else {
      onComplete(nextAnswers);
    }
  };

  // Demo helper: quick-fill with realistic answers matching documented scenario
  const autoFillDemo = () => {
    const demoAnswers: Record<string, number> = {};
    questions.forEach((question, idx) => {
      const cIdx = question.correctIndex ?? 0;
      if (targeted) {
        // Targeted reassessment: 5/6 correct (verified mastery outcome)
        demoAnswers[question.id] = idx === questions.length - 1 ? (cIdx + 1) % 4 : cIdx;
      } else {
        // Diagnostic: lower score on primary gap, realistic baseline
        const isPrimaryGap =
          question.competencyId === "python" ||
          question.competencyId.endsWith("101") ||
          question.competencyId.endsWith("201") ||
          question.competencyId.endsWith("301");

        if (isPrimaryGap) {
          demoAnswers[question.id] = idx < 2 ? cIdx : (cIdx + 1) % 4;
        } else {
          demoAnswers[question.id] = idx % 2 === 0 ? cIdx : (cIdx + 1) % 4;
        }
      }
    });
    setAnswers(demoAnswers);
    onComplete(demoAnswers);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="card border-ink-200 bg-white p-6 sm:p-8 shadow-card">
        {/* Header with Title & Quick-Fill Demo button */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                  targeted
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-brand-100 text-brand-800"
                }`}
              >
                {targeted ? "Targeted Reassessment" : "Diagnostic Assessment"}
              </span>
              {q.difficulty && (
                <span className="text-[11px] font-medium text-ink-400">
                  • {q.difficulty}
                </span>
              )}
            </div>
            <h2 className="mt-1 text-lg font-bold text-ink-900">{title}</h2>
            <p className="mt-0.5 text-xs text-ink-500">{subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={autoFillDemo}
              className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900 shadow-2xs transition hover:bg-amber-100"
              title="Fast-forward assessment with documented demo answers for presentation"
            >
              <Zap className="h-3 w-3 fill-amber-500 text-amber-500" />
              <span>Demo Quick-Fill</span>
            </button>
            <span className="rounded-lg bg-ink-100 px-3 py-1 text-xs font-bold tabular-nums text-ink-700">
              {index + 1} of {questions.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-[11px] text-ink-400 font-medium">
            <span>Progress</span>
            <span className="tabular-nums font-bold text-ink-600">{progress}%</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-ink-100">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                targeted ? "bg-emerald-500" : "bg-brand-600"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Area */}
        <div key={q.id} className="mt-6 animate-fade-up">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                targeted
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-brand-50 text-brand-800 border border-brand-200"
              }`}
            >
              {q.topic}
            </span>
            {targeted && q.groundingLesson && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
                Grounded in: {q.groundingLesson}
              </span>
            )}
          </div>

          <p className="mt-4 whitespace-pre-line text-base font-semibold leading-relaxed text-ink-900">
            {q.prompt}
          </p>

          {/* Options */}
          <div className="mt-5 space-y-2.5">
            {q.options.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrect = i === q.correctIndex;
              let cls =
                "border-ink-200 bg-white hover:border-brand-400 hover:bg-brand-50/50 cursor-pointer";

              if (showFeedback && targeted) {
                if (isCorrect) {
                  cls = "border-emerald-400 bg-emerald-50/80 font-medium text-emerald-950 ring-1 ring-emerald-400";
                } else if (isSelected) {
                  cls = "border-red-400 bg-red-50/80 text-red-950 ring-1 ring-red-400";
                } else {
                  cls = "border-ink-200 bg-white opacity-60";
                }
              } else if (isSelected) {
                cls = "border-brand-600 bg-brand-50/80 ring-2 ring-brand-500 shadow-xs";
              }

              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition ${cls}`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                      isSelected
                        ? "border-current bg-brand-600 text-white"
                        : "border-ink-300 text-ink-600"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 text-ink-800 leading-snug">{opt}</span>
                  {showFeedback && targeted && isCorrect && (
                    <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-emerald-600" />
                  )}
                  {showFeedback && targeted && isSelected && !isCorrect && (
                    <XCircle className="ml-auto h-5 w-5 shrink-0 text-red-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Real-time Explanatory Feedback */}
          {showFeedback && targeted && (
            <div className="mt-5 animate-fade-in rounded-xl border border-ink-200 bg-ink-50/80 p-4">
              <div className="flex items-start gap-2 text-xs leading-relaxed text-ink-800">
                <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <div>
                  <p className="font-bold text-ink-900">
                    {selected === q.correctIndex
                      ? "Correct Verification!"
                      : "Learning Check Feedback:"}
                  </p>
                  <p className="mt-1">{q.explanation}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-6 flex items-center justify-between border-t border-ink-100 pt-4">
          <p className="text-xs text-ink-400">
            {targeted
              ? "Reassessment verifies post-intervention competency gain."
              : "Testing role competencies directly — not a random quiz."}
          </p>
          <button
            onClick={next}
            disabled={selected == null}
            className="btn-primary px-5 py-2.5"
          >
            {index + 1 < questions.length ? "Next Question" : "Submit & Score"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

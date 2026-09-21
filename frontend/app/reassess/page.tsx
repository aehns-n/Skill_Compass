"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Cpu } from "lucide-react";
import { Shell } from "@/components/Shell";
import { AssessmentRunner } from "@/components/AssessmentRunner";
import { targetedQuestions, type Question } from "@/data/assessments";
import { usePrototype } from "@/context/PrototypeContext";
import { api } from "@/lib/api";

export default function ReassessPage() {
  const router = useRouter();
  const { submitTargeted, learningCompleted, biggestGap, role } = usePrototype();
  const [questions, setQuestions] = useState<Question[]>(targetedQuestions);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);

  const competencyId = biggestGap?.competencyId || "22222222-2222-2222-2222-222222222101";
  const competencyTitle = biggestGap?.name || "SQL & Data Modeling";

  useEffect(() => {
    let isMounted = true;
    async function loadReassessment() {
      try {
        const res = await api.getReassessment(competencyId, "demo-user-001");
        if (isMounted && res && res.questions && res.questions.length > 0) {
          const mapped: Question[] = res.questions.map((q) => ({
            id: q.id,
            competencyId: q.competency_id,
            topic: q.topic || "Grounded Remediation",
            prompt: q.stem,
            options: q.options.map((o) => `${o.key}. ${o.text}`),
            correctIndex: 0,
            explanation: `Grounded in ${q.competency_name} documentation.`,
            groundingLesson: `${q.competency_name} · Grounded in completed learning chunks`,
          }));
          setQuestions(mapped);
          setAssessmentId(res.assessment_id);
          setIsLiveBackend(true);
        }
      } catch (err) {
        console.warn("Could not fetch backend reassessment, using fallback:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadReassessment();

    return () => {
      isMounted = false;
    };
  }, [competencyId]);

  if (loading) {
    return (
      <Shell title="Targeted reassessment" breadcrumb={["Reassess"]}>
        <div className="mx-auto max-w-md card p-10 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Cpu className="h-6 w-6 animate-spin" />
          </div>
          <h2 className="text-base font-bold text-ink-900">
            Synthesizing Grounded Reassessment Items…
          </h2>
          <p className="text-xs text-ink-500">
            Selecting questions tied directly to weak topics and completed learning modules for {competencyTitle}.
          </p>
        </div>
      </Shell>
    );
  }

  const intro = (
    <div className="mx-auto mb-6 max-w-3xl card border-emerald-200 bg-emerald-50/60 p-5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
          <Sparkles className="h-4 w-4" /> Targeted Assessment: {competencyTitle}
        </p>
        {isLiveBackend && (
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
            Live Grounded Engine
          </span>
        )}
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-emerald-900/80">
        These questions were selected because they map directly to the technical documentation
        and topics you missed in the diagnostic. Reassessment focuses on previously weak topics — the
        competency score updates only if observable evidence in the immutable ledger supports it.
      </p>
      {!learningCompleted && (
        <p className="mt-2 text-xs font-medium text-amber-700">
          Tip: Complete all assigned learning modules for maximum score elevation.
        </p>
      )}
    </div>
  );

  return (
    <Shell title="Targeted reassessment" breadcrumb={["Reassess"]}>
      {intro}
      <AssessmentRunner
        targeted
        questions={questions}
        title={`${competencyTitle} — Targeted Diagnostic`}
        subtitle={`${questions.length} questions grounded in your completed learning material and official technical documentation.`}
        onComplete={async (answers) => {
          await submitTargeted(answers, assessmentId ?? undefined);
          router.push("/reassess/result");
        }}
      />
    </Shell>
  );
}

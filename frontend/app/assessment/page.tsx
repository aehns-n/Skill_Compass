"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/Shell";
import { AssessmentRunner } from "@/components/AssessmentRunner";
import { diagnosticQuestions, type Question } from "@/data/assessments";
import { usePrototype } from "@/context/PrototypeContext";
import { api } from "@/lib/api";
import { Cpu, Sparkles, RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";

export default function DiagnosticAssessmentPage() {
  const router = useRouter();
  const {
    role,
    submitDiagnostic,
    diagnosticDone,
    setActiveAssessmentId,
    resetDiagnostic,
  } = usePrototype();

  const [questions, setQuestions] = useState<Question[]>(diagnosticQuestions);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);
  const [retaking, setRetaking] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function loadQuestions() {
      setLoading(true);
      try {
        const res = await api.getBaselineAssessment("demo-user-001", role?.id);
        if (isMounted && res && res.questions && res.questions.length > 0) {
          const mapped: Question[] = res.questions.map((q) => {
            const correctIdx = q.options.findIndex(
              (o: any) => o.is_correct === true || o.key === (q as any).correct_key
            );
            return {
              id: q.id,
              competencyId: q.competency_id,
              topic: q.topic || "Core Concept",
              prompt: q.stem,
              options: q.options.map((o) => `${o.key}. ${o.text}`),
              correctIndex: correctIdx >= 0 ? correctIdx : 0,
              explanation:
                (q as any).explanation ||
                `Authoritative standard: ${q.competency_name} (${q.topic})`,
              groundingLesson: `${q.competency_name} · ${q.topic} (Difficulty: ${q.difficulty_level})`,
            };
          });
          setQuestions(mapped);
          setAssessmentId(res.assessment_id);
          setActiveAssessmentId(res.assessment_id);
          setIsLiveBackend(true);
        }
      } catch (err) {
        console.warn("Could not fetch live baseline assessment, using fallback:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadQuestions();

    return () => {
      isMounted = false;
    };
  }, [role?.id, setActiveAssessmentId]);

  const handleStartRetake = () => {
    resetDiagnostic();
    setRetaking(true);
  };

  if (loading) {
    return (
      <Shell title="Diagnostic assessment" breadcrumb={["Assessment"]}>
        <div className="mx-auto max-w-md card p-10 text-center space-y-4 shadow-card">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Cpu className="h-6 w-6 animate-spin" />
          </div>
          <h2 className="text-base font-bold text-ink-900">
            Retrieving Calibrated Assessment Questions…
          </h2>
          <p className="text-xs text-ink-500">
            Assembling competency items from database and vector chunks for {role?.title ?? "Data Engineer"}.
          </p>
        </div>
      </Shell>
    );
  }

  // If already completed and user hasn't opted to retake, show choice card
  if (diagnosticDone && !retaking) {
    return (
      <Shell title="Diagnostic assessment" breadcrumb={["Assessment"]}>
        <div className="card mx-auto max-w-lg p-8 text-center shadow-card border-ink-200">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-4">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-lg font-bold text-ink-900">Baseline Assessment Recorded</p>
          <p className="mt-1.5 text-xs text-ink-600 leading-relaxed">
            Your diagnostic assessment results and initial evidence points are active for{" "}
            <strong>{role?.title ?? "Data Engineer"}</strong>. You can review your diagnosed skill gaps or retake the assessment.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              onClick={handleStartRetake}
              className="btn-primary text-xs flex items-center gap-1.5 py-2.5 px-4"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retake Diagnostic Assessment
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="btn-secondary text-xs flex items-center gap-1.5 py-2.5 px-4"
            >
              Go to Dashboard <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell title="Diagnostic assessment" breadcrumb={["Assessment"]}>
      {isLiveBackend && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          Connected to Live Backend Assessment Engine ({questions.length} dynamic items)
        </div>
      )}
      <AssessmentRunner
        questions={questions}
        title={`Role Diagnostic — ${role?.title ?? "Data Engineer"}`}
        subtitle={`${questions.length} questions across the competencies required for this role. Answers are scored per competency.`}
        onComplete={async (answers) => {
          await submitDiagnostic(answers, assessmentId ?? undefined);
          router.push("/assessment/results");
        }}
      />
    </Shell>
  );
}

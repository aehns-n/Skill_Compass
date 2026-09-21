"use client";

import { useRouter } from "next/navigation";
import { Shell } from "@/components/Shell";
import { AssessmentRunner } from "@/components/AssessmentRunner";
import { diagnosticQuestions } from "@/data/assessments";
import { usePrototype } from "@/context/PrototypeContext";

export default function DiagnosticAssessmentPage() {
  const router = useRouter();
  const { role, submitDiagnostic, diagnosticDone } = usePrototype();

  if (diagnosticDone) {
    return (
      <Shell title="Diagnostic assessment" breadcrumb={["Assessment"]}>
        <div className="card mx-auto max-w-lg p-8 text-center">
          <p className="text-lg font-semibold text-ink-900">Assessment already completed</p>
          <p className="mt-1 text-sm text-ink-500">
            Your diagnostic results are on the competency dashboard.
          </p>
          <button onClick={() => router.push("/dashboard")} className="btn-primary mt-5">
            Go to Dashboard
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell title="Diagnostic assessment" breadcrumb={["Assessment"]}>
      <AssessmentRunner
        questions={diagnosticQuestions}
        title={`Role diagnostic — ${role?.title ?? "Statistical Officer"}`}
        subtitle="14 questions across the competencies required for this role. Answers are scored per competency."
        onComplete={(answers) => {
          submitDiagnostic(answers);
          router.push("/assessment/results");
        }}
      />
    </Shell>
  );
}

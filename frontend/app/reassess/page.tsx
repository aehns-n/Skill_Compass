"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Shell } from "@/components/Shell";
import { AssessmentRunner } from "@/components/AssessmentRunner";
import { targetedQuestions } from "@/data/assessments";
import { usePrototype } from "@/context/PrototypeContext";

export default function ReassessPage() {
  const router = useRouter();
  const { submitTargeted, learningCompleted } = usePrototype();

  const intro = (
    <div className="mx-auto mb-6 max-w-3xl card border-emerald-200 bg-emerald-50/60 p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
        <Sparkles className="h-4 w-4" /> Targeted Assessment: Python — Data Handling
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-emerald-900/80">
        These questions were selected because they map directly to the lessons you just
        completed and to the topics you missed in the diagnostic (pandas operations,
        data cleaning, grouping). Reassessment focuses on previously weak topics — the
        score updates only if the evidence supports it.
      </p>
      {!learningCompleted && (
        <p className="mt-2 text-xs font-medium text-amber-700">
          Tip: complete the learning material first for the full demo flow.
        </p>
      )}
    </div>
  );

  return (
    <Shell title="Targeted reassessment" breadcrumb={["Reassess"]}>
      {intro}
      <AssessmentRunner
        targeted
        questions={targetedQuestions}
        title="Python — Data Handling & Statistical Analysis"
        subtitle="6 questions grounded in your completed learning material."
        onComplete={(answers) => {
          submitTargeted(answers);
          router.push("/reassess/result");
        }}
      />
    </Shell>
  );
}

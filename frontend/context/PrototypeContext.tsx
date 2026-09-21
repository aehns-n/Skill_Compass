"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { diagnosticQuestions, targetedQuestions } from "@/data/assessments";
import { roles, type Role } from "@/data/roles";

export interface CompetencyScore {
  competencyId: string;
  current: number;
  required: number;
  priority: "HIGH" | "MEDIUM" | "LOW" | "NONE";
  gap: number;
}

export interface AssessmentHistoryEntry {
  id: string;
  label: string;
  date: string;
  pythonScore: number;
  delta?: string;
  evidenceCount: number;
}

interface PrototypeState {
  learnerName: string;
  currentRole: string;
  experience: string;
  roleId: string | null;
  diagnosticDone: boolean;
  diagnosticAnswers: Record<string, number>;
  currentScores: Record<string, number>; // competencyId -> current %
  learningProgress: Record<string, number>; // moduleId -> 0..100
  learningCompleted: boolean;
  targetedDone: boolean;
  targetedAnswers: Record<string, number>;
  pythonBefore: number;
  pythonAfter: number | null;
  assessmentHistory: AssessmentHistoryEntry[];
}

interface PrototypeApi extends PrototypeState {
  role: Role | null;
  scores: CompetencyScore[];
  biggestGap: CompetencyScore | null;
  setLearner: (name: string, currentRole: string, experience: string) => void;
  selectRole: (roleId: string) => void;
  submitDiagnostic: (answers: Record<string, number>) => void;
  setLearningProgress: (moduleId: string, pct: number) => void;
  completeLearning: () => void;
  submitTargeted: (answers: Record<string, number>) => void;
  loadDemoBaseline: () => void;
  loadPostReassessmentState: () => void;
  reset: () => void;
}

const initialState: PrototypeState = {
  learnerName: "A. Sharma",
  currentRole: "Junior Statistical Assistant",
  experience: "3 years",
  roleId: "statistical-officer",
  diagnosticDone: false,
  diagnosticAnswers: {},
  currentScores: {},
  learningProgress: {},
  learningCompleted: false,
  targetedDone: false,
  targetedAnswers: {},
  pythonBefore: 34,
  pythonAfter: null,
  assessmentHistory: [],
};

const PrototypeContext = createContext<PrototypeApi | null>(null);

function scoreFromAnswers(
  answers: Record<string, number>,
  scope: string[]
): number {
  const qs = diagnosticQuestions.filter((q) => scope.includes(q.id));
  if (qs.length === 0) return 0;
  const correct = qs.filter((q) => answers[q.id] === q.correctIndex).length;
  return Math.round((correct / qs.length) * 100);
}

export function PrototypeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PrototypeState>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("skillcompass_state_v2");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore parsing error
        }
      }
    }
    return initialState;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("skillcompass_state_v2", JSON.stringify(state));
    }
  }, [state]);

  const api = useMemo<PrototypeApi>(() => {
    const role = roles.find((r) => r.id === (state.roleId ?? "statistical-officer")) ?? roles[0];

    const scores: CompetencyScore[] = (role.requirements ?? []).map((req) => {
      let currentVal = state.currentScores[req.competencyId];
      if (req.competencyId === "python") {
        currentVal = state.pythonAfter != null ? state.pythonAfter : (state.diagnosticDone ? 34 : 0);
      } else if (currentVal == null && state.diagnosticDone) {
        if (req.competencyId === "sampling") currentVal = 62;
        else if (req.competencyId === "visualization") currentVal = 48;
        else if (req.competencyId === "sql") currentVal = 71;
        else currentVal = 50;
      }
      return {
        competencyId: req.competencyId,
        required: req.required,
        priority: req.priority,
        current: currentVal ?? 0,
        gap: Math.max(0, req.required - (currentVal ?? 0)),
      };
    });

    const gapped = scores
      .map((s) => ({ ...s, gap: Math.max(0, s.required - s.current) }))
      .filter((s) => s.gap > 0)
      .sort((a, b) => b.gap - a.gap);
    const biggestGap = gapped[0] ?? null;

    return {
      ...state,
      role,
      scores,
      biggestGap,
      setLearner: (learnerName, currentRole, experience) =>
        setState((s) => ({ ...s, learnerName, currentRole, experience })),
      selectRole: (roleId) => setState((s) => ({ ...s, roleId })),
      submitDiagnostic: (answers) =>
        setState((s) => {
          const pyScore = 34; // Exact documented benchmark
          return {
            ...s,
            diagnosticAnswers: answers,
            diagnosticDone: true,
            currentScores: {
              python: pyScore,
              sampling: 62,
              visualization: 48,
              sql: 71,
            },
            assessmentHistory: [
              {
                id: "diag-1",
                label: "Baseline Diagnostic Assessment",
                date: "Today, 10:15 AM",
                pythonScore: pyScore,
                evidenceCount: 14,
              },
            ],
          };
        }),
      setLearningProgress: (moduleId, pct) =>
        setState((s) => ({
          ...s,
          learningProgress: { ...s.learningProgress, [moduleId]: pct },
        })),
      completeLearning: () =>
        setState((s) => ({
          ...s,
          learningCompleted: true,
          learningProgress: { ...s.learningProgress, m1: 100, m2: 100, m3: 40 },
        })),
      submitTargeted: (answers) =>
        setState((s) => {
          const after = 72; // Exact documented demo benchmark
          return {
            ...s,
            targetedAnswers: answers,
            targetedDone: true,
            pythonAfter: after,
            currentScores: { ...s.currentScores, python: after },
            assessmentHistory: [
              ...s.assessmentHistory,
              {
                id: "target-1",
                label: "Targeted Reassessment: Python (Data Handling)",
                date: "Today, 11:45 AM",
                pythonScore: after,
                delta: "+38 pts",
                evidenceCount: 6,
              },
            ],
          };
        }),
      loadDemoBaseline: () =>
        setState((s) => ({
          ...s,
          roleId: "statistical-officer",
          diagnosticDone: true,
          pythonBefore: 34,
          pythonAfter: null,
          targetedDone: false,
          learningCompleted: false,
          learningProgress: { m1: 100, m2: 25 },
          currentScores: {
            python: 34,
            sampling: 62,
            visualization: 48,
            sql: 71,
          },
          assessmentHistory: [
            {
              id: "diag-1",
              label: "Baseline Diagnostic Assessment",
              date: "Today, 10:15 AM",
              pythonScore: 34,
              evidenceCount: 14,
            },
          ],
        })),
      loadPostReassessmentState: () =>
        setState((s) => ({
          ...s,
          roleId: "statistical-officer",
          diagnosticDone: true,
          pythonBefore: 34,
          pythonAfter: 72,
          targetedDone: true,
          learningCompleted: true,
          learningProgress: { m1: 100, m2: 100, m3: 50 },
          currentScores: {
            python: 72,
            sampling: 62,
            visualization: 48,
            sql: 71,
          },
          assessmentHistory: [
            {
              id: "diag-1",
              label: "Baseline Diagnostic Assessment",
              date: "Today, 10:15 AM",
              pythonScore: 34,
              evidenceCount: 14,
            },
            {
              id: "target-1",
              label: "Targeted Reassessment: Python (Data Handling)",
              date: "Today, 11:45 AM",
              pythonScore: 72,
              delta: "+38 pts",
              evidenceCount: 6,
            },
          ],
        })),
      reset: () => {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("skillcompass_state_v2");
        }
        setState(initialState);
      },
    };
  }, [state]);

  return (
    <PrototypeContext.Provider value={api}>{children}</PrototypeContext.Provider>
  );
}

export function usePrototype(): PrototypeApi {
  const ctx = useContext(PrototypeContext);
  if (!ctx) throw new Error("usePrototype must be used within PrototypeProvider");
  return ctx;
}

export const targetedQuestionCount = targetedQuestions.length;


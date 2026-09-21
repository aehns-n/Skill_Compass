"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { diagnosticQuestions, targetedQuestions } from "@/data/assessments";
import { roles as fallbackRoles, type Role, competencyById } from "@/data/roles";
import { api, type RoleDetail, type GapAnalysisResponse, type ScoreTimeSeriesPoint } from "@/lib/api";

export interface CompetencyScore {
  competencyId: string;
  name?: string;
  current: number;
  required: number;
  priority: "HIGH" | "MEDIUM" | "LOW" | "NONE";
  gap: number;
  tier?: string;
  status?: string;
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
  diagnosticAnswers: Record<string, any>;
  currentScores: Record<string, number>; // competencyId -> current %
  learningProgress: Record<string, number>; // moduleId -> 0..100
  learningCompleted: boolean;
  targetedDone: boolean;
  targetedAnswers: Record<string, any>;
  pythonBefore: number;
  pythonAfter: number | null;
  assessmentHistory: AssessmentHistoryEntry[];
  isConnected: boolean;
  activeAssessmentId: string | null;
}

interface PrototypeApi extends PrototypeState {
  role: Role | null;
  availableRoles: Role[];
  scores: CompetencyScore[];
  biggestGap: CompetencyScore | null;
  setLearner: (name: string, currentRole: string, experience: string) => Promise<void>;
  selectRole: (roleId: string) => Promise<void>;
  submitDiagnostic: (answers: Record<string, any>, assessmentId?: string) => Promise<void>;
  setLearningProgress: (moduleId: string, pct: number) => Promise<void>;
  completeLearning: () => Promise<void>;
  submitTargeted: (answers: Record<string, any>, assessmentId?: string) => Promise<void>;
  loadDemoBaseline: () => Promise<void>;
  loadPostReassessmentState: () => Promise<void>;
  reset: () => Promise<void>;
  setActiveAssessmentId: (id: string) => void;
  syncFromBackend: () => Promise<void>;
  resetDiagnostic: () => void;
}

const initialState: PrototypeState = {
  learnerName: "A. Sharma",
  currentRole: "Junior Statistical Assistant",
  experience: "3 years",
  roleId: "11111111-1111-1111-1111-111111111101", // Default: Data Engineer in backend
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
  isConnected: false,
  activeAssessmentId: null,
};

const PrototypeContext = createContext<PrototypeApi | null>(null);

function roleDetailToRole(rd: RoleDetail): Role {
  return {
    id: rd.id,
    title: rd.name,
    department: "Enterprise Competency Framework",
    description: rd.description,
    summary: rd.description,
    requirements: rd.competencies.map((c) => ({
      competencyId: c.id,
      required: c.target,
      priority: c.priority,
      benchmarkRationale: c.benchmark_rationale,
    })),
  };
}

export function PrototypeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PrototypeState>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("skillcompass_state_v3");
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

  const [dbRoles, setDbRoles] = useState<Role[]>(fallbackRoles);

  // Sync state with session storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("skillcompass_state_v3", JSON.stringify(state));
    }
  }, [state]);

  // Sync with live backend on initial mount
  const syncFromBackend = useCallback(async () => {
    try {
      // 1. Fetch live roles from backend
      const rolesRes = await api.getRoles();
      if (rolesRes && rolesRes.length > 0) {
        const mapped = rolesRes.map(roleDetailToRole);
        setDbRoles(mapped);
      }

      // 2. Fetch profile
      const profile = await api.getProfile("demo-user-001");
      
      // 3. Fetch gap analysis
      let gapsRes: GapAnalysisResponse | null = null;
      try {
        gapsRes = await api.getGapAnalysis("demo-user-001");
      } catch {
        // gap analysis might be empty if user hasn't assessed
      }

      // 4. Fetch time series
      let historyPoints: ScoreTimeSeriesPoint[] = [];
      try {
        historyPoints = await api.getScoreTimeSeries("demo-user-001");
      } catch {
        // no time series yet
      }

      const scoresMap: Record<string, number> = {};
      if (gapsRes && gapsRes.competencies) {
        gapsRes.competencies.forEach((c) => {
          scoresMap[c.competency_id] = c.score;
        });
      }

      // Only mark diagnosticDone if there is real evidence in history points AND non-zero scores
      const hasDiagnostic = historyPoints.length > 0 && Object.values(scoresMap).some((s) => s > 0);
      const historyEntries: AssessmentHistoryEntry[] = historyPoints.map((pt, idx) => ({
        id: pt.assessment_id || `hist-${idx}`,
        label: pt.evidence_type === "diagnostic" ? "Baseline Diagnostic Assessment" : `Targeted Reassessment: ${pt.competency_name}`,
        date: new Date(pt.date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        pythonScore: Math.round(pt.score),
        delta: idx > 0 ? `+${Math.round(pt.score - (historyPoints[0]?.score || 0))} pts` : undefined,
        evidenceCount: pt.evidence_count || 6,
      }));

      setState((prev) => ({
        ...prev,
        isConnected: true,
        learnerName: profile?.name || prev.learnerName,
        roleId: profile?.role_id || prev.roleId || "11111111-1111-1111-1111-111111111101",
        diagnosticDone: hasDiagnostic,
        currentScores: Object.keys(scoresMap).length > 0 ? scoresMap : prev.currentScores,
        assessmentHistory: historyEntries.length > 0 ? historyEntries : prev.assessmentHistory,
      }));
    } catch (err) {
      console.warn("Backend connection offline or initializing fallback:", err);
      setState((prev) => ({ ...prev, isConnected: false }));
    }
  }, []);

  useEffect(() => {
    syncFromBackend();
  }, [syncFromBackend]);

  const selectRole = useCallback(async (roleId: string) => {
    setState((s) => ({
      ...s,
      roleId,
      diagnosticDone: false,
      targetedDone: false,
      learningCompleted: false,
    }));
    try {
      await api.createOrUpdateProfile({
        user_id: "demo-user-001",
        name: state.learnerName,
        role_id: roleId,
        experience_level: state.experience,
      });
      await syncFromBackend();
    } catch (err) {
      console.warn("Could not persist role selection to backend:", err);
    }
  }, [state.learnerName, state.experience, syncFromBackend]);

  const setLearner = useCallback(async (learnerName: string, currentRole: string, experience: string) => {
    setState((s) => ({ ...s, learnerName, currentRole, experience }));
    try {
      if (state.roleId) {
        await api.createOrUpdateProfile({
          user_id: "demo-user-001",
          name: learnerName,
          role_id: state.roleId,
          experience_level: experience,
        });
      }
    } catch (err) {
      console.warn("Could not persist learner profile to backend:", err);
    }
  }, [state.roleId]);

  const submitDiagnostic = useCallback(async (answers: Record<string, any>, assessmentId?: string) => {
    const aid = assessmentId || state.activeAssessmentId;
    let scoredFromBackend = false;

    if (aid) {
      try {
        const formattedAnswers = Object.entries(answers).map(([qid, opt]) => ({
          question_id: qid,
          selected_option: typeof opt === "number" ? ["A", "B", "C", "D"][opt] || "A" : String(opt),
          time_taken_seconds: 45,
        }));

        const result = await api.submitAssessment(aid, "demo-user-001", formattedAnswers);
        if (result && result.competencies) {
          const newScores: Record<string, number> = {};
          result.competencies.forEach((c) => {
            newScores[c.competency_id] = c.score;
          });

          setState((s) => ({
            ...s,
            diagnosticAnswers: answers,
            diagnosticDone: true,
            currentScores: newScores,
          }));
          scoredFromBackend = true;
          await syncFromBackend();
        }
      } catch (err) {
        console.warn("Failed to submit assessment to backend, falling back to local computation:", err);
      }
    }

    if (!scoredFromBackend) {
      // Graceful fallback to maintain UI progress
      setState((s) => ({
        ...s,
        diagnosticAnswers: answers,
        diagnosticDone: true,
        currentScores: {
          "22222222-2222-2222-2222-222222222101": 34,
          "22222222-2222-2222-2222-222222222102": 62,
          "22222222-2222-2222-2222-222222222103": 48,
          "22222222-2222-2222-2222-222222222104": 50,
          "python": 34,
          "sampling": 62,
          "visualization": 48,
          "sql": 71,
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
      }));
    }
  }, [state.activeAssessmentId, syncFromBackend]);

  const submitTargeted = useCallback(async (answers: Record<string, any>, assessmentId?: string) => {
    const aid = assessmentId || state.activeAssessmentId;
    let scoredFromBackend = false;

    if (aid) {
      try {
        const formattedAnswers = Object.entries(answers).map(([qid, opt]) => ({
          question_id: qid,
          selected_option: typeof opt === "number" ? ["A", "B", "C", "D"][opt] || "A" : String(opt),
          time_taken_seconds: 30,
        }));

        const result = await api.submitAssessment(aid, "demo-user-001", formattedAnswers);
        if (result && result.competencies) {
          const newScores = { ...state.currentScores };
          let targetedScore = 72;
          result.competencies.forEach((c) => {
            newScores[c.competency_id] = c.score;
            targetedScore = Math.round(c.score);
          });

          setState((s) => ({
            ...s,
            targetedAnswers: answers,
            targetedDone: true,
            pythonAfter: targetedScore,
            currentScores: newScores,
          }));
          scoredFromBackend = true;
          await syncFromBackend();
        }
      } catch (err) {
        console.warn("Failed to submit targeted reassessment to backend:", err);
      }
    }

    if (!scoredFromBackend) {
      const after = 72;
      setState((s) => ({
        ...s,
        targetedAnswers: answers,
        targetedDone: true,
        pythonAfter: after,
        currentScores: {
          ...s.currentScores,
          "22222222-2222-2222-2222-222222222101": after,
          "python": after,
        },
        assessmentHistory: [
          ...s.assessmentHistory,
          {
            id: "target-1",
            label: "Targeted Reassessment: SQL & Data Handling",
            date: "Today, 11:45 AM",
            pythonScore: after,
            delta: "+38 pts",
            evidenceCount: 6,
          },
        ],
      }));
    }
  }, [state.activeAssessmentId, state.currentScores, syncFromBackend]);

  const setLearningProgress = useCallback(async (moduleId: string, pct: number) => {
    setState((s) => ({
      ...s,
      learningProgress: { ...s.learningProgress, [moduleId]: pct },
    }));
    try {
      const status = pct >= 100 ? "COMPLETED" : "IN_PROGRESS";
      await api.updateLearningProgress("demo-user-001", moduleId, status);
    } catch {
      // ignore
    }
  }, []);

  const completeLearning = useCallback(async () => {
    setState((s) => ({
      ...s,
      learningCompleted: true,
      learningProgress: { ...s.learningProgress, m1: 100, m2: 100, m3: 40 },
    }));
  }, []);

  const loadDemoBaseline = useCallback(async () => {
    try {
      await api.seedDemoProfile("baseline", "demo-user-001");
      await syncFromBackend();
    } catch (err) {
      console.warn("Could not seed baseline via backend, using fallback:", err);
    }
    setState((s) => ({
      ...s,
      roleId: "11111111-1111-1111-1111-111111111101",
      diagnosticDone: true,
      pythonBefore: 34,
      pythonAfter: null,
      targetedDone: false,
      learningCompleted: false,
      learningProgress: { m1: 100, m2: 25 },
      currentScores: {
        "22222222-2222-2222-2222-222222222101": 34,
        "22222222-2222-2222-2222-222222222102": 62,
        "22222222-2222-2222-2222-222222222103": 48,
        "22222222-2222-2222-2222-222222222104": 50,
        "22222222-2222-2222-2222-222222222105": 38,
        "22222222-2222-2222-2222-222222222106": 42,
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
    }));
  }, [syncFromBackend]);

  const loadPostReassessmentState = useCallback(async () => {
    try {
      await api.seedDemoProfile("reassessed", "demo-user-001");
      await syncFromBackend();
    } catch (err) {
      console.warn("Could not seed reassessed via backend, using fallback:", err);
    }
    setState((s) => ({
      ...s,
      roleId: "11111111-1111-1111-1111-111111111101",
      diagnosticDone: true,
      pythonBefore: 34,
      pythonAfter: 72,
      targetedDone: true,
      learningCompleted: true,
      learningProgress: { m1: 100, m2: 100, m3: 50 },
      currentScores: {
        "22222222-2222-2222-2222-222222222101": 72,
        "22222222-2222-2222-2222-222222222102": 62,
        "22222222-2222-2222-2222-222222222103": 48,
        "22222222-2222-2222-2222-222222222104": 50,
        "22222222-2222-2222-2222-222222222105": 38,
        "22222222-2222-2222-2222-222222222106": 42,
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
          label: "Targeted Reassessment: SQL & Data Modeling",
          date: "Today, 11:45 AM",
          pythonScore: 72,
          delta: "+38 pts",
          evidenceCount: 6,
        },
      ],
    }));
  }, [syncFromBackend]);

  const reset = useCallback(async () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("skillcompass_state_v3");
    }
    setState(initialState);
    try {
      await api.createOrUpdateProfile({
        user_id: "demo-user-001",
        name: "A. Sharma",
        role_id: "11111111-1111-1111-1111-111111111101",
        experience_level: "3 years",
      });
      await syncFromBackend();
    } catch {
      // ignore
    }
  }, [syncFromBackend]);

  const setActiveAssessmentId = useCallback((id: string) => {
    setState((s) => ({ ...s, activeAssessmentId: id }));
  }, []);

  const resetDiagnostic = useCallback(() => {
    setState((s) => ({
      ...s,
      diagnosticDone: false,
      targetedDone: false,
      diagnosticAnswers: {},
      currentScores: {},
    }));
  }, []);

  const apiValue = useMemo<PrototypeApi>(() => {
    const role = dbRoles.find((r) => r.id === (state.roleId ?? "11111111-1111-1111-1111-111111111101")) ?? dbRoles[0];

    const scores: CompetencyScore[] = (role.requirements ?? []).map((req) => {
      let currentVal = state.currentScores[req.competencyId];
      if (currentVal == null) {
        if (state.diagnosticDone) {
          currentVal = 50;
        } else {
          currentVal = 0;
        }
      }
      const compInfo = competencyById(req.competencyId);
      return {
        competencyId: req.competencyId,
        name: compInfo?.name ?? req.competencyId,
        required: req.required,
        priority: req.priority,
        current: currentVal,
        gap: Math.max(0, req.required - currentVal),
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
      availableRoles: dbRoles,
      scores,
      biggestGap,
      setLearner,
      selectRole,
      submitDiagnostic,
      setLearningProgress,
      completeLearning,
      submitTargeted,
      loadDemoBaseline,
      loadPostReassessmentState,
      reset,
      setActiveAssessmentId,
      syncFromBackend,
      resetDiagnostic,
    };
  }, [
    state,
    dbRoles,
    setLearner,
    selectRole,
    submitDiagnostic,
    setLearningProgress,
    completeLearning,
    submitTargeted,
    loadDemoBaseline,
    loadPostReassessmentState,
    reset,
    setActiveAssessmentId,
    syncFromBackend,
    resetDiagnostic,
  ]);

  return (
    <PrototypeContext.Provider value={apiValue}>
      {children}
    </PrototypeContext.Provider>
  );
}

export function usePrototype(): PrototypeApi {
  const ctx = useContext(PrototypeContext);
  if (!ctx) throw new Error("usePrototype must be used within PrototypeProvider");
  return ctx;
}

export const targetedQuestionCount = targetedQuestions.length;

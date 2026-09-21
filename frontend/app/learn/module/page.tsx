"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  CheckCircle2,
  BookOpen,
  Code,
  ArrowRight,
  Lightbulb,
  Cpu,
  Star,
  Shield,
  Layers,
} from "lucide-react";
import { Shell } from "@/components/Shell";
import { ProgressBar } from "@/components/ui";
import { usePrototype } from "@/context/PrototypeContext";
import { api, type ResourceModuleDetail } from "@/lib/api";
import { competencyById } from "@/data/roles";

interface FallbackLesson {
  title: string;
  competencyTitle: string;
  difficulty: string;
  objective: string;
  explanation: string;
  codeSnippet: string;
  keyTakeaway: string;
  concepts: string[];
}

function getRoleFallbackLesson(roleId?: string): FallbackLesson {
  if (roleId === "11111111-1111-1111-1111-111111111102") {
    // Cybersecurity Analyst / Engineer
    return {
      competencyTitle: "Network & OS Fundamentals",
      title: "TCP/IP Protocol Handshake & State Inspection",
      difficulty: "Intermediate",
      objective: "Analyze TCP flag sequences (SYN, SYN-ACK, ACK), state transitions, and connection teardown procedures in security operations.",
      explanation: "Transmission Control Protocol (TCP) provides reliable, ordered transmission via a 3-way handshake. Understanding TCP flags (SYN, ACK, FIN, RST, PSH, URG) is foundational for network forensics, firewall state table management, and detecting SYN flood denial-of-service attacks.",
      codeSnippet: `# Wireshark/tshark packet dissection for SYN flood detection
tshark -i eth0 -f "tcp[tcpflags] & (tcp-syn) != 0 and tcp[tcpflags] & (tcp-ack) == 0" \\
  -T fields -e ip.src -e tcp.srcport -e ip.dst -e tcp.dstport | \\
  awk '{print $1}' | sort | uniq -c | sort -nr | head -n 10`,
      keyTakeaway: "Unacknowledged SYN packets allocate state memory in operating system backlogs. Hardening requires TCP SYN cookies (net.ipv4.tcp_syncookies = 1) and aggressive half-open connection timeouts.",
      concepts: [
        "TCP 3-Way Handshake & State Machine",
        "TCP Flags & Header Structure",
        "SYN Flood & DoS Mitigation",
        "Stateful Packet Inspection (SPI) Rules",
      ],
    };
  } else if (roleId === "11111111-1111-1111-1111-111111111103") {
    // Network Engineer
    return {
      competencyTitle: "Routing & Switching Fundamentals",
      title: "OSPF Link-State Routing & Neighbor Adjacency",
      difficulty: "Intermediate",
      objective: "Trace OSPF neighbor discovery, Link-State Advertisement (LSA) flooding, and Shortest Path First (SPF) Dijkstra tree convergence.",
      explanation: "Open Shortest Path First (OSPF) is an Interior Gateway Protocol (IGP) utilizing Dijkstra's algorithm. Neighbor establishment proceeds through seven sequential states: Down -> Init -> 2-Way -> ExStart -> Exchange -> Loading -> Full.",
      codeSnippet: `! Cisco IOS Enterprise OSPF Area 0 Configuration
router ospf 1
 router-id 10.0.0.1
 network 10.0.10.0 0.0.0.255 area 0
 network 10.0.20.0 0.0.0.255 area 0
 passive-interface GigabitEthernet0/0
! Verify state convergence
# show ip ospf neighbor
# show ip route ospf`,
      keyTakeaway: "Routers must match Area ID, subnet mask, Hello (10s) and Dead (40s) timers, and MTU before transitioning to FULL adjacency.",
      concepts: [
        "OSPF Neighbor Adjacency States",
        "LSA Types 1-5 Flooding Scenarios",
        "Dijkstra SPF Metric Calculation",
        "Passive Interface Optimization",
      ],
    };
  }

  // Default: Data Engineer
  return {
    competencyTitle: "SQL & Data Modeling",
    title: "Analytical Window Functions & Partition Framing",
    difficulty: "Intermediate",
    objective: "Master window partition boundaries, cumulative metrics, and ranking algorithms over distributed analytical tables.",
    explanation: "SQL window functions compute aggregate and ranking values across related rows without collapsing rows into a single output group. Utilizing PARTITION BY, ORDER BY, and precise window frames (e.g. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) enables rolling time-series calculations.",
    codeSnippet: `-- Analytical Cumulative & Rolling 7-Day Average
SELECT 
    sensor_id,
    reading_timestamp,
    metric_val,
    AVG(metric_val) OVER (
        PARTITION BY sensor_id 
        ORDER BY reading_timestamp
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) as rolling_7d_avg,
    DENSE_RANK() OVER (
        PARTITION BY sensor_id 
        ORDER BY metric_val DESC
    ) as value_rank
FROM enterprise_iot_telemetry;`,
    keyTakeaway: "DENSE_RANK() avoids gaps in ranking numbers after duplicate ties. Specifying EXCLUDE CURRENT ROW or unbounded preceding controls exact memory aggregation boundaries during execution plan processing.",
    concepts: [
      "Window Partitioning (PARTITION BY)",
      "Frame Clauses (ROWS vs RANGE)",
      "Ranking: ROW_NUMBER vs RANK vs DENSE_RANK",
      "Query Plan EXPLAIN ANALYZE Optimization",
    ],
  };
}

function ModuleViewerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resourceId = searchParams.get("resource_id");
  const competencyIdParam = searchParams.get("competency_id");

  const {
    role,
    learningProgress,
    setLearningProgress,
    completeLearning,
  } = usePrototype();

  const fallbackLesson = getRoleFallbackLesson(role?.id);
  const [liveDetail, setLiveDetail] = useState<ResourceModuleDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeChunkIndex, setActiveChunkIndex] = useState(0);
  const [pct, setPct] = useState(25);
  const [userRating, setUserRating] = useState<number>(4);

  useEffect(() => {
    let isMounted = true;
    async function initModule() {
      setLoading(true);
      try {
        let targetResId = resourceId;

        // If no explicit resourceId, discover from learning path for the user's role!
        if (!targetResId) {
          const pathRes = await api.getLearningPath("demo-user-001");
          const paths = pathRes.paths ?? pathRes.modules ?? [];
          if (paths.length > 0) {
            let matchedPath = paths[0];
            if (competencyIdParam) {
              matchedPath = paths.find((p) => p.competency_id === competencyIdParam) ?? paths[0];
            }
            if (matchedPath && matchedPath.resources && matchedPath.resources.length > 0) {
              const resObj = matchedPath.resources[0];
              targetResId = resObj.id || resObj.resource_id || null;
            }
          }
        }

        if (targetResId) {
          const detail = await api.getResourceModule(targetResId, "demo-user-001");
          if (isMounted && detail) {
            setLiveDetail(detail);
            if (detail.status === "COMPLETED") {
              setPct(100);
            }
          }
        }
      } catch (err) {
        console.warn("Could not load backend resource module:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initModule();

    return () => {
      isMounted = false;
    };
  }, [resourceId, competencyIdParam, role?.id]);

  const continueLearning = async () => {
    const next = Math.min(100, pct + 25);
    setPct(next);

    const activeCompId = liveDetail?.competency_id || role?.requirements?.[0]?.competencyId || "comp-1";
    setLearningProgress(activeCompId, next);

    const totalItems = (liveDetail?.chunks && liveDetail.chunks.length > 0)
      ? liveDetail.chunks.length
      : 3;

    if (activeChunkIndex < totalItems - 1) {
      setActiveChunkIndex(activeChunkIndex + 1);
    }
    if (next >= 100) {
      completeLearning();
      const effectiveResId = liveDetail?.resource_id || resourceId;
      if (effectiveResId) {
        try {
          await api.updateLearningProgress("demo-user-001", effectiveResId, "COMPLETED", userRating);
        } catch (e) {
          console.warn("Failed to update progress on backend:", e);
        }
      }
    }
  };

  const handleFinishAndReassess = async () => {
    setPct(100);
    completeLearning();
    const effectiveResId = liveDetail?.resource_id || resourceId;
    if (effectiveResId) {
      try {
        await api.updateLearningProgress("demo-user-001", effectiveResId, "COMPLETED", userRating);
      } catch (e) {
        console.warn("Failed to record completed state on backend:", e);
      }
    }
    const targetComp = liveDetail?.competency_id || competencyIdParam || "";
    router.push(targetComp ? `/reassess?competency_id=${encodeURIComponent(targetComp)}` : "/reassess");
  };

  if (loading) {
    return (
      <div className="card p-12 text-center max-w-md mx-auto space-y-4 shadow-card">
        <Cpu className="h-8 w-8 text-brand-600 animate-spin mx-auto" />
        <h3 className="text-base font-bold text-ink-900">Loading Learning Chunks…</h3>
        <p className="text-xs text-ink-500">Fetching technical documentation and grounding content for {role?.title ?? "your role"}.</p>
      </div>
    );
  }

  // Determine active item content
  const hasLiveChunks = liveDetail && liveDetail.chunks && liveDetail.chunks.length > 0;
  const currentChunk = hasLiveChunks ? liveDetail.chunks[activeChunkIndex] : null;

  const title = liveDetail?.title ?? fallbackLesson.title;
  const difficulty = liveDetail?.difficulty ?? fallbackLesson.difficulty;
  const competencyTitle = liveDetail?.competency_name ?? fallbackLesson.competencyTitle;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {/* Main Lesson Content */}
      <div className="space-y-6">
        <div className="card p-6 sm:p-8 border-ink-200 bg-white shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-100 pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-md bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-800">
                  {competencyTitle}
                </span>
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900 border border-amber-200">
                  {difficulty}
                </span>
                <span className="rounded-md bg-white px-2 py-0.5 text-xs font-bold text-ink-700 border border-ink-200">
                  Role: {role?.title ?? "Selected Role"}
                </span>
                {hasLiveChunks && (
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                    Live Vector Chunks
                  </span>
                )}
              </div>
              <h2 className="mt-2 text-xl sm:text-2xl font-black text-ink-900">
                {title}
              </h2>
            </div>

            <div className="text-right">
              <span className="text-xs text-ink-500 font-medium">Progress</span>
              <p className="text-lg font-black text-brand-700 tabular-nums">{pct}%</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <ProgressBar value={pct} color="bg-brand-600" height="h-2.5" />
          </div>

          {/* Chunk / Lesson Selector Tabs */}
          <div className="mt-6 flex flex-wrap gap-2 border-b border-ink-100 pb-3">
            {hasLiveChunks ? (
              liveDetail.chunks.map((ch, idx) => {
                const isActive = activeChunkIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveChunkIndex(idx)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      isActive
                        ? "bg-brand-600 text-white shadow-xs"
                        : "bg-ink-50 text-ink-600 hover:bg-ink-100 border border-ink-200"
                    }`}
                  >
                    <span>Chunk {idx + 1}</span>
                    {pct >= ((idx + 1) / liveDetail.chunks.length) * 100 && (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                );
              })
            ) : (
              ["Core Principles", "Production Architecture", "Verification Protocol"].map((step, idx) => {
                const isActive = activeChunkIndex === idx;
                const isUnlocked = pct >= (idx + 1) * 33;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveChunkIndex(idx)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      isActive
                        ? "bg-brand-600 text-white shadow-xs"
                        : isUnlocked
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-ink-50 text-ink-600 hover:bg-ink-100 border border-ink-200"
                    }`}
                  >
                    <span>{step}</span>
                    {isUnlocked && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Active Lesson or Chunk Display */}
          <div className="mt-6 space-y-5 animate-fade-up">
            {hasLiveChunks && currentChunk ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-ink-900">
                    {currentChunk.topic_subtopic}
                  </h3>
                  <p className="mt-1 text-xs text-brand-700 font-semibold">
                    Chunk Index: #{currentChunk.chunk_index} · Authoritative Remediation Unit
                  </p>
                </div>

                <div className="rounded-xl border border-ink-200 bg-ink-50/50 p-5 text-sm leading-relaxed text-ink-800 whitespace-pre-line font-sans">
                  {currentChunk.chunk_text}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-ink-900">
                    {fallbackLesson.title}
                  </h3>
                  <p className="mt-1 text-xs text-brand-700 font-semibold">
                    Objective: {fallbackLesson.objective}
                  </p>
                </div>

                <div className="text-sm leading-relaxed text-ink-700 space-y-3">
                  <p>{fallbackLesson.explanation}</p>
                </div>

                {/* Code Snippet Box */}
                {fallbackLesson.codeSnippet && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1.5">
                        <Code className="h-3.5 w-3.5 text-brand-400" /> production_spec
                      </span>
                      <span>{competencyTitle}</span>
                    </div>
                    <pre className="mt-3 overflow-x-auto font-mono text-xs text-emerald-400 leading-relaxed">
                      <code>{fallbackLesson.codeSnippet}</code>
                    </pre>
                  </div>
                )}

                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-950">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <strong className="font-bold text-amber-900">
                        Methodological Takeaway:
                      </strong>{" "}
                      {fallbackLesson.keyTakeaway}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-ink-100 pt-6">
            <button
              onClick={continueLearning}
              className="btn-secondary text-xs font-bold"
            >
              {pct >= 100 ? "All Chunks Reviewed (100%)" : "Complete & Read Next"}
            </button>

            <button
              onClick={handleFinishAndReassess}
              className="btn-primary text-xs font-bold shadow-md shadow-brand-600/20 inline-flex items-center gap-1.5"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              Complete & Trigger Reassessment <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Lesson Sidebar */}
      <aside className="space-y-4">
        <div className="card p-5 border-ink-200 bg-white shadow-card">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500">
            Self-Confidence Rating
          </h3>
          <p className="mt-1 text-xs text-ink-600">
            Rate your understanding of this material:
          </p>
          <div className="mt-3 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setUserRating(star)}
                className="p-1 text-amber-400 hover:scale-110 transition"
              >
                <Star
                  className={`h-5 w-5 ${
                    star <= userRating ? "fill-amber-400" : "text-ink-200"
                  }`}
                />
              </button>
            ))}
            <span className="text-xs font-bold text-ink-700 ml-1">{userRating}/5</span>
          </div>
        </div>

        <div className="card p-5 border-ink-200 bg-white shadow-card">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500">
            Key Competency Focus
          </h3>
          <ul className="mt-3 space-y-2.5">
            {fallbackLesson.concepts.map((c, i) => (
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
            Reassessment Threshold
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-brand-800">
            Studying 3 materials unlocks the targeted reassessment engine for <strong>{competencyTitle}</strong>.
          </p>
          <div className="mt-3 pt-3 border-t border-brand-200/60 text-[11px] text-brand-700">
            <span className="font-bold">Target Benchmark:</span> ≥ 75% passing score.
          </div>
        </div>

        <Link href="/learning" className="btn-secondary w-full text-xs font-medium text-center">
          Back to Learning Roadmap
        </Link>
      </aside>
    </div>
  );
}

export default function ModuleViewerPage() {
  return (
    <Shell
      title="Interactive Learning Material Viewer"
      breadcrumb={["Roadmap", "Material Viewer"]}
    >
      <Suspense fallback={<div className="p-8 text-center text-sm text-ink-500">Loading module…</div>}>
        <ModuleViewerContent />
      </Suspense>
    </Shell>
  );
}

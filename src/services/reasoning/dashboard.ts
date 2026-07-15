// src/services/reasoning/dashboard.ts
//
// Thin orchestrator for dashboard-level reasoning consumption.
// Loads a full reasoning snapshot and shapes it for the dashboard UI.
// No reasoning logic lives here — we only call getProjectReasoning().

import type { ServiceResult } from "@/types/service";
import { getProjectReasoning, type FullReasoningSnapshot } from "./index";
import type { ReasoningInsight, ThreadProgress } from "@/domain/reasoning";

export interface DashboardSummary {
  continueHere: string | null;
  attentionAreas: string[];
  healthScore: number;
  healthConfidence: number;
  healthLabel: string;
  overallProgress: number;
  threadCount: number;
  blockerCount: number;
  criticalInsights: ReasoningInsight[];
  positiveInsights: ReasoningInsight[];
  topThreads: ThreadProgress[];
}

function healthLabel(score: number, maxScore: number): string {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  if (pct >= 80) return "Excellent";
  if (pct >= 60) return "Good";
  if (pct >= 40) return "Fair";
  if (pct >= 20) return "Needs Attention";
  return "Critical";
}

export async function buildDashboard(
  projectId: string
): Promise<ServiceResult<DashboardSummary>> {
  const res = await getProjectReasoning(projectId);
  if (res.error || !res.data) {
    return { data: null, error: res.error ?? "Failed to build dashboard" };
  }
  const snap = res.data;

  const maxScore = snap.health.metrics.reduce((s, m) => s + m.maxScore, 0);

  const criticalInsights = snap.reasoning.insights.filter(
    (i) => i.severity === "critical" || i.severity === "warning"
  );
  const positiveInsights = snap.reasoning.insights.filter(
    (i) => i.severity === "positive"
  );

  const topThreads = [...snap.progress.threadProgress]
    .sort((a, b) => b.completionPercentage - a.completionPercentage)
    .slice(0, 3);

  return {
    data: {
      continueHere: snap.reasoning.continueHere,
      attentionAreas: snap.reasoning.attentionAreas,
      healthScore: snap.health.overallScore,
      healthConfidence: snap.health.confidence,
      healthLabel: healthLabel(snap.health.overallScore, maxScore),
      overallProgress: snap.progress.overallPercentage,
      threadCount: snap.threads.length,
      blockerCount: snap.dependencies.blockers.length,
      criticalInsights,
      positiveInsights,
      topThreads,
    },
    error: null,
  };
}

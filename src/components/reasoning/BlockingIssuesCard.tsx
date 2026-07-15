// src/components/reasoning/BlockingIssuesCard.tsx
"use client";

import { AlertTriangle, ShieldAlert } from "lucide-react";
import type { ReasoningInsight } from "@/domain/reasoning";

interface BlockingIssuesCardProps {
  insights: ReasoningInsight[];
}

export function BlockingIssuesCard({ insights }: BlockingIssuesCardProps) {
  if (insights.length === 0) return null;

  return (
    <div className="rounded-lg border border-orange-900/40 bg-orange-900/5 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-orange-400" />
        <p className="text-xs uppercase tracking-wide text-orange-400">
          Attention Required
        </p>
      </div>

      <ul className="space-y-3">
        {insights.map((insight) => (
          <li key={insight.id} className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-orange-400 shrink-0" />
              <p className="text-sm font-medium text-[#C8D6E5]">
                {insight.title}
              </p>
            </div>
            <p className="text-xs text-[#8A9BB0] pl-5">{insight.message}</p>
            {insight.evidence.length > 0 && (
              <ul className="pl-5 space-y-0.5">
                {insight.evidence.slice(0, 2).map((e, i) => (
                  <li key={i} className="text-xs text-[#4A5A6A]">
                    · {e.label}: {e.detail}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// src/components/reasoning/ThreadProgressCard.tsx
"use client";

import type { ThreadProgress } from "@/domain/reasoning";

interface ThreadProgressCardProps {
  threads: ThreadProgress[];
  overallProgress: number;
}

function pctColor(pct: number): string {
  if (pct >= 75) return "bg-green-500";
  if (pct >= 40) return "bg-[#C9A84C]";
  return "bg-[#4A5A6A]";
}

export function ThreadProgressCard({
  threads,
  overallProgress,
}: ThreadProgressCardProps) {
  if (threads.length === 0) return null;

  return (
    <div className="rounded-lg border border-[#2A3A52] bg-[#1A2333] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-[#8A9BB0]">
          Narrative Progress
        </p>
        <span className="text-sm font-semibold text-[#F5ECD7]">
          {overallProgress}%
        </span>
      </div>

      <div className="w-full bg-[#0F1623] rounded-full h-1.5 overflow-hidden">
        <div
          className="h-1.5 rounded-full bg-[#C9A84C] transition-all"
          style={{ width: overallProgress + "%" }}
        />
      </div>

      <ul className="space-y-3">
        {threads.map((t) => (
          <li key={t.threadId} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#C8D6E5] truncate">{t.threadTitle}</span>
              <span className="text-[#4A5A6A] ml-2 shrink-0">
                {t.completionPercentage}%
              </span>
            </div>
            <div className="w-full bg-[#0F1623] rounded-full h-1 overflow-hidden">
              <div
                className={"h-1 rounded-full " + pctColor(t.completionPercentage)}
                style={{ width: t.completionPercentage + "%" }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import { Target } from "lucide-react";
import type { GoalProgress } from "@/types/intelligence";

interface GoalProgressPanelProps {
  progress: GoalProgress;
}

export function GoalProgressPanel({ progress }: GoalProgressPanelProps) {
  if (!progress.has_goal) return null;

  return (
    <div className="rounded-lg border border-[#2A3A52] bg-[#1A2333] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-[#C9A84C]" />
          <h3 className="text-sm font-medium text-[#C9A84C]">Goal Progress</h3>
        </div>
        <span className="text-sm font-semibold text-[#F5ECD7]">
          {progress.estimated_percentage}%
        </span>
      </div>

      <div className="w-full bg-[#0F1623] rounded-full h-2 mb-4 overflow-hidden">
        <div
          className="bg-[#C9A84C] h-2 rounded-full transition-all duration-500"
          style={{ width: progress.estimated_percentage + "%" }}
        />
      </div>

      {progress.factors.length > 0 && (
        <ul className="space-y-2">
          {progress.factors.map((factor, i) => (
            <li key={i} className="flex items-center justify-between gap-3 text-xs">
              <span className="text-[#8A9BB0]">{factor.label}</span>
              <span className="text-[#4A5A6A] shrink-0">+{factor.contribution}%</span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-[#4A5A6A] mt-3 pt-3 border-t border-[#2A3A52] italic">
        Estimated from your work. Not a manual value.
      </p>
    </div>
  );
}
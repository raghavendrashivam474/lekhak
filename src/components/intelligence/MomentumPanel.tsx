"use client";

import Link from "next/link";
import { Flame, TrendingUp, TrendingDown, Minus, Waves } from "lucide-react";
import type { MomentumInsight } from "@/types/intelligence";

interface MomentumPanelProps {
  momentum: MomentumInsight;
}

const TREND_META = {
  rising: { icon: TrendingUp, label: "Rising", color: "text-green-400" },
  steady: { icon: Minus, label: "Steady", color: "text-[#C8D6E5]" },
  declining: { icon: TrendingDown, label: "Declining", color: "text-orange-400" },
  silent: { icon: Waves, label: "Quiet", color: "text-[#4A5A6A]" },
};

export function MomentumPanel({ momentum }: MomentumPanelProps) {
  const trend = TREND_META[momentum.trend];
  const TrendIcon = trend.icon;

  return (
    <div className="rounded-lg border border-[#2A3A52] bg-[#1A2333] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-[#C9A84C]" />
          <h3 className="text-sm font-medium text-[#C9A84C]">Writing Momentum</h3>
        </div>
        <div className={"flex items-center gap-1 text-xs " + trend.color}>
          <TrendIcon className="h-3.5 w-3.5" />
          {trend.label}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-lg bg-[#0F1623] border border-[#2A3A52] p-3">
          <p className="text-xs text-[#4A5A6A] mb-1">Streak</p>
          <p className="text-2xl font-semibold text-[#F5ECD7]">
            {momentum.writing_streak_days}
          </p>
          <p className="text-xs text-[#4A5A6A]">day{momentum.writing_streak_days !== 1 ? "s" : ""}</p>
        </div>
        <div className="rounded-lg bg-[#0F1623] border border-[#2A3A52] p-3">
          <p className="text-xs text-[#4A5A6A] mb-1">This Week</p>
          <p className="text-2xl font-semibold text-[#F5ECD7]">
            {momentum.active_this_week}
          </p>
          <p className="text-xs text-[#4A5A6A]">activities</p>
        </div>
        <div className="rounded-lg bg-[#0F1623] border border-[#2A3A52] p-3">
          <p className="text-xs text-[#4A5A6A] mb-1">This Month</p>
          <p className="text-2xl font-semibold text-[#F5ECD7]">
            {momentum.active_this_month}
          </p>
          <p className="text-xs text-[#4A5A6A]">activities</p>
        </div>
      </div>

      {momentum.most_active_project && (
        <div className="border-t border-[#2A3A52] pt-3 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-[#4A5A6A]">Most active project</span>
            <Link
              href={"/projects/" + momentum.most_active_project.id}
              className="text-xs text-[#C9A84C] hover:underline truncate max-w-[200px]"
            >
              {momentum.most_active_project.title}
            </Link>
          </div>
          {momentum.most_active_collection && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-[#4A5A6A]">Most active collection</span>
              <span className="text-xs text-[#C8D6E5]">
                {momentum.most_active_collection}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
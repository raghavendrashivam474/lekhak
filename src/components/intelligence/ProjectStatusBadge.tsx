"use client";

import { Activity, AlertTriangle, Moon, Zap, CheckCircle2, Sparkles } from "lucide-react";
import type { ProjectStatusInsight } from "@/types/intelligence";

interface ProjectStatusBadgeProps {
  insight: ProjectStatusInsight;
}

const STATUS_META: Record<
  ProjectStatusInsight["status"],
  { label: string; color: string; bg: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  healthy: {
    label: "Healthy",
    color: "text-green-400",
    bg: "bg-green-900/10",
    border: "border-green-900/40",
    icon: Activity,
  },
  highly_active: {
    label: "Highly Active",
    color: "text-[#C9A84C]",
    bg: "bg-[#C9A84C]/10",
    border: "border-[#C9A84C]/40",
    icon: Zap,
  },
  needs_attention: {
    label: "Needs Attention",
    color: "text-orange-400",
    bg: "bg-orange-900/10",
    border: "border-orange-900/40",
    icon: AlertTriangle,
  },
  dormant: {
    label: "Dormant",
    color: "text-[#8A9BB0]",
    bg: "bg-[#1A2333]",
    border: "border-[#2A3A52]",
    icon: Moon,
  },
  near_completion: {
    label: "Near Completion",
    color: "text-blue-400",
    bg: "bg-blue-900/10",
    border: "border-blue-900/40",
    icon: CheckCircle2,
  },
  new: {
    label: "New",
    color: "text-[#C8D6E5]",
    bg: "bg-[#1A2333]",
    border: "border-[#2A3A52]",
    icon: Sparkles,
  },
};

export function ProjectStatusBadge({ insight }: ProjectStatusBadgeProps) {
  const meta = STATUS_META[insight.status];
  const Icon = meta.icon;

  return (
    <div className={"rounded-lg border p-4 " + meta.bg + " " + meta.border}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={"h-4 w-4 " + meta.color} />
        <h3 className={"text-sm font-medium " + meta.color}>{meta.label}</h3>
      </div>
      {insight.reasons.length > 0 && (
        <ul className="space-y-1">
          {insight.reasons.map((reason, i) => (
            <li key={i} className="text-xs text-[#8A9BB0]">
              {reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
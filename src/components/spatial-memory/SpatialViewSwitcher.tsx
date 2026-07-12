"use client";

import { Network, Sparkles } from "lucide-react";
import type { MemoryViewMode } from "@/types/spatial";

interface SpatialViewSwitcherProps {
  mode: MemoryViewMode;
  onChange: (mode: MemoryViewMode) => void;
}

export function SpatialViewSwitcher({
  mode,
  onChange,
}: SpatialViewSwitcherProps) {
  return (
    <div className="inline-flex rounded-lg border border-[#2A3A52] bg-[#1A2333] p-0.5">
      <button
        onClick={() => onChange("graph")}
        className={
          "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-colors " +
          (mode === "graph"
            ? "bg-[#C9A84C] text-[#0F1623] font-medium"
            : "text-[#8A9BB0] hover:text-[#F5ECD7]")
        }
        aria-pressed={mode === "graph"}
        aria-label="Graph view"
      >
        <Network className="h-3.5 w-3.5" />
        Graph
      </button>
      <button
        onClick={() => onChange("space")}
        className={
          "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-colors " +
          (mode === "space"
            ? "bg-[#C9A84C] text-[#0F1623] font-medium"
            : "text-[#8A9BB0] hover:text-[#F5ECD7]")
        }
        aria-pressed={mode === "space"}
        aria-label="Space view"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Space
      </button>
    </div>
  );
}
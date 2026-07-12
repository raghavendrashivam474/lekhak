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
    <div
      role="tablist"
      aria-label="Memory view"
      className="inline-flex rounded-lg border border-[#2A3A52] bg-[#1A2333] p-0.5"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === "graph"}
        aria-label="Graph view — structural memory"
        onClick={() => onChange("graph")}
        className={
          "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C9A84C] " +
          (mode === "graph"
            ? "bg-[#C9A84C] text-[#0F1623] font-medium"
            : "text-[#8A9BB0] hover:text-[#F5ECD7]")
        }
      >
        <Network className="h-3.5 w-3.5" aria-hidden="true" />
        Graph
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "space"}
        aria-label="Space view — spatial memory"
        onClick={() => onChange("space")}
        className={
          "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C9A84C] " +
          (mode === "space"
            ? "bg-[#C9A84C] text-[#0F1623] font-medium"
            : "text-[#8A9BB0] hover:text-[#F5ECD7]")
        }
      >
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        Space
      </button>
    </div>
  );
}
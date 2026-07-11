"use client";

import { ChevronRight } from "lucide-react";
import type { GraphNode } from "@/types/graph";

interface MemoryTrailProps {
  trail: string[];
  nodesById: Map<string, GraphNode>;
  onJump: (index: number) => void;
}

export function MemoryTrail({ trail, nodesById, onJump }: MemoryTrailProps) {
  if (trail.length === 0) return null;

  return (
    <div className="flex items-center gap-1 flex-wrap px-4 py-2 border-t border-[#2A3A52] bg-[#0F1623]">
      <span className="text-[10px] uppercase tracking-wide text-[#4A5A6A] mr-2">
        Trail
      </span>
      {trail.map((id, i) => {
        const node = nodesById.get(id);
        if (!node) return null;
        const isLast = i === trail.length - 1;

        return (
          <div key={i} className="flex items-center gap-1">
            <button
              onClick={() => onJump(i)}
              className={
                "text-xs px-2 py-0.5 rounded transition-colors " +
                (isLast
                  ? "text-[#C9A84C]"
                  : "text-[#8A9BB0] hover:text-[#F5ECD7]")
              }
            >
              {node.label}
            </button>
            {!isLast && (
              <ChevronRight className="h-3 w-3 text-[#4A5A6A]" />
            )}
          </div>
        );
      })}
    </div>
  );
}
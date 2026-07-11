"use client";

import type { GraphEntryPoint, GraphEntryPointKind } from "@/types/graph";

interface GraphControlsProps {
  entryPoints: GraphEntryPoint[];
  activeKind: GraphEntryPointKind;
  onChange: (kind: GraphEntryPointKind) => void;
}

export function GraphControls({
  entryPoints,
  activeKind,
  onChange,
}: GraphControlsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {entryPoints.map((entry) => (
        <button
          key={entry.kind}
          onClick={() => onChange(entry.kind)}
          className={
            "text-xs rounded-lg px-3 py-1.5 border transition-colors " +
            (entry.kind === activeKind
              ? "bg-[#C9A84C] text-[#0F1623] border-[#C9A84C] font-medium"
              : "bg-[#1A2333] text-[#8A9BB0] border-[#2A3A52] hover:text-[#F5ECD7]")
          }
        >
          {entry.label}
        </button>
      ))}
    </div>
  );
}
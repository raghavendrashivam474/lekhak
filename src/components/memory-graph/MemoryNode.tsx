"use client";

import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import {
  FolderOpen,
  Layers,
  FileText,
  HelpCircle,
  Tag,
} from "lucide-react";
import type { RFNodeData } from "./adapters/react-flow";

const ICON = {
  project: FolderOpen,
  collection: Layers,
  note: FileText,
  question: HelpCircle,
  knowledge_tag: Tag,
};

export function MemoryNode({ data }: NodeProps) {
  const d = data as unknown as RFNodeData;
  const Icon = ICON[d.entityType];

  const baseBg = d.isSelected
    ? "bg-[#C9A84C]/20"
    : d.isFocused
    ? "bg-[#1A2333]"
    : d.isDimmed
    ? "bg-[#0F1623]/60"
    : "bg-[#1A2333]";

  const baseBorder = d.isSelected
    ? "border-[#C9A84C]"
    : d.isFocused
    ? "border-[#C9A84C]/50"
    : d.state.orphan
    ? "border-orange-900/50"
    : d.state.unresolved
    ? "border-blue-900/50"
    : d.state.suggestedStart
    ? "border-green-900/50"
    : "border-[#2A3A52]";

  const textColor = d.isDimmed ? "text-[#4A5A6A]" : "text-[#F5ECD7]";
  const opacity = d.isDimmed ? "opacity-40" : "opacity-100";

  return (
    <div
      className={
        "rounded-lg border px-3 py-2 transition-all min-w-[120px] max-w-[200px] " +
        baseBg + " " + baseBorder + " " + opacity
      }
    >
      <Handle type="target" position={Position.Top} className="!bg-[#4A5A6A] !border-none" />

      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-3 w-3 text-[#C9A84C] shrink-0" />
        <span className={"text-[10px] uppercase tracking-wide text-[#4A5A6A]"}>
          {d.entityType.replace("_", " ")}
        </span>
      </div>

      <p className={"text-xs font-medium truncate " + textColor}>
        {d.label}
      </p>

      {(d.state.orphan || d.state.unresolved || d.state.suggestedStart) && (
        <div className="flex gap-1 mt-1.5">
          {d.state.suggestedStart && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-900/30 text-green-300">
              start
            </span>
          )}
          {d.state.orphan && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-900/30 text-orange-300">
              orphan
            </span>
          )}
          {d.state.unresolved && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-300">
              open
            </span>
          )}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-[#4A5A6A] !border-none" />
    </div>
  );
}
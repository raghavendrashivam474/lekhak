"use client";

import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import type { GraphNode } from "@/types/graph";

interface MemoryInspectorProps {
  projectId: string;
  node: GraphNode | null;
  onClose: () => void;
}

export function MemoryInspector({
  projectId,
  node,
  onClose,
}: MemoryInspectorProps) {
  if (!node) {
    return (
      <div className="p-5 border-l border-[#2A3A52] bg-[#1A2333] h-full">
        <p className="text-sm text-[#4A5A6A] italic">
          Select a node to inspect its context.
        </p>
      </div>
    );
  }

  const typeLabel = node.entityType.replace("_", " ");
  const openHref = openLinkForEntity(projectId, node);

  return (
    <div className="p-5 border-l border-[#2A3A52] bg-[#1A2333] h-full overflow-y-auto">
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wide text-[#4A5A6A] mb-1">
            {typeLabel}
          </p>
          <h3 className="text-sm font-medium text-[#F5ECD7]">{node.label}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-[#4A5A6A] hover:text-[#F5ECD7] shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3 text-xs">
        {node.metadata.category && (
          <Field label="Category" value={node.metadata.category} />
        )}
        {node.metadata.description && (
          <Field label="Description" value={node.metadata.description} />
        )}
        {typeof node.metadata.noteCount === "number" && (
          <Field label="Notes" value={String(node.metadata.noteCount)} />
        )}
        {typeof node.metadata.usageCount === "number" && (
          <Field label="Used in notes" value={String(node.metadata.usageCount)} />
        )}
        {node.metadata.status && (
          <Field label="Status" value={node.metadata.status} />
        )}
        {node.metadata.lastUpdated && (
          <Field
            label="Last updated"
            value={new Date(node.metadata.lastUpdated).toLocaleString()}
          />
        )}
      </div>

      {(node.state.orphan || node.state.unresolved || node.state.suggestedStart || node.state.dormant) && (
        <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-[#2A3A52]">
          {node.state.suggestedStart && <StateChip label="Suggested start" color="green" />}
          {node.state.orphan && <StateChip label="Orphan" color="orange" />}
          {node.state.unresolved && <StateChip label="Unresolved" color="blue" />}
          {node.state.dormant && <StateChip label="Dormant" color="gray" />}
        </div>
      )}

      {openHref && (
        <Link
          href={openHref}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#C9A84C] px-3 py-2 text-xs font-medium text-[#0F1623] hover:bg-[#D4B86A] transition-colors"
        >
          Open
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-[#4A5A6A] mb-0.5">
        {label}
      </p>
      <p className="text-xs text-[#C8D6E5]">{value}</p>
    </div>
  );
}

function StateChip({ label, color }: { label: string; color: "green" | "orange" | "blue" | "gray" }) {
  const map = {
    green: "bg-green-900/30 text-green-300",
    orange: "bg-orange-900/30 text-orange-300",
    blue: "bg-blue-900/30 text-blue-300",
    gray: "bg-[#0F1623] text-[#8A9BB0]",
  };
  return (
    <span className={"text-[9px] px-2 py-0.5 rounded " + map[color]}>{label}</span>
  );
}

function openLinkForEntity(projectId: string, node: GraphNode): string | null {
  switch (node.entityType) {
    case "project":
      return "/projects/" + node.entityId;
    case "note":
      return "/projects/" + projectId + "/notes/" + node.entityId;
    case "collection":
    case "question":
    case "knowledge_tag":
      return "/projects/" + projectId;
    default:
      return null;
  }
}
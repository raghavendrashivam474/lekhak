"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import type { GraphNodeType, GraphRelationshipType } from "@/types/graph";

interface GraphFiltersProps {
  nodeTypeFilters: Set<GraphNodeType>;
  relationshipFilters: Set<GraphRelationshipType>;
  onToggleNodeType: (t: GraphNodeType) => void;
  onToggleRelationshipType: (t: GraphRelationshipType) => void;
}

const NODE_TYPE_LABELS: Record<GraphNodeType, string> = {
  project: "Projects",
  collection: "Collections",
  note: "Notes",
  question: "Questions",
  knowledge_tag: "Tags",
};

const REL_LABELS: Record<GraphRelationshipType, string> = {
  contains: "Contains",
  belongs_to: "Belongs to",
  related_to: "Related",
  references: "References",
  answers_question: "Answers",
  supports_goal: "Supports goal",
  supports_focus: "Supports focus",
  blocks_next_step: "Blocks next step",
  tagged_with: "Tagged",
};

export function GraphFilters({
  nodeTypeFilters,
  relationshipFilters,
  onToggleNodeType,
  onToggleRelationshipType,
}: GraphFiltersProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-xs rounded-lg bg-[#1A2333] border border-[#2A3A52] px-3 py-1.5 text-[#8A9BB0] hover:text-[#F5ECD7]"
      >
        <Filter className="h-3.5 w-3.5" />
        Filters
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 w-64 rounded-lg border border-[#2A3A52] bg-[#1A2333] p-4 shadow-lg z-10 space-y-4">
          <div>
            <p className="text-xs font-medium text-[#C9A84C] mb-2">Node types</p>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(NODE_TYPE_LABELS) as GraphNodeType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => onToggleNodeType(t)}
                  className={
                    "text-[10px] rounded-full px-2 py-0.5 border transition-colors " +
                    (nodeTypeFilters.has(t)
                      ? "bg-[#C9A84C]/20 border-[#C9A84C] text-[#F5ECD7]"
                      : "bg-transparent border-[#2A3A52] text-[#4A5A6A]")
                  }
                >
                  {NODE_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-[#C9A84C] mb-2">Relationships</p>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(REL_LABELS) as GraphRelationshipType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => onToggleRelationshipType(t)}
                  className={
                    "text-[10px] rounded-full px-2 py-0.5 border transition-colors " +
                    (relationshipFilters.has(t)
                      ? "bg-[#C9A84C]/20 border-[#C9A84C] text-[#F5ECD7]"
                      : "bg-transparent border-[#2A3A52] text-[#4A5A6A]")
                  }
                >
                  {REL_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { Search } from "lucide-react";
import type { GraphNode } from "@/types/graph";

interface GraphSearchProps {
  query: string;
  results: GraphNode[];
  onQueryChange: (q: string) => void;
  onSelectResult: (nodeId: string) => void;
}

export function GraphSearch({
  query,
  results,
  onQueryChange,
  onSelectResult,
}: GraphSearchProps) {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-lg bg-[#1A2333] border border-[#2A3A52] px-3 py-2">
        <Search className="h-3.5 w-3.5 text-[#4A5A6A]" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search memory..."
          className="bg-transparent text-sm text-[#F5ECD7] placeholder:text-[#4A5A6A] focus:outline-none w-48"
        />
      </div>

      {query.length > 0 && results.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-64 max-h-64 overflow-y-auto rounded-lg border border-[#2A3A52] bg-[#1A2333] shadow-lg z-10">
          {results.slice(0, 10).map((r) => (
            <button
              key={r.id}
              onClick={() => {
                onSelectResult(r.id);
                onQueryChange("");
              }}
              className="w-full text-left px-3 py-2 hover:bg-[#0F1623] border-b border-[#2A3A52] last:border-0"
            >
              <p className="text-xs text-[#F5ECD7] truncate">{r.label}</p>
              <p className="text-[10px] text-[#4A5A6A] uppercase">
                {r.entityType.replace("_", " ")}
              </p>
            </button>
          ))}
        </div>
      )}

      {query.length > 0 && results.length === 0 && (
        <div className="absolute top-full left-0 mt-1 w-64 rounded-lg border border-[#2A3A52] bg-[#1A2333] p-3 shadow-lg z-10">
          <p className="text-xs text-[#4A5A6A] italic">No matches.</p>
        </div>
      )}
    </div>
  );
}
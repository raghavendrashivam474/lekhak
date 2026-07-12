"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { searchGraphNodes } from "@/services/graph";
import type { GraphNode, GraphProjection } from "@/types/graph";

interface SpatialSearchProps {
  projection: GraphProjection;
  onSelectResult: (graphNodeId: string) => void;
}

export function SpatialSearch({
  projection,
  onSelectResult,
}: SpatialSearchProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(
    () => searchGraphNodes(projection, query),
    [projection, query]
  );

  return (
    <div className="relative">
      <label
        htmlFor="spatial-search-input"
        className="sr-only"
      >
        Search spatial memory
      </label>
      <div className="flex items-center gap-2 rounded-lg bg-[#1A2333] border border-[#2A3A52] px-3 py-2 focus-within:border-[#C9A84C]">
        <Search className="h-3.5 w-3.5 text-[#4A5A6A]" aria-hidden="true" />
        <input
          id="spatial-search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search memory..."
          className="bg-transparent text-sm text-[#F5ECD7] placeholder:text-[#4A5A6A] focus:outline-none w-48"
          aria-controls="spatial-search-results"
          aria-expanded={query.length > 0}
        />
      </div>

      {query.length > 0 && results.length > 0 && (
        <ul
          id="spatial-search-results"
          role="listbox"
          className="absolute top-full left-0 mt-1 w-64 max-h-64 overflow-y-auto rounded-lg border border-[#2A3A52] bg-[#1A2333] shadow-lg z-10"
        >
          {results.slice(0, 10).map((r: GraphNode) => (
            <li key={r.id}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => {
                  onSelectResult(r.id);
                  setQuery("");
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#0F1623] border-b border-[#2A3A52] last:border-0 focus-visible:bg-[#0F1623] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#C9A84C]"
              >
                <p className="text-xs text-[#F5ECD7] truncate">{r.label}</p>
                <p className="text-[10px] text-[#4A5A6A] uppercase">
                  {r.entityType.replace("_", " ")}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {query.length > 0 && results.length === 0 && (
        <div
          id="spatial-search-results"
          role="status"
          className="absolute top-full left-0 mt-1 w-64 rounded-lg border border-[#2A3A52] bg-[#1A2333] p-3 shadow-lg z-10"
        >
          <p className="text-xs text-[#4A5A6A] italic">No matches.</p>
        </div>
      )}
    </div>
  );
}
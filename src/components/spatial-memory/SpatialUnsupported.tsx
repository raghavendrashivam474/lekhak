"use client";

import { AlertTriangle } from "lucide-react";

interface SpatialUnsupportedProps {
  reason?: string;
  onFallbackToGraph: () => void;
}

export function SpatialUnsupported({
  reason,
  onFallbackToGraph,
}: SpatialUnsupportedProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <AlertTriangle className="h-10 w-10 text-orange-400 mb-4" />
      <h3 className="text-lg font-medium text-[#F5ECD7] mb-1">
        Memory Space is unavailable
      </h3>
      <p className="text-[#8A9BB0] text-sm max-w-sm mb-2">
        {reason ??
          "Your browser cannot render 3D memory right now. Try Memory Graph instead."}
      </p>
      <button
        onClick={onFallbackToGraph}
        className="mt-4 inline-flex items-center rounded-lg bg-[#C9A84C] px-4 py-2 text-sm font-medium text-[#0F1623] hover:bg-[#D4B86A] transition-colors"
      >
        Use Memory Graph
      </button>
    </div>
  );
}
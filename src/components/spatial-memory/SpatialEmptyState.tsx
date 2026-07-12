"use client";

import { Sparkles } from "lucide-react";

export function SpatialEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <Sparkles className="h-10 w-10 text-[#4A5A6A] mb-4" />
      <h3 className="text-lg font-medium text-[#F5ECD7] mb-1">
        Your memory space is still quiet
      </h3>
      <p className="text-[#8A9BB0] text-sm max-w-sm">
        Add notes, ideas, and connections to begin shaping it.
      </p>
    </div>
  );
}
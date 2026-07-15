// src/components/reasoning/AttentionCard.tsx
"use client";

import { Eye } from "lucide-react";

interface AttentionCardProps {
  areas: string[];
}

export function AttentionCard({ areas }: AttentionCardProps) {
  if (areas.length === 0) return null;

  return (
    <div className="rounded-lg border border-[#2A3A52] bg-[#1A2333] p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4 text-[#8A9BB0]" />
        <p className="text-xs uppercase tracking-wide text-[#8A9BB0]">
          Areas to Watch
        </p>
      </div>
      <ul className="space-y-1.5">
        {areas.map((area, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-[#8A9BB0]">
            <span className="text-[#4A5A6A] shrink-0">·</span>
            {area}
          </li>
        ))}
      </ul>
    </div>
  );
}

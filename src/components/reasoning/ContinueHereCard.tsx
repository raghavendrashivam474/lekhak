// src/components/reasoning/ContinueHereCard.tsx
"use client";

import { ArrowRight, Sparkles } from "lucide-react";

interface ContinueHereCardProps {
  continueHere: string | null;
}

export function ContinueHereCard({ continueHere }: ContinueHereCardProps) {
  if (!continueHere) return null;

  return (
    <div className="rounded-lg border border-[#C9A84C]/40 bg-[#C9A84C]/5 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-[#C9A84C]" />
        <p className="text-xs uppercase tracking-wide text-[#C9A84C]">
          Continue Here
        </p>
      </div>
      <div className="flex items-start gap-3">
        <ArrowRight className="h-4 w-4 text-[#C9A84C] mt-0.5 shrink-0" />
        <p className="text-sm text-[#F5ECD7] leading-relaxed">{continueHere}</p>
      </div>
    </div>
  );
}

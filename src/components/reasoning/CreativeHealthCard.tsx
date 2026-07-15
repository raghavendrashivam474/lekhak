// src/components/reasoning/CreativeHealthCard.tsx
"use client";

import type { CreativeHealth } from "@/domain/reasoning";

interface CreativeHealthCardProps {
  health: CreativeHealth;
  label: string;
}

function scoreColor(pct: number): string {
  if (pct >= 80) return "text-green-400";
  if (pct >= 60) return "text-[#C9A84C]";
  if (pct >= 40) return "text-orange-400";
  return "text-rose-400";
}

function barColor(pct: number): string {
  if (pct >= 80) return "bg-green-500";
  if (pct >= 60) return "bg-[#C9A84C]";
  if (pct >= 40) return "bg-orange-400";
  return "bg-rose-500";
}

export function CreativeHealthCard({ health, label }: CreativeHealthCardProps) {
  const maxScore = health.metrics.reduce((s, m) => s + m.maxScore, 0);
  const pct = maxScore > 0 ? Math.round((health.overallScore / maxScore) * 100) : 0;

  return (
    <div className="rounded-lg border border-[#2A3A52] bg-[#1A2333] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-[#8A9BB0]">
          Creative Health
        </p>
        <span className={"text-lg font-semibold " + scoreColor(pct)}>
          {label}
        </span>
      </div>

      <div className="w-full bg-[#0F1623] rounded-full h-1.5 overflow-hidden">
        <div
          className={"h-1.5 rounded-full transition-all " + barColor(pct)}
          style={{ width: pct + "%" }}
        />
      </div>

      <ul className="space-y-2">
        {health.metrics.map((m, i) => {
          const metricPct = m.maxScore > 0 ? Math.round((m.score / m.maxScore) * 100) : 0;
          return (
            <li key={i} className="flex items-center justify-between gap-3 text-xs">
              <span className="text-[#8A9BB0]">{m.label}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-[#0F1623] rounded-full h-1 overflow-hidden">
                  <div
                    className={"h-1 rounded-full " + barColor(metricPct)}
                    style={{ width: metricPct + "%" }}
                  />
                </div>
                <span className="text-[#4A5A6A] w-8 text-right">
                  {m.score}/{m.maxScore}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-[#4A5A6A]">
        Confidence: {Math.round(health.confidence * 100)}%
      </p>
    </div>
  );
}

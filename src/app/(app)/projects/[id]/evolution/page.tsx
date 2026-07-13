// src/app/(app)/projects/[id]/evolution/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getProjectEvolutionTimeline,
  type EvolutionSnapshot,
} from "@/services/temporal/timeline";
import { reconstructProjectSnapshot } from "@/services/temporal/reconstruction";
import type {
  TemporalSnapshot,
  EvolutionTimelineItem,
} from "@/domain/temporal";

// Deterministic date formatter (SSR-safe).
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
function formatDate(iso: string): string {
  const d = new Date(iso);
  return MONTHS[d.getUTCMonth()] + " " + d.getUTCDate() + ", " + d.getUTCFullYear();
}

function itemColor(item: EvolutionTimelineItem): string {
  switch (item.type) {
    case "project_began":
      return "text-emerald-400";
    case "turning_point":
      return "text-amber-400";
    case "goal_changed":
    case "focus_shifted":
    case "next_step_changed":
      return "text-sky-400";
    case "question_raised":
      return "text-violet-400";
    default:
      return "text-slate-300";
  }
}

export default function EvolutionPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const [snapshot, setSnapshot] = useState<EvolutionSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedAt, setSelectedAt] = useState<string | null>(null);
  const [historic, setHistoric] = useState<TemporalSnapshot | null>(null);
  const [historicLoading, setHistoricLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProjectEvolutionTimeline(projectId).then((res) => {
      if (cancelled) return;
      if (res.error || !res.data) {
        setError(res.error ?? "Failed to load evolution");
      } else {
        setSnapshot(res.data);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  useEffect(() => {
    if (!selectedAt) {
      setHistoric(null);
      return;
    }
    let cancelled = false;
    setHistoricLoading(true);
    reconstructProjectSnapshot(projectId, new Date(selectedAt)).then((res) => {
      if (cancelled) return;
      if (res.data) setHistoric(res.data);
      setHistoricLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [projectId, selectedAt]);

  return (
    <main className="max-w-5xl mx-auto p-8 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Project Evolution
          </p>
          <h1 className="text-2xl font-semibold text-slate-100 mt-1">
            How this project became what it is
          </h1>
        </div>
        <Link
          href={"/projects/" + projectId}
          className="text-sm text-slate-400 hover:text-slate-200"
        >
          ← Back to project
        </Link>
      </header>

      {loading && <p className="text-slate-400 text-sm">Loading evolution…</p>}
      {error && <p className="text-rose-400 text-sm">{error}</p>}

      {snapshot && (
        <>
          <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Current Phase
            </p>
            <p className="text-xl font-semibold text-amber-300 mt-1 capitalize">
              {snapshot.phase.phase.replace("_", " ")}
            </p>
            {snapshot.phase.signals.length > 0 && (
              <ul className="mt-3 space-y-1">
                {snapshot.phase.signals.map((s, i) => (
                  <li key={i} className="text-sm text-slate-400">
                    · {s.label}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-sm uppercase tracking-wide text-slate-400">
              Timeline
            </h2>
            <ol className="space-y-3">
              {snapshot.items.map((item) => {
                const isMarker =
                  item.type === "turning_point" ||
                  item.type === "project_began";
                const isSelected = selectedAt === item.occurred_at;

                return (
                  <li
                    key={item.id}
                    className="rounded-lg border border-slate-800 bg-slate-900/40 p-4"
                  >
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span
                          className={"text-xs uppercase tracking-wide " + itemColor(item)}
                        >
                          {item.title}
                        </span>
                        <p className="text-sm text-slate-200 mt-1">
                          {item.detail}
                        </p>
                      </div>
                      <time className="text-xs text-slate-500">
                        {formatDate(item.occurred_at)}
                      </time>
                    </div>

                    {isMarker && (
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <button
                          onClick={() =>
                            setSelectedAt(
                              isSelected ? null : item.occurred_at
                            )
                          }
                          className={
                            "text-xs px-3 py-1 rounded border " +
                            (isSelected
                              ? "border-amber-400 text-amber-300"
                              : "border-slate-700 text-slate-400 hover:text-slate-200")
                          }
                        >
                          {isSelected
                            ? "Return to current memory"
                            : "See text snapshot"}
                        </button>
                        <Link
                          href={
                            "/projects/" +
                            projectId +
                            "/memory?at=" +
                            encodeURIComponent(item.occurred_at)
                          }
                          className="text-xs px-3 py-1 rounded border border-slate-700 text-slate-400 hover:text-slate-200"
                        >
                          Explore in Memory Graph
                        </Link>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>

          {selectedAt && (
            <section className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-amber-300">
                    Historical Context (read-only)
                  </p>
                  <p className="text-sm text-slate-300 mt-1">
                    {formatDate(selectedAt)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAt(null)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Return to current memory
                </button>
              </div>

              {historicLoading && (
                <p className="text-slate-400 text-sm mt-4">Reconstructing…</p>
              )}

              {historic && (
                <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
                  <HistoricField label="Goal" value={historic.intent.goal} />
                  <HistoricField
                    label="Current Focus"
                    value={historic.intent.current_focus}
                  />
                  <HistoricField
                    label="Next Step"
                    value={historic.intent.next_step}
                  />

                  <div className="md:col-span-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Questions at this point
                    </p>
                    <ul className="mt-2 space-y-1 text-slate-300">
                      {historic.questions
                        .filter((q) => q.existed)
                        .map((q) => (
                          <li key={q.id}>
                            <span className="text-slate-500">[{q.status}]</span>{" "}
                            {q.question || "(no text captured)"}
                          </li>
                        ))}
                      {historic.questions.filter((q) => q.existed).length ===
                        0 && (
                        <li className="text-slate-500 italic">
                          No questions yet.
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="md:col-span-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Relationships at this point
                    </p>
                    <p className="text-slate-300 mt-1">
                      {historic.relationships.filter((r) => r.existed).length}{" "}
                      active connections
                    </p>
                  </div>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </main>
  );
}

function HistoricField({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-slate-200">
        {value ? value : <span className="text-slate-500 italic">Not set</span>}
      </p>
    </div>
  );
}

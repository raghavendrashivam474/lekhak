// src/services/spatial/projection/regions.ts

import type { SpatialNode, SpatialRegion, SpatialRegionType } from "@/types/spatial";
import { regionCenter } from "./position";

const REGION_LABELS: Record<SpatialRegionType, string> = {
  current_work: "Current Work",
  open_threads: "Open Threads",
  established_knowledge: "Established Knowledge",
  peripheral_memory: "Peripheral Memory",
};

export function buildRegions(nodes: SpatialNode[]): SpatialRegion[] {
  const grouped: Record<SpatialRegionType, string[]> = {
    current_work: [],
    open_threads: [],
    established_knowledge: [],
    peripheral_memory: [],
  };

  for (const n of nodes) {
    grouped[n.region].push(n.id);
  }

  return (Object.keys(grouped) as SpatialRegionType[])
    .filter((k) => grouped[k].length > 0)
    .map((k) => ({
      id: k,
      label: REGION_LABELS[k],
      center: regionCenter(k),
      nodeIds: grouped[k],
    }));
}
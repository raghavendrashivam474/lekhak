"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { adaptProjection } from "./adapters/spatial-three";
import { SpatialEdge } from "./SpatialEdge";
import { SpatialRegion } from "./SpatialRegion";
import { SpatialCamera } from "./SpatialCamera";
import { ProjectSpatialNode } from "./nodes/ProjectSpatialNode";
import { CollectionSpatialNode } from "./nodes/CollectionSpatialNode";
import { NoteSpatialNode } from "./nodes/NoteSpatialNode";
import { QuestionSpatialNode } from "./nodes/QuestionSpatialNode";
import { TagSpatialNode } from "./nodes/TagSpatialNode";
import type { SpatialProjection, CameraIntent } from "@/types/spatial";

interface SpatialCanvasProps {
  projection: SpatialProjection;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  cameraIntent: CameraIntent;
  reducedMotion: boolean;
}

export function SpatialCanvas({
  projection,
  selectedNodeId,
  onSelectNode,
  cameraIntent,
  reducedMotion,
}: SpatialCanvasProps) {
  const adapted = useMemo(() => adaptProjection(projection), [projection]);

  const highlightedEdgeIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const set = new Set<string>();
    for (const e of projection.edges) {
      if (e.source === selectedNodeId || e.target === selectedNodeId) {
        set.add("spatial::" + e.id);
      }
    }
    return set;
  }, [projection.edges, selectedNodeId]);

  return (
    <Canvas
      camera={{ position: [0, 5, 22], fov: 50 }}
      style={{ background: "#0F1623" }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.7} />
      <directionalLight position={[-10, -5, -5]} intensity={0.3} />

      {/* Semantic camera controller */}
      <SpatialCamera intent={cameraIntent} reducedMotion={reducedMotion} />

      {adapted.regions.map((r) => (
        <SpatialRegion key={r.id} region={r} />
      ))}

      {adapted.edges.map((e) => (
        <SpatialEdge
          key={e.id}
          edge={e}
          highlighted={highlightedEdgeIds.has(e.id)}
        />
      ))}

      {adapted.nodes.map((n) => {
        const isSelected = selectedNodeId === n.id.replace("spatial::", "");
        switch (n.entityType) {
          case "project":
            return <ProjectSpatialNode key={n.id} node={n} onSelect={onSelectNode} isSelected={isSelected} />;
          case "collection":
            return <CollectionSpatialNode key={n.id} node={n} onSelect={onSelectNode} isSelected={isSelected} />;
          case "note":
            return <NoteSpatialNode key={n.id} node={n} onSelect={onSelectNode} isSelected={isSelected} />;
          case "question":
            return <QuestionSpatialNode key={n.id} node={n} onSelect={onSelectNode} isSelected={isSelected} />;
          case "knowledge_tag":
            return <TagSpatialNode key={n.id} node={n} onSelect={onSelectNode} isSelected={isSelected} />;
          default:
            return null;
        }
      })}

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={4}
        maxDistance={70}
        dampingFactor={0.1}
        makeDefault
      />
    </Canvas>
  );
}
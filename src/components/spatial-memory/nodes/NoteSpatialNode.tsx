"use client";

import { SpatialNodeShell } from "../SpatialNode";
import type { AdaptedSpatialNode } from "../adapters/spatial-three";

interface Props {
  node: AdaptedSpatialNode;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

// Note → thin memory surface (flat disc)
export function NoteSpatialNode({ node, onSelect, isSelected }: Props) {
  const color = node.state.suggestedStart
    ? "#4ade80"
    : node.state.orphan
    ? "#fb923c"
    : isSelected
    ? "#C9A84C"
    : "#C8D6E5";

  return (
    <SpatialNodeShell node={node} onSelect={onSelect} isSelected={isSelected}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.08, 16]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={node.opacity}
          emissive={isSelected ? "#C9A84C" : "#000000"}
          emissiveIntensity={isSelected ? 0.25 : 0}
        />
      </mesh>
    </SpatialNodeShell>
  );
}
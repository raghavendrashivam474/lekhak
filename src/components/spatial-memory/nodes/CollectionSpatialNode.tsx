"use client";

import { SpatialNodeShell } from "../SpatialNode";
import type { AdaptedSpatialNode } from "../adapters/spatial-three";

interface Props {
  node: AdaptedSpatialNode;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

// Collection → cluster anchor (dodecahedron, warm gold tone)
export function CollectionSpatialNode({ node, onSelect, isSelected }: Props) {
  return (
    <SpatialNodeShell node={node} onSelect={onSelect} isSelected={isSelected}>
      <mesh>
        <dodecahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial
          color={isSelected ? "#C9A84C" : "#C9A84C"}
          transparent
          opacity={node.opacity * 0.85}
          wireframe={!isSelected}
        />
      </mesh>
    </SpatialNodeShell>
  );
}
"use client";

import { SpatialNodeShell } from "../SpatialNode";
import type { AdaptedSpatialNode } from "../adapters/spatial-three";

interface Props {
  node: AdaptedSpatialNode;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

// Tag → small semantic connector (small sphere)
export function TagSpatialNode({ node, onSelect, isSelected }: Props) {
  return (
    <SpatialNodeShell node={node} onSelect={onSelect} isSelected={isSelected}>
      <mesh>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshStandardMaterial
          color={isSelected ? "#C9A84C" : "#8A9BB0"}
          transparent
          opacity={node.opacity * 0.9}
        />
      </mesh>
    </SpatialNodeShell>
  );
}
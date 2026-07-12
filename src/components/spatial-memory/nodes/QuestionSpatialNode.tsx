"use client";

import { SpatialNodeShell } from "../SpatialNode";
import type { AdaptedSpatialNode } from "../adapters/spatial-three";

interface Props {
  node: AdaptedSpatialNode;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

// Question → open/incomplete marker (torus = open ring)
export function QuestionSpatialNode({ node, onSelect, isSelected }: Props) {
  const color = node.state.unresolved
    ? "#60a5fa"
    : isSelected
    ? "#C9A84C"
    : "#8A9BB0";

  return (
    <SpatialNodeShell node={node} onSelect={onSelect} isSelected={isSelected}>
      <mesh>
        <torusGeometry args={[0.45, 0.1, 8, 24]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={node.opacity}
        />
      </mesh>
    </SpatialNodeShell>
  );
}
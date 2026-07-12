"use client";

// src/components/spatial-memory/SpatialNode.tsx
// Generic spatial node visual. Entity-specific components pass geometry.

import { useMemo } from "react";
import { Html } from "@react-three/drei";
import type { AdaptedSpatialNode } from "./adapters/spatial-three";

interface SpatialNodeShellProps {
  node: AdaptedSpatialNode;
  onSelect: (id: string) => void;
  isSelected: boolean;
  children: React.ReactNode;
}

export function SpatialNodeShell({
  node,
  onSelect,
  isSelected,
  children,
}: SpatialNodeShellProps) {
  const showLabel = useMemo(
    () => node.opacity >= 0.7 || isSelected,
    [node.opacity, isSelected]
  );

  return (
    <group
      position={node.position}
      scale={node.scale}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      {children}

      {showLabel && (
        <Html
          center
          distanceFactor={8}
          position={[0, -0.9, 0]}
          style={{
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <div
            style={{
              opacity: node.opacity,
              padding: "2px 6px",
              borderRadius: "4px",
              background: isSelected ? "#C9A84C" : "rgba(15, 22, 35, 0.85)",
              color: isSelected ? "#0F1623" : "#F5ECD7",
              fontSize: "10px",
              fontWeight: 500,
              whiteSpace: "nowrap",
              maxWidth: "140px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              border: "1px solid #2A3A52",
            }}
          >
            {node.label}
          </div>
        </Html>
      )}
    </group>
  );
}
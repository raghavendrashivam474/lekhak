"use client";

import { Html } from "@react-three/drei";
import type { AdaptedSpatialRegion } from "./adapters/spatial-three";

interface SpatialRegionProps {
  region: AdaptedSpatialRegion;
}

// Soft label + subtle ground ring. Never louder than nodes.
export function SpatialRegion({ region }: SpatialRegionProps) {
  return (
    <group position={region.center}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
        <ringGeometry args={[3.5, 3.7, 32]} />
        <meshBasicMaterial
          color="#2A3A52"
          transparent
          opacity={0.15}
        />
      </mesh>
      <Html
        center
        distanceFactor={12}
        position={[0, -3.5, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div
          style={{
            fontSize: "9px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#4A5A6A",
            whiteSpace: "nowrap",
          }}
        >
          {region.label}
        </div>
      </Html>
    </group>
  );
}
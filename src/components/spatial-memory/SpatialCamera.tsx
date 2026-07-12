"use client";

// src/components/spatial-memory/SpatialCamera.tsx
// Consumes CameraIntent from the domain layer and interpolates the camera
// toward the target. Respects reduced-motion (instant snap when true).

import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import type { CameraIntent } from "@/types/spatial";

interface SpatialCameraProps {
  intent: CameraIntent;
  reducedMotion: boolean;
}

export function SpatialCamera({ intent, reducedMotion }: SpatialCameraProps) {
  const { camera } = useThree();

  // Desired camera position = target + offset back along z, slightly above
  const desired = useRef(new Vector3());
  const lookAt = useRef(new Vector3());

  useEffect(() => {
    lookAt.current.set(intent.target.x, intent.target.y, intent.target.z);
    desired.current.set(
      intent.target.x,
      intent.target.y + intent.distance * 0.3,
      intent.target.z + intent.distance
    );

    if (reducedMotion) {
      camera.position.copy(desired.current);
      camera.lookAt(lookAt.current);
    }
  }, [intent, camera, reducedMotion]);

  useFrame(() => {
    if (reducedMotion) return;

    // Gentle lerp — never overshoots, never rushes
    camera.position.lerp(desired.current, 0.06);
    camera.lookAt(lookAt.current);
  });

  return null;
}
"use client";

import { useEffect, useState } from "react";

/**
 * Detects WebGL availability once on mount.
 * Returns:
 *   null    while checking (SSR + first paint)
 *   true    WebGL 1 or 2 available
 *   false   WebGL unavailable — caller should render fallback
 */
export function useWebGLSupport(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      setSupported(!!gl);
    } catch {
      setSupported(false);
    }
  }, []);

  return supported;
}
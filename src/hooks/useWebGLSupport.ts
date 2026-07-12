"use client";

import { useEffect, useState } from "react";

/**
 * Detects WebGL availability once on mount.
 * Returns:
 *   null    while checking (SSR + first paint)
 *   true    WebGL available
 *   false   WebGL unavailable — caller should render fallback
 */
export function useWebGLSupport(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    // One-time DOM probe — a legitimate synchronisation with the
    // external system (the browser's WebGL implementation).
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
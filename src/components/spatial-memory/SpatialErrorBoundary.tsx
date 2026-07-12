"use client";

import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { SpatialUnsupported } from "./SpatialUnsupported";

interface Props {
  children: ReactNode;
  onFallbackToGraph: () => void;
}

interface State {
  hasError: boolean;
  message: string | null;
}

export class SpatialErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: null };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[SpatialErrorBoundary]", error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SpatialUnsupported
          reason="The spatial renderer stopped unexpectedly. Falling back keeps you moving."
          onFallbackToGraph={this.props.onFallbackToGraph}
        />
      );
    }
    return this.props.children;
  }
}
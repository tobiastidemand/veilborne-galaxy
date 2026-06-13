"use client";

import { Component, type ReactNode } from "react";

/**
 * Catches render/commit errors from the R3F canvas subtree (e.g. a failed
 * WebGL context) and reports them so the page can show a graceful fallback.
 */
export class CanvasErrorBoundary extends Component<
  { onError: () => void; children: ReactNode },
  { errored: boolean }
> {
  state = { errored: false };

  static getDerivedStateFromError() {
    return { errored: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.errored ? null : this.props.children;
  }
}

"use client";

import React from "react";

// A crash in the chat widget must never take down the whole page. This boundary
// catches any render error inside the widget and quietly renders nothing (or a
// fallback) instead of propagating the error up to the route.
export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error("[ChatWidget] crashed:", error, info);
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}

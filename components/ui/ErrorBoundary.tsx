"use client";

import React, { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  locale?: string;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    fetch("/api/error-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        url: typeof window !== "undefined" ? window.location.href : undefined,
        locale: this.props.locale,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        componentStack: info.componentStack?.slice(0, 2000),
      }),
    }).catch(() => {});
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          padding: "20px",
          background: "#FAFAFA",
        }}>
          <div style={{ textAlign: "center", maxWidth: 400 }}>
            <h1 style={{ fontSize: 22, color: "#333", marginBottom: 8 }}>Something went wrong</h1>
            <p style={{ fontSize: 15, color: "#777", marginBottom: 24, lineHeight: 1.5 }}>
              We hit an unexpected error. Please try reloading the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "var(--theme-primary, #C4384B)",
                color: "#fff",
                border: "none",
                padding: "10px 28px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

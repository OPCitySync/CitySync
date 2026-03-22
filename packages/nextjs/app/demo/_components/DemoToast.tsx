"use client";

import { useEffect } from "react";

type DemoToastProps = {
  message: string;
  accentColor: string;
  onDismiss: () => void;
  borderColor?: string;
  strongTextColor?: string;
  dimTextColor?: string;
  shadow?: string;
};

export default function DemoToast({
  message,
  accentColor,
  onDismiss,
  borderColor = "var(--cs-border, rgba(255,255,255,0.08))",
  strongTextColor = "var(--cs-text-strong, #ffffff)",
  dimTextColor = "var(--cs-text-dimmed, rgba(255,255,255,0.45))",
  shadow = "var(--cs-shadow, 0 2px 10px rgba(0,0,0,0.22))",
}: DemoToastProps) {
  const isError = /fail|error|not ready/i.test(message);
  const isInfo = /submitting|approving|pending/i.test(message);
  const accentBorder = isError ? "rgba(255,107,157,0.65)" : isInfo ? "rgba(130,160,255,0.55)" : `${accentColor}88`;
  const iconColor = isError ? "#ff6b9d" : isInfo ? "#8aa8ff" : accentColor;

  useEffect(() => {
    const timeout = window.setTimeout(onDismiss, isInfo ? 8000 : 3500);
    return () => window.clearTimeout(timeout);
  }, [isInfo, onDismiss]);

  return (
    <>
      <style>{`
        @keyframes citysyncToastUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          bottom: 28,
          right: 24,
          animation: "citysyncToastUp 0.2s cubic-bezier(0.34,1.36,0.64,1) both",
          background: "var(--cs-surface, rgba(20,22,32,0.97))",
          border: `1px solid ${borderColor}`,
          borderLeft: `3px solid ${accentBorder}`,
          borderRadius: 10,
          padding: "10px 12px 10px 13px",
          fontSize: 13,
          fontWeight: 500,
          zIndex: 400,
          boxShadow: shadow,
          display: "flex",
          alignItems: "flex-start",
          gap: 9,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          maxWidth: 300,
          minWidth: 180,
        }}
      >
        <span style={{ fontSize: 13, color: iconColor, flexShrink: 0, marginTop: 1 }}>
          {isError ? "✕" : isInfo ? "⋯" : "✓"}
        </span>
        <span style={{ color: strongTextColor, lineHeight: 1.45, flex: 1 }}>{message}</span>
        <button
          onClick={onDismiss}
          style={{
            background: "none",
            border: "none",
            color: dimTextColor,
            cursor: "pointer",
            fontSize: 15,
            padding: 0,
            flexShrink: 0,
            lineHeight: 1,
          }}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </>
  );
}

"use client";

import { useEffect } from "react";
import { BOTTOM_NAV_OFFSET_CSS } from "../_utils/sheetStyles";

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
          position: "absolute",
          left: 0,
          right: 0,
          bottom: `calc(${BOTTOM_NAV_OFFSET_CSS} + 12px)`,
          padding: "0 14px",
          zIndex: 46,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            animation: "citysyncToastUp 0.2s cubic-bezier(0.34,1.36,0.64,1) both",
            background: isError ? "rgba(255,107,157,0.08)" : isInfo ? "rgba(65,105,225,0.08)" : "rgba(52,238,182,0.08)",
            border: `1px solid ${borderColor}`,
            borderRadius: 12,
            padding: "12px 14px",
            fontSize: 13,
            zIndex: 400,
            boxShadow: `inset 0 0 0 1px ${accentBorder}, ${shadow}`,
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            width: "100%",
            pointerEvents: "auto",
          }}
        >
          <span style={{ fontSize: 13, color: iconColor, flexShrink: 0, marginTop: 18 }}>
            {isError ? "✕" : isInfo ? "⋯" : "✓"}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: dimTextColor, marginBottom: 6 }}>
              {isError ? "Action Notice" : isInfo ? "Syncing Status" : "In-App Message"}
            </div>
            <div style={{ color: strongTextColor, lineHeight: 1.45, fontWeight: 700 }}>{message}</div>
          </div>
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
      </div>
    </>
  );
}

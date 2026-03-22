import type { CSSProperties } from "react";

export const BOTTOM_NAV_OFFSET_PX = 69;

export const DEMO_MODAL_OVERLAY_STYLE: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: BOTTOM_NAV_OFFSET_PX,
  background: "rgba(0,0,0,0.45)",
  pointerEvents: "auto",
};

export const DEMO_MODAL_SHEET_BASE_STYLE: CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: BOTTOM_NAV_OFFSET_PX,
  zIndex: 1,
  background: "var(--cs-surface, #1E1E2C)",
  borderRadius: "24px 24px 0 0",
  boxShadow: "var(--cs-shadow-lg, 0 -8px 40px rgba(0,0,0,0.55))",
  animation: "walletSlideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1) both",
  overflowY: "auto",
  pointerEvents: "auto",
};

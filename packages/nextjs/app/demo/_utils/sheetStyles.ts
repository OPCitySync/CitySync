import type { CSSProperties } from "react";

// Bottom sheets should pin directly to the top edge of the bottom nav.
// Keep this in sync with BottomNav's actual base height.
export const BOTTOM_NAV_OFFSET_PX = 69;
export const APP_NAV_OFFSET_PX = 112;
export const BOTTOM_NAV_OFFSET_CSS = `calc(${BOTTOM_NAV_OFFSET_PX}px + env(safe-area-inset-bottom, 0px))`;

export const DEMO_MODAL_OVERLAY_STYLE: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: BOTTOM_NAV_OFFSET_CSS,
  background: "rgba(0,0,0,0.45)",
  pointerEvents: "auto",
};

export const DEMO_MODAL_SHEET_BASE_STYLE: CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: BOTTOM_NAV_OFFSET_CSS,
  zIndex: 1,
  background: "var(--cs-surface, #1E1E2C)",
  borderRadius: "24px 24px 0 0",
  boxShadow: "var(--cs-shadow-lg, 0 -8px 40px rgba(0,0,0,0.55))",
  animation: "walletSlideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1) both",
  overflowY: "auto",
  pointerEvents: "auto",
};

export const DEMO_TUTORIAL_HIGHLIGHT_LAYER_STYLE: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 220,
  pointerEvents: "none",
};

export const DEMO_CONTENT_SHEET_FIXED_STYLE: CSSProperties = {
  position: "fixed",
  top: APP_NAV_OFFSET_PX,
  left: 0,
  right: 0,
  bottom: BOTTOM_NAV_OFFSET_CSS,
  zIndex: 221,
  borderRadius: "12px 12px 0 0",
  animation: "walletSlideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1) both",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
};

export const DEMO_CONTENT_SHEET_ABSOLUTE_STYLE: CSSProperties = {
  // Use fixed so sheets pin to nav chrome instead of scrolling with tab content.
  // AppShell's phone screen uses a transform so this stays scoped to the app frame.
  position: "fixed",
  left: 0,
  right: 0,
  top: APP_NAV_OFFSET_PX,
  bottom: BOTTOM_NAV_OFFSET_CSS,
  zIndex: 1,
  borderRadius: "12px 12px 0 0",
  animation: "walletSlideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1) both",
  overflowY: "auto",
  pointerEvents: "auto",
};

export const DEMO_CONTENT_SHEET_ABSOLUTE_ELEVATED_STYLE: CSSProperties = {
  ...DEMO_CONTENT_SHEET_ABSOLUTE_STYLE,
  boxShadow: "var(--cs-shadow-lg, 0 -8px 40px rgba(0,0,0,0.55))",
};

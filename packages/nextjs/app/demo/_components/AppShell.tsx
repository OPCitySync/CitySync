"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLogout } from "@account-kit/react";
import BottomNav, { NavTab } from "./BottomNav";
import WalletModal from "./WalletModal";
import { useDemo } from "../_context/DemoContext";

// ─── Role definitions (single source of truth for the switcher) ────────────────

const ROLES = [
  {
    key: "participant" as const,
    emoji: "🏙️",
    label: "Civic Participant",
    shortLabel: "Participant",
    tagline: "Earn · Vote · Redeem",
    accent: "#4169E1",
    href: "/demo/participant",
  },
  {
    key: "issuer" as const,
    emoji: "📋",
    label: "Issuer Organization",
    shortLabel: "Issuer",
    tagline: "Create · Verify · Distribute",
    accent: "#DD9E33",
    href: "/demo/issuer",
  },
  {
    key: "redeemer" as const,
    emoji: "🏪",
    label: "Redeemer Organization",
    shortLabel: "Redeemer",
    tagline: "Incentivize · Reward · Track",
    accent: "#34eeb6",
    href: "/demo/redeemer",
  },
] as const;

// ─── Props ─────────────────────────────────────────────────────────────────────

interface AppShellProps {
  role: "participant" | "issuer" | "redeemer";
  orgName?: string;
  address: string;
  cityBalance: number;
  voteBalance: number;
  mceBalance: number;
  tabs: NavTab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  accentColor: string;
  title: string;
  children: React.ReactNode;
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  /** When true, renders a phone device bezel around the app */
  phoneFrame?: boolean;
  /** Optional shell surroundings theme; does not affect in-app content */
  surroundingsTheme?: "default" | "light";
  /** Show the left informational side panel around the phone shell */
  showLeftPanel?: boolean;
  /** Show the right contextual side panel around the phone shell */
  showRightPanel?: boolean;
  tutorialHighlightWalletButton?: boolean;
  tutorialHighlightWalletCloseButton?: boolean;
  tutorialHighlightRoleSwitcher?: boolean;
  tutorialLocked?: boolean;
  tutorialAllowedTabs?: string[];
  onWalletOpen?: () => void;
  onWalletClose?: () => void;
  onTutorialRoleSwitcherCancel?: () => void;
}

// ─── Phone Status Bar ───────────────────────────────────────────────────────────

function PhoneStatusBar({ accentColor }: { accentColor: string }) {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <div
      style={{
        height: 50,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        flexShrink: 0,
        paddingBottom: 6,
        position: "relative",
      }}
    >
      {/* Dynamic Island pill */}
      <div
        style={{
          width: 126,
          height: 32,
          borderRadius: 20,
          background: "#000",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
          boxShadow: `0 0 12px ${accentColor}30`,
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "0.04em" }}>
          {time}
        </span>
        {/* Signal + battery */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {/* Signal bars */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 1.5 }}>
            {[4, 6, 8, 10].map((h, i) => (
              <div
                key={i}
                style={{
                  width: 3,
                  height: h,
                  borderRadius: 1,
                  background: i < 3 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)",
                }}
              />
            ))}
          </div>
          {/* Battery */}
          <div
            style={{
              width: 18,
              height: 10,
              borderRadius: 2,
              border: "1px solid rgba(255,255,255,0.4)",
              position: "relative",
              display: "flex",
              alignItems: "center",
              padding: "1px",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: -4,
                top: "50%",
                transform: "translateY(-50%)",
                width: 3,
                height: 5,
                borderRadius: "0 1px 1px 0",
                background: "rgba(255,255,255,0.3)",
              }}
            />
            <div style={{ width: "75%", height: "100%", borderRadius: 1, background: accentColor }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Home Indicator ─────────────────────────────────────────────────────────────

function HomeIndicator({ accentColor }: { accentColor: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", paddingBottom: 10, paddingTop: 6, flexShrink: 0 }}>
      <div
        style={{
          width: 120,
          height: 5,
          borderRadius: 3,
          background: `linear-gradient(90deg, ${accentColor}40, rgba(255,255,255,0.2), ${accentColor}40)`,
        }}
      />
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function AppShell({
  role,
  orgName,
  address,
  cityBalance,
  voteBalance,
  mceBalance,
  tabs,
  activeTab,
  onTabChange,
  accentColor,
  title: _title,
  children,
  leftPanel,
  rightPanel,
  phoneFrame = false,
  surroundingsTheme = "default",
  showLeftPanel = true,
  showRightPanel = true,
  tutorialHighlightWalletButton = false,
  tutorialHighlightWalletCloseButton = false,
  tutorialHighlightRoleSwitcher = false,
  tutorialLocked = false,
  tutorialAllowedTabs = [],
  onWalletOpen,
  onWalletClose,
  onTutorialRoleSwitcherCancel,
}: AppShellProps) {
  const [walletOpen, setWalletOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const { setRole } = useDemo();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logout } = useLogout({ onSuccess: () => router.push("/demo") });

  const currentRole = ROLES.find(r => r.key === role)!;
  const walletAllowed = !tutorialLocked || tutorialHighlightWalletButton;
  const roleSwitcherAllowed = !tutorialLocked || tutorialHighlightRoleSwitcher;
  const roleSheetCancelOnly = tutorialLocked && tutorialHighlightRoleSwitcher;
  const highlightRoleSwitcher = tutorialHighlightRoleSwitcher && !switcherOpen;
  const highlightRoleCancel = tutorialHighlightRoleSwitcher && switcherOpen;
  const embedMode = searchParams?.get("embed") === "1";
  const redesignSkin = searchParams?.get("skin") === "redesign";
  const lightSurroundings = phoneFrame && (surroundingsTheme === "light" || redesignSkin);
  const shellHeaderBackground = redesignSkin
    ? "rgba(247, 248, 252, 0.92)"
    : phoneFrame
      ? "rgba(18,18,28,0.96)"
      : "rgba(21,21,30,0.92)";
  const shellHeaderBorder = redesignSkin ? "1px solid rgba(31,45,86,0.14)" : "1px solid rgba(255,255,255,0.07)";
  const shellRoleText = redesignSkin ? "#2c4f9f" : currentRole.accent;
  const shellLogoStroke = redesignSkin ? "#24386e" : "#15151E";
  const shellQrButtonBackground = redesignSkin ? "rgba(65,105,225,0.1)" : "rgba(255,255,255,0.06)";
  const shellQrButtonBorder = redesignSkin ? "1px solid rgba(65,105,225,0.24)" : "1px solid rgba(255,255,255,0.1)";
  const shellQrButtonColor = redesignSkin ? "rgba(36,56,110,0.72)" : "rgba(255,255,255,0.55)";
  const sheetBackground = redesignSkin ? "#f8f9fd" : "#15151E";
  const sheetBorder = redesignSkin ? "1px solid rgba(31,45,86,0.12)" : "1px solid rgba(255,255,255,0.07)";
  const sheetBodyText = redesignSkin ? "#1b2e63" : "#fff";
  const sheetTaglineText = redesignSkin ? "rgba(36,56,110,0.62)" : "rgba(255,255,255,0.38)";
  const sheetCancelBackground = redesignSkin ? "rgba(65,105,225,0.12)" : "rgba(255,255,255,0.04)";
  const sheetCancelBorder = redesignSkin ? "1px solid rgba(65,105,225,0.26)" : "1px solid rgba(255,255,255,0.08)";
  const sheetCancelColor = redesignSkin ? "#284695" : "rgba(255,255,255,0.45)";
  const sheetExitBorder = redesignSkin ? "1px solid rgba(220,106,84,0.35)" : "1px solid rgba(255,80,80,0.18)";
  const sheetExitBackground = redesignSkin ? "rgba(220,106,84,0.12)" : "rgba(255,80,80,0.06)";
  const sheetExitColor = redesignSkin ? "rgba(170,68,53,0.88)" : "rgba(255,100,100,0.7)";
  const roleSwitchQuery = searchParams?.toString();
  const roleSwitchHrefSuffix = roleSwitchQuery ? `?${roleSwitchQuery}` : "";

  const handleRoleSwitch = (r: (typeof ROLES)[number]) => {
    if (r.key === role) {
      setSwitcherOpen(false);
      return;
    }
    setRole(r.key);
    setSwitcherOpen(false);
    router.push(`${r.href}${roleSwitchHrefSuffix}`);
  };

  const learnMoreColumn = (
    <div style={{ overflowY: "auto", paddingRight: 4 }}>
      {leftPanel ?? (
        <div
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
            padding: 14,
            fontSize: 12,
            color: "rgba(255,255,255,0.62)",
            lineHeight: 1.55,
          }}
        >
          Use any <strong style={{ color: "rgba(255,255,255,0.85)" }}>Learn More</strong> link inside the app to add
          contextual info cards here.
        </div>
      )}
    </div>
  );

  // ─── Phone inner content (shared between both modes) ───────────────────────

  const phoneInner = (
    <>
      {phoneFrame && <PhoneStatusBar accentColor={accentColor} />}
      {tutorialLocked && (
        <style>{`
          @keyframes tutorialAllowedPulse {
            0%, 100% {
              box-shadow: 0 0 0 2px rgba(255,226,162,0.58), 0 0 18px rgba(221,158,51,0.5), 0 0 32px rgba(221,158,51,0.32);
              transform: scale(1);
            }
            50% {
              box-shadow: 0 0 0 3px rgba(255,241,198,0.98), 0 0 28px rgba(221,158,51,0.82), 0 0 52px rgba(221,158,51,0.48);
              transform: scale(1.012);
            }
          }
          @keyframes tutorialWalletBeacon {
            0%, 100% {
              box-shadow: 0 0 0 3px rgba(255,232,173,0.72), 0 0 24px rgba(221,158,51,0.72), 0 0 44px rgba(221,158,51,0.42);
              transform: translateY(0) scale(1);
            }
            50% {
              box-shadow: 0 0 0 5px rgba(255,242,205,1), 0 0 42px rgba(221,158,51,0.96), 0 0 72px rgba(221,158,51,0.56);
              transform: translateY(-1px) scale(1.045);
            }
          }
          .citysync-tutorial-lock-scope * {
            pointer-events: none !important;
          }
          .citysync-tutorial-lock-scope [data-tutorial-allow="true"],
          .citysync-tutorial-lock-scope [data-tutorial-allow="true"] * {
            pointer-events: auto !important;
          }
          .citysync-tutorial-lock-scope [data-tutorial-allow="true"] {
            position: relative;
            z-index: 140 !important;
            outline: 2px solid rgba(255,226,162,0.9) !important;
            animation: tutorialAllowedPulse 1.55s ease-in-out infinite !important;
          }
          .citysync-tutorial-lock-scope [data-tutorial-wallet-target="true"] {
            z-index: 180 !important;
            outline: 3px solid rgba(255,242,205,0.98) !important;
            filter: saturate(1.2) brightness(1.08);
            animation: tutorialWalletBeacon 1.1s cubic-bezier(0.34, 1.56, 0.64, 1) infinite !important;
          }
        `}</style>
      )}
      {redesignSkin && (
        <style>{`
          .citysync-redesign-main {
            background: linear-gradient(180deg, #f7f8fc 0%, #edf2fb 100%) !important;
            color: #1a2d62 !important;
            filter: invert(1) hue-rotate(180deg) saturate(0.88) contrast(0.96);
          }
          .citysync-redesign-main img,
          .citysync-redesign-main video,
          .citysync-redesign-main canvas {
            filter: invert(1) hue-rotate(180deg) saturate(1.06) contrast(1.02);
          }
        `}</style>
      )}

      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 35,
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          padding: phoneFrame ? "10px 14px 10px" : "max(12px, env(safe-area-inset-top)) 14px 10px",
          borderBottom: shellHeaderBorder,
          background: shellHeaderBackground,
          backdropFilter: "blur(10px)",
          flexShrink: 0,
        }}
      >
        {/* Left: Role badge / switcher trigger */}
        <button
          onClick={() => {
            if (roleSwitcherAllowed) setSwitcherOpen(true);
          }}
          disabled={!roleSwitcherAllowed}
          style={{
            justifySelf: "start",
            display: "flex",
            alignItems: "center",
            gap: 6,
            minHeight: 42,
            padding: "6px 10px 6px 8px",
            borderRadius: 10,
            border: highlightRoleSwitcher
              ? "1px solid rgba(255,226,162,0.92)"
              : redesignSkin
                ? "1px solid rgba(65,105,225,0.28)"
                : `1px solid ${currentRole.accent}30`,
            background: highlightRoleSwitcher
              ? "rgba(255,226,162,0.2)"
              : redesignSkin
                ? "rgba(65,105,225,0.12)"
                : `${currentRole.accent}14`,
            cursor: roleSwitcherAllowed ? "pointer" : "not-allowed",
            transition: "background 0.15s ease",
            opacity: roleSwitcherAllowed ? 1 : 0.55,
            boxShadow: highlightRoleSwitcher
              ? "0 0 0 1px rgba(255,226,162,0.5), 0 0 18px rgba(221,158,51,0.55)"
              : undefined,
            animation: highlightRoleSwitcher ? "tutorialAllowedPulse 1.55s ease-in-out infinite" : undefined,
          }}
          onMouseEnter={e => {
            if (!roleSwitcherAllowed || highlightRoleSwitcher) return;
            (e.currentTarget as HTMLButtonElement).style.background = `${currentRole.accent}22`;
          }}
          onMouseLeave={e => {
            if (!roleSwitcherAllowed || highlightRoleSwitcher) return;
            (e.currentTarget as HTMLButtonElement).style.background = `${currentRole.accent}14`;
          }}
          data-tutorial-allow={highlightRoleSwitcher ? "true" : undefined}
        >
          <span style={{ fontSize: 14, lineHeight: 1 }}>{currentRole.emoji}</span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.03em",
              color: shellRoleText,
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            {currentRole.shortLabel}
          </span>
          {/* Chevron down */}
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke={shellRoleText}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.7, marginLeft: 1 }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Center: // logo mark */}
        <div
          style={{
            justifySelf: "center",
            background: accentColor,
            borderRadius: 10,
            padding: "6px 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg viewBox="47 2 30 32" width="20" height="22" aria-hidden="true">
            <polygon points="51,32 55,32 62,10 58,10" fill="none" stroke={shellLogoStroke} strokeWidth="2" />
            <polygon
              points="62,28 66,28 73,6 69,6"
              fill="none"
              stroke={redesignSkin ? "rgba(36,56,110,0.45)" : "rgba(21,21,30,0.5)"}
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Right: QR + Wallet buttons */}
        <div style={{ justifySelf: "end", display: "flex", alignItems: "center", gap: 8 }}>
          {/* QR icon button */}
          <button
            style={{
              minHeight: 42,
              padding: "8px 10px",
              background: shellQrButtonBackground,
              border: shellQrButtonBorder,
              borderRadius: 10,
              cursor: "pointer",
              color: shellQrButtonColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="QR Code"
            disabled={tutorialLocked}
            onClick={e => {
              if (tutorialLocked) e.preventDefault();
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none" />
              <rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none" />
              <rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none" />
              <path d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z" fill="currentColor" stroke="none" />
            </svg>
          </button>
          {/* Wallet icon button */}
          <button
            onClick={() => {
              if (!walletAllowed) return;
              setWalletOpen(true);
              onWalletOpen?.();
            }}
            style={{
              minHeight: 42,
              padding: "8px 10px",
              background: tutorialHighlightWalletButton
                ? "rgba(255,226,162,0.2)"
                : redesignSkin
                  ? "rgba(65,105,225,0.12)"
                  : "rgba(255,255,255,0.06)",
              border: tutorialHighlightWalletButton
                ? "1px solid rgba(255,226,162,0.85)"
                : redesignSkin
                  ? "1px solid rgba(65,105,225,0.24)"
                  : "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              cursor: walletAllowed ? "pointer" : "not-allowed",
              color: tutorialHighlightWalletButton
                ? "#ffe2a2"
                : redesignSkin
                  ? "rgba(36,56,110,0.78)"
                  : "rgba(255,255,255,0.65)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: tutorialHighlightWalletButton
                ? "0 0 0 1px rgba(255,226,162,0.4), 0 0 14px rgba(221,158,51,0.45)"
                : undefined,
              opacity: walletAllowed ? 1 : 0.55,
              transformOrigin: "center",
            }}
            aria-label="Wallet"
            disabled={!walletAllowed}
            data-tutorial-allow={tutorialHighlightWalletButton ? "true" : undefined}
            data-tutorial-wallet-target={tutorialHighlightWalletButton ? "true" : undefined}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <rect x="4" y="7" width="4" height="4" rx="0.5" fill="currentColor" stroke="none" />
              <path d="M9 15h11" strokeWidth="1.2" />
            </svg>
          </button>
        </div>
      </header>

      {/* Scrollable content area */}
      <main
        className={`flex-1 overflow-y-auto ${tutorialLocked ? "citysync-tutorial-lock-scope" : ""} ${redesignSkin ? "citysync-redesign-main" : ""}`}
        style={{
          position: "relative",
          paddingBottom: phoneFrame ? "108px" : "calc(108px + env(safe-area-inset-bottom, 0px))",
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorY: "contain",
        }}
      >
        {children}
      </main>

      {/* Bottom navigation */}
      <BottomNav
        tabs={tabs}
        active={activeTab}
        onChange={onTabChange}
        accentColor={accentColor}
        theme={redesignSkin ? "light" : "dark"}
        locked={tutorialLocked}
        allowedWhenLocked={tutorialAllowedTabs}
      />

      {phoneFrame && <HomeIndicator accentColor={accentColor} />}

      {/* ── Role Switcher Bottom Sheet ────────────────────────────────────── */}
      <div
        onClick={() => {
          if (roleSheetCancelOnly) return;
          setSwitcherOpen(false);
        }}
        style={{
          position: "absolute",
          inset: 0,
          background: redesignSkin ? "rgba(21,31,58,0.2)" : "rgba(13,13,20,0.45)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          zIndex: 50,
          opacity: switcherOpen ? 1 : 0,
          pointerEvents: switcherOpen ? "auto" : "none",
          transition: "opacity 0.2s ease",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 51,
          background: sheetBackground,
          borderTop: sheetBorder,
          borderRadius: "18px 18px 0 0",
          padding: "0 0 calc(16px + env(safe-area-inset-bottom, 0px))",
          transform: switcherOpen ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.26s cubic-bezier(0.32,0.72,0,1)",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.3)",
        }}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 8px" }}>
          <div
            style={{
              width: 32,
              height: 3,
              borderRadius: 2,
              background: redesignSkin ? "rgba(36,56,110,0.2)" : "rgba(255,255,255,0.12)",
            }}
          />
        </div>

        {/* Sheet header */}
        <div
          style={{
            padding: "4px 20px 12px",
            borderBottom: redesignSkin ? "1px solid rgba(31,45,86,0.1)" : "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: redesignSkin ? "rgba(36,56,110,0.46)" : "rgba(255,255,255,0.3)",
            }}
          >
            Switch Between Roles
          </p>
        </div>

        {/* Role options */}
        <div style={{ padding: "8px 12px" }}>
          {ROLES.map(r => {
            const isActive = r.key === role;
            return (
              <button
                key={r.key}
                onClick={() => handleRoleSwitch(r)}
                disabled={roleSheetCancelOnly}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 12px",
                  borderRadius: 14,
                  border: isActive ? `1px solid ${r.accent}35` : "1px solid transparent",
                  background: isActive ? `${r.accent}12` : "transparent",
                  cursor: roleSheetCancelOnly ? "not-allowed" : "pointer",
                  textAlign: "left",
                  transition: "background 0.12s ease",
                  marginBottom: 4,
                  opacity: roleSheetCancelOnly ? 0.55 : 1,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `${r.accent}18`,
                    border: `1px solid ${r.accent}28`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {r.emoji}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: isActive ? r.accent : sheetBodyText,
                      lineHeight: 1.2,
                      marginBottom: 3,
                    }}
                  >
                    {r.label}
                  </div>
                  <div style={{ fontSize: 11, color: sheetTaglineText, letterSpacing: "0.03em" }}>{r.tagline}</div>
                </div>

                {isActive && (
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: r.accent,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="#0D0D14"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div style={{ padding: "4px 20px 0", display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={() => {
              setSwitcherOpen(false);
              onTutorialRoleSwitcherCancel?.();
            }}
            data-tutorial-allow={highlightRoleCancel ? "true" : undefined}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: 14,
              border: highlightRoleCancel ? "1px solid rgba(255,226,162,0.92)" : sheetCancelBorder,
              background: highlightRoleCancel ? "rgba(255,226,162,0.2)" : sheetCancelBackground,
              color: highlightRoleCancel ? "#ffe2a2" : sheetCancelColor,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: highlightRoleCancel
                ? "0 0 0 1px rgba(255,226,162,0.45), 0 0 16px rgba(221,158,51,0.52)"
                : undefined,
              animation: highlightRoleCancel ? "tutorialAllowedPulse 1.55s ease-in-out infinite" : undefined,
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setSwitcherOpen(false);
              logout();
            }}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: 14,
              border: sheetExitBorder,
              background: sheetExitBackground,
              color: sheetExitColor,
              fontSize: 13,
              fontWeight: 600,
              cursor: roleSheetCancelOnly ? "not-allowed" : "pointer",
              opacity: roleSheetCancelOnly ? 0.45 : 1,
            }}
            disabled={roleSheetCancelOnly}
          >
            Exit Demo
          </button>
        </div>
      </div>

      {/* Wallet modal */}
      {walletOpen && (
        <WalletModal
          address={address}
          cityBalance={cityBalance}
          voteBalance={voteBalance}
          mceBalance={mceBalance}
          orgName={orgName}
          role={role}
          tutorialHighlightCloseButton={tutorialHighlightWalletCloseButton}
          onClose={() => {
            setWalletOpen(false);
            onWalletClose?.();
          }}
        />
      )}
    </>
  );

  // ─── Phone-frame render mode ────────────────────────────────────────────────

  if (phoneFrame) {
    return (
      <div
        className={
          embedMode
            ? "relative flex h-full w-full items-center justify-center"
            : "fixed inset-0 z-50 flex items-center justify-center"
        }
        style={{
          background: embedMode
            ? "transparent"
            : lightSurroundings
              ? `
                radial-gradient(ellipse 720px 520px at 50% 8%, ${accentColor}22, transparent 58%),
                radial-gradient(ellipse 540px 360px at 18% 82%, rgba(106, 142, 248, 0.2), transparent 64%),
                radial-gradient(ellipse 520px 340px at 84% 76%, rgba(241, 172, 58, 0.18), transparent 66%),
                #f6f8fe
              `
              : `
                radial-gradient(ellipse 700px 500px at 50% 20%, ${accentColor}1a, transparent 60%),
                radial-gradient(ellipse 500px 400px at 20% 80%, rgba(100,80,220,0.12), transparent 65%),
                radial-gradient(ellipse 500px 400px at 80% 70%, rgba(52,238,182,0.08), transparent 65%),
                #08080f
              `,
          height: embedMode ? "100vh" : undefined,
          overflow: embedMode ? "hidden" : undefined,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Learn More column (same fixed slot as previous left panel) */}
        {showLeftPanel && !embedMode && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: "calc(50% + 230px)",
              width: 280,
              padding: "72px 20px 40px",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              color: lightSurroundings ? "#112049" : undefined,
            }}
          >
            {learnMoreColumn}
          </div>
        )}

        {/* Right context panel */}
        {showRightPanel && rightPanel && !embedMode && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "calc(50% + 230px)",
              width: 280,
              padding: "72px 20px 40px",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              color: lightSurroundings ? "#112049" : undefined,
            }}
          >
            {rightPanel}
          </div>
        )}

        {/* Device wrapper — side buttons */}
        <div
          style={{
            position: "relative",
            height: embedMode ? "100%" : "calc(100vh - 32px)",
            maxHeight: embedMode ? undefined : 900,
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Volume buttons (left side) */}
          <div
            style={{
              position: "absolute",
              left: -5,
              top: "22%",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              zIndex: 1,
            }}
          >
            {[44, 44].map((h, i) => (
              <div
                key={i}
                style={{
                  width: 4,
                  height: h,
                  borderRadius: "2px 0 0 2px",
                  background: "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), -1px 0 4px rgba(0,0,0,0.4)",
                }}
              />
            ))}
          </div>

          {/* Power button (right side) */}
          <div
            style={{
              position: "absolute",
              right: -5,
              top: "28%",
              width: 4,
              height: 64,
              borderRadius: "0 2px 2px 0",
              background: "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 1px 0 4px rgba(0,0,0,0.4)",
              zIndex: 1,
            }}
          />

          {/* Gradient border bezel */}
          <div
            style={{
              padding: 2,
              borderRadius: 52,
              background: redesignSkin
                ? "linear-gradient(145deg, rgba(239,243,252,0.98) 0%, rgba(226,234,250,0.96) 55%, rgba(215,227,247,0.94) 100%)"
                : `linear-gradient(145deg, ${accentColor}90 0%, rgba(130,100,240,0.6) 45%, rgba(52,238,182,0.5) 100%)`,
              boxShadow: redesignSkin
                ? "0 0 0 1px rgba(28,42,78,0.14), 0 16px 36px rgba(32,47,83,0.18)"
                : `
                  0 0 0 1px rgba(0,0,0,0.6),
                  0 0 60px ${accentColor}28,
                  0 0 120px rgba(100,80,220,0.15),
                  0 40px 80px rgba(0,0,0,0.8)
                `,
              height: "100%",
              display: "flex",
            }}
          >
            {/* Phone screen */}
            <div
              className="relative flex flex-col overflow-hidden"
              style={{
                width: 390,
                flex: 1,
                background: redesignSkin ? "#f7f8fc" : "#12121c",
                borderRadius: 50,
                overflow: "hidden",
                position: "relative",
                transform: "translateZ(0)",
              }}
            >
              {phoneInner}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Normal render mode ─────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center"
      style={{
        background: "radial-gradient(1100px 500px at 50% -120px, rgba(65,105,225,0.18), transparent 65%), #0D0D14",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Phone-width container */}
      <div
        className="relative flex h-full w-full flex-col overflow-hidden"
        style={{
          maxWidth: 430,
          background: "#15151E",
          borderLeft: "1px solid rgba(255,255,255,0.05)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
          transform: "translateZ(0)",
        }}
      >
        {phoneInner}
      </div>

      {/* Learn More column (same fixed slot as previous left panel) */}
      {showLeftPanel && (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: "calc(50% + 260px)",
            width: 280,
            padding: "72px 20px 40px",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          {learnMoreColumn}
        </div>
      )}

      {/* Right context panel */}
      {showRightPanel && rightPanel && (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "calc(50% + 260px)",
            width: 280,
            padding: "72px 20px 40px",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          {rightPanel}
        </div>
      )}
    </div>
  );
}

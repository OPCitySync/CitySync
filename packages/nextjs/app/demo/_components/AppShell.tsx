"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
}

type DeepDiveSection = {
  title: string;
  links: Array<{ label: string; href: string }>;
};

const DEEP_DIVE_SECTIONS: DeepDiveSection[] = [
  {
    title: "General Information",
    links: [
      { label: "About the Pilot Program", href: "/demo/about-pilot-program" },
      { label: "Public-Sector Economy", href: "/demo/public-sector-economy" },
      { label: "City/Sync Framework", href: "/demo/citysync-framework" },
      { label: "MCE's", href: "/demo/mce" },
      { label: "MyCity Feed", href: "/demo/mycity-feed" },
    ],
  },
  {
    title: "Civic Participants",
    links: [
      { label: "Onboarding Tasks", href: "/demo/onboarding-tasks" },
      { label: "Civic Participant Growth", href: "/demo/civic-participant-growth" },
      { label: "Civic Participant Voting", href: "/demo/civic-participant-voting" },
      { label: "Graduated Sanctions", href: "/demo/graduate-sanctions" },
    ],
  },
  {
    title: "Issuers",
    links: [
      { label: "Issuer Organizations (issuer fit)", href: "/demo/issuer-fit" },
      { label: "Task Management", href: "/demo/task-management" },
      { label: "Task Verification", href: "/demo/task-verification" },
    ],
  },
  {
    title: "Redeemers",
    links: [
      { label: "Redeemer Organizations (redeemer fit)", href: "/demo/redeemer-fit" },
      { label: "How Redemptions Work", href: "/demo/how-redemption-works" },
      { label: "Capacity Optimization", href: "/demo/capacity-optimization" },
    ],
  },
];

function DeepDiveLinksColumn({ accentColor }: { accentColor: string }) {
  return (
    <div style={{ overflowY: "auto", paddingRight: 4 }}>
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: "14px 14px 10px",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: accentColor,
            marginBottom: 6,
          }}
        >
          Deep Dives
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.62)", lineHeight: 1.55 }}>
          Open topic pages in a new tab for full context.
        </div>
      </div>

      {DEEP_DIVE_SECTIONS.map(section => (
        <div
          key={section.title}
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14,
            padding: "12px 12px 10px",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: "rgba(255,255,255,0.72)",
              marginBottom: 8,
            }}
          >
            {section.title}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {section.links.map(link => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.86)",
                  textDecoration: "none",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10,
                  padding: "7px 9px",
                }}
              >
                <span>{link.label}</span>
                <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>↗</span>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
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
}: AppShellProps) {
  const [walletOpen, setWalletOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const { setRole } = useDemo();
  const router = useRouter();
  const { logout } = useLogout({ onSuccess: () => router.push("/demo") });

  const currentRole = ROLES.find(r => r.key === role)!;

  const handleRoleSwitch = (r: (typeof ROLES)[number]) => {
    if (r.key === role) {
      setSwitcherOpen(false);
      return;
    }
    setRole(r.key);
    setSwitcherOpen(false);
    router.push(r.href);
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
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: phoneFrame ? "rgba(18,18,28,0.96)" : "rgba(21,21,30,0.92)",
          backdropFilter: "blur(10px)",
          flexShrink: 0,
        }}
      >
        {/* Left: Role badge / switcher trigger */}
        <button
          onClick={() => setSwitcherOpen(true)}
          style={{
            justifySelf: "start",
            display: "flex",
            alignItems: "center",
            gap: 6,
            minHeight: 42,
            padding: "6px 10px 6px 8px",
            borderRadius: 10,
            border: `1px solid ${currentRole.accent}30`,
            background: `${currentRole.accent}14`,
            cursor: "pointer",
            transition: "background 0.15s ease",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = `${currentRole.accent}22`;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = `${currentRole.accent}14`;
          }}
        >
          <span style={{ fontSize: 14, lineHeight: 1 }}>{currentRole.emoji}</span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.03em",
              color: currentRole.accent,
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
            stroke={currentRole.accent}
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
            <polygon points="51,32 55,32 62,10 58,10" fill="none" stroke="#15151E" strokeWidth="2" />
            <polygon points="62,28 66,28 73,6 69,6" fill="none" stroke="rgba(21,21,30,0.5)" strokeWidth="2" />
          </svg>
        </div>

        {/* Right: QR + Wallet buttons */}
        <div style={{ justifySelf: "end", display: "flex", alignItems: "center", gap: 8 }}>
          {/* QR icon button */}
          <button
            style={{
              minHeight: 42,
              padding: "8px 10px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              cursor: "pointer",
              color: "rgba(255,255,255,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="QR Code"
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
            onClick={() => setWalletOpen(true)}
            style={{
              minHeight: 42,
              padding: "8px 10px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              cursor: "pointer",
              color: "rgba(255,255,255,0.65)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Wallet"
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
        className="flex-1 overflow-y-auto"
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
      <BottomNav tabs={tabs} active={activeTab} onChange={onTabChange} accentColor={accentColor} />

      {phoneFrame && <HomeIndicator accentColor={accentColor} />}

      {/* ── Role Switcher Bottom Sheet ────────────────────────────────────── */}
      <div
        onClick={() => setSwitcherOpen(false)}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(13,13,20,0.45)",
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
          background: "#15151E",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "18px 18px 0 0",
          padding: "0 0 calc(16px + env(safe-area-inset-bottom, 0px))",
          transform: switcherOpen ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.26s cubic-bezier(0.32,0.72,0,1)",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.3)",
        }}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 8px" }}>
          <div style={{ width: 32, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.12)" }} />
        </div>

        {/* Sheet header */}
        <div style={{ padding: "4px 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
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
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 12px",
                  borderRadius: 14,
                  border: isActive ? `1px solid ${r.accent}35` : "1px solid transparent",
                  background: isActive ? `${r.accent}12` : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.12s ease",
                  marginBottom: 4,
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
                      color: isActive ? r.accent : "#fff",
                      lineHeight: 1.2,
                      marginBottom: 3,
                    }}
                  >
                    {r.label}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", letterSpacing: "0.03em" }}>
                    {r.tagline}
                  </div>
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
            onClick={() => setSwitcherOpen(false)}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.45)",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
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
              border: "1px solid rgba(255,80,80,0.18)",
              background: "rgba(255,80,80,0.06)",
              color: "rgba(255,100,100,0.7)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
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
          onClose={() => setWalletOpen(false)}
        />
      )}
    </>
  );

  // ─── Phone-frame render mode ────────────────────────────────────────────────

  if (phoneFrame) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          background: `
            radial-gradient(ellipse 700px 500px at 50% 20%, ${accentColor}1a, transparent 60%),
            radial-gradient(ellipse 500px 400px at 20% 80%, rgba(100,80,220,0.12), transparent 65%),
            radial-gradient(ellipse 500px 400px at 80% 70%, rgba(52,238,182,0.08), transparent 65%),
            #08080f
          `,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Left context area (two columns) */}
        <div
          className="hidden lg:block"
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "max(12px, calc(50% - 660px))",
            width: "min(520px, calc(50% - 260px - 24px))",
            padding: "72px 16px 40px",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, height: "100%" }}>
            <DeepDiveLinksColumn accentColor={accentColor} />
            {learnMoreColumn}
          </div>
        </div>

        {/* Right context panel */}
        {rightPanel && (
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
            }}
          >
            {rightPanel}
          </div>
        )}

        {/* Device wrapper — side buttons */}
        <div style={{ position: "relative", height: "calc(100vh - 32px)", maxHeight: 900 }}>
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
              background: `linear-gradient(145deg, ${accentColor}90 0%, rgba(130,100,240,0.6) 45%, rgba(52,238,182,0.5) 100%)`,
              boxShadow: `
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
                background: "#12121c",
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

      {/* Left context area (two columns) */}
      <div
        className="hidden lg:block"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "max(12px, calc(50% - 660px))",
          width: "min(520px, calc(50% - 260px - 24px))",
          padding: "72px 16px 40px",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, height: "100%" }}>
          <DeepDiveLinksColumn accentColor={accentColor} />
          {learnMoreColumn}
        </div>
      </div>

      {/* Right context panel */}
      {rightPanel && (
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

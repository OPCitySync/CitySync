"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAccount } from "@account-kit/react";
import { useRouter } from "next/navigation";
import { formatUnits } from "viem";
import AppShell from "../_components/AppShell";
import { LearnInfoCard, LearnMoreLink, LearnMorePanel } from "../_components/LearnMore";
import { NavTab } from "../_components/BottomNav";
import { OnchainActivityPanel } from "../_components/OnchainActivityPanel";
import { baseSepoliaPublicClient } from "../_config/baseSepoliaClient";
import { BASE_SEPOLIA_CONTRACTS } from "../_config/baseSepoliaContracts";
import { useDemo } from "../_context/DemoContext";
import { FAKE_WALLETS, PastRedemption, RedemptionOffer, Task, TaskCategory } from "../_data/mockData";
import { compressPhotoToBase64 } from "../_utils/compressPhoto";
import {
  PREMIUM_TASK_RATE_THRESHOLD,
  getParticipantScoreSnapshot,
  getSanctionPolicyForSnapshot,
  type ParticipantScoreSnapshot,
} from "../_utils/participantScoring";
import {
  clearDemoTutorialRun,
  getDemoTutorialOfferingIds,
  getDemoTutorialTaskIds,
  startDemoTutorialRun,
} from "../_utils/tutorialRun";

// ─── Brand ────────────────────────────────────────────────────────────────────

const ACCENT = "#4169E1"; // blue — primary
const TEAL = "#34eeb6"; // teal — tasks / rewards / verify
const GOLD = "#DD9E33"; // gold — MCE / redemptions
const PURPLE = "#a78bfa"; // purple — governance / vote
const ISSUER_TUTORIAL_STORAGE_KEY = "citysync:demo:issuer:tutorial:v1";
type IssuerTutorialStep =
  | "intro"
  | "box1"
  | "box2"
  | "box3"
  | "box4"
  | "box5"
  | "box6"
  | "box7"
  | "box8"
  | "box9"
  | "box10"
  | "box11"
  | "box12"
  | "box13"
  | "box14"
  | "box15"
  | "box16"
  | "box17"
  | "box18"
  | "box19"
  | "box20"
  | "box21"
  | "box22"
  | "box23"
  | "box24"
  | "box25"
  | "box26"
  | "dismissed";
const PARTICIPANT_ROLE_TUTORIAL_STEPS = new Set<IssuerTutorialStep>([
  "intro",
  "box10",
  "box11",
  "box12",
  "box13",
  "box14",
  "box23",
  "box24",
  "box25",
  "box26",
  "dismissed",
]);
const SHARED_TUTORIAL_INTRO_TEXT =
  "Everything in this demo has a shared onchain state for critical functions, and local storage that allows edits to your profile, picture, etc. to persist.\n\nEvery transaction you make is visible to all users and roles. When you sign up for City/Sync you are automatically provided a wallet, and all transaction costs are sponsored.\n\nWhile transaction verification will be shown in this demo, users in the Pilot Program will be completely unaware of smart-contract interactions. The purpose of this demo is to simulate as closely as possible to the UX for each role in the pilot, and provide testers an understanding of the underlying functionality. Let's get started!";

function readIssuerTutorialStepFromStorage(): IssuerTutorialStep {
  if (typeof window === "undefined") return "intro";
  try {
    const raw = window.localStorage.getItem(ISSUER_TUTORIAL_STORAGE_KEY);
    if (raw === "dismissed") return "dismissed";
  } catch {
    // Ignore storage failures.
  }
  return "intro";
}

type ParticipantLearnCardKey =
  | "profile-overview"
  | "explore-onboarding"
  | "explore-task-flow"
  | "explore-verify"
  | "mycity-feed"
  | "vote-overview"
  | "redeem-flow";

const PARTICIPANT_LEARN_CARDS: Record<ParticipantLearnCardKey, LearnInfoCard> = {
  "profile-overview": {
    title: "Participant Account and Identity",
    subtitle: "How your profile works",
    body: "Your City/Sync sign-in provisions a smart account for onchain actions and syncs CITY, VOTE, and MCE balances from contract state. Your profile tracks participation history, completed tasks, and governance activity, building a civic reputation tied to verified community contributions.",
  },
  "explore-onboarding": {
    title: "Onboarding Requirement",
    subtitle: "Why onboarding exists",
    body: "Onboarding confirms real community membership through an in-person step. Once activated, your account can interact with the wider City/Sync task and redemption ecosystem.",
  },
  "explore-task-flow": {
    title: "Task Lifecycle",
    subtitle: "Open → Claimed → Completed",
    body: "Claim tasks from the open pool, execute and submit completion, and track progression through verification to completion. This keeps participant work visible and auditable.",
  },
  "explore-verify": {
    title: "Verification",
    subtitle: "How rewards are minted",
    body: "Issuers verify task completions onchain. Verification mints CITY and VOTE rewards to the participant account, creating a direct record of civic work and rewards.",
  },
  "mycity-feed": {
    title: "MyCity Feed",
    subtitle: "Local information layer",
    body: "MyCity is a role-shared civic feed where organizations publish events, announcements, and opportunities. It functions as coordination context around task participation.",
  },
  "vote-overview": {
    title: "Voting and MCE Governance",
    subtitle: "Using earned VOTE",
    body: "VOTE is earned through civic contribution and used in time-bounded proposal rounds where participants allocate vote weight to proposals. MCEs are mission-oriented cycles where the community signals priorities and organizations execute coordinated tasks, linking governance outcomes to tangible civic execution.\n\nEpoch 2 — Upcoming: These proposals are gathering community support for the next voting epoch. Like the ones you want considered — the top-liked proposals may be selected by the committee for Epoch 2 voting.",
  },
  "redeem-flow": {
    title: "Redemption Flow",
    subtitle: "Using CITY credits",
    body: "CITY credits are redeemed against partner offerings. In production, participants scan the redeemer QR code at point of sale to initiate redemption, then confirm the transaction to execute contract logic onchain and update available balance.",
  },
};

type OpportunityRaw = readonly [
  issuer: `0x${string}`,
  metadataURI: string,
  rewardCity: bigint,
  rewardVote: bigint,
  eligibilityHook: `0x${string}`,
  mode: number,
  maxCompletions: bigint,
  expiresAt: bigint,
  cooldownSeconds: bigint,
  active: boolean,
  verifiedCount: number,
];

async function multicallInChunks(contracts: any[], chunkSize = 200) {
  const all: any[] = [];
  for (let i = 0; i < contracts.length; i += chunkSize) {
    const chunk = contracts.slice(i, i + chunkSize);
    const results = await baseSepoliaPublicClient.multicall({
      contracts: chunk as any,
      allowFailure: true,
    });
    all.push(...results);
  }
  return all;
}

// ─── Micro-components ─────────────────────────────────────────────────────────

function SectionLabel({
  text,
  right,
  accentColor = ACCENT,
}: {
  text: string;
  right?: React.ReactNode;
  accentColor?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <span
          style={{
            width: 3,
            height: 12,
            borderRadius: 2,
            background: `linear-gradient(180deg, ${accentColor}, ${accentColor}55)`,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase" as const,
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          {text}
        </span>
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

function getParticipantRightPanel(activeTab: string): React.ReactNode {
  const rightPanel = <OnchainActivityPanel role="participant" accent={ACCENT} />;

  switch (activeTab) {
    case "profile":
    case "explore":
    case "mycity":
    case "vote":
    case "redeem":
      return rightPanel;
    default:
      return rightPanel;
  }
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconUser = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);
const IconCompass = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);
const IconCity = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconGift = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);
const IconPencil = ({ size = 14 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconCheck = ({ size = 14 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconXSmall = ({ size = 14 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconHeart = ({ filled }: { filled: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const IconLock = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconSearch = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ─── Shared card style ────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  padding: "16px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.22)",
};
const cardAccent: React.CSSProperties = {
  ...card,
  borderLeft: "3px solid rgba(52,238,182,0.45)",
  paddingLeft: 13,
};
const cardGold: React.CSSProperties = {
  ...card,
  borderLeft: "3px solid rgba(221,158,51,0.45)",
  paddingLeft: 13,
};
const cardPurple: React.CSSProperties = {
  ...card,
  borderLeft: "3px solid rgba(167,139,250,0.5)",
  paddingLeft: 13,
};
const miniMetricCardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  padding: "10px 11px",
};
const miniMetricLabelStyle: React.CSSProperties = {
  fontSize: 11,
  color: "rgba(255,255,255,0.5)",
};
const miniMetricValueStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: TEAL,
  marginTop: 4,
  lineHeight: 1.1,
};

// ─── Category pill colors ─────────────────────────────────────────────────────

const CAT_COLORS: Record<string, string> = {
  Onboarding: "#34eeb6",
  Environment: "#4CAF50",
  Education: "#9C27B0",
  Community: "#FF9800",
  Health: "#E91E63",
  Infrastructure: "#607D8B",
};

// ─── Claim Confirmation Sheet ─────────────────────────────────────────────────

function ClaimConfirmSheet({
  task,
  onConfirm,
  onCancel,
  tutorialAllowConfirm = false,
}: {
  task: Task;
  onConfirm: () => void;
  onCancel: () => void;
  tutorialAllowConfirm?: boolean;
}) {
  return (
    <>
      <style>{`
        @keyframes walletSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      {/* Overlay wrapper — pointerEvents:none so BottomNav area stays clickable */}
      <div style={{ position: "fixed", inset: 0, zIndex: 220, pointerEvents: "none" }}>
        {/* Backdrop — stops at BottomNav top (69 px from bottom) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 69,
            background: "rgba(0,0,0,0.45)",
            pointerEvents: "auto",
          }}
          onClick={onCancel}
        />

        {/* Sheet — bottom quarter, slides up from above BottomNav */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 69,
            minHeight: 180,
            maxHeight: "32%",
            zIndex: 1,
            background: "#1E1E2C",
            borderRadius: "24px 24px 0 0",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.55)",
            padding: "20px 24px 24px",
            animation: "walletSlideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1) both",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 16,
            overflowY: "auto",
            pointerEvents: "auto",
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 8 }}>
              Claim &quot;{task.title}&quot;?
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.4 }}>
              Please note: you are only allowed to claim two tasks at any one time.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              data-tutorial-allow={tutorialAllowConfirm ? "true" : undefined}
              style={{
                flex: 1,
                background: tutorialAllowConfirm
                  ? "linear-gradient(145deg, rgba(221,158,51,0.95), rgba(221,158,51,0.78))"
                  : TEAL,
                border: tutorialAllowConfirm ? "1px solid rgba(255,226,162,0.9)" : "none",
                color: "#0f0f1e",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: tutorialAllowConfirm
                  ? "0 0 0 1px rgba(255,226,162,0.4), 0 0 12px rgba(221,158,51,0.42)"
                  : undefined,
                animation: tutorialAllowConfirm ? "tutorialPulse 1.45s ease-in-out infinite" : undefined,
              }}
            >
              Claim
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Unclaim Confirmation Sheet ────────────────────────────────────────────────

function UnclaimConfirmSheet({
  task,
  onConfirm,
  onCancel,
}: {
  task: Task;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <style>{`
        @keyframes walletSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      {/* Overlay wrapper — pointerEvents:none so BottomNav area stays clickable */}
      <div style={{ position: "fixed", inset: 0, zIndex: 220, pointerEvents: "none" }}>
        {/* Backdrop — stops at BottomNav top (69 px from bottom) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 69,
            background: "rgba(0,0,0,0.45)",
            pointerEvents: "auto",
          }}
          onClick={onCancel}
        />

        {/* Sheet — bottom quarter, slides up from above BottomNav */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 69,
            minHeight: 180,
            maxHeight: "32%",
            zIndex: 1,
            background: "#1E1E2C",
            borderRadius: "24px 24px 0 0",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.55)",
            padding: "20px 24px 24px",
            animation: "walletSlideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1) both",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 16,
            overflowY: "auto",
            pointerEvents: "auto",
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 8 }}>
              Unclaim &quot;{task.title}&quot;?
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.4 }}>
              If you are unclaiming close to the date of task execution, please message the Issuer Organization
              directly.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              style={{
                flex: 1,
                background: "#ff6b9d",
                border: "none",
                color: "white",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Unclaim
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS: NavTab[] = [
  { key: "profile", label: "Profile", icon: <IconUser /> },
  { key: "explore", label: "Explore", icon: <IconCompass /> },
  { key: "community", label: "Community", icon: <IconCity /> },
  { key: "redeem", label: "Redeem", icon: <IconGift /> },
];

// ─── Execute Task Modal ───────────────────────────────────────────────────────

function ExecuteModal({
  task,
  onConfirm,
  onClose,
  tutorialAllowSubmit = false,
}: {
  task: Task;
  onConfirm: () => void;
  onClose: () => void;
  tutorialAllowSubmit?: boolean;
}) {
  const [notes, setNotes] = React.useState("");
  const [fileName, setFileName] = React.useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  return (
    <>
      <style>{`
        @keyframes walletSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      {/* Full-height slide sheet — fills content area between header and BottomNav */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "fixed",
          top: 112,
          left: 0,
          right: 0,
          bottom: 69,
          zIndex: 221,
          background: "#14172e",
          borderRadius: "12px 12px 0 0",
          animation: "walletSlideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1) both",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 20px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            flexShrink: 0,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 16, color: "white" }}>Submit for Verification</span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.4)",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <IconXSmall size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 24px" }}>
          <div
            style={{
              marginBottom: 16,
              padding: "14px 16px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10,
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 14, color: "white", marginBottom: 4 }}>{task.title}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
              {task.issuerName} · {task.estimatedTime}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <div
              style={{
                flex: 1,
                background: "rgba(52,238,182,0.08)",
                border: "1px solid rgba(52,238,182,0.2)",
                borderRadius: 8,
                padding: "10px 0",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 700, color: TEAL }}>+{task.credits}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>CITYx</div>
            </div>
            <div
              style={{
                flex: 1,
                background: "rgba(65,105,225,0.08)",
                border: "1px solid rgba(65,105,225,0.2)",
                borderRadius: 8,
                padding: "10px 0",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 700, color: ACCENT }}>+{task.voteTokens}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>VOTE</div>
            </div>
            {task.isMCE && (
              <div
                style={{
                  flex: 1,
                  background: "rgba(221,158,51,0.08)",
                  border: "1px solid rgba(221,158,51,0.2)",
                  borderRadius: 8,
                  padding: "10px 0",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 700, color: GOLD }}>+{task.credits}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>MCE</div>
              </div>
            )}
          </div>

          {/* File upload */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>
              Proof of Completion (optional)
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                width: "100%",
                padding: "12px 0",
                background: "rgba(255,255,255,0.04)",
                border: "1px dashed rgba(255,255,255,0.18)",
                borderRadius: 10,
                color: fileName ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.4)",
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {fileName ?? "Upload photo or document"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              style={{ display: "none" }}
              onChange={e => setFileName(e.target.files?.[0]?.name ?? null)}
            />
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>
              Notes to Issuer (optional)
            </div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Describe how you completed the task, any relevant context, or questions for the issuer..."
              rows={3}
              style={{
                width: "100%",
                padding: "12px 14px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                color: "white",
                fontSize: 13,
                lineHeight: 1.5,
                resize: "none",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>

          <button
            data-tutorial-allow={tutorialAllowSubmit ? "true" : undefined}
            onClick={onConfirm}
            style={{
              width: "100%",
              padding: "14px 0",
              background: ACCENT,
              color: "white",
              border: "none",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Submit Proof for Verification
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Redeem Confirm Modal ─────────────────────────────────────────────────────

function QRIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
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
  );
}

function RedeemModal({
  offer,
  onConfirm,
  onClose,
  pending = false,
  confirmed = false,
  error,
  tutorialHighlightConfirm = false,
}: {
  offer: RedemptionOffer;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  pending?: boolean;
  confirmed?: boolean;
  error?: string;
  tutorialHighlightConfirm?: boolean;
}) {
  React.useEffect(() => {
    if (confirmed) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [confirmed, onClose]);

  return (
    <>
      <style>{`
        @keyframes walletSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes flashConfirm {
          0%, 100% { background-color: rgb(26, 29, 50); }
          50% { background-color: rgb(10, 60, 30); }
        }
        @keyframes tutorialPulse {
          0%, 100% { box-shadow: 0 0 0 1px rgba(255,226,162,0.28), 0 0 10px rgba(221,158,51,0.24); }
          50% { box-shadow: 0 0 0 1px rgba(255,226,162,0.6), 0 0 18px rgba(221,158,51,0.46); }
        }
      `}</style>
      {/* Overlay wrapper — fixed so sheet doesn't scroll with page content */}
      <div style={{ position: "fixed", inset: 0, zIndex: 220, pointerEvents: "none" }}>
        {/* Sheet — constrained to app content area between nav bar and bottom tabs */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 112,
            bottom: 69,
            zIndex: 1,
            background: "rgb(26, 29, 50)",
            borderRadius: "20px 20px 0 0",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "24px 20px 24px",
            overflowY: "auto",
            animation: confirmed
              ? "flashConfirm 0.5s ease-in-out 0s 10"
              : "walletSlideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1) both",
            pointerEvents: "auto",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: "white" }}>Confirm Redemption</span>
            <button
              onClick={onClose}
              disabled={pending}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}
            >
              <IconXSmall size={18} />
            </button>
          </div>

          <div style={{ textAlign: "center", padding: "20px 0 16px" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>{offer.emoji}</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "white", marginBottom: 4 }}>{offer.offerTitle}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>{offer.redeemerName}</div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(52,238,182,0.12)",
                border: "1px solid rgba(52,238,182,0.32)",
                borderRadius: 20,
                padding: "6px 14px",
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 700, color: TEAL }}>{offer.costCity} CITYx</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>will be spent</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10,
              padding: "14px",
              marginBottom: 20,
            }}
          >
            <div style={{ color: "rgba(255,255,255,0.38)", flexShrink: 0, marginTop: 2 }}>
              <QRIcon />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.86)", marginBottom: 4 }}>
                QR Code at Point of Sale
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.58)", lineHeight: 1.5 }}>
                In production, a redemption QR code is generated for each offering that calls the &ldquo;Burn
                Function&rdquo; on the token contract for the credit rate of that offering. These QR codes will be
                available near PoS systems for the redeemer organization. In this demo, the function is called
                instantly.
              </div>
            </div>
          </div>

          <button
            data-tutorial-allow={tutorialHighlightConfirm && !confirmed ? "true" : undefined}
            onClick={onConfirm}
            disabled={pending || confirmed}
            style={{
              width: "100%",
              padding: "14px 0",
              background: confirmed
                ? "rgb(10, 120, 60)"
                : tutorialHighlightConfirm
                  ? "linear-gradient(145deg, rgba(221,158,51,0.95), rgba(221,158,51,0.78))"
                  : TEAL,
              color: confirmed ? "#d4ffe9" : "#15151E",
              border: tutorialHighlightConfirm && !confirmed ? "1px solid rgba(255,226,162,0.92)" : "none",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 15,
              cursor: pending || confirmed ? "not-allowed" : "pointer",
              opacity: pending ? 0.8 : 1,
              transition: "background 0.3s ease",
              boxShadow:
                tutorialHighlightConfirm && !confirmed
                  ? "0 0 0 1px rgba(255,226,162,0.38), 0 0 12px rgba(221,158,51,0.44)"
                  : undefined,
              animation:
                tutorialHighlightConfirm && !confirmed ? "tutorialPulse 1.45s ease-in-out infinite" : undefined,
            }}
          >
            {confirmed ? "Confirmed" : pending ? "Confirming..." : "Redeem Now"}
          </button>
          {error ? (
            <div style={{ marginTop: 10, fontSize: 11, color: "rgba(255,107,157,0.9)", lineHeight: 1.45 }}>{error}</div>
          ) : null}
        </div>
      </div>
    </>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  const isError = /fail|error|not ready/i.test(message);
  const isInfo = /submitting|approving|pending/i.test(message);
  const accentBorder = isError ? "rgba(255,107,157,0.65)" : isInfo ? "rgba(130,160,255,0.55)" : "rgba(52,238,182,0.55)";
  const iconColor = isError ? "#ff6b9d" : isInfo ? "#8aa8ff" : TEAL;

  useEffect(() => {
    const t = setTimeout(onDismiss, isInfo ? 8000 : 3500);
    return () => clearTimeout(t);
  }, [onDismiss, isInfo]);

  return (
    <>
      <style>{`
        @keyframes toastUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          bottom: 28,
          right: 24,
          animation: "toastUp 0.2s cubic-bezier(0.34,1.36,0.64,1) both",
          background: "rgba(20,22,32,0.97)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderLeft: `3px solid ${accentBorder}`,
          borderRadius: 10,
          padding: "10px 12px 10px 13px",
          fontSize: 13,
          fontWeight: 500,
          zIndex: 400,
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
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
        <span style={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.45, flex: 1 }}>{message}</span>
        <button
          onClick={onDismiss}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.28)",
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

// ═════════════════════════════════════════════════════════════════════════════
// PROFILE TAB
// ═════════════════════════════════════════════════════════════════════════════

function ProfileTab({
  onTabChange,
  onLearnMore,
}: {
  onTabChange: (tab: string) => void;
  onLearnMore: (key: ParticipantLearnCardKey) => void;
}) {
  const { state, setCitizenName } = useDemo();
  const { address } = useAccount({ type: "ModularAccountV2" });
  const p = state.participant;
  const participantAddress = address ?? FAKE_WALLETS.participant;
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(p.citizenName);
  const inputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [section, setSection] = useState<"profile" | "dashboard">("profile");
  const [localCompletedTasks, setLocalCompletedTasks] = useState<Array<Task & { completedAt: string }>>([]);
  const [scoreSnapshot, setScoreSnapshot] = useState<ParticipantScoreSnapshot>(() =>
    getParticipantScoreSnapshot(participantAddress),
  );

  const photoStorageKey = `citysync:demo:profile:photo:participant:v1:${participantAddress.toLowerCase()}`;
  const nameStorageKey = `citysync:demo:participant:name:v1:${participantAddress.toLowerCase()}`;

  // Hydrate citizen name from localStorage on mount (works even without wallet connection).
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem(nameStorageKey);
      if (saved && !p.citizenName) {
        setCitizenName(saved);
        setNameInput(saved);
      }
    } catch {
      // Ignore hydration failures.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameStorageKey]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressPhotoToBase64(file)
      .then(dataUrl => {
        setPhotoUrl(dataUrl);
        try {
          window.localStorage.setItem(photoStorageKey, dataUrl);
        } catch {
          // Storage full or unavailable — photo shows in-session only.
        }
      })
      .catch(() => {
        // Fallback: show photo in-session without persistence.
        setPhotoUrl(URL.createObjectURL(file));
      });
  };

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  // Hydrate profile photo from localStorage on mount / address change.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem(photoStorageKey);
      if (saved) setPhotoUrl(saved);
    } catch {
      // Ignore.
    }
  }, [photoStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const walletKey = participantAddress.toLowerCase();
    const completedKey = `citysync:demo:participant:completed-tasks:${walletKey}`;
    try {
      const rawCompleted = window.localStorage.getItem(completedKey);
      if (!rawCompleted) {
        setLocalCompletedTasks([]);
        return;
      }
      const parsed = JSON.parse(rawCompleted) as Array<Task & { completedAt: string }>;
      setLocalCompletedTasks(Array.isArray(parsed) ? parsed : []);
    } catch {
      setLocalCompletedTasks([]);
    }
  }, [participantAddress]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => setScoreSnapshot(getParticipantScoreSnapshot(participantAddress));
    sync();
    const id = window.setInterval(sync, 2500);
    window.addEventListener("storage", sync);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("storage", sync);
    };
  }, [participantAddress]);

  const saveEdit = () => {
    const trimmed = nameInput.trim();
    if (trimmed) {
      setCitizenName(trimmed);
      try {
        window.localStorage.setItem(nameStorageKey, trimmed);
      } catch {
        /* ignore */
      }
    }
    setEditing(false);
  };
  const cancelEdit = () => {
    setNameInput(p.citizenName);
    setEditing(false);
  };

  const completedHistory = React.useMemo(() => {
    type CompletedHistoryItem = {
      key: string;
      title: string;
      credits: number;
      voteTokens: number;
      completedAt: string;
      issuerName: string;
      txHash?: string;
    };
    const fromOnchain: CompletedHistoryItem[] = p.completedTasks.map(t => ({
      key: t.taskId,
      title: t.title,
      credits: t.credits,
      voteTokens: t.voteTokens,
      completedAt: t.completedAt,
      issuerName: t.issuerName,
      txHash: t.txHash,
    }));
    const fromLocal: CompletedHistoryItem[] = localCompletedTasks.map(t => ({
      key: t.id,
      title: t.title,
      credits: t.credits,
      voteTokens: t.voteTokens,
      completedAt: t.completedAt,
      issuerName: t.issuerName,
    }));
    const dedup = new Map<string, CompletedHistoryItem>();
    [...fromLocal, ...fromOnchain].forEach(item => {
      const existing = dedup.get(item.key);
      if (!existing) {
        dedup.set(item.key, item);
        return;
      }
      if (new Date(item.completedAt).getTime() > new Date(existing.completedAt).getTime()) {
        dedup.set(item.key, item);
      }
    });
    return Array.from(dedup.values()).sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    );
  }, [localCompletedTasks, p.completedTasks]);

  const totalCityEarned = completedHistory.reduce((sum, task) => sum + task.credits, 0);
  const totalVoteEarned = completedHistory.reduce((sum, task) => sum + task.voteTokens, 0);
  const sanctionsPolicy = getSanctionPolicyForSnapshot(scoreSnapshot);
  const tierColor =
    scoreSnapshot.tier === "Green"
      ? TEAL
      : scoreSnapshot.tier === "Yellow"
        ? "#ffad66"
        : scoreSnapshot.tier === "Orange"
          ? "#ff8f4d"
          : "#ff6b9d";

  return (
    <div style={{ padding: "20px 16px 24px" }}>
      <div
        style={{
          display: "flex",
          background: "rgba(255,255,255,0.05)",
          borderRadius: 10,
          padding: 4,
          marginBottom: 14,
        }}
      >
        {(
          [
            { key: "profile" as const, label: "Profile", color: ACCENT },
            { key: "dashboard" as const, label: "Dashboard", color: TEAL },
          ] as const
        ).map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setSection(key)}
            style={{
              flex: 1,
              padding: "9px 0",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              background: section === key ? color : "transparent",
              color: section === key ? (key === "profile" ? "white" : "#15151E") : "rgba(255,255,255,0.45)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {section === "profile" && (
        <>
          <div
            style={{
              background: "linear-gradient(135deg, #0f1f42 0%, #1E1E2C 100%)",
              border: "1px solid rgba(65,105,225,0.25)",
              borderRadius: 20,
              padding: "20px",
              marginBottom: 14,
              boxShadow: "0 2px 12px rgba(0,0,0,0.28)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 6,
                marginBottom: 4,
                flexWrap: "nowrap",
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "rgba(65,105,225,0.75)",
                  whiteSpace: "nowrap",
                }}
              >
                Civic Participant
              </div>
              <LearnMoreLink onClick={() => onLearnMore("profile-overview")} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handlePhotoChange}
              />
              <button
                onClick={() => photoInputRef.current?.click()}
                title="Upload profile photo"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: photoUrl ? "transparent" : "rgba(65,105,225,0.15)",
                  border: `1px ${photoUrl ? "solid transparent" : "dashed rgba(65,105,225,0.4)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flexShrink: 0,
                  cursor: "pointer",
                  padding: 0,
                  overflow: "hidden",
                }}
              >
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span>👤</span>
                )}
              </button>
              <div>
                {editing ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      ref={inputRef}
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.stopPropagation();
                          saveEdit();
                        }
                        if (e.key === "Escape") cancelEdit();
                      }}
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(65,105,225,0.5)",
                        borderRadius: 8,
                        padding: "6px 10px",
                        color: "white",
                        fontSize: 16,
                        fontWeight: 700,
                        outline: "none",
                        width: 170,
                      }}
                    />
                    <button
                      onClick={saveEdit}
                      style={{ background: "none", border: "none", color: TEAL, cursor: "pointer", padding: 0 }}
                    >
                      <IconCheck size={16} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      style={{
                        background: "none",
                        border: "none",
                        color: "rgba(255,255,255,0.4)",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      <IconXSmall size={16} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: p.citizenName ? "white" : "rgba(255,255,255,0.4)",
                      }}
                    >
                      {p.citizenName || "Set your name"}
                    </span>
                    <button
                      onClick={() => {
                        setNameInput(p.citizenName);
                        setEditing(true);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "rgba(255,255,255,0.45)",
                        padding: 4,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <IconPencil size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                color: "rgba(255,255,255,0.35)",
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>
                {participantAddress.slice(0, 8)}...{participantAddress.slice(-6)}
              </span>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(participantAddress);
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1200);
                  } catch {
                    // Ignore clipboard failures.
                  }
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: copied ? TEAL : ACCENT,
                  cursor: "pointer",
                  fontSize: 13,
                  padding: "0 2px",
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                }}
                title="Copy address"
              >
                {copied ? "✓" : "⧉"}
              </button>
              <a
                href={`https://sepolia.basescan.org/address/${participantAddress}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: ACCENT,
                  fontSize: 11,
                  textDecoration: "none",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  padding: "0 2px",
                }}
                title="View on block explorer"
              >
                View Account ↗
              </a>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  background: "rgba(65,105,225,0.16)",
                  color: ACCENT,
                  borderRadius: 20,
                  padding: "3px 10px",
                  border: "1px solid rgba(65,105,225,0.3)",
                }}
              >
                Civic Participant
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.45)",
                  borderRadius: 20,
                  padding: "3px 10px",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                Base Sepolia
              </span>
            </div>
          </div>

          <div
            style={{
              background: "rgba(65,105,225,0.08)",
              border: "1px solid rgba(65,105,225,0.2)",
              borderRadius: 14,
              padding: "14px 16px",
              marginBottom: 14,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 4 }}>
              Your Role as a Civic Participant
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, margin: 0 }}>
              Civic Participants claim and execute tasks that support local priorities, then submit completion for
              issuer verification. Verified contributions earn CITY and VOTE rewards onchain, creating a direct path
              from civic action to governance influence and redemption utility.
            </p>
          </div>

          <div style={{ ...card }}>
            <SectionLabel text="Quick Actions" accentColor={ACCENT} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button
                onClick={() => onTabChange("explore")}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  padding: "12px 10px",
                  color: "white",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Browse Tasks
              </button>
              <button
                onClick={() => onTabChange("redeem")}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  padding: "12px 10px",
                  color: "white",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Browse Offerings
              </button>
            </div>
          </div>
        </>
      )}

      {section === "dashboard" && (
        <>
          <div style={{ ...card, marginBottom: 12 }}>
            <SectionLabel text="Positive Activity" accentColor={TEAL} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={miniMetricCardStyle}>
                <div style={miniMetricLabelStyle}>Tasks Completed</div>
                <div style={miniMetricValueStyle}>{completedHistory.length}</div>
              </div>
              <div style={miniMetricCardStyle}>
                <div style={miniMetricLabelStyle}>CITY Earned</div>
                <div style={miniMetricValueStyle}>{totalCityEarned}</div>
              </div>
              <div style={miniMetricCardStyle}>
                <div style={miniMetricLabelStyle}>VOTE Earned</div>
                <div style={miniMetricValueStyle}>{totalVoteEarned}</div>
              </div>
              <div style={miniMetricCardStyle}>
                <div style={miniMetricLabelStyle}>Consecutive Successes</div>
                <div style={miniMetricValueStyle}>{scoreSnapshot.consecutiveSuccesses}</div>
              </div>
            </div>
          </div>

          <div style={{ ...card, marginBottom: 12 }}>
            <SectionLabel text="RD / RS Status" accentColor={tierColor} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
              <div style={miniMetricCardStyle}>
                <div style={miniMetricLabelStyle}>RD</div>
                <div style={{ ...miniMetricValueStyle, color: tierColor }}>{scoreSnapshot.db.toFixed(1)}</div>
              </div>
              <div style={miniMetricCardStyle}>
                <div style={miniMetricLabelStyle}>RS</div>
                <div style={{ ...miniMetricValueStyle, color: "#fff" }}>{scoreSnapshot.rs.toFixed(1)}</div>
              </div>
              <div style={miniMetricCardStyle}>
                <div style={miniMetricLabelStyle}>Status</div>
                <div style={{ ...miniMetricValueStyle, color: tierColor }}>{scoreSnapshot.tier}</div>
              </div>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: "10px 12px",
                marginBottom: 10,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Sanctions Summary</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", lineHeight: 1.55 }}>
                Verify & Mint improves score (RS +0.5, RD -0.5). Reject & Mint (RS -1.5, RD +2) and No-Show (RS -1, RD
                +1) increase restrictions. Current policy: {sanctionsPolicy.summary}
              </div>
              <a
                href="/demo/graduate-sanctions"
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  color: ACCENT,
                  textDecoration: "none",
                }}
              >
                Read full Graduated Sanctions policy ↗
              </a>
            </div>
          </div>

          <div style={{ ...card }}>
            <SectionLabel text="Completed Tasks" accentColor={TEAL} />
            {completedHistory.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "14px 0 8px",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.32)",
                }}
              >
                No completed tasks yet.
              </div>
            ) : (
              completedHistory.map((task, i) => (
                <div
                  key={task.key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: i < completedHistory.length - 1 ? 10 : 0,
                    marginBottom: i < completedHistory.length - 1 ? 10 : 0,
                    borderBottom: i < completedHistory.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{task.title}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                      {task.issuerName} · {fmtDateTime(task.completedAt)}
                      {task.txHash ? (
                        <>
                          {" · "}
                          <a
                            href={`https://sepolia.basescan.org/tx/${task.txHash}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: ACCENT, textDecoration: "none" }}
                          >
                            tx
                          </a>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: TEAL }}>+{task.credits} CITYx</div>
                    <div style={{ fontSize: 11, color: `${ACCENT}cc`, marginTop: 1 }}>+{task.voteTokens} VOTE</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// EXPLORE TAB
// ═════════════════════════════════════════════════════════════════════════════

const ALL_CATEGORIES: TaskCategory[] = [
  "Onboarding",
  "Environment",
  "Education",
  "Community",
  "Health",
  "Infrastructure",
];

const DEMO_LOCAL_ONBOARDING_TASK: Task = {
  id: "onboarding-demo-local",
  title: "In-Person Account Activation",
  description:
    "Complete a quick in-person onboarding check-in with a City/Sync representative. This activates your account and unlocks the full task catalog.",
  category: "Onboarding",
  credits: 0,
  voteTokens: 0,
  estimatedTime: "10-15 min",
  location: "City Hall - Civic Services Desk",
  slots: 9999,
  slotsRemaining: 9999,
  issuerName: "City/Sync Onboarding",
  issuerId: "citysync-onboarding",
  tags: ["onboarding", "in-person"],
  isOnboarding: true,
  taskDate: "Walk-in during onboarding hours",
  successCriteria: "Complete the in-person identity and account activation check.",
  creditRatePerHr: 0,
  credentials: "Government ID",
};

function TaskCard({
  task,
  isClaimed,
  locked,
  pendingVerification,
  canUnclaim,
  showClaimButton,
  showUnclaimButton,
  tutorialAllowClaim,
  tutorialHighlightActions,
  onClaim,
  onUnclaim,
  onExecute,
}: {
  task: Task;
  isClaimed: boolean;
  locked: boolean;
  pendingVerification?: boolean;
  canUnclaim?: boolean;
  showClaimButton?: boolean;
  showUnclaimButton?: boolean;
  tutorialAllowClaim?: boolean;
  tutorialHighlightActions?: boolean;
  onClaim?: () => void;
  onUnclaim?: () => void;
  onExecute?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const catColor = CAT_COLORS[task.category] ?? "#666";

  return (
    <div
      style={{
        ...card,
        marginBottom: 10,
        borderLeft: task.isMCE ? "3px solid rgba(221,158,51,0.45)" : "3px solid rgba(52,238,182,0.45)",
        paddingLeft: 13,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ flex: 1, paddingRight: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 20,
                background: `${catColor}22`,
                color: catColor,
                border: `1px solid ${catColor}44`,
              }}
            >
              {task.category}
            </span>
            {task.isMCE && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 20,
                  background: "rgba(221,158,51,0.15)",
                  color: GOLD,
                  border: "1px solid rgba(221,158,51,0.3)",
                }}
              >
                MCE
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: locked ? "rgba(255,255,255,0.4)" : "white",
              lineHeight: 1.3,
            }}
          >
            {task.title}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: TEAL }}>{task.credits}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{task.creditRatePerHr} CITYx/hr</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>🏢 {task.issuerName}</span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>⏱ {task.estimatedTime}</span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>📍 {task.location}</span>
        {!task.isOnboarding && (
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            {task.slotsRemaining}/{task.slots} slots
          </span>
        )}
      </div>

      <div
        style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, cursor: "pointer", marginBottom: 12 }}
        onClick={() => setExpanded(e => !e)}
      >
        {expanded ? task.description : task.description.slice(0, 90) + (task.description.length > 90 ? "…" : "")}
        {task.description.length > 90 && (
          <span style={{ color: ACCENT, marginLeft: 4 }}>{expanded ? " see less" : " see more"}</span>
        )}
      </div>

      {expanded && (
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {[
            { label: "📅 Date / Schedule", value: task.taskDate },
            { label: "✅ Success Looks Like", value: task.successCriteria },
            { label: "💰 Credit Rate", value: `${task.creditRatePerHr} CITYx / hr` },
            { label: "📋 Credentials", value: task.credentials },
          ].map(({ label, value }) => (
            <div key={label}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: 3,
                }}
              >
                {label}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {locked && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 12px",
            background: "rgba(255,255,255,0.04)",
            borderRadius: 8,
            marginBottom: 10,
            fontSize: 12,
            color: "rgba(255,255,255,0.35)",
          }}
        >
          <IconLock />
          {task.isOnboarding
            ? "Available to new members only — complete your onboarding task first to access the full catalog."
            : "Complete your onboarding task first to unlock the full task catalog."}
        </div>
      )}

      {pendingVerification && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 12px",
            background: "rgba(65,105,225,0.12)",
            border: "1px solid rgba(65,105,225,0.35)",
            borderRadius: 8,
            marginBottom: 10,
            fontSize: 12,
            color: "rgba(255,255,255,0.85)",
          }}
        >
          ⏳ Pending Verification
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        {showClaimButton && !isClaimed && !locked && (
          <button
            data-tutorial-allow={tutorialAllowClaim ? "true" : undefined}
            onClick={onClaim}
            style={{
              flex: 1,
              padding: "10px 0",
              background: tutorialAllowClaim
                ? "linear-gradient(145deg, rgba(221,158,51,0.95), rgba(221,158,51,0.78))"
                : ACCENT,
              color: tutorialAllowClaim ? "#15151E" : "white",
              border: tutorialAllowClaim ? "1px solid rgba(255,226,162,0.88)" : "none",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: tutorialAllowClaim
                ? "0 0 0 1px rgba(255,226,162,0.42), 0 0 14px rgba(221,158,51,0.48)"
                : undefined,
              animation: tutorialAllowClaim ? "tutorialPulse 1.55s ease-in-out infinite" : undefined,
            }}
          >
            Claim
          </button>
        )}
        {showClaimButton && isClaimed && (
          <div
            style={{
              flex: 1,
              padding: "10px 0",
              background: "rgba(52,238,182,0.08)",
              color: TEAL,
              border: "1px solid rgba(52,238,182,0.2)",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            ✓ Claimed — go to My Tasks
          </div>
        )}
        {showUnclaimButton && !pendingVerification && canUnclaim !== false && (
          <>
            <button
              onClick={onUnclaim}
              style={{
                padding: "10px 18px",
                background: tutorialHighlightActions
                  ? "linear-gradient(145deg, rgba(255,226,162,0.22), rgba(221,158,51,0.16))"
                  : "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.55)",
                border: tutorialHighlightActions
                  ? "1px solid rgba(255,226,162,0.85)"
                  : "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: tutorialHighlightActions
                  ? "0 0 0 1px rgba(255,226,162,0.35), 0 0 14px rgba(221,158,51,0.42)"
                  : undefined,
                animation: tutorialHighlightActions ? "tutorialPulse 1.45s ease-in-out infinite" : undefined,
              }}
            >
              Unclaim
            </button>
            <button
              data-tutorial-allow={tutorialHighlightActions ? "true" : undefined}
              onClick={onExecute}
              style={{
                flex: 1,
                padding: "10px 0",
                background: tutorialHighlightActions
                  ? "linear-gradient(145deg, rgba(221,158,51,0.95), rgba(221,158,51,0.78))"
                  : ACCENT,
                color: "white",
                border: tutorialHighlightActions ? "1px solid rgba(255,226,162,0.92)" : "none",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: tutorialHighlightActions
                  ? "0 0 0 1px rgba(255,226,162,0.4), 0 0 14px rgba(221,158,51,0.48)"
                  : undefined,
                animation: tutorialHighlightActions ? "tutorialPulse 1.45s ease-in-out infinite" : undefined,
              }}
            >
              Execute →
            </button>
          </>
        )}
        {showUnclaimButton && canUnclaim === false && (
          <div
            style={{
              flex: 1,
              padding: "10px 0",
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.45)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            Awaiting issuer review
          </div>
        )}
      </div>
    </div>
  );
}

function ExploreTab({
  onLearnMore,
  tutorialStep,
  onTutorialStepChange,
}: {
  onLearnMore: (key: ParticipantLearnCardKey) => void;
  tutorialStep: IssuerTutorialStep;
  onTutorialStepChange: (step: IssuerTutorialStep) => void;
}) {
  type OnchainTask = Task & {
    claimedBy?: `0x${string}`;
    completionStatus?: number;
    tutorialOwner?: `0x${string}`;
    tutorialRunId?: string;
  };
  type BrowseTaskGroup = {
    key: string;
    representative: OnchainTask;
    instances: OnchainTask[];
  };
  const { state, claimTask, unclaimTask, startVerify } = useDemo();
  const { address } = useAccount({ type: "ModularAccountV2" });
  const [view, setView] = useState<"browse" | "claimed">("browse");
  const [catFilter, setCatFilter] = useState<TaskCategory | "All">("All");
  const [executeTask, setExecuteTask] = useState<Task | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [onchainTasks, setOnchainTasks] = useState<OnchainTask[]>([]);
  const [search, setSearch] = useState("");
  const [pendingVerificationIds, setPendingVerificationIds] = useState<string[]>([]);
  const [localOnboardingClaimed, setLocalOnboardingClaimed] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [pendingTaskSnapshots, setPendingTaskSnapshots] = useState<Record<string, Task>>({});
  const [completedTasks, setCompletedTasks] = useState<Array<Task & { completedAt: string }>>([]);
  const [optimisticUnclaimIds, setOptimisticUnclaimIds] = useState<string[]>([]);
  const [taskWriteStatus, setTaskWriteStatus] = useState<{
    state: "idle" | "pending" | "confirmed" | "failed";
    hash?: `0x${string}`;
    error?: string;
    label?: string;
  }>({ state: "idle" });
  // Hash-based dedup: tracks the last tx hash we already synced for so we
  // don't re-fetch just because taskWriteStatus.state changes (pending→confirmed).
  const lastSyncedConfirmedHashRef = React.useRef<string | undefined>(undefined);
  const [claimConfirmTask, setClaimConfirmTask] = useState<Task | null>(null);
  const [unclaimConfirmTask, setUnclaimConfirmTask] = useState<Task | null>(null);
  const [expandedTaskGroups, setExpandedTaskGroups] = useState<Record<string, boolean>>({});
  const [claimNotice, setClaimNotice] = useState<{ message: string; type: "info" | "warn" } | null>(null);
  const [scoreSnapshot, setScoreSnapshot] = useState<ParticipantScoreSnapshot>(() =>
    getParticipantScoreSnapshot(address ?? FAKE_WALLETS.participant),
  );
  const tutorialHighlightTaskInstances = tutorialStep === "box11";
  const tutorialHighlightClaimedActions = tutorialStep === "box13";
  const [tutorialTaskIds, setTutorialTaskIds] = useState<string[]>(() => getDemoTutorialTaskIds());
  const tutorialTaskIdSet = React.useMemo(() => new Set(tutorialTaskIds), [tutorialTaskIds]);

  useEffect(() => {
    setTutorialTaskIds(getDemoTutorialTaskIds());
  }, [tutorialStep]);

  useEffect(() => {
    if (tutorialStep === "box11") {
      setView("browse");
      return;
    }
    if (tutorialStep === "box13" || tutorialStep === "box14") {
      setView("claimed");
    }
  }, [tutorialStep]);

  const parseEstimatedHours = React.useCallback((estimatedTime: string): number | null => {
    const input = estimatedTime.toLowerCase();
    const numericParts = input.match(/\d+(\.\d+)?/g)?.map(Number) ?? [];
    if (numericParts.length === 0) return null;

    const base =
      input.includes("-") && numericParts.length >= 2 ? (numericParts[0] + numericParts[1]) / 2 : numericParts[0];
    if (!Number.isFinite(base) || base <= 0) return null;

    if (input.includes("min")) return base / 60;
    return base;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const walletKey = (address ?? FAKE_WALLETS.participant).toLowerCase();
    const pendingKey = `citysync:demo:participant:pending-verification:${walletKey}`;
    const onboardingClaimedKey = `citysync:demo:participant:onboarding-claimed:${walletKey}`;
    const onboardedKey = `citysync:demo:participant:onboarded:${walletKey}`;
    const pendingSnapshotsKey = `citysync:demo:participant:pending-task-snapshots:${walletKey}`;
    const completedKey = `citysync:demo:participant:completed-tasks:${walletKey}`;
    try {
      const raw = window.localStorage.getItem(pendingKey);
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        if (Array.isArray(parsed)) setPendingVerificationIds(parsed);
      }
      const rawOnboardingClaimed = window.localStorage.getItem(onboardingClaimedKey);
      if (rawOnboardingClaimed) {
        const parsed = JSON.parse(rawOnboardingClaimed) as boolean;
        setLocalOnboardingClaimed(Boolean(parsed));
      }
      const rawOnboarded = window.localStorage.getItem(onboardedKey);
      if (rawOnboarded) {
        const parsed = JSON.parse(rawOnboarded) as boolean;
        setIsOnboarded(Boolean(parsed));
      }
      const rawSnapshots = window.localStorage.getItem(pendingSnapshotsKey);
      if (rawSnapshots) {
        const parsed = JSON.parse(rawSnapshots) as Record<string, Task>;
        if (parsed && typeof parsed === "object") setPendingTaskSnapshots(parsed);
      }
      const rawCompleted = window.localStorage.getItem(completedKey);
      if (rawCompleted) {
        const parsed = JSON.parse(rawCompleted) as Array<Task & { completedAt: string }>;
        if (Array.isArray(parsed)) setCompletedTasks(parsed);
      }
    } catch {
      // Ignore hydration failures.
    }
  }, [address]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const walletKey = (address ?? FAKE_WALLETS.participant).toLowerCase();
    const pendingKey = `citysync:demo:participant:pending-verification:${walletKey}`;
    const onboardingClaimedKey = `citysync:demo:participant:onboarding-claimed:${walletKey}`;
    const onboardedKey = `citysync:demo:participant:onboarded:${walletKey}`;
    const pendingSnapshotsKey = `citysync:demo:participant:pending-task-snapshots:${walletKey}`;
    const completedKey = `citysync:demo:participant:completed-tasks:${walletKey}`;
    try {
      window.localStorage.setItem(pendingKey, JSON.stringify(pendingVerificationIds));
      window.localStorage.setItem(onboardingClaimedKey, JSON.stringify(localOnboardingClaimed));
      window.localStorage.setItem(onboardedKey, JSON.stringify(isOnboarded));
      window.localStorage.setItem(pendingSnapshotsKey, JSON.stringify(pendingTaskSnapshots));
      window.localStorage.setItem(completedKey, JSON.stringify(completedTasks));
    } catch {
      // Ignore persistence failures.
    }
  }, [address, pendingVerificationIds, localOnboardingClaimed, isOnboarded, pendingTaskSnapshots, completedTasks]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => setScoreSnapshot(getParticipantScoreSnapshot(address ?? FAKE_WALLETS.participant));
    sync();
    const id = window.setInterval(sync, 2500);
    window.addEventListener("storage", sync);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("storage", sync);
    };
  }, [address]);

  useEffect(() => {
    // Keep legacy participants with existing CITY balances unlocked.
    if (state.participant.cityBalance > 0 && !isOnboarded) {
      setIsOnboarded(true);
    }
  }, [isOnboarded, state.participant.cityBalance]);

  useEffect(() => {
    // Skip if no meaningful event occurred:
    // • A tx hash is present but NOT yet confirmed → wait for confirmed state
    // • A tx hash is present, confirmed, but we already synced for this exact hash
    const { hash, state } = taskWriteStatus;
    const isConfirmedNewTx = state === "confirmed" && hash !== lastSyncedConfirmedHashRef.current;
    if (hash && !isConfirmedNewTx) return; // pending/failed state change — skip
    if (isConfirmedNewTx) lastSyncedConfirmedHashRef.current = hash;

    let cancelled = false;

    const parseMetadata = (raw: string): Partial<Task> => {
      try {
        const parsed = JSON.parse(raw) as Partial<Task>;
        return parsed;
      } catch {
        return {};
      }
    };
    const parsePositiveNumber = (value: unknown): number | null => {
      if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
      if (typeof value === "string") {
        const match = value.match(/\d+(\.\d+)?/);
        if (!match) return null;
        const parsed = Number(match[0]);
        if (Number.isFinite(parsed) && parsed > 0) return parsed;
      }
      return null;
    };

    const syncOnchainTasks = async () => {
      try {
        const nextId = (await baseSepoliaPublicClient.readContract({
          address: BASE_SEPOLIA_CONTRACTS.OpportunityManager.address,
          abi: BASE_SEPOLIA_CONTRACTS.OpportunityManager.abi,
          functionName: "nextOpportunityId",
          args: [],
        })) as bigint;

        if (nextId <= 0n) {
          if (!cancelled) setOnchainTasks([]);
          return;
        }

        const ids = Array.from({ length: Number(nextId) }, (_, i) => BigInt(i));
        const nowMs = Date.now();
        const opportunityResults = await multicallInChunks(
          ids.map(id => ({
            address: BASE_SEPOLIA_CONTRACTS.OpportunityManager.address,
            abi: BASE_SEPOLIA_CONTRACTS.OpportunityManager.abi,
            functionName: "opportunities",
            args: [id],
          })),
        );

        const activeItems: Array<{ id: bigint; opp: OpportunityRaw }> = [];
        opportunityResults.forEach((result, idx) => {
          if (result.status !== "success") return;
          const opp = result.result as OpportunityRaw;
          if (!opp[9]) return;
          if (opp[7] > 0n && Number(opp[7]) * 1000 < nowMs) return;
          activeItems.push({ id: ids[idx], opp });
        });

        const claimedByResults = await multicallInChunks(
          activeItems.map(({ id }) => ({
            address: BASE_SEPOLIA_CONTRACTS.OpportunityManager.address,
            abi: BASE_SEPOLIA_CONTRACTS.OpportunityManager.abi,
            functionName: "claimedBy",
            args: [id],
          })),
        );

        const completionTargets: Array<{ id: bigint; claimant: `0x${string}` }> = [];
        const completionStatusById = new Map<string, number>();
        activeItems.forEach(({ id }, idx) => {
          const result = claimedByResults[idx];
          if (!result || result.status !== "success") return;
          const claimedBy = result.result as `0x${string}`;
          if (claimedBy && claimedBy !== "0x0000000000000000000000000000000000000000") {
            completionTargets.push({ id, claimant: claimedBy });
          }
        });

        if (completionTargets.length > 0) {
          const completionResults = await multicallInChunks(
            completionTargets.map(({ id, claimant }) => ({
              address: BASE_SEPOLIA_CONTRACTS.OpportunityManager.address,
              abi: BASE_SEPOLIA_CONTRACTS.OpportunityManager.abi,
              functionName: "completions",
              args: [id, claimant],
            })),
          );
          completionTargets.forEach((target, idx) => {
            const result = completionResults[idx];
            if (!result || result.status !== "success") return;
            const completion = result.result as readonly [
              proofHash: `0x${string}`,
              submittedAt: bigint,
              verifiedAt: bigint,
              status: number,
            ];
            completionStatusById.set(target.id.toString(), Number(completion[3] ?? 0));
          });
        }

        const all = activeItems
          .map(({ id, opp }, idx) => {
            const claimedByResult = claimedByResults[idx];
            const claimedBy =
              claimedByResult && claimedByResult.status === "success"
                ? (claimedByResult.result as `0x${string}`)
                : ("0x0000000000000000000000000000000000000000" as `0x${string}`);
            const completionStatus = completionStatusById.get(id.toString()) ?? 0;

            const metadata = parseMetadata(opp[1]);
            const slots = opp[6] === 0n ? 9_999 : Number(opp[6]);
            const verified = Number(opp[10] ?? 0);
            const credits = Math.floor(Number(formatUnits(opp[2], 18)));
            const estimatedTime = metadata.estimatedTime || "TBD";
            const directRate =
              parsePositiveNumber((metadata as Record<string, unknown>).creditRatePerHr) ??
              parsePositiveNumber((metadata as Record<string, unknown>).creditRate);
            const derivedRateFromTime = (() => {
              if (credits <= 0) return 0;
              const hours = parseEstimatedHours(estimatedTime);
              if (!hours) return null;
              return Math.round((credits / hours) * 10) / 10;
            })();
            const normalizedRate = credits <= 0 ? 0 : (directRate ?? derivedRateFromTime ?? credits);

            return {
              id: `task-${id.toString()}`,
              title: metadata.title || `Opportunity #${id.toString()}`,
              description: metadata.description || "Onchain issuer opportunity",
              category: (metadata.category as TaskCategory) || "Community",
              credits,
              voteTokens: Math.floor(Number(formatUnits(opp[3] === 0n ? opp[2] : opp[3], 18))),
              estimatedTime,
              location: metadata.location || "TBD",
              slots,
              slotsRemaining: Math.max(0, slots - verified),
              issuerName: `${opp[0].slice(0, 6)}...${opp[0].slice(-4)}`,
              issuerId: opp[0],
              tags: metadata.tags || ["onchain"],
              isMCE: false,
              isOnboarding:
                typeof metadata.isOnboarding === "boolean"
                  ? metadata.isOnboarding
                  : (metadata.category as TaskCategory) === "Onboarding" || opp[2] === 0n,
              taskDate: metadata.taskDate || "TBD",
              successCriteria: metadata.successCriteria || "Complete and submit proof for verification.",
              creditRatePerHr: normalizedRate,
              credentials: metadata.credentials || "None",
              claimedBy,
              completionStatus,
              tutorialOwner:
                typeof (metadata as Record<string, unknown>).tutorialOwner === "string"
                  ? ((metadata as Record<string, unknown>).tutorialOwner as `0x${string}`)
                  : undefined,
              tutorialRunId:
                typeof (metadata as Record<string, unknown>).tutorialRunId === "string"
                  ? ((metadata as Record<string, unknown>).tutorialRunId as string)
                  : undefined,
            } as OnchainTask;
          })
          .filter(Boolean);
        all.sort((a, b) => {
          const aId = Number((a.id.match(/(\d+)$/)?.[1] ?? "0").toString());
          const bId = Number((b.id.match(/(\d+)$/)?.[1] ?? "0").toString());
          return bId - aId;
        });

        if (!cancelled) setOnchainTasks(all);
      } catch {
        if (!cancelled) setOnchainTasks([]);
      }
    };

    void syncOnchainTasks();
    return () => {
      cancelled = true;
    };
  }, [parseEstimatedHours, taskWriteStatus.hash, taskWriteStatus.state]);

  const addressLower = address?.toLowerCase();
  const openOnchainTasks = onchainTasks.filter(t => {
    const tutorialOwnerLower = t.tutorialOwner?.toLowerCase();
    if (tutorialOwnerLower && tutorialOwnerLower !== addressLower) return false;
    const claimedBy = t.claimedBy?.toLowerCase();
    const isUnclaimed = !claimedBy || claimedBy === "0x0000000000000000000000000000000000000000";
    const optimisticUnclaimedByMe = !!addressLower && claimedBy === addressLower && optimisticUnclaimIds.includes(t.id);
    if (optimisticUnclaimedByMe) return true;
    if (!isUnclaimed) return false;
    // Exclude exhausted opportunities from Browse even if reads are briefly stale.
    return t.isOnboarding || t.slotsRemaining > 0;
  });
  const nonOnboardingOpenOnchainTasks = openOnchainTasks.filter(t => !t.isOnboarding);
  const openTasks = !isOnboarded
    ? localOnboardingClaimed
      ? nonOnboardingOpenOnchainTasks
      : [DEMO_LOCAL_ONBOARDING_TASK, ...nonOnboardingOpenOnchainTasks]
    : openOnchainTasks;
  const searchedOpenTasks = openTasks.filter(t => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.issuerName.toLowerCase().includes(q) ||
      t.tags.join(" ").toLowerCase().includes(q)
    );
  });
  const filteredOpenTasks =
    catFilter === "All" ? searchedOpenTasks : searchedOpenTasks.filter(t => t.category === catFilter);
  const sortedOpenTasks = React.useMemo(() => {
    const sorted = [...filteredOpenTasks].sort((a, b) => {
      const aId = Number(a.id.match(/(\d+)$/)?.[1] ?? "0");
      const bId = Number(b.id.match(/(\d+)$/)?.[1] ?? "0");
      return bId - aId;
    });

    const onboardingIdx = sorted.findIndex(task => task.id === DEMO_LOCAL_ONBOARDING_TASK.id || task.isOnboarding);
    if (onboardingIdx > 0) {
      const [onboardingTask] = sorted.splice(onboardingIdx, 1);
      sorted.unshift(onboardingTask);
    }
    return sorted;
  }, [filteredOpenTasks]);
  const groupedBrowseTasks = React.useMemo<BrowseTaskGroup[]>(() => {
    const groups = new Map<string, BrowseTaskGroup>();
    const makeGroupKey = (task: OnchainTask) =>
      [
        task.isOnboarding ? "onboarding" : "standard",
        task.title.trim().toLowerCase(),
        task.issuerId?.toLowerCase?.() ?? task.issuerName.trim().toLowerCase(),
        String(task.credits),
        String(task.voteTokens),
        String(task.creditRatePerHr),
        task.category,
      ].join("|");

    for (const task of sortedOpenTasks) {
      const key = makeGroupKey(task);
      const existing = groups.get(key);
      if (existing) {
        existing.instances.push(task);
      } else {
        groups.set(key, { key, representative: task, instances: [task] });
      }
    }
    return Array.from(groups.values());
  }, [sortedOpenTasks]);
  const myTasksRaw = React.useMemo(
    () =>
      onchainTasks.filter(
        t =>
          !!addressLower &&
          !!t.claimedBy &&
          t.claimedBy.toLowerCase() === addressLower &&
          !optimisticUnclaimIds.includes(t.id),
      ),
    [addressLower, onchainTasks, optimisticUnclaimIds],
  );
  const localClaimedTasks: OnchainTask[] = React.useMemo(
    () => (localOnboardingClaimed ? [{ ...DEMO_LOCAL_ONBOARDING_TASK, completionStatus: 0 }] : []),
    [localOnboardingClaimed],
  );
  const myTasks = React.useMemo(
    () => [...localClaimedTasks, ...myTasksRaw.filter(t => t.completionStatus !== 2)],
    [localClaimedTasks, myTasksRaw],
  );
  const localClaimedTaskIdSet = React.useMemo(
    () => new Set(state.participant.claimedTaskIds),
    [state.participant.claimedTaskIds],
  );
  const onchainCompletedTasks = myTasksRaw.filter(t => t.completionStatus === 2);
  const myTaskIds = React.useMemo(() => new Set(myTasks.map(t => t.id)), [myTasks]);
  const tutorialBrowseGroupKeySet = React.useMemo(() => {
    const keys = new Set<string>();
    for (const group of groupedBrowseTasks) {
      if (group.instances.some(instance => tutorialTaskIdSet.has(instance.id))) {
        keys.add(group.key);
      }
    }
    return keys;
  }, [groupedBrowseTasks, tutorialTaskIdSet]);
  const orderedBrowseTaskGroups = React.useMemo(() => {
    if (tutorialStep !== "box11") return groupedBrowseTasks;
    const sorted = [...groupedBrowseTasks];
    sorted.sort((a, b) => Number(tutorialBrowseGroupKeySet.has(b.key)) - Number(tutorialBrowseGroupKeySet.has(a.key)));
    return sorted;
  }, [groupedBrowseTasks, tutorialBrowseGroupKeySet, tutorialStep]);
  const tutorialClaimedTasks = React.useMemo(
    () => myTasks.filter(task => tutorialTaskIdSet.has(task.id)),
    [myTasks, tutorialTaskIdSet],
  );
  const tutorialTargetClaimTaskId = React.useMemo(() => {
    if (tutorialStep !== "box11") return undefined;
    for (const group of orderedBrowseTaskGroups) {
      const nextInstance = group.instances.find(
        instance =>
          tutorialTaskIdSet.has(instance.id) && !myTaskIds.has(instance.id) && !localClaimedTaskIdSet.has(instance.id),
      );
      if (nextInstance) return nextInstance.id;
    }
    return undefined;
  }, [localClaimedTaskIdSet, myTaskIds, orderedBrowseTaskGroups, tutorialStep, tutorialTaskIdSet]);
  const tutorialClaimedCount = React.useMemo(() => {
    if (tutorialStep !== "box11") return tutorialClaimedTasks.length;
    const claimedUnion = new Set<string>([...myTasks.map(task => task.id), ...state.participant.claimedTaskIds]);
    let count = 0;
    tutorialTaskIdSet.forEach(id => {
      if (claimedUnion.has(id)) count += 1;
    });
    return count;
  }, [myTasks, state.participant.claimedTaskIds, tutorialClaimedTasks.length, tutorialStep, tutorialTaskIdSet]);
  const orderedClaimedTasks = React.useMemo(() => {
    if (tutorialStep !== "box13") return myTasks;
    const sorted = [...myTasks];
    sorted.sort((a, b) => Number(tutorialTaskIdSet.has(b.id)) - Number(tutorialTaskIdSet.has(a.id)));
    return sorted;
  }, [myTasks, tutorialStep, tutorialTaskIdSet]);
  const highlightedClaimedTaskId =
    tutorialStep === "box13" ? (tutorialClaimedTasks[0]?.id ?? orderedClaimedTasks[0]?.id) : undefined;
  const sanctionsPolicy = getSanctionPolicyForSnapshot(scoreSnapshot);

  useEffect(() => {
    if (tutorialStep !== "box11") return;
    setExpandedTaskGroups(prev => {
      if (orderedBrowseTaskGroups.length === 0) return prev;
      const next = { ...prev };
      if (tutorialTargetClaimTaskId) {
        const targetGroup = orderedBrowseTaskGroups.find(group =>
          group.instances.some(instance => instance.id === tutorialTargetClaimTaskId),
        );
        if (targetGroup) {
          next[targetGroup.key] = true;
          return next;
        }
      }
      if (tutorialBrowseGroupKeySet.size > 0) {
        const firstTutorialGroup = orderedBrowseTaskGroups.find(group => tutorialBrowseGroupKeySet.has(group.key));
        if (firstTutorialGroup) {
          next[firstTutorialGroup.key] = true;
          return next;
        }
      } else {
        const firstGroup = orderedBrowseTaskGroups[0];
        if (firstGroup) {
          next[firstGroup.key] = true;
          return next;
        }
      }
      return next;
    });
    if (tutorialClaimedCount >= 2) {
      setView("claimed");
      onTutorialStepChange("box13");
    }
  }, [
    orderedBrowseTaskGroups,
    onTutorialStepChange,
    tutorialBrowseGroupKeySet,
    tutorialClaimedCount,
    tutorialTargetClaimTaskId,
    tutorialStep,
  ]);

  useEffect(() => {
    if (onchainCompletedTasks.length === 0) return;
    setCompletedTasks(prev => {
      const existing = new Set(prev.map(t => t.id));
      const additions = onchainCompletedTasks
        .filter(t => !existing.has(t.id))
        .map(t => ({ ...t, completedAt: new Date().toISOString() }));
      return additions.length > 0 ? [...additions, ...prev] : prev;
    });
  }, [onchainCompletedTasks]);

  useEffect(() => {
    const claimedIds = new Set(myTasks.map(t => t.id));
    setPendingVerificationIds(prev => {
      const resolved = prev.filter(id => !claimedIds.has(id));
      if (resolved.length > 0) {
        setCompletedTasks(current => {
          const existing = new Set(current.map(t => t.id));
          const additions = resolved
            .map(id => pendingTaskSnapshots[id])
            .filter(Boolean)
            .filter(task => !existing.has(task.id))
            .map(task => ({
              ...task,
              completedAt: new Date().toISOString(),
            }));
          return additions.length > 0 ? [...additions, ...current] : current;
        });
        setPendingTaskSnapshots(current => {
          const next = { ...current };
          resolved.forEach(id => {
            delete next[id];
          });
          return next;
        });
      }

      const next = prev.filter(id => claimedIds.has(id));
      if (next.length === prev.length && next.every((id, idx) => id === prev[idx])) return prev;
      return next;
    });
  }, [myTasks, pendingTaskSnapshots]);

  useEffect(() => {
    setOptimisticUnclaimIds(prev => {
      if (!addressLower) return [];
      const myClaimed = new Set(onchainTasks.filter(t => t.claimedBy?.toLowerCase() === addressLower).map(t => t.id));
      return prev.filter(id => myClaimed.has(id));
    });
  }, [addressLower, onchainTasks]);

  useEffect(() => {
    if (view !== "browse") return;
    const validKeys = new Set(groupedBrowseTasks.map(group => group.key));
    setExpandedTaskGroups(prev => {
      const next = Object.fromEntries(Object.entries(prev).filter(([key]) => validKeys.has(key)));
      if (Object.keys(next).length === Object.keys(prev).length) return prev;
      return next;
    });
  }, [groupedBrowseTasks, view]);

  const handleClaim = async (task: Task) => {
    setClaimConfirmTask(task);
  };

  const handleClaimConfirmed = async (task: Task) => {
    setClaimConfirmTask(null);
    const tutorialOwner = (task as Task & { tutorialOwner?: `0x${string}` }).tutorialOwner;
    if (tutorialOwner && tutorialOwner.toLowerCase() !== (addressLower ?? "")) {
      setClaimNotice({
        message: "This tutorial task is reserved for the account that issued it.",
        type: "warn",
      });
      return;
    }
    if (!task.isOnboarding && task.slotsRemaining <= 0) {
      setClaimNotice({
        message: "This task is no longer claimable (all slots are filled). Please claim another task.",
        type: "warn",
      });
      return;
    }
    if (!task.isOnboarding) {
      const localActiveClaimCount = new Set<string>([...myTasks.map(t => t.id), ...state.participant.claimedTaskIds])
        .size;
      if (localActiveClaimCount >= sanctionsPolicy.maxActiveClaims) {
        setClaimNotice({
          message:
            sanctionsPolicy.maxActiveClaims === 1
              ? `Claim limited by ${scoreSnapshot.tier} status (max 1 active claim).`
              : "Max task claim limit reached.",
          type: "warn",
        });
        return;
      }

      if (sanctionsPolicy.blockPremiumTasks && task.creditRatePerHr > PREMIUM_TASK_RATE_THRESHOLD) {
        setClaimNotice({
          message: `Claim blocked: premium tasks above ${PREMIUM_TASK_RATE_THRESHOLD} CITYx/hr are restricted in ${scoreSnapshot.tier}.`,
          type: "warn",
        });
        return;
      }

      if (sanctionsPolicy.maxEstimatedHours !== null) {
        const estimatedHours = parseEstimatedHours(task.estimatedTime);
        if (estimatedHours !== null && estimatedHours > sanctionsPolicy.maxEstimatedHours) {
          setClaimNotice({
            message: `Claim blocked: ${scoreSnapshot.tier} status allows tasks up to ${sanctionsPolicy.maxEstimatedHours} hour.`,
            type: "warn",
          });
          return;
        }
      }
    }

    if (task.id === DEMO_LOCAL_ONBOARDING_TASK.id) {
      setLocalOnboardingClaimed(true);
      setClaimNotice({ message: `Claimed: ${task.title}`, type: "info" });
      return;
    }
    setTaskWriteStatus({ state: "pending", label: "Claim" });
    const result = await claimTask(task.id);
    if (result.ok) {
      setTaskWriteStatus({ state: "confirmed", hash: result.hash, label: "Claim" });
    } else {
      setTaskWriteStatus({ state: "failed", error: "Claim failed", label: "Claim" });
    }
  };

  const handleUnclaim = async (task: Task) => {
    setUnclaimConfirmTask(task);
  };

  const handleUnclaimConfirmed = async (task: Task) => {
    setUnclaimConfirmTask(null);
    if (task.id === DEMO_LOCAL_ONBOARDING_TASK.id) {
      setLocalOnboardingClaimed(false);
      setToast("Task returned to Open Tasks");
      return;
    }
    setTaskWriteStatus({ state: "pending", label: "Unclaim" });
    const result = await unclaimTask(task.id);
    if (result.ok) {
      setOptimisticUnclaimIds(prev => (prev.includes(task.id) ? prev : [...prev, task.id]));
      setPendingVerificationIds(prev => prev.filter(id => id !== task.id));
      setPendingTaskSnapshots(prev => {
        const next = { ...prev };
        delete next[task.id];
        return next;
      });
      setTaskWriteStatus({ state: "confirmed", hash: result.hash, label: "Unclaim" });
    } else {
      if ((result.error ?? "").toLowerCase().includes("pending/verified")) {
        setToast("Cannot unclaim after submission. Await issuer verify/invalidate.");
      } else {
        setTaskWriteStatus({ state: "failed", error: "Unclaim failed", label: "Unclaim" });
      }
    }
  };

  const handleExecuteConfirm = () => {
    if (!executeTask) return;
    const task = executeTask;
    setExecuteTask(null);
    if (task.id === DEMO_LOCAL_ONBOARDING_TASK.id) {
      setLocalOnboardingClaimed(false);
      setPendingVerificationIds(prev => prev.filter(id => id !== task.id));
      setPendingTaskSnapshots(prev => {
        const next = { ...prev };
        delete next[task.id];
        return next;
      });
      setIsOnboarded(true);
      setToast("Now that you are onboarded your account can now interact with all City/Sync contracts.");
      return;
    }
    if (tutorialStep === "box13") {
      onTutorialStepChange("box14");
    }
    setPendingVerificationIds(prev => (prev.includes(task.id) ? prev : [...prev, task.id]));
    setPendingTaskSnapshots(prev => ({ ...prev, [task.id]: task }));
    setTaskWriteStatus({ state: "pending", label: "Submit Completion" });
    void startVerify(task.id, task.title).then(result => {
      if (result.ok) {
        setTaskWriteStatus({ state: "confirmed", hash: result.hash, label: "Submit Completion" });
        return;
      }
      setPendingVerificationIds(prev => prev.filter(id => id !== task.id));
      setPendingTaskSnapshots(prev => {
        const next = { ...prev };
        delete next[task.id];
        return next;
      });
      setTaskWriteStatus({
        state: "failed",
        error: result.error ?? "Submit completion failed onchain.",
        label: "Submit Completion",
      });
    });
  };

  const openExploreLearnMore = () => {
    onLearnMore("explore-onboarding");
    onLearnMore("explore-task-flow");
    onLearnMore("explore-verify");
  };

  return (
    <div style={{ padding: "20px 16px 24px" }}>
      <style>{`
        @keyframes tutorialPulse {
          0%, 100% { box-shadow: 0 0 0 1px rgba(255,226,162,0.28), 0 0 10px rgba(221,158,51,0.24); }
          50% { box-shadow: 0 0 0 1px rgba(255,226,162,0.62), 0 0 18px rgba(221,158,51,0.5); }
        }
      `}</style>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <LearnMoreLink onClick={openExploreLearnMore} />
      </div>
      {/* Browse / Claimed toggle */}
      <div
        style={{
          display: "flex",
          background: "rgba(255,255,255,0.05)",
          borderRadius: 10,
          padding: 4,
          marginBottom: 16,
        }}
      >
        {(
          [
            {
              key: "browse" as const,
              label: `Browse Tasks${sortedOpenTasks.length > 0 ? ` (${sortedOpenTasks.length})` : ""}`,
              color: ACCENT,
            },
            {
              key: "claimed" as const,
              label: `Claimed Tasks${myTasks.length > 0 ? ` (${myTasks.length})` : ""}`,
              color: TEAL,
            },
          ] as const
        ).map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            style={{
              flex: 1,
              padding: "9px 0",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              background: view === key ? color : "transparent",
              color: view === key ? (key === "browse" ? "white" : "#15151E") : "rgba(255,255,255,0.45)",
              transition: "all 0.15s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {!isOnboarded && view === "browse" && (
        <div
          style={{
            background: "rgba(52,238,182,0.1)",
            border: "1px solid rgba(52,238,182,0.35)",
            borderRadius: 12,
            padding: "12px 14px",
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, color: TEAL, marginBottom: 5 }}>ONBOARDING REQUIRED</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.55 }}>
            Complete and execute one in-person onboarding task (0 CITY) to activate your account. Once activated, your
            account can claim and execute all City/Sync tasks.
          </div>
        </div>
      )}

      {/* Category filter — Browse Tasks only */}
      {view === "browse" && (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.5)" }}>
                <IconSearch />
              </span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tasks"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "white",
                  fontSize: 12,
                }}
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 14,
              marginBottom: 2,
              scrollbarWidth: "none",
            }}
          >
            {(["All", ...ALL_CATEGORIES] as (TaskCategory | "All")[]).map(c => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                style={{
                  flexShrink: 0,
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  background: catFilter === c ? (c === "All" ? ACCENT : CAT_COLORS[c]) : "rgba(255,255,255,0.06)",
                  color: catFilter === c ? (c === "Onboarding" ? "#15151E" : "white") : "rgba(255,255,255,0.55)",
                  transition: "all 0.15s",
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Inline claim notice — appears above task list, below category tags */}
      {claimNotice && (
        <div
          style={{
            borderRadius: 12,
            marginBottom: 12,
            position: "relative",
            border: claimNotice.type === "warn" ? "1px solid rgba(255,198,77,0.4)" : "1px solid rgba(52,238,182,0.35)",
            background: claimNotice.type === "warn" ? "rgba(255,198,77,0.08)" : "rgba(52,238,182,0.08)",
            padding: "12px 36px 12px 14px",
          }}
        >
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 4 }}>
            {claimNotice.type === "warn" ? "Notice" : "Claim Confirmed"}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{claimNotice.message}</div>
          <button
            onClick={() => setClaimNotice(null)}
            style={{
              position: "absolute",
              top: 8,
              right: 10,
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.3)",
              cursor: "pointer",
              fontSize: 16,
              padding: 0,
              lineHeight: 1,
            }}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {scoreSnapshot.tier !== "Green" && (
        <div
          style={{
            borderRadius: 12,
            marginBottom: 12,
            border: "1px solid rgba(255,173,102,0.35)",
            background: "rgba(255,173,102,0.08)",
            padding: "10px 12px",
          }}
        >
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginBottom: 4 }}>
            Sanctions Active · {scoreSnapshot.tier}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.86)", lineHeight: 1.45 }}>
            {sanctionsPolicy.summary}
          </div>
        </div>
      )}

      {taskWriteStatus.state !== "idle" && (
        <div
          style={{
            borderRadius: 12,
            marginBottom: 16,
            position: "relative",
            border:
              taskWriteStatus.state === "confirmed"
                ? "1px solid rgba(52,238,182,0.35)"
                : taskWriteStatus.state === "failed"
                  ? "1px solid rgba(255,107,157,0.35)"
                  : "1px solid rgba(65,105,225,0.35)",
            background:
              taskWriteStatus.state === "confirmed"
                ? "rgba(52,238,182,0.08)"
                : taskWriteStatus.state === "failed"
                  ? "rgba(255,107,157,0.08)"
                  : "rgba(65,105,225,0.08)",
            padding: "12px 14px",
          }}
        >
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
            {taskWriteStatus.label ? `Last Write — ${taskWriteStatus.label}` : "Last Task Write"}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
            {taskWriteStatus.state === "pending" && "Pending wallet/user-op confirmation..."}
            {taskWriteStatus.state === "confirmed" && "Confirmed onchain"}
            {taskWriteStatus.state === "failed" && "Failed onchain"}
          </div>
          {taskWriteStatus.error && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>{taskWriteStatus.error}</div>
          )}
          {taskWriteStatus.hash && (
            <a
              href={`https://sepolia.basescan.org/tx/${taskWriteStatus.hash}`}
              target="_blank"
              rel="noreferrer"
              style={{ display: "inline-block", marginTop: 6, fontSize: 12, color: "#34eeb6", textDecoration: "none" }}
            >
              View on Base Sepolia Explorer ↗
            </a>
          )}
          <button
            onClick={() => setTaskWriteStatus({ state: "idle" })}
            style={{
              position: "absolute",
              top: 8,
              right: 10,
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.3)",
              cursor: "pointer",
              fontSize: 16,
              padding: 0,
              lineHeight: 1,
            }}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Task list */}
      {view === "browse" ? (
        orderedBrowseTaskGroups.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
            No tasks in this category
          </div>
        ) : (
          orderedBrowseTaskGroups.map((group, groupIndex) => {
            const task = group.representative;
            const isExpanded = !!expandedTaskGroups[group.key];
            const catColor = CAT_COLORS[task.category] ?? "#666";
            const shouldHighlightTaskGroup =
              tutorialHighlightTaskInstances &&
              (tutorialTargetClaimTaskId
                ? group.instances.some(instance => instance.id === tutorialTargetClaimTaskId)
                : tutorialBrowseGroupKeySet.size > 0
                  ? tutorialBrowseGroupKeySet.has(group.key)
                  : groupIndex < 2);
            return (
              <div
                key={group.key}
                style={{
                  ...card,
                  marginBottom: 10,
                  borderLeft: task.isMCE ? "3px solid rgba(221,158,51,0.45)" : "3px solid rgba(52,238,182,0.45)",
                  paddingLeft: 13,
                }}
              >
                <button
                  onClick={() =>
                    setExpandedTaskGroups(prev => ({
                      ...prev,
                      [group.key]: !prev[group.key],
                    }))
                  }
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    padding: 0,
                    color: "inherit",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: 8,
                      gap: 10,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5, flexWrap: "wrap" }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 20,
                            background: `${catColor}22`,
                            color: catColor,
                            border: `1px solid ${catColor}44`,
                          }}
                        >
                          {task.category}
                        </span>
                        {task.isMCE && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: 20,
                              background: "rgba(221,158,51,0.15)",
                              color: GOLD,
                              border: "1px solid rgba(221,158,51,0.3)",
                            }}
                          >
                            MCE
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "white", lineHeight: 1.3 }}>{task.title}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: TEAL }}>{task.credits}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                        {task.creditRatePerHr} CITYx/hr
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>🏢 {task.issuerName}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>⏱ {task.estimatedTime}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                      {group.instances.length} open instance{group.instances.length === 1 ? "" : "s"}
                    </span>
                    <span style={{ fontSize: 12, color: ACCENT }}>
                      {isExpanded ? "Hide instances ▲" : "Show instances ▼"}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 2 }}>
                    {group.instances.map(instance => (
                      <TaskCard
                        key={instance.id}
                        task={instance}
                        isClaimed={myTaskIds.has(instance.id) || localClaimedTaskIdSet.has(instance.id)}
                        locked={!isOnboarded && !instance.isOnboarding}
                        showClaimButton
                        tutorialAllowClaim={
                          tutorialHighlightTaskInstances &&
                          (tutorialTargetClaimTaskId
                            ? instance.id === tutorialTargetClaimTaskId
                            : shouldHighlightTaskGroup)
                        }
                        onClaim={() => handleClaim(instance)}
                        onExecute={() => setExecuteTask(instance)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )
      ) : myTasks.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>No claimed tasks yet</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>Head to Open Tasks to claim one</div>
        </div>
      ) : (
        orderedClaimedTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            isClaimed
            locked={false}
            pendingVerification={pendingVerificationIds.includes(task.id) || task.completionStatus === 1}
            canUnclaim={task.completionStatus === 0 || task.completionStatus === 3}
            showUnclaimButton
            tutorialHighlightActions={tutorialHighlightClaimedActions && task.id === highlightedClaimedTaskId}
            onUnclaim={() => handleUnclaim(task)}
            onExecute={() => setExecuteTask(task)}
          />
        ))
      )}

      {executeTask && (
        <ExecuteModal
          task={executeTask}
          onConfirm={handleExecuteConfirm}
          onClose={() => setExecuteTask(null)}
          tutorialAllowSubmit={tutorialStep === "box13"}
        />
      )}
      {claimConfirmTask && (
        <ClaimConfirmSheet
          task={claimConfirmTask}
          onConfirm={() => handleClaimConfirmed(claimConfirmTask)}
          onCancel={() => setClaimConfirmTask(null)}
          tutorialAllowConfirm={tutorialStep === "box11"}
        />
      )}
      {unclaimConfirmTask && (
        <UnclaimConfirmSheet
          task={unclaimConfirmTask}
          onConfirm={() => handleUnclaimConfirmed(unclaimConfirmTask)}
          onCancel={() => setUnclaimConfirmTask(null)}
        />
      )}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// COMMUNITY TAB  (Feed + Vote)
// ═════════════════════════════════════════════════════════════════════════════

function CommunityTab({ onLearnMore }: { onLearnMore: (key: ParticipantLearnCardKey) => void }) {
  const [section, setSection] = useState<"feed" | "vote">("feed");

  return (
    <div style={{ paddingBottom: 20 }}>
      {/* Learn More row — above segment toggle, triggers both cards */}
      <div style={{ display: "flex", justifyContent: "flex-end", margin: "16px 16px 4px" }}>
        <LearnMoreLink
          onClick={() => {
            onLearnMore("mycity-feed");
            onLearnMore("vote-overview");
          }}
        />
      </div>
      {/* Segment toggle */}
      <div style={{ margin: "0 16px 20px" }}>
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: 16,
            display: "flex",
            overflow: "hidden",
          }}
        >
          {(
            [
              { key: "feed" as const, label: "MyCity Feed", color: ACCENT },
              { key: "vote" as const, label: "Vote", color: PURPLE },
            ] as const
          ).map(({ key, label, color }, i) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              style={{
                flex: 1,
                border: "none",
                borderRadius: i === 0 ? "16px 0 0 16px" : "0 16px 16px 0",
                padding: "9px 0",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                background: section === key ? color : "transparent",
                color: section === key ? "#15151E" : "rgba(255,255,255,0.45)",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {section === "feed" && (
        <div style={{ padding: "0 16px" }}>
          <MyCityTab _onLearnMore={onLearnMore} />
        </div>
      )}
      {section === "vote" && (
        <div style={{ padding: "0 16px" }}>
          <VoteTab onLearnMore={onLearnMore} />
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MYCITY TAB
// ═════════════════════════════════════════════════════════════════════════════

function MyCityTab({ _onLearnMore }: { _onLearnMore?: (key: ParticipantLearnCardKey) => void }) {
  const { state, likePost } = useDemo();
  const [sort, setSort] = useState<"recent" | "top">("recent");

  const sorted = [...state.posts].sort((a, b) =>
    sort === "recent" ? new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime() : b.likes - a.likes,
  );

  const AUTHOR_COLORS: Record<string, string> = {
    "issuer-1": "#4CAF50",
    "issuer-2": "#FF9800",
    "issuer-3": "#9C27B0",
    "redeemer-1": TEAL,
    "redeemer-2": ACCENT,
    "redeemer-4": GOLD,
  };
  const CAT_BADGE: Record<string, string> = {
    Announcement: ACCENT,
    Event: "#9C27B0",
    Update: "#607D8B",
    Opportunity: TEAL,
  };

  return (
    <div style={{ paddingBottom: 4 }}>
      <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: 3 }}>
          {(["recent", "top"] as const).map(s => (
            <button
              key={s}
              onClick={() => setSort(s)}
              style={{
                padding: "6px 14px",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                background: sort === s ? "rgba(255,255,255,0.1)" : "transparent",
                color: sort === s ? "white" : "rgba(255,255,255,0.45)",
              }}
            >
              {s === "recent" ? "Recent" : "Top"}
            </button>
          ))}
        </div>
      </div>

      {sorted.map(post => {
        const liked = state.participant.likedPostIds.includes(post.id);
        const avatarColor = AUTHOR_COLORS[post.authorId] ?? ACCENT;
        const badgeColor = CAT_BADGE[post.category] ?? "#666";

        return (
          <div key={post.id} style={{ ...cardAccent, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: `${avatarColor}26`,
                    border: `1.5px solid ${avatarColor}55`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    color: avatarColor,
                  }}
                >
                  {post.authorName[0]}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{post.authorName}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                    {post.authorType === "issuer" ? "Issuer Org" : "Redeemer Org"} · {timeAgo(post.postedAt)}
                  </div>
                </div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 9px",
                  borderRadius: 20,
                  background: `${badgeColor}22`,
                  color: badgeColor,
                  border: `1px solid ${badgeColor}44`,
                }}
              >
                {post.category}
              </span>
            </div>

            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, marginBottom: 14 }}>
              {post.content}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => likePost(post.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: liked ? "rgba(255,90,100,0.12)" : "rgba(255,255,255,0.05)",
                  border: liked ? "1px solid rgba(255,90,100,0.3)" : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 20,
                  padding: "6px 14px",
                  cursor: "pointer",
                  color: liked ? "#ff5a64" : "rgba(255,255,255,0.5)",
                  fontSize: 13,
                  fontWeight: 600,
                  transition: "all 0.15s",
                }}
              >
                <IconHeart filled={liked} />
                {post.likes}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// VOTE TAB
// ═════════════════════════════════════════════════════════════════════════════

function VoteTab({ onLearnMore: _onLearnMore }: { onLearnMore?: (key: ParticipantLearnCardKey) => void }) {
  const { state, allocateMceVote, likeEpoch2 } = useDemo();
  const p = state.participant;
  const [section, setSection] = useState<"epoch1" | "epoch2">("epoch1");

  const totalAllocated = Object.values(p.mceVoteAllocations).reduce((a, b) => a + b, 0);
  const remaining = p.voteBalance - totalAllocated;
  const epoch1Mces = state.mces.filter(m => m.status === "Voting");
  const STEP = 1;

  const adjust = (mceId: string, delta: number) => {
    const current = p.mceVoteAllocations[mceId] ?? 0;
    allocateMceVote(mceId, current + delta);
  };

  return (
    <div style={{ paddingBottom: 4 }}>
      {/* Epoch toggle */}
      <div
        style={{
          display: "flex",
          background: "rgba(255,255,255,0.05)",
          borderRadius: 10,
          padding: 4,
          marginBottom: 20,
        }}
      >
        {(
          [
            { key: "epoch1", label: "Epoch 1 · Voting", color: PURPLE },
            { key: "epoch2", label: "Epoch 2 · Upcoming", color: GOLD },
          ] as const
        ).map(s => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            style={{
              flex: 1,
              padding: "9px 0",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              background: section === s.key ? s.color : "transparent",
              color: section === s.key ? "#15151E" : "rgba(255,255,255,0.45)",
              transition: "all 0.15s",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === "epoch1" && (
        <>
          {/* Vote balance summary */}
          <div
            style={{
              ...card,
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>VOTE Balance</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "white" }}>{p.voteBalance.toLocaleString()}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>Unallocated</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: remaining > 0 ? TEAL : "rgba(255,255,255,0.3)" }}>
                {remaining.toLocaleString()}
              </div>
            </div>
          </div>

          {p.voteBalance === 0 ? (
            <div style={{ ...card, marginBottom: 16, textAlign: "center", padding: "24px 16px" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>🗳️</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>
                No VOTE tokens yet
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
                Complete civic tasks to earn VOTE tokens. Each CITYx credit earned also mints 1 VOTE — both are issued
                1:1 for every completed task.
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 20 }}>
              <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    borderRadius: 3,
                    width: `${Math.min(100, (totalAllocated / p.voteBalance) * 100)}%`,
                    background: `linear-gradient(90deg, ${ACCENT}, ${TEAL})`,
                    transition: "width 0.2s",
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{totalAllocated} allocated</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{p.voteBalance} total</span>
              </div>
            </div>
          )}

          <SectionLabel text="Active Proposals" accentColor={PURPLE} />
          {(() => {
            const totalVotesCast = Math.max(
              epoch1Mces.reduce((sum, m) => sum + m.votesFor + (p.mceVoteAllocations[m.id] ?? 0), 0),
              1,
            );
            return epoch1Mces.map((mce, i) => {
              const allocated = p.mceVoteAllocations[mce.id] ?? 0;
              const totalVotes = mce.votesFor + allocated;
              const pct = Math.round((totalVotes / totalVotesCast) * 100);

              return (
                <div key={mce.id} style={{ ...cardPurple, marginBottom: 12 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ flex: 1, paddingRight: 10 }}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>MCE-0{i + 1}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "white", lineHeight: 1.35 }}>{mce.title}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>
                        by {mce.proposerName}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: allocated > 0 ? ACCENT : "rgba(255,255,255,0.25)",
                        }}
                      >
                        {allocated}
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>your VOTE</div>
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, marginBottom: 12 }}>
                    {mce.description.slice(0, 120)}…
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <div
                      style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: TEAL,
                          borderRadius: 3,
                          transition: "width 0.2s",
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                        {totalVotes.toLocaleString()} votes for
                      </span>
                      <span style={{ fontSize: 11, color: TEAL }}>{pct}%</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", flex: 1 }}>Allocate VOTE:</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button
                        onClick={() => adjust(mce.id, -STEP)}
                        disabled={allocated === 0}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          border: "1px solid rgba(255,255,255,0.12)",
                          background: "rgba(255,255,255,0.06)",
                          cursor: allocated === 0 ? "not-allowed" : "pointer",
                          color: allocated === 0 ? "rgba(255,255,255,0.2)" : "white",
                          fontSize: 18,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        −
                      </button>
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: allocated > 0 ? ACCENT : "rgba(255,255,255,0.25)",
                          minWidth: 36,
                          textAlign: "center",
                        }}
                      >
                        {allocated}
                      </span>
                      <button
                        onClick={() => adjust(mce.id, STEP)}
                        disabled={remaining < STEP}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          border: "1px solid rgba(255,255,255,0.12)",
                          background: remaining >= STEP ? `${ACCENT}33` : "rgba(255,255,255,0.06)",
                          color: remaining >= STEP ? ACCENT : "rgba(255,255,255,0.2)",
                          cursor: remaining < STEP ? "not-allowed" : "pointer",
                          fontSize: 18,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            });
          })()}

          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.25)",
              textAlign: "center",
              marginTop: 8,
              lineHeight: 1.5,
            }}
          >
            Allocations can be adjusted during the open voting period.
          </div>
        </>
      )}

      {section === "epoch2" && (
        <>
          {state.epoch2Proposals.map(prop => {
            const liked = state.participant.likedEpoch2Ids.includes(prop.id);
            return (
              <div key={prop.id} style={{ ...cardPurple, marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 20,
                      background: prop.proposerType === "org" ? "rgba(65,105,225,0.15)" : "rgba(52,238,182,0.12)",
                      color: prop.proposerType === "org" ? ACCENT : TEAL,
                      border: `1px solid ${prop.proposerType === "org" ? "rgba(65,105,225,0.3)" : "rgba(52,238,182,0.25)"}`,
                    }}
                  >
                    {prop.proposerType === "org" ? "Org" : "Citizen"}
                  </span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{timeAgo(prop.proposedAt)}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "white", lineHeight: 1.35, marginBottom: 4 }}>
                  {prop.title}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>
                  by {prop.proposerName}
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginBottom: 12 }}>
                  {prop.description.slice(0, 130)}…
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                  {prop.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 11,
                        padding: "2px 8px",
                        borderRadius: 20,
                        background: "rgba(255,255,255,0.05)",
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => likeEpoch2(prop.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: liked ? "rgba(255,90,100,0.12)" : "rgba(255,255,255,0.05)",
                      border: liked ? "1px solid rgba(255,90,100,0.3)" : "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 20,
                      padding: "7px 16px",
                      cursor: "pointer",
                      color: liked ? "#ff5a64" : "rgba(255,255,255,0.5)",
                      fontSize: 13,
                      fontWeight: 600,
                      transition: "all 0.15s",
                    }}
                  >
                    <IconHeart filled={liked} /> {prop.likes}
                  </button>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// REDEEM TAB
// ═════════════════════════════════════════════════════════════════════════════

type CreditFilter = "All" | "CITYx" | "MCE";
type RedeemView = "browse" | "history";
type RedeemWriteStatus = {
  state: "idle" | "pending" | "confirmed" | "failed";
  hash?: `0x${string}`;
  error?: string;
};

function RedeemTab({
  onLearnMore,
  tutorialStep,
  onTutorialStepChange,
}: {
  onLearnMore: (key: ParticipantLearnCardKey) => void;
  tutorialStep: IssuerTutorialStep;
  onTutorialStepChange: (step: IssuerTutorialStep) => void;
}) {
  const { state, redeemOffer } = useDemo();
  const p = state.participant;
  const [view, setView] = useState<RedeemView>("browse");
  const [filter] = useState<CreditFilter>("All");
  const [confirmOffer, setConfirmOffer] = useState<RedemptionOffer | null>(null);
  const [redeemWriteStatus, setRedeemWriteStatus] = useState<RedeemWriteStatus>({ state: "idle" });
  const [showRedeemTxBox, setShowRedeemTxBox] = useState(true);
  const [tutorialOfferingIds, setTutorialOfferingIds] = useState<string[]>(() => getDemoTutorialOfferingIds());

  useEffect(() => {
    setTutorialOfferingIds(getDemoTutorialOfferingIds());
  }, [tutorialStep]);

  // Show all offers (CITYx and MCE) — MCE offers are visually distinguished by color
  const parseOfferSortKey = React.useCallback((offer: RedemptionOffer) => {
    const onchainMatch = offer.id.match(/^onchain:0x[a-fA-F0-9]{40}:(\d+)$/);
    if (onchainMatch) {
      return Number(onchainMatch[1]);
    }
    const anyNumeric = offer.id.match(/(\d{4,})/g);
    if (anyNumeric && anyNumeric.length > 0) {
      const candidate = Number(anyNumeric[anyNumeric.length - 1]);
      if (Number.isFinite(candidate)) return candidate;
    }
    return 0;
  }, []);

  const filteredOffers = React.useMemo(() => {
    const sorted = [...state.offers].sort((a, b) => parseOfferSortKey(b) - parseOfferSortKey(a));
    if (tutorialStep !== "box24" && tutorialStep !== "box25") return sorted;
    const tutorialSet = new Set(
      tutorialOfferingIds.map(id => {
        const match = id.match(/^onchain:(0x[a-fA-F0-9]{40}):(\d+)$/);
        if (!match) return id.toLowerCase();
        return `onchain:${match[1].toLowerCase()}:${match[2]}`;
      }),
    );
    const normalized = (id: string) => {
      const match = id.match(/^onchain:(0x[a-fA-F0-9]{40}):(\d+)$/);
      if (!match) return id.toLowerCase();
      return `onchain:${match[1].toLowerCase()}:${match[2]}`;
    };
    sorted.sort((a, b) => Number(tutorialSet.has(normalized(b.id))) - Number(tutorialSet.has(normalized(a.id))));
    return sorted;
  }, [parseOfferSortKey, state.offers, tutorialOfferingIds, tutorialStep]);

  const normalizeOfferIdentity = React.useCallback((id: string) => {
    const onchainMatch = id.match(/^onchain:(0x[a-fA-F0-9]{40}):(\d+)$/);
    if (onchainMatch) return `onchain:${onchainMatch[1].toLowerCase()}:${onchainMatch[2]}`;
    return id.toLowerCase();
  }, []);
  const tutorialOfferIdSet = React.useMemo(
    () => new Set(tutorialOfferingIds.map(normalizeOfferIdentity)),
    [normalizeOfferIdentity, tutorialOfferingIds],
  );
  const highlightedTutorialOfferId =
    tutorialStep === "box24" || tutorialStep === "box25"
      ? (filteredOffers.find(offer => tutorialOfferIdSet.has(normalizeOfferIdentity(offer.id)))?.id ??
        filteredOffers[0]?.id)
      : undefined;
  const filteredRedemptions = React.useMemo(() => {
    const resolveMceOnly = (redemption: PastRedemption): boolean => {
      if (typeof redemption.mceOnly === "boolean") return redemption.mceOnly;
      const matched = state.offers.find(offer =>
        redemption.offerId
          ? offer.id === redemption.offerId
          : offer.offerTitle === redemption.offerTitle && offer.redeemerName === redemption.redeemerName,
      );
      return Boolean(matched?.mceOnly);
    };
    return [...state.pastRedemptions]
      .sort((a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime())
      .filter(redemption => {
        const isMceOnly = resolveMceOnly(redemption);
        if (filter === "MCE") return isMceOnly;
        if (filter === "CITYx") return !isMceOnly;
        return true;
      })
      .map(redemption => ({
        ...redemption,
        isMceOnly: resolveMceOnly(redemption),
      }));
  }, [filter, state.offers, state.pastRedemptions]);

  const handleConfirm = async () => {
    if (!confirmOffer) return;
    const offer = confirmOffer;
    setRedeemWriteStatus({ state: "pending" });
    const result = await redeemOffer(offer.id);
    if (!result.ok) {
      setRedeemWriteStatus({ state: "failed", error: result.error });
      return;
    }
    // Keep modal open — confirmed=true triggers flash animation, auto-closes after 2.5s
    setRedeemWriteStatus({ state: "confirmed", hash: result.hash });
  };

  useEffect(() => {
    if (tutorialStep === "box25" && redeemWriteStatus.state === "confirmed") {
      onTutorialStepChange("box26");
    }
  }, [onTutorialStepChange, redeemWriteStatus.state, tutorialStep]);

  return (
    <div style={{ padding: "20px 16px 24px" }}>
      <style>{`
        @keyframes tutorialPulse {
          0%, 100% { box-shadow: 0 0 0 1px rgba(255,226,162,0.28), 0 0 10px rgba(221,158,51,0.24); }
          50% { box-shadow: 0 0 0 1px rgba(255,226,162,0.6), 0 0 18px rgba(221,158,51,0.46); }
        }
      `}</style>
      {/* Learn More row — above balance boxes */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <LearnMoreLink onClick={() => onLearnMore("redeem-flow")} />
      </div>

      {/* Balance boxes */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, ...card, padding: "12px 14px", textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: TEAL }}>{p.cityBalance}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>CITYx Available</div>
        </div>
        <div style={{ flex: 1, ...card, padding: "12px 14px", textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: GOLD }}>{p.mceBalance}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>MCE Credits</div>
        </div>
      </div>

      {/* Browse / History toggle */}
      <div
        style={{
          display: "flex",
          background: "rgba(255,255,255,0.05)",
          borderRadius: 10,
          padding: 4,
          marginBottom: 12,
        }}
      >
        {(
          [
            { key: "browse", label: "Browse Offerings", color: ACCENT },
            { key: "history", label: "Redemption History", color: GOLD },
          ] as const
        ).map(item => (
          <button
            key={item.key}
            onClick={() => setView(item.key)}
            style={{
              flex: 1,
              padding: "9px 0",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              background: view === item.key ? item.color : "transparent",
              color: view === item.key ? "#15151E" : "rgba(255,255,255,0.45)",
              transition: "all 0.15s",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {redeemWriteStatus.state !== "idle" && showRedeemTxBox && (
        <div
          style={{
            ...card,
            marginBottom: 12,
            border:
              redeemWriteStatus.state === "confirmed"
                ? "1px solid rgba(52,238,182,0.35)"
                : redeemWriteStatus.state === "failed"
                  ? "1px solid rgba(255,107,157,0.35)"
                  : "1px solid rgba(65,105,225,0.35)",
            background:
              redeemWriteStatus.state === "confirmed"
                ? "rgba(52,238,182,0.08)"
                : redeemWriteStatus.state === "failed"
                  ? "rgba(255,107,157,0.08)"
                  : "rgba(65,105,225,0.08)",
            position: "relative",
            paddingRight: 32,
          }}
        >
          <button
            onClick={() => setShowRedeemTxBox(false)}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.55)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 20,
              height: 20,
            }}
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>Last Redemption Write</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 6 }}>
            {redeemWriteStatus.state === "pending" && "Pending wallet/user-op confirmation..."}
            {redeemWriteStatus.state === "confirmed" && "Confirmed onchain"}
            {redeemWriteStatus.state === "failed" && "Failed onchain"}
          </div>
          {redeemWriteStatus.error && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", lineHeight: 1.45 }}>
              {redeemWriteStatus.error}
            </div>
          )}
          {redeemWriteStatus.hash && (
            <a
              href={`https://sepolia.basescan.org/tx/${redeemWriteStatus.hash}`}
              target="_blank"
              rel="noreferrer"
              style={{ display: "inline-block", marginTop: 6, fontSize: 12, color: ACCENT, textDecoration: "none" }}
            >
              View on Base Sepolia Explorer ↗
            </a>
          )}
        </div>
      )}

      {view === "browse" ? (
        <>
          {/* Offers */}
          {filteredOffers.map(offer => {
            const canAfford = p.cityBalance >= offer.costCity;
            const needsMce = offer.mceOnly && p.mceBalance < offer.costCity;
            const disabled = !canAfford || needsMce;
            const shouldHighlightOffer =
              (tutorialStep === "box24" || tutorialStep === "box25") && offer.id === highlightedTutorialOfferId;

            return (
              <div
                key={offer.id}
                style={{
                  ...card,
                  marginBottom: 10,
                  opacity: disabled ? 0.55 : 1,
                  ...(offer.mceOnly
                    ? {
                        borderLeft: `3px solid rgba(221,158,51,0.5)`,
                        background: "rgba(221,158,51,0.04)",
                        paddingLeft: 13,
                      }
                    : {
                        borderLeft: "3px solid rgba(52,238,182,0.4)",
                        paddingLeft: 13,
                      }),
                }}
              >
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      flexShrink: 0,
                      background: "rgba(255,255,255,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                    }}
                  >
                    {offer.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 3,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{offer.offerTitle}</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                          {offer.redeemerName}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", paddingLeft: 8, flexShrink: 0 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: offer.mceOnly ? GOLD : TEAL }}>
                          {offer.costCity}
                        </div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                          {offer.mceOnly ? "MCE" : "CITYx"}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.45, marginBottom: 10 }}>
                      {offer.description}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {offer.mceOnly && (
                          <span
                            style={{
                              fontSize: 11,
                              padding: "2px 8px",
                              borderRadius: 20,
                              background: "rgba(221,158,51,0.15)",
                              color: GOLD,
                              border: "1px solid rgba(221,158,51,0.3)",
                            }}
                          >
                            MCE Only
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: 11,
                            padding: "2px 8px",
                            borderRadius: 20,
                            background: "rgba(255,255,255,0.05)",
                            color: "rgba(255,255,255,0.4)",
                          }}
                        >
                          {offer.category}
                        </span>
                      </div>
                      <button
                        data-tutorial-allow={shouldHighlightOffer ? "true" : undefined}
                        onClick={() => {
                          if (disabled) return;
                          setRedeemWriteStatus({ state: "idle" });
                          setShowRedeemTxBox(true);
                          setConfirmOffer(offer);
                          if (tutorialStep === "box24" && offer.id === highlightedTutorialOfferId) {
                            onTutorialStepChange("box25");
                          }
                        }}
                        disabled={disabled}
                        style={{
                          padding: "8px 18px",
                          borderRadius: 10,
                          border: "none",
                          cursor: disabled ? "not-allowed" : "pointer",
                          background: disabled
                            ? "rgba(255,255,255,0.07)"
                            : shouldHighlightOffer
                              ? "linear-gradient(145deg, rgba(221,158,51,0.95), rgba(221,158,51,0.78))"
                              : TEAL,
                          color: disabled ? "rgba(255,255,255,0.3)" : shouldHighlightOffer ? "#15151E" : "#15151E",
                          fontSize: 13,
                          fontWeight: 700,
                          boxShadow:
                            !disabled && shouldHighlightOffer
                              ? "0 0 0 1px rgba(255,226,162,0.4), 0 0 12px rgba(221,158,51,0.42)"
                              : undefined,
                        }}
                      >
                        {!canAfford ? "Can't Afford" : needsMce ? "Need MCE" : "Redeem"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredOffers.length === 0 && (
            <div style={{ ...card, textAlign: "center", padding: "24px 16px" }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 4 }}>No offers found.</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Try changing your token filter.</div>
            </div>
          )}
        </>
      ) : (
        <div style={{ marginTop: 4 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "rgba(255,255,255,0.45)",
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            Recent Redemptions
          </div>
          {filteredRedemptions.length === 0 ? (
            <div style={{ ...card, textAlign: "center", padding: "20px 16px" }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 4 }}>
                No redemptions yet for this filter.
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                Redeem an offering to populate history.
              </div>
            </div>
          ) : (
            filteredRedemptions.map(r => (
              <div key={r.id} style={{ ...cardGold, marginBottom: 8, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2, flexWrap: "wrap" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{r.offerTitle}</div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          borderRadius: 999,
                          padding: "2px 8px",
                          background: r.isMceOnly ? "rgba(221,158,51,0.18)" : "rgba(52,238,182,0.16)",
                          color: r.isMceOnly ? GOLD : TEAL,
                          border: r.isMceOnly ? "1px solid rgba(221,158,51,0.28)" : "1px solid rgba(52,238,182,0.28)",
                        }}
                      >
                        {r.isMceOnly ? "MCE" : "CITYx"}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                      {r.redeemerName} · {fmtDateTime(r.redeemedAt)}
                    </div>
                    <a
                      href={`https://sepolia.basescan.org/tx/${r.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-block",
                        marginTop: 4,
                        fontSize: 11,
                        color: ACCENT,
                        textDecoration: "none",
                      }}
                    >
                      View transaction
                    </a>
                  </div>
                  <div style={{ textAlign: "right", minWidth: 62 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,100,100,0.9)" }}>-{r.costCity}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>burned</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {confirmOffer && (
        <RedeemModal
          offer={confirmOffer}
          onConfirm={handleConfirm}
          onClose={() => {
            if (redeemWriteStatus.state !== "pending") {
              setConfirmOffer(null);
              // Leave redeemWriteStatus as-is so the block-explorer link box
              // stays visible after a confirmed redemption.
            }
          }}
          pending={redeemWriteStatus.state === "pending"}
          confirmed={redeemWriteStatus.state === "confirmed"}
          error={redeemWriteStatus.state === "failed" ? redeemWriteStatus.error : undefined}
          tutorialHighlightConfirm={tutorialStep === "box25"}
        />
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════

export default function ParticipantPage() {
  const { state, setRole } = useDemo();
  const router = useRouter();
  const { address } = useAccount({ type: "ModularAccountV2" });
  const [activeTab, setActiveTab] = useState("profile");
  const [openInfoCards, setOpenInfoCards] = useState<ParticipantLearnCardKey[]>([]);
  const [tutorialStep, setTutorialStep] = useState<IssuerTutorialStep>(() => readIssuerTutorialStepFromStorage());
  const [tutorialWalletOpened, setTutorialWalletOpened] = useState(false);
  const tutorialLockActive = tutorialStep !== "intro" && tutorialStep !== "dismissed";
  const persistTutorialStep = React.useCallback((nextStep: IssuerTutorialStep) => {
    try {
      window.localStorage.setItem(ISSUER_TUTORIAL_STORAGE_KEY, nextStep);
    } catch {
      // Ignore storage failures.
    }
  }, []);

  useEffect(() => {
    if (!state.role) setRole("participant");
  }, [state.role, setRole]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(ISSUER_TUTORIAL_STORAGE_KEY, tutorialStep);
    } catch {
      // Ignore storage failures.
    }
  }, [tutorialStep]);

  useEffect(() => {
    // Allow cross-role tutorial handoff steps (box15+ / box18+). Only dismiss truly invalid values.
    if (PARTICIPANT_ROLE_TUTORIAL_STEPS.has(tutorialStep) || /^box\d+$/.test(tutorialStep)) return;
    setTutorialStep("dismissed");
  }, [tutorialStep]);

  const startIssuerTutorial = React.useCallback(() => {
    startDemoTutorialRun();
    persistTutorialStep("box1");
    setTutorialStep("box1");
    setRole("issuer");
    router.push("/demo/issuer");
  }, [persistTutorialStep, router, setRole]);

  const exitTutorial = React.useCallback(() => {
    clearDemoTutorialRun();
    persistTutorialStep("dismissed");
    setTutorialStep("dismissed");
  }, [persistTutorialStep]);

  useEffect(() => {
    if (tutorialStep === "box10") {
      setTutorialStep("box11");
      return;
    }
    if (tutorialStep === "box12") {
      setTutorialStep("box13");
    }
  }, [tutorialStep]);

  useEffect(() => {
    if (tutorialStep === "box11" || tutorialStep === "box13" || tutorialStep === "box14") {
      setActiveTab("explore");
      return;
    }
    if (tutorialStep === "box23" || tutorialStep === "box24" || tutorialStep === "box25" || tutorialStep === "box26") {
      setActiveTab("redeem");
    }
  }, [tutorialStep]);

  const rightPanel = getParticipantRightPanel(activeTab);
  const tutorialCard = (() => {
    if (tutorialStep === "dismissed") return null;

    const cardStyle: React.CSSProperties = {
      background: "rgba(221,158,51,0.08)",
      border: "1px solid rgba(221,158,51,0.28)",
      borderRadius: 16,
      padding: 14,
    };
    const subtitleStyle: React.CSSProperties = {
      fontSize: 10,
      color: "rgba(221,158,51,0.8)",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      fontWeight: 700,
      marginBottom: 6,
    };
    const titleStyle: React.CSSProperties = { fontSize: 15, color: "#fff", fontWeight: 700, marginBottom: 8 };
    const bodyStyle: React.CSSProperties = {
      fontSize: 12,
      color: "rgba(255,255,255,0.72)",
      lineHeight: 1.6,
      whiteSpace: "pre-line",
    };
    const buttonRowStyle: React.CSSProperties = { display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" };

    if (tutorialStep === "intro") {
      return (
        <div style={cardStyle}>
          <div style={subtitleStyle}>Tutorial</div>
          <div style={titleStyle}>Welcome to the City/Sync Demo</div>
          <div style={{ ...bodyStyle, whiteSpace: "pre-line" }}>{SHARED_TUTORIAL_INTRO_TEXT}</div>
          <div style={buttonRowStyle}>
            <button
              onClick={exitTutorial}
              style={{
                border: "none",
                borderRadius: 10,
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              No Thanks
            </button>
            <button
              onClick={startIssuerTutorial}
              style={{
                border: "none",
                borderRadius: 10,
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                background: "#DD9E33",
                color: "#15151E",
              }}
            >
              Start Tutorial
            </button>
          </div>
        </div>
      );
    }

    if (tutorialStep === "box11") {
      return (
        <div style={cardStyle}>
          <div style={subtitleStyle}>Step 7</div>
          <div style={titleStyle}>Claim Two Tasks</div>
          <div style={bodyStyle}>
            Civic-Participants are able to Browse all issued tasks and claim up to 2 tasks at any given time.
            {"\n"}Please go ahead and claim 2 of the 3 tasks you issued.
          </div>
          <div style={buttonRowStyle}>
            <button
              onClick={exitTutorial}
              style={{
                border: "none",
                borderRadius: 10,
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              Exit Tutorial
            </button>
          </div>
        </div>
      );
    }

    if (tutorialStep === "box13") {
      return (
        <div style={cardStyle}>
          <div style={subtitleStyle}>Step 8</div>
          <div style={titleStyle}>Execute a Claimed Task</div>
          <div style={bodyStyle}>
            When executing a task, Civic-Participants will be able to submit proof of task completion and provide
            feedback to Issuers about their experience. Go ahead and Execute on of your two tasks.
          </div>
          <div style={buttonRowStyle}>
            <button
              onClick={exitTutorial}
              style={{
                border: "none",
                borderRadius: 10,
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              Exit Tutorial
            </button>
          </div>
        </div>
      );
    }

    if (tutorialStep === "box14") {
      return (
        <div style={cardStyle}>
          <div style={subtitleStyle}>Step 9</div>
          <div style={titleStyle}>Return to Issuer Verification</div>
          <div style={bodyStyle}>
            Now, lets take a look again at how the Issuers are handling the Claimed and executed tasks.
          </div>
          <div style={buttonRowStyle}>
            <button
              onClick={exitTutorial}
              style={{
                border: "none",
                borderRadius: 10,
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              Exit Tutorial
            </button>
            <button
              onClick={() => {
                setRole("issuer");
                setTutorialStep("box15");
                persistTutorialStep("box15");
                router.push("/demo/issuer");
              }}
              style={{
                border: "none",
                borderRadius: 10,
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                background: "#DD9E33",
                color: "#15151E",
              }}
            >
              Continue
            </button>
          </div>
        </div>
      );
    }

    if (tutorialStep === "box23") {
      return (
        <div style={cardStyle}>
          <div style={subtitleStyle}>Step 17</div>
          <div style={titleStyle}>Your Wallet and Balances</div>
          <div style={bodyStyle}>
            After completed tasks are verified, users are Minted CITY and VOTE. Civic-Participants can keep track of
            their balances in their wallet.
          </div>
          <div style={buttonRowStyle}>
            <button
              onClick={exitTutorial}
              style={{
                border: "none",
                borderRadius: 10,
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              Exit Tutorial
            </button>
          </div>
        </div>
      );
    }

    if (tutorialStep === "box24") {
      return (
        <div style={cardStyle}>
          <div style={subtitleStyle}>Step 18</div>
          <div style={titleStyle}>Redeem an Offering</div>
          <div style={bodyStyle}>
            Civic-Participants can spend their credits on available offerings. Go ahead and spend your credits on the
            offering you created by clicking redeem.
          </div>
          <div style={buttonRowStyle}>
            <button
              onClick={exitTutorial}
              style={{
                border: "none",
                borderRadius: 10,
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              Exit Tutorial
            </button>
          </div>
        </div>
      );
    }

    if (tutorialStep === "box25") {
      return (
        <div style={cardStyle}>
          <div style={subtitleStyle}>Step 19</div>
          <div style={titleStyle}>Point-of-Sale Confirmation</div>
          <div style={bodyStyle}>
            When a Civic-Participant scans a QR code to redeem an offer, a visual and audible cue will flash on their
            screen to show Redeemer Organization employees that the CITY has been burned and they are permitted to
            provide those goods and services.
          </div>
          <div style={buttonRowStyle}>
            <button
              onClick={exitTutorial}
              style={{
                border: "none",
                borderRadius: 10,
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              Exit Tutorial
            </button>
          </div>
        </div>
      );
    }

    if (tutorialStep === "box26") {
      return (
        <div style={cardStyle}>
          <div style={subtitleStyle}>Step 20</div>
          <div style={titleStyle}>You’re Ready to Explore</div>
          <div style={bodyStyle}>
            {
              "Now that you have a good understanding of the major functions that facilitate the City/Sync protocol, feel free to explore more of the application and learn more about the abilities of the different roles."
            }
          </div>
          <div style={buttonRowStyle}>
            <button
              onClick={exitTutorial}
              style={{
                border: "none",
                borderRadius: 10,
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              Exit Tutorial
            </button>
            <button
              onClick={() => {
                setTutorialStep("dismissed");
              }}
              style={{
                border: "none",
                borderRadius: 10,
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                background: "#DD9E33",
                color: "#15151E",
              }}
            >
              Finish Tutorial
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={cardStyle}>
        <div style={subtitleStyle}>Tutorial</div>
        <div style={titleStyle}>Tutorial in Progress</div>
        <div style={bodyStyle}>Continue the tutorial in the currently highlighted role and tab.</div>
      </div>
    );
  })();
  const leftPanel = (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", gap: 12 }}>
      {tutorialCard}
      {openInfoCards.length > 0 ? (
        <LearnMorePanel
          keys={openInfoCards}
          cards={PARTICIPANT_LEARN_CARDS}
          onClose={key => setOpenInfoCards(prev => prev.filter(existing => existing !== key))}
          accent={ACCENT}
        />
      ) : (
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
          Use Learn More links in the app to load contextual cards in this panel.
        </div>
      )}
      {tutorialStep === "dismissed" && (
        <div
          style={{
            marginTop: "auto",
            paddingTop: 10,
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <button
            onClick={startIssuerTutorial}
            style={{
              width: "100%",
              border: "1px dashed rgba(221,158,51,0.4)",
              background: "rgba(221,158,51,0.08)",
              color: "#DD9E33",
              borderRadius: 10,
              padding: "9px 10px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Start Tutorial
          </button>
        </div>
      )}
    </div>
  );

  const openLearnMore = React.useCallback((key: ParticipantLearnCardKey) => {
    setOpenInfoCards(prev => (prev.includes(key) ? prev : [...prev, key]));
  }, []);

  return (
    <>
      <AppShell
        role="participant"
        address={address ?? FAKE_WALLETS.participant}
        cityBalance={state.participant.cityBalance}
        voteBalance={state.participant.voteBalance}
        mceBalance={state.participant.mceBalance}
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        accentColor={ACCENT}
        title="CitySync · Citizen"
        leftPanel={leftPanel}
        rightPanel={rightPanel}
        phoneFrame
        tutorialLocked={tutorialLockActive}
        tutorialHighlightWalletButton={tutorialStep === "box23"}
        tutorialHighlightWalletCloseButton={tutorialStep === "box23" && tutorialWalletOpened}
        onWalletOpen={() => {
          if (tutorialStep === "box23") setTutorialWalletOpened(true);
        }}
        onWalletClose={() => {
          if (tutorialStep === "box23" && tutorialWalletOpened) {
            setTutorialStep("box24");
            setTutorialWalletOpened(false);
          }
        }}
      >
        {activeTab === "profile" && <ProfileTab onTabChange={setActiveTab} onLearnMore={openLearnMore} />}
        {activeTab === "explore" && (
          <ExploreTab onLearnMore={openLearnMore} tutorialStep={tutorialStep} onTutorialStepChange={setTutorialStep} />
        )}
        {activeTab === "community" && <CommunityTab onLearnMore={openLearnMore} />}
        {activeTab === "redeem" && (
          <RedeemTab onLearnMore={openLearnMore} tutorialStep={tutorialStep} onTutorialStepChange={setTutorialStep} />
        )}
      </AppShell>
    </>
  );
}

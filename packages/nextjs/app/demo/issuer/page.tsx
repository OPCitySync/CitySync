"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAccount, useAuthModal, useSignerStatus } from "@account-kit/react";
import { formatUnits } from "viem";
import AppShell from "../_components/AppShell";
import { LearnInfoCard, LearnMoreLink, LearnMorePanel } from "../_components/LearnMore";
import { OnchainActivityPanel } from "../_components/OnchainActivityPanel";
import { baseSepoliaPublicClient } from "../_config/baseSepoliaClient";
import { BASE_SEPOLIA_CONTRACTS } from "../_config/baseSepoliaContracts";
import { useDemo } from "../_context/DemoContext";
import { FAKE_WALLETS, Post, PostCategory, Task } from "../_data/mockData";
import { compressPhotoToBase64 } from "../_utils/compressPhoto";
import {
  applyParticipantScoreEvent,
  getAllParticipantScoreSnapshots,
  type ParticipantScoreSnapshot,
} from "../_utils/participantScoring";

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconBuilding = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M3 21h18M6 21V7l6-4 6 4v14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M10 21v-4h4v4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

const IconClipboard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const IconShieldCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconCity = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M3 21h18M3 7l9-4 9 4v14H3V7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M9 21v-6h6v6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const IconPencil = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path
      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconHeart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── Constants & Styles ───────────────────────────────────────────────────────

const TABS = [
  { key: "profile", label: "Profile", icon: <IconBuilding /> },
  { key: "tasks", label: "Tasks", icon: <IconClipboard /> },
  { key: "verify", label: "Verify", icon: <IconShieldCheck /> },
  { key: "community", label: "Community", icon: <IconCity /> },
];

const EPOCH1_CAP = 312;
const EPOCH_RESET_KEY = "citysync:demo:issuer:epochReset:v1";
const EPOCH_RESET_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
const ISSUER_TUTORIAL_STORAGE_KEY = "citysync:demo:issuer:tutorial:v1";

const ACCENT = "#DD9E33"; // gold — primary issuer colour
const ACCENT_PURPLE = "#a78bfa"; // purple — community / MCE content
const ACCENT_TEAL = "#34eeb6"; // teal — verify / success states
const SURFACE = "#1E1E2C";
const BG = "#15151E";
const MUTED = "rgba(255,255,255,0.45)";
const DIMMED = "rgba(255,255,255,0.25)";

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

// ─── Panel helpers ────────────────────────────────────────────────────────────

function getIssuerRightPanel(_activeTab: string): React.ReactNode {
  const rightPanel = <OnchainActivityPanel role="issuer" accent={ACCENT} />;

  switch (_activeTab) {
    case "profile":
      return rightPanel;
    case "tasks":
      return rightPanel;
    case "mycity":
      return rightPanel;
    case "verify":
      return rightPanel;
    case "mces":
      return rightPanel;
    default:
      return rightPanel;
  }
}

const surfaceCard: React.CSSProperties = {
  background: SURFACE,
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
  padding: "16px",
  boxShadow: "0 2px 12px rgba(0,0,0,0.28)",
};

/** Card with a faint gold left accent — for primary content cards (tasks) */
const accentCard: React.CSSProperties = {
  ...surfaceCard,
  borderLeft: `3px solid rgba(221,158,51,0.45)`,
  paddingLeft: 13,
};

/** Card with a purple left accent — for catalog / community cards */
const purpleCard: React.CSSProperties = {
  ...surfaceCard,
  borderLeft: `3px solid rgba(167,139,250,0.5)`,
  paddingLeft: 13,
};

const POST_CATEGORIES: PostCategory[] = ["Announcement", "Event", "Update", "Opportunity"];

const CATEGORY_COLOR: Record<PostCategory, string> = {
  Announcement: "#4169E1",
  Event: "#DD9E33",
  Update: "#34eeb6",
  Opportunity: "#a78bfa",
};

const STATUS_COLOR: Record<string, string> = {
  Voting: "#4169E1",
  Planning: "#DD9E33",
  Active: "#34eeb6",
  Closed: "rgba(255,255,255,0.3)",
  Rejected: "#ff6b9d",
};

type IssuerLearnCardKey =
  | "becoming-certified-issuer"
  | "activity-stats"
  | "epoch-issuance"
  | "active-tasks"
  | "issue-tasks"
  | "task-catalog"
  | "verify-flow"
  | "mycity-feed"
  | "epoch1-voting"
  | "next-epoch";

const ISSUER_LEARN_CARDS: Record<IssuerLearnCardKey, LearnInfoCard> = {
  "becoming-certified-issuer": {
    title: "Becoming a Certified Issuer Organization",
    subtitle: "Role onboarding and certification",
    body: "In production, onboarding certification is reviewed by governance and operational criteria set by City/Sync before issuance permissions are granted. Issuer eligibility requires that an organization be formally incorporated as a public-service entity, demonstrate a track record of serving the local community, and possess the operational capacity to manage and oversee a volunteer program.",
  },
  "activity-stats": {
    title: "Activity Stats",
    subtitle: "How issuer metrics are tracked",
    body: "These stats summarize your onchain task lifecycle activity, including created tasks, credits issued, and verifications currently awaiting action.",
  },
  "epoch-issuance": {
    title: "Epoch Issuance",
    subtitle: "Allocation and budget controls",
    body: "Each epoch sets an issuance budget to balance credit supply with redemption capacity. Issuers can monitor consumption in real time and adjust issuance strategy throughout the epoch.",
  },
  "active-tasks": {
    title: "Active Tasks",
    subtitle: "Live task instance state",
    body: "Active task instances are opportunities that are currently open, claimed, or pending verification. Completed or unissued tasks are excluded from this list.",
  },
  "issue-tasks": {
    title: "Issuing Tasks",
    subtitle: "How issuance works onchain",
    body: "Use approved catalog templates to issue live task instances onchain. Each issued instance enters the open task pool for participants to claim, execute, and submit for issuer verification.",
  },
  "task-catalog": {
    title: "Task Catalog Operations",
    subtitle: "From Approval to Issuance",
    body: "The Task catalog serves to standardize Task rates over time. As new tasks enter the City-Wide Task catalog, the Representative Issuer Committee will begin to set standard rates of similar tasks, similarly. The Committee has the final say in what rate is issued for that Task and if the proposed task satisfies the rule requirements set out by the Committee. The initial Task ruleset will include the following declarations: (1) tasks cannot replace existing paid functions of the Issuer Organization, and (2) tasks must facilitate the delivery of a public-good or public-service.",
  },
  "verify-flow": {
    title: "Verification and CITY Distribution",
    subtitle: "Task Tracking",
    body: "Issuer organizations can keep track of Issued Tasks available to Civic Participants, when they are claimed, and when they need to be verified. When issuers verify completion, the workflow mints CITY and VOTE rewards to participants.",
  },
  "mycity-feed": {
    title: "Issuer MyCity Feed",
    subtitle: "Public Communication Layer",
    body: "The MyCity feed lets Issuer and Redeemer organizations publish updates, opportunities, announcements, and events as a method to inform and engage with Civic Participants. This offers the public-sector a channel for publicity and awareness for important community activities.",
  },
  "epoch1-voting": {
    title: "Epoch 1 Voting",
    subtitle: "Planning MCE's",
    body: "Epoch 1 voting is reserved for Civic Participants. Your role is to monitor which proposals are gaining support. The Issuer Representative Committee will be responsible for creating and distributing tasks on behalf of Issuer organizations that will execute on the winning proposal. These tasks will be added to your Task Catalog automatically during the next Epoch.",
  },
  "next-epoch": {
    title: "The Next Epoch",
    subtitle: "Epoch Proposals & Process",
    body: "While Epoch 1 Proposals are being voted on, active Issuer and Redeemer organizations will have the ability to propose their own MCE initiatives based on their observations and desires for the community. During this time, Civic Participants can boost these proposals through likes to provide signaling for the Issuer Committee, who will ultimately decide the top 5 proposals based on community need. Redeemers also have the opportunity to influence what 5 proposals are selected by providing preemptive Redemption Offerings for proposals that they like. This allows private businesses to influence community direction through their willingness to offer private goods and services in exchange for local outcomes.",
  },
};

type IssuerTutorialStep = "intro" | "box1" | "box2" | "box3" | "dismissed";

function readIssuerTutorialStepFromStorage(): IssuerTutorialStep {
  if (typeof window === "undefined") return "intro";
  try {
    const raw = window.localStorage.getItem(ISSUER_TUTORIAL_STORAGE_KEY);
    if (raw === "intro" || raw === "box1" || raw === "box2" || raw === "box3" || raw === "dismissed") return raw;
  } catch {
    // Ignore storage access failures.
  }
  return "intro";
}

function TutorialCard({
  title,
  body,
  subtitle,
  children,
}: {
  title: string;
  body: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "rgba(221,158,51,0.08)",
        border: "1px solid rgba(221,158,51,0.28)",
        borderRadius: 16,
        padding: 14,
      }}
    >
      {subtitle && (
        <div
          style={{
            fontSize: 10,
            color: "rgba(221,158,51,0.8)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 700,
            marginBottom: 6,
          }}
        >
          {subtitle}
        </div>
      )}
      <div style={{ fontSize: 15, color: "#fff", fontWeight: 700, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", lineHeight: 1.6, whiteSpace: "pre-line" }}>
        {body}
      </div>
      {children && <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>{children}</div>}
    </div>
  );
}

function TutorialActionButton({
  label,
  onClick,
  variant = "primary",
}: {
  label: string;
  onClick: () => void;
  variant?: "primary" | "ghost";
}) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "none",
        borderRadius: 10,
        padding: "8px 12px",
        fontSize: 12,
        fontWeight: 700,
        cursor: "pointer",
        background: variant === "primary" ? ACCENT : "rgba(255,255,255,0.08)",
        color: variant === "primary" ? BG : "rgba(255,255,255,0.8)",
      }}
    >
      {label}
    </button>
  );
}

function IssuerTutorialPanel({
  step,
  orgName,
  onStart,
  onDismissIntro,
  onContinueBox2,
  onContinueBox3,
}: {
  step: IssuerTutorialStep;
  orgName: string;
  onStart: () => void;
  onDismissIntro: () => void;
  onContinueBox2: () => void;
  onContinueBox3: () => void;
}) {
  const safeOrgName = orgName.trim() || "Issuer Organization";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {step === "intro" && (
        <TutorialCard
          subtitle="Tutorial"
          title="Welcome to the City/Sync Demo"
          body="Everything in this demo has a shared onchain state for critical functions, and local storage that allows edits to your profile, picture, etc. to persist.\n\nEvery transaction you make is visible to all users and roles. When you sign up for City/Sync you are automatically provided a wallet, and all transaction costs are sponsored.\n\nWhile transaction verification will be shown in this demo, users in the Pilot Program will be completely unaware of smart-contract interactions. The purpose of this demo is to simulate as closely as possible to the UX for each role in the pilot, and provide testers an understanding of the underlying functionality. Let's get started!"
        >
          <TutorialActionButton label="No Thanks" variant="ghost" onClick={onDismissIntro} />
          <TutorialActionButton label="Start Tutorial" onClick={onStart} />
        </TutorialCard>
      )}

      {step === "box1" && (
        <TutorialCard
          subtitle="Step 1"
          title="Let's start with Issuers"
          body="Issuers are public-sector organizations that facilitate volunteer programs and are well-suited for issuing and verifying civic-labor tasks.\n\nIssuers can use the City/Sync platform to enhance their already existing Volunteer Programs or build new ones from the ground up.\n\nThis protocol offers a discovery method for civic participants to learn about new volunteer opportunities in their city.\n\nTo start, please give your Issuer Organization a name using the edit profile button highlighted in the Profile tab."
        />
      )}

      {step === "box2" && (
        <TutorialCard
          subtitle="Step 2"
          title={`Welcome ${safeOrgName}!`}
          body="Great name! Now every Issuer organization who is certified through City/Sync will have an opportunity to participate in the Public-Sector economy. Issuer organizations have the unique ability to create a public-sector credit (CITY) that can be used to access local offerings provided by other public-sector organizations or mission-aligned businesses called Redeemers."
        >
          <TutorialActionButton label="Continue" onClick={onContinueBox2} />
        </TutorialCard>
      )}

      {step === "box3" && (
        <TutorialCard
          subtitle="Step 3"
          title="Understanding the Issuance Cap"
          body="In order to maintain balance, the amount of credits issued should be in equilibrium with the amount of credits being redeemed for goods and services. Therefore, it's important to understand the Issuance Cap.\n\nThe issuance cap is the amount of credits that are allowed to be distributed during a specific Epoch (3 month period) by all Issuer organizations. The cap is spread evenly between all participating Issuers and can only be used to reward volunteers for expanding their organizational impact and mission. Issuers can keep track of their credits issued throughout the Epoch."
        >
          <TutorialActionButton label="Continue" onClick={onContinueBox3} />
        </TutorialCard>
      )}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  const isError = /fail|error|not ready/i.test(message);
  const isInfo = /submitting|approving|pending/i.test(message);
  const accentBorder = isError ? "rgba(255,107,157,0.65)" : isInfo ? "rgba(130,160,255,0.55)" : "rgba(221,158,51,0.6)";
  const iconColor = isError ? "#ff6b9d" : isInfo ? "#8aa8ff" : ACCENT;

  React.useEffect(() => {
    const t = setTimeout(onDone, isInfo ? 8000 : 3500);
    return () => clearTimeout(t);
  }, [onDone, isInfo]);

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
          onClick={onDone}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.28)",
            cursor: "pointer",
            fontSize: 15,
            padding: 0,
            flexShrink: 0,
            lineHeight: 1,
            marginTop: 0,
          }}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

interface ProposedTask {
  id: string;
  title: string;
  estimatedTime: string;
  location: string;
  date: string;
  successCriteria: string;
  creditRate: number;
  credentials: string;
  credits: number;
  tags: string[];
  /** Onchain proposal ID returned from TaskProposalRegistry.proposeTask() */
  onchainProposalId?: bigint;
  /** Tx hash from the proposeTask() call */
  proposeTxHash?: `0x${string}`;
}

type TaskWriteStatus = {
  state: "idle" | "pending" | "confirmed" | "failed";
  hash?: `0x${string}`;
  error?: string;
};

type VerifyDecision = "verify" | "reject";

export default function IssuerApp() {
  const {
    state,
    dispatch,
    setRole,
    issuerProposeTask,
    issuerApproveTask,
    issuerCreateTask,
    issuerVerifyCompletion,
    issuerSetTaskActive,
  } = useDemo();
  const { address } = useAccount({ type: "ModularAccountV2" });
  const { openAuthModal } = useAuthModal();
  const { isConnected, isAuthenticating } = useSignerStatus();
  const [activeTab, setActiveTab] = useState("profile");
  const [createSheet, setCreateSheet] = useState(false);
  const [proposeSheet, setProposeSheet] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [localPosts, setLocalPosts] = useState<Post[]>([]);
  const [proposedTasks, setProposedTasks] = useState<ProposedTask[]>([]);
  const [approvedCatalogTasks, setApprovedCatalogTasks] = useState<Task[]>([]);
  const [issueTaskId, setIssueTaskId] = useState<string | null>(null);
  const [catalogModifyTaskId, setCatalogModifyTaskId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [taskWriteStatus, setTaskWriteStatus] = useState<TaskWriteStatus>({ state: "idle" });
  const [verifyWriteStatus, setVerifyWriteStatus] = useState<TaskWriteStatus>({ state: "idle" });
  const [unissueWriteStatus, setUnissueWriteStatus] = useState<TaskWriteStatus>({ state: "idle" });
  const [proposeWriteStatus, setProposeWriteStatus] = useState<TaskWriteStatus>({ state: "idle" });
  const [optimisticHiddenVerifyTaskIds, setOptimisticHiddenVerifyTaskIds] = useState<string[]>([]);
  const [openInfoCards, setOpenInfoCards] = useState<IssuerLearnCardKey[]>([]);
  const [tutorialStep, setTutorialStep] = useState<IssuerTutorialStep>(() => readIssuerTutorialStepFromStorage());
  const [unissueConfirmId, setUnissueConfirmId] = useState<string | null>(null);
  const [noShowConfirmItem, setNoShowConfirmItem] = useState<{
    taskId: string;
    claimant: `0x${string}`;
    title: string;
  } | null>(null);
  const [epochCreditOffset, setEpochCreditOffset] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      const raw = window.localStorage.getItem(EPOCH_RESET_KEY);
      return raw ? (JSON.parse(raw) as { resetAt: number; offsetCredits: number }).offsetCredits : 0;
    } catch {
      return 0;
    }
  });

  // Always-current ref so the settle-timer can read tasks after DemoContext hydrates.
  const issuerTasksRef = React.useRef([] as typeof issuer.tasks);

  const { issuer } = state;
  issuerTasksRef.current = issuer.tasks;
  const rightPanel = getIssuerRightPanel(activeTab);
  const leftPanel = (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", gap: 12 }}>
      <IssuerTutorialPanel
        step={tutorialStep}
        orgName={issuer.orgName}
        onStart={() => {
          setActiveTab("profile");
          setTutorialStep("box1");
        }}
        onDismissIntro={() => setTutorialStep("dismissed")}
        onContinueBox2={() => setTutorialStep("box3")}
        onContinueBox3={() => setTutorialStep("dismissed")}
      />
      {openInfoCards.length > 0 ? (
        <LearnMorePanel
          keys={openInfoCards}
          cards={ISSUER_LEARN_CARDS}
          onClose={key => setOpenInfoCards(prev => prev.filter(k => k !== key))}
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
            onClick={() => {
              setActiveTab("profile");
              setTutorialStep("box1");
            }}
            style={{
              width: "100%",
              border: "1px dashed rgba(221,158,51,0.4)",
              background: "rgba(221,158,51,0.08)",
              color: ACCENT,
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

  const openLearnMore = React.useCallback((key: IssuerLearnCardKey) => {
    setOpenInfoCards(prev => (prev.includes(key) ? prev : [...prev, key]));
  }, []);

  React.useEffect(() => {
    setRole("issuer");
    // Intentional mount-only role selection; avoids reruns when callback identity updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(ISSUER_TUTORIAL_STORAGE_KEY, tutorialStep);
    } catch {
      // Ignore storage access failures.
    }
  }, [tutorialStep]);

  // Weekly epoch reset: 250ms settle lets DemoContext hydrate issuer.tasks before we snapshot.
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window === "undefined") return;
      try {
        const raw = window.localStorage.getItem(EPOCH_RESET_KEY);
        const stored = raw
          ? (JSON.parse(raw) as { resetAt: number; offsetCredits: number })
          : { resetAt: 0, offsetCredits: 0 };
        if (Date.now() - stored.resetAt > EPOCH_RESET_MS) {
          const total = issuerTasksRef.current.reduce((s, t) => s + t.credits, 0);
          const next = { resetAt: Date.now(), offsetCredits: total };
          window.localStorage.setItem(EPOCH_RESET_KEY, JSON.stringify(next));
          setEpochCreditOffset(total);
        }
      } catch {
        // Ignore storage failures.
      }
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  const catalogStorageKey = React.useMemo(
    () => `citysync:demo:issuer:catalog:v1:${(address ?? FAKE_WALLETS.issuer).toLowerCase()}`,
    [address],
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(catalogStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Task[];
      if (Array.isArray(parsed)) setApprovedCatalogTasks(parsed);
    } catch {
      // Ignore catalog hydration failures.
    }
  }, [catalogStorageKey]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(catalogStorageKey, JSON.stringify(approvedCatalogTasks));
    } catch {
      // Ignore catalog persistence failures.
    }
  }, [approvedCatalogTasks, catalogStorageKey]);

  const allPosts = [...localPosts, ...state.posts];
  const allTimeCredits = issuer.tasks.reduce((sum, t) => sum + t.credits, 0);
  const creditsCommitted = Math.max(0, allTimeCredits - epochCreditOffset);

  const handleVerify = async (
    taskId: string,
    citizen: string,
    options?: { decision?: VerifyDecision; feedback?: string },
  ) => {
    const decision = options?.decision ?? "verify";
    const feedback = options?.feedback?.trim() ?? "";
    if (decision === "reject" && feedback.length === 0) {
      setVerifyWriteStatus({ state: "failed", error: "Feedback is required for Reject & Mint." });
      setToast("Reject & Mint requires feedback.");
      return;
    }

    if (!address) {
      setVerifyWriteStatus({ state: "failed", error: "Session not ready. Finish sign-in and retry Verify & Mint." });
      if (!isAuthenticating) openAuthModal();
      setToast("Finish sign-in to activate your issuer account, then retry.");
      return;
    }

    setVerifyWriteStatus({ state: "pending" });
    const result = await issuerVerifyCompletion(taskId, citizen);
    if (result.ok) {
      const scoreResult = applyParticipantScoreEvent({
        participantAddress: citizen,
        taskId,
        type: decision === "reject" ? "reject_mint" : "verify_mint",
        issuerAddress: address,
        feedback,
      });
      if (decision === "reject" && scoreResult) {
        setToast(`Rejected & Minted. RD ${scoreResult.db.toFixed(1)} · RS ${scoreResult.rs.toFixed(1)}.`);
      } else if (decision === "verify" && scoreResult) {
        setToast(`Verified & Minted. RD ${scoreResult.db.toFixed(1)} · RS ${scoreResult.rs.toFixed(1)}.`);
      }
      setVerifyWriteStatus({ state: "confirmed", hash: result.hash });
      return;
    }
    setVerifyWriteStatus({ state: "failed", error: result.error });
  };

  const handleProposeTask = async (proposed: ProposedTask) => {
    setProposeSheet(false);
    setProposeWriteStatus({ state: "pending" });
    const result = await issuerProposeTask({
      title: proposed.title,
      description: proposed.successCriteria || "Community civic task.",
      successCriteria: proposed.successCriteria || "",
      estimatedTime: proposed.estimatedTime,
      location: proposed.location || "TBD",
      creditReward: proposed.credits,
      voteReward: proposed.credits,
    });
    if (!result.ok) {
      setProposeWriteStatus({ state: "failed", error: result.error ?? "Proposal failed onchain." });
      return;
    }
    // Store locally with the onchain proposal ID so Approve can reference it
    setProposedTasks(prev => [
      { ...proposed, onchainProposalId: result.proposalId, proposeTxHash: result.hash },
      ...prev,
    ]);
    setProposeWriteStatus({ state: "confirmed", hash: result.hash });
  };

  const handleApproveProposed = async (proposed: ProposedTask) => {
    // Dedup check
    const dupInCatalog = approvedCatalogTasks.some(t => t.title.toLowerCase() === proposed.title.toLowerCase());
    const dupInIssued = issuer.tasks.some(t => t.title.toLowerCase() === proposed.title.toLowerCase());
    if (dupInCatalog || dupInIssued) {
      setToast("A task with this title already exists in the catalog.");
      return;
    }

    // If we have an onchain proposal ID, call approveTask() on the contract
    if (proposed.onchainProposalId !== undefined) {
      setProposeWriteStatus({ state: "pending" });
      const result = await issuerApproveTask(proposed.onchainProposalId);
      if (!result.ok) {
        setProposeWriteStatus({ state: "failed", error: result.error ?? "Approval failed onchain." });
        return;
      }
      setProposeWriteStatus({ state: "confirmed", hash: result.hash });
    }

    const task: Task = {
      id: `task-approved-${Date.now()}`,
      title: proposed.title,
      description: proposed.successCriteria || "Community civic task proposed by organization.",
      category: "Community",
      estimatedTime: proposed.estimatedTime,
      location: proposed.location || "TBD",
      credits: proposed.credits,
      voteTokens: proposed.credits,
      slots: 5,
      slotsRemaining: 5,
      issuerName: issuer.orgName,
      issuerId: address ?? FAKE_WALLETS.issuer,
      tags: proposed.tags,
      taskDate: proposed.date || "TBD",
      successCriteria: proposed.successCriteria || "",
      creditRatePerHr: proposed.creditRate,
      credentials: proposed.credentials || "None",
      isMCE: false,
      isOnboarding: false,
    };
    setApprovedCatalogTasks(prev => [task, ...prev]);
    setProposedTasks(prev => prev.filter(p => p.id !== proposed.id));
  };

  const handleIssueTask = async (task: Task, slots: number) => {
    if (!address) {
      setTaskWriteStatus({ state: "failed", error: "Session not ready. Finish sign-in and tap Issue again." });
      if (!isAuthenticating) openAuthModal();
      setToast("Finish sign-in to activate your issuer account, then issue from catalog.");
      return;
    }

    const projectedCost = task.credits * slots;
    const remainingBudget = Math.max(0, EPOCH1_CAP - creditsCommitted);
    if (projectedCost > remainingBudget) {
      const error = `Issuance exceeds remaining Epoch budget (${projectedCost} > ${remainingBudget} CITYx).`;
      setTaskWriteStatus({ state: "failed", error });
      setToast("Issuance blocked: exceeds remaining Epoch budget.");
      return;
    }

    setTaskWriteStatus({ state: "pending" });
    setIssueTaskId(null);

    let okCount = 0;
    let lastHash: `0x${string}` | undefined;
    let firstError: string | undefined;
    let committedRunning = creditsCommitted;

    for (let i = 0; i < slots; i++) {
      // Hard pre-write guard: avoid sending any write once local running budget is exhausted.
      if (committedRunning + task.credits > EPOCH1_CAP) {
        firstError = `Issuance exceeds remaining Epoch budget (${committedRunning + task.credits} > ${EPOCH1_CAP} CITYx).`;
        break;
      }

      const localId = `task-issued-${Date.now()}-${i + 1}`;
      const result = await issuerCreateTask({ ...task, id: localId, slots: 1, slotsRemaining: 1 });
      if (result.ok) {
        okCount += 1;
        committedRunning += task.credits;
        if (result.hash) lastHash = result.hash;
      } else if (!firstError) {
        firstError = result.error;
      }
    }

    if (okCount === slots) {
      setTaskWriteStatus({ state: "confirmed", hash: lastHash });
      return;
    }

    if (okCount > 0) {
      setTaskWriteStatus({
        state: "failed",
        hash: lastHash,
        error: firstError ? `${firstError} (${okCount}/${slots} succeeded)` : `${okCount}/${slots} succeeded`,
      });
      return;
    }

    setTaskWriteStatus({ state: "failed", error: firstError ?? "Task issuance failed." });
  };

  const handleModifyApproved = (taskId: string, updates: { location: string; taskDate: string }) => {
    setApprovedCatalogTasks(prev => prev.map(t => (t.id === taskId ? { ...t, ...updates } : t)));
    setCatalogModifyTaskId(null);
    setToast("Task updated.");
  };

  const handleCreatePost = (post: Post) => {
    setLocalPosts(prev => [post, ...prev]);
    setComposeOpen(false);
    setToast("Post published to MyCity!");
  };

  const handleUnissueTask = React.useCallback(
    async (taskId: string) => {
      setUnissueWriteStatus({ state: "pending" });
      setOptimisticHiddenVerifyTaskIds(prev => (prev.includes(taskId) ? prev : [...prev, taskId]));
      const result = await issuerSetTaskActive(taskId, false);
      if (!result.ok) {
        setOptimisticHiddenVerifyTaskIds(prev => prev.filter(id => id !== taskId));
        setUnissueWriteStatus({ state: "failed", error: result.error ?? "Unissue failed." });
        return result;
      }
      dispatch({ type: "ISSUER_REMOVE_TASK", taskId });
      setUnissueWriteStatus({ state: "confirmed", hash: result.hash });
      return result;
    },
    [issuerSetTaskActive, dispatch],
  );

  return (
    <>
      <AppShell
        role="issuer"
        orgName={issuer.orgName}
        address={address ?? FAKE_WALLETS.issuer}
        cityBalance={state.participant.cityBalance}
        voteBalance={0}
        mceBalance={0}
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        accentColor={ACCENT}
        title="Issuer"
        leftPanel={leftPanel}
        rightPanel={rightPanel}
        phoneFrame
      >
        {isConnected && !address && (
          <div
            style={{
              marginBottom: 12,
              background: "rgba(65,105,225,0.12)",
              border: "1px solid rgba(65,105,225,0.35)",
              color: "rgba(255,255,255,0.85)",
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 12,
            }}
          >
            Reconnecting issuer account session…
          </div>
        )}
        {activeTab === "profile" && (
          <ProfileTab
            issuer={issuer}
            creditsCommitted={creditsCommitted}
            onLearnMore={openLearnMore}
            tutorialHighlightEditProfile={tutorialStep === "box1"}
            tutorialHighlightEpoch={tutorialStep === "box3"}
            onOrganizationNameSaved={_nextName => {
              if (tutorialStep === "box1") {
                setTutorialStep("box2");
              }
            }}
          />
        )}
        {activeTab === "tasks" && (
          <TasksTab
            creditsCommitted={creditsCommitted}
            onCreateOpen={() => setCreateSheet(true)}
            onProposeOpen={() => setProposeSheet(true)}
            proposedTasks={proposedTasks}
            onApproveProposed={handleApproveProposed}
            approvedCatalogTasks={approvedCatalogTasks}
            onModifyCatalogTask={taskId => setCatalogModifyTaskId(taskId)}
            taskWriteStatus={taskWriteStatus}
            onDismissTaskWrite={() => setTaskWriteStatus({ state: "idle" })}
            proposeWriteStatus={proposeWriteStatus}
            onDismissProposeWrite={() => setProposeWriteStatus({ state: "idle" })}
            onLearnMore={openLearnMore}
            onUnissueConfirm={setUnissueConfirmId}
          />
        )}
        {activeTab === "verify" && (
          <VerifyTab
            onVerify={handleVerify}
            onSetTaskActive={issuerSetTaskActive}
            onUnissueTask={handleUnissueTask}
            verifyWriteStatus={verifyWriteStatus}
            onDismissVerifyWrite={() => setVerifyWriteStatus({ state: "idle" })}
            unissueWriteStatus={unissueWriteStatus}
            onDismissUnissueWrite={() => setUnissueWriteStatus({ state: "idle" })}
            hiddenTaskIds={optimisticHiddenVerifyTaskIds}
            onLearnMore={openLearnMore}
            onUnissueConfirm={setUnissueConfirmId}
            onNoShowConfirm={setNoShowConfirmItem}
          />
        )}
        {activeTab === "community" && (
          <CommunityTab
            posts={allPosts}
            orgName={issuer.orgName}
            state={state}
            onCompose={() => setComposeOpen(true)}
            onLearnMore={openLearnMore}
          />
        )}

        {createSheet && (
          <CreateTaskSheet
            onClose={() => setCreateSheet(false)}
            approvedCatalogTasks={approvedCatalogTasks}
            onIssueTask={id => {
              setIssueTaskId(id);
              setCreateSheet(false);
            }}
          />
        )}

        {issueTaskId &&
          (() => {
            const task = approvedCatalogTasks.find(t => t.id === issueTaskId);
            return task ? (
              <IssueTaskPopup
                task={task}
                creditsCommitted={creditsCommitted}
                onClose={() => setIssueTaskId(null)}
                onIssue={slots => handleIssueTask(task, slots)}
              />
            ) : null;
          })()}
        {proposeSheet && (
          <ProposeTaskSheet
            onClose={() => setProposeSheet(false)}
            onPropose={handleProposeTask}
            creditsCommitted={creditsCommitted}
          />
        )}

        {composeOpen && (
          <ComposePostSheet orgName={issuer.orgName} onClose={() => setComposeOpen(false)} onPost={handleCreatePost} />
        )}

        {catalogModifyTaskId &&
          (() => {
            const task = approvedCatalogTasks.find(t => t.id === catalogModifyTaskId);
            return task ? (
              <ModifyTaskSheet
                task={task}
                onClose={() => setCatalogModifyTaskId(null)}
                onSave={updates => handleModifyApproved(task.id, updates)}
              />
            ) : null;
          })()}

        {unissueConfirmId && (
          <UnissueConfirmSheet
            taskId={unissueConfirmId}
            onConfirm={() => {
              void handleUnissueTask(unissueConfirmId);
              setUnissueConfirmId(null);
            }}
            onCancel={() => setUnissueConfirmId(null)}
          />
        )}
        {noShowConfirmItem && (
          <NoShowConfirmSheet
            item={noShowConfirmItem}
            onConfirm={async () => {
              const target = noShowConfirmItem;
              if (!target) return;
              const result = await handleUnissueTask(target.taskId);
              if (result.ok) {
                const scoreResult = applyParticipantScoreEvent({
                  participantAddress: target.claimant,
                  taskId: target.taskId,
                  type: "no_show",
                  issuerAddress: address,
                });
                if (scoreResult) {
                  setToast(`No-Show recorded. RD ${scoreResult.db.toFixed(1)} · RS ${scoreResult.rs.toFixed(1)}.`);
                }
              }
              setNoShowConfirmItem(null);
            }}
            onCancel={() => setNoShowConfirmItem(null)}
          />
        )}
      </AppShell>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab({
  issuer,
  creditsCommitted,
  onLearnMore,
  tutorialHighlightEditProfile,
  tutorialHighlightEpoch,
  onOrganizationNameSaved,
}: {
  issuer: ReturnType<typeof useDemo>["state"]["issuer"];
  creditsCommitted: number;
  onLearnMore: (key: IssuerLearnCardKey) => void;
  tutorialHighlightEditProfile: boolean;
  tutorialHighlightEpoch: boolean;
  onOrganizationNameSaved: (nextName: string) => void;
}) {
  const { dispatch, state } = useDemo();
  const { address } = useAccount({ type: "ModularAccountV2" });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(issuer.orgName);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [section, setSection] = useState<"profile" | "dashboard">("profile");
  const [showActiveTasks, setShowActiveTasks] = useState(false);
  const [activeTaskInstances, setActiveTaskInstances] = useState<
    Array<{ id: string; title: string; credits: number; status: "Open" | "Claimed" | "Pending Verification" }>
  >([]);
  const [scoreSnapshots, setScoreSnapshots] = useState<ParticipantScoreSnapshot[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const issuerAddress = address ?? FAKE_WALLETS.issuer;
  const shortAddress = `${issuerAddress.slice(0, 8)}...${issuerAddress.slice(-6)}`;
  const logoStorageKey = `citysync:demo:profile:photo:issuer:v1:${issuerAddress.toLowerCase()}`;
  const nameStorageKey = `citysync:demo:issuer:name:v1:${issuerAddress.toLowerCase()}`;

  // Hydrate org name from localStorage on mount (works even without wallet connection).
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem(nameStorageKey);
      if (saved && !issuer.orgName) {
        dispatch({ type: "ISSUER_REGISTER", orgName: saved });
        setDraft(saved);
      }
    } catch {
      // Ignore hydration failures.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameStorageKey]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressPhotoToBase64(file)
      .then(dataUrl => {
        setLogoUrl(dataUrl);
        try {
          window.localStorage.setItem(logoStorageKey, dataUrl);
        } catch {
          // Storage full or unavailable — logo shows in-session only.
        }
      })
      .catch(() => {
        setLogoUrl(URL.createObjectURL(file));
      });
  };

  // Hydrate logo from localStorage on mount / address change.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem(logoStorageKey);
      if (saved) setLogoUrl(saved);
    } catch {
      // Ignore.
    }
  }, [logoStorageKey]);

  const startEdit = () => {
    setDraft(issuer.orgName);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const saveEdit = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      const changed = trimmed !== issuer.orgName;
      dispatch({ type: "ISSUER_REGISTER", orgName: trimmed });
      try {
        window.localStorage.setItem(nameStorageKey, trimmed);
      } catch {
        /* ignore */
      }
      if (changed) onOrganizationNameSaved(trimmed);
    }
    setEditing(false);
  };

  useEffect(() => {
    let cancelled = false;
    const parseMetadata = (raw: string): Partial<Task> => {
      try {
        return JSON.parse(raw) as Partial<Task>;
      } catch {
        return {};
      }
    };

    const sync = async () => {
      try {
        const nextId = (await baseSepoliaPublicClient.readContract({
          address: BASE_SEPOLIA_CONTRACTS.OpportunityManager.address,
          abi: BASE_SEPOLIA_CONTRACTS.OpportunityManager.abi,
          functionName: "nextOpportunityId",
          args: [],
        })) as bigint;

        const items: Array<{
          id: string;
          title: string;
          credits: number;
          status: "Open" | "Claimed" | "Pending Verification";
        }> = [];
        const ids = Array.from({ length: Number(nextId) }, (_, i) => BigInt(i));
        const issuerLower = issuerAddress.toLowerCase();

        const opportunityResults = await multicallInChunks(
          ids.map(id => ({
            address: BASE_SEPOLIA_CONTRACTS.OpportunityManager.address,
            abi: BASE_SEPOLIA_CONTRACTS.OpportunityManager.abi,
            functionName: "opportunities",
            args: [id],
          })),
        );

        const filtered: Array<{ id: bigint; opp: OpportunityRaw }> = [];
        opportunityResults.forEach((result, idx) => {
          if (result.status !== "success") return;
          const opp = result.result as OpportunityRaw;
          if (!opp[9]) return;
          if (opp[0].toLowerCase() !== issuerLower) return;
          filtered.push({ id: ids[idx], opp });
        });

        if (filtered.length === 0) {
          if (!cancelled) setActiveTaskInstances([]);
          return;
        }

        const claimantResults = await multicallInChunks(
          filtered.map(({ id }) => ({
            address: BASE_SEPOLIA_CONTRACTS.OpportunityManager.address,
            abi: BASE_SEPOLIA_CONTRACTS.OpportunityManager.abi,
            functionName: "claimedBy",
            args: [id],
          })),
        );

        const completionTargets: Array<{ id: bigint; claimant: `0x${string}` }> = [];

        filtered.forEach(({ id, opp }, idx) => {
          const claimantResult = claimantResults[idx];
          if (!claimantResult || claimantResult.status !== "success") return;
          const claimant = claimantResult.result as `0x${string}`;

          const metadata = parseMetadata(opp[1]);
          const base = {
            id: `task-${id.toString()}`,
            title: metadata.title || `Opportunity #${id.toString()}`,
            credits: Math.floor(Number(formatUnits(opp[2], 18))),
          };

          if (claimant === "0x0000000000000000000000000000000000000000") {
            items.push({ ...base, status: "Open" });
            return;
          }

          completionTargets.push({ id, claimant });
          items.push({ ...base, status: "Claimed" });
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

          completionTargets.forEach((target, completionIdx) => {
            const result = completionResults[completionIdx];
            if (!result || result.status !== "success") return;
            const completion = result.result as readonly [`0x${string}`, bigint, bigint, number];
            if (completion[2] > 0n || completion[3] === 2) {
              const id = `task-${target.id.toString()}`;
              const itemIdx = items.findIndex(item => item.id === id);
              if (itemIdx >= 0) items.splice(itemIdx, 1);
              return;
            }
            if (completion[1] > 0n || completion[3] === 1) {
              const id = `task-${target.id.toString()}`;
              const item = items.find(item => item.id === id);
              if (item) item.status = "Pending Verification";
            }
          });
        }

        if (!cancelled)
          setActiveTaskInstances(
            items.sort((a, b) => Number(b.id.match(/(\d+)$/)?.[1] ?? 0) - Number(a.id.match(/(\d+)$/)?.[1] ?? 0)),
          );
      } catch {
        if (!cancelled) setActiveTaskInstances([]);
      }
    };

    void sync();
    return () => {
      cancelled = true;
    };
  }, [issuerAddress]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => setScoreSnapshots(getAllParticipantScoreSnapshots());
    sync();
    const id = window.setInterval(sync, 3000);
    window.addEventListener("storage", sync);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <div style={{ padding: "24px 20px 100px", position: "relative" }}>
      <style>{`
        @keyframes tutorialPulse {
          0% { box-shadow: 0 0 0 0 rgba(221,158,51,0.35); }
          70% { box-shadow: 0 0 0 8px rgba(221,158,51,0); }
          100% { box-shadow: 0 0 0 0 rgba(221,158,51,0); }
        }
        @keyframes tutorialRadiant {
          0%, 100% {
            box-shadow:
              0 0 0 1px rgba(255,226,162,0.82),
              0 0 16px rgba(221,158,51,0.56),
              0 0 28px rgba(221,158,51,0.34);
            transform: scale(1);
          }
          50% {
            box-shadow:
              0 0 0 1px rgba(255,236,186,0.95),
              0 0 24px rgba(221,158,51,0.74),
              0 0 42px rgba(221,158,51,0.5),
              0 0 64px rgba(221,158,51,0.28);
            transform: scale(1.03);
          }
        }
      `}</style>
      <div style={{ background: SURFACE, borderRadius: 16, display: "flex", marginBottom: 20, overflow: "hidden" }}>
        {(
          [
            { key: "profile" as const, label: "Profile", color: ACCENT },
            { key: "dashboard" as const, label: "Dashboard", color: ACCENT_TEAL },
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
              color: section === key ? BG : MUTED,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {section === "dashboard" ? (
        <IssuerDashboardTab
          creditsCommitted={creditsCommitted}
          activeTaskInstances={activeTaskInstances}
          totalTasksIssued={state.issuer.totalTasksIssued}
          totalCreditsIssued={state.issuer.totalCreditsIssued}
          scoreSnapshots={scoreSnapshots}
        />
      ) : (
        <>
          {/* Welcome banner */}
          <div
            style={{
              background: "linear-gradient(145deg, #26200a 0%, #1f1d2b 55%, #151520 100%)",
              border: "1px solid rgba(221,158,51,0.22)",
              borderRadius: 20,
              padding: "20px",
              marginBottom: 20,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Subtle radial glow */}
            <div
              style={{
                position: "absolute",
                top: -30,
                right: -30,
                width: 140,
                height: 140,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(221,158,51,0.12) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "rgba(221,158,51,0.6)",
                  whiteSpace: "nowrap",
                }}
              >
                Certified Issuer Organization
              </div>
              <LearnMoreLink onClick={() => onLearnMore("becoming-certified-issuer")} />
            </div>

            {editing ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      saveEdit();
                    }
                    if (e.key === "Escape") setEditing(false);
                  }}
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(221,158,51,0.5)",
                    borderRadius: 8,
                    color: "#fff",
                    fontSize: 22,
                    fontWeight: 700,
                    padding: "4px 10px",
                    flex: 1,
                    outline: "none",
                  }}
                />
                <button
                  onClick={saveEdit}
                  style={{
                    background: ACCENT,
                    border: "none",
                    borderRadius: 8,
                    padding: "6px 10px",
                    cursor: "pointer",
                    color: BG,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <IconCheck />
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                {/* Logo upload */}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  style={{ display: "none" }}
                />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  title="Upload organization logo"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: logoUrl ? "transparent" : "rgba(221,158,51,0.12)",
                    border: `1px dashed ${logoUrl ? "transparent" : "rgba(221,158,51,0.4)"}`,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: 18 }}>🏛</span>
                  )}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>
                    {issuer.orgName || "Your Organization"}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(221,158,51,0.5)", marginTop: 1 }}>
                    Tap icon to upload logo
                  </div>
                </div>
                <button
                  onClick={startEdit}
                  style={{
                    background: tutorialHighlightEditProfile
                      ? "linear-gradient(145deg, rgba(221,158,51,0.3), rgba(221,158,51,0.18))"
                      : "transparent",
                    border: tutorialHighlightEditProfile ? "1px solid rgba(255,226,162,0.78)" : "none",
                    borderRadius: tutorialHighlightEditProfile ? 8 : 0,
                    cursor: "pointer",
                    color: tutorialHighlightEditProfile ? "#ffe2a2" : MUTED,
                    padding: tutorialHighlightEditProfile ? "6px 8px" : 4,
                    display: "flex",
                    alignItems: "center",
                    position: tutorialHighlightEditProfile ? "relative" : undefined,
                    zIndex: tutorialHighlightEditProfile ? 40 : undefined,
                    animation: tutorialHighlightEditProfile ? "tutorialRadiant 1.55s ease-in-out infinite" : undefined,
                  }}
                >
                  <IconPencil />
                </button>
              </div>
            )}

            <div
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                color: "rgba(255,255,255,0.6)",
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <span>{shortAddress}</span>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(issuerAddress);
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1200);
                  } catch {
                    // Ignore copy failures.
                  }
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: copied ? ACCENT_TEAL : ACCENT,
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
                href={`https://sepolia.basescan.org/address/${issuerAddress}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: ACCENT, textDecoration: "none", fontSize: 11 }}
              >
                View Account ↗
              </a>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <StatusPill label="Verified Issuer" color={ACCENT} />
              <StatusPill label="Base Sepolia" color={DIMMED} />
            </div>
          </div>

          {/* Role description */}
          <div
            style={{
              background: "rgba(221,158,51,0.06)",
              border: "1px solid rgba(221,158,51,0.15)",
              borderRadius: 14,
              padding: "14px 16px",
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 4 }}>Your Role as an Issuer</div>
            <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, margin: 0 }}>
              Certified Issuer Organizations are able to publish civic tasks that expand their impact and mission. They
              are also responsible for managing and verifying tasks completions. When an Issuer organization verifies
              task completion, CITY and VOTE credits are distributed to participants onchain.
            </p>
          </div>

          {/* Epoch 1 Issuance Allocation */}
          <SectionLabel
            text="Epoch 1 Issuance Allocation"
            right={<LearnMoreLink onClick={() => onLearnMore("epoch-issuance")} />}
          />
          <div
            style={{
              ...surfaceCard,
              marginBottom: 20,
              background: "linear-gradient(135deg, #1a1a00 0%, #1E1E2C 100%)",
              border: tutorialHighlightEpoch ? "1px solid rgba(221,158,51,0.58)" : "1px solid rgba(221,158,51,0.2)",
              boxShadow: tutorialHighlightEpoch
                ? "0 0 0 1px rgba(221,158,51,0.35), 0 10px 28px rgba(0,0,0,0.28)"
                : "0 2px 12px rgba(0,0,0,0.28)",
              animation: tutorialHighlightEpoch ? "tutorialPulse 1.7s ease-in-out infinite" : undefined,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Jan 1, 2026 – Mar 31, 2026</div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{EPOCH1_CAP} CITYx / month</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: ACCENT }}>{creditsCommitted}</div>
                <div style={{ fontSize: 11, color: MUTED }}>of {EPOCH1_CAP} CITYx used</div>
              </div>
            </div>
            {/* Progress bar */}
            <div
              style={{
                height: 6,
                borderRadius: 3,
                background: "rgba(255,255,255,0.08)",
                overflow: "hidden",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.min(100, Math.round((creditsCommitted / EPOCH1_CAP) * 100))}%`,
                  background:
                    creditsCommitted >= EPOCH1_CAP
                      ? "#ff6b9d"
                      : creditsCommitted / EPOCH1_CAP > 0.8
                        ? "#f59e0b"
                        : ACCENT,
                  borderRadius: 3,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
            <div style={{ fontSize: 11, color: MUTED }}>
              {EPOCH1_CAP - creditsCommitted > 0
                ? `${EPOCH1_CAP - creditsCommitted} CITYx remaining this epoch`
                : "Epoch allocation fully committed"}
            </div>
          </div>

          {/* Active tasks quick view */}
          <SectionLabel
            text="Active Tasks"
            right={<LearnMoreLink onClick={() => onLearnMore("active-tasks")} />}
            accentColor={ACCENT_TEAL}
          />
          <button
            onClick={() => setShowActiveTasks(prev => !prev)}
            style={{
              width: "100%",
              marginBottom: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10,
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              color: "#fff",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700 }}>Active Tasks ({activeTaskInstances.length})</span>
            <span style={{ fontSize: 14, color: MUTED }}>{showActiveTasks ? "▾" : "▸"}</span>
          </button>
          {showActiveTasks &&
            (activeTaskInstances.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {activeTaskInstances.map(t => (
                  <div
                    key={t.id}
                    style={{
                      ...accentCard,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 13px",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{t.title}</div>
                      <div style={{ fontSize: 11, color: MUTED }}>{t.status}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT }}>{t.credits} CITYx</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ ...surfaceCard, marginBottom: 20, fontSize: 12, color: MUTED }}>
                No active tasks yet. Issue tasks from the Tasks tab to populate this list.
              </div>
            ))}
        </>
      )}
      {tutorialHighlightEditProfile && !editing && section === "profile" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 25,
            pointerEvents: "auto",
            background:
              "radial-gradient(circle at 86% 20%, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.54) 32%, rgba(0,0,0,0.72) 100%)",
            borderRadius: 12,
          }}
        />
      )}
    </div>
  );
}

function IssuerDashboardTab({
  creditsCommitted,
  activeTaskInstances,
  totalTasksIssued,
  totalCreditsIssued,
  scoreSnapshots,
}: {
  creditsCommitted: number;
  activeTaskInstances: Array<{
    id: string;
    title: string;
    credits: number;
    status: "Open" | "Claimed" | "Pending Verification";
  }>;
  totalTasksIssued: number;
  totalCreditsIssued: number;
  scoreSnapshots: ParticipantScoreSnapshot[];
}) {
  const openCount = activeTaskInstances.filter(task => task.status === "Open").length;
  const claimedCount = activeTaskInstances.filter(task => task.status === "Claimed").length;
  const pendingVerificationCount = activeTaskInstances.filter(task => task.status === "Pending Verification").length;
  const yellowOrWorse = scoreSnapshots.filter(snapshot => snapshot.tier !== "Green").length;
  const redTierCount = scoreSnapshots.filter(snapshot => snapshot.tier === "Red").length;
  const noShowEvents = scoreSnapshots.reduce((sum, snapshot) => sum + snapshot.noShows, 0);
  const rejectEvents = scoreSnapshots.reduce((sum, snapshot) => sum + snapshot.rejectedVerifications, 0);
  const topRiskParticipants = [...scoreSnapshots].sort((a, b) => b.db - a.db).slice(0, 5);

  const metricCardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: "12px 13px",
  };

  return (
    <div>
      <div style={{ ...surfaceCard, marginBottom: 14 }}>
        <SectionLabel text="Task Operations" accentColor={ACCENT_TEAL} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={metricCardStyle}>
            <div style={{ fontSize: 11, color: MUTED }}>Issued (Total)</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginTop: 2 }}>{totalTasksIssued}</div>
          </div>
          <div style={metricCardStyle}>
            <div style={{ fontSize: 11, color: MUTED }}>Credits Verified</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: ACCENT, marginTop: 2 }}>{totalCreditsIssued}</div>
          </div>
          <div style={metricCardStyle}>
            <div style={{ fontSize: 11, color: MUTED }}>Open Tasks</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginTop: 2 }}>{openCount}</div>
          </div>
          <div style={metricCardStyle}>
            <div style={{ fontSize: 11, color: MUTED }}>Claimed / Pending</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginTop: 2 }}>
              {claimedCount} / {pendingVerificationCount}
            </div>
          </div>
        </div>
      </div>

      <div style={{ ...surfaceCard, marginBottom: 14 }}>
        <SectionLabel text="Epoch Budget" accentColor={ACCENT} />
        <div style={{ fontSize: 30, fontWeight: 800, color: ACCENT, lineHeight: 1 }}>{creditsCommitted}</div>
        <div style={{ fontSize: 12, color: MUTED, marginTop: 6 }}>of {EPOCH1_CAP} CITYx committed in current epoch</div>
      </div>

      <div style={{ ...surfaceCard }}>
        <SectionLabel text="Participant Risk Signals (RD/RS)" accentColor={"#ff6b9d"} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          <div style={metricCardStyle}>
            <div style={{ fontSize: 11, color: MUTED }}>Participants Tracked</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 2 }}>{scoreSnapshots.length}</div>
          </div>
          <div style={metricCardStyle}>
            <div style={{ fontSize: 11, color: MUTED }}>At Risk (Yellow+)</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#ffad66", marginTop: 2 }}>{yellowOrWorse}</div>
          </div>
          <div style={metricCardStyle}>
            <div style={{ fontSize: 11, color: MUTED }}>Red Tier</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#ff6b9d", marginTop: 2 }}>{redTierCount}</div>
          </div>
          <div style={metricCardStyle}>
            <div style={{ fontSize: 11, color: MUTED }}>No-Show / Reject Events</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 2 }}>
              {noShowEvents} / {rejectEvents}
            </div>
          </div>
        </div>

        {topRiskParticipants.length === 0 ? (
          <div style={{ fontSize: 12, color: MUTED }}>No participant score events yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {topRiskParticipants.map(snapshot => (
              <div
                key={snapshot.participantAddress}
                style={{
                  ...metricCardStyle,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: "#fff", fontFamily: "monospace" }}>
                    {snapshot.participantAddress.slice(0, 8)}...{snapshot.participantAddress.slice(-6)}
                  </div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                    Tier {snapshot.tier} · {snapshot.totalEvents} scored events
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>RD {snapshot.db.toFixed(1)}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>RS {snapshot.rs.toFixed(1)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tasks Tab ────────────────────────────────────────────────────────────────

function TasksTab({
  creditsCommitted,
  onCreateOpen,
  onProposeOpen,
  proposedTasks,
  onApproveProposed,
  approvedCatalogTasks,
  onModifyCatalogTask,
  taskWriteStatus,
  onDismissTaskWrite,
  proposeWriteStatus,
  onDismissProposeWrite,
  onLearnMore,
  onUnissueConfirm: _onUnissueConfirm,
}: {
  creditsCommitted: number;
  onCreateOpen: () => void;
  onProposeOpen: () => void;
  proposedTasks: ProposedTask[];
  onApproveProposed: (task: ProposedTask) => void;
  approvedCatalogTasks: Task[];
  onModifyCatalogTask: (taskId: string) => void;
  taskWriteStatus: TaskWriteStatus;
  onDismissTaskWrite: () => void;
  proposeWriteStatus: TaskWriteStatus;
  onDismissProposeWrite: () => void;
  onLearnMore: (key: IssuerLearnCardKey) => void;
  onUnissueConfirm: (taskId: string) => void;
}) {
  const { address } = useAccount({ type: "ModularAccountV2" });
  const [view, setView] = useState<"issue" | "catalog">("catalog");
  const [onchainTasks, setOnchainTasks] = useState<
    Array<{
      id: string;
      title: string;
      category: string;
      estimatedTime: string;
      credits: number;
      voteTokens: number;
      slots: number;
      verifiedCount: number;
      claimedBy?: `0x${string}`;
      active: boolean;
    }>
  >([]);
  const [loadingOnchain, setLoadingOnchain] = useState(false);
  const explorerHref = taskWriteStatus.hash ? `https://sepolia.basescan.org/tx/${taskWriteStatus.hash}` : null;
  const creditsRemaining = EPOCH1_CAP - creditsCommitted;
  const atCap = creditsRemaining <= 0;
  const lastCatalogSyncedHashRef = React.useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!address) {
      setOnchainTasks([]);
      return;
    }

    // Hash-based dedup: only re-sync when a new tx is confirmed, not on state transitions
    const { hash, state } = taskWriteStatus;
    const isConfirmedNewTx = state === "confirmed" && hash !== lastCatalogSyncedHashRef.current;
    if (hash && !isConfirmedNewTx) return;
    if (isConfirmedNewTx) lastCatalogSyncedHashRef.current = hash;

    let cancelled = false;
    const parseMetadata = (raw: string): Partial<Task> => {
      try {
        return JSON.parse(raw) as Partial<Task>;
      } catch {
        return {};
      }
    };

    const sync = async () => {
      setLoadingOnchain(true);
      try {
        const nextId = (await baseSepoliaPublicClient.readContract({
          address: BASE_SEPOLIA_CONTRACTS.OpportunityManager.address,
          abi: BASE_SEPOLIA_CONTRACTS.OpportunityManager.abi,
          functionName: "nextOpportunityId",
          args: [],
        })) as bigint;

        const tasks: Array<{
          id: string;
          title: string;
          category: string;
          estimatedTime: string;
          credits: number;
          voteTokens: number;
          slots: number;
          verifiedCount: number;
          claimedBy?: `0x${string}`;
          active: boolean;
        }> = [];
        const ids = Array.from({ length: Number(nextId) }, (_, i) => BigInt(i));
        const addressLower = address.toLowerCase();

        const opportunityResults = await multicallInChunks(
          ids.map(id => ({
            address: BASE_SEPOLIA_CONTRACTS.OpportunityManager.address,
            abi: BASE_SEPOLIA_CONTRACTS.OpportunityManager.abi,
            functionName: "opportunities",
            args: [id],
          })),
        );

        const filtered: Array<{ id: bigint; opp: OpportunityRaw }> = [];
        opportunityResults.forEach((result, idx) => {
          if (result.status !== "success") return;
          const opp = result.result as OpportunityRaw;
          if (opp[0].toLowerCase() !== addressLower) return;
          if (!opp[9]) return;
          filtered.push({ id: ids[idx], opp });
        });

        const claimedByResults = await multicallInChunks(
          filtered.map(({ id }) => ({
            address: BASE_SEPOLIA_CONTRACTS.OpportunityManager.address,
            abi: BASE_SEPOLIA_CONTRACTS.OpportunityManager.abi,
            functionName: "claimedBy",
            args: [id],
          })),
        );

        filtered.forEach(({ id, opp }, idx) => {
          const claimedByResult = claimedByResults[idx];
          if (!claimedByResult || claimedByResult.status !== "success") return;
          const claimedBy = claimedByResult.result as `0x${string}`;

          const metadata = parseMetadata(opp[1]);
          const rewardCity = opp[2];
          const rewardVote = opp[3] === 0n ? opp[2] : opp[3];
          tasks.push({
            id: `task-${id.toString()}`,
            title: metadata.title || `Opportunity #${id.toString()}`,
            category: metadata.category || "Community",
            estimatedTime: metadata.estimatedTime || "TBD",
            credits: Math.floor(Number(formatUnits(rewardCity, 18))),
            voteTokens: Math.floor(Number(formatUnits(rewardVote, 18))),
            slots: Number(opp[6]),
            verifiedCount: Number(opp[10]),
            claimedBy,
            active: Boolean(opp[9]),
          });
        });

        tasks.sort((a, b) => Number(b.id.match(/(\d+)$/)?.[1] ?? "0") - Number(a.id.match(/(\d+)$/)?.[1] ?? "0"));
        if (!cancelled) {
          setOnchainTasks(tasks);
        }
      } catch {
        // Keep last good snapshot on transient RPC/read failures to avoid UI flicker.
      } finally {
        if (!cancelled) setLoadingOnchain(false);
      }
    };

    void sync();
    return () => {
      cancelled = true;
    };
  }, [address, taskWriteStatus.hash, taskWriteStatus.state, proposeWriteStatus.hash, proposeWriteStatus.state]);

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <div
        style={{
          ...surfaceCard,
          marginBottom: 14,
          background: "linear-gradient(135deg, #1a1a00 0%, #1E1E2C 100%)",
          border: "1px solid rgba(221,158,51,0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Jan 1, 2026 – Mar 31, 2026</div>
            <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{EPOCH1_CAP} CITYx / month</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: ACCENT }}>{creditsCommitted}</div>
            <div style={{ fontSize: 11, color: MUTED }}>of {EPOCH1_CAP} CITYx used</div>
          </div>
        </div>
        <div
          style={{
            height: 6,
            borderRadius: 3,
            background: "rgba(255,255,255,0.08)",
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(100, Math.round((creditsCommitted / EPOCH1_CAP) * 100))}%`,
              background:
                creditsCommitted >= EPOCH1_CAP ? "#ff6b9d" : creditsCommitted / EPOCH1_CAP > 0.8 ? "#f59e0b" : ACCENT,
              borderRadius: 3,
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <div style={{ fontSize: 11, color: MUTED }}>
          {EPOCH1_CAP - creditsCommitted > 0
            ? `${EPOCH1_CAP - creditsCommitted} CITYx remaining this epoch`
            : "Epoch allocation fully committed"}
        </div>
      </div>

      {/* Segment control — Issue / Catalog */}
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          borderRadius: 14,
          display: "flex",
          marginBottom: 20,
          overflow: "hidden",
        }}
      >
        {(["catalog", "issue"] as const).map((v, i) => {
          const labels: Record<string, string> = {
            issue: `Issue Task (${onchainTasks.length})`,
            catalog: `Task Catalog (${approvedCatalogTasks.length})`,
          };
          const segAccent = v === "issue" ? ACCENT : ACCENT_PURPLE;
          return (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                flex: 1,
                border: "none",
                borderRadius: i === 0 ? "14px 0 0 14px" : "0 14px 14px 0",
                padding: "8px 0",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.18s",
                background: view === v ? segAccent : "transparent",
                color: view === v ? BG : MUTED,
                letterSpacing: view === v ? "0.01em" : 0,
              }}
            >
              {labels[v]}
            </button>
          );
        })}
      </div>
      {loadingOnchain && <div style={{ fontSize: 11, color: MUTED, marginBottom: 10 }}>Syncing onchain tasks...</div>}

      {view === "issue" && (
        <>
          {taskWriteStatus.state !== "idle" && (
            <div
              style={{
                ...surfaceCard,
                position: "relative",
                marginBottom: 16,
                border:
                  taskWriteStatus.state === "confirmed"
                    ? "1px solid rgba(221,158,51,0.35)"
                    : taskWriteStatus.state === "failed"
                      ? "1px solid rgba(255,107,157,0.35)"
                      : "1px solid rgba(65,105,225,0.35)",
                background:
                  taskWriteStatus.state === "confirmed"
                    ? "rgba(221,158,51,0.08)"
                    : taskWriteStatus.state === "failed"
                      ? "rgba(255,107,157,0.08)"
                      : "rgba(65,105,225,0.08)",
              }}
            >
              <div style={{ fontSize: 11, color: MUTED, marginBottom: 6 }}>Last Task Write</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
                {taskWriteStatus.state === "pending" && "Pending wallet/user-op confirmation..."}
                {taskWriteStatus.state === "confirmed" && "Confirmed onchain"}
                {taskWriteStatus.state === "failed" && "Failed onchain"}
              </div>
              {taskWriteStatus.error && (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>
                  {taskWriteStatus.error}
                </div>
              )}
              {explorerHref && (
                <a
                  href={explorerHref}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "inline-block", marginTop: 6, fontSize: 12, color: ACCENT, textDecoration: "none" }}
                >
                  View on Base Sepolia Explorer ↗
                </a>
              )}
              <button
                onClick={onDismissTaskWrite}
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

          {/* Budget bar */}
          {atCap && (
            <div
              style={{
                background: "rgba(255,107,157,0.08)",
                border: "1px solid rgba(255,107,157,0.3)",
                borderRadius: 12,
                padding: "10px 14px",
                marginBottom: 12,
                fontSize: 12,
                color: "#ff6b9d",
                fontWeight: 600,
              }}
            >
              ⚠️ Epoch allocation cap reached ({EPOCH1_CAP} CITYx). New tasks cannot be posted until next epoch.
            </div>
          )}

          {/* Create CTA */}
          <button
            onClick={atCap ? undefined : onCreateOpen}
            disabled={atCap}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: atCap ? "rgba(255,255,255,0.04)" : "rgba(221,158,51,0.1)",
              border: atCap ? "1px dashed rgba(255,255,255,0.12)" : "1px dashed rgba(221,158,51,0.4)",
              borderRadius: 14,
              padding: "14px 0",
              fontSize: 13,
              fontWeight: 600,
              color: atCap ? DIMMED : ACCENT,
              cursor: atCap ? "not-allowed" : "pointer",
              marginBottom: 10,
            }}
          >
            <IconPlus /> Issue Task from Catalog
          </button>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <LearnMoreLink onClick={() => onLearnMore("issue-tasks")} />
          </div>

          {(() => {
            const openPoolTasks = onchainTasks.filter(
              t => !t.claimedBy || t.claimedBy === "0x0000000000000000000000000000000000000000",
            );

            return openPoolTasks.length === 0 ? (
              <EmptyState
                emoji="📭"
                title="No open tasks in pool"
                desc={
                  approvedCatalogTasks.length > 0
                    ? "Use Issue Task from Catalog to issue your approved tasks."
                    : "Approve a proposed task first, then issue it from the catalog."
                }
              />
            ) : (
              <>
                <SectionLabel text={`Active Tasks (${openPoolTasks.length})`} accentColor={ACCENT_TEAL} />
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {openPoolTasks.map(t => (
                    <div key={t.id} style={{ ...accentCard }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          marginBottom: 10,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{t.title}</div>
                          <div style={{ fontSize: 11, color: MUTED }}>
                            {t.category} · {t.estimatedTime}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: ACCENT }}>{t.credits} CITYx</div>
                          <div style={{ fontSize: 11, color: DIMMED }}>+{t.voteTokens} VOTE</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 12, fontSize: 12, color: MUTED, marginBottom: 10 }}>
                        <span>Open Pool</span>
                        <span>Onchain Opportunity</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </>
      )}

      {view === "catalog" && (
        <>
          <button
            onClick={atCap ? undefined : onProposeOpen}
            disabled={atCap}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: atCap ? "rgba(255,255,255,0.04)" : "rgba(221,158,51,0.06)",
              border: atCap ? "1px dashed rgba(255,255,255,0.12)" : "1px solid rgba(221,158,51,0.25)",
              borderRadius: 14,
              padding: "14px 0",
              fontSize: 13,
              fontWeight: 600,
              color: atCap ? DIMMED : "rgba(221,158,51,0.8)",
              cursor: atCap ? "not-allowed" : "pointer",
              marginBottom: 16,
            }}
          >
            <IconPlus /> Propose New Task for Approval
          </button>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <LearnMoreLink onClick={() => onLearnMore("task-catalog")} />
          </div>

          {proposeWriteStatus.state !== "idle" && (
            <div
              style={{
                ...surfaceCard,
                position: "relative",
                marginBottom: 16,
                border:
                  proposeWriteStatus.state === "confirmed"
                    ? "1px solid rgba(221,158,51,0.35)"
                    : proposeWriteStatus.state === "failed"
                      ? "1px solid rgba(255,107,157,0.35)"
                      : "1px solid rgba(65,105,225,0.35)",
                background:
                  proposeWriteStatus.state === "confirmed"
                    ? "rgba(221,158,51,0.08)"
                    : proposeWriteStatus.state === "failed"
                      ? "rgba(255,107,157,0.08)"
                      : "rgba(65,105,225,0.08)",
              }}
            >
              <div style={{ fontSize: 11, color: MUTED, marginBottom: 6 }}>Last Proposal Write</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
                {proposeWriteStatus.state === "pending" && "Pending wallet/user-op confirmation..."}
                {proposeWriteStatus.state === "confirmed" && "Confirmed onchain"}
                {proposeWriteStatus.state === "failed" && "Failed onchain"}
              </div>
              {proposeWriteStatus.error && (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>
                  {proposeWriteStatus.error}
                </div>
              )}
              {proposeWriteStatus.hash && (
                <a
                  href={`https://sepolia.basescan.org/tx/${proposeWriteStatus.hash}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "inline-block", marginTop: 6, fontSize: 12, color: ACCENT, textDecoration: "none" }}
                >
                  View on Base Sepolia Explorer ↗
                </a>
              )}
              <button
                onClick={onDismissProposeWrite}
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

          {/* Proposed tasks awaiting approval */}
          {proposedTasks.length > 0 && (
            <>
              <SectionLabel text={`Proposed Tasks (${proposedTasks.length})`} accentColor={ACCENT_PURPLE} />
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                {proposedTasks.map(pt => (
                  <div
                    key={pt.id}
                    style={{
                      background: "rgba(167,139,250,0.06)",
                      border: "1px solid rgba(167,139,250,0.22)",
                      borderLeft: `3px solid rgba(167,139,250,0.45)`,
                      borderRadius: 16,
                      padding: 16,
                      paddingLeft: 13,
                      boxShadow: "0 2px 12px rgba(0,0,0,0.28)",
                    }}
                  >
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{pt.title}</div>
                      <div style={{ fontSize: 11, color: MUTED, marginBottom: 2 }}>
                        {pt.estimatedTime} · {pt.location}
                      </div>
                      {pt.date && <div style={{ fontSize: 11, color: MUTED }}>📅 {pt.date}</div>}
                    </div>

                    {pt.successCriteria && (
                      <div
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          borderRadius: 10,
                          padding: "8px 12px",
                          marginBottom: 10,
                          fontSize: 12,
                          color: MUTED,
                          lineHeight: 1.5,
                        }}
                      >
                        <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Success criteria: </span>
                        {pt.successCriteria}
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 10,
                        fontSize: 12,
                        color: MUTED,
                      }}
                    >
                      <span>Proposed reward</span>
                      <span style={{ color: ACCENT_PURPLE, fontWeight: 700 }}>{pt.credits} CITYx</span>
                    </div>

                    <button
                      onClick={() => onApproveProposed(pt)}
                      style={{
                        width: "100%",
                        background: ACCENT_PURPLE,
                        border: "none",
                        borderRadius: 12,
                        padding: "11px 0",
                        fontSize: 13,
                        fontWeight: 700,
                        color: BG,
                        cursor: "pointer",
                        marginBottom: 8,
                      }}
                    >
                      Approve Task in Catalog
                    </button>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#fff",
                        textAlign: "center",
                        lineHeight: 1.5,
                        fontStyle: "italic",
                      }}
                    >
                      As a demo, you are auto-approving your own task proposal. In production, this would be approved by
                      the Issuer Representative Committee.
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {proposedTasks.length === 0 ? (
            <EmptyState emoji="📝" title="Propose a Task to add to your Task Catalog." desc="" />
          ) : null}

          <SectionLabel text={`Task Catalog (${approvedCatalogTasks.length})`} accentColor={ACCENT_PURPLE} />
          {approvedCatalogTasks.length === 0 ? (
            <EmptyState emoji="📚" title="No tasks in catalog" desc="Approve a proposed task to add it to catalog." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {approvedCatalogTasks.map(task => (
                <div key={task.id} style={{ ...purpleCard }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 3 }}>{task.title}</div>
                      <div style={{ fontSize: 11, color: MUTED }}>
                        {task.category} · {task.estimatedTime}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", marginLeft: 12 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: ACCENT_PURPLE }}>{task.credits} CITYx</div>
                      <div style={{ fontSize: 11, color: DIMMED }}>+{task.voteTokens} VOTE</div>
                    </div>
                  </div>

                  <div
                    style={{ display: "flex", gap: 12, fontSize: 12, color: MUTED, marginBottom: 12, flexWrap: "wrap" }}
                  >
                    <span>📍 {task.location || "TBD"}</span>
                    <span>📅 {task.taskDate || "TBD"}</span>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => onModifyCatalogTask(task.id)}
                      style={{
                        width: "100%",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 10,
                        padding: "9px 0",
                        fontSize: 12,
                        fontWeight: 600,
                        color: MUTED,
                        cursor: "pointer",
                      }}
                    >
                      Modify Task Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Create Task Sheet ────────────────────────────────────────────────────────

function CreateTaskSheet({
  onClose,
  approvedCatalogTasks = [],
  onIssueTask,
}: {
  onClose: () => void;
  approvedCatalogTasks?: Task[];
  onIssueTask: (taskId: string) => void;
}) {
  return (
    <>
      <style>{`
        @keyframes walletSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "fixed",
          top: 112,
          left: 0,
          right: 0,
          bottom: 69,
          zIndex: 221,
          background: "#1E1E2C",
          borderRadius: "12px 12px 0 0",
          animation: "walletSlideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1) both",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Sticky header */}
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
          <span style={{ fontWeight: 700, fontSize: 16, color: "white" }}>Task Catalog</span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.4)",
              cursor: "pointer",
              padding: 4,
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 24px" }}>
          <div style={{ fontSize: 13, color: MUTED, marginBottom: 16 }}>
            Approved tasks available for issuance. Select a task, then choose quantity in the next step.
          </div>

          {approvedCatalogTasks.length === 0 ? (
            <EmptyState
              emoji="📚"
              title="Catalog is empty"
              desc="Approve a task in Pending to add it to your catalog."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {approvedCatalogTasks.map(task => (
                <div
                  key={task.id}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 14,
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 3 }}>{task.title}</div>
                      <div style={{ fontSize: 11, color: MUTED }}>
                        {task.category} · {task.estimatedTime}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", marginLeft: 12 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: ACCENT }}>{task.credits} CITYx</div>
                      <div style={{ fontSize: 11, color: DIMMED }}>+{task.voteTokens} VOTE</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => onIssueTask(task.id)}
                      style={{
                        width: "100%",
                        background: ACCENT,
                        border: "none",
                        borderRadius: 10,
                        padding: "9px 0",
                        fontSize: 12,
                        fontWeight: 700,
                        color: BG,
                        cursor: "pointer",
                      }}
                    >
                      Issue Task
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Propose Task Sheet ───────────────────────────────────────────────────────

function ProposeTaskSheet({
  onClose,
  onPropose,
  creditsCommitted,
}: {
  onClose: () => void;
  onPropose: (task: ProposedTask) => void;
  creditsCommitted: number;
}) {
  const [title, setTitle] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [successCriteria, setSuccessCriteria] = useState("");
  const [creditRate, setCreditRate] = useState("");
  const [credentials, setCredentials] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const TASK_TAGS = [
    "Environment",
    "Education",
    "Community",
    "Health",
    "Infrastructure",
    "Arts",
    "Youth",
    "Seniors",
    "Safety",
    "Food",
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  };

  const computedCredits = (() => {
    const rate = parseFloat(creditRate);
    if (isNaN(rate) || rate <= 0) return 0;
    // Try explicit "h" notation first (e.g. "2h", "1.5 hours")
    const hoursMatch = estimatedTime.match(/(\d+(?:\.\d+)?)\s*h/i);
    if (hoursMatch) {
      return Math.round(rate * parseFloat(hoursMatch[1]));
    }
    // Fallback: try parsing the first number in the string as hours
    const numMatch = estimatedTime.match(/(\d+(?:\.\d+)?)/);
    const hours = numMatch ? parseFloat(numMatch[1]) : 1;
    return Math.round(rate * hours);
  })();

  const canSubmit = title.trim() && estimatedTime.trim() && computedCredits > 0;
  const wouldExceedCap = creditsCommitted + computedCredits > EPOCH1_CAP;

  const handleSubmit = () => {
    if (!canSubmit || wouldExceedCap) return;
    onPropose({
      id: `proposed-${Date.now()}`,
      title: title.trim(),
      estimatedTime: estimatedTime.trim(),
      location: location.trim() || "TBD",
      date: date.trim(),
      successCriteria: successCriteria.trim(),
      creditRate: parseFloat(creditRate),
      credentials: credentials.trim(),
      credits: computedCredits,
      tags: selectedTags,
    });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    color: "#fff",
    fontSize: 13,
    padding: "10px 12px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: MUTED,
    textTransform: "uppercase" as const,
    letterSpacing: "0.07em",
    marginBottom: 6,
    display: "block",
  };

  return (
    <>
      <style>{`
        @keyframes walletSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "fixed",
          top: 112,
          left: 0,
          right: 0,
          bottom: 69,
          zIndex: 221,
          background: "#1E1E2C",
          borderRadius: "12px 12px 0 0",
          animation: "walletSlideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1) both",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Sticky header */}
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
          <span style={{ fontWeight: 700, fontSize: 16, color: "white" }}>Propose New Task</span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.4)",
              cursor: "pointer",
              padding: 4,
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 24px" }}>
          <div style={{ fontSize: 13, color: MUTED, marginBottom: 20, lineHeight: 1.5 }}>
            Submit a task for admin review. Once approved, it will enter the catalog for participants to claim.
          </div>

          {/* Budget indicator */}
          <div
            style={{
              background: "rgba(221,158,51,0.07)",
              border: "1px solid rgba(221,158,51,0.2)",
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 12,
            }}
          >
            <span style={{ color: MUTED }}>Epoch budget remaining</span>
            <span style={{ color: ACCENT, fontWeight: 700 }}>{Math.max(0, EPOCH1_CAP - creditsCommitted)} CITYx</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Title of Task *</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Community Garden Cleanup"
                style={inputStyle}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={labelStyle}>Estimated Time *</label>
                <input
                  value={estimatedTime}
                  onChange={e => setEstimatedTime(e.target.value)}
                  placeholder="e.g. 2 hours"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Credit Rate / hr *</label>
                <input
                  type="number"
                  value={creditRate}
                  onChange={e => setCreditRate(e.target.value)}
                  placeholder="e.g. 20"
                  style={inputStyle}
                />
              </div>
            </div>

            {computedCredits > 0 && (
              <div
                style={{
                  background: wouldExceedCap ? "rgba(255,107,157,0.08)" : "rgba(221,158,51,0.08)",
                  border: `1px solid ${wouldExceedCap ? "rgba(255,107,157,0.3)" : "rgba(221,158,51,0.2)"}`,
                  borderRadius: 10,
                  padding: "8px 14px",
                  fontSize: 12,
                  color: wouldExceedCap ? "#ff6b9d" : ACCENT,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>{wouldExceedCap ? "⚠️ Exceeds epoch budget" : "Estimated total credits"}</span>
                <span style={{ fontWeight: 700 }}>{computedCredits} CITYx</span>
              </div>
            )}

            <div>
              <label style={labelStyle}>Location</label>
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Riverside Park, District 4"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Date / Time of Activity</label>
              <input
                value={date}
                onChange={e => setDate(e.target.value)}
                placeholder="e.g. Saturday, March 21, 2026 · 10am"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Success Criteria</label>
              <textarea
                value={successCriteria}
                onChange={e => setSuccessCriteria(e.target.value)}
                placeholder="How will completion be verified? What should participants submit as evidence?"
                rows={3}
                style={{ ...inputStyle, resize: "none", lineHeight: 1.5 }}
              />
            </div>

            <div>
              <label style={labelStyle}>Required Credentials or Skills</label>
              <input
                value={credentials}
                onChange={e => setCredentials(e.target.value)}
                placeholder="e.g. No prior experience needed"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Tags</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {TASK_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 20,
                      border: selectedTags.includes(tag) ? `1px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.12)",
                      background: selectedTags.includes(tag) ? `${ACCENT}22` : "rgba(255,255,255,0.04)",
                      color: selectedTags.includes(tag) ? ACCENT : MUTED,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || wouldExceedCap}
            style={{
              width: "100%",
              background: canSubmit && !wouldExceedCap ? ACCENT : "rgba(255,255,255,0.08)",
              border: "none",
              borderRadius: 14,
              padding: "14px 0",
              fontSize: 14,
              fontWeight: 700,
              color: canSubmit && !wouldExceedCap ? BG : MUTED,
              cursor: canSubmit && !wouldExceedCap ? "pointer" : "not-allowed",
              marginTop: 20,
            }}
          >
            Submit for Review
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Community Tab (MyCity + MCEs combined) ───────────────────────────────────

function CommunityTab({
  posts,
  orgName,
  state,
  onCompose,
  onLearnMore,
}: {
  posts: Post[];
  orgName: string;
  state: ReturnType<typeof useDemo>["state"];
  onCompose: () => void;
  onLearnMore: (key: IssuerLearnCardKey) => void;
}) {
  const [section, setSection] = useState<"feed" | "mces">("feed");

  return (
    <div>
      {/* Sub-segment control */}
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          borderRadius: 14,
          display: "flex",
          margin: "0 20px 20px",
          overflow: "hidden",
        }}
      >
        {(["feed", "mces"] as const).map((s, i) => {
          const segAccent = s === "feed" ? ACCENT : ACCENT_PURPLE;
          return (
            <button
              key={s}
              onClick={() => setSection(s)}
              style={{
                flex: 1,
                border: "none",
                borderRadius: i === 0 ? "14px 0 0 14px" : "0 14px 14px 0",
                padding: "8px 0",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.18s",
                background: section === s ? segAccent : "transparent",
                color: section === s ? BG : MUTED,
              }}
            >
              {s === "feed" ? "MyCity Feed" : "MCE Proposals"}
            </button>
          );
        })}
      </div>

      {section === "feed" && (
        <MyCityTab posts={posts} orgName={orgName} onCompose={onCompose} onLearnMore={onLearnMore} />
      )}
      {section === "mces" && <MCEsTab state={state} orgName={orgName} onLearnMore={onLearnMore} />}
    </div>
  );
}

// ─── MyCity Tab ───────────────────────────────────────────────────────────────

function MyCityTab({
  posts,
  orgName,
  onCompose,
  onLearnMore,
}: {
  posts: Post[];
  orgName: string;
  onCompose: () => void;
  onLearnMore: (key: IssuerLearnCardKey) => void;
}) {
  const [sort, setSort] = useState<"recent" | "top">("recent");

  const sorted = [...posts].sort((a, b) => {
    if (sort === "top") return b.likes - a.likes;
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return "just now";
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      {/* Header — New Post left, Learn More right */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button
          onClick={onCompose}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: ACCENT,
            border: "none",
            borderRadius: 10,
            padding: "8px 14px",
            fontSize: 12,
            fontWeight: 700,
            color: BG,
            cursor: "pointer",
          }}
        >
          <IconPlus /> New Post
        </button>
        <LearnMoreLink onClick={() => onLearnMore("mycity-feed")} />
      </div>

      {/* Sort tabs */}
      <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", marginBottom: 20 }}>
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

      {/* Posts */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sorted.map(post => {
          const catColor = CATEGORY_COLOR[post.category];
          const isOwn = post.authorName === orgName;

          return (
            <div
              key={post.id}
              style={{
                background: "linear-gradient(135deg, rgba(221,158,51,0.06) 0%, #1E1E2C 100%)",
                border: isOwn ? "1px solid rgba(221,158,51,0.3)" : `1px solid ${catColor}22`,
                borderLeft: `3px solid ${catColor}80`,
                borderRadius: 16,
                padding: "16px 16px 16px 13px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.28)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{post.authorName}</div>
                    {isOwn && (
                      <span
                        style={{
                          fontSize: 10,
                          background: "rgba(221,158,51,0.15)",
                          color: ACCENT,
                          borderRadius: 6,
                          padding: "1px 6px",
                          fontWeight: 600,
                        }}
                      >
                        You
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: DIMMED }}>{timeAgo(post.postedAt)}</div>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    background: `${catColor}18`,
                    color: catColor,
                    borderRadius: 6,
                    padding: "3px 8px",
                    flexShrink: 0,
                    marginLeft: 8,
                  }}
                >
                  {post.category}
                </span>
              </div>

              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.55, margin: "0 0 12px" }}>
                {post.content}
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: DIMMED }}>
                <IconHeart />
                <span>{post.likes}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Compose Post Sheet ───────────────────────────────────────────────────────

function ComposePostSheet({
  orgName,
  onClose,
  onPost,
}: {
  orgName: string;
  onClose: () => void;
  onPost: (post: Post) => void;
}) {
  const [category, setCategory] = useState<PostCategory>("Announcement");
  const [content, setContent] = useState("");

  const submit = () => {
    if (!content.trim()) return;
    const post: Post = {
      id: `post-local-${Date.now()}`,
      authorName: orgName,
      authorId: FAKE_WALLETS.issuer,
      authorType: "issuer",
      content: content.trim(),
      postedAt: new Date().toISOString(),
      likes: 0,
      category,
    };
    onPost(post);
  };

  return (
    <>
      <style>{`
        @keyframes walletSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
      <div style={{ position: "fixed", inset: 0, zIndex: 220, pointerEvents: "none" }}>
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
          onClick={onClose}
        />
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 69,
            maxHeight: "60%",
            zIndex: 1,
            background: "#1E1E2C",
            borderRadius: "24px 24px 0 0",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.55)",
            padding: "20px 20px 24px",
            animation: "walletSlideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1) both",
            overflowY: "auto",
            pointerEvents: "auto",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: "white" }}>New Post</span>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.4)",
                cursor: "pointer",
                padding: 4,
                fontSize: 20,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {/* Category picker */}
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: MUTED,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 8,
              }}
            >
              Category
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {POST_CATEGORIES.map(cat => {
                const c = CATEGORY_COLOR[cat];
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    style={{
                      border: active ? `1px solid ${c}` : "1px solid transparent",
                      borderRadius: 8,
                      padding: "5px 12px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      background: active ? `${c}22` : "rgba(255,255,255,0.06)",
                      color: active ? c : MUTED,
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Share an update, event, or opportunity with the city..."
            rows={5}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              color: "#fff",
              fontSize: 13,
              padding: "12px 14px",
              lineHeight: 1.55,
              resize: "none",
              outline: "none",
              boxSizing: "border-box",
              marginBottom: 16,
            }}
          />

          <button
            onClick={submit}
            disabled={!content.trim()}
            style={{
              width: "100%",
              background: content.trim() ? ACCENT : "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: 14,
              padding: "14px 0",
              fontSize: 14,
              fontWeight: 700,
              color: content.trim() ? BG : MUTED,
              cursor: content.trim() ? "pointer" : "not-allowed",
            }}
          >
            Publish Post
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Unissue Confirm Sheet ────────────────────────────────────────────────────

function UnissueConfirmSheet({
  taskId: _taskId,
  onConfirm,
  onCancel,
}: {
  taskId: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <style>{`@keyframes walletSlideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
      <div style={{ position: "fixed", inset: 0, zIndex: 220, pointerEvents: "none" }}>
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
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 69,
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
            <div style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 8 }}>Unissue Task?</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.4 }}>
              This will deactivate the task onchain. It will be removed from the open task pool.
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
              Unissue Task
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── No Show Confirm Sheet ────────────────────────────────────────────────────

function NoShowConfirmSheet({
  item: _item,
  onConfirm,
  onCancel,
}: {
  item: { taskId: string; claimant: `0x${string}`; title: string };
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <style>{`@keyframes walletSlideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
      <div style={{ position: "fixed", inset: 0, zIndex: 220, pointerEvents: "none" }}>
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
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 69,
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
            <div style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 8 }}>Mark as No-Show?</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.4 }}>
              The participant did not complete this task. It will be removed from active tasks.
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
              Mark No-Show
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Verify Tab ───────────────────────────────────────────────────────────────

type OnchainVerifyItem = {
  taskId: string;
  opportunityId: bigint;
  title: string;
  estimatedTime: string;
  taskDate?: string;
  credits: number;
  voteTokens: number;
  claimant?: `0x${string}`;
  submittedAt?: bigint;
};

function VerifyTab({
  onVerify,
  onSetTaskActive: _onSetTaskActive,
  onUnissueTask: _onUnissueTask,
  verifyWriteStatus,
  onDismissVerifyWrite,
  unissueWriteStatus,
  onDismissUnissueWrite,
  hiddenTaskIds,
  onLearnMore,
  onUnissueConfirm,
  onNoShowConfirm,
}: {
  onVerify: (
    taskId: string,
    citizen: string,
    options?: { decision?: VerifyDecision; feedback?: string },
  ) => Promise<void>;
  onSetTaskActive: (taskId: string, active: boolean) => Promise<{ ok: boolean; hash?: `0x${string}`; error?: string }>;
  onUnissueTask: (taskId: string) => Promise<{ ok: boolean; hash?: `0x${string}`; error?: string }>;
  verifyWriteStatus: TaskWriteStatus;
  onDismissVerifyWrite: () => void;
  unissueWriteStatus: TaskWriteStatus;
  onDismissUnissueWrite: () => void;
  hiddenTaskIds: string[];
  onLearnMore: (key: IssuerLearnCardKey) => void;
  onUnissueConfirm: (taskId: string) => void;
  onNoShowConfirm: (item: { taskId: string; claimant: `0x${string}`; title: string }) => void;
}) {
  const { address } = useAccount({ type: "ModularAccountV2" });
  const [view, setView] = useState<"issued" | "claimed" | "completed">("issued");
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [issuedItems, setIssuedItems] = useState<OnchainVerifyItem[]>([]);
  const [claimedItems, setClaimedItems] = useState<OnchainVerifyItem[]>([]);
  const [completedItems, setCompletedItems] = useState<OnchainVerifyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedClaimed, setExpandedClaimed] = useState<Record<string, boolean>>({});
  const [confirmVerify, setConfirmVerify] = useState<{
    taskId: string;
    claimant: `0x${string}`;
    title: string;
    decision: VerifyDecision;
  } | null>(null);
  const lastVerifySyncedHashRef = React.useRef<string | undefined>(undefined);
  const lastUnissueSyncedHashRef = React.useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!address) {
      setIssuedItems([]);
      setClaimedItems([]);
      setCompletedItems([]);
      return;
    }

    // Hash-based dedup: only re-sync when a new tx confirms (verify or unissue), not on state transitions
    const verifyHash = verifyWriteStatus.hash;
    const unissueHash = unissueWriteStatus.hash;
    const isNewVerify = verifyWriteStatus.state === "confirmed" && verifyHash !== lastVerifySyncedHashRef.current;
    const isNewUnissue = unissueWriteStatus.state === "confirmed" && unissueHash !== lastUnissueSyncedHashRef.current;
    const eitherHashActive = !!(verifyHash || unissueHash);
    if (eitherHashActive && !isNewVerify && !isNewUnissue) return;
    if (isNewVerify) lastVerifySyncedHashRef.current = verifyHash;
    if (isNewUnissue) lastUnissueSyncedHashRef.current = unissueHash;

    let cancelled = false;

    const parseMetadata = (raw: string): Partial<Task> => {
      try {
        return JSON.parse(raw) as Partial<Task>;
      } catch {
        return {};
      }
    };

    const syncIssuerTasks = async () => {
      setLoading(true);
      try {
        const nextId = (await baseSepoliaPublicClient.readContract({
          address: BASE_SEPOLIA_CONTRACTS.OpportunityManager.address,
          abi: BASE_SEPOLIA_CONTRACTS.OpportunityManager.abi,
          functionName: "nextOpportunityId",
          args: [],
        })) as bigint;

        const issued: OnchainVerifyItem[] = [];
        const claimed: OnchainVerifyItem[] = [];
        const completed: OnchainVerifyItem[] = [];
        const ids = Array.from({ length: Number(nextId) }, (_, i) => BigInt(i));
        const addressLower = address.toLowerCase();

        const opportunityResults = await multicallInChunks(
          ids.map(id => ({
            address: BASE_SEPOLIA_CONTRACTS.OpportunityManager.address,
            abi: BASE_SEPOLIA_CONTRACTS.OpportunityManager.abi,
            functionName: "opportunities",
            args: [id],
          })),
        );

        const issuerItems: Array<{ id: bigint; opp: OpportunityRaw; itemBase: OnchainVerifyItem }> = [];
        opportunityResults.forEach((result, idx) => {
          if (result.status !== "success") return;
          const opp = result.result as OpportunityRaw;
          if (opp[0].toLowerCase() !== addressLower) return;

          const id = ids[idx];
          const metadata = parseMetadata(opp[1]);
          const rewardCity = opp[2];
          const rewardVote = opp[3];
          issuerItems.push({
            id,
            opp,
            itemBase: {
              taskId: `task-${id.toString()}`,
              opportunityId: id,
              title: metadata.title || `Opportunity #${id.toString()}`,
              estimatedTime: metadata.estimatedTime || "TBD",
              taskDate: metadata.taskDate || "TBD",
              credits: Math.floor(Number(formatUnits(rewardCity, 18))),
              voteTokens: Math.floor(Number(formatUnits(rewardVote === 0n ? rewardCity : rewardVote, 18))),
            },
          });
        });

        const claimantResults = await multicallInChunks(
          issuerItems.map(({ id }) => ({
            address: BASE_SEPOLIA_CONTRACTS.OpportunityManager.address,
            abi: BASE_SEPOLIA_CONTRACTS.OpportunityManager.abi,
            functionName: "claimedBy",
            args: [id],
          })),
        );

        const completionTargets: Array<{ itemBase: OnchainVerifyItem; id: bigint; claimant: `0x${string}` }> = [];
        issuerItems.forEach(({ id, itemBase }, idx) => {
          const claimantResult = claimantResults[idx];
          if (!claimantResult || claimantResult.status !== "success") return;
          const claimant = claimantResult.result as `0x${string}`;
          if (claimant === "0x0000000000000000000000000000000000000000") {
            issued.push(itemBase);
            return;
          }
          completionTargets.push({ itemBase, id, claimant });
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
            const completionRaw = result.result as readonly [
              proofHash: `0x${string}`,
              submittedAt: bigint,
              verifiedAt: bigint,
              status: number,
            ];
            if (completionRaw[2] > 0n || completionRaw[3] === 2) return;
            if (completionRaw[1] > 0n || completionRaw[3] === 1) {
              completed.push({ ...target.itemBase, claimant: target.claimant, submittedAt: completionRaw[1] });
              return;
            }
            claimed.push({ ...target.itemBase, claimant: target.claimant });
          });
        }

        const sortByIdDesc = (a: OnchainVerifyItem, b: OnchainVerifyItem) =>
          Number(b.opportunityId) - Number(a.opportunityId);
        if (!cancelled) {
          setIssuedItems(issued.sort(sortByIdDesc));
          setClaimedItems(claimed.sort(sortByIdDesc));
          setCompletedItems(completed.sort(sortByIdDesc));
        }
      } catch {
        // Keep last successful snapshot to avoid empty flicker on transient RPC failures.
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void syncIssuerTasks();
    return () => {
      cancelled = true;
    };
  }, [
    address,
    verifyWriteStatus.hash,
    verifyWriteStatus.state,
    unissueWriteStatus.hash,
    unissueWriteStatus.state,
    hiddenTaskIds,
  ]);

  const hiddenTaskIdSet = new Set(hiddenTaskIds);
  const claimedOrCompletedIdSet = new Set([
    ...claimedItems.map(item => item.taskId),
    ...completedItems.map(item => item.taskId),
  ]);
  const visibleIssuedItems = issuedItems.filter(
    item => !hiddenTaskIdSet.has(item.taskId) && !claimedOrCompletedIdSet.has(item.taskId),
  );
  const visibleClaimedItems = claimedItems.filter(item => !hiddenTaskIdSet.has(item.taskId));
  const visibleCompletedItems = completedItems.filter(item => !hiddenTaskIdSet.has(item.taskId));

  const TOGGLE_OPTIONS = [
    { key: "issued", label: `Issued (${visibleIssuedItems.length})` },
    { key: "claimed", label: `Claimed (${visibleClaimedItems.length})` },
    { key: "completed", label: `Completed (${visibleCompletedItems.length})` },
  ] as const;

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      {/* Three-way toggle */}
      <div
        style={{
          display: "flex",
          background: "rgba(255,255,255,0.05)",
          borderRadius: 10,
          padding: 4,
          marginBottom: 8,
        }}
      >
        {TOGGLE_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => setView(opt.key)}
            style={{
              flex: 1,
              padding: "9px 0",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
              background: view === opt.key ? ACCENT : "transparent",
              color: view === opt.key ? BG : MUTED,
              transition: "all 0.15s",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <LearnMoreLink onClick={() => onLearnMore("verify-flow")} />
      </div>

      {loading && <div style={{ fontSize: 11, color: MUTED, marginBottom: 10 }}>Syncing onchain issuer tasks...</div>}
      {unissueWriteStatus.state !== "idle" && (
        <div
          style={{
            ...surfaceCard,
            position: "relative",
            marginBottom: 12,
            border:
              unissueWriteStatus.state === "confirmed"
                ? "1px solid rgba(221,158,51,0.35)"
                : unissueWriteStatus.state === "failed"
                  ? "1px solid rgba(255,107,157,0.35)"
                  : "1px solid rgba(65,105,225,0.35)",
            background:
              unissueWriteStatus.state === "confirmed"
                ? "rgba(221,158,51,0.08)"
                : unissueWriteStatus.state === "failed"
                  ? "rgba(255,107,157,0.08)"
                  : "rgba(65,105,225,0.08)",
          }}
        >
          <div style={{ fontSize: 11, color: MUTED, marginBottom: 6 }}>Last Unissue Task Write</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
            {unissueWriteStatus.state === "pending" && "Pending wallet/user-op confirmation..."}
            {unissueWriteStatus.state === "confirmed" && "Confirmed onchain"}
            {unissueWriteStatus.state === "failed" && "Failed onchain"}
          </div>
          {unissueWriteStatus.error && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>
              {unissueWriteStatus.error}
            </div>
          )}
          {unissueWriteStatus.hash && (
            <a
              href={`https://sepolia.basescan.org/tx/${unissueWriteStatus.hash}`}
              target="_blank"
              rel="noreferrer"
              style={{ display: "inline-block", marginTop: 6, fontSize: 12, color: ACCENT, textDecoration: "none" }}
            >
              View on Base Sepolia Explorer ↗
            </a>
          )}
          <button
            onClick={onDismissUnissueWrite}
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

      {/* ── Issued Instances ── */}
      {view === "issued" && (
        <>
          {visibleIssuedItems.length === 0 ? (
            <EmptyState
              emoji="📋"
              title="No issued tasks"
              desc="Issue tasks from the Tasks tab to make them available for participants to claim."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {visibleIssuedItems.map(task => {
                return (
                  <div key={task.taskId} style={{ ...accentCard }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 2 }}>
                          {task.title}
                        </div>
                        <div style={{ fontSize: 11, color: MUTED }}>{task.estimatedTime} · Opportunity Open</div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT, flexShrink: 0, marginLeft: 12 }}>
                        {task.credits} CITYx
                      </div>
                    </div>

                    {/* Issued status badge */}
                    <div
                      style={{
                        display: "inline-block",
                        fontSize: 10,
                        fontWeight: 600,
                        background: "rgba(65,105,225,0.12)",
                        color: "#4169E1",
                        borderRadius: 6,
                        padding: "2px 8px",
                        marginBottom: 12,
                      }}
                    >
                      Open · Awaiting Claim
                    </div>
                    <button
                      onClick={() => onUnissueConfirm(task.taskId)}
                      style={{
                        marginLeft: 8,
                        fontSize: 11,
                        fontWeight: 600,
                        background: "rgba(255,107,157,0.14)",
                        color: "#ff6b9d",
                        border: "1px solid rgba(255,107,157,0.35)",
                        borderRadius: 8,
                        padding: "4px 10px",
                        cursor: "pointer",
                      }}
                    >
                      Unissue Task
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── Claimed Instances ── */}
      {view === "claimed" && (
        <>
          {visibleClaimedItems.length === 0 ? (
            <EmptyState
              emoji="👤"
              title="No claimed tasks"
              desc="When participants claim your onchain tasks, they will appear here automatically."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {visibleClaimedItems.map(task => {
                return (
                  <div key={task.taskId} style={{ ...accentCard }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 2 }}>
                          {task.title}
                        </div>
                        <div style={{ fontSize: 11, color: MUTED }}>{task.estimatedTime} · Task Claimed</div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT, flexShrink: 0, marginLeft: 12 }}>
                        {task.credits} CITYx
                      </div>
                    </div>

                    {/* Claimed status badge */}
                    <div
                      style={{
                        display: "inline-block",
                        fontSize: 10,
                        fontWeight: 600,
                        background: "rgba(221,158,51,0.12)",
                        color: "#DD9E33",
                        borderRadius: 6,
                        padding: "2px 8px",
                        marginBottom: 12,
                      }}
                    >
                      In Progress · {task.taskDate || "TBD"}
                    </div>
                    {task.claimant && (
                      <div style={{ fontSize: 11, color: MUTED, fontFamily: "monospace" }}>
                        Claimed by {task.claimant.slice(0, 8)}...{task.claimant.slice(-6)}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>
                      Waiting for Task Execution.
                    </div>
                    <button
                      onClick={() => setExpandedClaimed(prev => ({ ...prev, [task.taskId]: !prev[task.taskId] }))}
                      style={{
                        marginTop: 10,
                        width: "100%",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 10,
                        padding: "9px 0",
                        fontSize: 12,
                        fontWeight: 600,
                        color: MUTED,
                        cursor: "pointer",
                      }}
                    >
                      {expandedClaimed[task.taskId] ? "Hide Details" : "Show Details"}
                    </button>
                    {expandedClaimed[task.taskId] && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: 12,
                          borderRadius: 10,
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <div style={{ fontSize: 12, color: MUTED, marginBottom: 10 }}>
                          Claimant no-show handling removes this task from circulation.
                        </div>
                        <button
                          onClick={() => {
                            if (task.claimant) {
                              onNoShowConfirm({
                                taskId: task.taskId,
                                claimant: task.claimant,
                                title: task.title,
                              });
                            }
                          }}
                          style={{
                            width: "100%",
                            background: "rgba(255,107,157,0.14)",
                            border: "1px solid rgba(255,107,157,0.35)",
                            borderRadius: 10,
                            padding: "10px 0",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#ff6b9d",
                            cursor: "pointer",
                          }}
                        >
                          No Show
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── Completed Instances ── */}
      {view === "completed" && (
        <>
          {verifyWriteStatus.state !== "idle" && (
            <div
              style={{
                ...surfaceCard,
                position: "relative",
                marginBottom: 12,
                border:
                  verifyWriteStatus.state === "confirmed"
                    ? "1px solid rgba(221,158,51,0.35)"
                    : verifyWriteStatus.state === "failed"
                      ? "1px solid rgba(255,107,157,0.35)"
                      : "1px solid rgba(65,105,225,0.35)",
                background:
                  verifyWriteStatus.state === "confirmed"
                    ? "rgba(221,158,51,0.08)"
                    : verifyWriteStatus.state === "failed"
                      ? "rgba(255,107,157,0.08)"
                      : "rgba(65,105,225,0.08)",
              }}
            >
              <div style={{ fontSize: 11, color: MUTED, marginBottom: 6 }}>Last Verify / Reject & Mint Write</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
                {verifyWriteStatus.state === "pending" && "Pending wallet/user-op confirmation..."}
                {verifyWriteStatus.state === "confirmed" && "Confirmed onchain"}
                {verifyWriteStatus.state === "failed" && "Failed onchain"}
              </div>
              {verifyWriteStatus.error && (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>
                  {verifyWriteStatus.error}
                </div>
              )}
              {verifyWriteStatus.hash && (
                <a
                  href={`https://sepolia.basescan.org/tx/${verifyWriteStatus.hash}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "inline-block", marginTop: 6, fontSize: 12, color: ACCENT, textDecoration: "none" }}
                >
                  View on Base Sepolia Explorer ↗
                </a>
              )}
              <button
                onClick={onDismissVerifyWrite}
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

          {visibleCompletedItems.length === 0 ? (
            <EmptyState
              emoji="🎉"
              title="Nothing to verify yet"
              desc="When participants submit completion proof onchain, they will appear here for verification."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {visibleCompletedItems.map(task => {
                return (
                  <div
                    key={`${task.taskId}-${task.claimant ?? "none"}`}
                    style={{
                      ...accentCard,
                      border: "1px solid rgba(221,158,51,0.2)",
                    }}
                  >
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{task.title}</div>
                      <div style={{ fontSize: 11, color: MUTED }}>
                        Awaiting verification for Opportunity #{task.opportunityId.toString()}
                      </div>
                    </div>

                    <div
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: 10,
                        padding: "8px 12px",
                        marginBottom: 10,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 12,
                        color: MUTED,
                      }}
                    >
                      <span>Reward on verification</span>
                      <span>
                        <span style={{ color: ACCENT }}>{task.credits} CITYx</span>
                        {" + "}
                        <span style={{ color: "#4169E1" }}>{task.voteTokens} VOTE</span>
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={async () => {
                          if (!task.claimant) return;
                          setConfirmVerify({
                            taskId: task.taskId,
                            claimant: task.claimant,
                            title: task.title,
                            decision: "verify",
                          });
                        }}
                        disabled={!task.claimant}
                        style={{
                          flex: 1,
                          background: task.claimant ? ACCENT : "rgba(255,255,255,0.1)",
                          border: "none",
                          borderRadius: 12,
                          padding: "11px 0",
                          fontSize: 13,
                          fontWeight: 700,
                          color: task.claimant ? BG : MUTED,
                          cursor: task.claimant ? "pointer" : "not-allowed",
                        }}
                      >
                        Verify & Mint
                      </button>
                      <button
                        onClick={async () => {
                          if (!task.claimant) return;
                          setConfirmVerify({
                            taskId: task.taskId,
                            claimant: task.claimant,
                            title: task.title,
                            decision: "reject",
                          });
                        }}
                        disabled={!task.claimant}
                        style={{
                          flex: 1,
                          background: task.claimant ? "rgba(255,107,157,0.18)" : "rgba(255,255,255,0.1)",
                          border: task.claimant
                            ? "1px solid rgba(255,107,157,0.45)"
                            : "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 12,
                          padding: "11px 0",
                          fontSize: 13,
                          fontWeight: 700,
                          color: task.claimant ? "#ff6b9d" : MUTED,
                          cursor: task.claimant ? "pointer" : "not-allowed",
                        }}
                      >
                        Reject & Mint
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {confirmVerify && (
        <>
          {(() => {
            const feedbackValue = feedbackMap[confirmVerify.taskId] ?? "";
            const needsFeedback = confirmVerify.decision === "reject";
            const canConfirm = !needsFeedback || feedbackValue.trim().length > 0;
            return (
              <>
                <style>{`@keyframes walletSlideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
                <div style={{ position: "fixed", inset: 0, zIndex: 220, pointerEvents: "none" }}>
                  {/* backdrop */}
                  <div
                    onClick={() => setConfirmVerify(null)}
                    style={{
                      position: "absolute",
                      inset: 0,
                      bottom: 69,
                      background: "rgba(0,0,0,0.55)",
                      pointerEvents: "auto",
                    }}
                  />
                  {/* sheet */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 69,
                      zIndex: 1,
                      background: "#1E1E2C",
                      borderRadius: "24px 24px 0 0",
                      boxShadow: "0 -8px 40px rgba(0,0,0,0.55)",
                      padding: "20px 20px 24px",
                      animation: "walletSlideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1) both",
                      pointerEvents: "auto",
                    }}
                  >
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                      {confirmVerify.decision === "reject" ? "Confirm Reject & Mint" : "Confirm Verify & Mint"}
                    </div>
                    <div style={{ fontSize: 12, color: MUTED, marginBottom: 10 }}>{confirmVerify.title}</div>
                    {confirmVerify.decision === "reject" && (
                      <div
                        style={{
                          background: "rgba(255,107,157,0.1)",
                          border: "1px solid rgba(255,107,157,0.3)",
                          borderRadius: 10,
                          padding: "8px 10px",
                          fontSize: 11,
                          color: "rgba(255,255,255,0.85)",
                          marginBottom: 10,
                          lineHeight: 1.5,
                        }}
                      >
                        Reject & Mint will still mint and distribute CITY/VOTE, and it will impact this Civic
                        Participant&apos;s score.
                      </div>
                    )}
                    <textarea
                      placeholder={
                        confirmVerify.decision === "reject"
                          ? "Required: explain why this completion was rejected…"
                          : "Optional feedback on task execution…"
                      }
                      value={feedbackMap[confirmVerify.taskId] ?? ""}
                      onChange={e => setFeedbackMap(prev => ({ ...prev, [confirmVerify.taskId]: e.target.value }))}
                      rows={3}
                      style={{
                        width: "100%",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 10,
                        color: "#fff",
                        fontSize: 12,
                        padding: "8px 12px",
                        outline: "none",
                        resize: "none",
                        boxSizing: "border-box",
                        marginBottom: 12,
                        lineHeight: 1.5,
                      }}
                    />
                    {confirmVerify.decision === "reject" && !canConfirm && (
                      <div style={{ fontSize: 11, color: "#ff6b9d", marginBottom: 10 }}>Feedback is required.</div>
                    )}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => setConfirmVerify(null)}
                        style={{
                          flex: 1,
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: 10,
                          padding: "10px 0",
                          fontSize: 12,
                          fontWeight: 600,
                          color: MUTED,
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          if (confirmVerify.decision === "reject" && !canConfirm) return;
                          await onVerify(confirmVerify.taskId, confirmVerify.claimant, {
                            decision: confirmVerify.decision,
                            feedback: feedbackValue.trim(),
                          });
                          setConfirmVerify(null);
                        }}
                        style={{
                          flex: 1,
                          background:
                            confirmVerify.decision === "reject"
                              ? canConfirm
                                ? "#ff6b9d"
                                : "rgba(255,255,255,0.08)"
                              : ACCENT,
                          border: confirmVerify.decision === "reject" ? "1px solid rgba(255,107,157,0.35)" : "none",
                          borderRadius: 10,
                          padding: "10px 0",
                          fontSize: 12,
                          fontWeight: 700,
                          color: confirmVerify.decision === "reject" ? (canConfirm ? "#fff" : MUTED) : BG,
                          cursor: canConfirm ? "pointer" : "not-allowed",
                        }}
                        disabled={!canConfirm}
                      >
                        {confirmVerify.decision === "reject" ? "Confirm Reject & Mint" : "Confirm Verify & Mint"}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </>
      )}
    </div>
  );
}

// ─── MCEs Tab ─────────────────────────────────────────────────────────────────

function MCEsTab({
  state,
  orgName,
  onLearnMore,
}: {
  state: ReturnType<typeof useDemo>["state"];
  orgName: string;
  onLearnMore: (key: IssuerLearnCardKey) => void;
}) {
  const { address } = useAccount({ type: "ModularAccountV2" });
  const [section, setSection] = useState<"epoch1" | "epoch2">("epoch1");
  const [proposeOpen, setProposeOpen] = useState(false);
  const [localProposals, setLocalProposals] = useState<
    Array<{ id: string; title: string; description: string; goals: string; benefits: string; tags: string[] }>
  >([]);
  const localProposalStorageKey = `citysync:demo:issuer:mce-proposals:v1:${(address ?? FAKE_WALLETS.issuer).toLowerCase()}`;

  // MCE proposal form state
  const [mceTitle, setMceTitle] = useState("");
  const [mceDesc, setMceDesc] = useState("");
  const [mceGoals, setMceGoals] = useState("");
  const [mceBenefits, setMceBenefits] = useState("");
  const [mceTags, setMceTags] = useState<string[]>([]);

  const MCE_TAGS = ["Environment", "Infrastructure", "Education", "Health", "Community", "Safety", "Economy"];

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(localProposalStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Array<{
        id: string;
        title: string;
        description: string;
        goals: string;
        benefits: string;
        tags: string[];
      }>;
      if (Array.isArray(parsed)) setLocalProposals(parsed);
    } catch {
      // Ignore hydration failures.
    }
  }, [localProposalStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(localProposalStorageKey, JSON.stringify(localProposals));
    } catch {
      // Ignore persistence failures.
    }
  }, [localProposalStorageKey, localProposals]);

  const toggleMceTag = (tag: string) => {
    setMceTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  };

  const submitProposal = () => {
    if (!mceTitle.trim() || !mceDesc.trim()) return;
    setLocalProposals(prev => [
      {
        id: `mce-local-${Date.now()}`,
        title: mceTitle.trim(),
        description: mceDesc.trim(),
        goals: mceGoals.trim(),
        benefits: mceBenefits.trim(),
        tags: mceTags,
      },
      ...prev,
    ]);
    setMceTitle("");
    setMceDesc("");
    setMceGoals("");
    setMceBenefits("");
    setMceTags([]);
    setProposeOpen(false);
  };

  const epoch1Mces = state.mces.filter(m => m.status === "Voting");
  const totalVotesCast = Math.max(
    epoch1Mces.reduce((sum, m) => sum + m.votesFor, 0),
    1,
  );

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    color: "#fff",
    fontSize: 13,
    padding: "10px 12px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: MUTED,
    textTransform: "uppercase" as const,
    letterSpacing: "0.07em",
    marginBottom: 6,
    display: "block",
  };

  return (
    <div style={{ padding: "24px 20px 100px" }}>
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
            { key: "epoch1", label: "Epoch 1 · Voting" },
            { key: "epoch2", label: "Epoch 2 · Upcoming" },
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
              background: section === s.key ? ACCENT : "transparent",
              color: section === s.key ? BG : MUTED,
              transition: "all 0.15s",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Epoch 1 — View only, no voting */}
      {section === "epoch1" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <LearnMoreLink onClick={() => onLearnMore("epoch1-voting")} />
          </div>

          {epoch1Mces.length === 0 ? (
            <EmptyState emoji="🗳️" title="No active proposals" desc="Epoch 1 voting proposals will appear here." />
          ) : (
            <div style={{ marginBottom: 8 }}>
              {epoch1Mces.map((mce, i) => {
                const pct = Math.round((mce.votesFor / totalVotesCast) * 100);
                return (
                  <div key={mce.id} style={{ ...purpleCard, marginBottom: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ flex: 1, paddingRight: 10 }}>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>
                          MCE-0{i + 1}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "white", lineHeight: 1.35 }}>
                          {mce.title}
                        </div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>
                          by {mce.proposerName}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "3px 10px",
                          borderRadius: 20,
                          background: `${STATUS_COLOR[mce.status] ?? ACCENT}18`,
                          color: STATUS_COLOR[mce.status] ?? ACCENT,
                          flexShrink: 0,
                        }}
                      >
                        {mce.status}
                      </span>
                    </div>

                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, marginBottom: 12 }}>
                      {mce.description.slice(0, 120)}…
                    </div>

                    <div style={{ marginBottom: 4 }}>
                      <div
                        style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: "#34eeb6",
                            borderRadius: 3,
                            transition: "width 0.2s",
                          }}
                        />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                          {mce.votesFor.toLocaleString()} votes
                        </span>
                        <span style={{ fontSize: 11, color: "#34eeb6" }}>{pct}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Epoch 2 — View + Create proposal */}
      {section === "epoch2" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <LearnMoreLink onClick={() => onLearnMore("next-epoch")} />
          </div>

          {/* Create proposal button */}
          <button
            onClick={() => setProposeOpen(true)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "rgba(221,158,51,0.1)",
              border: "1px dashed rgba(221,158,51,0.4)",
              borderRadius: 14,
              padding: "14px 0",
              fontSize: 13,
              fontWeight: 600,
              color: ACCENT,
              cursor: "pointer",
              marginBottom: 16,
            }}
          >
            <IconPlus /> Create New MCE Proposal
          </button>

          {/* Local proposals (just submitted) */}
          {localProposals.map(p => (
            <div
              key={p.id}
              style={{
                ...surfaceCard,
                marginBottom: 12,
                border: "1px solid rgba(221,158,51,0.2)",
                background: "rgba(221,158,51,0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 20,
                    background: "rgba(65,105,225,0.15)",
                    color: "#4169E1",
                    border: "1px solid rgba(65,105,225,0.3)",
                  }}
                >
                  Org
                </span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>just now</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "white", lineHeight: 1.35, marginBottom: 4 }}>
                {p.title}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>by {orgName}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginBottom: 10 }}>
                {p.description}
              </div>
              {p.tags.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {p.tags.map(tag => (
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
              )}
            </div>
          ))}

          {/* Existing epoch2 proposals */}
          {state.epoch2Proposals.map(prop => (
            <div key={prop.id} style={{ ...purpleCard, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 20,
                    background: prop.proposerType === "org" ? "rgba(65,105,225,0.15)" : "rgba(52,238,182,0.12)",
                    color: prop.proposerType === "org" ? "#4169E1" : "#34eeb6",
                    border: `1px solid ${prop.proposerType === "org" ? "rgba(65,105,225,0.3)" : "rgba(52,238,182,0.25)"}`,
                  }}
                >
                  {prop.proposerType === "org" ? "Org" : "Citizen"}
                </span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                  {(() => {
                    const diff = Date.now() - new Date(prop.proposedAt).getTime();
                    const h = Math.floor(diff / 3600000);
                    if (h < 1) return "just now";
                    if (h < 24) return `${h}h ago`;
                    return `${Math.floor(h / 24)}d ago`;
                  })()}
                </span>
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
              {prop.tags.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
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
              )}
            </div>
          ))}
        </>
      )}

      {/* MCE Proposal Create Sheet */}
      {proposeOpen && (
        <>
          <style>{`
            @keyframes walletSlideUp {
              from { transform: translateY(100%); opacity: 0; }
              to   { transform: translateY(0);    opacity: 1; }
            }
          `}</style>
          <div style={{ position: "fixed", inset: 0, zIndex: 220, pointerEvents: "none" }}>
            <div
              onClick={e => e.stopPropagation()}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 112,
                bottom: 69,
                zIndex: 1,
                background: "#1E1E2C",
                borderRadius: "12px 12px 0 0",
                boxShadow: "0 -8px 40px rgba(0,0,0,0.55)",
                padding: "20px 20px 24px",
                animation: "walletSlideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1) both",
                overflowY: "auto",
                pointerEvents: "auto",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: "white" }}>New MCE Proposal</span>
                <button
                  onClick={() => setProposeOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                    padding: 4,
                    fontSize: 20,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
              <div style={{ fontSize: 13, color: MUTED, marginBottom: 20, lineHeight: 1.5 }}>
                Submit a proposal for community consideration. Strong proposals include clear goals and measurable
                benefits.
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={labelStyle}>Title *</label>
                  <input
                    value={mceTitle}
                    onChange={e => setMceTitle(e.target.value)}
                    placeholder="e.g. Eastside Green Corridor Initiative"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Description *</label>
                  <textarea
                    value={mceDesc}
                    onChange={e => setMceDesc(e.target.value)}
                    placeholder="What is this proposal about? Why does the city need it?"
                    rows={3}
                    style={{ ...inputStyle, resize: "none", lineHeight: 1.5 }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Goals</label>
                  <textarea
                    value={mceGoals}
                    onChange={e => setMceGoals(e.target.value)}
                    placeholder="What specific outcomes will this achieve?"
                    rows={2}
                    style={{ ...inputStyle, resize: "none", lineHeight: 1.5 }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Community Benefits</label>
                  <textarea
                    value={mceBenefits}
                    onChange={e => setMceBenefits(e.target.value)}
                    placeholder="Who benefits and how? Be specific about impact."
                    rows={2}
                    style={{ ...inputStyle, resize: "none", lineHeight: 1.5 }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Tags</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {MCE_TAGS.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleMceTag(tag)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 20,
                          border: mceTags.includes(tag) ? `1px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.12)",
                          background: mceTags.includes(tag) ? `${ACCENT}22` : "rgba(255,255,255,0.04)",
                          color: mceTags.includes(tag) ? ACCENT : MUTED,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={submitProposal}
                disabled={!mceTitle.trim() || !mceDesc.trim()}
                style={{
                  width: "100%",
                  background: mceTitle.trim() && mceDesc.trim() ? ACCENT : "rgba(255,255,255,0.08)",
                  border: "none",
                  borderRadius: 14,
                  padding: "14px 0",
                  fontSize: 14,
                  fontWeight: 700,
                  color: mceTitle.trim() && mceDesc.trim() ? BG : MUTED,
                  cursor: mceTitle.trim() && mceDesc.trim() ? "pointer" : "not-allowed",
                  marginTop: 20,
                }}
              >
                Submit Proposal
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Issue Task Popup ─────────────────────────────────────────────────────────

function IssueTaskPopup({
  task,
  creditsCommitted,
  onClose,
  onIssue,
}: {
  task: Task;
  creditsCommitted: number;
  onClose: () => void;
  onIssue: (slots: number) => void | Promise<void>;
}) {
  const [slots, setSlots] = useState(1);
  const [step, setStep] = useState<"select" | "confirm">("select");
  const [submitting, setSubmitting] = useState(false);
  const totalCity = slots * task.credits;
  const totalVote = slots * task.voteTokens;
  const remainingBudget = Math.max(0, EPOCH1_CAP - creditsCommitted);
  const wouldExceedBudget = totalCity > remainingBudget;

  const submitIssue = async () => {
    if (submitting || wouldExceedBudget) return;
    setSubmitting(true);
    try {
      await onIssue(slots);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes walletSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
      <div style={{ position: "fixed", inset: 0, zIndex: 220, pointerEvents: "none" }}>
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
          onClick={onClose}
        />
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 69,
            maxHeight: "65%",
            zIndex: 1,
            background: "#1E1E2C",
            borderRadius: "24px 24px 0 0",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.55)",
            padding: "20px 20px 24px",
            animation: "walletSlideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1) both",
            overflowY: "auto",
            pointerEvents: "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Issue Task</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 11, color: DIMMED, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {step === "select" ? "Step 1 of 2" : "Step 2 of 2"}
              </div>
              <button
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.4)",
                  cursor: "pointer",
                  padding: 4,
                  fontSize: 20,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          </div>

          {step === "select" ? (
            <>
              <div style={{ ...surfaceCard, marginBottom: 14, padding: "12px 14px" }}>
                <div style={{ fontSize: 13, color: "#fff", fontWeight: 700, marginBottom: 4 }}>{task.title}</div>
                <div style={{ fontSize: 11, color: MUTED, marginBottom: 8 }}>
                  {task.location || "Location TBD"} · {task.taskDate || "Date/Time TBD"}
                </div>
                <div style={{ fontSize: 11, color: DIMMED }}>
                  {task.credits} CITYx + {task.voteTokens} VOTE per task completion
                </div>
              </div>

              <div style={{ fontSize: 12, color: MUTED, marginBottom: 10 }}>
                How many task slots do you want to issue?
              </div>
              <div
                style={{
                  ...surfaceCard,
                  marginBottom: 12,
                  padding: "10px 12px",
                  border: wouldExceedBudget ? "1px solid rgba(255,107,157,0.35)" : "1px solid rgba(255,255,255,0.08)",
                  background: wouldExceedBudget ? "rgba(255,107,157,0.1)" : "rgba(255,255,255,0.03)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: MUTED }}>
                  <span>Epoch budget remaining</span>
                  <span style={{ color: "#fff", fontWeight: 600 }}>{remainingBudget} CITYx</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 4 }}>
                  <span style={{ color: wouldExceedBudget ? "#ff6b9d" : MUTED }}>Projected issuance</span>
                  <span style={{ color: wouldExceedBudget ? "#ff6b9d" : "#fff", fontWeight: 700 }}>
                    {totalCity} CITYx
                  </span>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                  marginBottom: 14,
                }}
              >
                <button
                  onClick={() => setSlots(s => Math.max(1, s - 1))}
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.06)",
                    color: "white",
                    fontSize: 24,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  −
                </button>
                <div style={{ textAlign: "center", minWidth: 88 }}>
                  <div style={{ fontSize: 38, fontWeight: 700, color: ACCENT, lineHeight: 1 }}>{slots}</div>
                  <div style={{ fontSize: 11, color: DIMMED, marginTop: 4 }}>slot{slots !== 1 ? "s" : ""}</div>
                </div>
                <button
                  onClick={() => setSlots(s => s + 1)}
                  disabled={(slots + 1) * task.credits > remainingBudget}
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: `${ACCENT}33`,
                    color: ACCENT,
                    fontSize: 24,
                    cursor: (slots + 1) * task.credits > remainingBudget ? "not-allowed" : "pointer",
                    opacity: (slots + 1) * task.credits > remainingBudget ? 0.45 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  +
                </button>
              </div>
              {wouldExceedBudget && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#ff6b9d",
                    marginBottom: 8,
                    lineHeight: 1.4,
                  }}
                >
                  Issuance exceeds remaining Epoch budget. Reduce slots to continue.
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ ...surfaceCard, marginBottom: 12, padding: "12px 14px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{task.title}</div>
                <div style={{ display: "grid", gap: 6, fontSize: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: MUTED }}>
                    <span>Slots</span>
                    <span style={{ color: "#fff", fontWeight: 600 }}>{slots}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: MUTED }}>
                    <span>Total CITY</span>
                    <span style={{ color: "#fff", fontWeight: 600 }}>{totalCity} CITYx</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: MUTED }}>
                    <span>Total VOTE</span>
                    <span style={{ color: "#fff", fontWeight: 600 }}>{totalVote} VOTE</span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: DIMMED, lineHeight: 1.45, marginBottom: 10 }}>
                This will create {slots} onchain task instance{slots !== 1 ? "s" : ""}. They will appear in Active Tasks
                and become available to participants immediately.
              </div>
            </>
          )}

          <div
            style={{
              position: "sticky",
              bottom: 0,
              background: "linear-gradient(180deg, rgba(30,30,44,0) 0%, rgba(30,30,44,1) 24%)",
              paddingTop: 10,
            }}
          >
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={step === "select" ? onClose : () => setStep("select")}
                disabled={submitting}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 12,
                  padding: "12px 0",
                  fontSize: 13,
                  fontWeight: 600,
                  color: MUTED,
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {step === "select" ? "Cancel" : "Back"}
              </button>
              <button
                onClick={step === "select" ? () => setStep("confirm") : () => void submitIssue()}
                disabled={
                  submitting || (step === "select" && wouldExceedBudget) || (step === "confirm" && wouldExceedBudget)
                }
                style={{
                  flex: 2,
                  background: ACCENT,
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 0",
                  fontSize: 13,
                  fontWeight: 700,
                  color: BG,
                  cursor: submitting || wouldExceedBudget ? "not-allowed" : "pointer",
                  opacity: submitting || wouldExceedBudget ? 0.7 : 1,
                }}
              >
                {step === "select"
                  ? wouldExceedBudget
                    ? "Exceeds Epoch Budget"
                    : "Continue"
                  : submitting
                    ? "Submitting Onchain..."
                    : `Issue ${slots} Slot${slots !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Modify Task Sheet ────────────────────────────────────────────────────────

function ModifyTaskSheet({
  task,
  onClose,
  onSave,
}: {
  task: Task;
  onClose: () => void;
  onSave: (updates: { location: string; taskDate: string }) => void;
}) {
  const [location, setLocation] = useState(task.location);
  const [taskDate, setTaskDate] = useState(task.taskDate ?? "");

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    color: "#fff",
    fontSize: 13,
    padding: "10px 12px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: MUTED,
    textTransform: "uppercase" as const,
    letterSpacing: "0.07em",
    marginBottom: 6,
    display: "block",
  };

  return (
    <>
      <style>{`
        @keyframes walletSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
      <div style={{ position: "fixed", inset: 0, zIndex: 220, pointerEvents: "none" }}>
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
          onClick={onClose}
        />
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 69,
            maxHeight: "55%",
            zIndex: 1,
            background: "#1E1E2C",
            borderRadius: "24px 24px 0 0",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.55)",
            padding: "20px 20px 24px",
            animation: "walletSlideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1) both",
            overflowY: "auto",
            pointerEvents: "auto",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: "white" }}>Modify Task</span>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.4)",
                cursor: "pointer",
                padding: 4,
                fontSize: 20,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
          <div style={{ fontSize: 13, color: MUTED, marginBottom: 6 }}>{task.title}</div>
          <div
            style={{
              fontSize: 11,
              color: DIMMED,
              marginBottom: 20,
              background: "rgba(255,255,255,0.04)",
              borderRadius: 8,
              padding: "8px 12px",
              lineHeight: 1.5,
            }}
          >
            Only Location and Date &amp; Time of Activity can be changed on an approved task.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Location</label>
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Riverside Park, District 4"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Date &amp; Time of Activity</label>
              <input
                value={taskDate}
                onChange={e => setTaskDate(e.target.value)}
                placeholder="e.g. Saturday, March 21, 2026 · 10am"
                style={inputStyle}
              />
            </div>
          </div>

          <button
            onClick={() => onSave({ location: location.trim() || task.location, taskDate: taskDate.trim() })}
            style={{
              width: "100%",
              background: ACCENT,
              border: "none",
              borderRadius: 14,
              padding: "14px 0",
              fontSize: 14,
              fontWeight: 700,
              color: BG,
              cursor: "pointer",
              marginTop: 20,
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
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
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          {text}
        </span>
      </div>
      {right}
    </div>
  );
}

function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: `${color}18`,
        color,
        border: `1px solid ${color}35`,
        borderRadius: 20,
        padding: "3px 10px 3px 8px",
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />
      {label}
    </span>
  );
}

function EmptyState({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          marginBottom: 16,
        }}
      >
        {emoji}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: MUTED, maxWidth: 240, lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

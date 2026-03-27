"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAccount } from "@account-kit/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import AppShell from "../_components/AppShell";
import DemoToast from "../_components/DemoToast";
import { LearnInfoCard, LearnMoreLink, LearnMorePanel } from "../_components/LearnMore";
import { OnchainActivityPanel } from "../_components/OnchainActivityPanel";
import { RailInfoPlaceholderCard, TutorialWalkthroughButton } from "../_components/RailCards";
import { useDemo } from "../_context/DemoContext";
import { FAKE_WALLETS, Post, PostCategory, RedemptionOffer } from "../_data/mockData";
import { useLearnMoreCards } from "../_hooks/useLearnMoreCards";
import { compressPhotoToBase64 } from "../_utils/compressPhoto";
import {
  DEMO_CONTENT_SHEET_ABSOLUTE_ELEVATED_STYLE,
  DEMO_MODAL_OVERLAY_STYLE,
  DEMO_MODAL_SHEET_BASE_STYLE,
  DEMO_TUTORIAL_HIGHLIGHT_LAYER_STYLE,
} from "../_utils/sheetStyles";
import {
  appendDemoTutorialOfferingIds,
  cleanupDemoTutorialArtifacts,
  consumeDemoTutorialHandoff,
  ISSUER_TUTORIAL_STEP_STORAGE_KEY,
  SHARED_TUTORIAL_INTRO_TEXT,
  setDemoTutorialHandoff,
  startDemoTutorialRunForAddress,
} from "../_utils/tutorialRun";
import {
  DEMO_BG,
  DEMO_BORDER,
  DEMO_SHADOW,
  DEMO_SHADOW_LG,
  DEMO_SURFACE,
  DEMO_SURFACE_SOFT,
  DEMO_TEXT_DIMMED,
  DEMO_TEXT_STRONG,
  DEMO_TEXT_SUBTLE,
} from "../_utils/themeTokens";

const DOCS_PAGE = "https://www.city-sync.org/docs";
const docsHref = (anchor: string) => `${DOCS_PAGE}#${anchor}`;

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconStore = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 9l1-5h16l1 5M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9M3 9h18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

const IconCard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="6" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M16 10a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="currentColor" />
    <path d="M2 10h20" stroke="currentColor" strokeWidth="2" />
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

const IconQR = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
    <path d="M14 14h2v2h-2zM18 14h3v3h-1v-1h-2zM18 19h3M14 18v3M16 18h2" stroke="currentColor" strokeWidth="1.5" />
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

const IconLock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ─── Constants & Styles ───────────────────────────────────────────────────────

const TABS = [
  { key: "profile", label: "Profile", icon: <IconStore /> },
  { key: "offerings", label: "Offerings", icon: <IconCard /> },
  { key: "community", label: "Community", icon: <IconCity /> },
];

const ACCENT = "#34eeb6"; // teal — primary / committed
const ACCENT_GOLD = "#DD9E33"; // gold — MCE / business
const ACCENT_BLUE = "#7eb3ff"; // blue — stats / info
const ACCENT_PURPLE = "#a78bfa"; // purple — catalog / network
const BRAND_BLUE = "#4169E1";
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
const REDEEMER_ROLE_TUTORIAL_STEPS = new Set<IssuerTutorialStep>([
  "intro",
  "box19",
  "box20",
  "box21",
  "box22",
  "dismissed",
]);

function readIssuerTutorialStepFromStorage(): IssuerTutorialStep {
  if (typeof window === "undefined") return "intro";
  try {
    const raw = window.localStorage.getItem(ISSUER_TUTORIAL_STEP_STORAGE_KEY);
    if (raw === "dismissed") return "dismissed";
    const handoffStep = consumeDemoTutorialHandoff("redeemer");
    if (handoffStep && (handoffStep === "intro" || handoffStep === "dismissed" || /^box\d+$/.test(handoffStep))) {
      return handoffStep as IssuerTutorialStep;
    }
  } catch {
    // Ignore storage access failures.
  }
  return "intro";
}

const SURFACE = DEMO_SURFACE;
const BG = DEMO_BG;
const SURFACE_SOFT = DEMO_SURFACE_SOFT;
const BORDER = DEMO_BORDER;
const TEXT_STRONG = DEMO_TEXT_STRONG;
const TEXT_DIMMED = DEMO_TEXT_DIMMED;
const SHADOW = DEMO_SHADOW;
const SHADOW_LG = DEMO_SHADOW_LG;
const CONTROL_SURFACE = "var(--cs-control-surface, rgba(255,255,255,0.05))";
const CONTROL_ACTIVE = "var(--cs-control-active, rgba(255,255,255,0.1))";
const CONTROL_BORDER = "var(--cs-control-border, rgba(255,255,255,0.14))";
const MUTED = DEMO_TEXT_DIMMED;
const DIMMED = DEMO_TEXT_SUBTLE;

const surfaceCard: React.CSSProperties = {
  background: SURFACE,
  border: `1px solid ${BORDER}`,
  borderRadius: 16,
  padding: "16px",
  boxShadow: SHADOW,
};
const accentCard: React.CSSProperties = {
  ...surfaceCard,
  borderLeft: "3px solid rgba(52,238,182,0.45)",
  paddingLeft: 13,
};
const goldCard: React.CSSProperties = {
  ...surfaceCard,
  borderLeft: "3px solid rgba(221,158,51,0.45)",
  paddingLeft: 13,
};
const purpleCard: React.CSSProperties = {
  ...surfaceCard,
  borderLeft: "3px solid rgba(167,139,250,0.5)",
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

const REDEEMER_COMMITTED_CATALOG_STORAGE_PREFIX = "citysync:demo:redeemer:committed-catalog:v3";
const REDEEMER_MCE_CATALOG_STORAGE_PREFIX = "citysync:demo:redeemer:mce-catalog:v3";
const REDEEMER_ACTIVE_COMMITTED_STORAGE_PREFIX = "citysync:demo:redeemer:active-committed:v3";
const REDEEMER_ACTIVE_MCE_STORAGE_PREFIX = "citysync:demo:redeemer:active-mce:v3";

type OfferWriteStatus = {
  state: "idle" | "pending" | "confirmed" | "failed";
  hash?: `0x${string}`;
  error?: string;
};

// ─── Local Offering Types ─────────────────────────────────────────────────────

type CustomOffering = {
  id: string;
  name: string;
  costCity: number;
  stipulations: string;
  createdAt: string;
  catalogId?: string;
  onchainOfferId?: string;
};

type MCECustomOffering = {
  id: string;
  name: string;
  costCity: number;
  stipulations: string;
  mceIds: string[];
  mceNames: string[];
  createdAt: string;
  catalogId?: string;
  onchainOfferId?: string;
};

type QROfferingData = {
  id: string;
  name: string;
  costCity: number;
  orgName: string;
};

type CatalogEditorState = { type: "committed"; editId?: string } | { type: "mce"; editId?: string } | null;

const normalizeOfferText = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");
const normalizeMceIds = (ids: string[]) => Array.from(new Set(ids)).sort().join("|");
const DEFAULT_STIPULATIONS = "No additional stipulations";

const parseOnchainOfferNumericId = (id: string | undefined): string | null => {
  if (!id) return null;
  if (/^\d+$/.test(id)) return id;
  const match = id.match(/^onchain:0x[a-fA-F0-9]{40}:(\d+)$/);
  return match?.[1] ?? null;
};

const pickHighestNumericId = (ids: string[]): string | undefined => {
  let best: string | undefined;
  for (const id of ids) {
    if (!best || BigInt(id) > BigInt(best)) best = id;
  }
  return best;
};

const isSameStipulationText = (a: string, b: string) => {
  const left = normalizeOfferText(a || "");
  const right = normalizeOfferText(b || "");
  if (left === right) return true;
  const leftEmpty = left.length === 0;
  const rightEmpty = right.length === 0;
  if (leftEmpty && right === normalizeOfferText(DEFAULT_STIPULATIONS)) return true;
  if (rightEmpty && left === normalizeOfferText(DEFAULT_STIPULATIONS)) return true;
  return false;
};

const isSameCommittedOfferState = (
  a: Pick<CustomOffering, "name" | "costCity" | "stipulations">,
  b: Pick<CustomOffering, "name" | "costCity" | "stipulations">,
) =>
  a.costCity === b.costCity &&
  normalizeOfferText(a.name) === normalizeOfferText(b.name) &&
  normalizeOfferText(a.stipulations || "") === normalizeOfferText(b.stipulations || "");

const isSameMceOfferState = (
  a: Pick<MCECustomOffering, "name" | "costCity" | "stipulations" | "mceIds">,
  b: Pick<MCECustomOffering, "name" | "costCity" | "stipulations" | "mceIds">,
) =>
  a.costCity === b.costCity &&
  normalizeOfferText(a.name) === normalizeOfferText(b.name) &&
  normalizeOfferText(a.stipulations || "") === normalizeOfferText(b.stipulations || "") &&
  normalizeMceIds(a.mceIds || []) === normalizeMceIds(b.mceIds || []);

type RedeemerLearnCardKey =
  | "profile-account"
  | "profile-role"
  | "profile-overview"
  | "offerings-catalog"
  | "offerings-commitment"
  | "offerings-mce"
  | "offerings-activity"
  | "dashboard-activity-overview"
  | "dashboard-offerings-breakdown"
  | "mycity-feed"
  | "mce-participation"
  | "epoch1-voting"
  | "next-epoch";

type RedeemerLearnMoreSelection = RedeemerLearnCardKey | RedeemerLearnCardKey[];

const REDEEMER_LEARN_CARDS: Record<RedeemerLearnCardKey, LearnInfoCard> = {
  "profile-account": {
    title: "Redeemer Account",
    subtitle: "Registered organization identity",
    body: "Your redeemer profile ties venue details, organization identity, and account-level redemption actions to one persistent role session in the demo.",
    relatedLinks: [{ label: "Redeemer Organizations", href: docsHref("general-redeemer-organizations") }],
  },
  "profile-role": {
    title: "Redeemer Responsibilities",
    subtitle: "How redeemers create utility",
    body: "Redeemers convert earned CITY into real-world value through committed offerings and event-specific reward programs, closing the contribution-to-benefit loop.",
    relatedLinks: [
      { label: "Redeemer Organizations", href: docsHref("general-redeemer-organizations") },
      { label: "Public-Sector Economy", href: docsHref("foundation-public-sector-economy") },
    ],
  },
  "profile-overview": {
    title: "Certified Redeemer Organization",
    subtitle: "Account identity and responsibilities",
    body: "Your redeemer profile ties venue details, organization identity, and account-level redemption actions to one persistent role session. Redeemers convert earned CITY into real-world value through committed offerings and event-specific reward programs, closing the contribution-to-benefit loop for Civic Participants.",
    relatedLinks: [{ label: "Redeemer Organizations", href: docsHref("general-redeemer-organizations") }],
  },
  "offerings-catalog": {
    title: "Offerings Catalog",
    subtitle: "Templates before commitment",
    body: "Catalog entries are reusable templates for future commitments. You can edit them over time and issue new active offerings without recreating details from scratch.",
    relatedLinks: [{ label: "Offerings", href: docsHref("general-redeemer-offerings") }],
  },
  "offerings-commitment": {
    title: "Why Offerings Are Committed",
    subtitle: "Epoch and MCE commitment model",
    body: "Committed offerings are locked for the duration of an Epoch or MCE event to provide predictability for Civic Participants and strengthen participation incentives. Redeemer organizations must honor these commitments and abide by the rules established by the Representative Redeemer Committee.",
    relatedLinks: [{ label: "Redemption Capacity", href: docsHref("foundation-redemption-capacity") }],
  },
  "offerings-mce": {
    title: "MCE Offerings",
    subtitle: "Event-linked redemption commitments",
    body: "MCE offerings are dedicated commitments tied to active MCE initiatives. They help align redemption behavior with city-priority events, make redeemer support visible during campaigns, and create predictable value for participants completing MCE-linked work.",
    relatedLinks: [{ label: "MCEs", href: docsHref("pilot-mces") }],
  },
  "offerings-activity": {
    title: "Redeemer Onchain Activity",
    subtitle: "Shared role-wide visibility",
    body: "The activity panel tracks committed offerings and redemption-related contract actions across redeemer organizations, with explorer links for each transaction.",
    relatedLinks: [{ label: "Economic Governance", href: docsHref("foundation-economic-governance") }],
  },
  "dashboard-activity-overview": {
    title: "Activity Overview",
    subtitle: "High-level redeemer operations snapshot",
    body: "This overview summarizes active offerings, organization status, total redemptions processed, and CITYx burned so your team can quickly monitor operating health across the current Epoch.",
    relatedLinks: [{ label: "Economic Governance", href: docsHref("foundation-economic-governance") }],
  },
  "dashboard-offerings-breakdown": {
    title: "Offerings Breakdown",
    subtitle: "Per-offering performance detail",
    body: "This section breaks performance down by offering so redeemer teams can compare utilization, identify what is working, and calibrate future commitments with clearer evidence.",
    relatedLinks: [{ label: "Capacity Optimization", href: docsHref("general-redeemer-capacity-optimization") }],
  },
  "mycity-feed": {
    title: "MyCity Communications",
    subtitle: "Public coordination channel",
    body: "Use MyCity to announce reward programs, venue updates, and campaign participation so participants can discover timely redemption options.",
    relatedLinks: [{ label: "MyCity Feed", href: docsHref("pilot-mycity-feed") }],
  },
  "mce-participation": {
    title: "MCE Participation",
    subtitle: "Event-based reward programs",
    body: "Mass Coordination Events align participant demand around city priorities. Redeemers support this by publishing MCE-specific offerings and redemption capacity.",
    relatedLinks: [{ label: "MCEs", href: docsHref("pilot-mces") }],
  },
  "epoch1-voting": {
    title: "Current Epoch Voting",
    subtitle: "How Redeemers engage during Epoch 1",
    body: "During Epoch 1, Civic Participants vote on active MCE proposals while Redeemer organizations track momentum and align offerings with emerging priorities. Redeemers do not cast protocol votes in this stage, but can signal support through planned redemption commitments tied to likely initiatives.",
    relatedLinks: [
      { label: "MCEs", href: docsHref("pilot-mces") },
      { label: "VOTE & Governance Page", href: docsHref("pilot-mces-governance") },
    ],
  },
  "next-epoch": {
    title: "Upcoming Epoch Proposals",
    subtitle: "How proposals move into next-cycle voting",
    body: "While current-epoch voting runs, active Issuer and Redeemer organizations can submit initiatives for the next epoch. Community likes provide public signal, and the Issuer Committee selects the final top proposals based on need and feasibility. Redeemer pre-commitments help shape which proposals appear operationally viable before final selection.",
    relatedLinks: [
      { label: "MCEs", href: docsHref("pilot-mces") },
      { label: "Economic Governance", href: docsHref("foundation-economic-governance") },
    ],
  },
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RedeemerApp() {
  const { state, setRole, redeemerAddOffer, redeemerUpdateOfferRate, dispatch } = useDemo();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hideShellPanels = searchParams?.get("embed") === "1";
  const roleRouteSuffix = searchParams?.toString() ? `?${searchParams.toString()}` : "";
  const withCurrentQuery = React.useCallback((path: string) => `${path}${roleRouteSuffix}`, [roleRouteSuffix]);
  const { address } = useAccount({ type: "ModularAccountV2" });
  const [activeTab, setActiveTab] = useState("profile");
  const { openInfoCards, openLearnMore, closeLearnMore, clearLearnMore } =
    useLearnMoreCards<RedeemerLearnCardKey>(activeTab);
  const [catalogEditor, setCatalogEditor] = useState<CatalogEditorState>(null);
  const [qrTarget, setQrTarget] = useState<QROfferingData | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [localPosts, setLocalPosts] = useState<Post[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [committedOfferings, setCommittedOfferings] = useState<CustomOffering[]>([]);
  const [mceOfferings, setMceOfferings] = useState<MCECustomOffering[]>([]);
  const [committedCatalog, setCommittedCatalog] = useState<CustomOffering[]>([]);
  const [mceCatalog, setMceCatalog] = useState<MCECustomOffering[]>([]);
  const [catalogIssueSheet, setCatalogIssueSheet] = useState<"committed" | "mce" | null>(null);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [offerWriteStatus, setOfferWriteStatus] = useState<OfferWriteStatus>({ state: "idle" });
  const [tutorialStep, setTutorialStep] = useState<IssuerTutorialStep>(() => readIssuerTutorialStepFromStorage());
  const [tutorialCatalogOfferingId, setTutorialCatalogOfferingId] = useState<string | null>(null);
  const [tutorialActiveOfferingId, setTutorialActiveOfferingId] = useState<string | null>(null);
  const tutorialLockActive = tutorialStep !== "intro" && tutorialStep !== "dismissed";
  const persistTutorialStep = React.useCallback((nextStep: IssuerTutorialStep) => {
    try {
      window.localStorage.setItem(ISSUER_TUTORIAL_STEP_STORAGE_KEY, nextStep);
    } catch {
      // Ignore storage access failures.
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const handleTutorialMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const payload = event.data;
      if (!payload || typeof payload !== "object") return;
      const type = (payload as { type?: string }).type;
      if (type === "citysync:tutorial-reset") {
        setTutorialStep("dismissed");
        return;
      }
      if (type === "citysync:tutorial-force-step") {
        const nextStep = (payload as { step?: string }).step;
        if (nextStep && (nextStep === "intro" || nextStep === "dismissed" || /^box\d+$/.test(nextStep))) {
          setTutorialStep(nextStep as IssuerTutorialStep);
        }
      }
    };
    window.addEventListener("message", handleTutorialMessage);
    return () => window.removeEventListener("message", handleTutorialMessage);
  }, []);

  const { redeemer, mces } = state;
  // Only require `address` — the smart-account client can lag behind by
  // 1-3 s after login or after a prior UserOp. If it still isn't ready
  // when the write fires, writeContractAsync (DemoContext) will throw a
  // clear "Session not ready" message rather than silently blocking.
  const canCommitOnchain = Boolean(address);
  const normalizedAddress = (address ?? FAKE_WALLETS.redeemer).toLowerCase();
  const walletStorageSuffix = React.useMemo(() => (address ?? FAKE_WALLETS.redeemer).toLowerCase(), [address]);
  const committedCatalogStorageKey = React.useMemo(
    () => `${REDEEMER_COMMITTED_CATALOG_STORAGE_PREFIX}:${walletStorageSuffix}`,
    [walletStorageSuffix],
  );
  const mceCatalogStorageKey = React.useMemo(
    () => `${REDEEMER_MCE_CATALOG_STORAGE_PREFIX}:${walletStorageSuffix}`,
    [walletStorageSuffix],
  );
  const activeCommittedStorageKey = React.useMemo(
    () => `${REDEEMER_ACTIVE_COMMITTED_STORAGE_PREFIX}:${walletStorageSuffix}`,
    [walletStorageSuffix],
  );
  const activeMceStorageKey = React.useMemo(
    () => `${REDEEMER_ACTIVE_MCE_STORAGE_PREFIX}:${walletStorageSuffix}`,
    [walletStorageSuffix],
  );
  const allPosts = [...localPosts, ...state.posts];
  const previousActiveTabRef = React.useRef(activeTab);

  React.useEffect(() => {
    if (previousActiveTabRef.current === activeTab) return;
    previousActiveTabRef.current = activeTab;
    // Ensure cross-tab navigation always dismisses any open sheet/modal state.
    setCatalogEditor(null);
    setQrTarget(null);
    setComposeOpen(false);
    setCatalogIssueSheet(null);
    setRemoveTarget(null);
  }, [activeTab]);

  React.useEffect(() => {
    if (tutorialStep === "box18") {
      setTutorialStep("box19");
      return;
    }
    if (tutorialStep === "box19" || tutorialStep === "box20" || tutorialStep === "box21" || tutorialStep === "box22") {
      setActiveTab("offerings");
    }
  }, [tutorialStep]);
  const exitTutorial = React.useCallback(() => {
    cleanupDemoTutorialArtifacts({ address, clearRun: true });
    persistTutorialStep("dismissed");
    setTutorialStep("dismissed");
  }, [address, persistTutorialStep]);
  const rightPanel = <OnchainActivityPanel role="redeemer" accent={ACCENT} />;
  const additionalReadingLinks = React.useMemo(() => {
    const seen = new Set<string>();
    const links: Array<{ label: string; href: string }> = [];
    for (const key of openInfoCards) {
      const card = REDEEMER_LEARN_CARDS[key];
      if (!card?.relatedLinks) continue;
      for (const link of card.relatedLinks) {
        if (seen.has(link.href)) continue;
        seen.add(link.href);
        links.push(link);
      }
    }
    return links;
  }, [openInfoCards]);
  React.useEffect(() => {
    if (!hideShellPanels || typeof window === "undefined" || window.parent === window) return;
    const cards: Array<{
      key: string;
      title: string;
      subtitle: string;
      body: string;
      relatedLinks?: Array<{ label: string; href: string }>;
    }> = [];
    for (const key of openInfoCards) {
      const info = REDEEMER_LEARN_CARDS[key];
      if (!info) continue;
      cards.push({
        key: String(key),
        title: info.title,
        subtitle: info.subtitle,
        body: info.body,
        relatedLinks: info.relatedLinks,
      });
    }
    window.parent.postMessage(
      {
        type: "citysync:learn-more-state",
        role: "redeemer",
        cards,
        relatedLinks: additionalReadingLinks,
      },
      window.location.origin,
    );
  }, [additionalReadingLinks, hideShellPanels, openInfoCards]);
  const tutorialCard = (() => {
    if (tutorialStep === "dismissed") return null;

    const cardStyle: React.CSSProperties = {
      background: "var(--cs-rail-surface, rgba(255,255,255,0.92))",
      border: "1px solid var(--cs-rail-border, rgba(31,45,86,0.14))",
      borderRadius: 16,
      padding: 14,
    };
    const subtitleStyle: React.CSSProperties = {
      fontSize: 10,
      color: "var(--cs-rail-text-muted, rgba(27,45,95,0.58))",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      fontWeight: 700,
      marginBottom: 6,
    };
    const titleStyle: React.CSSProperties = {
      fontSize: 15,
      color: "var(--cs-rail-text-strong, #1b2e63)",
      fontWeight: 700,
      marginBottom: 8,
    };
    const bodyStyle: React.CSSProperties = {
      fontSize: 12,
      color: "var(--cs-rail-text, rgba(27,45,95,0.78))",
      lineHeight: 1.6,
      whiteSpace: "pre-line",
    };
    const primaryButtonStyle: React.CSSProperties = {
      border: "1px solid rgba(221,158,51,0.92)",
      borderRadius: 10,
      padding: "8px 12px",
      fontSize: 12,
      fontWeight: 700,
      cursor: "pointer",
      background: "#DD9E33",
      color: "#15151E",
    };
    const ghostButtonStyle: React.CSSProperties = {
      border: "1px solid rgba(65,105,225,0.24)",
      borderRadius: 10,
      padding: "8px 12px",
      fontSize: 12,
      fontWeight: 700,
      cursor: "pointer",
      background: "rgba(65,105,225,0.1)",
      color: "#284695",
      marginTop: 12,
    };

    if (tutorialStep === "box19") {
      return (
        <div style={cardStyle}>
          <div style={subtitleStyle}>Step 14</div>
          <div style={titleStyle}>Offering Catalog</div>
          <div style={bodyStyle}>
            Redeemer Organizations also have an offering Catalog to keep track of past offerings and the ability to
            issue new offerings for each Epoch.
          </div>
          <button onClick={exitTutorial} style={ghostButtonStyle}>
            Exit Tutorial
          </button>
        </div>
      );
    }

    if (tutorialStep === "box20") {
      return (
        <div style={cardStyle}>
          <div style={subtitleStyle}>Step 15</div>
          <div style={titleStyle}>Create Your Offering</div>
          <div style={bodyStyle}>
            For each offering, Redeemer organizations can name their offering, set the credit rate for that offering, or
            add any stipulations for redeeming that offer.
            {"\n\n"}Go ahead and name your offering and submit it to the catalog.
          </div>
          <button onClick={exitTutorial} style={ghostButtonStyle}>
            Exit Tutorial
          </button>
        </div>
      );
    }

    if (tutorialStep === "box21") {
      return (
        <div style={cardStyle}>
          <div style={subtitleStyle}>Step 16</div>
          <div style={titleStyle}>Commit and Lock</div>
          <div style={bodyStyle}>
            Once an offering is added to their catalog, Redeemer organizations can modify their offering before they
            commit it. Once a commitment is made, Redeemers agree to honor that offering until the end of the current
            Epoch.
            {"\n\n"}Go ahead and Commit the offering.
          </div>
          <button onClick={exitTutorial} style={ghostButtonStyle}>
            Exit Tutorial
          </button>
        </div>
      );
    }

    if (tutorialStep === "box22") {
      return (
        <div style={cardStyle}>
          <div style={subtitleStyle}>Step 17</div>
          <div style={titleStyle}>How QR Redemption Works</div>
          <div style={bodyStyle}>
            QR Codes are issued for each offering, and Redeemer organizations can present these QR codes near their
            Point-of-Sale systems. When a civic-participant scans the QR code, it calls the burn function for CITY for
            the amount offered, and the credits can then be redeemed for the offer.
          </div>
          <button onClick={exitTutorial} style={ghostButtonStyle}>
            Exit Tutorial
          </button>
        </div>
      );
    }

    if (tutorialStep === "intro") {
      return (
        <div style={cardStyle}>
          <div style={subtitleStyle}>Tutorial</div>
          <div style={titleStyle}>Welcome to the City/Sync Demo</div>
          <div style={bodyStyle}>{SHARED_TUTORIAL_INTRO_TEXT}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => {
                startDemoTutorialRunForAddress(address);
                persistTutorialStep("box1");
                setTutorialStep("box1");
                setRole("issuer");
                setDemoTutorialHandoff("issuer", "box1");
                router.push(withCurrentQuery("/demo/issuer"));
              }}
              style={primaryButtonStyle}
            >
              Lets Begin Tutorial
            </button>
          </div>
        </div>
      );
    }

    return null;
  })();
  const leftPanel = (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", gap: 12 }}>
      {tutorialCard}
      {openInfoCards.length > 0 ? (
        <LearnMorePanel keys={openInfoCards} cards={REDEEMER_LEARN_CARDS} onClose={closeLearnMore} accent={ACCENT} />
      ) : (
        <RailInfoPlaceholderCard>
          Use Learn More links in the app to load contextual cards in this panel.
        </RailInfoPlaceholderCard>
      )}
      {tutorialStep === "dismissed" && (
        <div
          style={{
            marginTop: "auto",
            paddingTop: 10,
            borderTop: "1px solid var(--cs-rail-border, rgba(31,45,86,0.12))",
          }}
        >
          <TutorialWalkthroughButton
            onClick={() => {
              persistTutorialStep("intro");
              setTutorialStep("intro");
            }}
          />
        </div>
      )}
    </div>
  );

  React.useEffect(() => {
    setRole("redeemer");
    // Intentional mount-only role selection; avoids reruns when callback identity updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(ISSUER_TUTORIAL_STEP_STORAGE_KEY, tutorialStep);
    } catch {
      // Ignore storage access failures.
    }
  }, [tutorialStep]);

  React.useEffect(() => {
    // Allow cross-role tutorial handoff steps (box23+). Only dismiss truly invalid values.
    if (REDEEMER_ROLE_TUTORIAL_STEPS.has(tutorialStep) || /^box\d+$/.test(tutorialStep)) return;
    setTutorialStep("dismissed");
  }, [tutorialStep]);

  // Auto-process queued redemptions after 3 s to simulate business fulfillment.
  const autoProcessTimers = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  React.useEffect(() => {
    redeemer.redemptionQueue.forEach(item => {
      if (!autoProcessTimers.current.has(item.id)) {
        const timer = setTimeout(() => {
          dispatch({ type: "REDEEMER_PROCESS_REDEMPTION", queueId: item.id });
          autoProcessTimers.current.delete(item.id);
        }, 3000);
        autoProcessTimers.current.set(item.id, timer);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redeemer.redemptionQueue]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const rawCommitted = window.localStorage.getItem(committedCatalogStorageKey);
      if (rawCommitted) {
        const parsed = JSON.parse(rawCommitted) as CustomOffering[];
        if (Array.isArray(parsed)) setCommittedCatalog(parsed);
      } else {
        setCommittedCatalog([]);
      }
      const rawMce = window.localStorage.getItem(mceCatalogStorageKey);
      if (rawMce) {
        const parsed = JSON.parse(rawMce) as MCECustomOffering[];
        if (Array.isArray(parsed)) setMceCatalog(parsed);
      } else {
        setMceCatalog([]);
      }

      const rawActiveCommitted = window.localStorage.getItem(activeCommittedStorageKey);
      if (rawActiveCommitted) {
        const parsed = JSON.parse(rawActiveCommitted) as CustomOffering[];
        if (Array.isArray(parsed)) setCommittedOfferings(parsed);
      } else {
        setCommittedOfferings([]);
      }

      const rawActiveMce = window.localStorage.getItem(activeMceStorageKey);
      if (rawActiveMce) {
        const parsed = JSON.parse(rawActiveMce) as MCECustomOffering[];
        if (Array.isArray(parsed)) setMceOfferings(parsed);
      } else {
        setMceOfferings([]);
      }
    } catch {
      // Ignore hydration failures.
    }
  }, [activeCommittedStorageKey, activeMceStorageKey, committedCatalogStorageKey, mceCatalogStorageKey]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(committedCatalogStorageKey, JSON.stringify(committedCatalog));
    } catch {
      // Ignore persistence failures.
    }
  }, [committedCatalog, committedCatalogStorageKey]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(mceCatalogStorageKey, JSON.stringify(mceCatalog));
    } catch {
      // Ignore persistence failures.
    }
  }, [mceCatalog, mceCatalogStorageKey]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(activeCommittedStorageKey, JSON.stringify(committedOfferings));
    } catch {
      // Ignore persistence failures.
    }
  }, [activeCommittedStorageKey, committedOfferings]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(activeMceStorageKey, JSON.stringify(mceOfferings));
    } catch {
      // Ignore persistence failures.
    }
  }, [activeMceStorageKey, mceOfferings]);

  const resolveOnchainOfferId = React.useCallback(
    (params: { name: string; stipulations: string; mceOnly: boolean; costCity?: number }) => {
      if (!address) return undefined;
      const owner = address.toLowerCase();

      const matchCandidates = (requireCost: boolean): string[] =>
        state.offers
          .filter(offer => {
            const parsed = parseOnchainOfferNumericId(offer.id);
            if (!parsed) return false;
            if ((offer.redeemerId ?? "").toLowerCase() !== owner) return false;
            if (Boolean(offer.mceOnly) !== params.mceOnly) return false;
            if (normalizeOfferText(offer.offerTitle) !== normalizeOfferText(params.name)) return false;
            if (!isSameStipulationText(offer.description || "", params.stipulations || "")) return false;
            if (requireCost && typeof params.costCity === "number" && offer.costCity !== params.costCity) return false;
            return true;
          })
          .map(offer => parseOnchainOfferNumericId(offer.id))
          .filter((id): id is string => Boolean(id));

      const exact = matchCandidates(true);
      if (exact.length > 0) return pickHighestNumericId(exact);

      const loose = matchCandidates(false);
      return pickHighestNumericId(loose);
    },
    [address, state.offers],
  );

  const toOnchainOfferKey = React.useCallback(
    (offerId: string | bigint | undefined | null) => {
      if (offerId === undefined || offerId === null) return null;
      const normalized = typeof offerId === "bigint" ? offerId.toString() : String(offerId).trim();
      if (!normalized) return null;
      return `onchain:${normalizedAddress}:${normalized}`;
    },
    [normalizedAddress],
  );

  React.useEffect(() => {
    setCommittedOfferings(prev => {
      let changed = false;
      const next = prev.map(existing => {
        let catalogId = existing.catalogId;
        if (!catalogId) {
          const candidates = committedCatalog.filter(
            item =>
              normalizeOfferText(item.name) === normalizeOfferText(existing.name) &&
              isSameStipulationText(item.stipulations || "", existing.stipulations || ""),
          );
          if (candidates.length === 1) {
            catalogId = candidates[0].id;
          }
        }

        const normalizedOnchainId = parseOnchainOfferNumericId(existing.onchainOfferId ?? undefined);
        const onchainOfferId =
          normalizedOnchainId ??
          resolveOnchainOfferId({
            name: existing.name,
            stipulations: existing.stipulations,
            mceOnly: false,
            costCity: existing.costCity,
          });

        const didChange = catalogId !== existing.catalogId || onchainOfferId !== existing.onchainOfferId;
        if (didChange) {
          changed = true;
          return { ...existing, catalogId, onchainOfferId };
        }
        return existing;
      });
      return changed ? next : prev;
    });

    setMceOfferings(prev => {
      let changed = false;
      const next = prev.map(existing => {
        let catalogId = existing.catalogId;
        if (!catalogId) {
          const candidates = mceCatalog.filter(
            item =>
              normalizeOfferText(item.name) === normalizeOfferText(existing.name) &&
              isSameStipulationText(item.stipulations || "", existing.stipulations || "") &&
              normalizeMceIds(item.mceIds || []) === normalizeMceIds(existing.mceIds || []),
          );
          if (candidates.length === 1) {
            catalogId = candidates[0].id;
          }
        }

        const normalizedOnchainId = parseOnchainOfferNumericId(existing.onchainOfferId ?? undefined);
        const onchainOfferId =
          normalizedOnchainId ??
          resolveOnchainOfferId({
            name: existing.name,
            stipulations: existing.stipulations,
            mceOnly: true,
            costCity: existing.costCity,
          });

        const didChange = catalogId !== existing.catalogId || onchainOfferId !== existing.onchainOfferId;
        if (didChange) {
          changed = true;
          return { ...existing, catalogId, onchainOfferId };
        }
        return existing;
      });
      return changed ? next : prev;
    });
  }, [committedCatalog, mceCatalog, resolveOnchainOfferId]);

  const handleCreateCommittedOffering = async (data: { name: string; costCity: number; stipulations: string }) => {
    const catalogId = catalogEditor?.type === "committed" ? catalogEditor.editId : undefined;
    const catalogItem: CustomOffering = {
      id: catalogId ?? `committed-catalog-${Date.now()}`,
      name: data.name,
      costCity: data.costCity,
      stipulations: data.stipulations,
      createdAt: new Date().toISOString(),
    };
    setCommittedCatalog(prev => {
      if (!catalogId) return [catalogItem, ...prev];
      return prev.map(item => (item.id === catalogId ? { ...item, ...catalogItem } : item));
    });
    setCatalogEditor(null);
    if (tutorialStep === "box20") {
      setTutorialCatalogOfferingId(catalogItem.id);
      setTutorialStep("box21");
    }
    setToast(catalogId ? "Committed offering updated in catalog." : "Committed offering added to catalog.");
  };

  const handleIssueCommittedFromCatalog = async (catalogId: string) => {
    if (!canCommitOnchain) {
      setOfferWriteStatus({ state: "failed", error: "Wallet session not ready. Please wait and try again." });
      setToast("Wallet not ready yet. Wait 2-3 seconds and try Commit again.");
      return;
    }

    const template = committedCatalog.find(item => item.id === catalogId);
    if (!template) return;

    const existingOffering =
      committedOfferings.find(existing => existing.catalogId === catalogId) ??
      committedOfferings.find(
        existing =>
          normalizeOfferText(existing.name) === normalizeOfferText(template.name) &&
          isSameStipulationText(existing.stipulations || "", template.stipulations || ""),
      );

    if (existingOffering) {
      if (existingOffering.costCity === template.costCity) {
        const message = "This offering is already committed with the same rate/state.";
        setOfferWriteStatus({ state: "failed", error: message });
        setToast("Already committed. Modify rate to commit a new offering state.");
        return;
      }

      const resolvedOnchainOfferId =
        existingOffering.onchainOfferId ??
        resolveOnchainOfferId({
          name: existingOffering.name,
          stipulations: existingOffering.stipulations,
          mceOnly: false,
          costCity: existingOffering.costCity,
        });

      if (!resolvedOnchainOfferId) {
        const message = "Active offering exists, but its onchain offer ID could not be resolved.";
        setOfferWriteStatus({ state: "failed", error: message });
        setToast("Unable to update rate in place. Recommit after onchain sync finishes.");
        return;
      }

      setOfferWriteStatus({ state: "pending" });
      const result = await redeemerUpdateOfferRate(BigInt(resolvedOnchainOfferId), template.costCity);
      if (result.ok) {
        setCommittedOfferings(prev =>
          prev.map(existing =>
            existing.id === existingOffering.id
              ? {
                  ...existing,
                  costCity: template.costCity,
                  catalogId,
                  onchainOfferId: resolvedOnchainOfferId,
                }
              : existing,
          ),
        );
        setTutorialActiveOfferingId(existingOffering.id);
        const tutorialOfferKey = toOnchainOfferKey(resolvedOnchainOfferId);
        if (tutorialOfferKey) appendDemoTutorialOfferingIds([tutorialOfferKey]);
        setOfferWriteStatus({ state: "confirmed", hash: result.hash });
      } else {
        setOfferWriteStatus({ state: "failed", error: result.error });
      }
      return;
    }

    const onchainOffer: RedemptionOffer = {
      id: `offer-${Date.now()}`,
      redeemerName: redeemer.orgName || "Redeemer",
      redeemerId: address ?? FAKE_WALLETS.redeemer,
      offerTitle: template.name,
      description: template.stipulations || "No additional stipulations",
      costCity: template.costCity,
      acceptsMCE: redeemer.acceptsMCE,
      mceOnly: false,
      category: "Essentials",
      emoji: "🏪",
    };

    setOfferWriteStatus({ state: "pending" });
    const result = await redeemerAddOffer(onchainOffer);
    if (result.ok) {
      const resolvedOnchainOfferId = result.offerId?.toString();
      const offering: CustomOffering = {
        id: `committed-${Date.now()}`,
        name: template.name,
        costCity: template.costCity,
        stipulations: template.stipulations,
        createdAt: new Date().toISOString(),
        catalogId,
        onchainOfferId: resolvedOnchainOfferId,
      };
      setCommittedOfferings(prev => [offering, ...prev]);
      setTutorialActiveOfferingId(offering.id);
      const tutorialOfferKey = toOnchainOfferKey(resolvedOnchainOfferId);
      if (tutorialOfferKey) appendDemoTutorialOfferingIds([tutorialOfferKey]);
      setOfferWriteStatus({ state: "confirmed", hash: result.hash });
    } else {
      setOfferWriteStatus({ state: "failed", error: result.error });
    }
  };

  const handleCreateMCEOffering = async (data: {
    name: string;
    costCity: number;
    stipulations: string;
    mceIds: string[];
    mceNames: string[];
  }) => {
    const catalogId = catalogEditor?.type === "mce" ? catalogEditor.editId : undefined;
    const catalogItem: MCECustomOffering = {
      id: catalogId ?? `mce-catalog-${Date.now()}`,
      name: data.name,
      costCity: data.costCity,
      stipulations: data.stipulations,
      mceIds: data.mceIds,
      mceNames: data.mceNames,
      createdAt: new Date().toISOString(),
    };
    setMceCatalog(prev => {
      if (!catalogId) return [catalogItem, ...prev];
      return prev.map(item => (item.id === catalogId ? { ...item, ...catalogItem } : item));
    });
    setCatalogEditor(null);
    setToast(catalogId ? "MCE offering updated in catalog." : "MCE offering added to catalog.");
  };

  const handleIssueMceFromCatalog = async (catalogId: string) => {
    if (!canCommitOnchain) {
      setOfferWriteStatus({ state: "failed", error: "Wallet session not ready. Please wait and try again." });
      setToast("Wallet not ready yet. Wait 2-3 seconds and try Commit again.");
      return;
    }

    const template = mceCatalog.find(item => item.id === catalogId);
    if (!template) return;

    const existingOffering =
      mceOfferings.find(existing => existing.catalogId === catalogId) ??
      mceOfferings.find(
        existing =>
          normalizeOfferText(existing.name) === normalizeOfferText(template.name) &&
          isSameStipulationText(existing.stipulations || "", template.stipulations || "") &&
          normalizeMceIds(existing.mceIds || []) === normalizeMceIds(template.mceIds || []),
      );

    if (existingOffering) {
      if (existingOffering.costCity === template.costCity) {
        const message = "This MCE offering is already committed with the same rate/state.";
        setOfferWriteStatus({ state: "failed", error: message });
        setToast("Already committed. Modify rate to commit a new MCE offering state.");
        return;
      }

      const resolvedOnchainOfferId =
        existingOffering.onchainOfferId ??
        resolveOnchainOfferId({
          name: existingOffering.name,
          stipulations: existingOffering.stipulations,
          mceOnly: true,
          costCity: existingOffering.costCity,
        });

      if (!resolvedOnchainOfferId) {
        const message = "Active MCE offering exists, but its onchain offer ID could not be resolved.";
        setOfferWriteStatus({ state: "failed", error: message });
        setToast("Unable to update MCE rate in place. Recommit after onchain sync finishes.");
        return;
      }

      setOfferWriteStatus({ state: "pending" });
      const result = await redeemerUpdateOfferRate(BigInt(resolvedOnchainOfferId), template.costCity);
      if (result.ok) {
        setMceOfferings(prev =>
          prev.map(existing =>
            existing.id === existingOffering.id
              ? {
                  ...existing,
                  costCity: template.costCity,
                  catalogId,
                  onchainOfferId: resolvedOnchainOfferId,
                }
              : existing,
          ),
        );
        setOfferWriteStatus({ state: "confirmed", hash: result.hash });
      } else {
        setOfferWriteStatus({ state: "failed", error: result.error });
      }
      return;
    }

    const onchainOffer: RedemptionOffer = {
      id: `offer-${Date.now()}`,
      redeemerName: redeemer.orgName || "Redeemer",
      redeemerId: address ?? FAKE_WALLETS.redeemer,
      offerTitle: template.name,
      description: template.stipulations || "No additional stipulations",
      costCity: template.costCity,
      acceptsMCE: true,
      mceOnly: true,
      category: "Culture",
      emoji: "🏆",
    };

    setOfferWriteStatus({ state: "pending" });
    const result = await redeemerAddOffer(onchainOffer);
    if (result.ok) {
      const offering: MCECustomOffering = {
        id: `mce-offering-${Date.now()}`,
        name: template.name,
        costCity: template.costCity,
        stipulations: template.stipulations,
        mceIds: template.mceIds,
        mceNames: template.mceNames,
        createdAt: new Date().toISOString(),
        catalogId,
        onchainOfferId: result.offerId?.toString(),
      };
      setMceOfferings(prev => [offering, ...prev]);
      setOfferWriteStatus({ state: "confirmed", hash: result.hash });
    } else {
      setOfferWriteStatus({ state: "failed", error: result.error });
    }
  };

  const handleCreatePost = (post: Post) => {
    setLocalPosts(prev => [post, ...prev]);
    setComposeOpen(false);
    setToast("Post published to MyCity!");
  };

  return (
    <>
      <AppShell
        role="redeemer"
        orgName={redeemer.orgName}
        address={address ?? FAKE_WALLETS.redeemer}
        cityBalance={state.participant.cityBalance}
        voteBalance={0}
        mceBalance={0}
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={tab => {
          setActiveTab(tab);
          clearLearnMore();
        }}
        accentColor={ACCENT}
        title="Redeemer"
        leftPanel={rightPanel}
        rightPanel={leftPanel}
        showLeftPanel={!hideShellPanels}
        showRightPanel={!hideShellPanels}
        phoneFrame
        tutorialLocked={tutorialLockActive}
      >
        {activeTab === "profile" && (
          <ProfileTab
            redeemer={redeemer}
            dispatch={dispatch}
            committedOfferings={committedOfferings}
            mceOfferings={mceOfferings}
            onLearnMore={openLearnMore}
          />
        )}
        {activeTab === "offerings" && (
          <OfferingsTab
            committedOfferings={committedOfferings}
            mceOfferings={mceOfferings}
            committedCatalog={committedCatalog}
            mceCatalog={mceCatalog}
            onCommitFromCatalogCommitted={handleIssueCommittedFromCatalog}
            onCommitFromCatalogMCE={handleIssueMceFromCatalog}
            onAddCommitted={() => {
              setCatalogEditor({ type: "committed" });
              if (tutorialStep === "box19") setTutorialStep("box20");
            }}
            onAddMCE={() => setCatalogEditor({ type: "mce" })}
            onModifyCommitted={catalogId => setCatalogEditor({ type: "committed", editId: catalogId })}
            onModifyMCE={catalogId => setCatalogEditor({ type: "mce", editId: catalogId })}
            onShowQR={data => {
              if (tutorialStep === "box21" && tutorialActiveOfferingId && data.id === tutorialActiveOfferingId) {
                setTutorialStep("box22");
              }
              setQrTarget(data);
            }}
            onRemoveAttempt={id => setRemoveTarget(id)}
            orgName={redeemer.orgName}
            offerWriteStatus={offerWriteStatus}
            onDismissOfferWrite={() => setOfferWriteStatus({ state: "idle" })}
            onLearnMore={openLearnMore}
            tutorialStep={tutorialStep}
            tutorialCatalogOfferingId={tutorialCatalogOfferingId}
            tutorialActiveOfferingId={tutorialActiveOfferingId}
            onTutorialStepChange={setTutorialStep}
          />
        )}
        {activeTab === "community" && (
          <CommunityTab
            posts={allPosts}
            orgName={redeemer.orgName}
            state={state}
            onCompose={() => setComposeOpen(true)}
            onLearnMore={openLearnMore}
          />
        )}
        {catalogEditor?.type === "committed" && (
          <AddOfferingSheet
            type="committed"
            mces={mces}
            onClose={() => setCatalogEditor(null)}
            onSubmitCommitted={handleCreateCommittedOffering}
            onSubmitMCE={handleCreateMCEOffering}
            tutorialLockCost={tutorialStep === "box20" && !catalogEditor.editId ? 10 : undefined}
            tutorialAllowSubmit={tutorialStep === "box20"}
            initialCommitted={
              catalogEditor.editId ? (committedCatalog.find(item => item.id === catalogEditor.editId) ?? null) : null
            }
          />
        )}
        {catalogEditor?.type === "mce" && (
          <AddOfferingSheet
            type="mce"
            mces={mces}
            onClose={() => setCatalogEditor(null)}
            onSubmitCommitted={handleCreateCommittedOffering}
            onSubmitMCE={handleCreateMCEOffering}
            initialMCE={
              catalogEditor.editId ? (mceCatalog.find(item => item.id === catalogEditor.editId) ?? null) : null
            }
          />
        )}

        {catalogIssueSheet === "committed" && (
          <IssueOfferingFromCatalogSheet
            type="committed"
            committedCatalog={committedCatalog}
            mceCatalog={mceCatalog}
            canCommitOnchain={canCommitOnchain}
            onIssueCommitted={handleIssueCommittedFromCatalog}
            onIssueMCE={handleIssueMceFromCatalog}
            onModifyCommitted={catalogId => setCatalogEditor({ type: "committed", editId: catalogId })}
            onModifyMCE={catalogId => setCatalogEditor({ type: "mce", editId: catalogId })}
            onClose={() => setCatalogIssueSheet(null)}
          />
        )}
        {catalogIssueSheet === "mce" && (
          <IssueOfferingFromCatalogSheet
            type="mce"
            committedCatalog={committedCatalog}
            mceCatalog={mceCatalog}
            canCommitOnchain={canCommitOnchain}
            onIssueCommitted={handleIssueCommittedFromCatalog}
            onIssueMCE={handleIssueMceFromCatalog}
            onModifyCommitted={catalogId => setCatalogEditor({ type: "committed", editId: catalogId })}
            onModifyMCE={catalogId => setCatalogEditor({ type: "mce", editId: catalogId })}
            onClose={() => setCatalogIssueSheet(null)}
          />
        )}

        {qrTarget && (
          <QRModal
            offering={qrTarget}
            tutorialAllowDone={tutorialStep === "box22"}
            onClose={() => {
              setQrTarget(null);
              if (tutorialStep === "box22") {
                setRole("participant");
                setTutorialStep("box23");
                persistTutorialStep("box23");
                setDemoTutorialHandoff("participant", "box23");
                router.push(withCurrentQuery("/demo/participant"));
              }
            }}
          />
        )}

        {removeTarget && (
          <ConfirmDialog
            title="Committed Offering Locked"
            message="This is a Committed Offering. It cannot be removed until the end of the current Epoch. All modifications to offerings and rates must occur after the Epoch ends or after the expiration of your offer."
            confirmLabel="Got it"
            onConfirm={() => setRemoveTarget(null)}
            onCancel={() => setRemoveTarget(null)}
            warningOnly
          />
        )}

        {composeOpen && (
          <ComposePostSheet
            orgName={redeemer.orgName}
            onClose={() => setComposeOpen(false)}
            onPost={handleCreatePost}
          />
        )}
      </AppShell>

      {toast && (
        <DemoToast
          message={toast}
          accentColor={ACCENT}
          borderColor={BORDER}
          strongTextColor={TEXT_STRONG}
          dimTextColor={TEXT_DIMMED}
          shadow={SHADOW}
          onDismiss={() => setToast(null)}
        />
      )}
    </>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab({
  redeemer,
  dispatch,
  committedOfferings,
  mceOfferings,
  onLearnMore,
}: {
  redeemer: ReturnType<typeof useDemo>["state"]["redeemer"];
  dispatch: ReturnType<typeof useDemo>["dispatch"];
  committedOfferings: CustomOffering[];
  mceOfferings: MCECustomOffering[];
  onLearnMore: (selection: RedeemerLearnMoreSelection) => void;
}) {
  const { address: connectedAddress } = useAccount({ type: "ModularAccountV2" });
  const redeemerAddress = connectedAddress ?? FAKE_WALLETS.redeemer;
  const shortRedeemerAddress = `${redeemerAddress.slice(0, 8)}...${redeemerAddress.slice(-6)}`;
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [section, setSection] = useState<"profile" | "dashboard">("profile");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(redeemer.orgName);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logoStorageKey = `citysync:demo:profile:photo:redeemer:v1:${redeemerAddress.toLowerCase()}`;
  const nameStorageKey = `citysync:demo:redeemer:name:v1:${redeemerAddress.toLowerCase()}`;

  // Venue info editable fields
  const [venueAddress, setVenueAddress] = useState("123 Main Street, Oakland, CA 94601");
  const [venuePhone, setVenuePhone] = useState("(510) 555-0198");
  const [venueWebsite, setVenueWebsite] = useState("https://yourvenuesite.com");
  const [editingVenue, setEditingVenue] = useState(false);
  const [draftAddress, setDraftAddress] = useState(venueAddress);
  const [draftPhone, setDraftPhone] = useState(venuePhone);
  const [draftWebsite, setDraftWebsite] = useState(venueWebsite);

  const startVenueEdit = () => {
    setDraftAddress(venueAddress);
    setDraftPhone(venuePhone);
    setDraftWebsite(venueWebsite);
    setEditingVenue(true);
  };

  const saveVenueEdit = () => {
    setVenueAddress(draftAddress.trim() || venueAddress);
    setVenuePhone(draftPhone.trim() || venuePhone);
    setVenueWebsite(draftWebsite.trim() || venueWebsite);
    setEditingVenue(false);
  };

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

  // Hydrate org name from localStorage on mount (works even without wallet connection).
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem(nameStorageKey);
      if (saved && saved !== redeemer.orgName) {
        dispatch({ type: "REDEEMER_REGISTER", orgName: saved });
        setDraft(saved);
      }
    } catch {
      // Ignore hydration failures.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameStorageKey]);

  // Persist org name across reloads/sessions for this wallet.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!redeemer.orgName?.trim()) return;
    try {
      window.localStorage.setItem(nameStorageKey, redeemer.orgName.trim());
    } catch {
      // Ignore persistence failures.
    }
  }, [nameStorageKey, redeemer.orgName]);

  const startEdit = () => {
    setDraft(redeemer.orgName);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const saveEdit = () => {
    if (draft.trim()) {
      dispatch({ type: "REDEEMER_REGISTER", orgName: draft.trim() });
      try {
        window.localStorage.setItem(nameStorageKey, draft.trim());
      } catch {
        // Ignore persistence failures.
      }
    }
    setEditing(false);
  };

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      {/* Profile / Dashboard segment toggle */}
      <div
        style={{
          display: "flex",
          background: CONTROL_SURFACE,
          border: `1px solid ${CONTROL_BORDER}`,
          borderRadius: 10,
          padding: 4,
          marginBottom: 20,
        }}
      >
        {(
          [
            { key: "profile" as const, label: "Profile" },
            { key: "dashboard" as const, label: "Dashboard" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSection(key)}
            style={{
              flex: 1,
              border: "none",
              borderRadius: 8,
              padding: "9px 0",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              background: section === key ? BRAND_BLUE : "transparent",
              color: section === key ? "#fff" : MUTED,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {section === "dashboard" && (
        <DashboardTab
          redeemer={redeemer}
          committedOfferings={committedOfferings}
          mceOfferings={mceOfferings}
          onLearnMore={onLearnMore}
        />
      )}

      {section === "profile" && (
        <>
          {/* Welcome banner */}
          <div
            style={{
              background: "linear-gradient(135deg, #001a14 0%, #1E1E2C 100%)",
              border: "1px solid rgba(52,238,182,0.25)",
              borderRadius: 20,
              padding: "20px",
              marginBottom: 20,
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
                  color: "rgba(52,238,182,0.6)",
                  whiteSpace: "nowrap",
                }}
              >
                Certified Redeemer Organization
              </div>
              <LearnMoreLink onClick={() => onLearnMore("profile-overview")} />
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
                    border: "1px solid rgba(52,238,182,0.5)",
                    borderRadius: 8,
                    color: "var(--cs-text-strong, #fff)",
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
                  style={{ display: "none" }}
                  onChange={handleLogoChange}
                />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  title="Upload organization logo"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: logoUrl ? "transparent" : "rgba(52,238,182,0.1)",
                    border: `1px dashed ${logoUrl ? "transparent" : "rgba(52,238,182,0.4)"}`,
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
                    <Image
                      src={logoUrl}
                      alt="Logo"
                      width={44}
                      height={44}
                      unoptimized
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span style={{ fontSize: 20 }}>🏪</span>
                  )}
                </button>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "var(--cs-text-strong, #fff)" }}>
                      {redeemer.orgName || "Your Venue"}
                    </div>
                    <button
                      onClick={startEdit}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: MUTED,
                        padding: 4,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <IconPencil />
                    </button>
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(52,238,182,0.5)", marginTop: 1 }}>
                    Tap icon to upload logo
                  </div>
                </div>
              </div>
            )}

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
              <span>{shortRedeemerAddress}</span>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(redeemerAddress);
                    setCopiedAddress(true);
                    window.setTimeout(() => setCopiedAddress(false), 1200);
                  } catch {
                    /* ignore */
                  }
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: copiedAddress ? BRAND_BLUE : DIMMED,
                  cursor: "pointer",
                  fontSize: 13,
                  padding: "0 2px",
                  lineHeight: 1,
                }}
                title="Copy address"
              >
                {copiedAddress ? "✓" : "⧉"}
              </button>
              <a
                href={`https://sepolia.basescan.org/address/${redeemerAddress}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: BRAND_BLUE, textDecoration: "none", fontSize: 11 }}
              >
                View Account ↗
              </a>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <StatusPill label="Registered Redeemer" color={BRAND_BLUE} />
            </div>
          </div>

          {/* Role description */}
          <div
            style={{
              background: "rgba(52,238,182,0.05)",
              border: "1px solid rgba(52,238,182,0.12)",
              borderRadius: 14,
              padding: "14px 16px",
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cs-text-strong, #fff)", marginBottom: 4 }}>
              Your Role as a Redeemer
            </div>
            <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, margin: 0 }}>
              Accept CITYx credits from civic participants in exchange for goods and services. Create committed
              offerings for the current Epoch and MCE-linked offerings for city events. Generate QR codes for in-person
              redemption.
            </p>
          </div>

          {/* Venue Information */}
          <SectionLabel
            text="Venue Information"
            accentColor={ACCENT_BLUE}
            right={
              !editingVenue ? (
                <button
                  onClick={startVenueEdit}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: MUTED,
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <IconPencil />
                </button>
              ) : undefined
            }
          />
          <div
            style={{
              ...surfaceCard,
              marginBottom: 20,
            }}
          >
            {editingVenue ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  {
                    label: "Address",
                    value: draftAddress,
                    setter: setDraftAddress,
                    placeholder: "Street, City, State ZIP",
                  },
                  { label: "Phone Number", value: draftPhone, setter: setDraftPhone, placeholder: "(555) 555-5555" },
                  {
                    label: "Website",
                    value: draftWebsite,
                    setter: setDraftWebsite,
                    placeholder: "https://yoursite.com",
                  },
                ].map(field => (
                  <div key={field.label}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, marginBottom: 4 }}>{field.label}</div>
                    <input
                      value={field.value}
                      onChange={e => field.setter(e.target.value)}
                      placeholder={field.placeholder}
                      style={{
                        width: "100%",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(52,238,182,0.4)",
                        borderRadius: 8,
                        color: "var(--cs-text-strong, #fff)",
                        fontSize: 13,
                        padding: "8px 10px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button
                    onClick={saveVenueEdit}
                    style={{
                      flex: 1,
                      background: ACCENT,
                      border: "none",
                      borderRadius: 10,
                      padding: "9px 0",
                      fontSize: 13,
                      fontWeight: 700,
                      color: BG,
                      cursor: "pointer",
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingVenue(false)}
                    style={{
                      flex: 1,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid var(--cs-border, rgba(255,255,255,0.1))",
                      borderRadius: 10,
                      padding: "9px 0",
                      fontSize: 13,
                      fontWeight: 600,
                      color: MUTED,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Address", value: venueAddress },
                  { label: "Phone Number", value: venuePhone },
                  { label: "Website", value: venueWebsite },
                ].map((row, i) => (
                  <div
                    key={row.label}
                    style={{
                      ...(i > 0 ? { borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10 } : {}),
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <span style={{ fontSize: 13, color: MUTED, flexShrink: 0 }}>{row.label}</span>
                    <span
                      style={{
                        fontSize: 13,
                        color: DIMMED,
                        textAlign: "right",
                        wordBreak: "break-all",
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Offerings Tab ─────────────────────────────────────────────────────────────

function OfferingsTab({
  committedOfferings,
  mceOfferings,
  committedCatalog,
  mceCatalog,
  onCommitFromCatalogCommitted,
  onCommitFromCatalogMCE,
  onAddCommitted,
  onAddMCE,
  onModifyCommitted,
  onModifyMCE,
  onShowQR,
  onRemoveAttempt,
  orgName,
  offerWriteStatus,
  onDismissOfferWrite,
  onLearnMore,
  tutorialStep,
  tutorialCatalogOfferingId,
  tutorialActiveOfferingId,
  onTutorialStepChange,
}: {
  committedOfferings: CustomOffering[];
  mceOfferings: MCECustomOffering[];
  committedCatalog: CustomOffering[];
  mceCatalog: MCECustomOffering[];
  onCommitFromCatalogCommitted: (catalogId: string) => void;
  onCommitFromCatalogMCE: (catalogId: string) => void;
  onAddCommitted: () => void;
  onAddMCE: () => void;
  onModifyCommitted: (catalogId: string) => void;
  onModifyMCE: (catalogId: string) => void;
  onShowQR: (data: QROfferingData) => void;
  onRemoveAttempt: (id: string) => void;
  orgName: string;
  offerWriteStatus: OfferWriteStatus;
  onDismissOfferWrite: () => void;
  onLearnMore: (selection: RedeemerLearnMoreSelection) => void;
  tutorialStep: IssuerTutorialStep;
  tutorialCatalogOfferingId: string | null;
  tutorialActiveOfferingId: string | null;
  onTutorialStepChange: (step: IssuerTutorialStep) => void;
}) {
  const [view, setView] = useState<"committed" | "mce">("committed");
  const [showActiveCommitted, setShowActiveCommitted] = useState(false);
  const [showActiveMce, setShowActiveMce] = useState(false);
  const [pendingCommittedCatalogCommitId, setPendingCommittedCatalogCommitId] = useState<string | null>(null);
  const [pendingMceCatalogCommitId, setPendingMceCatalogCommitId] = useState<string | null>(null);
  const explorerHref = offerWriteStatus.hash ? `https://sepolia.basescan.org/tx/${offerWriteStatus.hash}` : null;

  useEffect(() => {
    if (tutorialStep !== "box21") return;
    if (offerWriteStatus.state === "confirmed") {
      setShowActiveCommitted(true);
      onTutorialStepChange("box22");
    }
  }, [offerWriteStatus.state, onTutorialStepChange, tutorialStep]);

  useEffect(() => {
    if (tutorialStep !== "box21" && tutorialStep !== "box22") return;
    if (!showActiveCommitted) return;
    const timer = window.setTimeout(() => {
      const target = document.querySelector<HTMLButtonElement>('[data-tutorial-show-qr="true"]');
      target?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 140);
    return () => window.clearTimeout(timer);
  }, [committedOfferings.length, showActiveCommitted, tutorialActiveOfferingId, tutorialStep]);

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <style>{`
        @keyframes tutorialRadiantTasks {
          0%, 100% { box-shadow: 0 0 0 1px rgba(255,226,162,0.28), 0 0 10px rgba(221,158,51,0.26); }
          50% { box-shadow: 0 0 0 1px rgba(255,226,162,0.6), 0 0 18px rgba(221,158,51,0.5); }
        }
      `}</style>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <LearnMoreLink
          onClick={() =>
            onLearnMore(view === "mce" ? ["offerings-commitment", "offerings-mce"] : "offerings-commitment")
          }
        />
      </div>
      {/* Segment control */}
      <div style={{ background: SURFACE, borderRadius: 16, display: "flex", marginBottom: 20, overflow: "hidden" }}>
        {(
          [
            { key: "committed", label: `Committed (${committedOfferings.length})` },
            { key: "mce", label: `MCE (${mceOfferings.length})` },
          ] as const
        ).map(({ key, label }, i) => (
          <button
            key={key}
            onClick={() => setView(key)}
            style={{
              flex: 1,
              border: "none",
              borderRadius: i === 0 ? "16px 0 0 16px" : "0 16px 16px 0",
              padding: "9px 0",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              background: view === key ? BRAND_BLUE : "transparent",
              color: view === key ? "#fff" : MUTED,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {offerWriteStatus.state !== "idle" && (
        <div
          style={{
            ...surfaceCard,
            position: "relative",
            marginBottom: 16,
            border:
              offerWriteStatus.state === "confirmed"
                ? "1px solid rgba(52,238,182,0.35)"
                : offerWriteStatus.state === "failed"
                  ? "1px solid rgba(255,107,157,0.35)"
                  : "1px solid rgba(65,105,225,0.35)",
            background:
              offerWriteStatus.state === "confirmed"
                ? "rgba(52,238,182,0.08)"
                : offerWriteStatus.state === "failed"
                  ? "rgba(255,107,157,0.08)"
                  : "rgba(65,105,225,0.08)",
          }}
        >
          <div style={{ fontSize: 11, color: MUTED, marginBottom: 6 }}>Last Offer Write</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--cs-text-strong, #fff)", marginBottom: 6 }}>
            {offerWriteStatus.state === "pending" && "Pending wallet/user-op confirmation..."}
            {offerWriteStatus.state === "confirmed" && "Confirmed onchain"}
            {offerWriteStatus.state === "failed" && "Failed onchain"}
          </div>
          {offerWriteStatus.error && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>
              {offerWriteStatus.error}
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
            onClick={() => onDismissOfferWrite()}
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

      {/* ── Committed Offerings ── */}
      {view === "committed" && (
        <>
          <button
            data-tutorial-allow={tutorialStep === "box19" ? "true" : undefined}
            onClick={onAddCommitted}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background:
                tutorialStep === "box19"
                  ? "linear-gradient(145deg, rgba(255,226,162,0.22), rgba(221,158,51,0.16))"
                  : "rgba(52,238,182,0.08)",
              border:
                tutorialStep === "box19" ? "1px solid rgba(255,226,162,0.85)" : "1px dashed rgba(52,238,182,0.35)",
              borderRadius: 14,
              padding: "14px 0",
              fontSize: 13,
              fontWeight: 600,
              color: tutorialStep === "box19" ? "#ffe2a2" : ACCENT,
              cursor: "pointer",
              marginBottom: 16,
              boxShadow:
                tutorialStep === "box19"
                  ? "0 0 0 1px rgba(255,226,162,0.35), 0 0 14px rgba(221,158,51,0.42)"
                  : undefined,
              animation: tutorialStep === "box19" ? "tutorialRadiantTasks 1.55s ease-in-out infinite" : undefined,
            }}
          >
            <IconPlus /> Add Offering to Catalog
          </button>

          <SectionLabel text={`Offering Catalog (${committedCatalog.length})`} accentColor={ACCENT_PURPLE} />

          {committedCatalog.length === 0 ? (
            <EmptyState
              emoji="📚"
              title="No offerings in catalog yet"
              desc="Add an offering to catalog, then commit it onchain."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {committedCatalog.map(item => {
                const tutorialTargetCatalogId = tutorialCatalogOfferingId ?? committedCatalog[0]?.id ?? null;
                const shouldHighlightCatalogCommit = tutorialStep === "box21" && tutorialTargetCatalogId === item.id;
                const committedForCatalog =
                  committedOfferings.find(existing => existing.catalogId === item.id) ??
                  committedOfferings.find(
                    existing =>
                      normalizeOfferText(existing.name) === normalizeOfferText(item.name) &&
                      isSameStipulationText(existing.stipulations || "", item.stipulations || ""),
                  );
                const duplicateCommittedState = committedForCatalog
                  ? committedForCatalog.costCity === item.costCity
                  : committedOfferings.some(existing => isSameCommittedOfferState(existing, item));
                const commitLabel = committedForCatalog
                  ? duplicateCommittedState
                    ? "Already Committed"
                    : "Update Rate"
                  : duplicateCommittedState
                    ? "Already Committed"
                    : "Commit Offering";
                return (
                  <div
                    key={item.id}
                    style={{
                      ...accentCard,
                      border: "1px solid rgba(52,238,182,0.2)",
                      background: "rgba(52,238,182,0.04)",
                    }}
                  >
                    <div
                      style={{ fontSize: 14, fontWeight: 700, color: "var(--cs-text-strong, #fff)", marginBottom: 4 }}
                    >
                      {item.name}
                    </div>
                    {item.stipulations && (
                      <div style={{ fontSize: 11, color: DIMMED, marginBottom: 6, lineHeight: 1.45 }}>
                        {item.stipulations}
                      </div>
                    )}
                    <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT, marginBottom: 8 }}>
                      {item.costCity} CITYx
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
                      <button
                        onClick={() => onModifyCommitted(item.id)}
                        style={{
                          background: SURFACE_SOFT,
                          border: `1px solid ${CONTROL_BORDER}`,
                          borderRadius: 10,
                          padding: "8px 12px",
                          fontSize: 12,
                          fontWeight: 700,
                          color: TEXT_STRONG,
                          cursor: "pointer",
                        }}
                      >
                        Modify Offering
                      </button>
                      <button
                        onClick={() => setPendingCommittedCatalogCommitId(item.id)}
                        data-tutorial-allow={
                          !duplicateCommittedState && shouldHighlightCatalogCommit ? "true" : undefined
                        }
                        disabled={duplicateCommittedState}
                        style={{
                          background: duplicateCommittedState
                            ? CONTROL_ACTIVE
                            : shouldHighlightCatalogCommit
                              ? "linear-gradient(145deg, rgba(221,158,51,0.95), rgba(221,158,51,0.78))"
                              : ACCENT,
                          border: "none",
                          borderRadius: 10,
                          padding: "8px 12px",
                          fontSize: 12,
                          fontWeight: 700,
                          color: duplicateCommittedState ? MUTED : BG,
                          cursor: duplicateCommittedState ? "not-allowed" : "pointer",
                          boxShadow:
                            !duplicateCommittedState && shouldHighlightCatalogCommit
                              ? "0 0 0 1px rgba(255,226,162,0.4), 0 0 14px rgba(221,158,51,0.48)"
                              : undefined,
                          animation:
                            !duplicateCommittedState && shouldHighlightCatalogCommit
                              ? "tutorialRadiantTasks 1.55s ease-in-out infinite"
                              : undefined,
                        }}
                        title={duplicateCommittedState ? "Already committed with the same rate/state" : undefined}
                      >
                        {commitLabel}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={() => setShowActiveCommitted(prev => !prev)}
            style={{
              width: "100%",
              marginBottom: 12,
              background: SURFACE_SOFT,
              border: `1px solid ${CONTROL_BORDER}`,
              borderRadius: 10,
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              color: TEXT_STRONG,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700 }}>
              Active Committed Offerings ({committedOfferings.length})
            </span>
            <span style={{ fontSize: 14, color: MUTED }}>{showActiveCommitted ? "▾" : "▸"}</span>
          </button>

          {showActiveCommitted &&
            (committedOfferings.length === 0 ? (
              <EmptyState
                emoji="🏪"
                title="No committed offerings yet"
                desc="Issue from your committed catalog to activate offerings for participants this Epoch."
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                {committedOfferings.map(offering => (
                  <div
                    key={offering.id}
                    style={{
                      ...accentCard,
                      border: "1px solid rgba(52,238,182,0.15)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: "rgba(52,238,182,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 22,
                          flexShrink: 0,
                        }}
                      >
                        🏪
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cs-text-strong, #fff)" }}>
                            {offering.name}
                          </div>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 3,
                              fontSize: 10,
                              fontWeight: 600,
                              background: "rgba(52,238,182,0.1)",
                              color: ACCENT,
                              borderRadius: 20,
                              padding: "1px 7px",
                            }}
                          >
                            <IconLock /> Epoch Locked
                          </span>
                        </div>
                        {offering.stipulations && (
                          <div style={{ fontSize: 11, color: DIMMED, marginBottom: 4, lineHeight: 1.4 }}>
                            {offering.stipulations}
                          </div>
                        )}
                        <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT }}>{offering.costCity} CITYx</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        data-tutorial-show-qr={
                          (tutorialStep === "box21" || tutorialStep === "box22") &&
                          tutorialActiveOfferingId === offering.id
                            ? "true"
                            : undefined
                        }
                        data-tutorial-allow={
                          (tutorialStep === "box21" || tutorialStep === "box22") &&
                          tutorialActiveOfferingId === offering.id
                            ? "true"
                            : undefined
                        }
                        onClick={() =>
                          onShowQR({
                            id: offering.id,
                            name: offering.name,
                            costCity: offering.costCity,
                            orgName,
                          })
                        }
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          background:
                            (tutorialStep === "box21" || tutorialStep === "box22") &&
                            tutorialActiveOfferingId === offering.id
                              ? "linear-gradient(145deg, rgba(221,158,51,0.95), rgba(221,158,51,0.78))"
                              : "rgba(52,238,182,0.1)",
                          border:
                            (tutorialStep === "box21" || tutorialStep === "box22") &&
                            tutorialActiveOfferingId === offering.id
                              ? "1px solid rgba(255,226,162,0.9)"
                              : "none",
                          borderRadius: 10,
                          padding: "9px 0",
                          fontSize: 12,
                          fontWeight: 600,
                          color:
                            (tutorialStep === "box21" || tutorialStep === "box22") &&
                            tutorialActiveOfferingId === offering.id
                              ? "#15151E"
                              : ACCENT,
                          cursor: "pointer",
                          boxShadow:
                            (tutorialStep === "box21" || tutorialStep === "box22") &&
                            tutorialActiveOfferingId === offering.id
                              ? "0 0 0 1px rgba(255,226,162,0.4), 0 0 14px rgba(221,158,51,0.48)"
                              : undefined,
                          animation:
                            (tutorialStep === "box21" || tutorialStep === "box22") &&
                            tutorialActiveOfferingId === offering.id
                              ? "tutorialRadiantTasks 1.55s ease-in-out infinite"
                              : undefined,
                        }}
                      >
                        <IconQR /> Show QR
                      </button>
                      <button
                        onClick={() => onRemoveAttempt(offering.id)}
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid var(--cs-border, rgba(255,255,255,0.1))",
                          borderRadius: 10,
                          padding: "9px 14px",
                          fontSize: 12,
                          fontWeight: 600,
                          color: MUTED,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <IconLock /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}

          {pendingCommittedCatalogCommitId && (
            <ConfirmDialog
              title="Commit Offering?"
              message="This commitment will be locked, and your organization agrees to honor this commitment until the end of the Epoch."
              confirmLabel="Confirm Commit"
              tutorialAllowConfirm={tutorialStep === "box21"}
              onConfirm={() => {
                onCommitFromCatalogCommitted(pendingCommittedCatalogCommitId);
                if (tutorialStep === "box21") onTutorialStepChange("box21");
                setPendingCommittedCatalogCommitId(null);
              }}
              onCancel={() => setPendingCommittedCatalogCommitId(null)}
            />
          )}
        </>
      )}

      {/* ── MCE Offerings ── */}
      {view === "mce" && (
        <>
          <button
            onClick={onAddMCE}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "rgba(221,158,51,0.08)",
              border: "1px dashed rgba(221,158,51,0.35)",
              borderRadius: 14,
              padding: "14px 0",
              fontSize: 13,
              fontWeight: 600,
              color: "#DD9E33",
              cursor: "pointer",
              marginBottom: 16,
            }}
          >
            <IconPlus /> Add Offering to MCE Catalog
          </button>

          <SectionLabel text={`MCE Offering Catalog (${mceCatalog.length})`} accentColor={ACCENT_GOLD} />

          {mceCatalog.length === 0 ? (
            <EmptyState
              emoji="📚"
              title="No offerings in MCE catalog yet"
              desc="Add an MCE offering to catalog, then commit it onchain."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {mceCatalog.map(item => {
                const mceForCatalog =
                  mceOfferings.find(existing => existing.catalogId === item.id) ??
                  mceOfferings.find(
                    existing =>
                      normalizeOfferText(existing.name) === normalizeOfferText(item.name) &&
                      isSameStipulationText(existing.stipulations || "", item.stipulations || "") &&
                      normalizeMceIds(existing.mceIds || []) === normalizeMceIds(item.mceIds || []),
                  );
                const duplicateMceState = mceForCatalog
                  ? mceForCatalog.costCity === item.costCity
                  : mceOfferings.some(existing => isSameMceOfferState(existing, item));
                const commitLabel = mceForCatalog
                  ? duplicateMceState
                    ? "Already Committed"
                    : "Update Rate"
                  : duplicateMceState
                    ? "Already Committed"
                    : "Commit Offering";
                return (
                  <div
                    key={item.id}
                    style={{
                      ...goldCard,
                      border: "1px solid rgba(221,158,51,0.22)",
                      background: "rgba(221,158,51,0.04)",
                    }}
                  >
                    <div
                      style={{ fontSize: 14, fontWeight: 700, color: "var(--cs-text-strong, #fff)", marginBottom: 4 }}
                    >
                      {item.name}
                    </div>
                    {item.mceNames.length > 0 && (
                      <div style={{ fontSize: 11, color: DIMMED, marginBottom: 4 }}>
                        Events: {item.mceNames.join(", ")}
                      </div>
                    )}
                    {item.stipulations && (
                      <div style={{ fontSize: 11, color: DIMMED, marginBottom: 6, lineHeight: 1.45 }}>
                        {item.stipulations}
                      </div>
                    )}
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#DD9E33", marginBottom: 8 }}>
                      {item.costCity} CITYx
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
                      <button
                        onClick={() => onModifyMCE(item.id)}
                        style={{
                          background: SURFACE_SOFT,
                          border: `1px solid ${CONTROL_BORDER}`,
                          borderRadius: 10,
                          padding: "8px 12px",
                          fontSize: 12,
                          fontWeight: 700,
                          color: TEXT_STRONG,
                          cursor: "pointer",
                        }}
                      >
                        Modify Offering
                      </button>
                      <button
                        onClick={() => setPendingMceCatalogCommitId(item.id)}
                        disabled={duplicateMceState}
                        style={{
                          background: duplicateMceState ? CONTROL_ACTIVE : "#DD9E33",
                          border: "none",
                          borderRadius: 10,
                          padding: "8px 12px",
                          fontSize: 12,
                          fontWeight: 700,
                          color: duplicateMceState ? MUTED : BG,
                          cursor: duplicateMceState ? "not-allowed" : "pointer",
                        }}
                        title={duplicateMceState ? "Already committed with the same rate/state" : undefined}
                      >
                        {commitLabel}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={() => setShowActiveMce(prev => !prev)}
            style={{
              width: "100%",
              marginBottom: 12,
              background: SURFACE_SOFT,
              border: `1px solid ${CONTROL_BORDER}`,
              borderRadius: 10,
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              color: TEXT_STRONG,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700 }}>Active MCE Offerings ({mceOfferings.length})</span>
            <span style={{ fontSize: 14, color: MUTED }}>{showActiveMce ? "▾" : "▸"}</span>
          </button>

          {showActiveMce &&
            (mceOfferings.length === 0 ? (
              <EmptyState
                emoji="⚡"
                title="No MCE offerings yet"
                desc="Issue from your MCE catalog to activate event-linked offerings."
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {mceOfferings.map(offering => (
                  <div
                    key={offering.id}
                    style={{
                      ...goldCard,
                      border: "1px solid rgba(221,158,51,0.2)",
                      background: "rgba(221,158,51,0.03)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: "rgba(221,158,51,0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 22,
                          flexShrink: 0,
                        }}
                      >
                        ⚡
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cs-text-strong, #fff)" }}>
                            {offering.name}
                          </div>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              background: "rgba(221,158,51,0.2)",
                              color: "#DD9E33",
                              borderRadius: 20,
                              padding: "1px 6px",
                            }}
                          >
                            MCE
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: DIMMED, marginBottom: 6 }}>
                          Events: {offering.mceNames.join(", ")}
                        </div>
                        {offering.stipulations && (
                          <div style={{ fontSize: 11, color: DIMMED, marginBottom: 6, lineHeight: 1.4 }}>
                            {offering.stipulations}
                          </div>
                        )}
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#DD9E33" }}>{offering.costCity} CITYx</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() =>
                          onShowQR({
                            id: offering.id,
                            name: offering.name,
                            costCity: offering.costCity,
                            orgName,
                          })
                        }
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          background: "rgba(221,158,51,0.1)",
                          border: "none",
                          borderRadius: 10,
                          padding: "9px 0",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#DD9E33",
                          cursor: "pointer",
                        }}
                      >
                        <IconQR /> Show QR
                      </button>
                      <div
                        style={{
                          background: "rgba(221,158,51,0.08)",
                          borderRadius: 10,
                          padding: "9px 14px",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#DD9E33",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <IconLock /> Locked
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}

          {pendingMceCatalogCommitId && (
            <ConfirmDialog
              title="Commit Offering?"
              message="This MCE commitment will be locked, and your organization agrees to honor this commitment until the end of the MCE Event."
              confirmLabel="Confirm Commit"
              onConfirm={() => {
                onCommitFromCatalogMCE(pendingMceCatalogCommitId);
                setPendingMceCatalogCommitId(null);
              }}
              onCancel={() => setPendingMceCatalogCommitId(null)}
            />
          )}
        </>
      )}
    </div>
  );
}

// ─── Add Offering Sheet ────────────────────────────────────────────────────────

function AddOfferingSheet({
  type,
  mces,
  onClose,
  onSubmitCommitted,
  onSubmitMCE,
  initialCommitted,
  initialMCE,
  tutorialLockCost,
  tutorialAllowSubmit = false,
}: {
  type: "committed" | "mce";
  mces: ReturnType<typeof useDemo>["state"]["mces"];
  onClose: () => void;
  onSubmitCommitted: (data: { name: string; costCity: number; stipulations: string }) => void;
  onSubmitMCE: (data: {
    name: string;
    costCity: number;
    stipulations: string;
    mceIds: string[];
    mceNames: string[];
  }) => void;
  initialCommitted?: CustomOffering | null;
  initialMCE?: MCECustomOffering | null;
  tutorialLockCost?: number;
  tutorialAllowSubmit?: boolean;
}) {
  const [name, setName] = useState(type === "committed" ? (initialCommitted?.name ?? "") : (initialMCE?.name ?? ""));
  const [costCity, setCostCity] = useState(
    type === "committed"
      ? initialCommitted?.costCity
        ? String(initialCommitted.costCity)
        : ""
      : initialMCE?.costCity
        ? String(initialMCE.costCity)
        : "",
  );
  const [stipulations, setStipulations] = useState(
    type === "committed" ? (initialCommitted?.stipulations ?? "") : (initialMCE?.stipulations ?? ""),
  );
  const [selectedMceIds, setSelectedMceIds] = useState(type === "mce" ? (initialMCE?.mceIds ?? []) : []);
  const isEditing = Boolean(initialCommitted || initialMCE);
  const isTutorialLockedCost = typeof tutorialLockCost === "number" && Number.isFinite(tutorialLockCost);

  useEffect(() => {
    if (!isTutorialLockedCost) return;
    setCostCity(String(tutorialLockCost));
  }, [isTutorialLockedCost, tutorialLockCost]);

  const activeMces = mces.filter(m => m.status === "Active" || m.status === "Voting");

  const canSubmitCommitted = name.trim() && parseInt(costCity) > 0;
  const canSubmitMCE = name.trim() && parseInt(costCity) > 0 && selectedMceIds.length > 0;

  const toggleMce = (id: string) => {
    if (isEditing) return;
    setSelectedMceIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const doSubmit = () => {
    if (type === "committed") {
      if (!canSubmitCommitted) return;
      onSubmitCommitted({ name: name.trim(), costCity: parseInt(costCity), stipulations: stipulations.trim() });
    } else {
      if (!canSubmitMCE) return;
      onSubmitMCE({
        name: name.trim(),
        costCity: parseInt(costCity),
        stipulations: stipulations.trim(),
        mceIds: selectedMceIds,
        mceNames: selectedMceIds.map(id => activeMces.find(m => m.id === id)?.title ?? id),
      });
    }
  };

  const handleSubmit = () => doSubmit();

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    color: "var(--cs-text-strong, #fff)",
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

  const accentCol = type === "committed" ? ACCENT : "#DD9E33";

  return (
    <>
      <style>{`
        @keyframes walletSlideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes tutorialConfirmPulse {
          0%, 100% { box-shadow: 0 0 0 1px rgba(255,226,162,0.32), 0 0 10px rgba(221,158,51,0.26); }
          50% { box-shadow: 0 0 0 1px rgba(255,226,162,0.82), 0 0 18px rgba(221,158,51,0.52); }
        }
      `}</style>
      <div style={DEMO_TUTORIAL_HIGHLIGHT_LAYER_STYLE}>
        <div style={DEMO_MODAL_OVERLAY_STYLE} onClick={onClose} />
        <div
          onClick={e => e.stopPropagation()}
          style={{
            ...DEMO_MODAL_SHEET_BASE_STYLE,
            maxHeight: "75%",
            padding: "20px 20px 24px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 18, color: "var(--cs-text-strong, white)" }}>
              Add Offering to your Catalog
            </span>
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
          <div style={{ fontSize: 13, color: MUTED, marginBottom: 20, lineHeight: 1.5 }}>
            {type === "committed"
              ? "Create or update your committed offering template."
              : "Create or update your MCE offering template."}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Offering Name */}
            <div>
              <label style={labelStyle}>{isEditing ? "Offering Name (Locked)" : "Offering Name *"}</label>
              <input
                data-tutorial-allow={tutorialAllowSubmit ? "true" : undefined}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. 10% Grocery Discount"
                disabled={isEditing}
                style={{
                  ...inputStyle,
                  opacity: isEditing ? 0.65 : 1,
                  cursor: isEditing ? "not-allowed" : "text",
                }}
              />
              {isEditing && (
                <div style={{ fontSize: 11, color: DIMMED, marginTop: 6 }}>
                  Offering name is fixed after creation. Modify the CITYx rate instead.
                </div>
              )}
            </div>

            {/* Cost */}
            <div>
              <label style={labelStyle}>Cost in CITYx *</label>
              <input
                type="number"
                value={costCity}
                onChange={e => setCostCity(e.target.value)}
                placeholder="e.g. 30"
                disabled={isTutorialLockedCost}
                style={{ ...inputStyle, fontSize: 20, fontWeight: 700 }}
              />
              {isTutorialLockedCost && (
                <div style={{ fontSize: 11, color: DIMMED, marginTop: 6 }}>
                  Tutorial mode: CITYx cost is fixed at {tutorialLockCost}.
                </div>
              )}
            </div>

            {/* MCE Selector (MCE type only) — multi-select checkboxes */}
            {type === "mce" && (
              <div>
                <label style={labelStyle}>Select MCE Events (choose all that apply) *</label>
                <div style={{ fontSize: 11, color: DIMMED, marginBottom: 8, lineHeight: 1.4 }}>
                  {isEditing
                    ? "MCE event scope is fixed after creation. Modify the CITYx rate only."
                    : "Select the MCE proposals you would create this offering for. Your selection signals influence on voting."}
                </div>
                {activeMces.length === 0 ? (
                  <div
                    style={{
                      ...inputStyle,
                      color: DIMMED,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    No active MCEs available
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {activeMces.map(mce => {
                      const checked = selectedMceIds.includes(mce.id);
                      return (
                        <button
                          key={mce.id}
                          type="button"
                          onClick={() => toggleMce(mce.id)}
                          disabled={isEditing}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "12px 14px",
                            borderRadius: 10,
                            border: checked
                              ? "1px solid rgba(221,158,51,0.5)"
                              : "1px solid var(--cs-border, rgba(255,255,255,0.1))",
                            background: checked ? "rgba(221,158,51,0.08)" : "rgba(255,255,255,0.04)",
                            cursor: isEditing ? "not-allowed" : "pointer",
                            textAlign: "left",
                            opacity: isEditing ? 0.75 : 1,
                          }}
                        >
                          {/* Checkbox indicator */}
                          <div
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 4,
                              border: checked ? "none" : "1.5px solid rgba(255,255,255,0.25)",
                              background: checked ? "#DD9E33" : "transparent",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {checked && <span style={{ fontSize: 11, color: "#0d1117", fontWeight: 800 }}>✓</span>}
                          </div>
                          <span
                            style={{ fontSize: 13, color: "var(--cs-text-strong, #fff)", fontWeight: 500, flex: 1 }}
                          >
                            {mce.title}
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              background: `${STATUS_COLOR[mce.status] ?? ACCENT}18`,
                              color: STATUS_COLOR[mce.status] ?? ACCENT,
                              borderRadius: 20,
                              padding: "2px 8px",
                              flexShrink: 0,
                            }}
                          >
                            {mce.status}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Stipulations / Notes */}
            <div>
              <label style={labelStyle}>{isEditing ? "Stipulations / Notes (Locked)" : "Stipulations / Notes"}</label>
              <textarea
                value={stipulations}
                onChange={e => setStipulations(e.target.value)}
                placeholder="e.g. Valid Mon–Fri only, not during peak hours, one redemption per visit..."
                rows={3}
                disabled={isEditing}
                style={{
                  ...inputStyle,
                  resize: "none",
                  lineHeight: 1.55,
                  opacity: isEditing ? 0.65 : 1,
                  cursor: isEditing ? "not-allowed" : "text",
                }}
              />
              {isEditing && (
                <div style={{ fontSize: 11, color: DIMMED, marginTop: 6 }}>
                  Notes are fixed after creation. Modify the CITYx rate instead.
                </div>
              )}
            </div>
          </div>

          <button
            data-tutorial-allow={tutorialAllowSubmit ? "true" : undefined}
            onClick={handleSubmit}
            disabled={type === "committed" ? !canSubmitCommitted : !canSubmitMCE}
            style={{
              width: "100%",
              background: (type === "committed" ? canSubmitCommitted : canSubmitMCE) ? accentCol : CONTROL_ACTIVE,
              border: "none",
              borderRadius: 14,
              padding: "14px 0",
              fontSize: 14,
              fontWeight: 700,
              color: (type === "committed" ? canSubmitCommitted : canSubmitMCE) ? BG : MUTED,
              cursor: (type === "committed" ? canSubmitCommitted : canSubmitMCE) ? "pointer" : "not-allowed",
              marginTop: 20,
            }}
          >
            Add To Catalog
          </button>
        </div>
      </div>
    </>
  );
}

function IssueOfferingFromCatalogSheet({
  type,
  committedCatalog,
  mceCatalog,
  canCommitOnchain,
  onIssueCommitted,
  onIssueMCE,
  onModifyCommitted,
  onModifyMCE,
  onClose,
}: {
  type: "committed" | "mce";
  committedCatalog: CustomOffering[];
  mceCatalog: MCECustomOffering[];
  canCommitOnchain: boolean;
  onIssueCommitted: (catalogId: string) => void;
  onIssueMCE: (catalogId: string) => void;
  onModifyCommitted: (catalogId: string) => void;
  onModifyMCE: (catalogId: string) => void;
  onClose: () => void;
}) {
  const isCommitted = type === "committed";
  const accent = isCommitted ? ACCENT : "#DD9E33";
  const list = isCommitted ? committedCatalog : mceCatalog;
  const [pendingCommitId, setPendingCommitId] = useState<string | null>(null);

  return (
    <>
      <style>{`
        @keyframes walletSlideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes tutorialDonePulse {
          0%, 100% { box-shadow: 0 0 0 1px rgba(255,226,162,0.32), 0 0 10px rgba(221,158,51,0.26); }
          50% { box-shadow: 0 0 0 1px rgba(255,226,162,0.82), 0 0 18px rgba(221,158,51,0.52); }
        }
      `}</style>
      <div style={DEMO_TUTORIAL_HIGHLIGHT_LAYER_STYLE}>
        <div style={DEMO_MODAL_OVERLAY_STYLE} onClick={onClose} />
        <div
          onClick={e => e.stopPropagation()}
          style={{
            ...DEMO_MODAL_SHEET_BASE_STYLE,
            maxHeight: "70%",
            boxShadow: SHADOW_LG,
            padding: "20px 20px 24px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 18, color: "var(--cs-text-strong, white)" }}>
              {isCommitted ? "Committed Offerings Catalog" : "MCE Offerings Catalog"}
            </span>
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
          <div style={{ fontSize: 13, color: MUTED, marginBottom: 18 }}>
            Select an offering to modify, or commit it onchain as an active offering.
          </div>
          {!canCommitOnchain && (
            <div
              style={{
                background: "rgba(255,107,157,0.08)",
                border: "1px solid rgba(255,107,157,0.25)",
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 12,
                color: "rgba(255,255,255,0.8)",
                marginBottom: 14,
              }}
            >
              Wallet session is still initializing. Commit Offering will enable once ready.
            </div>
          )}

          {list.length === 0 ? (
            <EmptyState
              emoji={isCommitted ? "🏪" : "⚡"}
              title="Catalog is empty"
              desc={
                isCommitted ? "Add a committed offering to catalog first." : "Add an MCE offering to catalog first."
              }
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {list.map(item => (
                <div
                  key={item.id}
                  style={{
                    ...surfaceCard,
                    border: `1px solid ${isCommitted ? "rgba(52,238,182,0.2)" : "rgba(221,158,51,0.22)"}`,
                    background: isCommitted ? "rgba(52,238,182,0.04)" : "rgba(221,158,51,0.04)",
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--cs-text-strong, #fff)", marginBottom: 4 }}>
                    {item.name}
                  </div>
                  {Array.isArray((item as MCECustomOffering).mceNames) &&
                    (item as MCECustomOffering).mceNames.length > 0 && (
                      <div style={{ fontSize: 11, color: DIMMED, marginBottom: 4 }}>
                        Events: {(item as MCECustomOffering).mceNames.join(", ")}
                      </div>
                    )}
                  {item.stipulations && (
                    <div style={{ fontSize: 11, color: DIMMED, marginBottom: 6, lineHeight: 1.45 }}>
                      {item.stipulations}
                    </div>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 700, color: accent, marginBottom: 8 }}>
                    {item.costCity} CITYx
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
                    <button
                      onClick={() => {
                        if (isCommitted) onModifyCommitted(item.id);
                        else onModifyMCE(item.id);
                        onClose();
                      }}
                      style={{
                        background: SURFACE_SOFT,
                        border: `1px solid ${CONTROL_BORDER}`,
                        borderRadius: 10,
                        padding: "8px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: TEXT_STRONG,
                        cursor: "pointer",
                      }}
                    >
                      Modify Offering
                    </button>
                    <button
                      onClick={() => setPendingCommitId(item.id)}
                      disabled={!canCommitOnchain}
                      style={{
                        background: canCommitOnchain ? accent : CONTROL_ACTIVE,
                        border: "none",
                        borderRadius: 10,
                        padding: "8px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: canCommitOnchain ? BG : MUTED,
                        cursor: canCommitOnchain ? "pointer" : "not-allowed",
                      }}
                    >
                      Commit Offering
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pendingCommitId && (
            <ConfirmDialog
              title="Commit Offering?"
              message={
                isCommitted
                  ? "This commitment will be locked, and your organization agrees to honor this commitment until the end of the Epoch."
                  : "This MCE commitment will be locked, and your organization agrees to honor this commitment until the end of the MCE Event."
              }
              confirmLabel="Confirm Commit"
              onConfirm={() => {
                if (isCommitted) onIssueCommitted(pendingCommitId);
                else onIssueMCE(pendingCommitId);
                setPendingCommitId(null);
                onClose();
              }}
              onCancel={() => setPendingCommitId(null)}
            />
          )}
        </div>
      </div>
    </>
  );
}

// ─── Confirm Dialog ────────────────────────────────────────────────────────────

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  warningOnly,
  tutorialAllowConfirm,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  warningOnly?: boolean;
  tutorialAllowConfirm?: boolean;
}) {
  return (
    <>
      <style>{`@keyframes walletSlideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
      <div style={DEMO_TUTORIAL_HIGHLIGHT_LAYER_STYLE}>
        <div style={DEMO_MODAL_OVERLAY_STYLE} onClick={onCancel} />
        <div
          onClick={e => e.stopPropagation()}
          style={{
            ...DEMO_MODAL_SHEET_BASE_STYLE,
            maxHeight: "40%",
            boxShadow: SHADOW_LG,
            padding: "20px 24px 24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--cs-text-strong, #fff)", marginBottom: 8 }}>
              🔒 {title}
            </div>
            <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, margin: 0 }}>{message}</p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {!warningOnly && (
              <button
                onClick={onCancel}
                style={{
                  flex: 1,
                  background: SURFACE_SOFT,
                  border: `1px solid ${CONTROL_BORDER}`,
                  borderRadius: 12,
                  padding: "12px 0",
                  fontSize: 14,
                  fontWeight: 600,
                  color: TEXT_STRONG,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            )}
            <button
              onClick={onConfirm}
              data-tutorial-allow={tutorialAllowConfirm ? "true" : undefined}
              style={{
                flex: 1,
                background: tutorialAllowConfirm
                  ? "linear-gradient(145deg, rgba(221,158,51,0.95), rgba(221,158,51,0.78))"
                  : warningOnly
                    ? ACCENT
                    : "rgba(255,107,157,0.15)",
                border: tutorialAllowConfirm
                  ? "1px solid rgba(255,226,162,0.88)"
                  : warningOnly
                    ? "none"
                    : "1px solid rgba(255,107,157,0.3)",
                borderRadius: 12,
                padding: "12px 0",
                fontSize: 14,
                fontWeight: 700,
                color: tutorialAllowConfirm ? "#15151E" : warningOnly ? BG : "#ff6b9d",
                cursor: "pointer",
                boxShadow: tutorialAllowConfirm
                  ? "0 0 0 1px rgba(255,226,162,0.46), 0 0 16px rgba(221,158,51,0.52)"
                  : undefined,
                animation: tutorialAllowConfirm ? "tutorialConfirmPulse 1.55s ease-in-out infinite" : undefined,
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── QR Modal ─────────────────────────────────────────────────────────────────

function QRModal({
  offering,
  onClose,
  tutorialAllowDone = false,
}: {
  offering: QROfferingData;
  onClose: () => void;
  tutorialAllowDone?: boolean;
}) {
  const qrPayload = `citysync://redeem?offer=${offering.id}&redeemer=${FAKE_WALLETS.redeemer}&cost=${offering.costCity}`;

  return (
    <>
      <style>{`@keyframes walletSlideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
      <div style={DEMO_TUTORIAL_HIGHLIGHT_LAYER_STYLE}>
        <div style={DEMO_MODAL_OVERLAY_STYLE} onClick={onClose} />
        <div
          onClick={e => e.stopPropagation()}
          style={{
            ...DEMO_MODAL_SHEET_BASE_STYLE,
            maxHeight: "65%",
            padding: "20px 24px 24px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--cs-text-strong, #fff)" }}>{offering.name}</div>
              <div style={{ fontSize: 12, color: MUTED }}>{offering.orgName}</div>
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

          {/* QR placeholder */}
          <div
            style={{
              width: 200,
              height: 200,
              background: "#fff",
              borderRadius: 16,
              padding: 12,
              margin: "0 auto 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxSizing: "border-box",
            }}
          >
            <QRGrid seed={offering.id} />
          </div>

          {/* Cost */}
          <div
            style={{
              background: "rgba(52,238,182,0.08)",
              border: "1px solid rgba(52,238,182,0.2)",
              borderRadius: 12,
              padding: "10px 0",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 11, color: MUTED, marginBottom: 2 }}>Cost</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: ACCENT }}>{offering.costCity} CITYx</div>
          </div>

          {/* URI */}
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: 10,
              padding: "10px 12px",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 10,
                color: DIMMED,
                wordBreak: "break-all",
                lineHeight: 1.5,
              }}
            >
              {qrPayload}
            </div>
          </div>

          <button
            data-tutorial-allow={tutorialAllowDone ? "true" : undefined}
            onClick={onClose}
            style={{
              width: "100%",
              background: tutorialAllowDone
                ? "linear-gradient(145deg, rgba(221,158,51,0.95), rgba(221,158,51,0.78))"
                : ACCENT,
              border: tutorialAllowDone ? "1px solid rgba(255,226,162,0.88)" : "none",
              borderRadius: 14,
              padding: "13px 0",
              fontSize: 14,
              fontWeight: 700,
              color: tutorialAllowDone ? "#15151E" : BG,
              cursor: "pointer",
              boxShadow: tutorialAllowDone
                ? "0 0 0 1px rgba(255,226,162,0.46), 0 0 16px rgba(221,158,51,0.52)"
                : undefined,
              animation: tutorialAllowDone ? "tutorialDonePulse 1.55s ease-in-out infinite" : undefined,
            }}
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}

// Deterministic QR-like SVG grid (no external library)
function QRGrid({ seed }: { seed: string }) {
  const size = 13;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  const cells = Array.from({ length: size * size }, (_, i) => {
    const r = Math.floor(i / size);
    const c = i % size;
    if ((r < 3 && c < 3) || (r < 3 && c >= size - 3) || (r >= size - 3 && c < 3)) return true;
    return ((hash ^ (i * 0x5f3759df)) & 1) === 1;
  });

  return (
    <svg width="176" height="176" viewBox={`0 0 ${size} ${size}`} style={{ imageRendering: "pixelated" }}>
      {cells.map((filled, i) =>
        filled ? <rect key={i} x={i % size} y={Math.floor(i / size)} width={1} height={1} fill="#15151E" /> : null,
      )}
    </svg>
  );
}

// ─── Community Tab (Feed + MCEs) ──────────────────────────────────────────────

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
  onLearnMore: (selection: RedeemerLearnMoreSelection) => void;
}) {
  const [section, setSection] = useState<"feed" | "mces">("feed");

  return (
    <div style={{ padding: "0 0 100px" }}>
      {/* Segment toggle */}
      <div
        style={{ background: SURFACE, borderRadius: 16, display: "flex", margin: "24px 20px 20px", overflow: "hidden" }}
      >
        {(
          [
            { key: "feed" as const, label: "MyCity Feed" },
            { key: "mces" as const, label: "MCEs" },
          ] as const
        ).map(({ key, label }, i) => (
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
              background: section === key ? BRAND_BLUE : "transparent",
              color: section === key ? "#fff" : MUTED,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {section === "feed" && (
        <div style={{ padding: "0 20px" }}>
          <MyCityTab posts={posts} orgName={orgName} onCompose={onCompose} onLearnMore={onLearnMore} />
        </div>
      )}
      {section === "mces" && (
        <div style={{ padding: "0 20px" }}>
          <MCEsTab state={state} orgName={orgName} onLearnMore={onLearnMore} />
        </div>
      )}
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
  onLearnMore: (selection: RedeemerLearnMoreSelection) => void;
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
    <div style={{ paddingBottom: 20 }}>
      <button
        onClick={onCompose}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          background: ACCENT,
          border: "none",
          borderRadius: 10,
          padding: "8px 14px",
          fontSize: 12,
          fontWeight: 700,
          color: BG,
          cursor: "pointer",
          marginBottom: 12,
        }}
      >
        <IconPlus /> New Post
      </button>

      {/* Sort */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            background: CONTROL_SURFACE,
            border: `1px solid ${CONTROL_BORDER}`,
            borderRadius: 8,
            padding: 3,
          }}
        >
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
                background: sort === s ? CONTROL_ACTIVE : "transparent",
                color: sort === s ? TEXT_STRONG : TEXT_DIMMED,
              }}
            >
              {s === "recent" ? "Recent" : "Top"}
            </button>
          ))}
        </div>
        <LearnMoreLink onClick={() => onLearnMore("mycity-feed")} />
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
                ...accentCard,
                border: isOwn ? "1px solid rgba(52,238,182,0.2)" : "1px solid rgba(255,255,255,0.06)",
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
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cs-text-strong, #fff)" }}>
                      {post.authorName}
                    </div>
                    {isOwn && (
                      <span
                        style={{
                          fontSize: 10,
                          background: "rgba(52,238,182,0.12)",
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
      id: `post-redeemer-${Date.now()}`,
      authorName: orgName,
      authorId: FAKE_WALLETS.redeemer,
      authorType: "redeemer",
      content: content.trim(),
      postedAt: new Date().toISOString(),
      likes: 0,
      category,
    };
    onPost(post);
  };

  return (
    <>
      <style>{`@keyframes walletSlideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
      <div style={DEMO_TUTORIAL_HIGHLIGHT_LAYER_STYLE}>
        <div style={DEMO_MODAL_OVERLAY_STYLE} onClick={onClose} />
        <div
          onClick={e => e.stopPropagation()}
          style={{
            ...DEMO_MODAL_SHEET_BASE_STYLE,
            maxHeight: "65%",
            padding: "20px 20px 24px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: "var(--cs-text-strong, white)" }}>New Post</span>
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
            placeholder="Share a deal, event, or announcement with the city..."
            rows={5}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--cs-border, rgba(255,255,255,0.1))",
              borderRadius: 12,
              color: "var(--cs-text-strong, #fff)",
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

// ─── Dashboard Tab ────────────────────────────────────────────────────────────

function DashboardTab({
  redeemer,
  committedOfferings,
  mceOfferings,
  onLearnMore,
}: {
  redeemer: ReturnType<typeof useDemo>["state"]["redeemer"];
  committedOfferings: CustomOffering[];
  mceOfferings: MCECustomOffering[];
  onLearnMore: (selection: RedeemerLearnMoreSelection) => void;
}) {
  const totalCityxBurned = redeemer.processedRedemptions.reduce((n, r) => n + r.costCity, 0);
  const activeOfferingsCount = committedOfferings.length + mceOfferings.length;
  const isActive = activeOfferingsCount > 0;

  // Tally processedRedemptions by offerTitle for accurate per-offering breakdown
  const redemptionsByTitle = redeemer.processedRedemptions.reduce<
    Record<string, { redemptions: number; cityxBurned: number }>
  >((acc, r) => {
    const key = r.offerTitle;
    if (!acc[key]) acc[key] = { redemptions: 0, cityxBurned: 0 };
    acc[key].redemptions++;
    acc[key].cityxBurned += r.costCity;
    return acc;
  }, {});

  // Build per-offering breakdown — merge committed + mce with real tallied stats
  const offeringStats: { name: string; type: string; redemptions: number; cityxBurned: number }[] = [
    ...committedOfferings.map(o => ({
      name: o.name,
      type: "Committed",
      ...(redemptionsByTitle[o.name] ?? { redemptions: 0, cityxBurned: 0 }),
    })),
    ...mceOfferings.map(o => ({
      name: o.name,
      type: "MCE",
      ...(redemptionsByTitle[o.name] ?? { redemptions: 0, cityxBurned: 0 }),
    })),
  ];

  return (
    <div>
      {/* Activity Overview */}
      <SectionLabel
        text="Activity Overview"
        accentColor={ACCENT_BLUE}
        right={<LearnMoreLink onClick={() => onLearnMore("dashboard-activity-overview")} />}
      />
      <div style={{ ...surfaceCard, padding: 12, marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ ...surfaceCard, textAlign: "center", padding: "16px 12px" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: ACCENT }}>{activeOfferingsCount}</div>
            <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Active Offerings</div>
          </div>
          <div style={{ ...surfaceCard, textAlign: "center", padding: "16px 12px" }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: isActive ? ACCENT : MUTED,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: isActive ? ACCENT : MUTED,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              {isActive ? "Active" : "Inactive"}
            </div>
            <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Redeemer Status</div>
          </div>
          <div style={{ ...surfaceCard, textAlign: "center", padding: "16px 12px" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#DD9E33" }}>
              {redeemer.processedRedemptions.length}
            </div>
            <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Your Redemptions</div>
          </div>
          <div style={{ ...surfaceCard, textAlign: "center", padding: "16px 12px" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#a78bfa" }}>{totalCityxBurned.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>CITYx Burned</div>
          </div>
        </div>
      </div>

      {/* Per-offering breakdown */}
      <SectionLabel
        text="Offerings Breakdown"
        accentColor={ACCENT_PURPLE}
        right={<LearnMoreLink onClick={() => onLearnMore("dashboard-offerings-breakdown")} />}
      />
      {offeringStats.length > 0 ? (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {offeringStats.map((o, i) => (
              <div
                key={i}
                style={{
                  ...surfaceCard,
                  padding: "14px 16px",
                  border: o.type === "MCE" ? "1px solid rgba(221,158,51,0.15)" : "1px solid rgba(52,238,182,0.1)",
                  borderLeft: o.type === "MCE" ? "3px solid rgba(221,158,51,0.45)" : "3px solid rgba(52,238,182,0.45)",
                  paddingLeft: 13,
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cs-text-strong, #fff)" }}>{o.name}</div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      background: o.type === "MCE" ? "rgba(221,158,51,0.15)" : "rgba(52,238,182,0.1)",
                      color: o.type === "MCE" ? "#DD9E33" : ACCENT,
                      borderRadius: 20,
                      padding: "2px 8px",
                    }}
                  >
                    {o.type}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      borderRadius: 8,
                      padding: "8px 10px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 18, fontWeight: 700, color: ACCENT }}>{o.redemptions}</div>
                    <div style={{ fontSize: 10, color: DIMMED, marginTop: 2 }}>Redemptions</div>
                  </div>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      borderRadius: 8,
                      padding: "8px 10px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#ff6b9d" }}>{o.cityxBurned}</div>
                    <div style={{ fontSize: 10, color: DIMMED, marginTop: 2 }}>CITYx Burned</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          emoji="📊"
          title="No offerings yet"
          desc="Add committed or MCE offerings to start tracking redemptions and CITYx burned per offering."
        />
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
  onLearnMore: (selection: RedeemerLearnMoreSelection) => void;
}) {
  const { address } = useAccount({ type: "ModularAccountV2" });
  const [section, setSection] = useState<"epoch1" | "epoch2">("epoch1");
  const [proposeOpen, setProposeOpen] = useState(false);
  const [localProposals, setLocalProposals] = useState<
    Array<{ id: string; title: string; description: string; goals: string; benefits: string; tags: string[] }>
  >([]);
  const localProposalStorageKey = `citysync:demo:redeemer:mce-proposals:v1:${(address ?? FAKE_WALLETS.redeemer).toLowerCase()}`;

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
    border: "1px solid var(--cs-border, rgba(255,255,255,0.1))",
    borderRadius: 10,
    color: "var(--cs-text-strong, #fff)",
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
    <div style={{ paddingBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <LearnMoreLink onClick={() => onLearnMore(["epoch1-voting", "next-epoch"])} />
      </div>
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
              background: section === s.key ? BRAND_BLUE : "transparent",
              color: section === s.key ? "#fff" : MUTED,
              transition: "all 0.15s",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Epoch 1 — View only */}
      {section === "epoch1" && (
        <>
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
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "var(--cs-text-strong, white)",
                            lineHeight: 1.35,
                          }}
                        >
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
                    background: "rgba(52,238,182,0.12)",
                    color: ACCENT,
                    border: "1px solid rgba(52,238,182,0.25)",
                  }}
                >
                  Redeemer
                </span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>just now</span>
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--cs-text-strong, white)",
                  lineHeight: 1.35,
                  marginBottom: 4,
                }}
              >
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
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--cs-text-strong, white)",
                  lineHeight: 1.35,
                  marginBottom: 4,
                }}
              >
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
          <style>{`@keyframes walletSlideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
          <div style={DEMO_TUTORIAL_HIGHLIGHT_LAYER_STYLE}>
            <div
              onClick={e => e.stopPropagation()}
              style={{
                ...DEMO_CONTENT_SHEET_ABSOLUTE_ELEVATED_STYLE,
                background: "var(--cs-surface, #1E1E2C)",
                padding: "20px 20px 24px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: "var(--cs-text-strong, white)" }}>
                  New MCE Proposal
                </span>
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
      {right && <div>{right}</div>}
    </div>
  );
}

function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: `${color}20`,
        color,
        borderRadius: 20,
        padding: "3px 10px",
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
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
        padding: "48px 0",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 14 }}>{emoji}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: "var(--cs-text-strong, #fff)", marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ fontSize: 13, color: MUTED, maxWidth: 240, lineHeight: 1.55 }}>{desc}</div>
    </div>
  );
}

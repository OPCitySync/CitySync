"use client";

import React, { ReactNode, createContext, useCallback, useContext, useEffect, useReducer, useRef } from "react";
import { useAccount, useSendUserOperation, useSmartAccountClient } from "@account-kit/react";
import { decodeEventLog, encodeFunctionData, formatUnits, keccak256, parseUnits, stringToHex } from "viem";
import { baseSepoliaPublicClient } from "../_config/baseSepoliaClient";
import { BASE_SEPOLIA_CONTRACTS, DEMO_OFFER_ROUTES } from "../_config/baseSepoliaContracts";
import {
  CompletedTask,
  Epoch2Proposal,
  FAKE_WALLETS,
  MCEProposal,
  MOCK_EPOCH2_PROPOSALS,
  MOCK_MCES,
  MOCK_POSTS,
  PastRedemption,
  Post,
  RedemptionOffer,
  Task,
} from "../_data/mockData";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Role = "participant" | "issuer" | "redeemer" | null;

export interface IssuerTask extends Task {
  pendingCompletions: string[]; // citizen "addresses" who claimed but need verification
  verifiedCount: number;
}

export interface ParticipantState {
  citizenName: string;
  cityBalance: number;
  voteBalance: number;
  mceBalance: number;
  claimedTaskIds: string[];
  completedTasks: CompletedTask[];
  mceVoteAllocations: Record<string, number>; // mceId → allocated VOTE tokens
  likedPostIds: string[];
  likedEpoch2Ids: string[];
}

export interface IssuerState {
  orgName: string;
  registered: boolean;
  tasks: IssuerTask[];
  totalCreditsIssued: number;
  totalTasksIssued: number;
}

export interface RedeemerState {
  orgName: string;
  registered: boolean;
  acceptsMCE: boolean;
  offers: RedemptionOffer[];
  redemptionQueue: QueuedRedemption[];
  processedRedemptions: ProcessedRedemption[];
}

export interface QueuedRedemption {
  id: string;
  citizenAddress: string;
  offerId: string;
  offerTitle: string;
  costCity: number;
  timestamp: string;
}

export interface ProcessedRedemption {
  id: string;
  citizenAddress: string;
  offerId: string;
  offerTitle: string;
  costCity: number;
  processedAt: string;
  txHash: string;
}

export interface VerifyingState {
  taskId: string;
  taskTitle: string;
  secondsRemaining: number;
}

export interface DemoState {
  role: Role;
  participant: ParticipantState;
  issuer: IssuerState;
  redeemer: RedeemerState;
  mces: MCEProposal[];
  epoch2Proposals: Epoch2Proposal[];
  posts: Post[];
  availableTasks: Task[];
  offers: RedemptionOffer[];
  verifying: VerifyingState | null;
  pastRedemptions: PastRedemption[];
  notifications: string[];
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: "SET_ROLE"; role: Role }
  | { type: "SET_CITIZEN_NAME"; name: string }
  | { type: "CLAIM_TASK"; taskId: string }
  | { type: "UNCLAIM_TASK"; taskId: string }
  | { type: "START_VERIFY"; taskId: string; taskTitle: string }
  | { type: "TICK_VERIFY" }
  | { type: "COMPLETE_VERIFY" }
  | { type: "ALLOCATE_MCE_VOTE"; mceId: string; amount: number }
  | { type: "LIKE_POST"; postId: string }
  | { type: "LIKE_EPOCH2"; proposalId: string }
  | { type: "REDEEM_OFFER"; offerId: string; txHash?: `0x${string}` }
  | { type: "ISSUER_REGISTER"; orgName: string }
  | { type: "ISSUER_CREATE_TASK"; task: Task }
  | { type: "ISSUER_REMOVE_TASK"; taskId: string }
  | { type: "ISSUER_VERIFY_COMPLETION"; taskId: string; citizenAddress: string }
  | { type: "REDEEMER_REGISTER"; orgName: string }
  | { type: "REDEEMER_TOGGLE_MCE" }
  | { type: "REDEEMER_SET_MCE_OPT_IN"; value: boolean }
  | { type: "REDEEMER_ADD_OFFER"; offer: RedemptionOffer }
  | { type: "REDEEMER_REMOVE_OFFER"; offerId: string }
  | { type: "REDEEMER_PROCESS_REDEMPTION"; queueId: string }
  | {
      type: "SYNC_ONCHAIN_STATE";
      cityBalance: number;
      voteBalance: number;
      mceBalance: number;
      issuerRegistered: boolean;
      redeemerRegistered: boolean;
    }
  | { type: "SYNC_ONCHAIN_OFFERS"; offers: RedemptionOffer[] }
  | { type: "HYDRATE_TASK_STATE"; availableTasks: Task[]; issuerTasks: IssuerTask[]; totalTasksIssued: number }
  | { type: "HYDRATE_REDEMPTIONS"; pastRedemptions: PastRedemption[] }
  | { type: "ADD_QUEUE_REDEMPTION"; redemption: QueuedRedemption }
  | { type: "CLEAR_NOTIFICATION" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const randomTxHash = () =>
  "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

const _randomAddress = () =>
  "0x" +
  Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 0xffff)
      .toString(16)
      .padStart(4, "0"),
  ).join("") +
  "..." +
  Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 0xffff)
      .toString(16)
      .padStart(4, "0"),
  ).join("");

const VERIFY_DURATION = 7; // seconds
const TASK_STATE_STORAGE_KEY = "citysync:demo:taskState:v2";
const PROFILE_NAMES_STORAGE_KEY = "citysync:demo:profile:names:v1";
const REDEMPTION_STORAGE_KEY = "citysync:demo:pastRedemptions:v1";

const parseTaskOpportunityId = (taskId: string): bigint | null => {
  const m = taskId.match(/^task-(\d+)$/);
  return m ? BigInt(m[1]) : null;
};

const parseNumericSuffix = (id: string): bigint | null => {
  const m = id.match(/(\d+)$/);
  return m ? BigInt(m[1]) : null;
};

const parseOnchainOfferId = (id: string): { redeemer: `0x${string}`; offerId: bigint } | null => {
  if (!id.startsWith("onchain:")) return null;
  const [, redeemer, offerId] = id.split(":");
  if (!redeemer || !offerId) return null;
  try {
    return { redeemer: redeemer as `0x${string}`, offerId: BigInt(offerId) };
  } catch {
    return null;
  }
};

const multicallInChunks = async (contracts: any[], chunkSize = 200) => {
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
};

// ─── Issuer org name generator ────────────────────────────────────────────────

const PREFIXES = ["Metro", "Civic", "Urban", "Green", "Public", "Community", "City", "Open"];
const SUFFIXES = ["Initiative", "Coalition", "Alliance", "Network", "Foundation", "Collaborative", "Works", "Commons"];
const VENUES = ["Market", "Gym", "Library", "Transit Pass", "Kitchen", "Arts Center", "Co-op", "Hub"];
const ADJECTIVES = ["Local", "Corner", "City", "Central", "Community", "District"];

export const generateIssuerName = (seed: number) =>
  `${PREFIXES[seed % PREFIXES.length]} ${SUFFIXES[(seed * 3) % SUFFIXES.length]}`;

export const generateRedeemerName = (seed: number) =>
  `${ADJECTIVES[seed % ADJECTIVES.length]} ${VENUES[(seed * 2) % VENUES.length]}`;

// ─── Initial State ────────────────────────────────────────────────────────────

const INITIAL_STATE: DemoState = {
  role: null,
  participant: {
    citizenName: "",
    cityBalance: 0,
    voteBalance: 0,
    mceBalance: 0,
    claimedTaskIds: [],
    completedTasks: [],
    mceVoteAllocations: {},
    likedPostIds: [],
    likedEpoch2Ids: [],
  },
  issuer: {
    orgName: "",
    registered: false,
    tasks: [],
    totalCreditsIssued: 0,
    totalTasksIssued: 0,
  },
  redeemer: {
    orgName: "",
    registered: false,
    acceptsMCE: false,
    offers: [],
    redemptionQueue: [],
    processedRedemptions: [],
  },
  mces: MOCK_MCES,
  epoch2Proposals: MOCK_EPOCH2_PROPOSALS,
  posts: MOCK_POSTS,
  availableTasks: [],
  offers: [],
  verifying: null,
  pastRedemptions: [],
  notifications: [],
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case "SET_ROLE": {
      // Auto-register on role selection for demo smoothness
      const now = Date.now();
      if (action.role === "issuer" && !state.issuer.registered) {
        const orgName = generateIssuerName(now % PREFIXES.length);
        return {
          ...state,
          role: action.role,
          issuer: { ...state.issuer, registered: true, orgName },
        };
      }
      if (action.role === "redeemer" && !state.redeemer.registered) {
        const orgName = generateRedeemerName(now % ADJECTIVES.length);
        return {
          ...state,
          role: action.role,
          redeemer: { ...state.redeemer, registered: true, orgName },
        };
      }
      return { ...state, role: action.role };
    }

    case "SET_CITIZEN_NAME": {
      return {
        ...state,
        participant: { ...state.participant, citizenName: action.name },
      };
    }

    case "CLAIM_TASK": {
      if (state.participant.claimedTaskIds.includes(action.taskId)) return state;
      const task = state.availableTasks.find(t => t.id === action.taskId);
      if (!task) return state;

      // For onboarding tasks, don't decrement slots (infinite pool)
      const updatedTasks = task.isOnboarding
        ? state.availableTasks
        : state.availableTasks.map(t =>
            t.id === action.taskId ? { ...t, slotsRemaining: Math.max(0, t.slotsRemaining - 1) } : t,
          );

      return {
        ...state,
        participant: {
          ...state.participant,
          claimedTaskIds: [...state.participant.claimedTaskIds, action.taskId],
        },
        availableTasks: updatedTasks,
      };
    }

    case "UNCLAIM_TASK": {
      if (!state.participant.claimedTaskIds.includes(action.taskId)) return state;
      const task = state.availableTasks.find(t => t.id === action.taskId);

      // Restore slot on unclaim (except onboarding tasks)
      const updatedTasks =
        task && !task.isOnboarding
          ? state.availableTasks.map(t =>
              t.id === action.taskId ? { ...t, slotsRemaining: Math.min(t.slots, t.slotsRemaining + 1) } : t,
            )
          : state.availableTasks;

      return {
        ...state,
        participant: {
          ...state.participant,
          claimedTaskIds: state.participant.claimedTaskIds.filter(id => id !== action.taskId),
        },
        availableTasks: updatedTasks,
      };
    }

    case "START_VERIFY": {
      return {
        ...state,
        verifying: { taskId: action.taskId, taskTitle: action.taskTitle, secondsRemaining: VERIFY_DURATION },
      };
    }

    case "TICK_VERIFY": {
      if (!state.verifying) return state;
      const next = state.verifying.secondsRemaining - 1;
      if (next <= 0) return state; // handled by COMPLETE_VERIFY
      return { ...state, verifying: { ...state.verifying, secondsRemaining: next } };
    }

    case "COMPLETE_VERIFY": {
      if (!state.verifying) return state;
      return {
        ...state,
        verifying: null,
      };
    }

    case "ALLOCATE_MCE_VOTE": {
      const currentAllocations = state.participant.mceVoteAllocations;
      const currentForThis = currentAllocations[action.mceId] ?? 0;
      const totalAllocated = Object.values(currentAllocations).reduce((a, b) => a + b, 0);
      const remaining = state.participant.voteBalance - totalAllocated;

      // Clamp: new amount can't exceed current + remaining, and can't go below 0
      const newAmount = Math.max(0, Math.min(action.amount, currentForThis + remaining));

      return {
        ...state,
        participant: {
          ...state.participant,
          mceVoteAllocations: { ...currentAllocations, [action.mceId]: newAmount },
        },
      };
    }

    case "LIKE_POST": {
      const alreadyLiked = state.participant.likedPostIds.includes(action.postId);
      const updatedPosts = state.posts.map(p => {
        if (p.id !== action.postId) return p;
        return { ...p, likes: alreadyLiked ? p.likes - 1 : p.likes + 1 };
      });
      return {
        ...state,
        posts: updatedPosts,
        participant: {
          ...state.participant,
          likedPostIds: alreadyLiked
            ? state.participant.likedPostIds.filter(id => id !== action.postId)
            : [...state.participant.likedPostIds, action.postId],
        },
      };
    }

    case "LIKE_EPOCH2": {
      const alreadyLiked = state.participant.likedEpoch2Ids.includes(action.proposalId);
      const updatedProposals = state.epoch2Proposals.map(p => {
        if (p.id !== action.proposalId) return p;
        return { ...p, likes: alreadyLiked ? p.likes - 1 : p.likes + 1 };
      });
      return {
        ...state,
        epoch2Proposals: updatedProposals,
        participant: {
          ...state.participant,
          likedEpoch2Ids: alreadyLiked
            ? state.participant.likedEpoch2Ids.filter(id => id !== action.proposalId)
            : [...state.participant.likedEpoch2Ids, action.proposalId],
        },
      };
    }

    case "REDEEM_OFFER": {
      const offer = state.offers.find(o => o.id === action.offerId);
      if (!offer) return state;

      const redemption: PastRedemption = {
        id: `redemption-${Date.now()}`,
        offerId: offer.id,
        offerTitle: offer.offerTitle,
        redeemerName: offer.redeemerName,
        costCity: offer.costCity,
        mceOnly: offer.mceOnly,
        redeemedAt: new Date().toISOString(),
        txHash: action.txHash ?? randomTxHash(),
      };

      // Also add to redeemer queue for cross-role simulation
      const queued: QueuedRedemption = {
        id: redemption.id,
        citizenAddress: FAKE_WALLETS.participant,
        offerId: offer.id,
        offerTitle: offer.offerTitle,
        costCity: offer.costCity,
        timestamp: redemption.redeemedAt,
      };

      return {
        ...state,
        pastRedemptions: [redemption, ...state.pastRedemptions],
        redeemer: {
          ...state.redeemer,
          redemptionQueue: [queued, ...state.redeemer.redemptionQueue],
        },
      };
    }

    // ── Issuer actions ────────────────────────────────────────────────────────

    case "ISSUER_REGISTER": {
      return {
        ...state,
        issuer: { ...state.issuer, registered: true, orgName: action.orgName },
      };
    }

    case "ISSUER_CREATE_TASK": {
      const issuerTask: IssuerTask = {
        ...action.task,
        pendingCompletions: [],
        verifiedCount: 0,
      };

      return {
        ...state,
        availableTasks: [...state.availableTasks, action.task],
        issuer: {
          ...state.issuer,
          tasks: [...state.issuer.tasks, issuerTask],
          totalTasksIssued: state.issuer.totalTasksIssued + 1,
        },
      };
    }

    case "ISSUER_REMOVE_TASK": {
      const removedTask = state.issuer.tasks.find(t => t.id === action.taskId);
      return {
        ...state,
        availableTasks: state.availableTasks.filter(t => t.id !== action.taskId),
        issuer: {
          ...state.issuer,
          tasks: state.issuer.tasks.filter(t => t.id !== action.taskId),
          totalTasksIssued: Math.max(0, state.issuer.totalTasksIssued - 1),
          totalCreditsIssued: Math.max(0, state.issuer.totalCreditsIssued - (removedTask?.credits ?? 0)),
        },
      };
    }

    case "ISSUER_VERIFY_COMPLETION": {
      const task = state.availableTasks.find(t => t.id === action.taskId);
      if (!task) return state;

      const updatedTasks = state.issuer.tasks.map(t => {
        if (t.id !== action.taskId) return t;
        return {
          ...t,
          pendingCompletions: t.pendingCompletions.filter(a => a !== action.citizenAddress),
          verifiedCount: t.verifiedCount + 1,
        };
      });

      return {
        ...state,
        issuer: {
          ...state.issuer,
          tasks: updatedTasks,
          totalCreditsIssued: state.issuer.totalCreditsIssued + task.credits,
        },
      };
    }

    // ── Redeemer actions ──────────────────────────────────────────────────────

    case "REDEEMER_REGISTER": {
      return {
        ...state,
        redeemer: { ...state.redeemer, registered: true, orgName: action.orgName },
      };
    }

    case "REDEEMER_TOGGLE_MCE": {
      return {
        ...state,
        redeemer: { ...state.redeemer, acceptsMCE: !state.redeemer.acceptsMCE },
      };
    }

    case "REDEEMER_SET_MCE_OPT_IN": {
      return {
        ...state,
        redeemer: { ...state.redeemer, acceptsMCE: action.value },
      };
    }

    case "REDEEMER_ADD_OFFER": {
      return {
        ...state,
        redeemer: { ...state.redeemer, offers: [...state.redeemer.offers, action.offer] },
        offers: [...state.offers, action.offer],
      };
    }

    case "REDEEMER_REMOVE_OFFER": {
      return {
        ...state,
        redeemer: {
          ...state.redeemer,
          offers: state.redeemer.offers.filter(o => o.id !== action.offerId),
        },
      };
    }

    case "REDEEMER_PROCESS_REDEMPTION": {
      const queued = state.redeemer.redemptionQueue.find(r => r.id === action.queueId);
      if (!queued) return state;

      const processed: ProcessedRedemption = {
        ...queued,
        processedAt: new Date().toISOString(),
        txHash: randomTxHash(),
      };

      return {
        ...state,
        redeemer: {
          ...state.redeemer,
          redemptionQueue: state.redeemer.redemptionQueue.filter(r => r.id !== action.queueId),
          processedRedemptions: [processed, ...state.redeemer.processedRedemptions],
        },
      };
    }

    case "SYNC_ONCHAIN_STATE": {
      return {
        ...state,
        participant: {
          ...state.participant,
          cityBalance: action.cityBalance,
          voteBalance: action.voteBalance,
          mceBalance: action.mceBalance,
        },
        issuer: {
          ...state.issuer,
          registered: action.issuerRegistered,
        },
        redeemer: {
          ...state.redeemer,
          registered: action.redeemerRegistered,
        },
      };
    }

    case "SYNC_ONCHAIN_OFFERS": {
      return {
        ...state,
        offers: action.offers,
      };
    }

    case "HYDRATE_TASK_STATE": {
      return {
        ...state,
        availableTasks: action.availableTasks,
        issuer: {
          ...state.issuer,
          tasks: action.issuerTasks,
          totalTasksIssued: action.totalTasksIssued,
        },
      };
    }

    case "HYDRATE_REDEMPTIONS": {
      return {
        ...state,
        pastRedemptions: action.pastRedemptions,
      };
    }

    case "ADD_QUEUE_REDEMPTION": {
      return {
        ...state,
        redeemer: {
          ...state.redeemer,
          redemptionQueue: [action.redemption, ...state.redeemer.redemptionQueue],
        },
      };
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface DemoContextValue {
  state: DemoState;
  setRole: (role: Role) => void;
  setCitizenName: (name: string) => void;
  claimTask: (taskId: string) => Promise<{ ok: boolean; hash?: `0x${string}`; error?: string }>;
  unclaimTask: (taskId: string) => Promise<{ ok: boolean; hash?: `0x${string}`; error?: string }>;
  startVerify: (taskId: string, taskTitle: string) => Promise<{ ok: boolean; hash?: `0x${string}`; error?: string }>;
  allocateMceVote: (mceId: string, amount: number) => void;
  likePost: (postId: string) => void;
  likeEpoch2: (proposalId: string) => void;
  redeemOffer: (offerId: string) => Promise<{ ok: boolean; hash?: `0x${string}`; error?: string }>;
  issuerProposeTask: (args: {
    title: string;
    description: string;
    successCriteria: string;
    estimatedTime: string;
    location: string;
    creditReward: number;
    voteReward?: number;
  }) => Promise<{ ok: boolean; hash?: `0x${string}`; proposalId?: bigint; error?: string }>;
  issuerApproveTask: (proposalId: bigint) => Promise<{ ok: boolean; hash?: `0x${string}`; error?: string }>;
  issuerCreateTask: (task: Task) => Promise<{ ok: boolean; hash?: `0x${string}`; taskId: string; error?: string }>;
  issuerVerifyCompletion: (
    taskId: string,
    citizenAddress: string,
  ) => Promise<{ ok: boolean; hash?: `0x${string}`; error?: string }>;
  issuerSetTaskActive: (
    taskId: string,
    active: boolean,
  ) => Promise<{ ok: boolean; hash?: `0x${string}`; error?: string }>;
  redeemerToggleMCE: () => void;
  redeemerAddOffer: (offer: RedemptionOffer) => Promise<{
    ok: boolean;
    hash?: `0x${string}`;
    offerId?: bigint;
    error?: string;
  }>;
  redeemerUpdateOfferRate: (
    offerId: bigint,
    newCostCity: number,
  ) => Promise<{ ok: boolean; hash?: `0x${string}`; error?: string }>;
  redeemerRemoveOffer: (offerId: string) => void;
  redeemerProcessRedemption: (queueId: string) => void;
  dispatch: React.Dispatch<Action>;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const { address } = useAccount({ type: "ModularAccountV2" });
  const { client } = useSmartAccountClient({ type: "ModularAccountV2" });
  const { sendUserOperationAsync } = useSendUserOperation({
    client,
    waitForTxn: true,
  });
  const roleRegisterInFlight = useRef<{ issuer: boolean; redeemer: boolean }>({ issuer: false, redeemer: false });
  const autoRegisteredForRef = useRef<string | null>(null);
  const taskStateHydratedRef = useRef(false);
  // ── CU throttle: minimum interval between focus/visibility-triggered RPC syncs ──
  const FOCUS_SYNC_COOLDOWN_MS = 60_000; // 60 seconds between background re-syncs
  const lastSyncStateMs = useRef<number>(0);
  const lastSyncOffersMs = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(TASK_STATE_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        availableTasks?: Task[];
        issuerTasks?: IssuerTask[];
        totalTasksIssued?: number;
      };
      if (!parsed.availableTasks || !parsed.issuerTasks || typeof parsed.totalTasksIssued !== "number") return;
      dispatch({
        type: "HYDRATE_TASK_STATE",
        availableTasks: parsed.availableTasks,
        issuerTasks: parsed.issuerTasks,
        totalTasksIssued: parsed.totalTasksIssued,
      });
    } catch {
      // Ignore hydration failures.
    } finally {
      taskStateHydratedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!taskStateHydratedRef.current) return;
    try {
      window.localStorage.setItem(
        TASK_STATE_STORAGE_KEY,
        JSON.stringify({
          availableTasks: state.availableTasks,
          issuerTasks: state.issuer.tasks,
          totalTasksIssued: state.issuer.totalTasksIssued,
        }),
      );
    } catch {
      // Ignore persistence failures.
    }
  }, [state.availableTasks, state.issuer.tasks, state.issuer.totalTasksIssued]);

  // ── Redemption history persistence ──────────────────────────────────────────
  const redemptionHydratedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(REDEMPTION_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as PastRedemption[];
      if (!Array.isArray(parsed) || parsed.length === 0) return;
      dispatch({ type: "HYDRATE_REDEMPTIONS", pastRedemptions: parsed });
    } catch {
      // Ignore hydration failures.
    } finally {
      redemptionHydratedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!redemptionHydratedRef.current) return;
    try {
      window.localStorage.setItem(REDEMPTION_STORAGE_KEY, JSON.stringify(state.pastRedemptions));
    } catch {
      // Ignore persistence failures.
    }
  }, [state.pastRedemptions]);

  const normalizeWriteError = useCallback((error: unknown, fallback: string) => {
    if (!(error instanceof Error)) return fallback;
    const lower = error.message.toLowerCase();
    if (
      lower.includes("smart account client unavailable") ||
      lower.includes("session not ready") ||
      lower.includes("no connected issuer wallet")
    ) {
      return "Session not ready. Finish sign-in and retry.";
    }
    return error.message;
  }, []);

  const writeContractAsync = useCallback(
    async (params: {
      address: `0x${string}`;
      abi: readonly unknown[];
      functionName: string;
      args: readonly unknown[];
    }) => {
      if (!client) {
        throw new Error("Session not ready. Finish sign-in and retry.");
      }
      const data = encodeFunctionData({
        abi: params.abi as any,
        functionName: params.functionName as any,
        args: params.args as any,
      });
      const result = await sendUserOperationAsync({
        uo: {
          target: params.address,
          data,
          value: 0n,
        },
      } as any);
      if (typeof window !== "undefined") {
        const w = window as typeof window & { __citysyncActivityRefreshTimer?: number };
        if (w.__citysyncActivityRefreshTimer) {
          window.clearTimeout(w.__citysyncActivityRefreshTimer);
        }
        w.__citysyncActivityRefreshTimer = window.setTimeout(() => {
          window.dispatchEvent(new Event("citysync:activity-refresh"));
          w.__citysyncActivityRefreshTimer = undefined;
        }, 5000);
      }
      return result;
    },
    [client, sendUserOperationAsync],
  );

  const getResultHash = useCallback((result: unknown): `0x${string}` | undefined => {
    if (result && typeof result === "object" && "hash" in result) {
      const hash = (result as { hash?: unknown }).hash;
      if (typeof hash === "string" && hash.startsWith("0x")) return hash as `0x${string}`;
    }
    return undefined;
  }, []);

  const getOpportunityIdFromReceipt = useCallback(async (hash?: `0x${string}`): Promise<bigint | undefined> => {
    if (!hash) return undefined;
    try {
      const receipt = await baseSepoliaPublicClient.getTransactionReceipt({ hash });
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: BASE_SEPOLIA_CONTRACTS.OpportunityManager.abi as any,
            data: log.data,
            topics: log.topics,
            eventName: "OpportunityCreated",
          });
          const maybeId = (decoded.args as { opportunityId?: bigint }).opportunityId;
          if (typeof maybeId === "bigint") return maybeId;
        } catch {
          // Ignore non-matching logs.
        }
      }
    } catch {
      // Ignore receipt parsing errors and fallback to local ID.
    }
    return undefined;
  }, []);

  const getRedeemerOfferIdFromReceipt = useCallback(async (hash?: `0x${string}`): Promise<bigint | undefined> => {
    if (!hash) return undefined;
    try {
      const receipt = await baseSepoliaPublicClient.getTransactionReceipt({ hash });
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.abi as any,
            data: log.data,
            topics: log.topics,
            eventName: "OfferCreated",
          });
          const maybeId = (decoded.args as { offerId?: bigint }).offerId;
          if (typeof maybeId === "bigint") return maybeId;
        } catch {
          // Ignore non-matching logs.
        }
      }
    } catch {
      // Ignore receipt parsing errors.
    }
    return undefined;
  }, []);

  // ── Auto-register both roles on sign-in ───────────────────────────────────
  // As soon as the smart account address and client are available, register the
  // address in both the Issuer and Redeemer registries in a single background
  // pass. This means every sign-in immediately gets a full account — no role
  // selection required before registry membership is established.
  useEffect(() => {
    if (!address || !client) return;
    if (autoRegisteredForRef.current === address) return;
    autoRegisteredForRef.current = address;

    // Hydrate saved profile names — use saved names if they exist, otherwise generate new ones.
    let savedIssuerOrgName: string | null = null;
    let savedRedeemerOrgName: string | null = null;
    let savedCitizenName: string | null = null;
    try {
      const profileKey = `${PROFILE_NAMES_STORAGE_KEY}:${address.toLowerCase()}`;
      const raw = window.localStorage.getItem(profileKey);
      if (raw) {
        const saved = JSON.parse(raw) as {
          citizenName?: string;
          issuerOrgName?: string;
          redeemerOrgName?: string;
        };
        savedIssuerOrgName = saved.issuerOrgName ?? null;
        savedRedeemerOrgName = saved.redeemerOrgName ?? null;
        savedCitizenName = saved.citizenName ?? null;
      }
    } catch {
      // Ignore hydration failures.
    }
    const now = Date.now();
    dispatch({ type: "ISSUER_REGISTER", orgName: savedIssuerOrgName ?? generateIssuerName(now % PREFIXES.length) });
    dispatch({
      type: "REDEEMER_REGISTER",
      orgName: savedRedeemerOrgName ?? generateRedeemerName(now % ADJECTIVES.length),
    });
    if (savedCitizenName) dispatch({ type: "SET_CITIZEN_NAME", name: savedCitizenName });

    void (async () => {
      try {
        const [isIssuer, isRedeemer] = await Promise.all([
          baseSepoliaPublicClient.readContract({
            address: BASE_SEPOLIA_CONTRACTS.IssuerRegistryDemo.address,
            abi: BASE_SEPOLIA_CONTRACTS.IssuerRegistryDemo.abi,
            functionName: "isActiveIssuer",
            args: [address],
          }),
          baseSepoliaPublicClient.readContract({
            address: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.address,
            abi: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.abi,
            functionName: "isActiveRedeemer",
            args: [address],
          }),
        ]);

        await Promise.all([
          isIssuer
            ? Promise.resolve()
            : writeContractAsync({
                address: BASE_SEPOLIA_CONTRACTS.IssuerRegistryDemo.address,
                abi: BASE_SEPOLIA_CONTRACTS.IssuerRegistryDemo.abi,
                functionName: "register",
                args: [],
              }).catch(() => undefined),
          isRedeemer
            ? Promise.resolve()
            : writeContractAsync({
                address: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.address,
                abi: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.abi,
                functionName: "register",
                args: [],
              }).catch(() => undefined),
        ]);
      } catch {
        // Non-fatal — the 6-second onchain sync will reflect state once confirmed.
      }
    })();
  }, [address, client, writeContractAsync]);

  // ── Persist profile names to localStorage ────────────────────────────────────
  // Saves citizenName, issuerOrgName, and redeemerOrgName whenever they change,
  // keyed by wallet address so each user's data stays isolated.
  useEffect(() => {
    if (!address || typeof window === "undefined") return;
    const citizenName = state.participant.citizenName;
    const issuerOrgName = state.issuer.orgName;
    const redeemerOrgName = state.redeemer.orgName;
    // Skip saving if all names are empty (initial state before hydration completes).
    if (!citizenName && !issuerOrgName && !redeemerOrgName) return;
    try {
      const profileKey = `${PROFILE_NAMES_STORAGE_KEY}:${address.toLowerCase()}`;
      window.localStorage.setItem(profileKey, JSON.stringify({ citizenName, issuerOrgName, redeemerOrgName }));
    } catch {
      // Ignore persistence failures.
    }
  }, [address, state.participant.citizenName, state.issuer.orgName, state.redeemer.orgName]);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;

    const syncState = async () => {
      try {
        const [cityRaw, voteRaw, mceRaw, issuerRegistered, redeemerRegistered] =
          await baseSepoliaPublicClient.multicall({
            allowFailure: false,
            contracts: [
              {
                address: BASE_SEPOLIA_CONTRACTS.CityToken.address,
                abi: BASE_SEPOLIA_CONTRACTS.CityToken.abi,
                functionName: "balanceOf",
                args: [address],
              },
              {
                address: BASE_SEPOLIA_CONTRACTS.VoteToken.address,
                abi: BASE_SEPOLIA_CONTRACTS.VoteToken.abi,
                functionName: "balanceOf",
                args: [address],
              },
              {
                address: BASE_SEPOLIA_CONTRACTS.MCECredit.address,
                abi: BASE_SEPOLIA_CONTRACTS.MCECredit.abi,
                functionName: "balanceOf",
                args: [address],
              },
              {
                address: BASE_SEPOLIA_CONTRACTS.IssuerRegistryDemo.address,
                abi: BASE_SEPOLIA_CONTRACTS.IssuerRegistryDemo.abi,
                functionName: "isActiveIssuer",
                args: [address],
              },
              {
                address: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.address,
                abi: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.abi,
                functionName: "isActiveRedeemer",
                args: [address],
              },
            ],
          });

        if (cancelled) return;

        dispatch({
          type: "SYNC_ONCHAIN_STATE",
          cityBalance: Math.floor(Number(formatUnits(cityRaw as bigint, 18))),
          voteBalance: Math.floor(Number(formatUnits(voteRaw as bigint, 18))),
          mceBalance: Math.floor(Number(formatUnits(mceRaw as bigint, 18))),
          issuerRegistered: Boolean(issuerRegistered),
          redeemerRegistered: Boolean(redeemerRegistered),
        });
      } catch {
        // Keep local demo state if read sync fails.
      }
    };

    const refresh = (force = false) => {
      if (cancelled) return;
      const now = Date.now();
      if (!force && now - lastSyncStateMs.current < FOCUS_SYNC_COOLDOWN_MS) return;
      lastSyncStateMs.current = now;
      void syncState();
    };
    const onFocus = () => refresh();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh();
    };

    refresh(true); // always run on mount
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [address, state.role]);

  const syncOnchainOffers = useCallback(async () => {
    try {
      const redeemers = (await baseSepoliaPublicClient.readContract({
        address: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.address,
        abi: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.abi,
        functionName: "getAllRedeemers",
        args: [],
      })) as `0x${string}`[];

      const profileResults = await multicallInChunks(
        redeemers.map(redeemer => ({
          address: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.address,
          abi: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.abi,
          functionName: "getProfile",
          args: [redeemer],
        })),
      );

      const activeRedeemers: Array<{
        redeemer: `0x${string}`;
        profile: { orgName: string; registeredAt: bigint; active: boolean; acceptsMCECredits: boolean };
      }> = [];
      profileResults.forEach((result, idx) => {
        if (!result || result.status !== "success") return;
        const profile = result.result as {
          orgName: string;
          registeredAt: bigint;
          active: boolean;
          acceptsMCECredits: boolean;
        };
        if (!profile.active || profile.registeredAt === 0n) return;
        activeRedeemers.push({ redeemer: redeemers[idx], profile });
      });

      const nextOfferResults = await multicallInChunks(
        activeRedeemers.map(({ redeemer }) => ({
          address: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.address,
          abi: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.abi,
          functionName: "nextOfferId",
          args: [redeemer],
        })),
      );

      const offerLookups: Array<{
        redeemer: `0x${string}`;
        offerId: bigint;
        profile: { orgName: string; registeredAt: bigint; active: boolean; acceptsMCECredits: boolean };
      }> = [];
      nextOfferResults.forEach((result, idx) => {
        if (!result || result.status !== "success") return;
        const nextOfferId = result.result as bigint;
        for (let i = 1n; i <= nextOfferId; i++) {
          offerLookups.push({
            redeemer: activeRedeemers[idx].redeemer,
            offerId: i,
            profile: activeRedeemers[idx].profile,
          });
        }
      });

      const offerResults = await multicallInChunks(
        offerLookups.map(({ redeemer, offerId }) => ({
          address: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.address,
          abi: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.abi,
          functionName: "getOffer",
          args: [redeemer, offerId],
        })),
      );

      const discovered: RedemptionOffer[] = [];
      offerResults.forEach((result, idx) => {
        if (!result || result.status !== "success") return;
        const offer = result.result as {
          name: string;
          description: string;
          costCity: bigint;
          active: boolean;
          mceOnly: boolean;
        };
        if (!offer.active || !offer.name) return;

        const lookup = offerLookups[idx];
        discovered.push({
          id: `onchain:${lookup.redeemer}:${lookup.offerId.toString()}`,
          redeemerName: lookup.profile.orgName || `${lookup.redeemer.slice(0, 6)}...${lookup.redeemer.slice(-4)}`,
          redeemerId: lookup.redeemer,
          offerTitle: offer.name,
          description: offer.description,
          costCity: Math.floor(Number(formatUnits(offer.costCity, 18))),
          acceptsMCE: lookup.profile.acceptsMCECredits,
          mceOnly: offer.mceOnly,
          category: offer.mceOnly ? "Culture" : "Essentials",
          emoji: offer.mceOnly ? "🏆" : "🛒",
        });
      });

      dispatch({ type: "SYNC_ONCHAIN_OFFERS", offers: discovered });
    } catch {
      // Keep last-known offer state if discovery fails.
    }
  }, []);

  useEffect(() => {
    if (state.role !== "participant" && state.role !== "redeemer") return;
    let cancelled = false;

    const syncOffers = async () => {
      try {
        if (cancelled) return;
        await syncOnchainOffers();
      } catch {
        // Keep last-known offer state if discovery fails.
      }
    };

    const refresh = (force = false) => {
      if (cancelled) return;
      const now = Date.now();
      if (!force && now - lastSyncOffersMs.current < FOCUS_SYNC_COOLDOWN_MS) return;
      lastSyncOffersMs.current = now;
      void syncOffers();
    };
    const onFocus = () => refresh();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh();
    };

    refresh(true); // always run on mount
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [state.role, syncOnchainOffers]);

  const setRole = useCallback(
    (role: Role) => {
      dispatch({ type: "SET_ROLE", role });

      if (!address) return;

      if (role === "issuer" && !state.issuer.registered && !roleRegisterInFlight.current.issuer) {
        roleRegisterInFlight.current.issuer = true;
        void writeContractAsync({
          address: BASE_SEPOLIA_CONTRACTS.IssuerRegistryDemo.address,
          abi: BASE_SEPOLIA_CONTRACTS.IssuerRegistryDemo.abi,
          functionName: "register",
          args: [],
        })
          .catch(() => undefined)
          .finally(() => {
            roleRegisterInFlight.current.issuer = false;
          });
      }

      if (role === "redeemer" && !state.redeemer.registered && !roleRegisterInFlight.current.redeemer) {
        roleRegisterInFlight.current.redeemer = true;
        void writeContractAsync({
          address: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.address,
          abi: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.abi,
          functionName: "register",
          args: [],
        })
          .catch(() => undefined)
          .finally(() => {
            roleRegisterInFlight.current.redeemer = false;
          });
      }
    },
    [address, state.issuer.registered, state.redeemer.registered, writeContractAsync],
  );

  // Keep demo redeemer onboarding smooth:
  // if the first register write happened before session readiness (or failed transiently),
  // keep retrying while user is in Redeemer role until onchain registry reflects active status.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!address || !client) return;
    if (state.role !== "redeemer") return;
    if (state.redeemer.registered) return;

    let cancelled = false;
    const attemptRegister = async () => {
      if (cancelled || roleRegisterInFlight.current.redeemer) return;
      roleRegisterInFlight.current.redeemer = true;
      try {
        await writeContractAsync({
          address: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.address,
          abi: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.abi,
          functionName: "register",
          args: [],
        });
      } catch {
        // Keep retry loop alive until registration succeeds or user leaves role.
      } finally {
        roleRegisterInFlight.current.redeemer = false;
      }
    };

    void attemptRegister();
    const id = window.setInterval(() => {
      void attemptRegister();
    }, 30_000); // 30s retry — keeps registration smooth without hammering the RPC

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [address, client, state.redeemer.registered, state.role, writeContractAsync]);

  const setCitizenName = useCallback((name: string) => dispatch({ type: "SET_CITIZEN_NAME", name }), []);
  const claimTask = useCallback(
    async (taskId: string) => {
      dispatch({ type: "CLAIM_TASK", taskId });

      const opportunityId = parseTaskOpportunityId(taskId);
      if (!opportunityId) return { ok: false, error: "Invalid opportunity id." };

      try {
        const result = await writeContractAsync({
          address: BASE_SEPOLIA_CONTRACTS.OpportunityManager.address,
          abi: BASE_SEPOLIA_CONTRACTS.OpportunityManager.abi,
          functionName: "claimOpportunity",
          args: [opportunityId],
        });
        return { ok: true, hash: getResultHash(result) };
      } catch (error) {
        // Roll back optimistic local claim when onchain write fails.
        dispatch({ type: "UNCLAIM_TASK", taskId });
        const message = normalizeWriteError(error, "Claim failed");
        return { ok: false, error: message };
      }
    },
    [getResultHash, normalizeWriteError, writeContractAsync],
  );

  const unclaimTask = useCallback(
    async (taskId: string) => {
      dispatch({ type: "UNCLAIM_TASK", taskId });

      const opportunityId = parseTaskOpportunityId(taskId);
      if (!opportunityId) return { ok: false, error: "Invalid opportunity id." };

      try {
        const result = await writeContractAsync({
          address: BASE_SEPOLIA_CONTRACTS.OpportunityManager.address,
          abi: BASE_SEPOLIA_CONTRACTS.OpportunityManager.abi,
          functionName: "unclaimOpportunity",
          args: [opportunityId],
        });
        return { ok: true, hash: getResultHash(result) };
      } catch (error) {
        // Roll back optimistic local unclaim when onchain write fails.
        dispatch({ type: "CLAIM_TASK", taskId });
        const message = normalizeWriteError(error, "Unclaim failed");
        return { ok: false, error: message };
      }
    },
    [getResultHash, normalizeWriteError, writeContractAsync],
  );

  const startVerify = useCallback(
    (taskId: string, taskTitle: string) => {
      dispatch({ type: "START_VERIFY", taskId, taskTitle });
      return new Promise<{ ok: boolean; hash?: `0x${string}`; error?: string }>(resolve => {
        let remaining = VERIFY_DURATION;
        const interval = window.setInterval(() => {
          remaining -= 1;
          dispatch({ type: "TICK_VERIFY" });
          if (remaining <= 0) {
            window.clearInterval(interval);

            const opportunityId = parseTaskOpportunityId(taskId);
            if (!opportunityId) {
              dispatch({ type: "COMPLETE_VERIFY" });
              resolve({ ok: false, error: "Invalid opportunity id." });
              return;
            }

            const proofHash = keccak256(stringToHex(`${taskId}:${taskTitle}:${Date.now()}`));
            void (async () => {
              try {
                const result = await writeContractAsync({
                  address: BASE_SEPOLIA_CONTRACTS.OpportunityManager.address,
                  abi: BASE_SEPOLIA_CONTRACTS.OpportunityManager.abi,
                  functionName: "submitCompletion",
                  args: [opportunityId, proofHash],
                });
                dispatch({ type: "COMPLETE_VERIFY" });
                resolve({ ok: true, hash: getResultHash(result) });
              } catch (error) {
                dispatch({ type: "COMPLETE_VERIFY" });
                resolve({ ok: false, error: normalizeWriteError(error, "Submit completion failed") });
              }
            })();
          }
        }, 1000);
      });
    },
    [getResultHash, normalizeWriteError, writeContractAsync],
  );

  const allocateMceVote = useCallback(
    (mceId: string, amount: number) => dispatch({ type: "ALLOCATE_MCE_VOTE", mceId, amount }),
    [],
  );

  const likePost = useCallback((postId: string) => dispatch({ type: "LIKE_POST", postId }), []);
  const likeEpoch2 = useCallback((proposalId: string) => dispatch({ type: "LIKE_EPOCH2", proposalId }), []);

  const redeemOffer = useCallback(
    async (offerId: string) => {
      const offer = state.offers.find(o => o.id === offerId);
      if (!offer) return { ok: false, error: "Offer not found." };

      try {
        const assertRedeemable = async (redeemer: `0x${string}`, expectedOfferId: bigint) => {
          const profile = (await baseSepoliaPublicClient.readContract({
            address: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.address,
            abi: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.abi,
            functionName: "getProfile",
            args: [redeemer],
          })) as { registeredAt: bigint; active: boolean };

          if (!profile.active || profile.registeredAt === 0n) {
            return { ok: false as const, error: "Redeemer account is not active onchain yet." };
          }

          const onchainOffer = (await baseSepoliaPublicClient.readContract({
            address: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.address,
            abi: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.abi,
            functionName: "getOffer",
            args: [redeemer, expectedOfferId],
          })) as { name: string; active: boolean; mceOnly: boolean };

          if (!onchainOffer.active || !onchainOffer.name) {
            return { ok: false as const, error: "Offering is not active onchain." };
          }

          if (!offer.mceOnly && onchainOffer.mceOnly) {
            return { ok: false as const, error: "Offering is MCE-only and cannot be redeemed with CITY." };
          }

          return { ok: true as const };
        };

        const onchainRoute = parseOnchainOfferId(offerId);
        if (onchainRoute) {
          const preflight = await assertRedeemable(onchainRoute.redeemer, onchainRoute.offerId);
          if (!preflight.ok) return { ok: false, error: preflight.error };

          if (offer.mceOnly) {
            const result = await writeContractAsync({
              address: BASE_SEPOLIA_CONTRACTS.MCERedemption.address,
              abi: BASE_SEPOLIA_CONTRACTS.MCERedemption.abi,
              functionName: "purchaseOffer",
              args: [onchainRoute.redeemer, onchainRoute.offerId],
            });
            const hash = getResultHash(result);
            dispatch({ type: "REDEEM_OFFER", offerId, txHash: hash });
            return { ok: true, hash };
          }

          const result = await writeContractAsync({
            address: BASE_SEPOLIA_CONTRACTS.DemoCityRedemption.address,
            abi: BASE_SEPOLIA_CONTRACTS.DemoCityRedemption.abi,
            functionName: "purchaseOffer",
            args: [onchainRoute.redeemer, onchainRoute.offerId],
          });
          const hash = getResultHash(result);
          dispatch({ type: "REDEEM_OFFER", offerId, txHash: hash });
          return { ok: true, hash };
        }

        const route = DEMO_OFFER_ROUTES[offerId];
        if (!route) {
          return { ok: false, error: "Offer route not configured for onchain redemption." };
        }

        const preflight = await assertRedeemable(route.redeemer, route.offerId);
        if (!preflight.ok) return { ok: false, error: preflight.error };

        if (route.mode === "mce" || offer.mceOnly) {
          const result = await writeContractAsync({
            address: BASE_SEPOLIA_CONTRACTS.MCERedemption.address,
            abi: BASE_SEPOLIA_CONTRACTS.MCERedemption.abi,
            functionName: "purchaseOffer",
            args: [route.redeemer, route.offerId],
          });
          const hash = getResultHash(result);
          dispatch({ type: "REDEEM_OFFER", offerId, txHash: hash });
          return { ok: true, hash };
        }

        const result = await writeContractAsync({
          address: BASE_SEPOLIA_CONTRACTS.DemoCityRedemption.address,
          abi: BASE_SEPOLIA_CONTRACTS.DemoCityRedemption.abi,
          functionName: "purchaseOffer",
          args: [route.redeemer, route.offerId],
        });
        const hash = getResultHash(result);
        dispatch({ type: "REDEEM_OFFER", offerId, txHash: hash });
        return { ok: true, hash };
      } catch (error) {
        return { ok: false, error: normalizeWriteError(error, "Redemption failed") };
      }
    },
    [getResultHash, normalizeWriteError, state.offers, writeContractAsync],
  );

  // ── Proposal helpers ─────────────────────────────────────────────────────────

  const getProposalIdFromReceipt = useCallback(async (hash?: `0x${string}`): Promise<bigint | undefined> => {
    if (!hash) return undefined;
    try {
      const receipt = await baseSepoliaPublicClient.getTransactionReceipt({ hash });
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: BASE_SEPOLIA_CONTRACTS.TaskProposalRegistry.abi as any,
            data: log.data,
            topics: log.topics,
            eventName: "TaskProposed",
          });
          const maybeId = (decoded.args as { proposalId?: bigint }).proposalId;
          if (typeof maybeId === "bigint") return maybeId;
        } catch {
          // Ignore non-matching logs.
        }
      }
    } catch {
      // Ignore receipt parsing errors.
    }
    return undefined;
  }, []);

  const issuerProposeTask = useCallback(
    async (args: {
      title: string;
      description: string;
      successCriteria: string;
      estimatedTime: string;
      location: string;
      creditReward: number;
      voteReward?: number;
    }) => {
      try {
        const result = await writeContractAsync({
          address: BASE_SEPOLIA_CONTRACTS.TaskProposalRegistry.address,
          abi: BASE_SEPOLIA_CONTRACTS.TaskProposalRegistry.abi,
          functionName: "proposeTask",
          args: [
            args.title,
            args.description,
            args.successCriteria,
            args.estimatedTime,
            args.location,
            BigInt(Math.max(1, args.creditReward)),
            BigInt(Math.max(0, args.voteReward ?? 0)),
          ],
        });
        const hash = getResultHash(result);
        const proposalId = await getProposalIdFromReceipt(hash);
        return { ok: true, hash, proposalId };
      } catch (error) {
        return { ok: false, error: normalizeWriteError(error, "Task proposal failed") };
      }
    },
    [getProposalIdFromReceipt, getResultHash, normalizeWriteError, writeContractAsync],
  );

  const issuerApproveTask = useCallback(
    async (proposalId: bigint) => {
      try {
        const result = await writeContractAsync({
          address: BASE_SEPOLIA_CONTRACTS.TaskProposalRegistry.address,
          abi: BASE_SEPOLIA_CONTRACTS.TaskProposalRegistry.abi,
          functionName: "approveTask",
          args: [proposalId],
        });
        return { ok: true, hash: getResultHash(result) };
      } catch (error) {
        return { ok: false, error: normalizeWriteError(error, "Task approval failed") };
      }
    },
    [getResultHash, normalizeWriteError, writeContractAsync],
  );

  // ─────────────────────────────────────────────────────────────────────────────

  const issuerCreateTask = useCallback(
    async (task: Task) => {
      const rewardCity = parseUnits(String(Math.max(0, task.credits)), 18);
      const rewardVote = parseUnits(String(Math.max(0, task.voteTokens)), 18);
      const taskWithTutorialMeta = task as Task & {
        tutorialOwner?: `0x${string}`;
        tutorialRunId?: string;
      };
      const metadataURI = JSON.stringify({
        title: task.title,
        description: task.description,
        taskDate: task.taskDate,
        location: task.location,
        category: task.category,
        estimatedTime: task.estimatedTime,
        successCriteria: task.successCriteria,
        creditRatePerHr: task.creditRatePerHr,
        credentials: task.credentials,
        tags: task.tags,
        isOnboarding: task.isOnboarding,
        tutorialOwner: taskWithTutorialMeta.tutorialOwner,
        tutorialRunId: taskWithTutorialMeta.tutorialRunId,
      });

      if (!address) {
        return {
          ok: false,
          taskId: task.id,
          error: "Session not ready. Finish sign-in to activate your issuer account.",
        };
      }

      try {
        const isActiveIssuer = (await baseSepoliaPublicClient.readContract({
          address: BASE_SEPOLIA_CONTRACTS.IssuerRegistryDemo.address,
          abi: BASE_SEPOLIA_CONTRACTS.IssuerRegistryDemo.abi,
          functionName: "isActiveIssuer",
          args: [address],
        })) as boolean;

        if (!isActiveIssuer) {
          return {
            ok: false,
            taskId: task.id,
            error: "Issuer account is not active in IssuerRegistry. Register issuer profile first.",
          };
        }
      } catch {
        // If preflight check fails, continue and let write path determine success.
      }

      try {
        const result = await writeContractAsync({
          address: BASE_SEPOLIA_CONTRACTS.OpportunityManager.address,
          abi: BASE_SEPOLIA_CONTRACTS.OpportunityManager.abi,
          functionName: "createOpportunity",
          args: [
            metadataURI,
            rewardCity,
            rewardVote,
            "0x0000000000000000000000000000000000000000",
            0,
            BigInt(task.slots),
            0n,
            0n,
          ],
        });

        const hash = getResultHash(result);
        const opportunityId = await getOpportunityIdFromReceipt(hash);
        const finalTaskId = opportunityId !== undefined ? `task-${opportunityId.toString()}` : task.id;
        dispatch({ type: "ISSUER_CREATE_TASK", task: { ...task, id: finalTaskId } });
        return { ok: true, hash, taskId: finalTaskId };
      } catch (error) {
        const message = normalizeWriteError(error, "Task issuance failed");
        return { ok: false, taskId: task.id, error: message };
      }
    },
    [address, getOpportunityIdFromReceipt, getResultHash, normalizeWriteError, writeContractAsync],
  );

  const issuerVerifyCompletion = useCallback(
    async (taskId: string, citizenAddress: string) => {
      dispatch({ type: "ISSUER_VERIFY_COMPLETION", taskId, citizenAddress });

      const opportunityId = parseTaskOpportunityId(taskId);
      if (!opportunityId) return { ok: false, error: "Invalid opportunity id." };

      try {
        const result = await writeContractAsync({
          address: BASE_SEPOLIA_CONTRACTS.OpportunityManager.address,
          abi: BASE_SEPOLIA_CONTRACTS.OpportunityManager.abi,
          functionName: "verifyCompletion",
          args: [opportunityId, citizenAddress as `0x${string}`],
        });
        return { ok: true, hash: getResultHash(result) };
      } catch (error) {
        const message = normalizeWriteError(error, "Verify completion failed");
        return { ok: false, error: message };
      }
    },
    [getResultHash, normalizeWriteError, writeContractAsync],
  );

  const issuerSetTaskActive = useCallback(
    async (taskId: string, active: boolean) => {
      const opportunityId = parseTaskOpportunityId(taskId);
      if (!opportunityId) return { ok: false, error: "Invalid opportunity id." };

      try {
        const result = await writeContractAsync({
          address: BASE_SEPOLIA_CONTRACTS.OpportunityManager.address,
          abi: BASE_SEPOLIA_CONTRACTS.OpportunityManager.abi,
          functionName: "setOpportunityActive",
          args: [opportunityId, active],
        });
        return { ok: true, hash: getResultHash(result) };
      } catch (error) {
        const message = normalizeWriteError(error, "setOpportunityActive failed");
        return { ok: false, error: message };
      }
    },
    [getResultHash, normalizeWriteError, writeContractAsync],
  );

  const redeemerToggleMCE = useCallback(() => {
    const next = !state.redeemer.acceptsMCE;
    dispatch({ type: "REDEEMER_TOGGLE_MCE" });

    void writeContractAsync({
      address: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.address,
      abi: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.abi,
      functionName: "setMCEOptIn",
      args: [next],
    }).catch(() => undefined);
  }, [state.redeemer.acceptsMCE, writeContractAsync]);

  const redeemerAddOffer = useCallback(
    async (offer: RedemptionOffer) => {
      try {
        if (!address) {
          return { ok: false, error: "Wallet not ready. Please wait a few seconds and try again." };
        }

        const isActiveRedeemer = (await baseSepoliaPublicClient.readContract({
          address: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.address,
          abi: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.abi,
          functionName: "isActiveRedeemer",
          args: [address],
        })) as boolean;

        if (!isActiveRedeemer) {
          try {
            await writeContractAsync({
              address: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.address,
              abi: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.abi,
              functionName: "register",
              args: [],
            });
          } catch (registerError) {
            const message = normalizeWriteError(registerError, "Redeemer registration failed");
            return { ok: false, error: message };
          }

          return {
            ok: false,
            error: "Redeemer registration submitted onchain. Retry Commit Offering in a few seconds.",
          };
        }

        if (offer.mceOnly && !state.redeemer.acceptsMCE) {
          await writeContractAsync({
            address: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.address,
            abi: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.abi,
            functionName: "setMCEOptIn",
            args: [true],
          });
          dispatch({ type: "REDEEMER_SET_MCE_OPT_IN", value: true });
        }

        const result = await writeContractAsync({
          address: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.address,
          abi: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.abi,
          functionName: "createOffer",
          args: [
            offer.offerTitle,
            offer.description,
            parseUnits(String(Math.max(0, offer.costCity)), 18),
            offer.mceOnly,
          ],
        });
        const hash = getResultHash(result);
        const offerId = await getRedeemerOfferIdFromReceipt(hash);
        void syncOnchainOffers();
        return { ok: true, hash, offerId };
      } catch (error) {
        const message = normalizeWriteError(error, "Offer creation failed");
        return { ok: false, error: message };
      }
    },
    [
      address,
      getRedeemerOfferIdFromReceipt,
      getResultHash,
      normalizeWriteError,
      state.redeemer.acceptsMCE,
      syncOnchainOffers,
      writeContractAsync,
    ],
  );

  const redeemerUpdateOfferRate = useCallback(
    async (offerId: bigint, newCostCity: number) => {
      try {
        const result = await writeContractAsync({
          address: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.address,
          abi: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.abi,
          functionName: "updateOfferRate",
          args: [offerId, parseUnits(String(Math.max(0, newCostCity)), 18)],
        });
        void syncOnchainOffers();
        return { ok: true, hash: getResultHash(result) };
      } catch (error) {
        const message = normalizeWriteError(error, "Offer rate update failed");
        return { ok: false, error: message };
      }
    },
    [getResultHash, normalizeWriteError, syncOnchainOffers, writeContractAsync],
  );

  const redeemerRemoveOffer = useCallback(
    (offerId: string) => {
      dispatch({ type: "REDEEMER_REMOVE_OFFER", offerId });

      const id = parseNumericSuffix(offerId);
      if (!id) return;

      void writeContractAsync({
        address: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.address,
        abi: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.abi,
        functionName: "removeOffer",
        args: [id],
      }).catch(() => undefined);
    },
    [writeContractAsync],
  );

  const redeemerProcessRedemption = useCallback(
    (queueId: string) => dispatch({ type: "REDEEMER_PROCESS_REDEMPTION", queueId }),
    [],
  );

  return (
    <DemoContext.Provider
      value={{
        state,
        setRole,
        setCitizenName,
        claimTask,
        unclaimTask,
        startVerify,
        allocateMceVote,
        likePost,
        likeEpoch2,
        redeemOffer,
        issuerProposeTask,
        issuerApproveTask,
        issuerCreateTask,
        issuerVerifyCompletion,
        issuerSetTaskActive,
        redeemerToggleMCE,
        redeemerAddOffer,
        redeemerUpdateOfferRate,
        redeemerRemoveOffer,
        redeemerProcessRedemption,
        dispatch,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}

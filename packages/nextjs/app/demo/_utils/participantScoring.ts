export type ParticipantScoreEventType = "verify_mint" | "reject_mint" | "no_show";

export type ParticipantSanctionTier = "Green" | "Yellow" | "Orange" | "Red";

export type ParticipantScoreEvent = {
  id: string;
  type: ParticipantScoreEventType;
  taskId: string;
  issuerAddress?: string;
  feedback?: string;
  rsDelta: number;
  dbDelta: number;
  at: string;
};

export type ParticipantScoreSnapshot = {
  participantAddress: string;
  rs: number;
  db: number;
  tier: ParticipantSanctionTier;
  successfulVerifications: number;
  rejectedVerifications: number;
  noShows: number;
  totalEvents: number;
  consecutiveSuccesses: number;
  lastEventType?: ParticipantScoreEventType;
  lastUpdatedAt: string;
  events: ParticipantScoreEvent[];
};

type ScoreStore = Record<string, ParticipantScoreSnapshot>;

export type ParticipantSanctionPolicy = {
  tier: ParticipantSanctionTier;
  maxActiveClaims: number;
  blockPremiumTasks: boolean;
  maxEstimatedHours: number | null;
  summary: string;
};

export const PARTICIPANT_SCORE_STORAGE_KEY = "citysync:demo:participant:db-rs:v1";
export const PREMIUM_TASK_RATE_THRESHOLD = 10; // CITYx/hour

const EVENT_WEIGHTS: Record<ParticipantScoreEventType, { rsDelta: number; dbDelta: number }> = {
  verify_mint: { rsDelta: 0.5, dbDelta: -0.5 },
  reject_mint: { rsDelta: -1.5, dbDelta: 2 },
  no_show: { rsDelta: -1, dbDelta: 1 },
};

const round2 = (value: number) => Math.round(value * 100) / 100;

const normalizeAddress = (address: string) => address.trim().toLowerCase();

const nowIso = () => new Date().toISOString();

const getTierFromDebt = (db: number): ParticipantSanctionTier => {
  if (db >= 5) return "Red";
  if (db >= 3) return "Orange";
  if (db >= 1.5) return "Yellow";
  return "Green";
};

const emptySnapshot = (participantAddress: string): ParticipantScoreSnapshot => ({
  participantAddress: normalizeAddress(participantAddress),
  rs: 0,
  db: 0,
  tier: "Green",
  successfulVerifications: 0,
  rejectedVerifications: 0,
  noShows: 0,
  totalEvents: 0,
  consecutiveSuccesses: 0,
  lastUpdatedAt: nowIso(),
  events: [],
});

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readStore = (): ScoreStore => {
  if (!canUseStorage()) return {};
  try {
    const raw = window.localStorage.getItem(PARTICIPANT_SCORE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ScoreStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeStore = (store: ScoreStore): void => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(PARTICIPANT_SCORE_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore localStorage failures.
  }
};

export const getParticipantScoreSnapshot = (participantAddress: string): ParticipantScoreSnapshot => {
  const key = normalizeAddress(participantAddress);
  const store = readStore();
  return store[key] ?? emptySnapshot(key);
};

export const getAllParticipantScoreSnapshots = (): ParticipantScoreSnapshot[] => {
  const store = readStore();
  return Object.values(store).sort((a, b) => b.db - a.db || b.totalEvents - a.totalEvents);
};

export const getSanctionPolicyForSnapshot = (snapshot: ParticipantScoreSnapshot): ParticipantSanctionPolicy => {
  switch (snapshot.tier) {
    case "Yellow":
      return {
        tier: "Yellow",
        maxActiveClaims: 1,
        blockPremiumTasks: true,
        maxEstimatedHours: null,
        summary: "Max 1 active claim. Premium/high-rate tasks are blocked.",
      };
    case "Orange":
      return {
        tier: "Orange",
        maxActiveClaims: 1,
        blockPremiumTasks: true,
        maxEstimatedHours: 1,
        summary: "Max 1 active claim. Only tasks up to 1 hour. Premium tasks are blocked.",
      };
    case "Red":
      return {
        tier: "Red",
        maxActiveClaims: 1,
        blockPremiumTasks: true,
        maxEstimatedHours: 1,
        summary: "Max 1 low-risk claim at a time. Focus is on recovery via successful completions.",
      };
    default:
      return {
        tier: "Green",
        maxActiveClaims: 2,
        blockPremiumTasks: false,
        maxEstimatedHours: null,
        summary: "Standard claiming permissions.",
      };
  }
};

export const applyParticipantScoreEvent = (input: {
  participantAddress: string;
  taskId: string;
  type: ParticipantScoreEventType;
  issuerAddress?: string;
  feedback?: string;
}): ParticipantScoreSnapshot | null => {
  if (!canUseStorage()) return null;

  const participantKey = normalizeAddress(input.participantAddress);
  const store = readStore();
  const current = store[participantKey] ?? emptySnapshot(participantKey);
  const weights = EVENT_WEIGHTS[input.type];

  const nextDb = Math.max(0, round2(current.db + weights.dbDelta));
  const nextRs = round2(current.rs + weights.rsDelta);

  const event: ParticipantScoreEvent = {
    id: `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`,
    type: input.type,
    taskId: input.taskId,
    issuerAddress: input.issuerAddress?.toLowerCase(),
    feedback: input.feedback?.trim() || undefined,
    rsDelta: weights.rsDelta,
    dbDelta: weights.dbDelta,
    at: nowIso(),
  };

  const next: ParticipantScoreSnapshot = {
    ...current,
    rs: nextRs,
    db: nextDb,
    tier: getTierFromDebt(nextDb),
    successfulVerifications: current.successfulVerifications + (input.type === "verify_mint" ? 1 : 0),
    rejectedVerifications: current.rejectedVerifications + (input.type === "reject_mint" ? 1 : 0),
    noShows: current.noShows + (input.type === "no_show" ? 1 : 0),
    totalEvents: current.totalEvents + 1,
    consecutiveSuccesses: input.type === "verify_mint" ? current.consecutiveSuccesses + 1 : 0,
    lastEventType: input.type,
    lastUpdatedAt: event.at,
    events: [event, ...current.events].slice(0, 200),
  };

  store[participantKey] = next;
  writeStore(store);
  return next;
};

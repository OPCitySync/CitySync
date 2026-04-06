export const DEMO_TUTORIAL_RUN_STORAGE_KEY = "citysync:demo:tutorial:run:v1";
export const DEMO_TUTORIAL_HANDOFF_STORAGE_KEY = "citysync:demo:tutorial:handoff:v1";
export const DEMO_TUTORIAL_HIDDEN_TASK_IDS_STORAGE_KEY = "citysync:demo:tutorial:hidden-task-ids:v1";
export const DEMO_TUTORIAL_EXTERNAL_START_STORAGE_KEY = "citysync:demo:tutorial:external-start:v1";
export const ISSUER_TUTORIAL_STEP_STORAGE_KEY = "citysync:demo:issuer:tutorial:v1";
export const SHARED_TUTORIAL_INTRO_TEXT =
  "Everything in this demo has a shared onchain state for critical functions, and local storage that allows edits to your profile, picture, etc. to persist.\n\nEvery transaction you make is visible to all users and roles. When you sign up for City/Sync you are automatically provided a wallet, and all transaction costs are sponsored.\n\nWhile transaction verification will be shown in this demo, users in the Pilot Program will be completely unaware of smart-contract interactions. The purpose of this demo is to simulate as closely as possible to the UX for each role in the pilot, and provide testers an understanding of the underlying functionality. Let's get started!";
const DEMO_ISSUER_CATALOG_STORAGE_PREFIX = "citysync:demo:issuer:catalog:v1";
const DEMO_TUTORIAL_HANDOFF_TTL_MS = 30_000;

export type DemoTutorialRun = {
  runId: string;
  createdAt: number;
  taskIds: string[];
  offeringIds: string[];
  catalogTaskIds: string[];
  ownerAddress?: string;
};

export type DemoTutorialRole = "issuer" | "participant" | "redeemer";

type DemoTutorialHandoff = {
  role: DemoTutorialRole;
  step: string;
  expiresAt: number;
};

const isBrowser = () => typeof window !== "undefined";

const generateRunId = () => `run-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const sanitizeStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string" && entry.length > 0) : [];

export const readDemoTutorialRun = (): DemoTutorialRun | null => {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(DEMO_TUTORIAL_RUN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DemoTutorialRun>;
    if (
      parsed &&
      typeof parsed.runId === "string" &&
      typeof parsed.createdAt === "number" &&
      Array.isArray(parsed.taskIds)
    ) {
      const taskIds = sanitizeStringArray(parsed.taskIds);
      const offeringIds = sanitizeStringArray(parsed.offeringIds);
      const catalogTaskIds = sanitizeStringArray((parsed as Partial<DemoTutorialRun>).catalogTaskIds);
      return {
        runId: parsed.runId,
        createdAt: parsed.createdAt,
        taskIds,
        offeringIds,
        catalogTaskIds,
        ownerAddress:
          typeof (parsed as Partial<DemoTutorialRun>).ownerAddress === "string"
            ? (parsed as Partial<DemoTutorialRun>).ownerAddress
            : undefined,
      };
    }
  } catch {
    // Ignore malformed localStorage state.
  }
  return null;
};

const persistDemoTutorialRun = (run: DemoTutorialRun): DemoTutorialRun => {
  if (!isBrowser()) return run;
  try {
    window.localStorage.setItem(DEMO_TUTORIAL_RUN_STORAGE_KEY, JSON.stringify(run));
  } catch {
    // Ignore localStorage write failures.
  }
  return run;
};

export const startDemoTutorialRun = (): DemoTutorialRun =>
  persistDemoTutorialRun({
    runId: generateRunId(),
    createdAt: Date.now(),
    taskIds: [],
    offeringIds: [],
    catalogTaskIds: [],
    ownerAddress: undefined,
  });

export const startDemoTutorialRunForAddress = (ownerAddress?: string | null): DemoTutorialRun =>
  persistDemoTutorialRun({
    runId: generateRunId(),
    createdAt: Date.now(),
    taskIds: [],
    offeringIds: [],
    catalogTaskIds: [],
    ownerAddress: typeof ownerAddress === "string" && ownerAddress.length > 0 ? ownerAddress : undefined,
  });

export const appendDemoTutorialTaskIds = (taskIds: string[]): DemoTutorialRun | null => {
  const sanitized = taskIds.filter(id => typeof id === "string" && id.length > 0);
  if (sanitized.length === 0) return readDemoTutorialRun();
  const current = readDemoTutorialRun();
  if (!current) return null;
  const merged = Array.from(new Set([...current.taskIds, ...sanitized]));
  return persistDemoTutorialRun({
    ...current,
    taskIds: merged,
  });
};

export const getDemoTutorialTaskIds = (): string[] => readDemoTutorialRun()?.taskIds ?? [];

export const appendDemoTutorialCatalogTaskIds = (catalogTaskIds: string[]): DemoTutorialRun | null => {
  const sanitized = catalogTaskIds.filter(id => typeof id === "string" && id.length > 0);
  if (sanitized.length === 0) return readDemoTutorialRun();
  const current = readDemoTutorialRun();
  if (!current) return null;
  const merged = Array.from(new Set([...current.catalogTaskIds, ...sanitized]));
  return persistDemoTutorialRun({
    ...current,
    catalogTaskIds: merged,
  });
};

export const getDemoTutorialCatalogTaskIds = (): string[] => readDemoTutorialRun()?.catalogTaskIds ?? [];

export const appendDemoTutorialOfferingIds = (offeringIds: string[]): DemoTutorialRun | null => {
  const sanitized = offeringIds.filter(id => typeof id === "string" && id.length > 0);
  if (sanitized.length === 0) return readDemoTutorialRun();
  const current = readDemoTutorialRun();
  if (!current) return null;
  const merged = Array.from(new Set([...current.offeringIds, ...sanitized]));
  return persistDemoTutorialRun({
    ...current,
    offeringIds: merged,
  });
};

export const getDemoTutorialOfferingIds = (): string[] => readDemoTutorialRun()?.offeringIds ?? [];

export const getDemoTutorialHiddenTaskIds = (): string[] => {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(DEMO_TUTORIAL_HIDDEN_TASK_IDS_STORAGE_KEY);
    if (!raw) return [];
    return sanitizeStringArray(JSON.parse(raw));
  } catch {
    return [];
  }
};

export const appendDemoTutorialHiddenTaskIds = (taskIds: string[]): string[] => {
  if (!isBrowser()) return [];
  const sanitized = taskIds.filter(id => typeof id === "string" && id.length > 0);
  if (sanitized.length === 0) return getDemoTutorialHiddenTaskIds();
  const merged = Array.from(new Set([...getDemoTutorialHiddenTaskIds(), ...sanitized]));
  try {
    window.localStorage.setItem(DEMO_TUTORIAL_HIDDEN_TASK_IDS_STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // Ignore localStorage write failures.
  }
  return merged;
};

export const cleanupDemoTutorialArtifacts = (opts?: {
  address?: string | null;
  clearRun?: boolean;
}): { taskIds: string[]; hiddenTaskIds: string[]; removedCatalogTaskIds: string[] } => {
  if (!isBrowser()) return { taskIds: [], hiddenTaskIds: [], removedCatalogTaskIds: [] };
  const run = readDemoTutorialRun();
  if (!run) {
    if (opts?.clearRun !== false) clearDemoTutorialRun();
    return { taskIds: [], hiddenTaskIds: getDemoTutorialHiddenTaskIds(), removedCatalogTaskIds: [] };
  }

  const hiddenTaskIds = appendDemoTutorialHiddenTaskIds(run.taskIds);
  const removedCatalogTaskIds: string[] = [];
  const addressLower = (opts?.address ?? run.ownerAddress ?? "").toLowerCase();

  if (addressLower && run.catalogTaskIds.length > 0) {
    const catalogKey = `${DEMO_ISSUER_CATALOG_STORAGE_PREFIX}:${addressLower}`;
    try {
      const raw = window.localStorage.getItem(catalogKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Array<{ id?: unknown }>;
        if (Array.isArray(parsed)) {
          const removeSet = new Set(run.catalogTaskIds);
          const next = parsed.filter(entry => {
            const taskId = typeof entry?.id === "string" ? entry.id : undefined;
            const shouldKeep = !taskId || !removeSet.has(taskId);
            if (!shouldKeep && taskId) removedCatalogTaskIds.push(taskId);
            return shouldKeep;
          });
          if (next.length !== parsed.length) {
            window.localStorage.setItem(catalogKey, JSON.stringify(next));
          }
        }
      }
    } catch {
      // Ignore storage parse/write failures.
    }
  }

  if (opts?.clearRun !== false) clearDemoTutorialRun();
  return {
    taskIds: Array.from(new Set(run.taskIds)),
    hiddenTaskIds,
    removedCatalogTaskIds: Array.from(new Set(removedCatalogTaskIds)),
  };
};

export const setDemoTutorialHandoff = (
  role: DemoTutorialRole,
  step: string,
  ttlMs: number = DEMO_TUTORIAL_HANDOFF_TTL_MS,
): void => {
  if (!isBrowser()) return;
  try {
    const payload: DemoTutorialHandoff = {
      role,
      step,
      expiresAt: Date.now() + Math.max(1_000, ttlMs),
    };
    window.localStorage.setItem(DEMO_TUTORIAL_HANDOFF_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore localStorage write failures.
  }
};

export const consumeDemoTutorialHandoff = (role: DemoTutorialRole): string | null => {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(DEMO_TUTORIAL_HANDOFF_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DemoTutorialHandoff>;
    window.localStorage.removeItem(DEMO_TUTORIAL_HANDOFF_STORAGE_KEY);
    if (!parsed || parsed.role !== role || typeof parsed.step !== "string" || typeof parsed.expiresAt !== "number")
      return null;
    if (parsed.expiresAt < Date.now()) return null;
    return parsed.step;
  } catch {
    return null;
  }
};

export const clearDemoTutorialRun = (): void => {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(DEMO_TUTORIAL_RUN_STORAGE_KEY);
    window.localStorage.removeItem(DEMO_TUTORIAL_HANDOFF_STORAGE_KEY);
  } catch {
    // Ignore localStorage failures.
  }
};

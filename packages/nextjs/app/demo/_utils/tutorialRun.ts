export const DEMO_TUTORIAL_RUN_STORAGE_KEY = "citysync:demo:tutorial:run:v1";

export type DemoTutorialRun = {
  runId: string;
  createdAt: number;
  taskIds: string[];
  offeringIds: string[];
};

const isBrowser = () => typeof window !== "undefined";

const generateRunId = () => `run-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

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
      const taskIds = parsed.taskIds.filter((value): value is string => typeof value === "string" && value.length > 0);
      const offeringIds = Array.isArray(parsed.offeringIds)
        ? parsed.offeringIds.filter((value): value is string => typeof value === "string" && value.length > 0)
        : [];
      return {
        runId: parsed.runId,
        createdAt: parsed.createdAt,
        taskIds,
        offeringIds,
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

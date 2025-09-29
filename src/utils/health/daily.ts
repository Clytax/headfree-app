import {
  FACTOR_KEYS,
  Choice,
  FACTORS,
  FactorKey,
  FactorKind,
  FactorMeta,
  REQUIRED_KEYS,
  isFactorKey,
} from "@/services/dailyFactors";
import type { DailyEntryStore } from "@/store/global/daily/useDailyEntryStore.types";

export type DailyEntryRecord = Partial<Record<FactorKey, any>> & {
  date: string;
  createdAt?: number;
  updatedAt?: number;
};

export const emptyDailyRecord = (): DailyEntryRecord => {
  const base: any = {};
  for (const key of FACTOR_KEYS) base[key] = null;
  return { ...base, date: "" };
};

export const pickFromStore = (store: DailyEntryStore): DailyEntryRecord => {
  const out: any = {};
  for (const key of FACTOR_KEYS) out[key] = (store as any)[key] ?? null;
  return out as DailyEntryRecord;
};

export const applyToStore = (
  update: Partial<DailyEntryRecord>,
  set: (key: keyof DailyEntryStore, value: any) => void
) => {
  for (const key of Object.keys(update)) {
    if (isFactorKey(key))
      set(key as keyof DailyEntryStore, (update as any)[key]);
  }
};

export const isFormValid = (store: DailyEntryStore): boolean => {
  return REQUIRED_KEYS.some(
    (k) => (store as any)[k] !== null && (store as any)[k] !== undefined
  );
};

export const completionPercent = (
  store: DailyEntryStore,
  gender: string | null
): number => {
  const hasCycle = (gender ?? "").toLowerCase() === "female";
  const keys = hasCycle
    ? FACTOR_KEYS
    : FACTOR_KEYS.filter((k) => k !== "menstrualCycle");
  const done = keys.reduce((acc, k) => {
    const v = (store as any)[k];
    return acc + (v !== null && v !== undefined ? 1 : 0);
  }, 0);

  console.log(done);
  return Math.round((done / keys.length) * 100);
};

export const mergeOrUpsertByDate = (
  dailies: DailyEntryRecord[],
  next: DailyEntryRecord
): DailyEntryRecord[] => {
  const idx = dailies.findIndex((e) => e?.date === next.date);
  if (idx === -1) return [...dailies, next];
  const copy = [...dailies];
  copy[idx] = { ...dailies[idx], ...next };
  return copy;
};

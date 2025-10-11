import { useCallback, useEffect, useMemo, useState } from "react";
import { FACTOR_KEYS, FACTORS } from "@/services/dailyFactors";
import {
  applyToStore,
  completionPercent,
  isFormValid,
  pickFromStore,
} from "@/utils/health/daily";
import type { DailyEntryStore } from "@/store/global/daily/useDailyEntryStore.types";

const getTodayISO = () => new Date().toISOString().split("T")[0];

export const useTodayISO = () => {
  const [today, setToday] = useState(getTodayISO());
  useEffect(() => {
    const updateNow = () => setToday(getTodayISO());
    updateNow();
    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0,
      0
    ).getTime();
    const timeout = setTimeout(updateNow, nextMidnight - now.getTime());
    return () => clearTimeout(timeout);
  }, []);
  return today;
};

const useYesterdayISO = () => {
  const [yesterday, setYesterday] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  });
  useEffect(() => {
    const updateNow = () => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      setYesterday(d.toISOString().split("T")[0]);
    };
    updateNow();
    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0,
      0
    ).getTime();
    const timeout = setTimeout(updateNow, nextMidnight - now.getTime());
    return () => clearTimeout(timeout);
  }, []);
  return yesterday;
};

interface Params {
  fullStore: DailyEntryStore;
  updateEntryStore: (key: keyof DailyEntryStore, value: any) => void;
  resetStore: () => void;
  lastDate: string | null;
  setLastDate: (d: string) => void;
  todaysEntry: any | null; // keep name for backward compatibility
  gender: string | null;

  // new optional override to support editing any date
  overrideTodayISO?: string;
}

export const useDailyEntryForm = ({
  fullStore,
  updateEntryStore,
  resetStore,
  lastDate,
  setLastDate,
  todaysEntry,
  gender,
  overrideTodayISO,
}: Params) => {
  const REAL_TODAY_ISO = useTodayISO();
  const TODAY_ISO = overrideTodayISO ?? REAL_TODAY_ISO; // key change
  const YESTERDAY_ISO = useYesterdayISO();

  // ensure the local form store tracks the selected date
  useEffect(() => {
    if (!lastDate || lastDate !== TODAY_ISO) {
      resetStore();
      setLastDate(TODAY_ISO);
    }
  }, [TODAY_ISO, lastDate, resetStore, setLastDate]);

  // hydrate the store with fetched entry for the selected date
  useEffect(() => {
    if (todaysEntry) {
      const patch: any = {};
      for (const key of FACTOR_KEYS) patch[key] = todaysEntry?.[key] ?? null;
      applyToStore(patch, updateEntryStore);
      setLastDate(TODAY_ISO);
    } else {
      // no entry for that date means start with a clean form
      // only clear if we are already on this date
      if (lastDate === TODAY_ISO) {
        resetStore();
      }
      setLastDate(TODAY_ISO);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todaysEntry, updateEntryStore, resetStore, setLastDate, TODAY_ISO]);

  const handleEntryChange = useCallback(
    (key: keyof DailyEntryStore, value: any, isSubmitting: boolean) => {
      if (isSubmitting) return;
      const current = (fullStore as any)[key];
      const newValue = current === value ? null : value;
      updateEntryStore(key, newValue);
      setLastDate(TODAY_ISO);
    },
    [fullStore, updateEntryStore, setLastDate, TODAY_ISO]
  );

  const formValid = useMemo(() => isFormValid(fullStore), [fullStore]);
  const percent = useMemo(
    () => completionPercent(fullStore, gender),
    [fullStore, gender]
  );
  const pickValues = useCallback(() => pickFromStore(fullStore), [fullStore]);

  return {
    TODAY_ISO, // now respects override
    YESTERDAY_ISO,
    FACTORS,
    FACTOR_KEYS,
    handleEntryChange,
    formValid,
    percent,
    pickValues,
  };
};

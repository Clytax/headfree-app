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

interface Params {
  fullStore: DailyEntryStore;
  updateEntryStore: (key: keyof DailyEntryStore, value: any) => void;
  resetStore: () => void;
  lastDate: string | null;
  setLastDate: (d: string) => void;
  todaysEntry: any | null;
  gender: string | null;
}

export const useDailyEntryForm = ({
  fullStore,
  updateEntryStore,
  resetStore,
  lastDate,
  setLastDate,
  todaysEntry,
  gender,
}: Params) => {
  const TODAY_ISO = useTodayISO();

  useEffect(() => {
    if (!lastDate || lastDate !== TODAY_ISO) {
      resetStore();
      setLastDate(TODAY_ISO);
    }
  }, [TODAY_ISO, lastDate, resetStore, setLastDate]);

  useEffect(() => {
    if (todaysEntry) {
      const patch: any = {};
      for (const key of FACTOR_KEYS) patch[key] = todaysEntry?.[key] ?? null;
      applyToStore(patch, updateEntryStore);
      setLastDate(TODAY_ISO);
    } else {
      resetStore();
      setLastDate(TODAY_ISO);
    }
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
    TODAY_ISO,
    FACTORS,
    FACTOR_KEYS,
    handleEntryChange,
    formValid,
    percent,
    pickValues,
  };
};

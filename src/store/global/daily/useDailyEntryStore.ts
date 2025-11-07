import { create } from "zustand";
import { DailyEntryStore } from "@/store/global/daily/useDailyEntryStore.types";

const initialState: DailyEntryStore = {
  stress: null,
  water: null,
  migraineToday: null,
  caffeine: null,
  neckPain: null,
  meals: null,
  sleep: null,
  location: null,
  menstrualCycle: null,
  chocolateOrCheese: null,
  overEating: null,
  alcohol: null,
  smoking: null,
  traveled: null,
  emotion: null,
};

type State = DailyEntryStore & {
  updateEntryStore: <K extends keyof DailyEntryStore>(
    key: K,
    value: DailyEntryStore[K]
  ) => void;
  reset: () => void;
  lastDate: string | null;
  setLastDate: (iso: string) => void;
};

const useDailyEntryStore = create<State>((set) => ({
  ...initialState,
  updateEntryStore: (key, value) => set({ [key]: value } as Partial<State>),
  reset: () => set({ ...initialState }),
  lastDate: null,
  setLastDate: (iso) => set({ lastDate: iso }),
}));

export default useDailyEntryStore;

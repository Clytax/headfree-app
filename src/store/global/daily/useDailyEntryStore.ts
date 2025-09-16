import { create } from "zustand";
import { DailyEntryStore } from "@/store/global/daily/useDailyEntryStore.types";

const initialState: DailyEntryStore = {
  stress: null,
  water: null,
  caffeine: null,
  neckPain: null,
  meals: null,
  sleep: null,
  cycle: null,
  location: null,
};

type State = DailyEntryStore & {
  updateEntryStore: <K extends keyof DailyEntryStore>(
    key: K,
    value: DailyEntryStore[K]
  ) => void;
  reset: () => void;
};

const useDailyEntryStore = create<State>((set) => ({
  ...initialState,
  updateEntryStore: (key, value) => set({ [key]: value } as Partial<State>),
  reset: () => set({ ...initialState }),
}));

export default useDailyEntryStore;

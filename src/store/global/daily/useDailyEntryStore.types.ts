import { IUserLocation } from "@/types/user";

export interface DailyEntryStore {
  stress: number | null;
  water: number | null;
  caffeine: number | null;
  neckPain: number | null;
  meals: number | null;
  sleep: number | null;
  cycle: any | null;
  location: IUserLocation | null;
}

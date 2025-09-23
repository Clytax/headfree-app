import { IMenstrualCycle, ISleepNight } from "@/types/health";
import { IUserLocation } from "@/types/user";

export interface DailyEntryStore {
  stress: number | null;
  water: number | null;
  caffeine: number | null;
  neckPain: number | null;
  meals: number | null;
  chocolateOrCheese: number | null;
  overEating: number | null;

  sleep: ISleepNight | null;
  menstrualCycle: IMenstrualCycle | null;
  location: IUserLocation | null;

  alcohol: number | null;
  smoking: number | null;

  traveled: boolean | null;

  emotion: number | null; // Emotion level (Likert scale 1-5)
}

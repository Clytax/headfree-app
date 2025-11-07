import { IMenstrualCycle, ISleepNight } from "@/types/health";
import { IUserLocation } from "@/types/user";

export interface DailyEntryStore {
  migraineToday: number | null; // 0 = No, 1 = Yes
  stress: number | null;
  caffeine: number | null;
  meals: number | null;
  chocolateOrCheese: number | null;
  overEating: number | null;

  sleep: ISleepNight | null;
  menstrualCycle: IMenstrualCycle | null;
  location: IUserLocation | null;

  alcohol: number | null;
  smoking: number | null;

  traveled: boolean | null;
  lightExposure: number | null; // Hours of light exposure

  emotion: number | null; // Emotion level (Likert scale 1-5)
}

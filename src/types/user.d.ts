import { DailyEntryStore } from "@/store/global/daily/useDailyEntryStore.types";
import { IMenstrualCycle, ISleepNight } from "@/types/health";

export interface IUserDoc {
  privacy: IUserPrivacy;
  profile: IUserProfile | null;
  baseline: IUserBaseline | null;
  dailies?: IUserDailyEntry[] | null;
  emergency: IUserEmergencySettings | null;
  settings: IUserSettings | null;
  analytics: IUserAnalytics | null;
  predictions?: IUserPrediction[] | null;
  weekly_hint?: IUserWeeklyHint | null;
}

export interface IUserWeeklyHint {
  id: string;
  text: string;
  filter: {
    type: string;
    operator: "==";
    value: any;
  };
  createdAt: string;
}
export interface IUserPrivacy {
  consentVersion: string;
  consentTimestamp: string;
  hasConsented: boolean;
  hasConsentedToOptional: boolean;
  lastDataExport: string | null;
  deletionRequested: boolean;
}

export interface IUserProfile {
  gender: "male" | "female" | "other" | "prefer_not_to_say";
  ageRange: number;
  location: IUserLocation | null;
}

export interface IUserLocation {
  city: string | null;
  country: string | null;
  isoCountryCode: string | null;
  admin: string | null;
  coords: {
    lat: number | null;
    lon: number | null;
    latRounded: number | null;
    lonRounded: number | null;
  } | null;
  updatedAt: string | null;
}

export interface IUserBaseline {
  // Profile
  meals: number | null; // 0 = Fasting, Average meals per day
  caffeine: number | null; // 0=0, 1 = 1-2, 2  = 3+ Average cups of coffee per day
  sleepDuration: number | null; // 0 <5 ,1 = 5 -6 , 2= 6-7 , 3= 7 -8  , 4 >8. Average Sleep hours per day
  waterIntake: number | null; // 0 = <1, 1 = 1-2, 2 = 2-3, 3 = 3+, Average Water intake in Liters per day
  stress: number | null; // Average Stress level (Likert scale 1-5)

  // Optional Profile
  weatherSensitivity: number | null; // Sensitivity to weather changes
  exercise: number | null; // null = prefer not to say,
  alcohol: number | null; // 0 = Never, 1 = once a month, 2 = once a week, 3 = almost every day
  smoking: number | null; // 0 = no, 1 = sometimes, 2 = regularly
}

export interface IUserDailyEntry extends DailyEntryStore {
  date: string; // YYYY-MM-DD
}

export interface IUserEmergencySettings {
  brightness: number | null; // 0-100
  mutePhone: boolean;
  music: boolean;
  musicType: "calm" | "upbeat" | "science" | null;
  noAnimations: boolean;
}

export interface IUserSettings {
  reminderTime: string | null; // "HH:MM" 24h format
  reminderEnabled: boolean;
  mode: "normal" | "sensitive";
}

export interface IUserAnalytics {
  accountCreated: string; // timestamp
  lastActive: string; // timestamp
  totalEntries: number;
  migraineDaysTracked: number;
  onboardingCompleted: boolean;
}

export interface IUserPrediction {
  features_used_encrypted: string; // encrypted base64 string
  migraine_probability: number; // 0-1
  model_version: string | null;
  prediction_date: string; // YYYY-MM-DD
  risk_level: "Low" | "Medium" | "High" | "Very High" | null;
  top_risk_factors: IPredictionFactor[]; // sorted by importance desc
}

export interface IPredictionFactor {
  feature: string;
  importance: number; // 0-1
  value: string | number | null;
}

export interface ISleepNight {
  totalSleepMinutes: number; // in hours
  startTime: string; // ISO string
  endTime: string; // ISO string
  score: number; // 0-100
  interruptions: number; // number of interruptions
}

export interface IMenstrualCycle {
  stage: "menstruation" | "fertile_window" | "ovulation" | "pre_menstruation";
  evidence: string[]; // array of strings describing evidence
  source: "apple_health" | "user_reported" | "other";
  timestampISO: string; // ISO string
}

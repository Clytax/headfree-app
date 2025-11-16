import { IUserDoc } from "@/types/user";
export const createEmptyUser = (
  uid: string,
  consentVersion = "1.0"
): IUserDoc => {
  const now = new Date().toISOString();

  return {
    privacy: {
      consentVersion,
      consentTimestamp: now,
      hasConsented: false,
      hasConsentedToOptional: false,
      lastDataExport: null,
      deletionRequested: false,
    },
    profile: null,
    baseline: null,
    // dailies: [],
    // predictions: [],
    emergency: {
      brightness: null, // 0-100
      mutePhone: false,
      music: false,
      musicType: null,
      noAnimations: false,
    },
    settings: {
      reminderTime: null,
      reminderEnabled: false,
      mode: "normal",
    },
    analytics: {
      accountCreated: now,
      lastActive: now,
      totalEntries: 0,
      migraineDaysTracked: 0,
      onboardingCompleted: false,
    },
  };
};

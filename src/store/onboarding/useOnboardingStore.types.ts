export type OnboardingData = {
  policy: OnboardingPrivacyPolicy;
  emergencySetup: OnboardingEmergencySetup;
  migraineProfile: OnboardingMigraineProfileSetup | null;
  settings: OnboardingSettings | null;
};

export type OnboardingPrivacyPolicy = {
  accepted: boolean;
  optionalAccepted: boolean;
  date: Date | null;
  version: string | null;
};

export type OnboardingEmergencySetup = {
  brightness: number | null; // 0 - 1, null = use system default
  music: boolean;
  musicType: "calm" | "upbeat" | "science" | null;
  mutePhone: boolean;
  noAnimations: boolean;
};

export type OnboardingMigraineProfileSetup = {
  ageRange: number | null;
  gender: "male" | "female" | "diverse" | null;

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

  // Cycle
  cycle: {
    data: JSON | any | null;
    lastUpdate: Date | null;
  } | null;

  // Auto
  location: {
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
  } | null;
};

export type OnboardingSettings = {
  sendReminders?: boolean;
  reminderTime?: string; // "08:00"
};

export type OnboardingSteps =
  | "Welcome"
  | "promises"
  | "policy"
  | "emergencySetup"
  | "migraineProfile"
  | "migraineDataSources"
  | "notifications"
  | "done";

export const defaultData: OnboardingData = {
  policy: {
    accepted: false,
    optionalAccepted: false,
    date: null,
    version: null,
  },

  emergencySetup: {
    brightness: 0.5,
    music: false,
    musicType: null,
    mutePhone: false,
  },

  migraineProfile: {
    ageRange: null,
    alcohol: null,
    caffeine: null,
    cycle: null,
    exercise: null,
    gender: null,
    meals: null,
    sleepDuration: null,
    smoking: null,
    stress: null,
    waterIntake: null,
    weatherSensitivity: null,
  },
  settings: {
    sendReminders: true,
    reminderTime: "22:00",
  },
};

export type OnboardingState = {
  steps: OnboardingSteps[];
  index: number;
  data: OnboardingData;

  // selectors
  currentStep: () => OnboardingSteps;
  isFirstStep: () => boolean;
  isLastStep: () => boolean;
  progress: () => number;

  // control
  next: () => void;
  back: () => void;
  goToIndex: (index: number) => void;
  goToStep: (step: OnboardingSteps) => void;
  reset: () => void;

  // Data Updaters
  updatePolicy: (policy: Partial<OnboardingPrivacyPolicy>) => void;
  updateEmergencySetup: (setup: Partial<OnboardingEmergencySetup>) => void;
  updateMigraineProfile: (
    profile: Partial<OnboardingMigraineProfileSetup> | null
  ) => void;
  updateSettings: (settings: Partial<OnboardingSettings> | null) => void;
};

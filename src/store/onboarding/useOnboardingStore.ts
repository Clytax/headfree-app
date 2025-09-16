// useOnboardingStore.ts
import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";
import { persist, createJSONStorage } from "zustand/middleware";
import { secureStorage } from "@/store/secureStorage";

// Types
import {
  OnboardingData,
  OnboardingEmergencySetup,
  OnboardingMigraineProfileSetup,
  OnboardingPrivacyPolicy,
  OnboardingSteps,
  OnboardingState,
  defaultData,
} from "@/store/onboarding/useOnboardingStore.types";
export const defaultSteps: OnboardingSteps[] = [
  "Welcome",
  "promises",
  "policy",
  "emergencySetup",
  "migraineProfile",
  "migraineDataSources",
  "notifications",
  "done",
];
export const useOnboardingStore = createWithEqualityFn<OnboardingState>()(
  persist(
    (set, get) => ({
      // your state and actions unchanged
      steps: defaultSteps,
      index: 0,
      data: defaultData,
      currentStep: () => {
        const { steps, index } = get();
        return steps[index] ?? null;
      },
      isFirstStep: () => get().index === 0,
      isLastStep: () => {
        const { index, steps } = get();
        return steps.length > 0 && index === steps.length - 1;
      },
      progress: () => {
        const { index, steps } = get();
        if (steps.length === 0) return 0;
        return (index + 1) / steps.length;
      },
      next: () => {
        const { index, steps } = get();
        if (index < steps.length - 1) set({ index: index + 1 });
      },
      back: () => {
        const { index } = get();
        if (index > 0) set({ index: index - 1 });
      },
      goToIndex: (i) => {
        const { steps } = get();
        if (i >= 0 && i < steps.length) set({ index: i });
      },
      goToStep: (id) => {
        const { steps } = get();
        const i = steps.indexOf(id);
        if (i >= 0) set({ index: i });
      },
      updatePolicy: (patch) =>
        set((s) => ({
          data: { ...s.data, policy: { ...s.data.policy, ...patch } },
        })),
      updateEmergencySetup: (patch) =>
        set((s) => ({
          data: {
            ...s.data,
            emergencySetup: { ...s.data.emergencySetup, ...patch },
          },
        })),
      updateMigraineProfile: (patch) =>
        set((s) => ({
          data: {
            ...s.data,
            migraineProfile: {
              ...(s.data.migraineProfile ?? emptyMigraine()),
              ...patch,
            },
          },
        })),
      updateSettings: (patch) =>
        set((s) => ({
          data: {
            ...s.data,
            settings: { ...(s.data.settings ?? {}), ...patch },
          },
        })),
      reset: () => set({ steps: [], index: 0, data: defaultData }),
    }),
    {
      name: "onboarding_secure",
      storage: createJSONStorage(() => secureStorage),
      version: 1,
      partialize: (s) => ({ steps: s.steps, index: s.index, data: s.data }),
    }
  ),
  shallow
);

function emptyMigraine(): OnboardingMigraineProfileSetup {
  return {
    ageRange: null,
    gender: null,
    meals: 0,
    caffeine: 0,
    sleepDuration: 0,
    waterIntake: 0,
    stress: 1,
    wheaterSensitivity: false,
    exercise: null,
    alcohol: null,
    smoking: null,
    cycle: null,
  };
}

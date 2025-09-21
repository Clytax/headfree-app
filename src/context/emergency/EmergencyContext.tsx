// context/EmergencyContext.tsx
import React, { createContext, useContext } from "react";
import { useEmergency } from "@/hooks/useEmergency";
import type { UseEmergencyResult } from "@/store/emergency/useEmergencyStore.types";
import {
  ReducedMotionConfig,
  ReduceMotion,
  cancelAnimation,
} from "react-native-reanimated";

const EmergencyContext = createContext<UseEmergencyResult | null>(null);

export function EmergencyProvider({ children }: { children: React.ReactNode }) {
  const value = useEmergency();
  const hideAnimations = value.isEnabled && value.settings.noAnimations;

  // optional cleanup for in flight animations on critical screens
  if (hideAnimations) {
    // cancelAnimation(sharedValueA);
    // cancelAnimation(sharedValueB);
  }

  return (
    <EmergencyContext.Provider value={value}>
      <ReducedMotionConfig
        mode={hideAnimations ? ReduceMotion.Always : ReduceMotion.System}
      />
      {children}
    </EmergencyContext.Provider>
  );
}

export function useEmergencyContext(): UseEmergencyResult {
  const ctx = useContext(EmergencyContext);
  if (!ctx) {
    throw new Error(
      "useEmergencyContext must be used within <EmergencyProvider>"
    );
  }
  return ctx;
}

// components/Emergency/BreathingExercise/BreathingExercise.tsx
import React from "react";
import { useEmergency } from "@/hooks/useEmergency";
import BreathingExerciseNoAnimation from "@/components/Emergency/Breathing/BreathingExerciseNoAnimation";
import BreathingExerciseWithAnimation from "@/components/Emergency/Breathing/BreathingExerciseWithAnimation";

interface BreathingExerciseProps {
  onComplete?: () => void;
  cycles?: number;
}

const BreathingExercise: React.FC<BreathingExerciseProps> = ({
  onComplete,
  cycles = 4,
}) => {
  const { settings } = useEmergency();
  const noAnimations = settings?.noAnimations ?? false;

  if (noAnimations) {
    return (
      <BreathingExerciseNoAnimation onComplete={onComplete} cycles={cycles} />
    );
  }

  return (
    <BreathingExerciseWithAnimation onComplete={onComplete} cycles={cycles} />
  );
};

export default BreathingExercise;

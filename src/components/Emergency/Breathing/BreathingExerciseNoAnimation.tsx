// components/Emergency/BreathingExercise/BreathingExerciseNoAnimation.tsx
import React, { useRef, useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";
import Colors from "@/constants/colors";
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

type BreathingPhase = "inhale" | "hold" | "exhale" | "rest";

interface BreathingExerciseNoAnimationProps {
  onComplete?: () => void;
  cycles?: number;
}

const PHASE_DURATIONS: Record<BreathingPhase, number> = {
  inhale: 4000,
  hold: 7000,
  exhale: 8000,
  rest: 1000,
};

const PHASE_INSTRUCTIONS: Record<BreathingPhase, string> = {
  inhale: "Breathe In",
  hold: "Hold",
  exhale: "Breathe Out",
  rest: "Rest",
};

const PHASE_DESCRIPTIONS: Record<BreathingPhase, string> = {
  inhale: "Inhale slowly through your nose",
  hold: "Hold your breath gently",
  exhale: "Exhale slowly through your mouth",
  rest: "Prepare for next cycle",
};

const BreathingExerciseNoAnimation: React.FC<
  BreathingExerciseNoAnimationProps
> = ({ onComplete, cycles = 4 }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>("inhale");
  const [currentCycle, setCurrentCycle] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  // Timer refs
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deadlineRef = useRef<number>(0);
  const isRunningRef = useRef(false);

  useEffect(() => {
    return () => {
      stopEverything();
    };
  }, []);

  const clearTick = () => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  const clearPhaseTimeout = () => {
    if (phaseTimeoutRef.current) {
      clearTimeout(phaseTimeoutRef.current);
      phaseTimeoutRef.current = null;
    }
  };

  const stopEverything = () => {
    clearTick();
    clearPhaseTimeout();
    setSecondsRemaining(0);
    isRunningRef.current = false;
  };

  const startExercise = () => {
    stopEverything();
    setIsActive(true);
    setIsCompleted(false);
    setCurrentCycle(0);
    setCurrentPhase("inhale");
    isRunningRef.current = true;
    runCycle(0);
  };

  const stopExercise = () => {
    stopEverything();
    setIsActive(false);
    setCurrentPhase("inhale");
    setCurrentCycle(0);
  };

  const completeExercise = () => {
    stopEverything();
    setIsActive(false);
    setIsCompleted(true);
    onComplete?.();
  };

  const runCycle = (cycleIndex: number) => {
    if (!isRunningRef.current) return;

    setCurrentCycle(cycleIndex);

    runPhase("inhale", () => {
      if (!isRunningRef.current) return;
      runPhase("hold", () => {
        if (!isRunningRef.current) return;
        runPhase("exhale", () => {
          if (!isRunningRef.current) return;

          const nextCycle = cycleIndex + 1;
          if (nextCycle < cycles) {
            runPhase("rest", () => {
              if (!isRunningRef.current) return;
              runCycle(nextCycle);
            });
          } else {
            completeExercise();
          }
        });
      });
    });
  };

  // Deadline based countdown to avoid stale closures and platform timer quirks
  const runPhase = (phase: BreathingPhase, onPhaseComplete: () => void) => {
    if (!isRunningRef.current) return;

    setCurrentPhase(phase);

    const durationMs = PHASE_DURATIONS[phase];
    deadlineRef.current = Date.now() + durationMs;

    // set initial value
    setSecondsRemaining(Math.max(0, Math.ceil(durationMs / 1000)));

    clearTick();
    tickRef.current = setInterval(() => {
      if (!isRunningRef.current) {
        clearTick();
        return;
      }

      const msLeft = deadlineRef.current - Date.now();
      const secs = Math.max(0, Math.ceil(msLeft / 1000));
      setSecondsRemaining(secs);

      if (msLeft <= 0) {
        clearTick();
      }
    }, 100);

    clearPhaseTimeout();
    phaseTimeoutRef.current = setTimeout(() => {
      if (isRunningRef.current) {
        onPhaseComplete();
      }
    }, durationMs);
  };

  return (
    <View style={styles.container}>
      {!isActive && !isCompleted && (
        <View style={styles.instructionContainer}>
          <Text
            fontSize={getFontSize(16)}
            color={Colors.text}
            style={styles.instruction}
            textCenter
          >
            The 4 7 8 breathing technique helps reduce anxiety and promote
            relaxation.
          </Text>
          <Text
            fontSize={getFontSize(14)}
            color={Colors.gray}
            style={styles.subInstruction}
            textCenter
          >
            Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds.
          </Text>
          <Text textCenter style={styles.subInstruction}>
            You have Animations disabled, so only the countdown and instructions
            are shown.
          </Text>
        </View>
      )}

      {isActive && (
        <View style={styles.exerciseContainer}>
          <Text
            fontSize={getFontSize(16)}
            color={Colors.gray}
            textCenter
            style={styles.cycleText}
          >
            Cycle {currentCycle + 1} of {cycles}
          </Text>

          {/* Countdown only */}
          <Text
            fontSize={getFontSize(64)}
            fontWeight="bold"
            color={Colors.text}
            textCenter
            style={styles.countdown}
          >
            {secondsRemaining}
          </Text>

          {/* Phase Instruction */}
          <Text
            fontSize={getFontSize(24)}
            fontWeight="bold"
            color={Colors.text}
            textCenter
            style={styles.phaseTitle}
          >
            {PHASE_INSTRUCTIONS[currentPhase]}
          </Text>

          {/* Phase Description */}
          <Text
            fontSize={getFontSize(16)}
            color={Colors.gray}
            textCenter
            style={styles.phaseDescription}
          >
            {PHASE_DESCRIPTIONS[currentPhase]}
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        {!isActive && !isCompleted && (
          <MyTouchableOpacity
            style={styles.startButton}
            onPress={startExercise}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Start exercise"
            accessibilityHint="Begin the guided exercise routine"
            hitSlop={8}
          >
            <Text
              fontSize={getFontSize(16)}
              fontWeight="medium"
              color={Colors.white}
            >
              Start Breathing Exercise
            </Text>
          </MyTouchableOpacity>
        )}

        {isActive && (
          <MyTouchableOpacity
            style={styles.stopButton}
            onPress={stopExercise}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Stop exercise"
            accessibilityHint="Stops the current guided exercise"
            hitSlop={8}
          >
            <Text
              fontSize={getFontSize(16)}
              fontWeight="medium"
              color={Colors.error}
            >
              Stop Exercise
            </Text>
          </MyTouchableOpacity>
        )}

        {isCompleted && (
          <View style={styles.completedContainer}>
            <Text
              fontSize={getFontSize(18)}
              fontWeight="bold"
              color={Colors.success}
              textCenter
            >
              ✓ Breathing Exercise Complete
            </Text>
            <Text
              fontSize={getFontSize(14)}
              color={Colors.gray}
              textCenter
              style={styles.completedText}
            >
              Great job. You completed {cycles} breathing cycles.
            </Text>
            <MyTouchableOpacity
              style={styles.restartButton}
              onPress={startExercise}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Do another round"
              accessibilityHint="Starts one more round of the exercise"
              hitSlop={8}
            >
              <Text
                fontSize={getFontSize(14)}
                fontWeight="medium"
                color={Colors.primary300}
              >
                Do Another Round
              </Text>
            </MyTouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: hp(3),
    flex: 1,
    justifyContent: "center",
  },
  instructionContainer: {
    paddingHorizontal: wp(4),
    marginBottom: hp(4),
  },
  instruction: {
    marginBottom: hp(1),
    lineHeight: getFontSize(20),
  },
  subInstruction: {
    lineHeight: getFontSize(18),
    paddingBottom: hp(1),
    color: Colors.gray,
    fontSize: getFontSize(14),
  },
  exerciseContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: wp(4),
  },
  cycleText: {
    marginBottom: hp(3),
  },
  countdown: {
    marginBottom: hp(3),
  },
  phaseTitle: {
    marginBottom: hp(1),
  },
  phaseDescription: {
    lineHeight: getFontSize(20),
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: wp(4),
    alignItems: "center",
    paddingBottom: hp(2),
  },
  startButton: {
    backgroundColor: Colors.primary500,
    paddingVertical: hp(1.75),
    paddingHorizontal: wp(8),
    borderRadius: wp(3),
    alignItems: "center",
    minWidth: wp(70),
    height: hp(6),
  },
  stopButton: {
    backgroundColor: Colors.backgroundLighter,
    borderWidth: 1,
    borderColor: Colors.error,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
    marginTop: hp(2),
    borderRadius: wp(3),
    alignItems: "center",
    minWidth: wp(70),
    height: hp(6),
  },
  completedContainer: {
    alignItems: "center",
  },
  completedText: {
    marginTop: hp(1),
    marginBottom: hp(2),
    lineHeight: getFontSize(18),
    textAlign: "center",
  },
  restartButton: {
    backgroundColor: Colors.backgroundLighter,
    borderWidth: 1,
    borderColor: Colors.primary300,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
    borderRadius: wp(3),
    alignItems: "center",
  },
});

export default BreathingExerciseNoAnimation;

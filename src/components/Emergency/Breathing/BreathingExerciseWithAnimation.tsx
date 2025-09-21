// components/Emergency/BreathingExerciseWithAnimation/BreathingExerciseWithAnimation.tsx
import React, { useRef, useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";
import Colors from "@/constants/colors";
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";
import { useEmergency } from "@/hooks/useEmergency";

type BreathingPhase = "inhale" | "hold" | "exhale" | "rest";

interface BreathingExerciseWithAnimationProps {
  onComplete?: () => void;
  cycles?: number;
}

const PHASE_DURATIONS = {
  inhale: 4000,
  hold: 7000,
  exhale: 8000,
  rest: 1000, // Small rest between cycles
};

const PHASE_INSTRUCTIONS = {
  inhale: "Breathe In",
  hold: "Hold",
  exhale: "Breathe Out",
  rest: "Rest",
};

const BreathingExerciseWithAnimation: React.FC<
  BreathingExerciseWithAnimationProps
> = ({ onComplete, cycles = 4 }) => {
  const { settings, isEnabled } = useEmergency();
  const noAnimations = settings?.noAnimations ?? false;
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>("inhale");
  const [currentCycle, setCurrentCycle] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Single timer for phase countdown
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [phaseRemainingMs, setPhaseRemainingMs] = useState(0);

  // Animation values
  const bubbleScale = useSharedValue(0.3);
  const bubbleOpacity = useSharedValue(0.7);

  // Layout animation values
  const containerHeight = useSharedValue(hp(25)); // Compact height initially
  const bubbleContainerTranslateY = useSharedValue(-hp(5)); // Bubble higher up
  const instructionOpacity = useSharedValue(1);
  const controlsOpacity = useSharedValue(0); // Timer and phase info hidden initially
  const buttonTranslateY = useSharedValue(-hp(8)); // Button closer to bubble

  // Running flags
  // JS ref is used only by timers on the JS thread
  const isRunningRef = useRef(false);
  // Shared value is used inside worklets and animated callbacks
  const isRunning = useSharedValue(false);

  useEffect(() => {
    return () => {
      stopEverything();
    };
  }, []);

  const stopEverything = () => {
    // Stop all timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Cancel all animations immediately
    cancelAnimation(bubbleScale);
    cancelAnimation(bubbleOpacity);

    // Reset to initial state
    bubbleScale.value = 0.3;
    bubbleOpacity.value = 0.7;

    // Clear timer display
    setPhaseRemainingMs(0);

    // Mark as not running
    isRunningRef.current = false;
    isRunning.value = false;
  };

  const animateLayoutToActive = () => {
    // Fade out instructions first
    instructionOpacity.value = withTiming(0, { duration: 300 });

    // Then expand everything else with proper sequencing
    setTimeout(() => {
      containerHeight.value = withTiming(hp(40), { duration: 600 });

      bubbleContainerTranslateY.value = withTiming(0, { duration: 600 });
      buttonTranslateY.value = withTiming(0, { duration: 600 });
    }, 200);

    // Show exercise controls last, after layout is settled
    setTimeout(() => {
      controlsOpacity.value = withTiming(1, { duration: 400 });
    }, 500);
  };

  const animateLayoutToInactive = () => {
    // Hide exercise controls first
    controlsOpacity.value = withTiming(0, { duration: 300 });

    // Then contract layout
    setTimeout(() => {
      containerHeight.value = withTiming(hp(25), { duration: 500 });
      bubbleContainerTranslateY.value = withTiming(-hp(5), { duration: 500 });
      buttonTranslateY.value = withTiming(-hp(8), { duration: 500 });
    }, 200);

    // Show instructions last
    setTimeout(() => {
      instructionOpacity.value = withTiming(1, { duration: 400 });
    }, 400);
  };

  const startExercise = () => {
    // Stop everything first
    stopEverything();

    // Animate layout expansion
    animateLayoutToActive();

    // Reset state
    setIsActive(true);
    setIsCompleted(false);
    setCurrentCycle(0);
    setCurrentPhase("inhale");

    // Mark as running
    isRunningRef.current = true; // JS timers
    isRunning.value = true; // worklets

    // Start first cycle after layout animation is complete
    setTimeout(() => {
      if (isRunningRef.current) {
        runCycle(0);
      }
    }, 800); // Increased delay to wait for layout to settle
  };

  const stopExercise = () => {
    stopEverything();
    animateLayoutToInactive();
    setIsActive(false);
    setCurrentPhase("inhale");
    setCurrentCycle(0);
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
            // Small rest between cycles
            runPhase("rest", () => {
              if (!isRunningRef.current) return;
              runCycle(nextCycle);
            });
          } else {
            // Exercise complete
            completeExercise();
          }
        });
      });
    });
  };

  const runPhase = (phase: BreathingPhase, onPhaseComplete: () => void) => {
    if (!isRunningRef.current) return;

    setCurrentPhase(phase);
    const duration = PHASE_DURATIONS[phase];

    // Start countdown timer
    startTimer(duration);

    // Start animation based on phase
    switch (phase) {
      case "inhale":
        bubbleScale.value = withTiming(
          1.0,
          { duration, easing: Easing.inOut(Easing.ease) },
          (finished) => {
            if (finished && isRunning.value) {
              runOnJS(onPhaseComplete)();
            }
          }
        );
        break;

      case "hold":
        bubbleOpacity.value = withTiming(0.9, { duration }, (finished) => {
          if (finished && isRunning.value) {
            runOnJS(onPhaseComplete)();
          }
        });
        break;

      case "exhale":
        bubbleScale.value = withTiming(
          0.3,
          { duration, easing: Easing.inOut(Easing.ease) },
          (finished) => {
            if (finished && isRunning.value) {
              // Reset opacity for next cycle
              bubbleOpacity.value = withTiming(0.7, { duration: 200 });
              runOnJS(onPhaseComplete)();
            }
          }
        );
        break;

      case "rest":
        // Just wait for the duration on JS
        setTimeout(() => {
          if (isRunningRef.current) {
            onPhaseComplete();
          }
        }, duration);
        break;
    }
  };

  const startTimer = (duration: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setPhaseRemainingMs(duration);
    const startTime = Date.now();

    timerRef.current = setInterval(() => {
      if (!isRunningRef.current) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        return;
      }

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      setPhaseRemainingMs(remaining);

      if (remaining <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }, 100);
  };

  const completeExercise = () => {
    stopEverything();
    animateLayoutToInactive();
    setIsActive(false);
    setIsCompleted(true);
    onComplete?.();
  };

  const bubbleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: bubbleScale.value }],
      opacity: bubbleOpacity.value,
    };
  });

  const containerStyle = useAnimatedStyle(() => {
    return {
      height: containerHeight.value,
    };
  });

  const bubbleContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: bubbleContainerTranslateY.value }],
    };
  });

  const instructionStyle = useAnimatedStyle(() => {
    return {
      opacity: instructionOpacity.value,
    };
  });

  const controlsStyle = useAnimatedStyle(() => {
    return {
      opacity: controlsOpacity.value,
    };
  });

  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: buttonTranslateY.value }],
    };
  });

  const getPhaseColor = (phase: BreathingPhase) => {
    switch (phase) {
      case "inhale":
        return Colors.primary300;
      case "hold":
        return Colors.warning300;
      case "exhale":
        return Colors.secondary300;
      case "rest":
        return Colors.neutral400;
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.instructionContainer, instructionStyle]}>
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
      </Animated.View>

      <Animated.View style={[styles.bubbleContainerWrapper, containerStyle]}>
        <Animated.View style={[styles.bubbleContainer, bubbleContainerStyle]}>
          <Animated.View style={[styles.exerciseControls, controlsStyle]}>
            {isActive && (
              <Text
                fontSize={getFontSize(28)}
                fontWeight="bold"
                color={Colors.text}
                textCenter
                style={styles.timerText}
              >
                {Math.ceil(phaseRemainingMs / 1000)}s
              </Text>
            )}
          </Animated.View>

          <Animated.View
            style={[
              styles.bubble,
              bubbleStyle,
              {
                backgroundColor: isActive
                  ? getPhaseColor(currentPhase)
                  : Colors.primary300,
              },
            ]}
          />

          <Animated.View style={[styles.phaseInfo, controlsStyle]}>
            {isActive && (
              <>
                <Text
                  fontSize={getFontSize(18)}
                  fontWeight="bold"
                  color={Colors.text}
                  textCenter
                >
                  {PHASE_INSTRUCTIONS[currentPhase]}
                </Text>
                <Text
                  fontSize={getFontSize(14)}
                  color={Colors.gray}
                  textCenter
                  style={styles.cycleCounter}
                >
                  Cycle {currentCycle + 1} of {cycles}
                </Text>
              </>
            )}
          </Animated.View>
        </Animated.View>
      </Animated.View>

      <Animated.View style={[styles.buttonContainer, buttonStyle]}>
        {!isActive && !isCompleted && (
          <MyTouchableOpacity
            style={styles.startButton}
            onPress={startExercise}
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
          <MyTouchableOpacity style={styles.stopButton} onPress={stopExercise}>
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
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: hp(3),
    flex: 1,
  },
  instructionContainer: {
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
  },
  instruction: {
    marginBottom: hp(1),
    lineHeight: getFontSize(20),
  },
  subInstruction: {
    lineHeight: getFontSize(18),
  },
  bubbleContainerWrapper: {
    width: wp(80),
    justifyContent: "center",
    alignItems: "center",
  },
  bubbleContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  exerciseControls: {
    position: "absolute",
    top: -hp(8), // Move timer further above bubble to prevent overlap
    alignItems: "center",
    zIndex: 2,
    width: "100%",
  },
  bubble: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(20),
    shadowColor: Colors.primary300,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  timerText: {
    marginBottom: hp(2),
  },
  phaseInfo: {
    position: "absolute",
    bottom: -hp(6), // Move phase info further below bubble
    alignItems: "center",
    width: "100%",
  },
  cycleCounter: {
    marginTop: hp(0.5),
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: wp(4),
    alignItems: "center",
    marginTop: hp(2),
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

export default BreathingExerciseWithAnimation;

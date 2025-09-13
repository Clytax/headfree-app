import React, { useEffect, useRef, useCallback } from "react";
import { View, ViewStyle } from "react-native";
import { CircleCheck } from "lucide-react-native";
import Animated, {
  FadeInDown,
  FadeOutDown,
  LinearTransition,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";

import Text from "@/components/common/Text";
import { AnimatedButton } from "@/components/Onboarding/OnboardingBottom/OnboardingPrimitiveButton";
import { useOnboardingStore } from "@/store/onboarding/useOnboardingStore";
import { Colors } from "@/constants";
import EmergencySetupSheet, {
  EmergencySetupSheetHandle,
} from "@/components/Onboarding/OnboardingEmergency/OnboardingEmergencySetupSheet";

const AnimatedText = Animated.createAnimatedComponent(Text);

const SPACING = 10;
const LAYOUT = LinearTransition.springify().damping(18).stiffness(200);
const FADE_IN = FadeInDown.springify().damping(18).stiffness(200);
const FADE_OUT = FadeOutDown.springify().damping(18).stiffness(200);

type Props = {
  style?: ViewStyle;
  nextLabel?: string;
  finishLabel?: string;
  onFinish?: () => void;
  onSkip?: () => void;
};

export function OnboardingNavigation({
  style,
  nextLabel = "Continue",
  finishLabel = "Finish",
  onFinish,
  onSkip,
}: Props) {
  const steps = useOnboardingStore((s) => s.steps);
  const index = useOnboardingStore((s) => s.index);
  const current = useOnboardingStore((s) => s.currentStep());
  const next = useOnboardingStore((s) => s.next);
  const policy = useOnboardingStore((s) => s.data.policy);

  const total = steps.length;
  const isLast = total > 0 && index === total - 1;

  const isSkippable =
    current === "emergencySetup" || current === "migraineProfile";

  const emergencyRef = useRef<EmergencySetupSheetHandle>(null);

  const presentEmergency = useCallback(() => {
    if (!emergencyRef.current) {
      console.warn("Emergency sheet ref is null");
      return;
    }
    emergencyRef.current.present();
  }, []);

  const handlePrimary = () => {
    if (current === "emergencySetup") {
      presentEmergency();
      return;
    }
    if (isLast) {
      onFinish?.();
      return;
    }
    next();
  };

  const handleSkip = () => {
    if (onSkip) onSkip();
    else next();
  };

  const canContinuePolicy = !!policy?.accepted;
  const canContinue = current !== "policy" || canContinuePolicy;

  const bgProgress = useSharedValue(canContinue ? 1 : 0);
  useEffect(() => {
    bgProgress.value = withTiming(canContinue ? 1 : 0, { duration: 220 });
  }, [canContinue, bgProgress]);

  const animatedBtnStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      bgProgress.value,
      [0, 1],
      [Colors.primary800, Colors.primary500]
    );
    return { backgroundColor };
  });

  return (
    <>
      <View style={[{ gap: SPACING }, style]}>
        {isSkippable && (
          <AnimatedButton
            entering={FADE_IN}
            exiting={FADE_OUT}
            style={{ backgroundColor: Colors.secondary200, width: "100%" }}
            onPress={handleSkip}
          >
            <Text fontWeight="bold" color={Colors.textDark}>
              Skip (for now)
            </Text>
          </AnimatedButton>
        )}

        <AnimatedButton
          disabled={!canContinue}
          style={[{ width: "100%" }, animatedBtnStyle]}
          onPress={handlePrimary}
        >
          {isLast ? (
            <Animated.View
              entering={FADE_IN}
              exiting={FADE_OUT}
              style={{
                flexDirection: "row",
                gap: SPACING / 2,
                alignItems: "center",
              }}
            >
              <Animated.View
                entering={ZoomIn.delay(100)
                  .springify()
                  .damping(18)
                  .stiffness(200)}
              >
                <CircleCheck color={Colors.textDark} size={18} />
              </Animated.View>
              <Text fontWeight="bold" color={Colors.textDark}>
                {finishLabel}
              </Text>
            </Animated.View>
          ) : (
            <AnimatedText
              entering={FADE_IN}
              exiting={FADE_OUT}
              layout={LAYOUT}
              color={Colors.textDark}
              fontWeight={"bold"}
            >
              {current === "emergencySetup" ? "Set up emergency" : nextLabel}
            </AnimatedText>
          )}
        </AnimatedButton>
      </View>

      <EmergencySetupSheet
        ref={emergencyRef}
        onSaveContinue={() => {
          emergencyRef.current?.dismiss();
          next();
        }}
      />
    </>
  );
}

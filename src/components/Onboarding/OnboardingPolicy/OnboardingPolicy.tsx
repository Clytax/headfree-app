// OnboardingPolicy.tsx
import React, { useCallback } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Animated, { SlideInRight, SlideOutLeft } from "react-native-reanimated";
import { useRouter } from "expo-router";

// Components
import Text from "@/components/common/Text";
import OnboardingTop from "@/components/Onboarding/OnboardingTop";
import OnboardingPolicyCheck from "@/components/Onboarding/OnboardingPolicy/OnboardingPolicyCheck";
import OnboardingPolicyHandle from "@/components/Onboarding/OnboardingPolicy/OnboardingPolicyHandle";
import OnboardingPolicyProcess from "@/components/Onboarding/OnboardingPolicy/OnboardingPolicyProcess";
import OnboardingPolicyUseFor from "@/components/Onboarding/OnboardingPolicy/OnboardingPolicyUseFor";

// Packages
import { shallow } from "zustand/shallow";

// Constants
import { Sizes } from "@/constants";

// Utils
import { getFontSize } from "@/utils/text/fonts";

// Store
import { useOnboardingStore } from "@/store/onboarding/useOnboardingStore";

const AnimatedText = Animated.createAnimatedComponent(Text);

// helpers for staggered animations
const BASE_DELAY = 240;
const STEP = 90;
const enter = (d: number) =>
  SlideInRight.springify()
    .damping(22)
    .stiffness(90)
    .mass(1.1)
    .withInitialValues({ opacity: 0 })
    .delay(d);

const exit = (d: number) =>
  SlideOutLeft.springify().damping(22).stiffness(90).mass(1.1).delay(d);

const OnboardingPolicy: React.FC = () => {
  const router = useRouter();

  const { policy, updatePolicy } = useOnboardingStore((state) => ({
    policy: state.data.policy,
    updatePolicy: state.updatePolicy,
  }));

  const toggleRequired = useCallback(
    () => updatePolicy({ accepted: !policy.accepted }),
    [policy.accepted, updatePolicy]
  );

  const toggleOptional = useCallback(
    () => updatePolicy({ optionalAccepted: !policy.optionalAccepted }),
    [policy.optionalAccepted, updatePolicy]
  );

  return (
    <View style={styles.container}>
      <OnboardingTop />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* 0 */}
        <AnimatedText
          entering={enter(BASE_DELAY + STEP * 0)}
          exiting={exit(0)}
          textCenter
          fontSize={getFontSize(15)}
          accessibilityRole="text"
          accessibilityLabel="Privacy introduction"
        >
          Your privacy matters. Headfree follows the EU General Data Protection
          Regulation GDPR or DSGVO to protect your personal data.
        </AnimatedText>

        <View style={styles.blockSpacer} />

        {/* 1 */}
        <Animated.View
          entering={enter(BASE_DELAY + STEP * 1)}
          exiting={exit(0)}
        >
          <OnboardingPolicyProcess />
        </Animated.View>

        <View style={styles.sectionSpacer} />

        {/* 2 */}
        <Animated.View
          entering={enter(BASE_DELAY + STEP * 2)}
          exiting={exit(0)}
        >
          <OnboardingPolicyUseFor />
        </Animated.View>

        <View style={styles.sectionSpacer} />

        {/* 3 */}
        <Animated.View
          entering={enter(BASE_DELAY + STEP * 3)}
          exiting={exit(0)}
        >
          <OnboardingPolicyHandle />
        </Animated.View>

        <View style={styles.largeSpacer} />

        {/* 4 */}
        <Animated.View
          entering={enter(BASE_DELAY + STEP * 4)}
          exiting={exit(0)}
        >
          <OnboardingPolicyCheck
            label="Required consent"
            description="I have read the privacy policy and give explicit consent to the processing of my health data as described."
            required
            isActive={policy.accepted}
            onPress={toggleRequired}
            accessibilityLabel="Required consent checkbox"
          />
        </Animated.View>

        <View style={styles.checkboxSpacer} />

        {/* 5 */}
        <Animated.View
          entering={enter(BASE_DELAY + STEP * 5)}
          exiting={exit(0)}
        >
          <OnboardingPolicyCheck
            label="Optional consent"
            description="I agree that my entries may be used in anonymized or aggregated form to improve the prediction algorithm. I can use the app without this."
            isActive={policy.optionalAccepted}
            onPress={toggleOptional}
            accessibilityLabel="Optional consent checkbox"
          />
        </Animated.View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

export default React.memo(OnboardingPolicy);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    marginBottom: Sizes.verticalMedium,
    paddingHorizontal: Sizes.containerPaddingHorizontal,
  },
  contentContainer: {
    paddingBottom: Sizes.verticalExtraLarge,
  },
  blockSpacer: {
    paddingBottom: Sizes.verticalLarge,
  },
  sectionSpacer: {
    paddingBottom: Sizes.verticalMedium,
  },
  largeSpacer: {
    paddingBottom: Sizes.verticalExtraLarge,
  },
  checkboxSpacer: {
    paddingBottom: Sizes.extraLargeRadius,
  },
  bottomPadding: {
    height: Sizes.verticalExtraLarge,
  },
});

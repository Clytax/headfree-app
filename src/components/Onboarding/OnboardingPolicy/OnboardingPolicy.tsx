// OnboardingPolicy.tsx
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, LayoutChangeEvent } from "react-native";
import Animated, {
  Easing,
  SlideInRight,
  SlideOutLeft,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
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
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

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

  const { policy, updatePolicy } = useOnboardingStore(
    (state) => ({
      policy: state.data.policy,
      updatePolicy: state.updatePolicy,
    }),
    shallow
  );

  const [layoutHeight, setLayoutHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  // Reanimated values for the scroll hint arrow
  const arrowTranslateY = useSharedValue(0);
  const arrowOpacity = useSharedValue(0);

  const toggleRequired = useCallback(
    () => updatePolicy({ accepted: !policy.accepted }),
    [policy.accepted, updatePolicy]
  );

  const toggleOptional = useCallback(
    () => updatePolicy({ optionalAccepted: !policy.optionalAccepted }),
    [policy.optionalAccepted, updatePolicy]
  );

  // Bouncing animation for the arrow
  useEffect(() => {
    arrowTranslateY.value = withRepeat(
      withTiming(-6, {
        duration: 600,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true
    );
  }, [arrowTranslateY]);

  // Show initial hint if content is scrollable
  useEffect(() => {
    if (!layoutHeight || !contentHeight) {
      return;
    }

    const isScrollable = contentHeight > layoutHeight + 16;

    arrowOpacity.value = withTiming(isScrollable ? 1 : 0, {
      duration: isScrollable ? 250 : 200,
    });
  }, [layoutHeight, contentHeight, arrowOpacity]);

  const onWrapperLayout = useCallback((event: LayoutChangeEvent) => {
    setLayoutHeight(event.nativeEvent.layout.height);
  }, []);

  const onContentSizeChange = useCallback((_w: number, h: number) => {
    setContentHeight(h);
  }, []);

  // Scroll handler to hide the hint when user reaches the bottom
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const { layoutMeasurement, contentOffset, contentSize } = event;

      const isScrollable = contentSize.height > layoutMeasurement.height + 16;

      if (!isScrollable) {
        arrowOpacity.value = withTiming(0, { duration: 200 });
        return;
      }

      const paddingToBottom = 24;
      const isAtBottom =
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom;

      if (isAtBottom) {
        arrowOpacity.value = withTiming(0, { duration: 200 });
      } else {
        arrowOpacity.value = withTiming(1, { duration: 250 });
      }
    },
  });

  const arrowStyle = useAnimatedStyle(() => ({
    opacity: arrowOpacity.value,
    transform: [{ translateY: arrowTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <OnboardingTop />

      <View style={styles.scrollWrapper} onLayout={onWrapperLayout}>
        <AnimatedScrollView
          style={styles.scroll}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          onScroll={scrollHandler}
          onContentSizeChange={onContentSizeChange}
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
            Your privacy matters. Headfree follows the EU General Data
            Protection Regulation GDPR or DSGVO to protect your personal data.
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
        </AnimatedScrollView>

        {/* Scroll hint arrow overlay */}
        <Animated.View
          pointerEvents="none"
          style={[styles.scrollHint, arrowStyle]}
        >
          <Text
            fontSize={getFontSize(18)}
            style={styles.scrollHintText}
            accessibilityRole="text"
            accessibilityLabel="Scroll down for more information"
          >
            ↓
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};

export default React.memo(OnboardingPolicy);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollWrapper: {
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
  scrollHint: {
    position: "absolute",
    bottom: Sizes.verticalMedium,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollHintText: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.18)",
    color: "#ffffff",
  },
});

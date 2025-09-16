import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  runOnJS,
  withSpring,
} from "react-native-reanimated";

// Packages
import { useRouter } from "expo-router";

// Constants
import { Colors, Sizes } from "@/constants";

// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

// Types
import { DailyTipProps } from "@/components/DailyTip/DailyTips.types";

// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";

const DailyTip = ({
  description,
  icon: Icon,
  index,
  setIndex,
  totalTips,
}: DailyTipProps) => {
  const router = useRouter();
  const translateX = useSharedValue(0);
  const swipeThreshold = wp(30); // Threshold for swipe to trigger change
  const slideOutLeft = -wp(100); // Slide out to left
  const slideOutRight = wp(100); // Slide out to right
  const resetRight = wp(100); // Reset to right for slide-in
  const resetLeft = -wp(100); // Reset to left for slide-in

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const { translationX, velocityX } = event;

      // Ensure totalTips is valid to prevent errors
      if (totalTips <= 0) {
        translateX.value = withSpring(0);
        return;
      }

      // Check translation first, fall back to velocity for faster swipes
      let shouldGoNext = false;
      let shouldGoPrev = false;

      if (translationX < -swipeThreshold || velocityX < -500) {
        // Swipe left/fast left, go to next tip
        shouldGoNext = true;
      } else if (translationX > swipeThreshold || velocityX > 500) {
        // Swipe right/fast right, go to previous tip
        shouldGoPrev = true;
      }

      if (shouldGoNext) {
        // Animate out to the left, then reset to right and slide in
        translateX.value = withSequence(
          withTiming(slideOutLeft, { duration: 200 }), // Slide out to left
          withTiming(resetRight, { duration: 0 }), // Instantly reset to right
          withTiming(0, { duration: 200 }, () => {
            // Update index after slide-out
            runOnJS(setIndex)(index >= totalTips - 1 ? 0 : index + 1);
          })
        );
      } else if (shouldGoPrev) {
        // Animate out to the right, then reset to left and slide in
        translateX.value = withSequence(
          withTiming(slideOutRight, { duration: 200 }), // Slide out to right
          withTiming(resetLeft, { duration: 0 }), // Instantly reset to left
          withTiming(0, { duration: 200 }, () => {
            // Update index after slide-out
            runOnJS(setIndex)(index <= 0 ? totalTips - 1 : index - 1);
          })
        );
      } else {
        // No valid swipe, snap back to center
        translateX.value = withSpring(0);
      }
    });

  // Reset animation when index changes (fallback safety)
  useEffect(() => {
    translateX.value = 0;
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.top}>
          <Text style={styles.sideText}>
            {index + 1}/{totalTips}
          </Text>
          <View style={styles.dots}>
            {Array.from({ length: totalTips }).map((_, i) => (
              <NavDot key={i} isActive={i === index} />
            ))}
          </View>
          <Text style={[styles.sideText, { textAlign: "right" }]}>
            Swipe to change
          </Text>
        </View>
        <View style={styles.main}>
          {Icon}
          <View style={{ justifyContent: "center" }}>
            <Text
              style={{ color: Colors.neutral200, fontSize: getFontSize(12) }}
            >
              {description}
            </Text>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const NavDot = ({ isActive }: { isActive: boolean }) => {
  return (
    <View
      style={{
        width: wp(2.5),
        height: wp(2.5),
        borderRadius: wp(1.25),
        backgroundColor: isActive ? Colors.neutral400 : "transparent",
        borderColor: Colors.neutral400,
        borderWidth: 1,
        marginHorizontal: wp(0.5),
      }}
    />
  );
};

export default DailyTip;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral800,
    borderColor: Colors.neutral500,
    borderRadius: Sizes.mediumRadius,
    borderWidth: 1,
    paddingVertical: Sizes.paddingVerticalSmall,
    flex: 1,
    paddingHorizontal: Sizes.paddingHorizontalMedium,
  },
  top: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(1),
  },
  sideText: {
    flex: 1,
    color: Colors.neutral300,
    fontSize: getFontSize(9),
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  main: {
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: hp(1),
    paddingHorizontal: wp(2),
  },
});

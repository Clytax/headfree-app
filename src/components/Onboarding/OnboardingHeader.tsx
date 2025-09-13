import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import Animated, { FadeInLeft, FadeOutLeft } from "react-native-reanimated";

import { Pagination } from "@/components/Onboarding/OnboardingBottom/OnboardingPagination";
import { useOnboardingStore } from "@/store/onboarding/useOnboardingStore";
import { Colors } from "@/constants";
import { hp } from "@/utils/ui/sizes";

const ICON_HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

const OnboardingHeader = () => {
  const router = useRouter();
  const steps = useOnboardingStore((s) => s.steps);
  const index = useOnboardingStore((s) => s.index);
  const back = useOnboardingStore((s) => s.back);

  const total = steps.length;
  const showBackButton = index > 0;

  const onBackPress = () => {
    back();
    // if each step is its own screen you can also call router.back()
  };

  return (
    <View style={styles.container}>
      <Pagination count={total} index={index} style={styles.pagination} />

      {showBackButton && (
        <Animated.View
          entering={FadeInLeft.springify().damping(18).stiffness(200)}
          exiting={FadeOutLeft.springify().damping(18).stiffness(200)}
          style={styles.backWrapper}
          pointerEvents="box-none"
        >
          <Pressable onPress={onBackPress} hitSlop={ICON_HIT_SLOP}>
            <ChevronLeft size={hp(2.6)} color={Colors.neutral200} />
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
};

export default OnboardingHeader;

const HEADER_HEIGHT = 56;

const styles = StyleSheet.create({
  container: {
    height: HEADER_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  pagination: {
    alignSelf: "center",
  },
  backWrapper: {
    position: "absolute",
    left: 5,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
});

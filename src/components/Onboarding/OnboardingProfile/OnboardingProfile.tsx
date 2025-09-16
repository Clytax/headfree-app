import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";

// Packages
import { useRouter } from "expo-router";
import Animated from "react-native-reanimated";
// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";

// Constants
import { Colors, Sizes } from "@/constants";

// Utils
import { exit, enter } from "@/utils/animation/onboardingAnimation";
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";
import OnboardingTop from "@/components/Onboarding/OnboardingTop";
import OnboardingProfileCard from "@/components/Onboarding/OnboardingProfile/OnboardingProfileCard";

// Types

const AnimatedText = Animated.createAnimatedComponent(Text);

const OnboardingProfile = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <OnboardingTop />
      <AnimatedText
        entering={enter(0)}
        exiting={exit(0)}
        textCenter
        fontSize={getFontSize(16)}
      >
        Answer a few quick questions to personalize your migraine insights
      </AnimatedText>
      <Animated.View
        entering={enter(100)}
        exiting={exit(100)}
        style={{ flex: 1 }}
      >
        <OnboardingProfileCard />
      </Animated.View>
    </View>
  );
};

export default OnboardingProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

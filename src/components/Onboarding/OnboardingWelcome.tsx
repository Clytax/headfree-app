import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";

// Packages
import { useRouter } from "expo-router";
import Animated, {
  FadeIn,
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";

// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";
import OnboardingTop from "@/components/Onboarding/OnboardingTop";

// Assets
import WelcomeIllustration from "@/assets/illustrations/welcome.svg";
// Constants
import { Colors, Sizes } from "@/constants";

// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

// Types

const OnboardingWelcome = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Animated.View
        key="onboarding-top"
        entering={FadeIn.delay(300).duration(600)}
        exiting={SlideOutLeft.springify()
          .damping(22)
          .stiffness(90)
          .mass(1.1)
          .delay(120)} // slightly longer delay for illustration
      >
        <WelcomeIllustration />
      </Animated.View>

      <View style={styles.text}>
        <Animated.View
          key="welcome-text"
          entering={FadeIn.delay(300).duration(600)}
          exiting={SlideOutLeft.springify()
            .damping(22)
            .stiffness(90)
            .mass(1.1)
            .delay(120)} // slightly longer delay for illustration
        >
          <Text
            fontSize={getFontSize(45)}
            fontWeight="bold"
            style={{ letterSpacing: 4 }}
          >
            HEADFREE
          </Text>
          <Text fontSize={getFontSize(20)}>Your smart migraine tracker</Text>
        </Animated.View>
      </View>
    </View>
  );
};

export default OnboardingWelcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "30%",
  },
  text: {
    alignItems: "center",
    marginTop: hp(2),
  },
});

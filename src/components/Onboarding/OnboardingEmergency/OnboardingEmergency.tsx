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
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";
import OnboardingTop from "@/components/Onboarding/OnboardingTop";

// Types

// Animation
import { enter, exit } from "@/utils/animation/onboardingAnimation";
const AnimatedText = Animated.createAnimatedComponent(Text);

const OnboardingEmergency = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <OnboardingTop />
      <View style={styles.center}>
        <AnimatedText
          entering={enter(100)}
          exiting={exit(100)}
          textCenter
          fontSize={getFontSize(20)}
        >
          When a migraine strikes, tap Emergency for guided relief.
        </AnimatedText>

        <Animated.View
          entering={enter(200)}
          exiting={exit(200)}
          style={styles.button}
        >
          <View
            style={[
              styles.fab,
              {
                width: wp(15),
                height: wp(15),
                borderRadius: wp(15) / 2,
                backgroundColor: Colors.error,
              },
            ]}
          >
            <Text
              color={Colors.neutral600}
              fontWeight="bold"
              fontSize={getFontSize(35)}
            >
              !
            </Text>
          </View>
          <Text fontWeight="mediumitalic" fontSize={getFontSize(13)}>
            This is the Emergency Button
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};

export default OnboardingEmergency;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Sizes.horizontalLarge,
  },
  button: {
    marginTop: hp(5),
    justifyContent: "center",
    alignItems: "center",
    gap: Sizes.verticalExtraSmall,
  },
  fab: {
    justifyContent: "center",
    alignItems: "center",
  },
});

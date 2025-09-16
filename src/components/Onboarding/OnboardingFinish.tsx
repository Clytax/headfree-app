import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";

// Packages
import { useRouter } from "expo-router";
import Animated from "react-native-reanimated";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  getDoc,
} from "@react-native-firebase/firestore";
// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";
import OnboardingTop from "@/components/Onboarding/OnboardingTop";
// Constants
import { Colors, Sizes } from "@/constants";

// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";
import { enter, exit } from "@/utils/animation/onboardingAnimation";
import { useOnboardingStore } from "@/store/onboarding/useOnboardingStore";
import { useAuth } from "@/context/auth/AuthContext";
// Types

const db = getFirestore();
const OnboardingFinish = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <OnboardingTop />
      <Animated.View
        entering={enter(0)}
        exiting={exit(0)}
        style={{ marginBottom: hp(3) }}
      >
        <Text fontSize={getFontSize(20)} textCenter fontWeight="bold">
          Press Finish and start using Headfree!
        </Text>
      </Animated.View>

      <Animated.View
        entering={enter(100)}
        exiting={exit(100)}
        style={{ marginBottom: hp(19) }}
      >
        <Text textCenter>
          You can always change your migraine profile and data sources later in
          settings.
        </Text>
      </Animated.View>
    </View>
  );
};

export default OnboardingFinish;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
});

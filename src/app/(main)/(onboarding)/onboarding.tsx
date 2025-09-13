import React, { useCallback, useMemo, useRef, useEffect } from "react";
import { StyleSheet, View } from "react-native";

// Packages
import Animated, {
  FadeIn,
  FadeOut,
  FadeOutDown,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { getAuth, signOut } from "@react-native-firebase/auth";
import { shallow } from "zustand/shallow";

// Store
import { useOnboardingStore } from "@/store/onboarding/useOnboardingStore";

// Components
import {
  OnboardingDataSources,
  OnboardingEmergency,
  OnboardingFinish,
  OnboardingHeader,
  OnboardingProfile,
  OnboardingPromises,
  OnboardingWelcome,
} from "@/components/Onboarding";
import OnboardingPolicy from "@/components/Onboarding/OnboardingPolicy/OnboardingPolicy";
import { OnboardingNavigation } from "@/components/Onboarding/OnboardingBottom/OnboardingNavigation";
import Text from "@/components/common/Text";
import SafeAreaContainer from "@/components/common/Container/SafeAreaContainer";

// Constants
import { Colors, Sizes } from "@/constants";

// Utils
import { hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

type Step =
  | "Welcome"
  | "promises"
  | "policy"
  | "emergencySetup"
  | "migraineProfile"
  | "migraineDataSources"
  | "done";

const stepComponents: Record<Step, () => React.ReactElement> = {
  Welcome: () => <OnboardingWelcome />,
  promises: () => <OnboardingPromises />,
  policy: () => <OnboardingPolicy />,
  emergencySetup: () => <OnboardingEmergency />,
  migraineProfile: () => <OnboardingProfile />,
  migraineDataSources: () => <OnboardingDataSources />,
  done: () => <OnboardingFinish />,
};

const Onboarding = () => {
  const router = useRouter();

  const current = useOnboardingStore((s) => s.currentStep(), shallow) as Step;

  const NextLabel = useMemo(() => {
    if (current === "emergencySetup") return "Setup now";
    if (current === "done") return "Finish";
    return "Continue";
  }, [current]);

  const onLogout = useCallback(async () => {
    try {
      await signOut(getAuth());
      // router.replace("/login");
    } catch (err) {
      console.warn("Logout failed", err);
    }
  }, []);

  const handleFinish = useCallback(() => {
    // Write completed flag to backend
  }, []);

  const CurrentStep = stepComponents[current];

  return (
    <SafeAreaContainer>
      <View style={styles.container}>
        <OnboardingHeader />

        <View style={styles.center}>
          <CurrentStep />
        </View>

        <OnboardingNavigation onFinish={handleFinish} nextLabel={NextLabel} />

        {current === "Welcome" && (
          <Animated.View
            entering={FadeIn.delay(300).duration(600).springify()}
            exiting={FadeOutDown.springify()}
          >
            <Text
              onPress={onLogout}
              fontSize={getFontSize(14)}
              textCenter
              fontWeight="regularitalic"
              style={styles.logout}
              color={Colors.neutral200}
            >
              logout
            </Text>
          </Animated.View>
        )}
      </View>
    </SafeAreaContainer>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Sizes.containerPaddingHorizontal,
    paddingVertical: hp(1),
  },
  center: {
    flex: 1,
  },
  logout: {
    paddingTop: hp(2),
  },
});

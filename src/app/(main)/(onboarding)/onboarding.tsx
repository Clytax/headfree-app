import React, { useCallback, useMemo, useRef, useEffect } from "react";
import { StyleSheet, View } from "react-native";

// Packages
import Animated, {
  FadeIn,
  FadeOut,
  FadeOutDown,
} from "react-native-reanimated";
import { format, formatISO } from "date-fns";

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
import { useAuth } from "@/context/auth/AuthContext";

// Firebase
import {
  doc,
  getDoc,
  getFirestore,
  setDoc,
  serverTimestamp,
} from "@react-native-firebase/firestore";
import { OnboardingMigraineProfileSetup } from "@/store/onboarding/useOnboardingStore.types";
import OnboardingNotifications from "@/components/Onboarding/OnboardingNotifications/OnboardingNotifications";

type Step =
  | "Welcome"
  | "promises"
  | "policy"
  | "emergencySetup"
  | "migraineProfile"
  | "migraineDataSources"
  | "notifications"
  | "done";
const db = getFirestore();
const stepComponents: Record<Step, () => React.ReactElement> = {
  Welcome: () => <OnboardingWelcome />,
  promises: () => <OnboardingPromises />,
  policy: () => <OnboardingPolicy />,
  emergencySetup: () => <OnboardingEmergency />,
  migraineProfile: () => <OnboardingProfile />,
  migraineDataSources: () => <OnboardingDataSources />,
  notifications: () => <OnboardingNotifications />,
  done: () => <OnboardingFinish />,
};

const Onboarding = () => {
  const router = useRouter();

  const current = useOnboardingStore((s) => s.currentStep(), shallow) as Step;
  const data = useOnboardingStore((s) => s.data);
  const user = useAuth()?.user;
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
  const handleFinish = useCallback(async () => {
    const { data } = useOnboardingStore.getState();

    const consentTimeStamp = formatISO(new Date());
    const mp = data?.migraineProfile as
      | OnboardingMigraineProfileSetup
      | undefined;
    const em = data?.emergencySetup ?? {};
    const pol = data?.policy ?? {};

    if (!user) {
      console.warn("No user found, cannot finish onboarding");
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    const exists = userDocSnap.exists();
    const prevData = exists
      ? (userDocSnap.data() as { analytics?: any })
      : undefined;
    const prevAnalytics = prevData?.analytics ?? {};

    const finalDoc = {
      policy: {
        consentVersion: "1.0",
        consentTimeStamp,
        hasConsented: Boolean(pol?.accepted),
        hasConsentedToOptional: Boolean(pol?.optionalAccepted),
        deletionRequested: false,
        lastDataExport: null,
      },
      profile: {
        ageRange: mp?.ageRange ?? null,
        gender: mp?.gender ?? null,
        ...(mp?.location ? { location: mp.location } : { location: null }),
      },
      emergency: {
        brightness: em?.brightness ?? null,
        mutePhone: em?.mutePhone ?? null,
        noAnimations: em?.noAnimations ?? null,
      },
      baseline: {
        meals: mp?.meals ?? null,
        caffeine: mp?.caffeine ?? null,
        sleepDuration: mp?.sleepDuration ?? null,
        waterIntake: mp?.waterIntake ?? null,
        stress: mp?.stress ?? null,
        weatherSensitivity: mp?.weatherSensitivity ?? null,
        exercise: mp?.exercise ?? null,
        alcohol: mp?.alcohol ?? null,
        smoking: mp?.smoking ?? null,
      },
      analytics: {
        ...prevAnalytics,
        onboardingCompleted: true,
      },
      settings: {
        reminderEnabled: data?.settings?.sendReminders ?? false,
        reminderTime: data?.settings?.reminderTime ?? "22:00",
      },
    };

    await setDoc(
      userDocRef,
      { ...finalDoc, updatedAt: serverTimestamp() },
      { merge: true }
    );
  }, [user]);

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

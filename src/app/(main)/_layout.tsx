import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";

// Packages
import { useRouter, Tabs, Stack } from "expo-router";
// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";

// Firebase
import { getFirestore } from "@react-native-firebase/firestore";
// Constants
import { Colors, Sizes } from "@/constants";

// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

// Types

// Context
import { useAuth } from "@/context/auth/AuthContext";
import { useOnboardingStatus } from "@/hooks/firebase/useOnboardingStatus";
import { useEmergencyContext } from "@/context/emergency/EmergencyContext";

// Hooks
import { useUser } from "@/hooks/firebase/useUser";

const MainLayout = () => {
  const router = useRouter();
  const { isEnabled, settings } = useEmergencyContext();
  const { user } = useAuth();
  const userData = useUser();
  const onboardingCompleted = useOnboardingStatus(user?.uid).data;
  const signedPolicy = !!userData?.data?.privacy?.hasConsented;
  const db = getFirestore();
  console.log(signedPolicy);
  return (
    <Stack
      screenOptions={{
        animation: isEnabled
          ? settings?.noAnimations
            ? "none"
            : "default"
          : "default",
      }}
    >
      <Stack.Protected guard={!onboardingCompleted}>
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected
        guard={onboardingCompleted === true && onboardingCompleted}
      >
        <Stack.Protected guard={!signedPolicy}>
          <Stack.Screen name={"(policy)"} options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={signedPolicy}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          <Stack.Screen
            name="emergency-mode"
            options={{
              headerShown: false,

              presentation: "modal",
            }}
          />
        </Stack.Protected>
      </Stack.Protected>
    </Stack>
  );
};

export default MainLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

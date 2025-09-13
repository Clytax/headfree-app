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

const MainLayout = () => {
  const router = useRouter();

  const { user } = useAuth();
  const onboardingCompleted = useOnboardingStatus(user?.uid).data;
  const db = getFirestore();

  return (
    <Stack>
      <Stack.Protected guard={onboardingCompleted === true}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={onboardingCompleted === false}>
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
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

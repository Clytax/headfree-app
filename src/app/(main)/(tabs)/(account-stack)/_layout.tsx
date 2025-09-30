import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";

// Packages
import { useRouter, Stack } from "expo-router";

// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";

// Constants
import { Colors, Sizes } from "@/constants";

// Hooks
import { useEmergencyContext } from "@/context/emergency/EmergencyContext";
// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";
import { Settings } from "lucide-react-native";
import { useUser } from "@/hooks/firebase/useUser";

// Types

const AccountStack = () => {
  const router = useRouter();
  const user = useUser();
  const { isEnabled, settings, animationForStacks } = useEmergencyContext();
  const onSettings = () => {
    router.push("/(main)/(tabs)/(account-stack)/settings");
  };

  return (
    <Stack
      screenOptions={{
        animation: animationForStacks,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Account",
          headerStyle: {
            backgroundColor: Colors.neutral800,
          },
          headerRight: () => (
            <MyTouchableOpacity onPress={onSettings}>
              <Settings color={Colors.neutral200} size={hp(2.5)} />
            </MyTouchableOpacity>
          ),
        }}
      />

      <Stack.Screen
        name="settings"
        options={{
          title: "Settings",
          headerStyle: {
            backgroundColor: Colors.neutral800,
          },

          headerTintColor: Colors.text,
        }}
      />
    </Stack>
  );
};

export default AccountStack;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

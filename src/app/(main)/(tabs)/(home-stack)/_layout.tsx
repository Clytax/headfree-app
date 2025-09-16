import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";

// Packages
import { useRouter, Stack } from "expo-router";

// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";

// Assets
import { Settings } from "lucide-react-native";
// Constants
import { Colors, Sizes } from "@/constants";

// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

// Context
import { useAuth } from "@/context/auth/AuthContext";
// Types

const HomeStack = () => {
  const router = useRouter();
  const { user } = useAuth();

  const onSettings = () => {};
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Home",
          headerStyle: {
            backgroundColor: Colors.neutral800,
          },
          headerLeft: () => (
            <Text fontWeight="bold">Hi {user?.displayName ?? ""}</Text>
          ),
          headerRight: () => (
            <MyTouchableOpacity onPress={onSettings}>
              <Settings color={Colors.neutral200} size={hp(2.5)} />
            </MyTouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
};

export default HomeStack;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

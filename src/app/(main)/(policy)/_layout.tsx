import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";

// Packages
import { Stack, useRouter } from "expo-router";

// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";

// Constants
import { Colors, Sizes } from "@/constants";

// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

// Types

const PolicyLayout = () => {
  const router = useRouter();
  return (
    <Stack>
      <Stack.Screen
        name="accept-policy"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default PolicyLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

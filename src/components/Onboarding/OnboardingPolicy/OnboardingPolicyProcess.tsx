import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";

// Packages
import { useRouter } from "expo-router";

// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";

// Constants
import { Colors, Sizes } from "@/constants";

// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

// Types

const OnboardingPolicyProcess = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text fontWeight="bold">What we process</Text>
      <Text fontSize={getFontSize(14)} style={{ lineHeight: getFontSize(17) }}>
        Migraine logs, notes you enter, and your emergency preferences. This is
        health data and needs your explicit consent.
      </Text>
    </View>
  );
};

export default OnboardingPolicyProcess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: Sizes.extraSmallRadius,
  },
});

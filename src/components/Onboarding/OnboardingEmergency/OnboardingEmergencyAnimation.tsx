import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";

// Packages
import { useRouter } from "expo-router";
import { Checkbox } from "expo-checkbox";
// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";

// Constants
import { Colors, Sizes } from "@/constants";

// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

// Types

// Zustand
import { useOnboardingStore } from "@/store/onboarding/useOnboardingStore";
const OnboardingEmergencyAnimations = () => {
  const router = useRouter();

  const noAnimations = useOnboardingStore(
    (s) => s.data.emergencySetup.noAnimations
  );
  const updateEmergencySetup = useOnboardingStore(
    (s) => s.updateEmergencySetup
  );

  const toggleAnimations = () => {
    updateEmergencySetup({ noAnimations: !noAnimations });
  };
  return (
    <View style={styles.container}>
      <Text style={{ maxWidth: "70%" }}>
        Disable animations during Emergency
      </Text>
      <Checkbox
        value={noAnimations}
        onValueChange={toggleAnimations}
        color={noAnimations ? Colors.primary : undefined}
      />
    </View>
  );
};

export default OnboardingEmergencyAnimations;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(2),
    justifyContent: "space-between",
  },
});

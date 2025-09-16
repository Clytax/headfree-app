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
const OnboardingEmergencyMute = () => {
  const router = useRouter();

  const isMuted = useOnboardingStore((s) => s.data.emergencySetup.mutePhone);
  const updateEmergencySetup = useOnboardingStore(
    (s) => s.updateEmergencySetup
  );

  const toggleMute = () => {
    updateEmergencySetup({ mutePhone: !isMuted });
  };
  return (
    <View style={styles.container}>
      <Text>Mute phone during Emergency</Text>
      <Checkbox
        value={isMuted}
        onValueChange={toggleMute}
        color={isMuted ? Colors.primary : undefined}
      />
    </View>
  );
};

export default OnboardingEmergencyMute;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(2),
    justifyContent: "space-between",
  },
});

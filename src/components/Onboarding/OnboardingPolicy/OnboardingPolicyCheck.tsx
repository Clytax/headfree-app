import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";

// Packages
import { useRouter } from "expo-router";
import { Checkbox } from "expo-checkbox";

// Constants
import { Colors, Sizes } from "@/constants";

// Hooks

// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

// Types
import { OnboardingPolicyCheckProps } from "@/components/Onboarding/OnboardingPolicy/OnboardingPolicy.types";
// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";

// Hooks

const OnboardingPolicyCheck = ({
  isActive = false,
  onPress,
  label,
  description,
  required = false,
  accessibilityLabel,
}: OnboardingPolicyCheckProps) => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text fontWeight="bold" accessibilityLabel={accessibilityLabel}>
        {label}
      </Text>
      <View style={styles.main}>
        <Checkbox
          value={isActive}
          onValueChange={onPress}
          color={isActive ? Colors.primary : Colors.neutral300}
        />
        <Text
          onPress={onPress}
          fontSize={getFontSize(14)}
          style={{ lineHeight: getFontSize(20), maxWidth: "90%" }}
        >
          {description}
          {required && <Text color={Colors.error}>*</Text>}
        </Text>
      </View>
    </View>
  );
};

export default OnboardingPolicyCheck;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: hp(1),
  },
  main: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
  },
});

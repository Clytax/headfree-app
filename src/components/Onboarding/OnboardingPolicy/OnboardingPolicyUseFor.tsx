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

const USES = [
  "Help you track patterns",
  "Give quick access to the emergency info you stored",
  "Estimate your migraine risk",
  "Improve your in-app purchases",
];
const OnboardingPolicyUseFor = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text fontWeight="bold">What we use it for</Text>
      <View style={styles.list}>
        {USES.map((use, index) => (
          <View key={index} style={{ flexDirection: "row" }}>
            <Text
              fontWeight="bold"
              style={{ marginRight: wp(2) }}
              fontSize={getFontSize(14)}
            >
              •
            </Text>
            <Text style={{ flex: 1 }} fontSize={getFontSize(14)}>
              {use}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default OnboardingPolicyUseFor;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: Sizes.verticalExtraSmall,
  },
  list: {
    gap: 4,
    paddingLeft: wp(2),
  },
});

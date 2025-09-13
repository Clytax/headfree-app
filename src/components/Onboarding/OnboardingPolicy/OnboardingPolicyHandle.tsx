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

const OnboardingPolicyHandle = () => {
  const router = useRouter();

  const onPrivacyPolicyPress = () => {};
  return (
    <View style={styles.container}>
      <Text
        fontWeight="bold"
        style={{ paddingBottom: Sizes.verticalExtraSmall }}
      >
        How we handle your data
      </Text>
      <Text fontSize={getFontSize(14)} style={{ lineHeight: getFontSize(17) }}>
        Your data is stored in encrypted form on secure servers located in the
        European Union. It is never sold and only shared if you choose to export
        it. Your data is kept until you delete it or withdraw your consent.
      </Text>

      <Text
        fontSize={getFontSize(14)}
        style={{
          lineHeight: getFontSize(17),
          paddingVertical: Sizes.paddingVerticalSmall,
        }}
      >
        You can access, delete, or withdraw consent at any time in Settings
      </Text>

      <Text fontWeight="bold" fontSize={getFontSize(15)}>
        Read the details here:{" "}
        <Text color={Colors.primary300}>(Privacy Policy)</Text>
      </Text>
    </View>
  );
};

export default OnboardingPolicyHandle;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";

// Packages
import { useRouter } from "expo-router";

// Constants
import { Colors, Sizes } from "@/constants";

// Hooks

// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

// Types

// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";

// Hooks

interface AuthAGBProps {
  loading?: boolean;
}

const AuthAGB = ({ loading }: AuthAGBProps) => {
  const onTermsOfServicesPress = () => {
    if (loading) return;
  };

  const onPrivacyPolicyPress = () => {
    if (loading) return;
  };
  const router = useRouter();
  return (
    <Text
      style={{ lineHeight: getFontSize(13) }}
      fontSize={getFontSize(10)}
      textCenter
    >
      By registering you agree to our{" "}
      <Text fontSize={getFontSize(10)} color={Colors.primaryLight}>
        Terms of Service
      </Text>
      . {"\n"}
      You can review our{" "}
      <Text fontSize={getFontSize(10)} color={Colors.primaryLight}>
        Privacy Policy
      </Text>{" "}
      and data usage details during onboarding.
    </Text>
  );
};
export default AuthAGB;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Background,
  },
});

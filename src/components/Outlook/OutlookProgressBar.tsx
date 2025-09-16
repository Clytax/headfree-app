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
import { OutlookProgressBarProps } from "@/components/Outlook/Outlook.types";

// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";

// Hooks

const OutlookProgressBar = ({ percentage }: OutlookProgressBarProps) => {
  const router = useRouter();

  const getColorOfBar = () => {
    if (percentage >= 75) return Colors.error;
    if (percentage >= 50) return Colors.warning;
    return Colors.success;
  };
  return (
    <View style={styles.container}>
      <View
        style={{
          backgroundColor: getColorOfBar(),
          height: "100%",
          width: `${percentage}%`,
          borderRadius: Sizes.extraLargeRadius - 1,
        }}
      />
    </View>
  );
};

export default OutlookProgressBar;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral700,
    height: hp(3),
    borderColor: Colors.neutral500,
    borderWidth: 1,
    borderRadius: Sizes.extraLargeRadius,
  },
});

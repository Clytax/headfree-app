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
import { OutlookGuideCardProps } from "@/components/Outlook/Outlook.types";
// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";

// Hooks

const OutlookGuideCard = ({ text }: OutlookGuideCardProps) => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text
        style={{ lineHeight: getFontSize(21) }}
        fontSize={getFontSize(16)}
        textCenter
      >
        {text}
      </Text>
    </View>
  );
};

export default OutlookGuideCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral800,
    paddingVertical: Sizes.verticalSmall,
    paddingHorizontal: Sizes.paddingHorizontalMedium,
    width: "100%",
    borderRadius: Sizes.largeRadius,
    borderColor: Colors.neutral500,
    borderWidth: 1,
  },
});

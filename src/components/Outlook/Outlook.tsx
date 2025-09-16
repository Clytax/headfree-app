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
import OutlookProgressBar from "@/components/Outlook/OutlookProgressBar";
import {
  getOutlookGuideText,
  getOutlookRiskFactorsText,
} from "@/utils/text/outlook";
import OutlookGuideCard from "@/components/Outlook/OutlookGuideCard";
// Types

const FAKE_DATA = {
  percentage: 86,
  riskFactors: ["cycle", "stress", "sleep"],
};
const Outlook = () => {
  const router = useRouter();

  const percentage = FAKE_DATA.percentage;
  const riskFactors = FAKE_DATA.riskFactors;
  const getOutlookText = () => {
    if (percentage >= 75) return "High";
    if (percentage >= 50) return "Medium";
    return "Low";
  };
  return (
    <View style={styles.container}>
      <Text
        textCenter
        fontSize={getFontSize(25)}
        fontWeight="regularitalic"
        uppercase
      >
        {getOutlookText()}
      </Text>
      <Text textCenter fontSize={getFontSize(40)} fontWeight="bold">
        {percentage}%
      </Text>
      <OutlookProgressBar percentage={percentage} />

      <Text
        style={{
          paddingVertical: Sizes.marginVerticalLarge,
          lineHeight: getFontSize(21),
        }}
        textCenter
      >
        {getOutlookRiskFactorsText(riskFactors)}
      </Text>

      <OutlookGuideCard text={getOutlookGuideText(percentage)} />
    </View>
  );
};

export default Outlook;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: Sizes.verticalExtraSmall,
    marginVertical: Sizes.marginVerticalLarge,
    paddingHorizontal: Sizes.containerPaddingHorizontal * 2,
  },
});

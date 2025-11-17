import React, { useState, useEffect, useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
// Packages
import { useRouter } from "expo-router";
// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";
import OutlookGuideCard from "@/components/Outlook/OutlookGuideCard";
// Constants
import { Colors, Sizes } from "@/constants";
// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";
import { formatFeatureName } from "@/components/Prediction/utils/predictionUtils";
import OutlookProgressBar from "@/components/Outlook/OutlookProgressBar";
import {
  getOutlookGuideText,
  getOutlookRiskFactorsText,
} from "@/utils/text/outlook";
import { getPredictionByDate } from "@/utils/firebase/prediction";
// Hooks
import { usePredictions } from "@/hooks/firebase/usePredictions";
import { useUser } from "@/hooks/firebase/useUser";
import { IUserDoc, IUserPrediction } from "@/types/user";

const today = new Date();
const todayJustDate = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate()
);

interface OutlookProps {
  prediction: IUserPrediction | null;
}

const Outlook = ({ prediction }: OutlookProps) => {
  const router = useRouter();
  const user = useUser();
  const predictions = usePredictions().data;
  const todaysPrediction = getPredictionByDate(predictions, todayJustDate);
  // Use real prediction data - prioritize the prop, fallback to today's prediction
  const activePrediction = prediction || todaysPrediction;

  // Extract percentage and risk factors from real data
  const percentage = activePrediction?.migraine_probability
    ? activePrediction?.migraine_probability * 100
    : 0;
  const riskFactors = activePrediction?.top_risk_factors ?? [];
  const getOutlookText = () => {
    if (percentage >= 75) return "High";
    if (percentage >= 50) return "Medium";
    return "Low";
  };
  const handleOpenDetails = useCallback(() => {
    console.log("hi");
    if (!prediction?.prediction_date) {
      // If your prediction ID field is different, change this accordingly
      return;
    }

    router.push({
      pathname: "/(main)/(tabs)/(home-stack)/prediction-result",
      params: { prediction_date: prediction.prediction_date },
    });
  }, [prediction?.prediction_date, router]);

  // Show loading or empty state if no prediction available
  if (!activePrediction) {
    return (
      <View style={styles.container}>
        <Text textCenter fontSize={getFontSize(18)}>
          No prediction data available
        </Text>
      </View>
    );
  }

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
        {percentage?.toFixed(0)}%
      </Text>
      <Pressable onPress={handleOpenDetails} style={styles.detailsInlineBtn}>
        <Text fontSize={getFontSize(14)} color={Colors.primary}>
          View Details
        </Text>
      </Pressable>
      <OutlookProgressBar percentage={percentage} />
      <Text
        style={{
          paddingVertical: Sizes.marginVerticalLarge,
          lineHeight: getFontSize(22),
        }}
        textCenter
      >
        {getOutlookRiskFactorsText(
          riskFactors?.map((factor) => factor.feature)
        )}
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
    position: "relative",
  },
  openDetails: {
    marginTop: hp(2),
    paddingVertical: hp(1.5),
    backgroundColor: Colors.primary500 + "20",
    borderRadius: Sizes.smallRadius,
    zIndex: 10000,
    position: "relative",
  },
  detailsInlineBtn: {
    marginBottom: hp(1),
    alignSelf: "center",
  },
});

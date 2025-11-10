// File: components/Home/HomePredictionBottomSheet/views/ResultsState.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import { BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet";
import { AlertCircle, CheckCircle } from "lucide-react-native";
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";
import { Colors } from "@/constants";
import { getFontSize } from "@/utils/text/fonts";
import { wp, hp } from "@/utils/ui/sizes";
import { IUserPrediction } from "@/types/user";
import { formatFeatureName } from "../utils/predictionUtils";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ResultsStateProps {
  result: IUserPrediction;
  riskColor: string;
  latencyMs: number | null;
  onClose: () => void;
}

const ResultsState: React.FC<ResultsStateProps> = ({
  result,
  riskColor,
  onClose,
  latencyMs,
}) => {
  const insets = useSafeAreaInsets();
  return (
    <BottomSheetScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: insets.bottom + hp(2),
      }}
    >
      <View style={styles.successIconContainer}>
        <CheckCircle size={48} color={Colors.success500} />
        {latencyMs !== null && (
          <Text
            fontSize={getFontSize(12)}
            color={Colors.neutral400}
            textCenter
            style={{}}
          >
            Generated in{" "}
            {latencyMs < 1000
              ? `${latencyMs} ms`
              : `${(latencyMs / 1000).toFixed(1)} s`}
          </Text>
        )}
      </View>

      <Text
        fontWeight="bold"
        fontSize={getFontSize(22)}
        textCenter
        style={styles.title}
      >
        {"Your Migraine Forecast"}
      </Text>

      <View style={[styles.riskBadge, { backgroundColor: `${riskColor}20` }]}>
        <Text
          fontSize={getFontSize(16)}
          fontWeight="bold"
          style={{ color: riskColor }}
        >
          {result.risk_level} Risk
        </Text>
      </View>

      <View style={styles.probabilityContainer}>
        <Text fontSize={getFontSize(48)} fontWeight="bold" color={riskColor}>
          {Math.round(result.migraine_probability * 100)}%
        </Text>
        <Text
          fontSize={getFontSize(14)}
          color={Colors.neutral400}
          style={styles.probabilityLabel}
        >
          Migraine Probability
        </Text>
      </View>

      <View style={styles.factorsContainer}>
        <Text
          fontSize={getFontSize(18)}
          fontWeight="semibold"
          style={styles.factorsTitle}
        >
          Top Risk Factors
        </Text>

        {result.top_risk_factors.slice(0, 4).map((factor, index) => (
          <View key={`${factor.feature}-${index}`} style={styles.factorItem}>
            <View style={styles.factorHeader}>
              <Text
                fontSize={getFontSize(15)}
                fontWeight="medium"
                color={Colors.text}
              >
                {formatFeatureName(factor.feature)}
              </Text>
              <Text
                fontSize={getFontSize(14)}
                color={Colors.primary}
                fontWeight="semibold"
              >
                {Math.round(factor.importance * 100)}%
              </Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${factor.importance * 100}%`,
                    backgroundColor: Colors.primary500,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.disclaimerContainer}>
        <AlertCircle size={16} color={Colors.neutral400} />
        <Text
          fontSize={getFontSize(12)}
          color={Colors.neutral400}
          style={styles.disclaimerText}
        >
          This is an estimation based on your data and not medical advice.
          Consult healthcare professionals for medical decisions.
        </Text>
      </View>
      <MyTouchableOpacity
        onPress={onClose}
        style={styles.closeButton}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Close"
        accessibilityHint="Close this screen"
        hitSlop={8}
      >
        <Text fontWeight="bold" fontSize={getFontSize(16)} color={Colors.white}>
          Close
        </Text>
      </MyTouchableOpacity>
    </BottomSheetScrollView>
  );
};

export default ResultsState;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: hp(2),
  },
  successIconContainer: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    gap: hp(1),
    marginBottom: hp(2),
  },
  title: {
    marginBottom: hp(1.5),
  },
  riskBadge: {
    alignSelf: "center",
    paddingHorizontal: wp(6),
    paddingVertical: hp(1),
    borderRadius: 20,
    marginBottom: hp(2),
  },
  probabilityContainer: {
    alignItems: "center",
    marginVertical: hp(2),
  },
  probabilityLabel: {
    marginTop: hp(0),
  },
  factorsContainer: {
    marginTop: hp(2),
  },
  factorsTitle: {
    marginBottom: hp(2),
  },
  factorItem: {
    marginBottom: hp(2),
  },
  factorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(0.5),
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: Colors.neutral700,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  disclaimerContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: wp(2),
    backgroundColor: Colors.neutral800,
    padding: wp(3),
    borderRadius: 8,
    marginTop: hp(3),
    marginBottom: hp(2),
  },
  disclaimerText: {
    flex: 1,
    lineHeight: getFontSize(12) * 1.4,
  },
  closeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: hp(1.8),
    borderRadius: 12,
    alignItems: "center",
  },
});

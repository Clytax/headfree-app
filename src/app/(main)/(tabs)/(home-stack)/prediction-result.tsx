// app/(modals)/prediction-result.tsx
import React from "react";
import { ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import PredictionResultContent from "@/components/Prediction/PredictionResultContent";
import { getRiskColor } from "@/components/Prediction/utils/predictionUtils";
import { usePredictions } from "@/hooks/firebase/usePredictions";
import { useYesterdayEntry } from "@/hooks/firebase/useDailyEntry";

export default function PredictionResultScreen() {
  const router = useRouter();
  const { prediction_date } = useLocalSearchParams<{
    prediction_date?: string;
  }>();
  const { data: predictions } = usePredictions();
  const {
    hasYesterdayEntry,
    yesterdayDate,
    yesterdaysEntry,
    isLoading: isLoadingYesterday,
  } = useYesterdayEntry();

  const prediction = predictions?.find(
    (p) => p.prediction_date === prediction_date
  );

  if (!prediction) {
    // show loading / error UI
    return null;
  }

  return (
    <PredictionResultContent
      result={prediction}
      riskColor={getRiskColor(prediction.risk_level ?? "unknown")}
      yesterdaysEntry={yesterdaysEntry}
      isInBottomSheet={false}
      ScrollComponent={ScrollView}
      onClose={() => router.back()}
    />
  );
}

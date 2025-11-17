// components/Home/HomePredictionBottomSheet/views/ResultsState.tsx
import React from "react";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import PredictionResultContent from "@/components/Prediction/PredictionResultContent";
import { IUserPrediction } from "@/types/user";
import { DiaryEntry } from "@/components/Prediction/PredictionRecommendation";

interface ResultsStateProps {
  result: IUserPrediction;
  riskColor: string;
  latencyMs: number | null;
  onClose: () => void;
  yesterdaysEntry?: DiaryEntry;
}

const ResultsState: React.FC<ResultsStateProps> = (props) => {
  return (
    <PredictionResultContent
      {...props}
      ScrollComponent={BottomSheetScrollView}
      isInBottomSheet
    />
  );
};

export default ResultsState;

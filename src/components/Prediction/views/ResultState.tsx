// components/Home/HomePredictionBottomSheet/views/ResultsState.tsx
import React, { useEffect, useRef } from "react";
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

  // NEW
  onFirstRender?: () => void;
}

const ResultsState: React.FC<ResultsStateProps> = (props) => {
  const didFireRef = useRef(false);

  useEffect(() => {
    if (didFireRef.current) return;
    didFireRef.current = true;

    requestAnimationFrame(() => {
      props.onFirstRender?.();
    });
  }, [props]);

  return (
    <PredictionResultContent
      {...props}
      ScrollComponent={BottomSheetScrollView}
      isInBottomSheet
    />
  );
};

export default ResultsState;

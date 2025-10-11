import React, {
  useCallback,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import { StyleSheet } from "react-native";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { Colors, Sizes } from "@/constants";
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

import { LOADING_MESSAGES, useLoadingMessages } from "./useLoadingMessages";
import { getRiskColor } from "./utils/predictionUtils";

import LoadingState from "./views/LoadingState";
import InitialState from "./views/InitialState";
import ResultsState from "./views/ResultState";
import { IUserPrediction } from "@/types/user";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// HOokd
import { getAuth, getIdToken } from "@react-native-firebase/auth";

export interface HomePredictionBottomSheetProps {
  yesterdayDate: string;
  onClose?: () => void;
  userId: string;
}

export interface HomePredictionBottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

const HomePredictionBottomSheet = forwardRef<
  HomePredictionBottomSheetRef,
  HomePredictionBottomSheetProps
>(({ onClose, userId }, ref) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["65%"], []);
  const insets = useSafeAreaInsets();
  const auth = getAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictionResult, setPredictionResult] =
    useState<IUserPrediction | null>(null);

  const { loadingMessage, startCycling, stopCycling } = useLoadingMessages(
    LOADING_MESSAGES,
    2000
  );

  const present = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const dismiss = useCallback(() => {
    bottomSheetRef.current?.dismiss();
    setTimeout(() => {
      setIsLoading(false);
      setError(null);
      setPredictionResult(null);
      stopCycling();
    }, 300);
  }, [stopCycling]);

  useImperativeHandle(ref, () => ({ present, dismiss }), [present, dismiss]);

  const handleGeneratePrediction = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    startCycling();

    try {
      const auth = getAuth();
      const userToken = await getIdToken(auth.currentUser!, true);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

      const fullUrl = `${process.env.EXPO_PUBLIC_HEADFREE_API}/predict`;
      console.log(fullUrl);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_HEADFREE_API}/predict`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            prediction_date: new Date().toISOString().slice(0, 10),
          }),
          signal: controller.signal, // attach the abort signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error("Failed to generate prediction");

      const data = (await response.json()) as IUserPrediction;
      setPredictionResult(data);
    } catch (err: any) {
      if (err.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        console.error("Error generating prediction:", err);
        setError("Failed to generate prediction. Please try again.");
      }
    } finally {
      setIsLoading(false);
      stopCycling();
    }
  }, [startCycling, stopCycling, userId]);

  const backdropComponent = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.8}
        pressBehavior="close"
      />
    ),
    []
  );

  const bgStyle = useMemo(
    () => ({
      backgroundColor: Colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    }),
    []
  );

  const indicatorStyle = useMemo(
    () => ({
      backgroundColor: Colors.neutral300,
      width: wp(12),
    }),
    []
  );

  const onDismiss = useCallback(() => {
    onClose?.();
  }, [onClose]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      enableDynamicSizing
      enablePanDownToClose={!isLoading}
      onDismiss={onDismiss}
      enableDismissOnClose
      backgroundStyle={bgStyle}
      handleIndicatorStyle={indicatorStyle}
      backdropComponent={backdropComponent}
    >
      {isLoading && (
        <LoadingState
          title={loadingMessage}
          subtitle="This may take a few moments"
        />
      )}

      {!isLoading && predictionResult && (
        <ResultsState
          result={predictionResult}
          riskColor={getRiskColor(predictionResult.risk_level)}
          onClose={dismiss}
        />
      )}

      {!isLoading && !predictionResult && (
        <InitialState
          error={error}
          onGenerate={handleGeneratePrediction}
          onLater={dismiss}
        />
      )}
    </BottomSheetModal>
  );
});

HomePredictionBottomSheet.displayName = "HomePredictionBottomSheet";
export default HomePredictionBottomSheet;

const styles = StyleSheet.create({});

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

// Hooks
import { getAuth, getIdToken } from "@react-native-firebase/auth";

//  Utils
import { callPredict } from "@/utils/prediction/predict";

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

  const [latencyMs, setLatencyMs] = useState<number | null>(null);
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
      setLatencyMs(null);
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
      const { outcome, data } = await callPredict(userToken, 20000, {
        amountOfTests: 1,
        force: false,
      });

      setLatencyMs(outcome.ms);

      if (outcome.ok) {
        // Type is narrowed to the success variant here
        console.log(
          `[PERF] avg=${outcome.ms.toFixed(1)}ms ` +
            `p50=${outcome.p50Ms?.toFixed(1)} ` +
            `p90=${outcome.p90Ms?.toFixed(1)} ` +
            `samples=${outcome.samples?.length ?? 1}`
          // `Peak RSS`
          //   + ` peakRssKb50=${outcome.peakRssP50Kb?.toFixed(1)}kb`
          //   + ` peakRssKb90=${outcome.peakRssP90Kb?.toFixed(1)}kb`
          //   + `peakRssSamples=${outcome.peakRssKbSamples? ?? 0}`
        );
      } else {
        console.log(
          `[PERF] predict failed kind=${outcome.kind} status=${
            outcome.status ?? ""
          } ms=${outcome.ms}`
        );
      }

      if (!outcome.ok) throw new Error(outcome.kind);
      setPredictionResult(data as IUserPrediction);
    } catch (err: any) {
      setError(
        err.message === "timeout"
          ? "Request timed out. Please try again."
          : "Failed to generate prediction. Please try again."
      );
    } finally {
      setIsLoading(false);
      stopCycling();
    }
  }, [startCycling, stopCycling]);

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
          latencyMs={latencyMs}
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

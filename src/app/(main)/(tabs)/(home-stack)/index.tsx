// React and React Native Imports
import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

// Navigation and Routing
import { useSegments } from "expo-router";

// Context and Hooks
import { useAuth } from "@/context/auth/AuthContext";
import { usePredictions } from "@/hooks/firebase/usePredictions";
import { useYesterdayEntry } from "@/hooks/firebase/useDailyEntry";

// Custom Components
import DailyTips from "@/components/DailyTip/DailyTips";
import Divider from "@/components/common/Divider/Divider";
import HomeGeneratePrediction from "@/components/Outlook/HomeGeneratePrediction";
import HomeNoPredictionToday from "@/components/Outlook/HomeNoPredictionToday";
import Outlook from "@/components/Outlook/Outlook";
import HomePredictionBottomSheet, {
  HomePredictionBottomSheetRef,
} from "@/components/Prediction/";
import HistoryModal from "@/components/Outlook/PredictionHistory";
import WeeklyHint from "@/components/WeeklyHint/WeeklyHint";

// Outcome modal (FR-10)
import OutcomeCheckModal from "@/components/Outcome/OutcomeModal";

// Constants and Utilities
import { Colors, Sizes } from "@/constants";
import { hp } from "@/utils/ui/sizes";
import { getPredictionByDate } from "@/utils/firebase/prediction";
import { MaterialIcons } from "@expo/vector-icons";
import {
  canShowPrompt,
  clearDismissalTime,
} from "@/utils/storage/predictionPrompt";

// Outcome helpers (you add these)
import {
  canShowOutcomeCheck,
  clearOutcomeCheckDismissed,
  getDateKey,
  markOutcomeCheckDismissed,
} from "@/utils/storage/outcomeCheckPrompt";
import {
  fetchOutcomeByDate,
  saveOutcomeByDate,
  Severity,
} from "@/utils/firebase/outcome";
import { getFirestore } from "@react-native-firebase/firestore";

type HistoryFilter =
  | { type: "caffeine"; operator: "=="; value: number }
  | { type: "alcohol"; operator: "=="; value: number }
  | { type: "sleepMinutesLessThan"; value: number };

// Note: evaluated at module load. If you need it to update at midnight without a reload,
// move this inside the component and refresh it via AppState/timer.
const today = new Date();
const todayJustDate = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate()
);
const yesterdayJustDate = new Date(todayJustDate);
yesterdayJustDate.setDate(todayJustDate.getDate() - 1);

const Home = () => {
  const { user: userAuth } = useAuth();
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter | null>(
    null
  );

  const db = getFirestore();
  const [historyVisible, setHistoryVisible] = useState(false);
  const [canShowSheet, setCanShowSheet] = useState(false);

  // FR-10 state
  const [outcomeVisible, setOutcomeVisible] = useState(false);

  const predictions = usePredictions().data;
  const segments = useSegments();

  const {
    hasYesterdayEntry,
    yesterdayDate,
    yesterdaysEntry,
    isLoading: isLoadingYesterday,
  } = useYesterdayEntry();

  const bottomSheetRef = useRef<HomePredictionBottomSheetRef>(null);

  const todaysPrediction = useMemo(() => {
    if (!predictions) return null;
    return getPredictionByDate(predictions, todayJustDate);
  }, [predictions]);

  const hasTodaysPrediction = !!todaysPrediction;

  const yesterdaysPrediction = useMemo(() => {
    if (!predictions) return null;
    return getPredictionByDate(predictions, yesterdayJustDate);
  }, [predictions]);

  // Check if we can show the prediction-generation prompt
  useEffect(() => {
    const checkPromptEligibility = async () => {
      const eligible = await canShowPrompt();
      setCanShowSheet(eligible);
    };
    checkPromptEligibility();
  }, []);

  useEffect(() => {
    // Show bottom sheet if no today's prediction AND has yesterday's entry AND cooldown has passed
    if (
      !isLoadingYesterday &&
      !hasTodaysPrediction &&
      hasYesterdayEntry &&
      segments.includes("(home-stack)") &&
      canShowSheet
    ) {
      const timer = setTimeout(() => {
        bottomSheetRef.current?.present();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [
    hasTodaysPrediction,
    hasYesterdayEntry,
    isLoadingYesterday,
    segments,
    canShowSheet,
  ]);

  // Clear the dismissal time when user gets a prediction
  useEffect(() => {
    if (hasTodaysPrediction) {
      clearDismissalTime();
    }
  }, [hasTodaysPrediction]);

  // FR-10: Next-day outcome check modal (NO reminder)
  useEffect(() => {
    const uid = userAuth?.uid;
    if (!uid) return;
    if (!segments.includes("(home-stack)")) return;

    // Optional gating: only ask if there was a prediction to label
    if (!yesterdaysPrediction) return;

    let cancelled = false;

    const run = async () => {
      const pendingKey = getDateKey(yesterdayJustDate);

      // If already answered, do not prompt
      const existingOutcome = await fetchOutcomeByDate(
        uid,
        yesterdayJustDate,
        db
      );
      if (cancelled) return;
      if (existingOutcome) return;

      // In-app: show at most once per day for that pendingKey
      const eligible = await canShowOutcomeCheck(pendingKey);
      if (cancelled) return;

      if (eligible) setOutcomeVisible(true);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [userAuth?.uid, segments, yesterdaysPrediction]);

  const MemoizedOutlook = Outlook;
  const MemoizedGeneratePrediction = HomeGeneratePrediction;
  const MemoizedNoPrediction = HomeNoPredictionToday;

  const outlookContent = useMemo(() => {
    if (hasTodaysPrediction) {
      return <MemoizedOutlook prediction={todaysPrediction} />;
    }

    if (hasYesterdayEntry) {
      return (
        <MemoizedGeneratePrediction
          openPredictionModal={() => bottomSheetRef.current?.present()}
        />
      );
    }

    return <MemoizedNoPrediction />;
  }, [
    hasTodaysPrediction,
    hasYesterdayEntry,
    todaysPrediction,
    MemoizedGeneratePrediction,
    MemoizedOutlook,
    MemoizedNoPrediction,
  ]);

  const pendingOutcomeKey = getDateKey(yesterdayJustDate);

  return (
    <View style={styles.container}>
      <Divider title="Daily Tip" />
      <DailyTips />

      <WeeklyHint
        setHistoryFilter={setHistoryFilter}
        setHistoryVisible={setHistoryVisible}
      />

      <Divider
        title="Outlook"
        rightIcon={
          <MaterialIcons name="history" size={20} color={Colors.primary} />
        }
        onPressRight={() => {
          setHistoryFilter(null);
          setHistoryVisible(true);
        }}
        rightAccessibilityLabel="Open prediction history"
      />

      {outlookContent}

      <HomePredictionBottomSheet
        ref={bottomSheetRef}
        yesterdayDate={yesterdayDate}
        onClose={() => bottomSheetRef.current?.dismiss()}
        userId={userAuth?.uid || ""}
        yesterdaysEntry={yesterdaysEntry}
      />

      <HistoryModal
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
        filter={historyFilter}
      />

      {/* FR-10 Outcome modal */}
      <OutcomeCheckModal
        visible={outcomeVisible}
        dateLabel={`For ${yesterdayJustDate.toDateString()}`}
        onClose={async () => {
          await markOutcomeCheckDismissed(pendingOutcomeKey);
          setOutcomeVisible(false);
        }}
        onSubmit={async (payload: {
          hadMigraine: boolean;
          severity?: Severity;
        }) => {
          const uid = userAuth?.uid;
          if (!uid) return;

          await saveOutcomeByDate(uid, yesterdayJustDate, db, payload);

          await clearOutcomeCheckDismissed(pendingOutcomeKey);
          setOutcomeVisible(false);
        }}
      />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Sizes.containerPaddingHorizontal,
    paddingVertical: hp(1),
  },
});

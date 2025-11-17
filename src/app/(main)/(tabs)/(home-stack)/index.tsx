// React and React Native Imports
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pressable, StyleSheet, View } from "react-native";

// Navigation and Routing
import { usePathname, useRouter, useSegments } from "expo-router";

// Third-Party Libraries
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Context and Hooks
import { useAuth } from "@/context/auth/AuthContext";
import { useUser } from "@/hooks/firebase/useUser";
import { usePredictions } from "@/hooks/firebase/usePredictions";
import { useYesterdayEntry } from "@/hooks/firebase/useDailyEntry";

// Custom Components
import DailyTips from "@/components/DailyTip/DailyTips";
import Divider from "@/components/common/Divider/Divider";
import Text from "@/components/common/Text";
import HomeGeneratePrediction from "@/components/Outlook/HomeGeneratePrediction";
import HomeNoPredictionToday from "@/components/Outlook/HomeNoPredictionToday";
import Outlook from "@/components/Outlook/Outlook";
import HomePredictionBottomSheet, {
  HomePredictionBottomSheetRef,
} from "@/components/Prediction/";

// Constants and Utilities
import { Colors, Sizes } from "@/constants";
import { getFontSize } from "@/utils/text/fonts";
import { wp, hp } from "@/utils/ui/sizes";
import { getPredictionByDate } from "@/utils/firebase/prediction";
import HistoryModal from "@/components/Outlook/PredictionHistory";
import { MaterialIcons } from "@expo/vector-icons";
import {
  canShowPrompt,
  clearDismissalTime,
} from "@/utils/storage/predictionPrompt";

const today = new Date();
const todayJustDate = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate()
);

const Home = () => {
  const router = useRouter();
  const user = useUser();
  const { user: userAuth } = useAuth();
  const [historyVisible, setHistoryVisible] = useState(false);
  const [canShowSheet, setCanShowSheet] = useState(false);
  const predictions = usePredictions().data;
  const segments = useSegments();
  const {
    hasYesterdayEntry,
    yesterdayDate,
    yesterdaysEntry,
    isLoading: isLoadingYesterday,
  } = useYesterdayEntry();
  const bottomSheetRef = useRef<HomePredictionBottomSheetRef>(null);

  const todaysPrediction = getPredictionByDate(predictions, todayJustDate);
  const hasTodaysPrediction = !!todaysPrediction;

  // Check if we can show the prompt
  useEffect(() => {
    const checkPromptEligibility = async () => {
      const eligible = await canShowPrompt();
      setCanShowSheet(eligible);
    };
    checkPromptEligibility();
  }, []);

  useEffect(() => {
    // Show bottom sheet if no today's prediction AND no yesterday's entry AND cooldown has passed
    if (
      !isLoadingYesterday &&
      !hasTodaysPrediction &&
      hasYesterdayEntry &&
      segments.includes("(home-stack)") &&
      canShowSheet
    ) {
      // Add a small delay for better UX
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

  // Memoize the child components
  const MemoizedOutlook = Outlook;
  const MemoizedGeneratePrediction = HomeGeneratePrediction;
  const MemoizedNoPrediction = HomeNoPredictionToday;

  // Then use useMemo for the JSX
  const outlookContent = useMemo(() => {
    if (hasTodaysPrediction) {
      return <MemoizedOutlook prediction={todaysPrediction} />;
    } else if (hasYesterdayEntry) {
      return (
        <MemoizedGeneratePrediction
          openPredictionModal={() => bottomSheetRef.current?.present()}
        />
      );
    } else {
      return <MemoizedNoPrediction />;
    }
  }, [
    hasTodaysPrediction,
    hasYesterdayEntry,
    todaysPrediction,
    MemoizedGeneratePrediction,
    MemoizedOutlook,
    MemoizedNoPrediction,
  ]);

  return (
    <View style={styles.container}>
      <Divider title="Daily Tip" />
      <DailyTips />
      <Divider
        title="Outlook"
        rightIcon={
          <MaterialIcons name="history" size={20} color={Colors.primary} />
        }
        onPressRight={() => setHistoryVisible(true)}
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

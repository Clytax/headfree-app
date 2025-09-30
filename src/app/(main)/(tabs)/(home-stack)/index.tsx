// React and React Native Imports
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { StyleSheet, View } from "react-native";

// Third-Party Libraries
import { useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

// Custom Components
import Outlook from "@/components/Outlook/Outlook";
import Text from "@/components/common/Text";
import DailyTips from "@/components/DailyTip/DailyTips";
import Divider from "@/components/common/Divider/Divider";
import HomePredictionBottomSheet, {
  HomePredictionBottomSheetRef,
} from "@/components/Prediction/";
import HomeGeneratePrediction from "@/components/Outlook/HomeGeneratePrediction";
import HomeNoPredictionToday from "@/components/Outlook/HomeNoPredictionToday";
// Constants and Utilities
import { Colors, Sizes } from "@/constants";
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";
import { useUser } from "@/hooks/firebase/useUser";
import { usePredictions } from "@/hooks/firebase/usePredictions";
import { useYesterdayEntry } from "@/hooks/firebase/useDailyEntry";
import { getPredictionByDate } from "@/utils/firebase/prediction";
import { useAuth } from "@/context/auth/AuthContext";

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
  const predictions = usePredictions().data;
  const {
    hasYesterdayEntry,
    yesterdayDate,
    isLoading: isLoadingYesterday,
  } = useYesterdayEntry();
  const bottomSheetRef = useRef<HomePredictionBottomSheetRef>(null);

  const todaysPrediction = getPredictionByDate(predictions, todayJustDate);
  const hasTodaysPrediction = !!todaysPrediction;

  useEffect(() => {
    // Show bottom sheet if no today's prediction AND no yesterday's entry
    if (!isLoadingYesterday && !hasTodaysPrediction && hasYesterdayEntry) {
      console.log("open");
      // Add a small delay for better UX
      const timer = setTimeout(() => {
        bottomSheetRef.current?.present(); // Changed from open() to present()
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [hasTodaysPrediction, hasYesterdayEntry, isLoadingYesterday]);

  // Memoize the child components
  const MemoizedOutlook = React.memo(Outlook);
  const MemoizedGeneratePrediction = React.memo(HomeGeneratePrediction);
  const MemoizedNoPrediction = React.memo(HomeNoPredictionToday);

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
  }, [hasTodaysPrediction, hasYesterdayEntry, todaysPrediction]);
  return (
    <View style={styles.container}>
      <Divider title="Daily Tip" />
      <DailyTips />
      <Divider title="Outlook" />
      {outlookContent}
      <HomePredictionBottomSheet
        ref={bottomSheetRef}
        yesterdayDate={yesterdayDate}
        onClose={() => bottomSheetRef.current?.dismiss()} // Changed from close() to dismiss()
        userId={userAuth?.uid || ""}
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

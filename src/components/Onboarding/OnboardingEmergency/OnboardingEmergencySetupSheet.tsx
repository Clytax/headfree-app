// components/Home/HomePredictionBottomSheet.tsx
import React, {
  useCallback,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { StyleSheet, View } from "react-native";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";
import { Colors, Sizes } from "@/constants";
import { getFontSize } from "@/utils/text/fonts";
import { wp, hp } from "@/utils/ui/sizes";
import { Calendar, TrendingUp } from "lucide-react-native";

interface HomePredictionBottomSheetProps {
  yesterdayDate: string;
  onClose?: () => void;
}

export interface HomePredictionBottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

const HomePredictionBottomSheet = forwardRef<
  HomePredictionBottomSheetRef,
  HomePredictionBottomSheetProps
>(({ yesterdayDate, onClose }, ref) => {
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["45%"], []);

  const present = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const dismiss = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  useImperativeHandle(ref, () => ({ present, dismiss }), [present, dismiss]);

  const handleFillEntry = useCallback(() => {
    dismiss();
    // Navigate to daily entry screen
    router.push("/(main)/(tabs)/(entry-stack)");
  }, [dismiss, router]);

  const handleDismiss = useCallback(() => {
    dismiss();
  }, [dismiss]);

  const handleSheetClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const bgStyle = useMemo(
    () => ({
      backgroundColor: Colors.white,
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

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={handleSheetClose}
      enableDismissOnClose
      backgroundStyle={bgStyle}
      handleIndicatorStyle={indicatorStyle}
    >
      <BottomSheetView style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <Calendar size={48} color={Colors.primary} />
        </View>

        <Text
          fontWeight="bold"
          fontSize={getFontSize(22)}
          textCenter
          style={styles.title}
        >
          Missing Yesterday's Entry
        </Text>

        <Text
          fontSize={getFontSize(15)}
          color={Colors.neutral600}
          textCenter
          style={styles.description}
        >
          We need your entry from {formatDate(yesterdayDate)} to generate
          today's health prediction and insights.
        </Text>

        <View style={styles.benefitsContainer}>
          <View style={styles.benefitRow}>
            <TrendingUp size={20} color={Colors.success700} />
            <Text fontSize={getFontSize(14)} color={Colors.neutral700}>
              Get personalized health predictions
            </Text>
          </View>
          <View style={styles.benefitRow}>
            <TrendingUp size={20} color={Colors.success700} />
            <Text fontSize={getFontSize(14)} color={Colors.neutral700}>
              Track your health patterns
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <MyTouchableOpacity
            onPress={handleFillEntry}
            style={styles.primaryButton}
          >
            <Text
              fontWeight="bold"
              fontSize={getFontSize(16)}
              color={Colors.white}
            >
              Fill Yesterday's Entry
            </Text>
          </MyTouchableOpacity>

          <MyTouchableOpacity
            onPress={handleDismiss}
            style={styles.secondaryButton}
          >
            <Text
              fontWeight="medium"
              fontSize={getFontSize(15)}
              color={Colors.neutral600}
            >
              Maybe Later
            </Text>
          </MyTouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

HomePredictionBottomSheet.displayName = "HomePredictionBottomSheet";

export default HomePredictionBottomSheet;

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: Sizes.containerPaddingHorizontal * 2,
    paddingTop: hp(2),
  },
  iconContainer: {
    alignSelf: "center",
    marginBottom: hp(2),
  },
  title: {
    marginBottom: hp(1.5),
  },
  description: {
    marginBottom: hp(3),
    lineHeight: getFontSize(15) * 1.5,
  },
  benefitsContainer: {
    gap: hp(1.5),
    marginBottom: hp(3),
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
  },
  buttonContainer: {
    gap: hp(1.5),
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: hp(1.8),
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButton: {
    paddingVertical: hp(1.5),
    alignItems: "center",
  },
});

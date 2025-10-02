import React from "react";
import { StyleSheet, View } from "react-native";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Calendar, TrendingUp } from "lucide-react-native";
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";
import { Colors, Sizes } from "@/constants";
import { getFontSize } from "@/utils/text/fonts";
import { wp, hp } from "@/utils/ui/sizes";

interface InitialStateProps {
  error: string | null;
  onGenerate: () => void;
  onLater: () => void;
}

const InitialState: React.FC<InitialStateProps> = ({
  error,
  onGenerate,
  onLater,
}) => {
  return (
    <BottomSheetScrollView
      style={styles.contentContainer}
      contentContainerStyle={{ paddingBottom: hp(4) }}
    >
      <View style={styles.iconContainer}>
        <Calendar size={48} color={Colors.primary} />
      </View>

      <Text
        fontWeight="bold"
        fontSize={getFontSize(22)}
        textCenter
        style={styles.title}
      >
        {"Today's Migraine Forecast"}
      </Text>

      <Text
        fontSize={getFontSize(15)}
        color={Colors.text}
        textCenter
        style={styles.description}
      >
        Your personalized migraine risk estimation is ready based on your recent
        entries.
      </Text>

      <View style={styles.benefitsContainer}>
        <View style={styles.benefitRow}>
          <TrendingUp size={20} color={Colors.success700} />
          <Text fontSize={getFontSize(14)} color={Colors.neutral300}>
            Get personalized risk estimation
          </Text>
        </View>
        <View style={styles.benefitRow}>
          <TrendingUp size={20} color={Colors.success700} />
          <Text fontSize={getFontSize(14)} color={Colors.neutral300}>
            Track your health patterns
          </Text>
        </View>
      </View>

      {error && (
        <Text
          fontSize={getFontSize(14)}
          color={Colors.error}
          textCenter
          style={styles.errorText}
        >
          {error}
        </Text>
      )}

      <View style={styles.buttonContainer}>
        <MyTouchableOpacity onPress={onGenerate} style={styles.primaryButton}>
          <Text
            fontWeight="bold"
            fontSize={getFontSize(16)}
            color={Colors.white}
          >
            Generate Forecast
          </Text>
        </MyTouchableOpacity>
        <MyTouchableOpacity onPress={onLater} style={styles.secondaryButton}>
          <Text
            fontWeight="medium"
            fontSize={getFontSize(15)}
            color={Colors.neutral600}
          >
            Maybe Later
          </Text>
        </MyTouchableOpacity>
      </View>
    </BottomSheetScrollView>
  );
};

export default InitialState;

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: Sizes.containerPaddingHorizontal * 2,
    paddingVertical: hp(2),
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
  errorText: {
    marginBottom: hp(2),
  },
});

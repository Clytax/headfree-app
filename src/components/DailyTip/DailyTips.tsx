import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";

// Packages
import { useRouter } from "expo-router";

// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";

// Constants
import { Colors, Sizes } from "@/constants";

// Assets
import {
  GlassWaterIcon,
  AirVent,
  ChevronRight,
  ChevronLeft,
} from "lucide-react-native";
// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";
import DailyTip from "@/components/DailyTip/DailyTip";

// Types

const ALL_TIPS = [
  {
    description:
      "Dehydration is a common migraine trigger, so do not forget to drink today.",
    icon: <GlassWaterIcon color={Colors.primary400} size={hp(3)} />,
  },
  {
    description:
      "Daily Breathing exercises can help reduce stress and prevent migraines.",
    icon: <AirVent color={Colors.primary400} size={hp(3)} />,
  },
];
const DailyTips = () => {
  const router = useRouter();
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const currentTip = ALL_TIPS[currentTipIndex];

  const onPreviousTip = () => {
    setCurrentTipIndex((prevIndex) =>
      prevIndex === 0 ? ALL_TIPS.length - 1 : prevIndex - 1
    );
  };

  const onNextTip = () => {
    setCurrentTipIndex((prevIndex) =>
      prevIndex === ALL_TIPS.length - 1 ? 0 : prevIndex + 1
    );
  };
  return (
    <View style={styles.container}>
      <MyTouchableOpacity
        onPress={onPreviousTip}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Previous tip"
        accessibilityHint="Go to the previous daily tip"
        hitSlop={8}
      >
        <ChevronLeft color={Colors.neutral300} size={hp(3)} />
      </MyTouchableOpacity>

      <DailyTip
        description={currentTip.description}
        icon={currentTip.icon}
        index={currentTipIndex}
        totalTips={ALL_TIPS.length}
        setIndex={setCurrentTipIndex}
      />

      <MyTouchableOpacity
        onPress={onNextTip}
        testID="next-daily-tip-button"
        accessible
        accessibilityRole="button"
        accessibilityLabel="Next tip"
        accessibilityHint="Go to the next daily tip"
        accessibilityIdentifier="next-daily-tip-button"
        hitSlop={8}
      >
        <ChevronRight color={Colors.neutral300} size={hp(3)} />
      </MyTouchableOpacity>
    </View>
  );
};

export default DailyTips;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: hp(1),
    alignItems: "center",
    gap: wp(2),
  },
});

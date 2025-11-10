import React, { useMemo, useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  FadeIn,
  FadeOut,
  FadeInDown,
  FadeOutUp,
  LinearTransition,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

import { Colors, Sizes } from "@/constants";
import { wp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";
import { OptionChoice } from "@/components/Onboarding/OnboardingProfile/Fields/OptionChoice";

const ANIM_MS = 220;

interface DailyEntryChoiceProps {
  title: string;
  description?: string;
  onChange: (value: any) => void;
  choices: { value: any; label: string }[];
  value: any;
  allowNull?: boolean;
  isLoading?: boolean;
  expanded?: boolean;
  onToggleExpand?: (shouldExpand: boolean) => void;
}

const DailyEntryChoice = ({
  title,
  description,
  onChange,
  choices,
  value,
  allowNull,
  isLoading = false,
  expanded: controlledExpanded,
  onToggleExpand,
}: DailyEntryChoiceProps) => {
  const router = useRouter();
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [collapsedHeight, setCollapsedHeight] = useState<number | null>(null);
  const [expandedHeight, setExpandedHeight] = useState<number | null>(null);

  const expanded =
    controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const progress = useSharedValue(0);
  const animatedHeight = useSharedValue<number | undefined>(undefined);

  useEffect(() => {
    progress.value = withTiming(expanded ? 1 : 0, { duration: ANIM_MS });

    if (collapsedHeight !== null && expandedHeight !== null) {
      animatedHeight.value = withTiming(
        expanded ? expandedHeight : collapsedHeight,
        { duration: ANIM_MS }
      );
    }
  }, [expanded, progress, collapsedHeight, expandedHeight]);

  const valueLabel = useMemo(() => {
    if (value == null) return "Select";
    const found = choices?.find((c) => c?.value === value);
    return found?.label ?? String(value);
  }, [choices, value]);

  const animatedBorder = useAnimatedStyle(() => {
    const border = interpolateColor(
      progress.value,
      [0, 1],
      [value ? Colors.primary900 : Colors.border, Colors.primary900]
    );
    return { borderColor: border };
  });

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      height: animatedHeight.value,
    };
  });

  const onCollapsedLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    if (collapsedHeight !== height) {
      setCollapsedHeight(height);
    }
  };

  const onExpandedLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    if (expandedHeight !== height) {
      setExpandedHeight(height);
    }
  };

  const toggleExpand = () => {
    if (isLoading) return;
    const newExpanded = !expanded;

    if (onToggleExpand) {
      onToggleExpand(newExpanded);
    } else {
      setInternalExpanded(newExpanded);
    }
  };

  return (
    <MyTouchableOpacity
      onPress={toggleExpand}
      activeOpacity={0.9}
      accessible
      accessibilityRole="button"
      accessibilityLabel="Toggle details"
      accessibilityHint="Expands or collapses the details section"
      accessibilityState={{
        expanded: !!expanded,
        disabled: !!isLoading,
        busy: !!isLoading,
      }}
      disabled={isLoading}
      hitSlop={8}
    >
      <Animated.View
        style={[
          styles.container,
          animatedBorder,
          animatedContainerStyle,
          isLoading && styles.disabled,
        ]}
      >
        <View style={styles.absoluteContainer}>
          <View
            style={[styles.contentContainer, { opacity: expanded ? 0 : 1 }]}
            onLayout={onCollapsedLayout}
            pointerEvents={expanded || isLoading ? "none" : "auto"}
          >
            <View style={styles.collapsedRow}>
              <View style={styles.flex1}>
                <Text fontSize={getFontSize(18)} fontWeight="bold">
                  {title}
                </Text>
              </View>

              <View>
                <Text
                  fontSize={getFontSize(16)}
                  style={styles.valueText}
                  numberOfLines={1}
                >
                  {valueLabel}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[styles.contentContainer, { opacity: expanded ? 1 : 0 }]}
            onLayout={onExpandedLayout}
            pointerEvents={expanded && !isLoading ? "auto" : "none"}
          >
            <Text fontSize={getFontSize(20)} textCenter fontWeight="bold">
              {title}
            </Text>

            {!!description && (
              <Text
                fontSize={getFontSize(14)}
                textCenter
                style={{ marginVertical: Sizes.marginVerticalSmall }}
              >
                {description}
              </Text>
            )}

            <OptionChoice
              onChange={onChange}
              option={{ choices }}
              value={value}
              allowNull={allowNull}
              disabled={isLoading}
            />
          </View>
        </View>
      </Animated.View>
    </MyTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: Sizes.mediumRadius,
    borderColor: Colors.border,
    borderWidth: 1,
    backgroundColor: Colors.backgroundLighter,
    overflow: "hidden",
  },
  absoluteContainer: {
    position: "relative",
  },
  contentContainer: {
    paddingVertical: Sizes.paddingVerticalMedium,
    paddingHorizontal: Sizes.paddingHorizontalMedium,
    position: "absolute",
    width: "100%",
    top: 0,
  },
  collapsedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
  },
  flex1: {
    flex: 1,
  },
  valueText: {
    textAlign: "right",
    paddingRight: wp(1),
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default DailyEntryChoice;

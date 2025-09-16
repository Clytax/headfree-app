import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
// Packages
import { useRouter } from "expo-router";
import Animated, {
  ZoomIn,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
// Constants
import { Colors, Sizes } from "@/constants";
// Hooks
// Assets
import { CircleCheck } from "lucide-react-native";
// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";
// Types
import { DailyEntryDataSourceProps } from "@/components/DailyEntry/DailyEntry.types";
// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";
import SimpleButton from "@/components/common/Buttons/SimpleButton";

const ANIM_MS = 220;

const DailyEntryDataSource = ({
  onConnect,
  description,
  title,
  icon: Icon,
  usages,
  isConnected = false,
  isLoading = false, // Already included in props, adding default value
}: DailyEntryDataSourceProps) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [collapsedHeight, setCollapsedHeight] = useState<number | null>(null);
  const [expandedHeight, setExpandedHeight] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const progress = useSharedValue(0);
  const animatedHeight = useSharedValue<number | undefined>(undefined);

  useEffect(() => {
    progress.value = withTiming(expanded ? 1 : 0, { duration: ANIM_MS });

    // Animate height when we have both measurements
    if (collapsedHeight !== null && expandedHeight !== null) {
      animatedHeight.value = withTiming(
        expanded ? expandedHeight : collapsedHeight,
        { duration: ANIM_MS }
      );
    }
  }, [expanded, progress, collapsedHeight, expandedHeight]);

  const valueLabel =
    isConnected && usages.length > 0 ? usages[0] : "Not connected";

  const animatedBorder = useAnimatedStyle(() => {
    const border = interpolateColor(
      progress.value,
      [0, 1],
      [isConnected ? Colors.primary900 : Colors.border, Colors.primary900]
    );
    return { borderColor: border };
  });

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      height: animatedHeight.value,
    };
  });
  const containerPadding = Sizes.containerPaddingHorizontal;

  const animatedTitleStyle = useAnimatedStyle(() => {
    // Calculate the distance from left-aligned to center
    // When collapsed: title should align with left side of content
    // When expanded: title should be centered
    const leftPosition = 0; // Starting position (left-aligned)
    const centerPosition = containerWidth > 0 ? containerWidth / 3 : 0;
    const translateX = progress.value * centerPosition;

    return {
      transform: [{ translateX }],
    };
  });

  const onCollapsedLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    if (collapsedHeight !== height) {
      setCollapsedHeight(height);
    }
  };

  const onContainerLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    if (containerWidth !== width) {
      setContainerWidth(width);
    }
  };

  const onExpandedLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    if (expandedHeight !== height) {
      setExpandedHeight(height);
    }
  };

  const toggleExpand = () => {
    if (isLoading) return; // Prevent toggling when loading
    setExpanded((prev) => !prev);
  };

  return (
    <MyTouchableOpacity
      onPress={toggleExpand}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      disabled={isLoading} // Disable touchable when loading
    >
      <Animated.View
        style={[
          styles.container,
          animatedBorder,
          animatedContainerStyle,
          isLoading && styles.disabled, // Add visual feedback for disabled state
        ]}
        onLayout={onContainerLayout}
      >
        <View style={styles.absoluteContainer}>
          {/* Single title that moves between positions */}
          <Animated.View style={[styles.titleContainer, animatedTitleStyle]}>
            <View style={styles.titleRow}>
              <Text fontWeight="bold" fontSize={getFontSize(16)}>
                {title}
              </Text>
              {Icon ? <Icon color={Colors.error200} /> : null}
            </View>
          </Animated.View>

          {/* Collapsed content for measurement */}
          <View
            style={[styles.contentContainer, { opacity: expanded ? 0 : 1 }]}
            onLayout={onCollapsedLayout}
            pointerEvents={expanded || isLoading ? "none" : "auto"} // Disable interactions when loading
          >
            <View style={styles.collapsedRow}>
              <View style={styles.flex1}>
                {/* Invisible title for layout measurement */}
                <View style={[styles.titleRow, { opacity: 0 }]}>
                  <Text fontWeight="bold" fontSize={getFontSize(16)}>
                    {title}
                  </Text>
                  {Icon ? <Icon color={Colors.error200} /> : null}
                </View>
              </View>

              <View style={styles.valueContainer}>
                <Text
                  fontSize={getFontSize(14)}
                  style={[styles.valueText, { opacity: expanded ? 0 : 1 }]}
                  numberOfLines={1}
                >
                  {valueLabel}
                </Text>
              </View>
            </View>
          </View>

          {/* Expanded content for measurement */}
          <View
            style={[styles.contentContainer, { opacity: expanded ? 1 : 0 }]}
            onLayout={onExpandedLayout}
            pointerEvents={expanded && !isLoading ? "auto" : "none"} // Disable interactions when loading
          >
            {/* Invisible title for layout measurement */}
            <View style={[styles.titleRowCentered, { opacity: 0 }]}>
              <Text fontWeight="bold" fontSize={getFontSize(18)}>
                {title}
              </Text>
              {Icon ? <Icon color={Colors.error200} /> : null}
            </View>

            <Text
              fontSize={getFontSize(12)}
              color={Colors.neutral200}
              style={styles.description}
            >
              {description}
            </Text>

            <View style={styles.divider} />

            <View style={styles.center}>
              <Text fontWeight="bold">We use:</Text>
              {usages.map((usage) => (
                <View
                  key={usage}
                  style={{ flexDirection: "row", marginTop: hp(0.5) }}
                >
                  <Text fontSize={getFontSize(14)}>• </Text>
                  <Text fontSize={getFontSize(14)}>{usage}</Text>
                </View>
              ))}
            </View>

            <SimpleButton
              title={isLoading ? "Loading..." : "Connect"} // Show loading text
              variant="secondary"
              size="sm"
              rightIcon={
                !isLoading && (
                  <Animated.View
                    entering={ZoomIn.delay(100)
                      .springify()
                      .damping(18)
                      .stiffness(200)}
                  >
                    <CircleCheck color={Colors.secondary300} size={hp(2)} />
                  </Animated.View>
                )
              }
              onPress={onConnect}
              disabled={isLoading} // Disable button when loading
              contentStyle={{ marginBottom: Sizes.marginVerticalSmall / 1.5 }}
            />
          </View>
        </View>
      </Animated.View>
    </MyTouchableOpacity>
  );
};

export default DailyEntryDataSource;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral700,
    borderRadius: Sizes.mediumRadius,
    borderWidth: 1,
    overflow: "hidden",
  },
  absoluteContainer: {
    position: "relative",
  },
  contentContainer: {
    paddingHorizontal: Sizes.containerPaddingHorizontal,
    paddingVertical: hp(2),
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
  },
  titleContainer: {
    position: "absolute",
    top: hp(2),
    left: Sizes.containerPaddingHorizontal,
    zIndex: 10,
  },
  titleRowCentered: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp(2),
    marginBottom: hp(1),
  },
  valueContainer: {
    maxWidth: "50%",
  },
  valueText: {
    textAlign: "right",
    opacity: 0.9,
    color: Colors.neutral200,
  },
  description: {
    textAlign: "center",
    marginBottom: hp(1),
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral600,
    marginVertical: Sizes.marginVerticalMedium,
  },
  center: {
    flexDirection: "column",
    marginBottom: hp(1.5),
  },
  disabled: {
    opacity: 0.6, // Visual feedback for disabled state
  },
});

// components/common/ExpandableCard.tsx
import React, { useState, ReactNode, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  AccessibilityRole,
  Pressable,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  LinearTransition,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import Text from "@/components/common/Text";
import Colors from "@/constants/colors";
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

type Props = {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
  subtitle?: string;
  containerStyle?: any;
  expandable?: boolean; // new
};

export default function ExpandableCard({
  title,
  icon,
  children,
  defaultExpanded = true,
  subtitle,
  containerStyle,
  expandable = true,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const rot = useSharedValue(defaultExpanded ? 180 : 0);

  useEffect(() => {
    // Ensure the card is closed initially if not defaultExpanded
    if (!defaultExpanded) {
      setExpanded(false);
      rot.value = 0;
    }
  }, [defaultExpanded]);

  const chevronAnim = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value}deg` }],
  }));

  const onToggle = () => {
    if (!expandable) return;
    setExpanded((s) => !s);
    rot.value = withTiming(expanded ? 0 : 180, { duration: 180 });
  };

  const alwaysOpen = !expandable;

  return (
    <Animated.View
      layout={LinearTransition.duration(220)}
      style={[
        {
          backgroundColor: Colors.backgroundLighter,
          padding: wp(4),
          borderRadius: wp(3),
          marginBottom: hp(2),
          borderWidth: 1,
          borderColor: Colors.border,
        },
        containerStyle,
      ]}
      accessibilityRole={"summary" as AccessibilityRole}
    >
      {/* Header */}
      <Pressable
        onPress={onToggle}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: wp(10),
              height: wp(10),
              borderRadius: wp(5),
              backgroundColor: Colors.background,
              justifyContent: "center",
              alignItems: "center",
              marginRight: wp(3),
            }}
          >
            {icon || <Text fontSize={getFontSize(20)}>ℹ️</Text>}
          </View>
          <Text
            fontSize={getFontSize(16)}
            fontWeight="medium"
            color={Colors.text}
          >
            {title}
          </Text>
        </View>

        {expandable && (
          <TouchableOpacity
            onPress={onToggle}
            accessibilityRole={"button" as AccessibilityRole}
            accessibilityLabel={
              expanded ? "Collapse section" : "Expand section"
            }
          >
            <Animated.View style={chevronAnim}>
              <Text fontSize={getFontSize(16)} color={Colors.gray}>
                ▼
              </Text>
            </Animated.View>
          </TouchableOpacity>
        )}
      </Pressable>

      {!!subtitle && (
        <Text
          fontSize={getFontSize(14)}
          color={Colors.gray}
          style={{ marginTop: hp(1), lineHeight: getFontSize(14) * 1.4 }}
        >
          {subtitle}
        </Text>
      )}

      {/* Content */}
      {alwaysOpen || expanded ? (
        <Animated.View
          entering={expandable ? FadeIn.duration(180) : undefined}
          exiting={expandable ? FadeOut.duration(120) : undefined}
          style={{ marginTop: hp(1.5) }}
        >
          {children}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

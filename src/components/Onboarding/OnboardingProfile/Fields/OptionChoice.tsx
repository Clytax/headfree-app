import React, { useRef, useState, useCallback, useMemo } from "react";
import {
  StyleSheet,
  ScrollView,
  Pressable,
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import Text from "@/components/common/Text";
import { Colors } from "@/constants";
import { hp, wp } from "@/utils/ui/sizes";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

type Props = {
  option: {
    choices: { value: number; label: string }[];
  };
  value: number | null;
  onChange: (v: number | null) => void;
  allowNull?: boolean;
  disabled?: boolean;
};

export const OptionChoice: React.FC<Props> = ({
  option,
  value,
  onChange,
  allowNull,
  disabled,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const [containerW, setContainerW] = useState(0);
  const [contentW, setContentW] = useState(0);
  const [offsetX, setOffsetX] = useState(0);

  const canScroll = contentW > containerW + 1;
  const showLeft = canScroll && offsetX > 2;
  const showRight = canScroll && offsetX < contentW - containerW - 2;

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerW(e.nativeEvent.layout.width);
  }, []);

  // onContentSizeChange gives width and height
  const onContentSizeChange = useCallback((w: number) => {
    setContentW(w);
  }, []);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setOffsetX(e.nativeEvent.contentOffset.x);
  }, []);

  // Horizontal inset to center when not scrollable
  const horizontalInset = useMemo(() => {
    if (!containerW || !contentW) return 0;
    const leftover = containerW - contentW;
    return leftover > 0 ? Math.floor(leftover / 2) : 0;
  }, [containerW, contentW]);

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        directionalLockEnabled
        decelerationRate="fast"
        onContentSizeChange={(w) => onContentSizeChange(w)}
        onScroll={onScroll}
        scrollEventThrottle={16}
        scrollEnabled={canScroll} // disable scroll when centered
        contentContainerStyle={[
          styles.scrollRow,
          !canScroll && {
            paddingLeft: horizontalInset,
            paddingRight: horizontalInset,
            justifyContent: "center", // helps if pills wrap sizing oddly
          },
        ]}
      >
        {option.choices.map((c) => {
          const selected = value === c.value;
          return (
            <ChoicePill
              key={c.value}
              label={c.label}
              selected={selected}
              onPress={() => onChange(selected && allowNull ? null : c.value)}
            />
          );
        })}
      </ScrollView>

      {/* Left fade */}
      <FadeEdge visible={showLeft} position="left">
        <ChevronLeft size={16} color={Colors.neutral300} />
      </FadeEdge>

      {/* Right fade */}
      <FadeEdge visible={showRight} position="right">
        <ChevronRight size={16} color={Colors.neutral300} />
      </FadeEdge>
    </View>
  );
};

const ChoicePill = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: withTiming(
      selected ? Colors.primary600 : Colors.neutral700,
      { duration: 200 }
    ),
    borderColor: withTiming(selected ? Colors.primary500 : Colors.neutral600, {
      duration: 200,
    }),
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 12, stiffness: 250 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 250 });
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      hitSlop={6}
      android_disableSound
      pressRetentionOffset={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Animated.View style={[styles.pill, animatedStyle]}>
        <Text
          fontWeight="bold"
          color={selected ? Colors.textDark : Colors.textLight}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const FadeEdge = ({
  visible,
  position,
  children,
}: {
  visible: boolean;
  position: "left" | "right";
  children?: React.ReactNode;
}) => {
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 180 });
  }, [visible]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const isLeft = position === "left";
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.fadeBase,
        isLeft ? styles.fadeLeft : styles.fadeRight,
        style,
      ]}
    >
      <LinearGradient
        start={{ x: isLeft ? 1 : 0, y: 0 }}
        end={{ x: isLeft ? 0 : 1, y: 0 }}
        colors={[
          Colors.neutral800 + "00",
          Colors.neutral800 + "CC",
          Colors.neutral800,
        ]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.chevronSlot}>{children}</View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    position: "relative",
  },
  scrollRow: {
    paddingVertical: hp(0.5),
    paddingHorizontal: 2,
    gap: 8,
    alignItems: "center",
    flexGrow: 1,
  },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  fadeBase: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 28,
    justifyContent: "center",
  },
  fadeLeft: { left: 0 },
  fadeRight: { right: 0, alignItems: "flex-end" },
  chevronSlot: {
    width: 28,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});

// COnstants
import { Colors } from "@/constants";

// Utils
import { wp } from "@/utils/ui/sizes";

// Packages
import React from "react";
import { View, ViewStyle } from "react-native";
import Animated, {
  SharedValue,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from "react-native-reanimated";

const DOT_CONTAINER = wp(6);
const DOT_SIZE = DOT_CONTAINER / 3;
const ACTIVE = Colors.neutral100;
const INACTIVE = Colors.neutral300;
const SPRING = { damping: 18, stiffness: 200 };

type Props = {
  count: number;
  index: number;
  style?: ViewStyle;
};

function Indicator({ animation }: { animation: SharedValue<number> }) {
  const stylez = useAnimatedStyle(() => {
    return { width: DOT_CONTAINER * (animation.value + 1) };
  });
  return (
    <Animated.View
      style={[
        {
          width: DOT_CONTAINER,
          height: DOT_CONTAINER,
          borderRadius: DOT_CONTAINER,
          backgroundColor: Colors.primaryDark,
          position: "absolute",
          left: 0,
          top: 0,
        },
        stylez,
      ]}
    />
  );
}

function Dot({ i, animation }: { i: number; animation: SharedValue<number> }) {
  const stylez = useAnimatedStyle(() => {
    const activeIndex = Math.round(animation.value);
    const isActive = activeIndex === i;

    // Relative position of the moving cursor to this dot
    const t = animation.value - i;

    // Smoothly transition from INACTIVE to ACTIVE as the cursor passes this dot
    const bg = interpolateColor(t, [-0.5, 0.5], [INACTIVE, ACTIVE]);

    return {
      backgroundColor: bg,
      transform: [{ scale: withSpring(isActive ? 1.3 : 1) }],
    };
  });

  return (
    <View
      style={{
        width: DOT_CONTAINER,
        aspectRatio: 1,
        borderRadius: DOT_CONTAINER,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Animated.View
        style={[
          {
            backgroundColor: INACTIVE,
            width: DOT_SIZE,
            aspectRatio: 1,
            borderRadius: DOT_SIZE,
          },
          stylez,
        ]}
      />
    </View>
  );
}

export function Pagination({ count, index, style }: Props) {
  const animation = useDerivedValue(() => withSpring(index, SPRING), [index]);
  return (
    <View style={[{ flexDirection: "row" }, style]}>
      <Indicator animation={animation} />
      {Array.from({ length: count }).map((_, i) => (
        <Dot key={`dot-${i}`} i={i} animation={animation} />
      ))}
    </View>
  );
}

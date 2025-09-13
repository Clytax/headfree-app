import { Sizes } from "@/constants";
import React, { PropsWithChildren } from "react";
import { Pressable, PressableProps, ViewStyle } from "react-native";
import Animated, {
  AnimatedProps,
  FadeInLeft,
  FadeOutLeft,
  LinearTransition,
} from "react-native-reanimated";

const BUTTON_HEIGHT = 42;
const SPACING = 10;
const LAYOUT = LinearTransition.springify().damping(18).stiffness(200);

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonProps = AnimatedProps<
  PressableProps & {
    style?: ViewStyle;
  }
>;

export function AnimatedButton({
  children,
  style,
  disabled,
  ...rest
}: PropsWithChildren<ButtonProps>) {
  return (
    <AnimatedPressable
      disabled={disabled}
      style={[
        {
          height: BUTTON_HEIGHT,
          paddingHorizontal: SPACING * 2,
          justifyContent: "center",
          borderRadius: Sizes.buttonRadius,
          alignItems: "center",
        },
        style,
      ]}
      entering={FadeInLeft.springify().damping(18).stiffness(200)}
      exiting={FadeOutLeft.springify().damping(18).stiffness(200)}
      layout={LAYOUT}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}

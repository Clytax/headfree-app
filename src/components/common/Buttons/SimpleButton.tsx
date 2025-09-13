import React, { forwardRef, ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
} from "react-native";
import { getFontSize } from "@/utils/text/fonts";
import Text from "@/components/common/Text";
import { Colors, Sizes } from "@/constants";
import { wp, hp } from "@/utils/ui/sizes";

// Types
import {
  SimpleButtonProps,
  SimpleButtonSize,
  SimpleButtonVariant,
} from "@/components/common/Buttons/Buttons.types";

const HEIGHTS: Record<SimpleButtonSize, number> = {
  sm: Number(hp(4)),
  md: Number(hp(5.5)),
  lg: Number(hp(6)),
};

const FONT_SIZES: Record<SimpleButtonSize, number> = {
  sm: getFontSize(11),
  md: getFontSize(20),
  lg: getFontSize(15),
};

function getVariantStyles(variant: SimpleButtonVariant) {
  switch (variant) {
    case "secondary":
      return {
        container: {
          backgroundColor: Colors.white,
          borderWidth: 1,
          borderColor: Colors.secondary,
        } as ViewStyle,
        text: { color: Colors.secondary } as TextStyle,
        spinnerColor: Colors.secondary,
      };
    case "primary":
    default:
      return {
        container: {
          backgroundColor: Colors.primary400,
          borderWidth: 0,
        } as ViewStyle,
        text: { color: Colors.textDark } as TextStyle,
        spinnerColor: Colors.white,
      };
  }
}

const SimpleButton = forwardRef<
  React.ComponentRef<typeof Pressable>,
  SimpleButtonProps
>(
  (
    {
      title,
      onPress,
      variant = "primary",
      size = "md",
      fullWidth = false,
      rounded = Sizes.buttonRadius,

      loading = false,
      disabled: disabledProp = false,

      leftIcon,
      rightIcon,
      showPremiumBadge = false,

      textStyle,
      contentStyle,
      testID,
    },
    ref
  ) => {
    const isDisabled = disabledProp || loading;
    const height = HEIGHTS[size];
    const fontSize = FONT_SIZES[size];
    const vs = getVariantStyles(variant);

    return (
      <Pressable
        ref={ref}
        testID={testID}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        disabled={isDisabled}
        onPress={!isDisabled ? onPress : undefined}
        style={({ pressed }) => [
          styles.buttonBase,
          {
            height,
            borderRadius: rounded,
            width: fullWidth ? "100%" : undefined,
            opacity: isDisabled || pressed ? 0.6 : 1,
          },
          vs.container,
          contentStyle,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={vs.spinnerColor} />
        ) : (
          <View style={styles.center}>
            {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
            <Text
              fontSize={fontSize}
              color={vs.text.color as string}
              fontWeight="bold"
              style={textStyle}
            >
              {title}
            </Text>
            {showPremiumBadge && <Text style={{ marginLeft: wp(1) }}>💎</Text>}
            {rightIcon ? <View style={styles.icon}>{rightIcon}</View> : null}
          </View>
        )}
      </Pressable>
    );
  }
);

SimpleButton.displayName = "SimpleButton";

export default SimpleButton;

const styles = StyleSheet.create({
  buttonBase: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(6),
  },
  center: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp(2),
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
  },
});

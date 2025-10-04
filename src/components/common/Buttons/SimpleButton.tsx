import React, { forwardRef, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
  Platform,
  AccessibilityState,
  GestureResponderEvent,
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
  sm: getFontSize(14),
  md: getFontSize(20),
  lg: getFontSize(15),
};

function getVariantStyles(variant: SimpleButtonVariant) {
  switch (variant) {
    case "secondary":
      return {
        container: {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: Colors.secondary200,
        } as ViewStyle,
        text: { color: Colors.secondary200 } as TextStyle,
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

/**
 * Ensure at least 44x44 touch target by expanding hitSlop.
 * height is visual height in px.
 * Returns symmetric hitSlop insets.
 */
function getAutoHitSlop(height: number) {
  const minTarget = 44;
  const vPad = Math.max(0, Math.ceil((minTarget - height) / 2));
  const hPad = 8; // add a small default horizontal cushion
  return { top: vPad, bottom: vPad, left: hPad, right: hPad };
}

const SimpleButton = forwardRef<
  React.ComponentRef<typeof Pressable>,
  SimpleButtonProps & {
    accessibilityLabel?: string;
    accessibilityHint?: string;
  }
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
      ...rest
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);

    const isDisabled = disabledProp || loading;
    const height = HEIGHTS[size];
    const fontSize = FONT_SIZES[size];
    const vs = getVariantStyles(variant);

    // Build an informative label automatically.
    const autoLabel = useMemo(() => {
      if (loading) return `${title}. Loading.`;
      if (isDisabled) return `${title}. Disabled.`;
      return title;
    }, [title, loading, isDisabled]);

    // Only add a hint when it adds value. Screen readers already say double tap to activate on mobile.
    const autoHint = useMemo(() => {
      if (loading) return "Please wait.";
      return undefined;
    }, [loading]);

    const a11yState: AccessibilityState = {
      disabled: isDisabled,
      busy: loading,
    };

    // Expand touch target if needed.
    const hitSlop = useMemo(() => getAutoHitSlop(height), [height]);

    const handlePress = (e: GestureResponderEvent) => {
      if (!isDisabled && onPress) onPress();
    };

    return (
      <Pressable
        ref={ref}
        testID={testID}
        // accessibility
        accessible
        accessibilityRole="button"
        accessibilityLabel={autoLabel}
        accessibilityHint={autoHint}
        accessibilityState={a11yState}
        accessibilityLiveRegion={loading ? "polite" : "none"}
        focusable
        // interaction
        disabled={isDisabled}
        onPress={handlePress}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        hitSlop={hitSlop}
        style={({ pressed }) => [
          styles.buttonBase,
          {
            height,
            borderRadius: rounded,
            width: fullWidth ? "100%" : undefined,
            opacity: isDisabled || pressed ? 0.6 : 1,
            // Simple visible focus ring for keyboards and TVs
            ...(focused
              ? Platform.select({
                  web: {
                    outlineStyle: "solid",
                    outlineWidth: 2,
                    outlineColor: Colors.secondary200,
                  } as any,
                  default: { borderWidth: 2, borderColor: Colors.secondary200 },
                })
              : null),
          },
          vs.container,
          contentStyle,
        ]}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator size="small" color={vs.spinnerColor} />
        ) : (
          // Hide inner layout from screen readers so only the Pressable is announced.
          <View
            style={styles.center}
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            pointerEvents="none"
          >
            {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
            <Text
              fontSize={fontSize}
              color={vs.text.color as string}
              fontWeight="bold"
              style={textStyle}
            >
              {title}
            </Text>
            {showPremiumBadge ? (
              <Text isDecorative style={{ marginLeft: wp(1) }}>
                💎
              </Text>
            ) : null}
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

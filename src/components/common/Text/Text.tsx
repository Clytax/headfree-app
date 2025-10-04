import { forwardRef } from "react";
import { AccessibilityRole, Text as ReactText } from "react-native";
// Types
import { TextProps } from "@/components/common/Text/Text.types";

// Constants
import Colors from "@/constants/colors";

// Packages

// Utils
import { getFontSize } from "@/utils/text/fonts";

// Utils
import { capitalizeFirstLetter } from "@/utils/text/capitalize";

const Text = forwardRef(
  (
    {
      fontFamily = "Inter",
      children,
      style,
      fontWeight = "regular",
      fontSize = getFontSize(16),
      numberOfLines,
      ellipsis = false,
      multiline = false,
      onPress,
      uppercase = false,
      color = Colors.text,
      onLayout,
      textCenter = false,

      // accessibility extras with sensible defaults
      accessibilityLabel,
      accessibilityHint,
      accessibilityRole,
      accessibilityState,
      isDecorative = false,
      announcePolite = false,
      allowFontScaling = true,
      maxFontSizeMultiplier = 2.0,
      adjustsFontSizeToFit = false,
      minimumFontScale = 0.85,
      selectable,

      ...rest
    }: TextProps,
    ref: any
  ) => {
    const finalFontFamily = `${
      (fontFamily === "Inter" ? "Inter" : fontFamily) +
      "_" +
      capitalizeFirstLetter(fontWeight.toLowerCase())
    }`;

    const computedRole: AccessibilityRole | undefined =
      accessibilityRole ?? (onPress ? "button" : "text");

    return (
      <ReactText
        ref={ref}
        style={[
          {
            fontFamily: finalFontFamily,
            fontSize,
            color,
            textTransform: uppercase ? "uppercase" : "none",
            textAlign: textCenter ? "center" : "auto",
          },
          style,
        ]}
        numberOfLines={numberOfLines}
        ellipsizeMode={ellipsis ? "tail" : "clip"}
        onPress={onPress}
        onLayout={onLayout}
        // accessibility
        accessibilityRole={computedRole}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={accessibilityState}
        // hide from screen readers when decorative
        accessibilityElementsHidden={isDecorative}
        importantForAccessibility={isDecorative ? "no" : "auto"}
        // dynamic type and scaling
        allowFontScaling={allowFontScaling}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        adjustsFontSizeToFit={adjustsFontSizeToFit}
        minimumFontScale={minimumFontScale}
        // platform a11y announcements
        accessibilityLiveRegion={announcePolite ? "polite" : "none"}
        // misc
        selectable={selectable}
        {...rest}
      >
        {children}
      </ReactText>
    );
  }
);

Text.displayName = "Text";

export default Text;

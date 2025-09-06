import { forwardRef } from "react";
import { Text as ReactText } from "react-native";
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
      containerStyle,
      fontSize = getFontSize(16),
      hasContainer = false,
      numberOfLines,
      ellipsis = false,
      multiline = false,
      onPress,
      onContainerPress,
      uppercase = false,
      color = Colors.Text,
      onLayout,
      textCenter = false,
    }: TextProps,
    ref: any
  ) => {
    const finalFontFamily = `${
      (fontFamily === "Inter" ? "Inter" : fontFamily) +
      "_" +
      capitalizeFirstLetter(fontWeight.toLowerCase())
    }`;
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
      >
        {children}
      </ReactText>
    );
  }
);

Text.displayName = "Text";

export default Text;

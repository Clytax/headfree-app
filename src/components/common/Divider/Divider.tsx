// components/common/Divider/Divider.tsx
import React from "react";
import { StyleSheet, View } from "react-native";

// Constants
import { Colors, Sizes } from "@/constants";

// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

// Types
import { DividerProps } from "@/components/common/Divider/Divider.types";

// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";

type Props = DividerProps & {
  /**
   * Right-side icon. Pass any React node (SVG, Icon component, <Text> etc.)
   */
  rightIcon?: React.ReactNode;
  /**
   * Handler when right icon is pressed
   */
  onPressRight?: () => void;
  /**
   * Accessibility label for the right button
   */
  rightAccessibilityLabel?: string;
};

const Divider = ({
  title,
  rightIcon,
  onPressRight,
  rightAccessibilityLabel,
}: Props) => {
  return (
    <View style={styles.container}>
      <Text fontSize={getFontSize(13)} color={Colors.gray} f>
        {title}
      </Text>

      <View style={styles.bar} />

      {rightIcon ? (
        <MyTouchableOpacity
          onPress={onPressRight}
          accessibilityLabel={rightAccessibilityLabel ?? `${title} actions`}
          style={styles.rightButton}
        >
          <View style={styles.iconWrapper}>{rightIcon}</View>
        </MyTouchableOpacity>
      ) : null}
    </View>
  );
};

export default Divider;

const styles = StyleSheet.create({
  container: {
    marginVertical: hp(1),
    flexDirection: "row",
    alignItems: "center",
    // keep small spacing between title / bar / icon
    paddingRight: wp(1),
  },
  bar: {
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: Colors.neutral500,
    flex: 1,
    marginLeft: wp(3),
  },
  rightButton: {
    padding: wp(2),
    borderRadius: 8,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});

import React, { useMemo } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import {
  useSafeAreaInsets,
  type EdgeInsets,
} from "react-native-safe-area-context";

// Constants
import { Colors } from "@/constants";
import { SafeAreaContainerProps } from "@/components/common/Container/Container.types";

// Types

type Edge = "top" | "bottom" | "left" | "right";

const SafeAreaContainer = React.memo(
  React.forwardRef<View, SafeAreaContainerProps>(function SafeAreaContainer(
    {
      children,
      style,
      edges = ["top", "bottom"],
      extraTop = 0,
      extraBottom = 0,
      insetsOverride,
      useSafeArea = true,
      backgroundColor = Colors.Background,
      testID,
    },
    ref
  ) {
    const systemInsets = useSafeAreaInsets();

    const insets = useMemo<EdgeInsets>(
      () => ({
        top: useSafeArea ? insetsOverride?.top ?? systemInsets.top : 0,
        bottom: useSafeArea ? insetsOverride?.bottom ?? systemInsets.bottom : 0,
        left: useSafeArea ? insetsOverride?.left ?? systemInsets.left : 0,
        right: useSafeArea ? insetsOverride?.right ?? systemInsets.right : 0,
      }),
      [useSafeArea, insetsOverride, systemInsets]
    );

    const paddingStyle: ViewStyle = useMemo(
      () => ({
        paddingTop: (edges.includes("top") ? insets.top : 0) + extraTop,
        paddingBottom:
          (edges.includes("bottom") ? insets.bottom : 0) + extraBottom,
        paddingLeft: edges.includes("left") ? insets.left : 0,
        paddingRight: edges.includes("right") ? insets.right : 0,
      }),
      [edges, insets, extraTop, extraBottom]
    );

    const containerStyle = useMemo(
      () => [styles.container, { backgroundColor }, paddingStyle, style],
      [backgroundColor, paddingStyle, style]
    );

    return (
      <View ref={ref} style={containerStyle} testID={testID}>
        {children}
      </View>
    );
  })
);

SafeAreaContainer.displayName = "SafeAreaContainer";

export default SafeAreaContainer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

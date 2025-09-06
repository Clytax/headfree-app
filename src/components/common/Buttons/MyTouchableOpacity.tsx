import React, { forwardRef } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

// Packages
import { useRouter } from "expo-router";

// Redux

// Types
import { MyTouchableOpacityProps } from "./Buttons.types";

const MyTouchableOpacity = forwardRef<View, MyTouchableOpacityProps>(
  (
    { children, style, activeOpacity = 0.8, disabled, onLayout, ...props },
    ref
  ) => {
    const router = useRouter();

    const isDisabled = disabled;

    return (
      <TouchableOpacity
        ref={ref as React.Ref<View>}
        activeOpacity={activeOpacity}
        onLayout={onLayout}
        style={[
          style,
          {
            opacity: isDisabled ? 0.5 : 1,
          },
        ]}
        disabled={isDisabled}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }
);

MyTouchableOpacity.displayName = "MyTouchableOpacity";

export default MyTouchableOpacity;

const styles = StyleSheet.create({});

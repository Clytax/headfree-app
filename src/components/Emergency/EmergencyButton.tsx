import React, { useRef } from "react";
import { Pressable, StyleSheet, Animated, Easing } from "react-native";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants";
import Text from "@/components/common/Text";
import { getFontSize } from "@/utils/text/fonts";
import { EmergencyButtonProps } from "@/components/Emergency/Emergency.types";
import { useEmergencyContext } from "@/context/emergency/EmergencyContext";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

const HOLD_MS = 800;
const SIZE = 96;

const EmergencyButton = ({ style }: EmergencyButtonProps) => {
  const { isEnabled, setEnabled } = useEmergencyContext();
  const router = useRouter();
  const progress = useRef(new Animated.Value(0)).current;
  const armedRef = useRef(false);
  const completedRef = useRef(false); // track if hold completed
  const onToggleEmergency = () => {
    if (armedRef.current) return;
    armedRef.current = true;
    completedRef.current = true;

    // trigger state flip on next frame
    requestAnimationFrame(() => {
      setEnabled(!isEnabled);
      if (!isEnabled) {
        router.push("/emergency-mode");
      }
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const startHold = () => {
    armedRef.current = false;
    completedRef.current = false;
    progress.stopAnimation();
    progress.setValue(0.01);
    Animated.timing(progress, {
      toValue: 1,
      duration: HOLD_MS,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onToggleEmergency();
    });
  };

  const cancelHold = () => {
    // Only reset animation if the hold did NOT complete
    if (completedRef.current) return;
    Animated.timing(progress, {
      toValue: 0.01,
      duration: 120,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      armedRef.current = false;
    });
  };

  const innerScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.01, 1],
  });

  const baseColor = isEnabled ? Colors.primary400 : Colors.error300;
  const icon = isEnabled ? "X" : "!";
  const fillColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: isEnabled
      ? [Colors.error300, Colors.primary300]
      : [Colors.primary300, Colors.error300],
  });
  return (
    <Pressable
      accessibilityLabel="Hold to toggle Emergency Mode"
      onPressIn={startHold}
      onPressOut={cancelHold}
      onPress={() => {
        if (isEnabled) {
          // open emergency mode screen
          router.push("/emergency-mode");
        } else {
          Toast.show({
            type: "info",
            text1: "Hold the button to activate Emergency Mode",
            position: "top",
            visibilityTime: 2000,
          });
        }
      }}
      style={[styles.button, { backgroundColor: baseColor }, style]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.fill,
          {
            backgroundColor: fillColor,
            transform: [{ scale: innerScale }],
          },
        ]}
      />
      <Text
        color={Colors.neutral700}
        fontWeight="bold"
        fontSize={getFontSize(50)}
      >
        {icon}
      </Text>
    </Pressable>
  );
};

export default EmergencyButton;

const styles = StyleSheet.create({
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  fill: {
    position: "absolute",
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
  },
});

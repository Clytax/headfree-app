import React, { useEffect, useRef, useState, useCallback } from "react";
import { StyleSheet, View, Platform, TouchableOpacity } from "react-native";
import Slider from "@react-native-community/slider";
import * as Brightness from "expo-brightness";

// UI
import Text from "@/components/common/Text";
import { Colors } from "@/constants";

// State
import { useOnboardingStore } from "@/store/onboarding/useOnboardingStore";

type OnboardingEmergencyBrightnessProps = {
  restoreBrightness?: () => void;
};
const OnboardingEmergencyBrightness = ({
  restoreBrightness,
}: OnboardingEmergencyBrightnessProps) => {
  const saved = useOnboardingStore((s) => s.data.emergencySetup.brightness);
  const updateEmergencySetup = useOnboardingStore(
    (s) => s.updateEmergencySetup
  );

  const [value, setValue] = useState<number>(
    typeof saved === "number" ? saved : 0.8
  );
  const [disabled, setDisabled] = useState<boolean>(saved === null);
  const initialSystemRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const sys = await Brightness.getSystemBrightnessAsync();
        if (!mounted) return;
        initialSystemRef.current = sys;

        if (typeof saved === "number") {
          setValue(saved);
          await Brightness.setBrightnessAsync(saved);
        } else if (saved === null) {
          setDisabled(true);
        } else {
          setValue(sys);
          await Brightness.setBrightnessAsync(sys);
        }
      } catch {
        // ignore
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const apply = useCallback(async (v: number) => {
    try {
      if (Platform.OS === "ios") {
        await Brightness.setSystemBrightnessAsync(v);
      }
      await Brightness.setBrightnessAsync(v);
    } catch {
      // ignore
    }
  }, []);

  const onSlide = useCallback(
    (v: number) => {
      setValue(v);
      updateEmergencySetup({ brightness: v });
      apply(v);
    },
    [apply, updateEmergencySetup]
  );

  const toggleDisabled = useCallback(() => {
    if (disabled) {
      // re-enable and restore last value
      setDisabled(false);
      updateEmergencySetup({ brightness: value });
      apply(value);
    } else {
      // disable brightness control
      setDisabled(true);
      updateEmergencySetup({ brightness: null });
      if (restoreBrightness) {
        restoreBrightness();
      } else {
        // Restore to initial system brightness if available
        const sys = initialSystemRef.current;
        if (typeof sys === "number") {
          apply(sys);
        }
      }
    }
  }, [disabled, value, updateEmergencySetup, apply]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text>Brightness</Text>

        <Text
          fontSize={16}
          fontWeight="bold"
          color={Colors.textDark}
          style={styles.value}
        >
          {disabled ? "Off" : `${Math.round(value * 100)}%`}
        </Text>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        step={0.01}
        value={value}
        onValueChange={!disabled ? onSlide : undefined}
        minimumTrackTintColor={
          disabled ? Colors.secondary300 : Colors.primary500
        }
        maximumTrackTintColor={Colors.secondary300}
        thumbTintColor={disabled ? Colors.secondary300 : Colors.primary700}
        disabled={disabled}
      />

      <TouchableOpacity
        style={[styles.toggleButton, disabled ? styles.off : styles.on]}
        onPress={toggleDisabled}
      >
        <Text color="#fff">
          {disabled ? "Enable Brightness" : "Disable Brightness"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OnboardingEmergencyBrightness;

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 12 },
  value: { marginBottom: 8 },
  slider: { width: "100%", height: 40 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  toggleButton: {
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  on: { backgroundColor: Colors.primary700 },
  off: { backgroundColor: Colors.secondary500 },
});

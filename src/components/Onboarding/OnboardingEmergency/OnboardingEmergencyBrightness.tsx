import React, { useEffect, useRef, useState, useCallback } from "react";
import { StyleSheet, View, Platform } from "react-native";
import Slider from "@react-native-community/slider";
import * as Brightness from "expo-brightness";

// UI
import Text from "@/components/common/Text";
import { Colors } from "@/constants";

// State
import { useOnboardingStore } from "@/store/onboarding/useOnboardingStore";

const OnboardingEmergencyBrightness = () => {
  const saved = useOnboardingStore((s) => s.data.emergencySetup.brightness);
  const updateEmergencySetup = useOnboardingStore(
    (s) => s.updateEmergencySetup
  );

  const [value, setValue] = useState<number>(
    typeof saved === "number" ? saved : 0.8
  );
  const initialSystemRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const sys = await Brightness.getSystemBrightnessAsync();
        if (!mounted) return;
        initialSystemRef.current = sys;

        if (typeof saved !== "number") {
          setValue(sys);
        }

        await Brightness.setBrightnessAsync(
          typeof saved === "number" ? saved : sys
        );
      } catch {
        // ignore
      }
    };

    init();

    // parent sheet is responsible for restore now
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
          {Math.round(value * 100)}%
        </Text>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        step={0.01}
        value={value}
        onValueChange={onSlide}
        minimumTrackTintColor={Colors.primary500}
        maximumTrackTintColor={Colors.secondary300}
        thumbTintColor={Colors.primary700}
      />
    </View>
  );
};

export default OnboardingEmergencyBrightness;

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 12 },
  title: { marginBottom: 6 },
  helper: { marginBottom: 12 },
  value: { marginBottom: 8 },
  slider: { width: "100%", height: 40 },
  row: { flexDirection: "row", justifyContent: "space-between" },
});

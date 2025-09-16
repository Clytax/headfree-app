// fields/OptionScale.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import Text from "@/components/common/Text";
import { Colors } from "@/constants";

type Props = {
  option: {
    title: string;
    min: number;
    max: number;
    step?: number;
    leftLabel?: string;
    rightLabel?: string;
    showStepLabels?: boolean;
  };
  value: number;
  onChange: (v: number) => void;
};

export const OptionScale: React.FC<Props> = ({ option, value, onChange }) => {
  const steps = option.max - option.min;

  return (
    <View style={styles.container}>
      {/* Side labels */}
      {option.leftLabel || option.rightLabel ? (
        <View style={styles.labels}>
          <Text>{option.leftLabel ?? ""}</Text>
          <Text>{option.rightLabel ?? ""}</Text>
        </View>
      ) : null}

      {/* Slider */}
      <Slider
        style={styles.slider}
        minimumValue={option.min}
        maximumValue={option.max}
        step={option.step ?? 1}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={Colors.primary500}
        maximumTrackTintColor={Colors.secondary300}
        thumbTintColor={Colors.primary700}
      />

      {/* Tick marks */}
      <View style={styles.tickRow}>
        {Array.from({ length: steps + 1 }).map((_, i) => (
          <View key={i} style={styles.tick} />
        ))}
      </View>

      {/* Optional step labels under ticks */}
      {option.showStepLabels && (
        <View style={styles.tickLabelRow}>
          {Array.from({ length: steps + 1 }).map((_, i) => (
            <Text
              key={i}
              style={styles.tickLabel}
              fontSize={12}
              color={Colors.textLight}
            >
              {option.min + i}
            </Text>
          ))}
        </View>
      )}

      {/* Current value */}
      <Text style={styles.valueText}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    width: "80%",
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  tickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 6,
  },
  tick: {
    width: 2,
    height: 8,
    backgroundColor: Colors.neutral500,
    borderRadius: 1,
  },
  tickLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
    marginHorizontal: 2,
  },
  tickLabel: {
    textAlign: "center",
    minWidth: 12,
  },
  valueText: {
    textAlign: "center",
    marginTop: 8,
    fontWeight: "bold",
  },
});

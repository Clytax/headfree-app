// fields/OptionNumber.tsx
import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import Text from "@/components/common/Text";
import { Colors } from "@/constants";

type Props = {
  option: { title: string; min?: number; max?: number; unit?: string };
  value: number;
  onChange: (v: number) => void;
};

export const OptionNumber: React.FC<Props> = ({ option, value, onChange }) => {
  return (
    <View>
      <Text style={{ marginBottom: 8 }}>
        {option.title} {option.unit ? `(${option.unit})` : ""}
      </Text>
      <TextInput
        keyboardType="numeric"
        style={styles.input}
        value={String(value ?? "")}
        onChangeText={(t) => {
          const n = Number(t.replace(",", "."));
          if (Number.isNaN(n)) onChange(0);
          else {
            let clamped = n;
            if (typeof option.min === "number")
              clamped = Math.max(option.min, clamped);
            if (typeof option.max === "number")
              clamped = Math.min(option.max, clamped);
            onChange(clamped);
          }
        }}
        placeholder="0"
        placeholderTextColor={Colors.neutral500}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral600,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.textLight,
  },
});

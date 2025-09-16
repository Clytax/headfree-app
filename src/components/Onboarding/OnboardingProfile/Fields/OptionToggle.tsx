// fields/OptionToggle.tsx
import React from "react";
import { View, Switch } from "react-native";
import Text from "@/components/common/Text";
import { Colors } from "@/constants";

import { Checkbox } from "expo-checkbox";

// Fields/OptionToggle.tsx
// add prop allowNull so tapping an already true or false value clears to null if optional
type Props = {
  option: { title: string };
  value: boolean | null;
  onChange: (v: boolean | null) => void;
  allowNull?: boolean;
};

export const OptionToggle: React.FC<Props> = ({
  option,
  value,
  onChange,
  allowNull,
}) => {
  const isOn = !!value;
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Text>{option.title}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        {/* {allowNull ? (
          <Text
            onPress={() => onChange(null)}
            style={{ textDecorationLine: "underline" }}
          >
            Clear
          </Text>
        ) : null} */}
        {/* Your Switch component here */}
        <Checkbox
          value={isOn}
          onValueChange={() => {
            if (value === null) onChange(true);
            else if (value === true) onChange(allowNull ? null : false);
            else onChange(true);
          }}
          color={isOn ? Colors.primary : undefined}
        />
      </View>
    </View>
  );
};

import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";

// Packages
import { useRouter } from "expo-router";

// Constants
import { Colors, Sizes } from "@/constants";

// Hooks

// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

// Types
import { SettingsDividerProps } from "@/components/Settings/Settings.types";

// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";

// Hooks

const SettingsDivider = ({ style }: SettingsDividerProps) => {
  const router = useRouter();
  return <View style={styles.container}></View>;
};

export default SettingsDivider;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Background,
  },
});

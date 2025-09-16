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
import { DividerProps } from "@/components/common/Divider/Divider.types";

// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";

// Hooks

const Divider = ({ title }: DividerProps) => {
  const router = useRouter();
  return (
    <View style={[styles.divider]}>
      <Text fontSize={getFontSize(13)} color={Colors.gray} f>
        {title}
      </Text>
      <View style={styles.dividerBar} />
    </View>
  );
};

export default Divider;

const styles = StyleSheet.create({
  divider: {
    marginVertical: hp(1),
    flexDirection: "row",
    alignItems: "center",
    gap: wp(4),
  },
  dividerBar: {
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: Colors.neutral500,
    flex: 1,
  },
});

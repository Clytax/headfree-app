import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";

// Packages
import { useRouter } from "expo-router";

// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";

// Constants
import { Colors, Sizes } from "@/constants";

// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";
import SafeAreaContainer from "@/components/common/Container/SafeAreaContainer";

// Types

const Trend = () => {
  const router = useRouter();
  return (
    <SafeAreaContainer style={styles.container}>
      <Text textCenter>Coming Soon...</Text>
    </SafeAreaContainer>
  );
};

export default Trend;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

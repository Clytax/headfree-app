import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";

// Packages
import { useRouter } from "expo-router";

// Components
import Outlook from "@/components/Outlook/Outlook";
import Text from "@/components/common/Text";
import DailyTips from "@/components/DailyTip/DailyTips";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";
import Divider from "@/components/common/Divider/Divider";
// Constants
import { Colors, Sizes } from "@/constants";

// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

// Types

const Home = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      {/* DailyTip */}

      <Divider title="Daily Tip" />
      <DailyTips />
      {/* Outlook */}
      <Divider title="Outlook" />
      <Outlook />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Sizes.containerPaddingHorizontal,
    paddingVertical: hp(1),
  },
});

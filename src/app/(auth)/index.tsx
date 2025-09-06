import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";

// Packages
import { useRouter } from "expo-router";

// Components
import Text from "@/components/common/Text";
import SafeAreaContainer from "@/components/common/Container/SafeAreaContainer";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";
// Constants
import { Colors, Sizes } from "@/constants";

// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";
// Types

const SignIn = () => {
  const router = useRouter();
  return (
    <SafeAreaContainer style={styles.container}>
      <View style={styles.top}>
        <Text fontWeight="bold" fontSize={getFontSize(32)}>
          Welcome to
        </Text>
        <Text
          fontWeight="bold"
          fontSize={getFontSize(46)}
          color={Colors.primary200}
        >
          HEADFREE
        </Text>
        <Text fontSize={getFontSize(18)} style={{ paddingTop: hp(1) }}>
          Your smart migraine tracker
        </Text>
      </View>
    </SafeAreaContainer>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  top: {
    marginVertical: hp(10),
    alignItems: "center",
  },
});

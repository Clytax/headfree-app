import React, { useState, useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";

// Packages
import { useRouter } from "expo-router";
import { signOut, getAuth } from "@react-native-firebase/auth";
// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";

// Constants
import { Colors, Sizes } from "@/constants";

// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

// Types

const Account = () => {
  const router = useRouter();

  const onSignOut = async () => {
    await signOut(getAuth());
  };
  return (
    <View style={styles.container}>
      <Text>hi</Text>
      <Pressable
        onPress={onSignOut}
        style={{
          marginTop: 50,
          backgroundColor: Colors.primary600,
          padding: 10,
          borderRadius: 5,
        }}
      >
        <Text style={{ color: Colors.white, fontSize: getFontSize(16) }}>
          Sign Out
        </Text>
      </Pressable>
    </View>
  );
};

export default Account;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});

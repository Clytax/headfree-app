import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
// Packages
import { useRouter } from "expo-router";
import { getFirestore, doc, setDoc } from "@react-native-firebase/firestore";
// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";
import SettingsBaseline from "@/components/Settings/SettingsBaseline";
import SettingsEmergency from "@/components/Settings/SettingsEmergency";
import SettingsNotifications from "@/components/Settings/SettingsNotifications";

// Constants
import { Colors, Sizes } from "@/constants";

// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

// Hooks
import { useUser } from "@/hooks/firebase/useUser";
import { useAuth } from "@/context/auth/AuthContext";

// Types

const Settings = () => {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <SettingsEmergency />
      <SettingsNotifications />
    </ScrollView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Sizes.containerPaddingHorizontal,
    backgroundColor: Colors.background,
  },
});

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
// Packages
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { getFirestore, doc, setDoc } from "@react-native-firebase/firestore";
// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";
import SettingsBaseline from "@/components/Settings/SettingsBaseline";
import SettingsEmergency from "@/components/Settings/SettingsEmergency";
import SettingsNotifications from "@/components/Settings/SettingsNotifications";
import SettingsOther from "@/components/Settings/SettingsOther";
import { FACTORS } from "@/services/dailyFactors";
import SettingsFactors from "@/components/Settings/SettingsFactors";

// Constants
import { Colors, Sizes } from "@/constants";

// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

// Hooks
import { useUser } from "@/hooks/firebase/useUser";
import { useAuth } from "@/context/auth/AuthContext";

// Types

export type FactorVisibility = Record<string, boolean>;

// Optional = non-required factors (so we don't break validation on required ones)
export const OPTIONAL_FACTORS = FACTORS.filter((f) => !f.required);
const Settings = () => {
  const router = useRouter();
  const { scrollTo } = useLocalSearchParams<{ scrollTo?: string }>();

  const scrollRef = useRef<ScrollView | null>(null);
  const factorsRef = useRef<View | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (scrollTo !== "factors") return;
      if (!scrollRef.current || !factorsRef.current) return;

      const timeout = setTimeout(() => {
        factorsRef.current?.measureLayout(
          // @ts-ignore
          scrollRef.current?.getNativeScrollRef?.() || scrollRef.current,
          (x, y) => {
            scrollRef.current?.scrollTo({
              y: Math.max(0, y - hp(2)),
              animated: true,
            });
          },
          () => {
            // ignore errors
          }
        );
      }, 100);

      return () => clearTimeout(timeout);
    }, [scrollTo])
  );

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={{ paddingBottom: hp(5) }}
    >
      <SettingsEmergency />
      <SettingsNotifications />

      <View
        ref={(ref) => {
          factorsRef.current = ref;
        }}
        collapsable={false}
      >
        <SettingsFactors />
      </View>

      <SettingsOther />
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

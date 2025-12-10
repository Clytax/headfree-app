import React, { useState, useEffect, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

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

// Icons
import { MaterialIcons } from "@expo/vector-icons";

// Hooks
import { useUser } from "@/hooks/firebase/useUser";

// Types
import { WeeklyHintProps } from "@/components/WeeklyHint/WeeklyHint.types";

const WeeklyHint = ({
  setHistoryVisible,
  setHistoryFilter,
}: WeeklyHintProps) => {
  const router = useRouter();
  const user = useUser();

  const weeklyHint = useMemo(() => {
    return user?.data?.weekly_hint || null;
  }, [user]);

  return (
    weeklyHint && (
      <Pressable
        style={styles.hintBanner}
        onPress={() => {
          setHistoryFilter(weeklyHint.filter);
          setHistoryVisible(true); // open History with filter in one step
        }}
        accessibilityRole="button"
        accessibilityLabel="Open history filtered for this pattern"
      >
        <MaterialIcons
          name="tips-and-updates"
          size={18}
          color={Colors.primary}
          style={{ marginRight: wp(2) }}
        />
        <Text style={styles.hintText}>{weeklyHint.text}</Text>
      </Pressable>
    )
  );
};

export default WeeklyHint;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hintBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    borderRadius: 12,
    backgroundColor: Colors.transparent, // or a soft accent
    borderColor: Colors.grayTransparent,
    borderWidth: 1,
    marginTop: hp(1),
    marginBottom: hp(1),
  },
  hintText: {
    flex: 1,
    fontSize: getFontSize(14),
    color: Colors.text,
  },
});

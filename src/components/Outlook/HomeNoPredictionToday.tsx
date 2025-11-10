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
// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";
import SimpleButton from "@/components/common/Buttons/SimpleButton";

const HomeNoPredictionToday = () => {
  const router = useRouter();

  const handleAddEntry = () => {
    router.push({
      pathname: "/(main)/(tabs)/(entry-stack)",
      params: {
        selectedDate: new Date(
          new Date().setDate(new Date().getDate() - 1)
        ).toISOString(),
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Decorative gradient overlay */}
      <View style={styles.gradientOverlay} />

      {/* Content */}
      <View style={styles.content}>
        {/* Icon/Emoji */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📝</Text>
        </View>

        {/* Heading */}
        <Text
          fontSize={getFontSize(24)}
          fontWeight="bold"
          color={Colors.white}
          style={styles.heading}
        >
          {"No Forecast Available"}
        </Text>

        {/* Subtext */}
        <Text
          fontSize={getFontSize(15)}
          color={Colors.neutral300}
          style={styles.subtext}
        >
          {
            "You didn't log any entries yesterday. Add your entries today to get tomorrow's migraine forecast!"
          }
        </Text>

        {/* CTA Button */}
        <SimpleButton
          title="Add Yesterday's Entry"
          onPress={handleAddEntry}
          variant="primary"
          size="lg"
          fullWidth
          contentStyle={styles.buttonContent}
        />

        {/* Small helper text */}
        <Text
          fontSize={getFontSize(12)}
          color={Colors.neutral400}
          style={styles.helperText}
        >
          {"Track daily to unlock forecasts • Just takes a minute"}
        </Text>
      </View>
    </View>
  );
};

export default HomeNoPredictionToday;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundLighter,
    borderRadius: Sizes.smallRadius,
    borderWidth: 1,
    borderColor: Colors.warning500 + "40",
    overflow: "hidden",
    marginVertical: hp(2),
    marginHorizontal: wp(4),
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: hp(15),
    backgroundColor: Colors.warning900 + "20",
    opacity: 0.3,
  },
  content: {
    padding: wp(6),
    alignItems: "center",
  },
  iconContainer: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    backgroundColor: Colors.warning500 + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(2),
    borderWidth: 2,
    borderColor: Colors.warning500 + "40",
  },
  icon: {
    fontSize: getFontSize(32),
  },
  heading: {
    textAlign: "center",
    marginBottom: hp(1),
  },
  subtext: {
    textAlign: "center",
    marginBottom: hp(3),
    lineHeight: getFontSize(20),
  },
  buttonContent: {
    marginBottom: hp(1.5),
  },
  helperText: {
    textAlign: "center",
    fontStyle: "italic",
  },
});

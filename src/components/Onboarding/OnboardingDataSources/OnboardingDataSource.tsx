import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";

// Packages
import { useRouter } from "expo-router";
import Animated, { ZoomIn } from "react-native-reanimated";

// Constants
import { Colors, Sizes } from "@/constants";

// Hooks

// Assets
import { CircleCheck } from "lucide-react-native";

// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

// Types
import { OnboardingDataSourceProps } from "@/components/Onboarding/OnboardingDataSources/OnboardingSources.types";
// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";
import SimpleButton from "@/components/common/Buttons/SimpleButton";

// Hooks

const OnboardingDataSource = ({
  id,
  connectText,
  onConnect,
  subtitle,
  title,
  usages,
  required = false,
  icon: Icon,
  connected = false,
}: OnboardingDataSourceProps) => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={styles.title}>
          <Text fontWeight="bold" fontSize={getFontSize(16)}>
            {title}
          </Text>
          {Icon ? <Icon color={Colors.error200} /> : null}
        </View>
        <Text fontSize={getFontSize(12)} color={Colors.neutral200}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.divider} />

      <View style={styles.center}>
        <Text fontWeight="bold">We use:</Text>
        {usages.map((usage) => (
          <View
            key={usage}
            style={{ flexDirection: "row", marginTop: hp(0.5) }}
          >
            <Text fontSize={getFontSize(14)}>• </Text>
            <Text fontSize={getFontSize(14)}>{usage}</Text>
          </View>
        ))}
      </View>

      <SimpleButton
        title={connectText}
        variant="secondary"
        size="sm"
        rightIcon={
          <Animated.View
            entering={ZoomIn.delay(100).springify().damping(18).stiffness(200)}
          >
            <CircleCheck color={Colors.secondary300} size={hp(2)} />
          </Animated.View>
        }
        onPress={onConnect}
        contentStyle={{ marginBottom: Sizes.marginVerticalSmall / 1.5 }}
      />
      {!required && (
        <Text textCenter fontSize={getFontSize(8)} color={Colors.gray}>
          Optional. You can skip this and connect later in the APP Settings
        </Text>
      )}
    </View>
  );
};

export default OnboardingDataSource;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral700,
    borderRadius: Sizes.mediumRadius,
    borderWidth: 1,
    paddingHorizontal: Sizes.containerPaddingHorizontal,
    paddingVertical: hp(2),
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral600,
    marginVertical: Sizes.marginVerticalMedium,
  },
  top: {
    flexDirection: "column",
    gap: hp(1),
  },
  title: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
  },
  center: {
    flexDirection: "column",
    marginBottom: hp(1.5),
  },
});

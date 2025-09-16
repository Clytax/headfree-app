import React from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  SlideInRight,
  SlideOutLeft,
  Easing,
} from "react-native-reanimated";
import Text from "@/components/common/Text";
import { Colors } from "@/constants";
import { hp, wp } from "@/utils/ui/sizes";

import WelcomeIllustration from "@/assets/illustrations/welcome.svg";
import PromisesIllustration from "@/assets/illustrations/onboarding/promises.svg";
import ConsentIllustration from "@/assets/illustrations/onboarding/consent.svg";
import EmergencyIllustration from "@/assets/illustrations/onboarding/emergency.svg";
import MigraineProfileIllustration from "@/assets/illustrations/onboarding/migraineprofile.svg";
import NotificationsIllustration from "@/assets/illustrations/onboarding/notifications.svg";
import DoneIllustration from "@/assets/illustrations/onboarding/done.svg";

import { useOnboardingStore } from "@/store/onboarding/useOnboardingStore";
import { getFontSize } from "@/utils/text/fonts";

const OnboardingTop = () => {
  const router = useRouter();
  const current = useOnboardingStore((s) => s.currentStep());

  const getTitle = () => {
    switch (current) {
      case "Welcome":
        return "Welcome";
      case "promises":
        return "Core Promises";
      case "policy":
        return "Consent & Privacy";
      case "emergencySetup":
        return "Emergency Mode";
      case "migraineProfile":
        return "Let's setup your Migraine Profile";
      case "migraineDataSources":
        return "Migraine Profile (Data Sources)";
      case "notifications":
        return "Notifications";
      case "done":
        return "All Set!";
      default:
        return "";
    }
  };

  const getIllustration = () => {
    switch (current) {
      case "Welcome":
        return <WelcomeIllustration />;
      case "promises":
        return <PromisesIllustration />;
      case "policy":
        return <ConsentIllustration />;
      case "emergencySetup":
        return <EmergencyIllustration />;
      case "migraineProfile":
        return <MigraineProfileIllustration />;
      case "notifications":
        return <NotificationsIllustration width={wp(70)} height={hp(30)} />;

      case "done":
        return <DoneIllustration width={wp(70)} height={hp(30)} />;
      default:
        return null;
    }
  };

  const title = getTitle();
  const Illustration = getIllustration();

  return (
    <View style={styles.container}>
      <Animated.View
        key={`title-${current}`}
        entering={SlideInRight.springify()
          .damping(22)
          .stiffness(90)
          .mass(1.1)
          .withInitialValues({ opacity: 0 })
          .delay(120)} // slightly longer delay for illustration
        exiting={SlideOutLeft.springify()
          .damping(22)
          .stiffness(90)
          .mass(1.1)
          .delay(120)} // slightly longer delay for illustration
      >
        <Text
          color={Colors.text}
          fontSize={getFontSize(35)}
          fontWeight="bold"
          textCenter
        >
          {title}
        </Text>
      </Animated.View>

      <Animated.View
        key={`illust-${current}`}
        entering={SlideInRight.springify()
          .damping(22)
          .stiffness(90)
          .mass(1.1)
          .withInitialValues({ opacity: 0 })
          .delay(120)} // slightly longer delay for illustration
        exiting={SlideOutLeft.springify()
          .damping(22)
          .stiffness(90)
          .mass(1.1)
          .delay(120)} // slightly longer delay for illustration
      >
        {Illustration}
      </Animated.View>
    </View>
  );
};

export default OnboardingTop;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: hp(1),
    gap: hp(3),
    alignItems: "center",
  },
});

import React from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { SlideInRight, SlideOutLeft } from "react-native-reanimated";
// Components
import Text from "@/components/common/Text";
import OnboardingTop from "@/components/Onboarding/OnboardingTop";

// Constants
import { Colors, Sizes } from "@/constants";
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

// Lucide icons
import { NotebookPen, Brain, Lightbulb, Siren } from "lucide-react-native";
const AnimatedText = Animated.createAnimatedComponent(Text);

const LIST_OF_PROMISES = [
  { label: "Simple daily logging", Icon: NotebookPen },
  { label: "Smart AI Insights", Icon: Brain },
  { label: "Prevention tips", Icon: Lightbulb },
  { label: "Emergency Mode", Icon: Siren },
];

const BASE_DELAY = 120;
const STEP = 90;
const enter = (d: number) =>
  SlideInRight.springify()
    .damping(22)
    .stiffness(90)
    .mass(1.1)
    .withInitialValues({ opacity: 0 })
    .delay(d);
const exit = (d: number) =>
  SlideOutLeft.springify().damping(22).stiffness(90).mass(1.1).delay(d);

const OnboardingPromises = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <OnboardingTop />

      <View style={styles.center}>
        <AnimatedText
          entering={enter(BASE_DELAY)}
          exiting={exit(BASE_DELAY)}
          textCenter
          fontSize={getFontSize(25)}
          fontWeight="semibold"
        >
          Track, understand, and prevent migraines
        </AnimatedText>

        <View style={styles.list}>
          {LIST_OF_PROMISES.map(({ label, Icon }, index) => (
            <Animated.View
              key={index}
              entering={enter(BASE_DELAY + STEP * (index + 1))}
              exiting={exit(BASE_DELAY + STEP * (index + 1))}
              style={styles.item}
            >
              <Icon size={hp(2.8)} color={Colors.white} />
              <Text
                fontWeight="bold"
                textCenter
                fontSize={getFontSize(20)}
                style={styles.itemText}
              >
                {label}
              </Text>
            </Animated.View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default OnboardingPromises;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(5),
  },
  list: {
    gap: hp(1.5),
    paddingTop: hp(2.5),
    alignItems: "center",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
  },
  itemText: {
    color: Colors.white,
    textAlign: "left",
  },
});

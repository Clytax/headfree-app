import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";

// Packages
import { useRouter } from "expo-router";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolate,
  Extrapolation,
  useDerivedValue,
  runOnJS,
} from "react-native-reanimated";
// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";

// Constants
import { Colors } from "@/constants";

// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FaqSection = {
  key: string;
  title: string;
  subtitle?: string;
  explanation: string;
  bullets?: string[];
};

const SCROLL_THRESHOLD = 100;

const FAQ_SECTIONS: FaqSection[] = [
  {
    key: "migraineToday",
    title: "Migraine Today",
    subtitle: "Did you have a migraine today?",
    explanation:
      "This is the core outcome the app tries to forecast. By knowing on which days you do and do not have migraine attacks, the system can relate your recent daily factors and timing to higher or lower risk estimates.",
    bullets: [
      "Used as the main target for forecasting.",
      "Helps the app relate your recent patterns to estimated risk for a given day.",
      "The goal is not to blame you for a migraine day, but to detect patterns early.",
    ],
  },
  {
    key: "stress",
    title: "Stress Level",
    subtitle: "How stressed did you feel today?",
    explanation:
      "Stress is one of the most commonly reported migraine triggers. Research suggests that both high stress and sudden drops in stress from one day to the next can be linked with migraine attacks.",
    bullets: [
      "Many people with migraine report stress as a frequent trigger.",
      "Changes in stress from one day to the next can be important, not only how stressed you feel right now.",
      "By tracking stress, the system can take stressful and post-stress days into account when estimating your risk.",
    ],
  },
  {
    key: "emotion",
    title: "Overall Emotion",
    subtitle: "How was your emotional state today?",
    explanation:
      "Mood and migraine are closely connected. Anxiety, low mood or feeling emotionally drained can lower the threshold for an attack or show up early as pre-migraine symptoms.",
    bullets: [
      "Emotional changes are common around migraine attacks.",
      "Negative mood can go along with stress, poor sleep and pain sensitivity.",
      "Tracking emotion helps the app see whether certain emotional patterns are often present around your attacks.",
    ],
  },
  {
    key: "caffeine",
    title: "Caffeine Consumption",
    subtitle: "How much caffeine did you consume?",
    explanation:
      "Caffeine has a complex relationship with migraine. For some people, too much caffeine or sudden caffeine withdrawal can trigger headaches or migraine. For others, a small stable amount is fine.",
    bullets: [
      "Higher daily caffeine intake has been associated with more frequent severe headaches in some studies.",
      "Sudden changes in your usual caffeine routine can be just as important as the total amount.",
      "By logging caffeine, the app can factor higher intake or abrupt changes into your risk estimation.",
    ],
  },
  {
    key: "meals",
    title: "Meal Count",
    subtitle: "How many meals did you have?",
    explanation:
      "Skipping meals or having long gaps between eating is a classic migraine trigger for many people. Blood sugar changes, dehydration and irregular routines can all increase vulnerability to attacks.",
    bullets: [
      "Regular meals can help stabilise blood sugar and energy levels.",
      "Both barely eating and overeating can matter for some people.",
      "Tracking how often you eat helps the app check whether low meal counts tend to show up around your attacks.",
    ],
  },
  {
    key: "chocolateOrCheese",
    title: "Chocolate or Cheese",
    subtitle: "Did you consume chocolate or cheese?",
    explanation:
      "Chocolate and aged cheeses are often mentioned as possible triggers, likely due to ingredients such as tyramine and other bioactive compounds. The evidence is mixed, but some people clearly notice a pattern.",
    bullets: [
      "Not everyone reacts to these foods, which is why individual tracking matters.",
      "The app does not assume these foods are triggers by default.",
      "Over time, your data can show whether chocolate or cheese appears to coincide with more attacks for you.",
    ],
  },
  {
    key: "overEating",
    title: "Overeating",
    subtitle: "Did you overeat today?",
    explanation:
      "Very large or heavy meals can sometimes worsen headaches or trigger migraine, possibly through changes in blood flow, digestion and blood sugar.",
    bullets: [
      "Both how much and how quickly you eat can play a role.",
      "Overeating late at night may also disturb sleep, which matters for migraine.",
      "By logging overeating, the app can consider big meals as one possible factor when estimating risk.",
    ],
  },
  {
    key: "alcohol",
    title: "Alcohol Consumption",
    subtitle: "Did you consume alcohol today?",
    explanation:
      "Alcohol, especially drinks like red wine or sparkling wines, is a well known trigger for some people with migraine. It can affect blood vessels, sleep quality, hydration and inflammation.",
    bullets: [
      "Even small amounts can be important if you are personally sensitive.",
      "The timing of drinking (for example late evening) may matter as much as the dose.",
      "Logging alcohol lets the system include specific drinking patterns when estimating your next-day risk.",
    ],
  },
  {
    key: "smoking",
    title: "Smoking",
    subtitle: "Did you smoke today?",
    explanation:
      "Smoking is harmful for overall health and has been associated with a higher risk of migraine in several observational studies. Smoke exposure can also worsen headache symptoms in some people.",
    bullets: [
      "Current smoking has been linked with increased migraine risk in population studies.",
      "Cigarette smoke can interact with other triggers like stress and poor sleep.",
      "Tracking smoking allows the app to take days with more cigarettes into account when estimating risk.",
    ],
  },
  {
    key: "traveled",
    title: "Travel",
    subtitle: "Did you travel today?",
    explanation:
      "Travel days often come with changes in routine, sleep, stress, light exposure and sometimes barometric pressure or time zones. Many people notice that travel days or the day after are higher risk for migraine.",
    bullets: [
      "Travel can disrupt sleep and meal timing, which are important migraine factors.",
      "Flying or large weather changes also mean changing air pressure, which can trigger headaches in some people.",
      "By logging travel, the app can reflect that your risk might differ on or after travel days.",
    ],
  },
  {
    key: "lightExposure",
    title: "Problematic Light",
    subtitle: "Were you bothered by light exposure?",
    explanation:
      "Sensitivity to light (photophobia) is a key feature of migraine. Bright, flickering or harsh light can not only worsen an attack but can also trigger one in some people.",
    bullets: [
      "A high proportion of people with migraine report light sensitivity during attacks.",
      "Bright screens, strong sunlight or harsh indoor lighting can be relevant triggers.",
      "Recording problematic light lets the system weigh intense light as one possible factor in your recent days.",
    ],
  },
  {
    key: "sleep",
    title: "Sleep",
    subtitle: "How did you sleep?",
    explanation:
      "Sleep and migraine are strongly linked. Both too little and too much sleep, as well as poor quality or fragmented sleep, can increase the chance of an attack.",
    bullets: [
      "Studies have shown that sleep disturbances can increase vulnerability to migraine attacks.",
      "Insomnia and irregular sleep schedules are common in people with migraine.",
      "By tracking your sleep duration and quality, the app can relate your recent sleep pattern to estimated risk.",
    ],
  },
  {
    key: "location",
    title: "Location & Environment",
    subtitle: "Where were you today?",
    explanation:
      "Your environment matters for migraine. Weather changes, air pressure, temperature, humidity and air pollution have all been linked with headache and migraine in at least some people.",
    bullets: [
      "Changes in barometric pressure and temperature can trigger attacks in weather-sensitive individuals.",
      "Different locations can mean different light, noise, air quality and stress levels.",
      "Location data lets the system combine your symptoms with local environmental signals when producing forecasts.",
    ],
  },
  {
    key: "menstrualCycle",
    title: "Menstrual Cycle",
    subtitle: "Cycle and hormone-related migraine",
    explanation:
      "For people who menstruate, hormonal fluctuations are a major migraine factor. Drops in estrogen around the period are a well known trigger for menstrual migraine.",
    bullets: [
      "Tracking cycle days helps identify predictable hormone-related attack patterns.",
      "The system can reflect that certain phases of your cycle are generally associated with higher or lower risk.",
      "This information can support better planning and earlier warnings around your most vulnerable days.",
    ],
  },
];

const Faq: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const scrollY = useSharedValue(0);
  const [currentSection, setCurrentSection] = React.useState<string>(
    "Migraine Factors FAQ"
  );
  const sectionPositions = React.useRef<{ key: string; y: number }[]>([]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const updateCurrentSection = React.useCallback((scrollPosition: number) => {
    if (scrollPosition < SCROLL_THRESHOLD) {
      setCurrentSection("Migraine Factors FAQ");
      return;
    }

    const positions = sectionPositions.current;
    for (let i = positions.length - 1; i >= 0; i--) {
      if (scrollPosition >= positions[i].y - hp(30)) {
        const section = FAQ_SECTIONS.find((s) => s.key === positions[i].key);
        if (section) {
          setCurrentSection(section.title);
        }
        return;
      }
    }
  }, []);

  useDerivedValue(() => {
    runOnJS(updateCurrentSection)(scrollY.value);
  });

  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );

    return {
      opacity,
    };
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View
        style={[
          styles.stickyHeader,
          headerStyle,
          {
            paddingTop: insets.top + hp(1),
          },
        ]}
      >
        <View style={styles.stickyContent}>
          <MyTouchableOpacity
            style={styles.stickyIconButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.iconText}>←</Text>
          </MyTouchableOpacity>
          <View style={styles.stickyTextWrapper}>
            <Text style={styles.stickyTitle}>{currentSection}</Text>
            <Text style={styles.stickySubtitle}>
              Why the app asks these questions
            </Text>
          </View>
        </View>
      </Animated.View>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Original Header */}
        <View style={styles.headerRow}>
          <MyTouchableOpacity
            style={styles.iconButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.iconText}>←</Text>
          </MyTouchableOpacity>

          <View style={styles.headerTextWrapper}>
            <Text style={styles.headerTitle}>Migraine Factors FAQ</Text>
            <Text style={styles.headerSubtitle}>
              Why the app asks these questions and how they help forecasting.
            </Text>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle} fontWeight="bold">
            Important
          </Text>
          <Text style={styles.disclaimerText}>
            This FAQ is for information and education only. It is not medical
            advice and it does not replace a consultation with a doctor or other
            qualified health professional. Always talk to your healthcare
            provider about diagnosis, treatment and changes to your medication.
          </Text>
          <Text style={styles.disclaimerText}>
            The app uses patterns in your data to estimate migraine risk, but no
            forecast can ever be guaranteed or perfectly accurate.
          </Text>
        </View>

        {/* Factors */}
        {FAQ_SECTIONS.map((section, index) => (
          <View
            key={section.key}
            style={styles.card}
            onLayout={(event) => {
              const layout = event.nativeEvent.layout;
              sectionPositions.current[index] = {
                key: section.key,
                y: layout.y,
              };
            }}
          >
            <Text style={styles.factorTitle}>{section.title}</Text>
            {section.subtitle ? (
              <Text style={styles.factorSubtitle}>{section.subtitle}</Text>
            ) : null}
            <Text style={styles.factorBody}>{section.explanation}</Text>

            {section.bullets && (
              <View style={styles.bulletList}>
                {section.bullets.map((item, bulletIndex) => (
                  <View key={bulletIndex.toString()} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>{"\u2022"}</Text>
                    <Text style={styles.bulletText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        <View style={styles.footerSpace} />
      </Animated.ScrollView>
    </View>
  );
};

export default Faq;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: Colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  stickyContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
  },
  stickyIconButton: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(4.5),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.backgroundLighter,
    marginRight: wp(3),
  },
  stickyTextWrapper: {
    flex: 1,
  },
  stickyTitle: {
    fontSize: getFontSize(16),
    fontWeight: "700",
    color: Colors.white,
  },
  stickySubtitle: {
    fontSize: getFontSize(12),
    color: Colors.gray,
    marginTop: 2,
  },
  contentContainer: {
    paddingHorizontal: wp(5),
    paddingTop: hp(3),
    paddingBottom: hp(4),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: hp(3),
  },
  iconButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.backgroundLighter,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    marginRight: wp(3),
  },
  iconText: {
    fontSize: getFontSize(18),
    color: Colors.white,
  },
  headerTextWrapper: {
    flex: 1,
  },
  headerTitle: {
    fontSize: getFontSize(20),
    fontWeight: "700",
    color: Colors.white,
    marginBottom: hp(0.5),
  },
  headerSubtitle: {
    fontSize: getFontSize(13),
    color: Colors.gray,
  },
  disclaimerCard: {
    backgroundColor: Colors.warning50 + "11",
    borderRadius: 12,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.8),
    marginBottom: hp(2),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.warning400,
  },
  disclaimerTitle: {
    fontSize: getFontSize(14),
    fontWeight: "700",
    color: Colors.warning300,
    marginBottom: hp(0.8),
  },
  disclaimerText: {
    fontSize: getFontSize(13),
    color: Colors.warning200,
    marginBottom: hp(0.6),
  },
  card: {
    backgroundColor: Colors.backgroundLighter,
    borderRadius: 14,
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    marginBottom: hp(1.8),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  factorTitle: {
    fontSize: getFontSize(16),
    fontWeight: "700",
    color: Colors.white,
    marginBottom: hp(0.5),
  },
  factorSubtitle: {
    fontSize: getFontSize(13),
    color: Colors.gray,
    marginBottom: hp(1.2),
  },
  factorBody: {
    fontSize: getFontSize(13),
    color: Colors.text,
    lineHeight: getFontSize(13) * 1.4,
  },
  bulletList: {
    marginTop: hp(1.2),
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: hp(0.4),
  },
  bulletDot: {
    fontSize: getFontSize(12),
    color: Colors.text,
    marginRight: wp(2),
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    fontSize: getFontSize(13),
    color: Colors.text,
  },
  footerSpace: {
    height: hp(2),
  },
});

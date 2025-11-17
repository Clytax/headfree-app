import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Lightbulb, ChevronDown } from "lucide-react-native";

// Constants
import { Colors } from "@/constants";

// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface DiaryEntry {
  stress?: number;
  emotion?: number;
  caffeine?: number;
  meals?: number;
  chocolateOrCheese?: number;
  overEating?: number;
  alcohol?: number;
  smoking?: number;
  traveled?: boolean;
  lightExposure?: number;
  sleep?: {
    hours?: number;
    quality?: number;
  };
}

export interface ActionableRecommendation {
  icon: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

interface PredictionRecommendationProps {
  diaryEntry?: DiaryEntry;
  riskLevel: string | null;
}

export const generateRecommendations = (
  diary: DiaryEntry | undefined,
  riskLevel: string
): ActionableRecommendation[] => {
  if (!diary) return [];

  const recommendations: ActionableRecommendation[] = [];

  // Sleep recommendations
  if (diary.sleep?.hours && diary.sleep.hours < 7) {
    recommendations.push({
      icon: "🌙",
      title: "Prioritize Sleep Tonight",
      description: `You got ${diary.sleep.hours} hours. Aim for 7-9 hours to reduce migraine risk.`,
      priority: "high",
    });
  } else if (diary.sleep?.quality && diary.sleep.quality <= 2) {
    recommendations.push({
      icon: "🌙",
      title: "Improve Sleep Quality",
      description: "Try a dark, cool room and avoid screens 1 hour before bed.",
      priority: "high",
    });
  }

  // Stress management
  if (diary.stress && diary.stress >= 4) {
    recommendations.push({
      icon: "🧘",
      title: "Manage Stress Levels",
      description:
        "Try a 10-minute breathing exercise, meditation, or a short walk.",
      priority: "high",
    });
  }

  // Emotional state
  if (diary.emotion && diary.emotion >= 4) {
    recommendations.push({
      icon: "💭",
      title: "Practice Self-Care",
      description:
        "Consider journaling, talking to someone, or doing an activity you enjoy.",
      priority: "medium",
    });
  }

  // Meal frequency
  if (diary.meals !== undefined && diary.meals <= 2) {
    recommendations.push({
      icon: "🍽️",
      title: "Eat Regular Meals",
      description:
        "Skipping meals can trigger migraines. Set reminders for consistent meal times.",
      priority: "high",
    });
  }

  // Caffeine
  if (diary.caffeine === 2) {
    recommendations.push({
      icon: "☕",
      title: "Reduce Caffeine Intake",
      description:
        "You had 3+ cups. Try limiting to 1-2 cups tomorrow to avoid withdrawal headaches.",
      priority: "medium",
    });
  } else if (diary.caffeine === 0 && riskLevel === "High") {
    recommendations.push({
      icon: "☕",
      title: "Consider Moderate Caffeine",
      description:
        "A small amount of caffeine (1 cup) might help prevent migraines for some people.",
      priority: "low",
    });
  }

  // Alcohol
  if (diary.alcohol && diary.alcohol >= 1) {
    recommendations.push({
      icon: "🚰",
      title: "Stay Hydrated & Avoid Alcohol",
      description:
        "Alcohol can trigger migraines. Drink plenty of water and avoid alcohol tonight.",
      priority: "high",
    });
  }

  // Chocolate or cheese
  if (diary.chocolateOrCheese && diary.chocolateOrCheese >= 1) {
    recommendations.push({
      icon: "🍫",
      title: "Watch Trigger Foods",
      description:
        "Chocolate and aged cheese are common triggers. Consider avoiding them tomorrow.",
      priority: "medium",
    });
  }

  // Overeating
  if (diary.overEating && diary.overEating >= 1) {
    recommendations.push({
      icon: "🍴",
      title: "Moderate Portion Sizes",
      description:
        "Overeating can trigger migraines. Try smaller, more frequent meals.",
      priority: "medium",
    });
  }

  // Smoking
  if (diary.smoking && diary.smoking >= 1) {
    recommendations.push({
      icon: "🚭",
      title: "Reduce Smoking",
      description:
        "Smoking can trigger migraines. Consider reducing or quitting.",
      priority: "high",
    });
  }

  // Travel
  if (diary.traveled) {
    recommendations.push({
      icon: "✈️",
      title: "Rest After Travel",
      description:
        "Travel can be taxing. Prioritize rest and maintain your usual routine.",
      priority: "medium",
    });
  }

  // Light exposure
  if (diary.lightExposure && diary.lightExposure >= 1) {
    recommendations.push({
      icon: "🕶️",
      title: "Manage Light Exposure",
      description:
        "Wear sunglasses outdoors, use blue light filters, and reduce screen brightness.",
      priority: "medium",
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return recommendations
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 4); // Limit to top 4 recommendations
};

const PredictionRecommendation: React.FC<PredictionRecommendationProps> = ({
  diaryEntry,
  riskLevel,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const recommendations = generateRecommendations(diaryEntry, riskLevel);

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isExpanded, rotateAnim]);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  if (recommendations.length === 0) {
    return null;
  }

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View style={styles.recommendationsContainer}>
      <MyTouchableOpacity
        onPress={toggleExpanded}
        style={styles.recommendationsHeaderContainer}
        accessible
        accessibilityRole="button"
        accessibilityLabel={
          isExpanded ? "Collapse recommendations" : "Expand recommendations"
        }
        accessibilityHint={`Tap to ${
          isExpanded ? "hide" : "show"
        } personalized recommendations`}
      >
        <View style={styles.recommendationsHeader}>
          <Lightbulb size={20} color={Colors.primary500} />
          <Text
            fontSize={getFontSize(18)}
            fontWeight="semibold"
            style={styles.recommendationsTitle}
          >
            What You Can Do
          </Text>
        </View>
        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
          <ChevronDown size={24} color={Colors.neutral300} />
        </Animated.View>
      </MyTouchableOpacity>

      {isExpanded && (
        <>
          <Text
            fontSize={getFontSize(13)}
            color={Colors.neutral400}
            style={styles.recommendationsSubtitle}
          >
            Based on yesterday{"'"}s diary entry
          </Text>

          {recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <Text
                  fontSize={getFontSize(24)}
                  style={styles.recommendationIcon}
                >
                  {rec.icon}
                </Text>
                <View style={styles.recommendationContent}>
                  <Text
                    fontSize={getFontSize(15)}
                    fontWeight="semibold"
                    color={Colors.text}
                  >
                    {rec.title}
                  </Text>
                  <Text
                    fontSize={getFontSize(13)}
                    color={Colors.neutral300}
                    style={styles.recommendationDescription}
                  >
                    {rec.description}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </>
      )}
    </View>
  );
};

export default PredictionRecommendation;

const styles = StyleSheet.create({
  recommendationsContainer: {
    marginTop: hp(3),
    marginBottom: hp(3),
    backgroundColor: Colors.neutral400 + "10",
    padding: wp(4),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary500 + "30",
  },
  recommendationsHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  recommendationsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
    flex: 1,
  },
  recommendationsTitle: {
    flex: 1,
  },
  recommendationsSubtitle: {
    marginTop: hp(0.5),
    marginBottom: hp(2),
  },
  recommendationCard: {
    backgroundColor: Colors.neutral800,
    padding: wp(3),
    borderRadius: 8,
    marginBottom: hp(1.5),
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: wp(3),
  },
  recommendationIcon: {
    marginTop: 2,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationDescription: {
    marginTop: hp(0.5),
    lineHeight: getFontSize(13) * 1.4,
  },
});

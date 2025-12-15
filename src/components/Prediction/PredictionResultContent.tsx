// components/Prediction/PredictionResultContent.tsx

// Packages
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

// Third-party
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AlertCircle, CheckCircle, ChevronDown } from "lucide-react-native";

// Components
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";
import PredictionRecommendation, {
  DiaryEntry,
} from "@/components/Prediction/PredictionRecommendation";
import Text from "@/components/common/Text";

// Constants
import { Colors } from "@/constants";

// Types
import { IUserPrediction } from "@/types/user";

// Utils
import { formatFeatureName } from "./utils/predictionUtils";
import { getFontSize } from "@/utils/text/fonts";
import { wp, hp } from "@/utils/ui/sizes";

interface PredictionResultContentProps {
  result: IUserPrediction;
  riskColor: string;
  latencyMs?: number | null;
  onClose: () => void;
  yesterdaysEntry?: DiaryEntry | undefined;
  ScrollComponent?: React.ComponentType<any>;
  isInBottomSheet?: boolean;
}

const PredictionResultContent: React.FC<PredictionResultContentProps> = ({
  result,
  riskColor,
  latencyMs,
  onClose,
  yesterdaysEntry,
  ScrollComponent = BottomSheetScrollView,
  isInBottomSheet = true,
}) => {
  const insets = useSafeAreaInsets();
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const router = useRouter();

  // Add refs to track sizes
  const contentSizeRef = useRef({ width: 0, height: 0 });
  const layoutHeightRef = useRef(0);

  // Function to check if content is scrollable
  const checkIfScrollable = () => {
    const isScrollable =
      contentSizeRef.current.height > layoutHeightRef.current;
    setShowScrollIndicator(isScrollable);
  };

  // Animated bounce effect for the arrow
  useEffect(() => {
    if (showScrollIndicator) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [showScrollIndicator, bounceAnim]);

  // Handle scroll to determine if there's more content below
  const handleScroll = (event: any) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;

    setShowScrollIndicator(
      !isCloseToBottom && contentSize.height > layoutMeasurement.height
    );
  };

  // Check initial content size
  const handleContentSizeChange = (width: number, height: number) => {
    contentSizeRef.current = { width, height };
    checkIfScrollable();
  };

  const handleLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    layoutHeightRef.current = height;
    checkIfScrollable();
  };

  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8],
  });

  return (
    <>
      <ScrollComponent
        style={styles.container}
        contentContainerStyle={{
          paddingBottom: insets.bottom + hp(2),
          paddingTop: hp(2),
        }}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        onLayout={handleLayout}
      >
        <View style={styles.successIconContainer}>
          <CheckCircle size={48} color={Colors.success500} />
          {latencyMs && (
            <Text
              fontSize={getFontSize(12)}
              color={Colors.neutral400}
              textCenter
            >
              Generated in{" "}
              {latencyMs !== undefined && latencyMs < 1000
                ? `${latencyMs} ms`
                : `${(latencyMs! / 1000).toFixed(1)} s`}
            </Text>
          )}
        </View>

        <Text
          fontWeight="bold"
          fontSize={getFontSize(22)}
          textCenter
          style={styles.title}
        >
          Your Migraine Forecast
        </Text>

        <View style={[styles.riskBadge, { backgroundColor: `${riskColor}20` }]}>
          <Text
            fontSize={getFontSize(16)}
            fontWeight="bold"
            style={{ color: riskColor }}
          >
            {result.risk_level} Risk
          </Text>
        </View>

        <View style={styles.probabilityContainer}>
          <Text fontSize={getFontSize(59)} fontWeight="bold" color={riskColor}>
            {Math.round(result.migraine_probability * 100)}%
          </Text>
          <Text
            fontSize={getFontSize(14)}
            color={Colors.neutral400}
            style={styles.probabilityLabel}
          >
            Migraine Probability
          </Text>
        </View>

        <PredictionRecommendation
          diaryEntry={yesterdaysEntry}
          riskLevel={result.risk_level}
        />

        <View style={styles.factorsContainer}>
          <Text
            fontSize={getFontSize(18)}
            fontWeight="semibold"
            style={styles.factorsTitle}
          >
            Model Analysis
          </Text>
          <Text
            fontSize={getFontSize(12)}
            color={Colors.neutral400}
            style={styles.factorsSubtitle}
          >
            Top factors identified by the AI
          </Text>

          {result.top_risk_factors.slice(0, 4).map((factor, index) => (
            <View key={`${factor.feature}-${index}`} style={styles.factorItem}>
              <View style={styles.factorHeader}>
                <Text
                  fontSize={getFontSize(15)}
                  fontWeight="medium"
                  color={Colors.text}
                >
                  {formatFeatureName(factor.feature)}
                </Text>
                <Text
                  fontSize={getFontSize(14)}
                  color={Colors.primary}
                  fontWeight="semibold"
                >
                  {Math.round(factor.importance * 100)}%
                </Text>
              </View>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${factor.importance * 100}%`,
                      backgroundColor: Colors.primary500,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.disclaimerContainer}>
          <View style={styles.disclaimerCard}>
            <View style={styles.disclaimerRow}>
              <AlertCircle size={16} color={Colors.neutral400} />
              <Text
                fontSize={getFontSize(12)}
                color={Colors.neutral400}
                style={styles.disclaimerText}
              >
                This is an estimation based on your data and not medical advice.
                Consult healthcare professionals for medical decisions.
              </Text>
            </View>

            <MyTouchableOpacity
              onPress={() => router.push("/(main)/faq")}
              style={styles.faqButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Navigate to FAQ"
              accessibilityHint="Opens the Frequently Asked Questions page"
              accessibilityIdentifier="faq-button"
            >
              <Text
                fontSize={getFontSize(13)}
                color={Colors.primary}
                style={styles.faqText}
              >
                Questions? Visit our FAQ
              </Text>
            </MyTouchableOpacity>
          </View>
        </View>

        <MyTouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Close"
          accessibilityHint="Close this screen"
          hitSlop={8}
        >
          <Text
            fontWeight="bold"
            fontSize={getFontSize(16)}
            color={Colors.white}
          >
            Close
          </Text>
        </MyTouchableOpacity>
      </ScrollComponent>

      {showScrollIndicator && (
        <Animated.View
          style={[
            styles.scrollIndicator,
            {
              bottom: isInBottomSheet ? hp(12) : insets.bottom + hp(2),
              transform: [{ translateY }],
              opacity: fadeAnim,
            },
          ]}
          pointerEvents="none"
        >
          <View style={styles.scrollIndicatorBackground}>
            <ChevronDown size={34} color={Colors.white} strokeWidth={3} />
          </View>
        </Animated.View>
      )}
    </>
  );
};

export default PredictionResultContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: Colors.background,
    paddingVertical: hp(2),
  },
  successIconContainer: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    gap: hp(1),
    marginBottom: hp(2),
  },
  title: {
    marginBottom: hp(1.5),
  },
  riskBadge: {
    alignSelf: "center",
    paddingHorizontal: wp(6),
    paddingVertical: hp(1),
    borderRadius: 20,
    marginVertical: hp(1),
  },
  probabilityContainer: {
    alignItems: "center",
    marginVertical: hp(1),
    marginBottom: 0,
  },
  probabilityLabel: {
    marginTop: hp(0),
  },
  factorsContainer: {},
  factorsTitle: {
    marginBottom: hp(0.5),
  },
  factorsSubtitle: {
    marginBottom: hp(2),
  },
  factorItem: {
    marginBottom: hp(2),
  },
  factorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(0.5),
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: Colors.neutral700,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  disclaimerContainer: {
    width: "100%",
    paddingHorizontal: 16,
    marginTop: hp(1.5),
    marginBottom: hp(1.5),
  },

  disclaimerCard: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.neutral900, // swap to your "surface" color
    borderWidth: 1,
    borderColor: Colors.neutral800, // subtle border
  },

  disclaimerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  disclaimerText: {
    flex: 1,
    lineHeight: 16,
  },

  faqButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.neutral800, // pill background
    borderWidth: 1,
    borderColor: Colors.neutral700,
  },

  faqText: {
    lineHeight: 18,
  },

  closeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: hp(1.8),
    borderRadius: 12,
    alignItems: "center",
  },
  scrollIndicator: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 1000,
  },
  scrollIndicatorBackground: {
    backgroundColor: Colors.neutral900 + "EE",
    borderColor: Colors.neutral700,
    borderWidth: 1,
    borderRadius: 90,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

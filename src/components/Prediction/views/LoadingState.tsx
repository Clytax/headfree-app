import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import Text from "@/components/common/Text";
import { Colors } from "@/constants";
import { getFontSize } from "@/utils/text/fonts";
import { hp } from "@/utils/ui/sizes";

interface LoadingStateProps {
  title: string;
  subtitle?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ title, subtitle }) => {
  return (
    <BottomSheetScrollView style={styles.container}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text
          fontSize={getFontSize(18)}
          fontWeight="semibold"
          textCenter
          style={styles.loadingTitle}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            fontSize={getFontSize(14)}
            color={Colors.neutral400}
            textCenter
            style={styles.loadingSubtext}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </BottomSheetScrollView>
  );
};

export default LoadingState;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: hp(2),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: hp(4),
  },
  loadingTitle: {
    marginTop: hp(3),
    marginBottom: hp(1),
  },
  loadingSubtext: {
    marginTop: hp(0.5),
  },
});

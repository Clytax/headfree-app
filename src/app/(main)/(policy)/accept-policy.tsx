import React, { useState } from "react";
import { ScrollView, StyleSheet, View, Pressable, Alert } from "react-native";

// Packages
import { useRouter } from "expo-router";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "@react-native-firebase/firestore";

// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";
import SafeAreaContainer from "@/components/common/Container/SafeAreaContainer";

// Constants
import { Colors, Sizes } from "@/constants";

// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";
import OnboardingPolicyHandle from "@/components/Onboarding/OnboardingPolicy/OnboardingPolicyHandle";
import { useAuth } from "@/context/auth/AuthContext";

const AcceptPolicyPage = () => {
  const router = useRouter();
  const [requiredAccepted, setRequiredAccepted] = useState(false);
  const [optionalAccepted, setOptionalAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const user = useAuth().user;

  const handleAccept = async () => {
    if (!user?.uid) {
      Alert.alert("Error", "User not found. Please try logging in again.");
      return;
    }

    setIsLoading(true);

    try {
      const firestore = getFirestore();
      const userDocRef = doc(firestore, "users", user.uid);

      // Get current user document
      const userDoc = await getDoc(userDocRef);
      const currentData = userDoc.data() || {};

      // Update privacy settings
      await setDoc(
        userDocRef,
        {
          ...currentData,
          privacy: {
            ...currentData.privacy,
            consentTimestamp: new Date().toISOString(),
            hasConsented: requiredAccepted,
            hasConsentedToOptional: optionalAccepted,
            deletionRequested: false,
            lastDataExport: currentData.privacy?.lastDataExport || null,
          },
        },
        { merge: true }
      );

      Alert.alert("Success", "Privacy policy accepted successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error updating privacy policy:", error);
      Alert.alert(
        "Error",
        "Failed to update privacy policy. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaContainer style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Text style={styles.title} textCenter>
          Privacy Policy Update
        </Text>

        <Text style={styles.introText}>
          Your privacy matters. Headfree follows the EU General Data Protection
          Regulation GDPR or DSGVO to protect your personal data.
        </Text>

        <View style={styles.spacer} />

        {/* How We Process Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Process Your Data</Text>
          <Text style={styles.sectionText}>
            • All health data is encrypted end-to-end{"\n"}• Data is stored
            securely on servers in the EU{"\n"}• We never sell or share your
            personal information{"\n"}• You can export or delete your data at
            any time
          </Text>
        </View>

        <View style={styles.spacer} />

        {/* What We Use Data For */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What We Use Your Data For</Text>
          <Text style={styles.sectionText}>
            • Track your migraine patterns and triggers{"\n"}• Generate
            personalized predictions{"\n"}• Provide insights about your health
            {"\n"}• Improve app functionality and user experience
          </Text>
        </View>

        <View style={styles.spacer} />

        {/* How We Handle Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Handle Your Data</Text>
          <Text style={styles.sectionText}>
            • Automatic data backup for your safety{"\n"}• Anonymous analytics
            to improve the app{"\n"}• No third-party access without your consent
            {"\n"}• Regular security audits and updates
          </Text>

          <Text
            fontWeight="bold"
            fontSize={getFontSize(15)}
            color={Colors.neutral300}
            style={{ paddingTop: hp(1) }}
          >
            Read the details here:{" "}
            <Text color={Colors.primary400}>(Privacy Policy)</Text>
          </Text>
        </View>

        <View style={styles.largeSpacer} />

        {/* Required Consent */}
        <Pressable
          style={styles.checkboxContainer}
          onPress={() => setRequiredAccepted(!requiredAccepted)}
          accessibilityLabel="Required consent checkbox"
          accessibilityRole="checkbox"
          accessibilityState={{ checked: requiredAccepted }}
        >
          <View
            style={[styles.checkbox, requiredAccepted && styles.checkboxActive]}
          >
            {requiredAccepted && <View style={styles.checkmark} />}
          </View>
          <View style={styles.checkboxTextContainer}>
            <Text style={styles.checkboxLabel}>
              Required consent
              <Text style={styles.requiredBadge}> *</Text>
            </Text>
            <Text style={styles.checkboxDescription}>
              I have read the privacy policy and give explicit consent to the
              processing of my health data as described.
            </Text>
          </View>
        </Pressable>

        <View style={styles.checkboxSpacer} />

        {/* Optional Consent */}
        <Pressable
          style={styles.checkboxContainer}
          onPress={() => setOptionalAccepted(!optionalAccepted)}
          accessibilityLabel="Optional consent checkbox"
          accessibilityRole="checkbox"
          accessibilityState={{ checked: optionalAccepted }}
        >
          <View
            style={[styles.checkbox, optionalAccepted && styles.checkboxActive]}
          >
            {optionalAccepted && <View style={styles.checkmark} />}
          </View>
          <View style={styles.checkboxTextContainer}>
            <Text style={styles.checkboxLabel}>Optional consent</Text>
            <Text style={styles.checkboxDescription}>
              I agree that my entries may be used in anonymized or aggregated
              form to improve the prediction algorithm. I can use the app
              without this.
            </Text>
          </View>
        </Pressable>

        <View style={styles.largeSpacer} />

        {/* Accept Button */}
        <Pressable
          onPress={handleAccept}
          disabled={!requiredAccepted}
          style={({ pressed }) => [
            styles.acceptButton,
            !requiredAccepted && styles.acceptButtonDisabled,
            pressed && requiredAccepted && styles.acceptButtonPressed,
          ]}
        >
          <Text
            style={[
              styles.acceptButtonText,
              !requiredAccepted && styles.acceptButtonTextDisabled,
            ]}
            fontWeight="bold"
          >
            Accept & Continue
          </Text>
        </Pressable>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaContainer>
  );
};

export default AcceptPolicyPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    padding: Sizes.containerPaddingHorizontal,
    paddingTop: hp(4),
  },
  title: {
    fontSize: getFontSize(28),
    fontWeight: "700",
    color: Colors.text,
    marginBottom: hp(2),
  },
  introText: {
    fontSize: getFontSize(15),
    color: Colors.text,
    textAlign: "center",
    lineHeight: getFontSize(22),
  },
  spacer: {
    height: hp(3),
  },
  largeSpacer: {
    height: hp(4),
  },
  section: {
    backgroundColor: Colors.backgroundLighter,
    borderRadius: Sizes.smallRadius,
    padding: Sizes.paddingHorizontalMedium,
    paddingVertical: Sizes.paddingVerticalLarge,
    borderWidth: 1,
    borderColor: Colors.neutral700,
  },
  sectionTitle: {
    fontSize: getFontSize(16),
    fontWeight: "600",
    color: Colors.text,
    marginBottom: hp(1),
  },
  sectionText: {
    fontSize: getFontSize(14),
    color: Colors.gray,
    lineHeight: getFontSize(22),
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkbox: {
    width: wp(6),
    height: wp(6),
    borderRadius: Sizes.extraSmallRadius,
    borderWidth: 2,
    borderColor: Colors.neutral500,
    marginRight: wp(3),
    marginTop: hp(0.3),
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: Colors.primary500,
    borderColor: Colors.primary500,
  },
  checkmark: {
    width: wp(3),
    height: wp(3),
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
  checkboxTextContainer: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: getFontSize(15),
    fontWeight: "600",
    color: Colors.text,
    marginBottom: hp(0.5),
  },
  requiredBadge: {
    color: Colors.error,
    fontSize: getFontSize(16),
  },
  checkboxDescription: {
    fontSize: getFontSize(13),
    color: Colors.gray,
    lineHeight: getFontSize(20),
  },
  checkboxSpacer: {
    height: hp(2),
  },
  acceptButton: {
    backgroundColor: Colors.primary500,
    paddingVertical: Sizes.paddingVerticalLarge,
    paddingHorizontal: Sizes.paddingHorizontalMedium,
    borderRadius: Sizes.buttonRadius,
    alignItems: "center",
  },
  acceptButtonDisabled: {
    backgroundColor: Colors.neutral700,
  },
  acceptButtonPressed: {
    opacity: 0.8,
  },
  acceptButtonText: {
    color: Colors.white,
    fontSize: getFontSize(16),
  },
  acceptButtonTextDisabled: {
    color: Colors.neutral500,
  },
  bottomPadding: {
    height: hp(4),
  },
});

import React, { useState, useEffect } from "react";
import { Pressable, StyleSheet, View, ScrollView, Alert } from "react-native";
// Packages
import { useRouter } from "expo-router";
import { signOut, getAuth } from "@react-native-firebase/auth";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "@react-native-firebase/firestore";
// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";
// Hooks
import { useUser } from "@/hooks/firebase/useUser";
import { useAuth } from "@/context/auth/AuthContext";
// Constants
import { Colors, Sizes } from "@/constants";
// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

// Context
import { useEmergencyContext } from "@/context/emergency/EmergencyContext";

const Account = () => {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { isEnabled, setEnabled } = useEmergencyContext();

  const user = useUser();
  const [isUpdating, setIsUpdating] = useState(false);

  const onSignOut = async () => {
    setEnabled(false);
    await signOut(getAuth());
  };

  const onRequestDeletion = () => {
    Alert.alert(
      "Request Account Deletion",
      "This feature will be available soon. Your data will be permanently deleted within 30 days.",
      [{ text: "OK" }]
    );
  };

  const updateConsent = async (
    field: "hasConsented" | "hasConsentedToOptional",
    value: boolean
  ) => {
    if (!authUser?.uid) {
      Alert.alert("Error", "User not found. Please try logging in again.");
      return;
    }

    setIsUpdating(true);

    try {
      const firestore = getFirestore();
      const userDocRef = doc(firestore, "users", authUser.uid);
      const userDoc = await getDoc(userDocRef);
      const currentData = userDoc.data() || {};

      await setDoc(
        userDocRef,
        {
          ...currentData,
          privacy: {
            ...currentData.privacy,
            [field]: value,
          },
        },
        { merge: true }
      );

      if (field === "hasConsented" && !value) {
        Alert.alert(
          "Consent revoked",
          "You have revoked consent to the privacy policy. You will be signed out now."
        );
        await signOut(getAuth());
        return;
      }

      Alert.alert("Success", "Consent preferences updated successfully!");
    } catch (error) {
      console.error("Error updating consent:", error);
      Alert.alert("Error", "Failed to update consent. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const exportData = async () => {
    if (!authUser?.uid) {
      Alert.alert("Error", "User not found. Please try logging in again.");
      return;
    }

    setIsUpdating(true);
    const uid = authUser.uid;

    try {
      const firestore = getFirestore();
      const userDocRef = doc(firestore, "users", uid);
      const userSnap = await getDoc(userDocRef);
      const userData = userSnap.data() || {};

      // Fetch subcollections (entries, predictions)
      const getCollection = async (path: string) => {
        const collectionRef = firestore.collection(path);
        const snap = await collectionRef.get();

        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      };

      const [entries, predictions] = await Promise.all([
        getCollection(`users/${uid}/entries`),
        getCollection(`users/${uid}/predictions`),
      ]);

      // Build export payload
      const payload = {
        uid,
        exported_at: new Date().toISOString(),
        data: {
          user: { id: uid, ...userData },
          entries,
          predictions,
        },
        schema_version: 1,
        app: { name: "Headfree", platform: "mobile" },
      };

      // Write file to app documents
      const safeTs = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `headfree-export-${uid}-${safeTs}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(payload, null, 2),
        {
          encoding: FileSystem.EncodingType.UTF8,
        }
      );

      // Update last export timestamp (optional audit trail)
      await setDoc(
        userDocRef,
        {
          privacy: {
            ...(userData.privacy || {}),
            lastDataExport: new Date().toISOString(),
          },
        },
        { merge: true }
      );

      // Share the file (if available), otherwise show path
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: "Your Headfree data export",
        });
      } else {
        Alert.alert(
          "Export saved",
          `Saved to:\n${fileUri}\n\nYou can copy this path with a file manager.`
        );
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      Alert.alert("Error", "Failed to export data. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const revokeRequiredConsent = () => {
    Alert.alert(
      "Revoke Privacy Consent",
      "Are you sure you want to revoke consent to the privacy policy? You will not be able to use the app without accepting the privacy policy.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes, Revoke",
          style: "destructive",
          onPress: () => updateConsent("hasConsented", false),
        },
      ]
    );
  };
  const formatDate = (timestamp: string | null | undefined) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {authUser?.displayName?.charAt(0)?.toUpperCase() ||
              authUser?.email?.charAt(0)?.toUpperCase() ||
              "U"}
          </Text>
        </View>
        <Text style={styles.headerTitle}>My Account</Text>
      </View>

      {/* User Info Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Account Information</Text>

        <View style={styles.infoSection}>
          <Text style={styles.label}>Username</Text>
          <Text style={styles.value}>{authUser?.displayName || "Not set"}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoSection}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{authUser?.email || "No email"}</Text>
        </View>
      </View>

      {/* Privacy & Data Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Privacy & Data</Text>

        <View style={styles.infoSection}>
          <Text style={styles.label}>Consent Version</Text>
          <Text style={styles.value}>
            {user.data?.privacy?.consentVersion || "N/A"}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoSection}>
          <Text style={styles.label}>Consent Date</Text>
          <Text style={styles.value}>
            {formatDate(user.data?.privacy?.consentTimestamp)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoSectionRow}>
          <View style={styles.infoSectionLeft}>
            <Text style={styles.label}>Terms Accepted</Text>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusBadge,
                  user.data?.privacy?.hasConsented
                    ? styles.statusBadgeActive
                    : styles.statusBadgeInactive,
                ]}
              >
                <Text style={styles.statusText}>
                  {user.data?.privacy?.hasConsented ? "Yes" : "No"}
                </Text>
              </View>
            </View>
          </View>
          <Pressable
            onPress={revokeRequiredConsent}
            style={({ pressed }) => [
              styles.smallButton,
              pressed && styles.smallButtonPressed,
            ]}
            disabled={isUpdating}
          >
            <Text style={styles.smallButtonText} fontWeight="semibold">
              Revoke
            </Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoSectionRow}>
          <View style={styles.infoSectionLeft}>
            <Text style={styles.label}>Optional Consent</Text>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusBadge,
                  user.data?.privacy?.hasConsentedToOptional
                    ? styles.statusBadgeActive
                    : styles.statusBadgeInactive,
                ]}
              >
                <Text style={styles.statusText}>
                  {user.data?.privacy?.hasConsentedToOptional ? "Yes" : "No"}
                </Text>
              </View>
            </View>
          </View>
          <Pressable
            onPress={() =>
              updateConsent(
                "hasConsentedToOptional",
                !user.data?.privacy?.hasConsentedToOptional
              )
            }
            style={({ pressed }) => [
              styles.smallButton,
              pressed && styles.smallButtonPressed,
            ]}
            disabled={isUpdating}
          >
            <Text style={styles.smallButtonText} fontWeight="semibold">
              {user.data?.privacy?.hasConsentedToOptional ? "Revoke" : "Grant"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoSectionRow}>
          <View style={styles.infoSectionLeft}>
            <Text style={styles.label}>Last Data Export</Text>
            <Text style={styles.value}>
              {formatDate(user.data?.privacy?.lastDataExport)}
            </Text>
          </View>
          <Pressable
            onPress={exportData}
            style={({ pressed }) => [
              styles.smallButton,
              pressed && styles.smallButtonPressed,
            ]}
            disabled={isUpdating}
          >
            <Text style={styles.smallButtonText} fontWeight="semibold">
              Export
            </Text>
          </Pressable>
        </View>

        {/* Request Deletion Button */}
        <Pressable
          onPress={onRequestDeletion}
          style={({ pressed }) => [
            styles.deletionButton,
            pressed && styles.deletionButtonPressed,
          ]}
        >
          <Text style={styles.deletionButtonText} fontWeight="bold">
            Request Account Deletion
          </Text>
        </Pressable>
      </View>

      {/* Sign Out Button */}
      <Pressable
        onPress={onSignOut}
        style={({ pressed }) => [
          styles.signOutButton,
          pressed && styles.signOutButtonPressed,
        ]}
      >
        <Text style={styles.signOutText} fontWeight="bold">
          Sign Out
        </Text>
      </Pressable>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

export default Account;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: Sizes.containerPaddingHorizontal,
    paddingTop: hp(4),
  },
  header: {
    alignItems: "center",
    marginBottom: hp(3),
  },
  avatarContainer: {
    width: wp(24),
    height: wp(24),
    borderRadius: wp(12),
    backgroundColor: Colors.primary500,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp(2),
  },
  avatarText: {
    fontSize: getFontSize(32),
    fontWeight: "600",
    color: Colors.white,
  },
  headerTitle: {
    fontSize: getFontSize(24),
    fontWeight: "600",
    color: Colors.text,
  },
  card: {
    backgroundColor: Colors.backgroundLighter,
    borderRadius: Sizes.largeRadius,
    padding: Sizes.paddingHorizontalMedium,
    paddingVertical: Sizes.paddingVerticalLarge,
    borderWidth: 1,
    borderColor: Colors.neutral700,
    marginBottom: hp(2),
  },
  sectionTitle: {
    fontSize: getFontSize(18),
    fontWeight: "600",
    color: Colors.text,
    marginBottom: hp(2),
  },
  infoSection: {
    paddingVertical: Sizes.paddingVerticalMedium,
  },
  infoSectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Sizes.paddingVerticalMedium,
  },
  infoSectionLeft: {
    flex: 1,
    marginRight: wp(3),
  },
  label: {
    fontSize: getFontSize(12),
    color: Colors.gray,
    marginBottom: hp(0.5),
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: getFontSize(16),
    color: Colors.text,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral700,
    marginVertical: hp(1),
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: Sizes.smallRadius,
  },
  statusBadgeActive: {
    backgroundColor: Colors.success500 + "20",
  },
  statusBadgeInactive: {
    backgroundColor: Colors.neutral700,
  },
  statusText: {
    fontSize: getFontSize(14),
    fontWeight: "600",
    color: Colors.text,
  },
  smallButton: {
    backgroundColor: Colors.primary500,
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: Sizes.smallRadius,
    minWidth: wp(20),
    alignItems: "center",
  },
  smallButtonPressed: {
    opacity: 0.8,
  },
  smallButtonText: {
    color: Colors.white,
    fontSize: getFontSize(13),
  },
  deletionButton: {
    backgroundColor: Colors.warning500 + "44",
    paddingVertical: Sizes.paddingVerticalMedium,
    paddingHorizontal: Sizes.paddingHorizontalMedium,
    borderRadius: Sizes.buttonRadius,
    alignItems: "center",
    marginTop: hp(2),
  },
  deletionButtonPressed: {
    opacity: 0.8,
  },
  deletionButtonText: {
    color: Colors.neutral200,
    fontSize: getFontSize(14),
  },
  signOutButton: {
    backgroundColor: Colors.error200,
    paddingVertical: Sizes.paddingVerticalLarge,
    paddingHorizontal: Sizes.paddingHorizontalMedium,
    borderRadius: Sizes.buttonRadius,
    alignItems: "center",
    marginTop: hp(2),
  },
  signOutButtonPressed: {
    opacity: 0.8,
  },
  signOutText: {
    color: Colors.textDark,
    fontSize: getFontSize(16),
  },
  bottomSpacer: {
    height: hp(4),
  },
});

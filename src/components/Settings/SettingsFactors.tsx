import {
  FactorVisibility,
  OPTIONAL_FACTORS,
} from "@/app/(main)/(tabs)/(account-stack)/settings";
import { useAuth } from "@/context/auth/AuthContext";
import { useUser } from "@/hooks/firebase/useUser";
import { doc, getFirestore, setDoc } from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";
import { Colors } from "@/constants";
import { hp, wp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

const SettingsFactors: React.FC = () => {
  const { user } = useAuth();
  const userDoc = useUser();
  const uid = user?.uid;

  const [visibility, setVisibility] = useState<FactorVisibility>({});
  const [isSaving, setIsSaving] = useState(false);

  // Initialise from user settings
  useEffect(() => {
    const raw = ((userDoc?.data as any)?.settings?.factorVisibility ??
      {}) as FactorVisibility;
    const base: FactorVisibility = {};
    OPTIONAL_FACTORS.forEach((f) => {
      const v = raw[f.key];
      // default: visible
      base[f.key] = v === false ? false : true;
    });
    setVisibility(base);
  }, [userDoc?.data]);

  const handleToggle = async (key: string, value: boolean) => {
    const updated: FactorVisibility = { ...visibility, [key]: value };
    setVisibility(updated);

    if (!uid) return;

    try {
      setIsSaving(true);
      const db = getFirestore();
      const userRef = doc(db, "users", uid);

      const prevSettings =
        ((userDoc?.data as any)?.settings as Record<string, unknown>) ?? {};

      await setDoc(
        userRef,
        {
          settings: {
            ...prevSettings,
            factorVisibility: updated,
          },
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Failed to update factor visibility", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Daily factors</Text>
      <Text style={styles.sectionSubtitle}>
        Choose which optional factors are shown on the Daily Entry screen.
      </Text>

      {OPTIONAL_FACTORS.map((f) => (
        <View key={f.key} style={styles.factorRow}>
          <View style={styles.factorTextWrapper}>
            <Text style={styles.factorLabel}>{f.title ?? f.key}</Text>
            {f.description ? (
              <Text style={styles.factorDescription}>{f.description}</Text>
            ) : null}
          </View>

          <MyTouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              handleToggle(f.key, visibility[f.key] === false ? true : false)
            }
            style={[
              styles.togglePill,
              visibility[f.key] === false ? styles.toggleOff : styles.toggleOn,
            ]}
          >
            <Text style={styles.toggleText}>
              {visibility[f.key] === false ? "Hidden" : "Shown"}
            </Text>
          </MyTouchableOpacity>
        </View>
      ))}

      {isSaving && <Text style={styles.savingLabel}>Saving…</Text>}
    </View>
  );
};
export default SettingsFactors;

const styles = StyleSheet.create({
  section: {
    marginTop: hp(3),
  },
  sectionTitle: {
    fontSize: getFontSize(18),
    fontWeight: "700",
    color: Colors.white,
    marginBottom: hp(0.5),
  },
  sectionSubtitle: {
    fontSize: getFontSize(13),
    color: Colors.neutral300,
    marginBottom: hp(1.5),
  },
  factorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: hp(1),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.neutral700,
  },
  factorTextWrapper: {
    flex: 1,
    paddingRight: wp(3),
  },
  factorLabel: {
    fontSize: getFontSize(15),
    color: Colors.white,
    marginBottom: hp(0.2),
  },
  factorDescription: {
    fontSize: getFontSize(12),
    color: Colors.neutral300,
  },
  togglePill: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.6),
    borderRadius: 999,
    borderWidth: 1,
  },
  toggleOn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  toggleOff: {
    backgroundColor: "transparent",
    borderColor: Colors.neutral500,
  },
  toggleText: {
    fontSize: getFontSize(12),
    color: Colors.white,
    fontWeight: "600",
  },
  savingLabel: {
    marginTop: hp(1),
    fontSize: getFontSize(12),
    color: Colors.neutral400,
  },
});

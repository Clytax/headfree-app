import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";

// Navigation
import { useRouter } from "expo-router";

// Firestore
import { doc, getFirestore, setDoc } from "@react-native-firebase/firestore";

// UI
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";

// Constants
import { Colors } from "@/constants";

// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

// Hooks
import { useUser } from "@/hooks/firebase/useUser";
import { useAuth } from "@/context/auth/AuthContext";

type SavingState = {
  mode: boolean;
};

const MODES = [
  {
    value: "normal" as const,
    title: "Normal",
    subtitle: "Balanced ML model",
  },
  {
    value: "sensitive" as const,
    title: "Sensitive",
    subtitle: "More alerts from the model",
  },
];

type ModeValue = (typeof MODES)[number]["value"];

const SettingsOther = () => {
  const router = useRouter();
  const userData = useUser();
  const { user } = useAuth();

  const settings = (userData?.data?.settings ?? {}) as any;
  const initialMode: ModeValue =
    settings?.mode === "sensitive" ? "sensitive" : "normal";

  const [mode, setMode] = useState<ModeValue>(initialMode);
  const [saving, setSaving] = useState<SavingState>({ mode: false });
  const [infoVisible, setInfoVisible] = useState(false);

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const updateSettingsMode = useCallback(
    async (newMode: ModeValue) => {
      try {
        if (!user) return;

        setSaving((s) => ({ ...s, mode: true }));
        try {
          const db = getFirestore();
          const userDataRef = doc(db, "users", user.uid);

          await setDoc(
            userDataRef,
            {
              settings: {
                ...(userData?.data?.settings ?? {}),
                mode: newMode,
              },
            },
            { merge: true }
          );
        } finally {
          if (mountedRef.current) {
            setSaving((s) => ({ ...s, mode: false }));
          }
        }
      } catch (error) {
        console.log("Failed to update settings.mode", error);
      }
    },
    [user, userData?.data?.settings]
  );

  const onSelectMode = useCallback(
    (value: ModeValue) => {
      if (value === mode) return;
      setMode(value);
      updateSettingsMode(value);
    },
    [mode, updateSettingsMode]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle} fontWeight="bold">
        Prediction model
      </Text>

      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text fontWeight="bold" style={styles.itemTitle}>
              Model sensitivity
            </Text>
            <Text style={styles.itemDescription}>
              Choose how aggressively the migraine prediction model should alert
              you.
            </Text>
          </View>
          {saving.mode && (
            <ActivityIndicator size="small" style={styles.spinner} />
          )}
        </View>

        <View style={styles.modeRow}>
          {MODES.map((m) => {
            const selected = m.value === mode;
            return (
              <MyTouchableOpacity
                key={m.value}
                onPress={() => onSelectMode(m.value)}
                disabled={saving.mode}
                style={[
                  styles.modeButton,
                  selected && styles.modeButtonSelected,
                ]}
              >
                <Text
                  fontWeight="bold"
                  style={[
                    styles.modeTitle,
                    selected && styles.modeTitleSelected,
                  ]}
                >
                  {m.title}
                </Text>
                <Text
                  style={[
                    styles.modeSubtitle,
                    selected && styles.modeSubtitleSelected,
                  ]}
                >
                  {m.subtitle}
                </Text>
              </MyTouchableOpacity>
            );
          })}
        </View>

        <MyTouchableOpacity
          style={styles.infoButton}
          onPress={() => setInfoVisible(true)}
          hitSlop={8}
        >
          <Text style={styles.infoButtonText}>What does this change?</Text>
        </MyTouchableOpacity>
      </View>

      {/* Info modal with detailed ML explanation */}
      <Modal
        visible={infoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setInfoVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle} fontWeight="bold">
              How the prediction model uses this setting
            </Text>

            <Text style={styles.modalText}>
              The app uses a machine learning model to estimate your migraine
              risk for each day. This setting controls the{" "}
              <Text fontWeight="bold">decision threshold</Text> inside that
              model.
              {"\n\n"}
              <Text fontWeight="bold">Normal</Text> tells the model to use a
              balanced threshold, aiming for a good trade-off between missed
              attacks and unnecessary alerts.
              {"\n\n"}
              <Text fontWeight="bold">Sensitive</Text> uses a higher-sensitivity
              operating point. The model will raise alerts more easily, which
              can reduce missed migraine days but may also show more false
              alarms.
              {"\n\n"}
              Your raw risk probability is always computed by the same model –
              this setting only changes how the app interprets that probability
              as “alert” versus “no alert”.
            </Text>

            <MyTouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setInfoVisible(false)}
            >
              <Text color="#fff" fontWeight="bold">
                Got it
              </Text>
            </MyTouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default SettingsOther;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    paddingVertical: hp(1),
  },
  card: {
    backgroundColor: Colors.backgroundLighter ?? "white",
    borderRadius: 16,
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    marginBottom: hp(2),
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp(1.5),
    alignItems: "center",
  },
  itemTitle: {
    fontSize: getFontSize(16),
    color: Colors.text,
  },
  itemDescription: {
    marginTop: 4,
    fontSize: getFontSize(13),
    opacity: 0.7,
  },
  modeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginTop: hp(1),
  },
  modeButton: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border ?? "#e5e5e5",
    backgroundColor: Colors.background ?? "#fff",
  },
  modeButtonSelected: {
    backgroundColor: Colors.primary700,
    borderColor: Colors.primary700,
  },
  modeTitle: {
    fontSize: getFontSize(14),
    color: Colors.text,
    marginBottom: 2,
  },
  modeTitleSelected: {
    color: "#fff",
  },
  modeSubtitle: {
    fontSize: getFontSize(12),
    opacity: 0.7,
    color: Colors.text,
  },
  modeSubtitleSelected: {
    color: "#f5f5f5",
  },
  spinner: {
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: getFontSize(20),
    color: Colors.text,
    marginBottom: hp(2),
  },
  infoButton: {
    marginTop: hp(1.5),
    alignSelf: "flex-start",
  },
  infoButtonText: {
    fontSize: getFontSize(13),
    color: Colors.primary700,
    textDecorationLine: "underline",
  },
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(6),
  },
  modalContent: {
    backgroundColor: Colors.background ?? "#fff",
    borderRadius: 18,
    paddingHorizontal: wp(5),
    paddingVertical: hp(2.5),
    maxWidth: "100%",
  },
  modalTitle: {
    fontSize: getFontSize(18),
    marginBottom: hp(1),
    color: Colors.text,
  },
  modalText: {
    fontSize: getFontSize(14),
    color: Colors.text,
    opacity: 0.85,
    marginBottom: hp(2),
  },
  modalCloseButton: {
    alignSelf: "flex-end",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: Colors.primary700,
  },
});

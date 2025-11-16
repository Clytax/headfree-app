import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import Slider from "@react-native-community/slider";
import { Checkbox } from "expo-checkbox";

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

// Hooks
import { useUser } from "@/hooks/firebase/useUser";
import { useAuth } from "@/context/auth/AuthContext";
import { IUserEmergencySettings } from "@/types/user";
import { getFontSize } from "@/utils/text/fonts";

type SavingState = {
  brightness: boolean;
  noAnimations: boolean;
  mutePhone: boolean;
};

const SettingsEmergency = () => {
  const router = useRouter();
  const userData = useUser();
  const { user } = useAuth();
  const emergency = userData?.data?.emergency ?? ({} as IUserEmergencySettings);

  const initialBrightnessDisabled = emergency?.brightness === null;
  const initialBrightness =
    typeof emergency?.brightness === "number" ? emergency.brightness : 0.8;
  const initialNoAnimations = !!emergency?.noAnimations;
  const initialMutePhone = !!emergency?.mutePhone;

  const [brightnessDisabled, setBrightnessDisabled] = useState<boolean>(
    initialBrightnessDisabled
  );
  const [brightness, setBrightness] = useState<number>(initialBrightness);
  const [noAnimations, setNoAnimations] =
    useState<boolean>(initialNoAnimations);
  const [mutePhone, setMutePhone] = useState<boolean>(initialMutePhone);

  const [saving, setSaving] = useState<SavingState>({
    brightness: false,
    noAnimations: false,
    mutePhone: false,
  });

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const lastBrightnessRef = useRef<number>(initialBrightness);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const updateEmergencyValue = useCallback(
    async (key: keyof SavingState, value: any) => {
      try {
        if (!user) return;

        setSaving((s) => ({ ...s, [key]: true }));
        try {
          const db = getFirestore();
          const userDataRef = doc(db, "users", user.uid);
          await setDoc(
            userDataRef,
            {
              emergency: {
                ...(userData?.data?.emergency ?? {}),
                [key]:
                  key === "brightness"
                    ? value === null
                      ? null
                      : Math.min(Math.max(value, 0), 1)
                    : value,
              },
            },
            { merge: true }
          );
        } finally {
          if (mountedRef.current) {
            setSaving((s) => ({ ...s, [key]: false }));
          }
        }
      } catch (error) {
        console.log("Failed to update emergency value", error);
      }
    },
    [user, userData?.data?.emergency]
  );

  const debouncedSaveBrightness = useCallback(
    (v: number) => {
      if (brightnessDisabled) return;
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      setSaving((s) => ({ ...s, brightness: true }));
      debounceTimer.current = setTimeout(async () => {
        await updateEmergencyValue("brightness", v);
        if (mountedRef.current) {
          setSaving((s) => ({ ...s, brightness: false }));
        }
      }, 450);
    },
    [updateEmergencyValue, brightnessDisabled]
  );

  const onSlide = useCallback(
    (v: number) => {
      if (brightnessDisabled) return;
      setBrightness(v);
      lastBrightnessRef.current = v;
      debouncedSaveBrightness(v);
    },
    [debouncedSaveBrightness, brightnessDisabled]
  );

  const toggleBrightnessDisabled = useCallback(async () => {
    // If currently enabled, disable and store null
    if (!brightnessDisabled) {
      setBrightnessDisabled(true);
      await updateEmergencyValue("brightness", null);
      return;
    }
    // If currently disabled, re enable and restore last value
    const restore = lastBrightnessRef.current ?? 0.8;
    setBrightnessDisabled(false);
    setBrightness(restore);
    await updateEmergencyValue("brightness", restore);
  }, [brightnessDisabled, updateEmergencyValue]);

  const toggleNoAnimations = useCallback(async () => {
    const next = !noAnimations;
    setNoAnimations(next);
    await updateEmergencyValue("noAnimations", next);
  }, [noAnimations, updateEmergencyValue]);

  const toggleMutePhone = useCallback(async () => {
    const next = !mutePhone;
    setMutePhone(next);
    await updateEmergencyValue("mutePhone", next);
  }, [mutePhone, updateEmergencyValue]);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle} fontWeight="bold">
        Emergency
      </Text>
      <Text style={styles.sectionHint}>
        These settings will be applied when you enable Emergency mode
      </Text>

      {/* Brightness */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Text fontWeight="bold">Emergency brightness</Text>
          <View style={styles.rightRow}>
            {saving.brightness && <Text style={styles.savingText}>Saving</Text>}
            <Text fontWeight="bold">
              {brightnessDisabled ? "Off" : `${Math.round(brightness * 100)}%`}
            </Text>
          </View>
        </View>

        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          step={0.01}
          value={brightness}
          onValueChange={onSlide}
          minimumTrackTintColor={
            brightnessDisabled ? Colors.secondary300 : Colors.primary500
          }
          maximumTrackTintColor={Colors.secondary300}
          thumbTintColor={
            brightnessDisabled ? Colors.secondary300 : Colors.primary700
          }
          disabled={saving.brightness || brightnessDisabled}
        />

        <MyTouchableOpacity
          style={[
            styles.toggleBtn,
            {
              backgroundColor: brightnessDisabled
                ? Colors.primary700
                : Colors.secondary500,
            },
          ]}
          onPress={toggleBrightnessDisabled}
          disabled={saving.brightness}
          accessible
          accessibilityRole="button"
          accessibilityLabel={
            brightnessDisabled ? "Enable brightness" : "Disable brightness"
          }
          accessibilityHint={
            brightnessDisabled
              ? "Enable brightness adjustments"
              : "Disable brightness adjustments"
          }
          accessibilityState={{
            disabled: !!saving.brightness,
            busy: !!saving.brightness,
            selected: !!brightnessDisabled,
          }}
          hitSlop={8}
        >
          <Text color="#fff" fontWeight="bold">
            {brightnessDisabled ? "Enable brightness" : "Disable brightness"}
          </Text>
        </MyTouchableOpacity>
      </View>

      {/* Disable animations */}
      <View style={styles.itemRow}>
        <Text style={styles.itemText}>Disable animations during Emergency</Text>
        <View style={styles.rightRow}>
          {saving.noAnimations && (
            <ActivityIndicator size="small" style={styles.spinner} />
          )}
          <Checkbox
            value={noAnimations}
            onValueChange={toggleNoAnimations}
            color={noAnimations ? Colors.primary : undefined}
            disabled={saving.noAnimations}
          />
        </View>
      </View>

      {/* Mute phone */}
      <View style={styles.itemRow}>
        <Text style={styles.itemText}>Mute phone during Emergency</Text>
        <View style={styles.rightRow}>
          {saving.mutePhone && (
            <ActivityIndicator size="small" style={styles.spinner} />
          )}
          <Checkbox
            value={mutePhone}
            onValueChange={toggleMutePhone}
            color={mutePhone ? Colors.primary : undefined}
            disabled={saving.mutePhone}
          />
        </View>
      </View>
    </View>
  );
};

export default SettingsEmergency;

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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp(1),
    alignItems: "center",
  },
  rightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  savingText: {
    opacity: 0.6,
    marginRight: 6,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(2),
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border ?? "#e5e5e5",
  },
  itemText: {
    maxWidth: "70%",
    fontSize: getFontSize(14),
  },
  spinner: {
    marginRight: 8,
  },
  backBtn: {
    marginTop: hp(3),
    alignSelf: "flex-start",
    backgroundColor: Colors.primary700,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: getFontSize(20),
    color: Colors.text,
  },
  toggleBtn: {
    marginTop: hp(1.5),

    alignSelf: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionHint: {
    marginTop: 4,
    marginBottom: hp(2),
    fontSize: getFontSize(13),
    color: Colors.neutral300,
  },
});

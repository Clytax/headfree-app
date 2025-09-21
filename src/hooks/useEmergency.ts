// hooks/useEmergency.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@/hooks/firebase/useUser";
import type { IUserEmergencySettings } from "@/types/user";
import { UseEmergencyResult } from "@/store/emergency/useEmergencyStore.types";

import * as Brightness from "expo-brightness";
import { setIsAudioActiveAsync } from "expo-audio";

const STORAGE_KEY_ENABLED = "emergency_enabled";
const STORAGE_KEY_ENABLED_AT = "emergency_enabled_at";

const defaultSettings: IUserEmergencySettings = {
  brightness: null,
  mutePhone: true, // will disable app audio
  music: false,
  musicType: null,
  noAnimations: false,
};

export function useEmergency(): UseEmergencyResult {
  const { data: userDoc, isLoading } = useUser();
  const [isEnabled, setIsEnabled] = useState(false);
  const [enabledAt, setEnabledAt] = useState<Date | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const prevBrightness = useRef<number | null>(null);
  const prevAudioActive = useRef<boolean | null>(null); // track app audio active state

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [rawEnabled, rawDate] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_ENABLED),
          AsyncStorage.getItem(STORAGE_KEY_ENABLED_AT),
        ]);
        if (!mounted) return;
        setIsEnabled(rawEnabled === "1");
        setEnabledAt(rawDate ? new Date(rawDate) : null);
      } finally {
        if (mounted) setHydrated(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const settings: IUserEmergencySettings = useMemo(() => {
    const remote = userDoc?.emergency as
      | Partial<IUserEmergencySettings>
      | undefined;
    return { ...defaultSettings, ...(remote || {}) };
  }, [userDoc?.emergency]);

  const persistEnabled = useCallback(async (v: boolean) => {
    await AsyncStorage.setItem(STORAGE_KEY_ENABLED, v ? "1" : "0");
    if (v) {
      const now = new Date();
      setEnabledAt(now);
      await AsyncStorage.setItem(STORAGE_KEY_ENABLED_AT, now.toISOString());
    }
  }, []);

  const setEnabled = useCallback(
    async (v: boolean) => {
      setIsEnabled(v);
      await persistEnabled(v);
    },
    [persistEnabled]
  );

  const toggle = useCallback(async () => {
    await setEnabled(!isEnabled);
  }, [isEnabled, setEnabled]);

  useEffect(() => {
    (async () => {
      try {
        if (isEnabled) {
          if (prevBrightness.current === null) {
            try {
              const sysBrightness = await Brightness.getBrightnessAsync();
              prevBrightness.current = sysBrightness;
            } catch (err) {
              console.log("Failed to read brightness", err);
            }
          }

          // remember current app audio active state
          if (prevAudioActive.current === null) {
            // expo audio is active by default
            prevAudioActive.current = true;
          }

          if (typeof settings.brightness === "number") {
            await Brightness.setBrightnessAsync(settings.brightness);
          }

          if (settings.mutePhone) {
            // disable all audio in your app
            await setIsAudioActiveAsync(false);
          }
        } else {
          if (prevBrightness.current !== null) {
            try {
              await Brightness.setBrightnessAsync(prevBrightness.current);
            } catch (err) {
              console.log("Failed to restore brightness", err);
            }
            prevBrightness.current = null;
          }

          if (prevAudioActive.current !== null) {
            try {
              await setIsAudioActiveAsync(prevAudioActive.current);
            } catch (err) {
              console.log("Failed to restore audio active state", err);
            }
            prevAudioActive.current = null;
          }
        }
      } catch (err) {
        console.log("Emergency side-effect error", err);
      }
    })();
  }, [isEnabled, settings]);

  const animationForTabs = useMemo(
    () => (isEnabled && settings.noAnimations ? "none" : "shift"),
    [isEnabled, settings.noAnimations]
  );
  const animationForStacks = useMemo(
    () => (isEnabled && settings.noAnimations ? "none" : "slide_from_right"),
    [isEnabled, settings.noAnimations]
  );

  const isReady = useMemo(() => hydrated && !isLoading, [hydrated, isLoading]);

  return {
    isEnabled,
    enabledAt,
    settings,
    isReady,
    setEnabled,
    toggle,
    refreshSettingsFromCache: async () => {},
    animationForStacks,
    animationForTabs,
  };
}

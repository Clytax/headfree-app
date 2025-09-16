import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View, Alert, Linking, AppState } from "react-native";
import Animated from "react-native-reanimated";
import * as Location from "expo-location";
// import * as Device from "expo-device";

import Text from "@/components/common/Text";
import OnboardingTop from "@/components/Onboarding/OnboardingTop";
import OnboardingDataSource from "@/components/Onboarding/OnboardingDataSources/OnboardingDataSource";
import { enter, exit } from "@/utils/animation/onboardingAnimation";
import { HeartIcon, Map } from "lucide-react-native";

import {
  useHealthkitAuthorization,
  AuthorizationRequestStatus,
} from "@kingstinct/react-native-healthkit";
import type { ObjectTypeIdentifier } from "@kingstinct/react-native-healthkit";
import { useOnboardingStore } from "@/store/onboarding/useOnboardingStore";
import { Sizes } from "@/constants";

const AnimatedText = Animated.createAnimatedComponent(Text);

// HealthKit read types
const BASE_READ_TYPES = [
  "HKQuantityTypeIdentifierStepCount",
  "HKQuantityTypeIdentifierRestingHeartRate",
  "HKCategoryTypeIdentifierSleepAnalysis",
] as const satisfies readonly ObjectTypeIdentifier[];

const FEMALE_READ_TYPES = [
  ...BASE_READ_TYPES,
  "HKCategoryTypeIdentifierMenstrualFlow",
] as const satisfies readonly ObjectTypeIdentifier[];

type CityInfo = {
  city: string | null;
  country: string | null;
  isoCountryCode: string | null;
  admin: string | null;
  lat: number;
  lon: number;
  latRounded: number;
  lonRounded: number;
  updatedAt: string;
};

function roundCoord(x: number, decimals = 2) {
  const p = Math.pow(10, decimals);
  return Math.round(x * p) / p;
}

async function askCityAndCountry(): Promise<CityInfo | null> {
  const perm = await Location.requestForegroundPermissionsAsync();
  if (perm.status !== "granted") {
    Alert.alert("Location needed", "Allow location to fetch your city.", [
      { text: "Cancel", style: "cancel" },
      { text: "Open Settings", onPress: () => Linking.openSettings() },
    ]);
    return null;
  }

  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Low,
    mayShowUserSettingsDialog: true,
  });

  const { latitude: lat, longitude: lon } = pos.coords;

  const places = await Location.reverseGeocodeAsync({
    latitude: lat,
    longitude: lon,
  });
  const place = places[0];

  const city =
    place?.city || place?.district || place?.subregion || place?.name || null;

  const country = place?.country ?? null;
  const isoCountryCode = place?.isoCountryCode ?? null;
  const admin = place?.region ?? place?.subregion ?? null;

  return {
    city,
    country,
    isoCountryCode,
    admin,
    lat,
    lon,
    latRounded: roundCoord(lat, 2),
    lonRounded: roundCoord(lon, 2),
    updatedAt: new Date().toISOString(),
  };
}

export default function OnboardingDataSources() {
  const updateMigraineProfile = useOnboardingStore(
    (s) => s.updateMigraineProfile
  );

  // gender from your store
  const gender = useOnboardingStore((s) => s.data.migraineProfile?.gender);
  const isFemale = useMemo(
    () =>
      typeof gender === "string" &&
      /^(female|woman|frau|weiblich|f)$/i.test(gender.trim()),
    [gender]
  );

  const READ_TYPES: readonly ObjectTypeIdentifier[] = isFemale
    ? FEMALE_READ_TYPES
    : BASE_READ_TYPES;

  // HealthKit hook
  const [authRequestStatus, requestAuthorization] =
    useHealthkitAuthorization(READ_TYPES);
  const [healthConnected, setHealthConnected] = useState(false);

  // Location state
  const [cityInfo, setCityInfo] = useState<CityInfo | null>(null);
  const [locationConnected, setLocationConnected] = useState(false);

  // Open Health or Settings and show short steps
  async function openHealthOrSettings() {
    const healthUrl = "x-apple-health://";
    try {
      const canOpen = await Linking.canOpenURL(healthUrl);
      if (canOpen) {
        await Linking.openURL(healthUrl);
        Alert.alert(
          "How to enable",
          [
            "Tap your profile picture",
            "Tap Privacy",
            "Tap Apps",
            "Tap your app name",
            "Turn on the data types",
          ].join("\n")
        );
        return;
      }
    } catch {}
    try {
      await Linking.openSettings();
    } catch {
      Alert.alert(
        "Open Settings",
        "Open Health or Settings and enable Health access for this app."
      );
    }
  }

  // Connect Apple Health
  const onAppleHealthConnect = async () => {
    // if (!Device.isDevice) {
    //   Alert.alert(
    //     "Use a real iPhone",
    //     "Apple Health is not available on the simulator."
    //   );
    //   return;
    // }
    try {
      const result = await requestAuthorization();
      if (result === AuthorizationRequestStatus.shouldRequest) {
        return;
      }
      if (result === AuthorizationRequestStatus.unnecessary) {
        setHealthConnected(true);
        Alert.alert(
          "Manage Apple Health",
          "If you do not see data flowing, open Health or Settings and enable the requested types.",
          [
            { text: "Close", style: "cancel" },
            { text: "Open", onPress: openHealthOrSettings },
          ]
        );
      }
    } catch {
      Alert.alert(
        "Apple Health",
        "Could not request permissions. Open Health or Settings to review permissions.",
        [
          { text: "Close", style: "cancel" },
          { text: "Open", onPress: openHealthOrSettings },
        ]
      );
    }
  };

  // Recheck after returning from Health or Settings
  useEffect(() => {
    const sub = AppState.addEventListener("change", async (s) => {
      if (s === "active") {
        try {
          const res = await requestAuthorization();
          if (res === AuthorizationRequestStatus.unnecessary) {
            setHealthConnected(true);
          }
        } catch {}
      }
    });
    return () => sub.remove();
  }, [requestAuthorization]);

  // Connect location
  const onLocationConnect = async () => {
    try {
      const info = await askCityAndCountry();
      if (!info) return;

      // Save to store
      updateMigraineProfile({
        location: {
          city: info.city,
          country: info.country,
          isoCountryCode: info.isoCountryCode,
          admin: info.admin,
          coords: {
            lat: info.lat,
            lon: info.lon,
            latRounded: info.latRounded,
            lonRounded: info.lonRounded,
          },
          updatedAt: info.updatedAt,
        },
      });

      setCityInfo(info);
      setLocationConnected(true);
    } catch {
      Alert.alert(
        "Location",
        "Could not determine your city. Try again later."
      );
    }
  };

  // Cards
  const appleHealthUsages = isFemale
    ? ["Sleep Duration", "Step count", "Menstrual Cycle"]
    : ["Sleep Duration", "Step count"];
  const appleHealthSubtitle = isFemale
    ? "Better predictions with sleep, steps and cycle data"
    : "Better predictions with sleep and steps data";

  const locationTitle =
    locationConnected && cityInfo?.city
      ? `Location · ${cityInfo.city}${
          cityInfo.isoCountryCode ? ", " + cityInfo.isoCountryCode : ""
        }`
      : "Location";

  const connections = [
    {
      id: "appleHealth",
      name: healthConnected ? "Apple Health connected" : "Apple Health",
      subTitle: appleHealthSubtitle,
      icon: HeartIcon,
      usages: appleHealthUsages,
      required: false,
      onConnect: onAppleHealthConnect,
      isConnected: healthConnected,
      connectText: healthConnected ? "Manage" : "Connect",
    },
    {
      id: "location",
      name: locationTitle,
      subTitle:
        "Some migraines are linked to weather changes. We only need your city area.",
      icon: Map,
      usages: cityInfo
        ? [
            `City  ${cityInfo.city ?? "Unknown"}`,
            `Country  ${
              cityInfo.isoCountryCode ?? cityInfo.country ?? "Unknown"
            }`,
            `Lat Lon  ${cityInfo.latRounded}, ${cityInfo.lonRounded}`,
            "Weather Data",
            "Barometric Pressure",
          ]
        : ["Weather Data", "Barometric Pressure"],
      required: false,
      onConnect: onLocationConnect,
      isConnected: locationConnected,
      connectText: locationConnected ? "Change" : "Connect",
    },
  ] as const;

  return (
    <View style={styles.container}>
      <OnboardingTop />
      <Animated.View
        entering={enter(100)}
        exiting={exit(0)}
        style={styles.intro}
      >
        <Text textCenter>
          Headfree can estimate your migraine risk more accurately if you share
          certain health data.
          {"\n\n"}
          Without this data, predictions may be less precise.
          {"\n\n"}
          All connections are optional, and you can change them anytime in
          Settings.
        </Text>
      </Animated.View>

      <Animated.ScrollView
        entering={enter(100)}
        exiting={exit(100)}
        contentContainerStyle={styles.sources}
      >
        {connections.map((c) => (
          <OnboardingDataSource
            key={c.id}
            id={c.id}
            onConnect={c.onConnect}
            connectText={c.connectText}
            subtitle={c.subTitle}
            title={c.name}
            usages={c.usages as string[]}
            required={c.required}
            icon={c.icon}
            connected={c.isConnected}
          />
        ))}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginBottom: Sizes.verticalMedium },
  intro: { paddingHorizontal: 16, marginBottom: 16 },
  sources: {
    paddingBottom: 24,
    gap: 12,
  },
});

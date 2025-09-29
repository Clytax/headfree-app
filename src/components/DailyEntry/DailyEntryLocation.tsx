import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Linking } from "react-native";
import * as Location from "expo-location";
import { Map } from "lucide-react-native";

import DailyEntryDataSource from "@/components/DailyEntry/DailyEntryDataSource";
import { Colors } from "@/constants";

export interface LocationCoordinates {
  lat: number;
  lon: number;
}

export interface CityInfo {
  city: string | null;
  country: string | null;
  isoCountryCode: string | null;
  admin: string | null;
  coords: LocationCoordinates;
  updatedAt: string;
}

type Props = {
  value: CityInfo | null;
  onChange: (cityInfo: CityInfo | null) => void;
  isBusy?: boolean;
};

const COORDINATE_PRECISION = 2;

const LOCATION_CONFIG = {
  title: "Location",
  description:
    "We only use your location to provide weather data and barometric pressure information for your area.",
  baseUsages: ["Weather Data", "Barometric Pressure"] as string[],
  permissions: {
    title: "Location Access Required",
    message:
      "Please allow location access to fetch local weather data for your daily entry.",
    cancelText: "Cancel",
    settingsText: "Open Settings",
  },
  errors: {
    general: "Unable to determine your location. Please try again later.",
  },
} as const;

function roundCoordinate(value: number, decimals = COORDINATE_PRECISION) {
  const m = Math.pow(10, decimals);
  return Math.round(value * m) / m;
}

const DailyEntryLocation: React.FC<Props> = ({ value, onChange, isBusy }) => {
  const [isConnected, setIsConnected] = useState<boolean>(!!value);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cityInfo, setCityInfo] = useState<CityInfo | null>(value ?? null);

  useEffect(() => {
    setCityInfo(value ?? null);
    setIsConnected(!!value);
  }, [value]);

  const requestLocationData =
    useCallback(async (): Promise<CityInfo | null> => {
      try {
        const permissionResult =
          await Location.requestForegroundPermissionsAsync();

        if (permissionResult.status !== "granted") {
          Alert.alert(
            LOCATION_CONFIG.permissions.title,
            LOCATION_CONFIG.permissions.message,
            [
              { text: LOCATION_CONFIG.permissions.cancelText, style: "cancel" },
              {
                text: LOCATION_CONFIG.permissions.settingsText,
                onPress: () => Linking.openSettings(),
              },
            ]
          );
          return null;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          mayShowUserSettingsDialog: true,
        });

        const { latitude, longitude } = position.coords;

        const places = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        const primary = places[0];
        if (!primary) return null;

        const info: CityInfo = {
          city:
            primary.city ||
            primary.district ||
            primary.subregion ||
            primary.name ||
            null,
          country: primary.country ?? null,
          isoCountryCode: primary.isoCountryCode ?? null,
          admin: primary.region ?? primary.subregion ?? null,
          coords: {
            lat: roundCoordinate(latitude),
            lon: roundCoordinate(longitude),
          },
          updatedAt: new Date().toISOString(),
        };

        return info;
      } catch (err) {
        console.error("Location request failed", err);
        throw err;
      }
    }, []);

  const handleConnect = useCallback(async () => {
    if (isLoading || isBusy) return;
    setIsLoading(true);
    try {
      const info = await requestLocationData();
      if (!info) return;
      setCityInfo(info);
      setIsConnected(true);
      onChange(info);
    } catch {
      Alert.alert("Location Error", LOCATION_CONFIG.errors.general);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isBusy, onChange, requestLocationData]);

  const usages = useMemo((): string[] => {
    if (!cityInfo) return LOCATION_CONFIG.baseUsages;
    return [
      `City: ${cityInfo.city ?? "Unknown"}`,
      `Country: ${cityInfo.isoCountryCode ?? cityInfo.country ?? "Unknown"}`,
      `Coordinates: ${cityInfo.coords.lat}, ${cityInfo.coords.lon}`,
      ...LOCATION_CONFIG.baseUsages,
    ];
  }, [cityInfo]);

  return (
    <DailyEntryDataSource
      icon={Map}
      title={LOCATION_CONFIG.title}
      description={LOCATION_CONFIG.description}
      usages={usages}
      isConnected={isConnected}
      onConnect={handleConnect}
      isLoading={isLoading || !!isBusy}
      // Optional styling props your DataSource component may accept
    />
  );
};

export default DailyEntryLocation;

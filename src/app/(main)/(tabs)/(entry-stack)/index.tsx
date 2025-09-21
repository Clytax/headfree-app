import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { Map, Check } from "lucide-react-native";
import {
  doc,
  getDoc,
  getFirestore,
  setDoc,
  serverTimestamp,
  arrayUnion,
} from "@react-native-firebase/firestore";

// Types
import { DailyEntryStore } from "@/store/global/daily/useDailyEntryStore.types";

// Components
import Text from "@/components/common/Text";
import SafeAreaContainer from "@/components/common/Container/SafeAreaContainer";
import DailyEntryDataSource from "@/components/DailyEntry/DailyEntryDataSource";

// Constants
import { Colors, Sizes } from "@/constants";

// Hooks
import { useUser } from "@/hooks/firebase/useUser";
import useDailyEntryStore from "@/store/global/daily/useDailyEntryStore";

// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";
import DailyEntryChoice from "@/components/DailyEntry/DailyEntryChoice";
import { useAuth } from "@/context/auth/AuthContext";

// Types
interface LocationCoordinates {
  lat: number;
  lon: number;
  latRounded: number;
  lonRounded: number;
}

interface CityInfo {
  city: string | null;
  country: string | null;
  isoCountryCode: string | null;
  admin: string | null;
  coords: LocationCoordinates;
  updatedAt: string;
}

interface EntryChoice {
  value: number;
  label: string;
}

// Constants
const COORDINATE_PRECISION = 2;
const CURRENT_DATE_ISO = new Date().toISOString().split("T")[0];

const DAILY_ENTRY_CHOICES = {
  stress: {
    title: "Stress Level",
    description: "How stressed did you feel today?",
    choices: [
      { value: 1, label: "😌 Very Low" },
      { value: 2, label: "🙂 Low" },
      { value: 3, label: "😐 Moderate" },
      { value: 4, label: "😟 High" },
      { value: 5, label: "😫 Very High" },
    ] as EntryChoice[],
  },
  water: {
    title: "Water Intake",
    description: "How many liters of water did you drink?",
    choices: [
      { value: 0, label: "💧 <1L" },
      { value: 1, label: "💧 1–2L" },
      { value: 2, label: "💧 2–3L" },
      { value: 3, label: "💧 3L+" },
    ] as EntryChoice[],
  },
  caffeine: {
    title: "Caffeine Consumption",
    description: "How much caffeine did you consume?",
    choices: [
      { value: 0, label: "☕ None" },
      { value: 1, label: "☕ 1–2 cups" },
      { value: 2, label: "☕ 3+ cups" },
    ] as EntryChoice[],
  },
  neckPain: {
    title: "Neck Pain",
    description: "Did you experience neck pain today?",
    choices: [
      { value: 0, label: "😃 None" },
      { value: 1, label: "😣 Mild" },
      { value: 2, label: "😭 Severe" },
    ] as EntryChoice[],
  },
  meals: {
    title: "Meal Count",
    description: "How many meals did you have?",
    choices: [
      { value: 0, label: "🍽 None" },
      { value: 1, label: "🍽 1 meal" },
      { value: 2, label: "🍽 2 meals" },
      { value: 3, label: "🍽 3 meals" },
      { value: 4, label: "🍽 4+ meals" },
    ] as EntryChoice[],
  },
} as const;

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

/**
 * Professional Daily Entry Component
 * Handles user's daily health and wellness data collection
 */
const DailyEntry: React.FC = () => {
  const router = useRouter();
  const user = useUser();
  const uid = useAuth().user?.uid;
  const updateEntryStore = useDailyEntryStore(
    (state) => state.updateEntryStore
  );
  const fullStore = useDailyEntryStore((state) => state);

  // Local state
  const [isLocationConnected, setIsLocationConnected] = useState(false);
  const [cityInfo, setCityInfo] = useState<CityInfo | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Find today's entry from user data
   */
  const todaysEntry = useMemo(() => {
    const dailies = user?.data?.dailies || [];
    return dailies.find((e: any) => e?.date === CURRENT_DATE_ISO) || null;
  }, [user?.data?.dailies]);

  /**
   * Rounds coordinate to specified decimal places
   */
  const roundCoordinate = useCallback(
    (coordinate: number, decimals = COORDINATE_PRECISION): number => {
      const multiplier = Math.pow(10, decimals);
      return Math.round(coordinate * multiplier) / multiplier;
    },
    []
  );

  /**
   * Prefill store if an entry for today exists
   */
  useEffect(() => {
    if (!todaysEntry) return;

    updateEntryStore("water", todaysEntry?.water ?? null);
    updateEntryStore("stress", todaysEntry?.stress ?? null);
    updateEntryStore("caffeine", todaysEntry?.caffeine ?? null);
    updateEntryStore("neckPain", todaysEntry?.neckPain ?? null);
    updateEntryStore("meals", todaysEntry?.meals ?? null);
    updateEntryStore("location", todaysEntry?.location ?? null);

    if (todaysEntry?.location?.coords) {
      setIsLocationConnected(true);
      setCityInfo({
        city: todaysEntry.location.city ?? null,
        country: todaysEntry.location.country ?? null,
        isoCountryCode: todaysEntry.location.isoCountryCode ?? null,
        admin: todaysEntry.location.admin ?? null,
        coords: todaysEntry.location.coords,
        updatedAt: todaysEntry.location.updatedAt ?? new Date().toISOString(),
      });
    }
  }, [todaysEntry, updateEntryStore]);

  /**
   * Handles entry value changes with toggle functionality
   */
  const handleEntryChange = useCallback(
    (key: keyof DailyEntryStore, value: any) => {
      if (isSubmitting) return;
      const newValue = (fullStore as any)[key] === value ? null : value;
      updateEntryStore(key, newValue);
    },
    [fullStore, updateEntryStore, isSubmitting]
  );

  /**
   * Requests location permissions and retrieves user's location data
   */
  const requestLocationData =
    useCallback(async (): Promise<CityInfo | null> => {
      try {
        // Request permissions
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

        // Get current position
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          mayShowUserSettingsDialog: true,
        });

        const { latitude, longitude } = position.coords;

        // Reverse geocode to get address information
        const places = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        const primaryPlace = places[0];
        if (!primaryPlace) return null;

        const info: CityInfo = {
          city:
            primaryPlace.city ||
            primaryPlace.district ||
            primaryPlace.subregion ||
            primaryPlace.name ||
            null,
          country: primaryPlace.country ?? null,
          isoCountryCode: primaryPlace.isoCountryCode ?? null,
          admin: primaryPlace.region ?? primaryPlace.subregion ?? null,
          coords: {
            lat: latitude,
            lon: longitude,
            latRounded: roundCoordinate(latitude),
            lonRounded: roundCoordinate(longitude),
          },
          updatedAt: new Date().toISOString(),
        };

        return info;
      } catch (error) {
        console.error("Location request failed:", error);
        throw error;
      }
    }, [roundCoordinate]);

  /**
   * Handles location connection process
   */
  const handleLocationConnect = useCallback(async () => {
    if (isLoadingLocation || isSubmitting) return;

    setIsLoadingLocation(true);

    try {
      const locationData = await requestLocationData();
      if (!locationData) return;

      // Update store with location data
      updateEntryStore("location", {
        city: locationData.city,
        country: locationData.country,
        isoCountryCode: locationData.isoCountryCode,
        admin: locationData.admin,
        coords: locationData.coords,
        updatedAt: locationData.updatedAt,
      });

      setCityInfo(locationData);
      setIsLocationConnected(true);
    } catch (error) {
      Alert.alert("Location Error", LOCATION_CONFIG.errors.general);
    } finally {
      setIsLoadingLocation(false);
    }
  }, [isLoadingLocation, isSubmitting, requestLocationData, updateEntryStore]);

  /**
   * Checks if user has already submitted an entry today
   */
  const hasSubmittedToday = useMemo((): boolean => {
    const dailyEntries = user?.data?.dailies || [];
    return dailyEntries.some((entry: any) => entry.date === CURRENT_DATE_ISO);
  }, [user?.data?.dailies]);

  /**
   * Checks if the form has enough data to submit
   */
  const isFormValid = useMemo((): boolean => {
    const requiredFields = [fullStore.stress, fullStore.water, fullStore.meals];
    return requiredFields.some(
      (field) => field !== null && field !== undefined
    );
  }, [fullStore.stress, fullStore.water, fullStore.meals]);

  /**
   * Calculates completion percentage for visual feedback
   */
  const completionPercentage = useMemo((): number => {
    const allFields = [
      fullStore.stress,
      fullStore.water,
      fullStore.caffeine,
      fullStore.neckPain,
      fullStore.meals,
      fullStore.location,
    ];
    const completedFields = allFields.filter(
      (field) => field !== null && field !== undefined
    ).length;
    return Math.round((completedFields / allFields.length) * 100);
  }, [fullStore]);

  /**
   * Handles creating a new entry
   */
  const handleSubmit = useCallback(async () => {
    if (!isFormValid) {
      Alert.alert(
        "Incomplete Entry",
        "Please fill out at least your stress level, water intake, and meal count to continue."
      );
      return;
    }

    if (hasSubmittedToday) {
      Alert.alert(
        "Already Submitted",
        "You have already submitted an entry for today. You can update it anytime.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Update Entry",
            onPress: () => onUpdate(),
          },
        ]
      );
      return;
    }

    if (!uid) {
      Alert.alert(
        "Auth",
        "You need to be signed in to submit your daily entry."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const allValues = {
        water: (fullStore as any)?.water ?? null,
        stress: (fullStore as any)?.stress ?? null,
        caffeine: (fullStore as any)?.caffeine ?? null,
        neckPain: (fullStore as any)?.neckPain ?? null,
        meals: (fullStore as any)?.meals ?? null,
        location: (fullStore as any)?.location ?? null,
      };

      const db = getFirestore();
      const userRef = doc(db, "users", uid);

      await setDoc(
        userRef,
        {
          dailies: arrayUnion({
            ...allValues,
            date: CURRENT_DATE_ISO,
            createdAt: Date.now(), // not serverTimestamp inside array
          }),
          updatedAt: serverTimestamp(), // top level is fine
        },
        { merge: true }
      );

      Alert.alert("Saved", "Your entry for today has been saved.");
    } catch (err) {
      console.error("Failed to save daily entry", err);
      const message = err instanceof Error ? err.message : String(err);
      Alert.alert("Error", `Failed to save daily entry. ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [isFormValid, hasSubmittedToday, fullStore, uid]);

  /**
   * Generates location usage display information
   */
  const locationUsages = useMemo((): string[] => {
    if (!cityInfo) return LOCATION_CONFIG.baseUsages;

    return [
      `City: ${cityInfo.city ?? "Unknown"}`,
      `Country: ${cityInfo.isoCountryCode ?? cityInfo.country ?? "Unknown"}`,
      `Coordinates: ${cityInfo.coords.latRounded}, ${cityInfo.coords.lonRounded}`,
      ...LOCATION_CONFIG.baseUsages,
    ];
  }, [cityInfo]);

  /**
   * Updates an existing entry for today
   */
  const onUpdate = useCallback(async () => {
    if (!uid) {
      Alert.alert("Auth", "You need to be signed in to update your entry.");
      return;
    }

    if (!isFormValid) {
      Alert.alert(
        "Incomplete Entry",
        "Please fill out at least your stress level, water intake, and meal count to continue."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const db = getFirestore();
      const userRef = doc(db, "users", uid);
      const snap = await getDoc(userRef);

      if (!snap.exists) {
        throw new Error("User document not found");
      }

      const data = snap.data() || {};
      const dailies: any[] = Array.isArray(data.dailies) ? data.dailies : [];

      const updatedEntry = {
        water: (fullStore as any)?.water ?? null,
        stress: (fullStore as any)?.stress ?? null,
        caffeine: (fullStore as any)?.caffeine ?? null,
        neckPain: (fullStore as any)?.neckPain ?? null,
        meals: (fullStore as any)?.meals ?? null,
        location: (fullStore as any)?.location ?? null,
        date: CURRENT_DATE_ISO,
        updatedAt: Date.now(),
        createdAt:
          dailies.find((e) => e?.date === CURRENT_DATE_ISO)?.createdAt ||
          Date.now(),
      };

      const nextDailies = (() => {
        const idx = dailies.findIndex((e) => e?.date === CURRENT_DATE_ISO);
        if (idx === -1) return [...dailies, updatedEntry];
        const copy = [...dailies];
        copy[idx] = { ...dailies[idx], ...updatedEntry };
        return copy;
      })();

      await setDoc(
        userRef,
        {
          dailies: nextDailies,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      Alert.alert("Updated", "Your entry for today has been updated.");
    } catch (err) {
      console.error("Failed to update daily entry", err);
      const message = err instanceof Error ? err.message : String(err);
      Alert.alert("Error", `Failed to update daily entry. ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [uid, fullStore, isFormValid]);
  return (
    <SafeAreaContainer style={styles.container}>
      <Text fontWeight="bold" fontSize={getFontSize(24)} textCenter>
        Daily Health Entry
      </Text>
      {hasSubmittedToday && (
        <Text
          fontSize={getFontSize(14)}
          color={Colors.success700}
          textCenter
          style={{ paddingHorizontal: Sizes.containerPaddingHorizontal * 2 }}
        >
          You have already submitted an entry for today. You can update it
          anytime.
        </Text>
      )}

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Health Metrics */}
        {Object.entries(DAILY_ENTRY_CHOICES).map(([key, config]) => (
          <DailyEntryChoice
            key={key}
            title={config.title}
            description={config.description}
            choices={config.choices}
            onChange={(value) =>
              handleEntryChange(key as keyof DailyEntryStore, value)
            }
            value={(fullStore as any)[key as keyof DailyEntryStore]}
            isLoading={isSubmitting}
          />
        ))}

        {/* Location Data Source */}
        <DailyEntryDataSource
          icon={Map}
          title={LOCATION_CONFIG.title}
          description={LOCATION_CONFIG.description}
          usages={locationUsages}
          isConnected={isLocationConnected}
          onConnect={handleLocationConnect}
          isLoading={isLoadingLocation || isSubmitting}
        />
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[
            styles.fab,
            isFormValid && !isSubmitting
              ? styles.fabActive
              : styles.fabInactive,
          ]}
          onPress={hasSubmittedToday ? onUpdate : handleSubmit}
          activeOpacity={0.8}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Text style={styles.progressText} color={Colors.white}>
              <ActivityIndicator size="small" color={Colors.white} />
            </Text>
          ) : (
            <Check
              size={24}
              color={isFormValid ? Colors.white : Colors.neutral300}
            />
          )}
          {completionPercentage > 0 && !isSubmitting && (
            <View style={styles.progressBadge}>
              <Text style={styles.progressText} color={Colors.textDark}>
                {completionPercentage}%
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaContainer>
  );
};

export default DailyEntry;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
    paddingHorizontal: Sizes.containerPaddingHorizontal * 2,
    gap: hp(2.5),
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Sizes.containerPaddingHorizontal,
    gap: hp(2),
    paddingBottom: hp(10), // Extra space for FAB
  },
  fabContainer: {
    position: "absolute",
    bottom: hp(3),
    right: wp(5),
    zIndex: 1000,
  },
  fab: {
    width: hp(7),
    height: hp(7),
    borderRadius: hp(3.5),
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  fabActive: {
    backgroundColor: Colors.primary || "#007AFF",
  },
  fabInactive: {
    backgroundColor: Colors.neutral700 || "#8E8E93",
  },
  progressBadge: {
    position: "absolute",
    top: -hp(0.5),
    right: -wp(1),
    backgroundColor: Colors.success700 || "#34C759",
    borderRadius: hp(1),
    paddingHorizontal: wp(1.5),
    paddingVertical: hp(0.3),
    minWidth: wp(6),
  },
  progressText: {
    fontSize: getFontSize(10),
    fontWeight: "bold",
    textAlign: "center",
  },
});

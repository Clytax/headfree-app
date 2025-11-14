// components/DailyEntry/DailyEntryLocation.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Linking,
  Modal,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  Text as RNText,
} from "react-native";
import * as Location from "expo-location";
import { Map } from "lucide-react-native";

import DailyEntryDataSource from "@/components/DailyEntry/DailyEntryDataSource";
import { Colors, Sizes } from "@/constants";
import { wp, hp } from "@/utils/ui/sizes";
import Text from "@/components/common/Text";

// NOTE: This implementation uses OpenStreetMap Nominatim (no API key).
// It provides a simple autocomplete / search endpoint suitable for manual entry.
// Requirements: add a proper User-Agent header (app name + contact) to be polite and avoid blocking.

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
    geocode: "Could not resolve that address. Try a different query.",
  },
} as const;

function roundCoordinate(value: number, decimals = COORDINATE_PRECISION) {
  const m = Math.pow(10, decimals);
  return Math.round(value * m) / m;
}

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "NauraApp/1.0 (dev@example.com)"; // <-- replace with your app name + contact

const DailyEntryLocation: React.FC<Props> = ({ value, onChange, isBusy }) => {
  const [isConnected, setIsConnected] = useState<boolean>(!!value);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cityInfo, setCityInfo] = useState<CityInfo | null>(value ?? null);

  // manual modal state
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [addressQuery, setAddressQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  // preview of the current results (shows after search)
  const [preview, setPreview] = useState<any | null>(null);

  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    setCityInfo(value ?? null);
    setIsConnected(!!value);
  }, [value]);

  const resetManualState = useCallback(() => {
    setAddressQuery("");
    setResults([]);
    setSearching(false);
    setPreview(null);
  }, []);

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
    } catch (e) {
      Alert.alert("Location Error", LOCATION_CONFIG.errors.general);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isBusy, onChange, requestLocationData]);

  const handleDisconnect = useCallback(() => {
    setCityInfo(null);
    setIsConnected(false);
    resetManualState();
    setManualModalVisible(false);
    onChange(null);
  }, [onChange, resetManualState]);

  const openManualPicker = useCallback(() => {
    resetManualState();
    setManualModalVisible(true);
  }, [resetManualState]);

  // Nominatim-based search (debounced)
  const performGeocode = useCallback(async (query: string) => {
    if (!query || query.trim().length === 0) {
      setResults([]);
      setPreview(null);
      return;
    }

    // clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // debounce to avoid spamming the public API
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const url = `${NOMINATIM_BASE}?q=${encodeURIComponent(
          query
        )}&format=json&addressdetails=1&limit=7&accept-language=en`;
        const res = await fetch(url, {
          headers: {
            "User-Agent": USER_AGENT,
            Referer: Platform.OS === "web" ? window.location.origin : "",
          },
        });

        if (!res.ok) {
          console.error("Nominatim returned non-OK", res.status);
          setResults([]);
          setPreview(null);
          Alert.alert("Error", LOCATION_CONFIG.errors.geocode);
          return;
        }

        const data = await res.json();
        // data is an array of results
        const list = Array.isArray(data) ? data : [];
        setResults(list);
        // set a preview so user can immediately see first match
        setPreview(list.length > 0 ? list[0] : null);

        if (!data || data.length === 0) {
          Alert.alert("No results", LOCATION_CONFIG.errors.geocode);
        }
      } catch (err) {
        console.error("Nominatim search failed", err);
        Alert.alert("Error", LOCATION_CONFIG.errors.geocode);
        setResults([]);
        setPreview(null);
      } finally {
        setSearching(false);
      }
    }, 350);
  }, []);

  // pick a Nominatim result and normalize into CityInfo
  const pickResult = useCallback(
    (r: any) => {
      try {
        // r example fields: lat, lon, display_name, address: { city, town, village, county, state, country, country_code }
        const lat = r.lat != null ? parseFloat(r.lat) : null;
        const lon = r.lon != null ? parseFloat(r.lon) : null;
        const addr = r.address || {};

        const city =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.hamlet ||
          addr.county ||
          null;
        const country = addr.country || null;
        const iso = addr.country_code ? addr.country_code.toUpperCase() : null;
        const admin = addr.state || addr.region || null;

        if (lat == null || lon == null) {
          Alert.alert("Invalid result", "Selected result has no coordinates.");
          return;
        }

        const info: CityInfo = {
          city,
          country,
          isoCountryCode: iso,
          admin,
          coords: { lat: roundCoordinate(lat), lon: roundCoordinate(lon) },
          updatedAt: new Date().toISOString(),
        };

        setCityInfo(info);
        setIsConnected(true);
        resetManualState();
        setManualModalVisible(false);
        onChange(info);
      } catch (err) {
        console.error("pickResult failed", err);
        Alert.alert("Error", LOCATION_CONFIG.errors.general);
      }
    },
    [onChange, resetManualState]
  );

  const applyPreview = useCallback(() => {
    if (!preview) return;
    pickResult(preview);
  }, [preview, pickResult]);

  const renderPreview = () => {
    if (!preview) return null;
    const addr = preview.address || {};
    const labelParts: string[] = [];
    if (addr.road) labelParts.push(addr.road);
    if (addr.city) labelParts.push(addr.city);
    if (addr.town) labelParts.push(addr.town);
    if (addr.state) labelParts.push(addr.state);
    if (addr.country) labelParts.push(addr.country);
    const label = labelParts.join(", ") || preview.display_name || "Unknown";

    const lat = preview.lat;
    const lon = preview.lon;
    const coordLabel =
      lat != null && lon != null
        ? `${roundCoordinate(parseFloat(lat))}, ${roundCoordinate(
            parseFloat(lon)
          )}`
        : "No coords";

    return (
      <View style={styles.previewCard}>
        <View style={{ flex: 1 }}>
          <RNText style={styles.previewLabel} numberOfLines={2}>
            {label}
          </RNText>
          <RNText style={styles.previewCoords}>{coordLabel}</RNText>
        </View>
        <View style={styles.previewActions}>
          <TouchableOpacity
            onPress={applyPreview}
            style={[styles.actionBtn, styles.confirmBtn]}
            activeOpacity={0.8}
          >
            <Text fontWeight="bold" color={Colors.white}>
              Use
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
    <>
      <DailyEntryDataSource
        icon={Map}
        title={LOCATION_CONFIG.title}
        description={LOCATION_CONFIG.description}
        usages={usages}
        isConnected={isConnected}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        isLoading={isLoading || !!isBusy}
        onManualEntry={openManualPicker}
      />

      <Modal
        visible={manualModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setManualModalVisible(false);
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text fontWeight="bold" fontSize={18} style={styles.title}>
              Pick address
            </Text>

            <View style={styles.searchRow}>
              <TextInput
                value={addressQuery}
                onChangeText={(t) => {
                  setAddressQuery(t);
                  performGeocode(t);
                }}
                placeholder="Type address, city or postcode"
                placeholderTextColor={Colors.neutral400}
                style={styles.searchInput}
                returnKeyType="search"
                editable={!searching}
              />
              <TouchableOpacity
                onPress={() => performGeocode(addressQuery)}
                style={styles.searchButton}
                activeOpacity={0.8}
              >
                <Text fontWeight="bold" color={Colors.white}>
                  Search
                </Text>
              </TouchableOpacity>
            </View>

            {/* preview of first result so user immediately sees a candidate */}
            {renderPreview()}

            <View style={styles.resultsWrap}>
              {results.length === 0 ? (
                <View style={styles.empty}>
                  <RNText style={{ color: Colors.neutral400 }}>
                    No results yet. Try searching an address or place.
                  </RNText>
                </View>
              ) : (
                <FlatList
                  data={results}
                  keyExtractor={(item, idx) =>
                    item.place_id ? String(item.place_id) : String(idx)
                  }
                  renderItem={({ item }) => {
                    const addr = item.address || {};
                    const labelParts: string[] = [];
                    if (addr.road) labelParts.push(addr.road);
                    if (addr.city) labelParts.push(addr.city);
                    if (addr.town) labelParts.push(addr.town);
                    if (addr.state) labelParts.push(addr.state);
                    if (addr.country) labelParts.push(addr.country);
                    const label =
                      labelParts.join(", ") || item.display_name || "Unknown";

                    const lat = item.lat;
                    const lon = item.lon;
                    const coordLabel =
                      lat != null && lon != null
                        ? `${roundCoordinate(
                            parseFloat(lat)
                          )}, ${roundCoordinate(parseFloat(lon))}`
                        : "No coords";

                    return (
                      <TouchableOpacity
                        onPress={() => pickResult(item)}
                        onLongPress={() => setPreview(item)}
                        style={styles.resultItem}
                        activeOpacity={0.8}
                      >
                        <View style={styles.resultTextWrap}>
                          <RNText style={styles.resultLabel} numberOfLines={2}>
                            {label}
                          </RNText>
                          <RNText style={styles.resultCoords}>
                            {coordLabel}
                          </RNText>
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                />
              )}
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={() => {
                  setManualModalVisible(false);
                }}
                style={[styles.actionBtn, styles.cancelBtn]}
                activeOpacity={0.8}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (results.length > 0) {
                    pickResult(results[0]);
                    return;
                  }
                  performGeocode(addressQuery);
                }}
                style={[styles.actionBtn, styles.confirmBtn]}
                activeOpacity={0.8}
              >
                <Text fontWeight="bold" color={Colors.white}>
                  {results.length > 0 ? "Use first" : "Search"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default DailyEntryLocation;

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: Colors.blackTransparent,
    justifyContent: "center",
    alignItems: "center",
    padding: Sizes.containerPaddingHorizontal,
  },
  modalContainer: {
    width: "100%",
    maxHeight: "85%",
    backgroundColor: Colors.backgroundLighter,
    borderRadius: Sizes.mediumRadius,
    padding: Sizes.containerPaddingHorizontal,
    shadowColor: Colors.black,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    textAlign: "center",
    marginBottom: hp(1),
  },
  searchRow: {
    flexDirection: "row",
    gap: wp(2),
    marginBottom: hp(1),
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Sizes.smallRadius || 8,
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  searchButton: {
    marginLeft: wp(2),
    paddingHorizontal: wp(3),
    justifyContent: "center",
    backgroundColor: Colors.primary500,
    borderRadius: Sizes.smallRadius || 8,
  },
  resultsWrap: {
    flex: 1,
    marginBottom: hp(1),
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    padding: hp(3),
  },
  resultItem: {
    paddingVertical: hp(1),
    paddingHorizontal: wp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral800,
  },
  resultTextWrap: {
    flexDirection: "column",
  },
  resultLabel: {
    color: Colors.text,
    fontSize: 14,
    marginBottom: hp(0.25),
  },
  resultCoords: {
    color: Colors.neutral400,
    fontSize: 12,
  },
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: wp(3),
    backgroundColor: Colors.background,
    borderRadius: Sizes.smallRadius || 8,
    marginBottom: hp(1),
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewLabel: {
    color: Colors.text,
    fontSize: 15,
    marginBottom: hp(0.25),
  },
  previewCoords: {
    color: Colors.neutral400,
    fontSize: 12,
  },
  previewActions: {
    marginLeft: wp(2),
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: wp(2),
    marginTop: hp(1),
  },
  actionBtn: {
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    borderRadius: Sizes.smallRadius || 8,
  },
  cancelBtn: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  confirmBtn: {
    backgroundColor: Colors.primary500,
  },
});

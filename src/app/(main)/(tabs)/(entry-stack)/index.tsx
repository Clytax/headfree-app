import React, { use, useCallback, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import {
  doc,
  getDoc,
  getFirestore,
  setDoc,
  serverTimestamp,
  deleteDoc,
} from "@react-native-firebase/firestore";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useFocusEffect, useRoute } from "@react-navigation/native"; // <-- added useRoute
import Text from "@/components/common/Text";
import SafeAreaContainer from "@/components/common/Container/SafeAreaContainer";
import DailyEntryChoice from "@/components/DailyEntry/DailyEntryChoice";
import DailyEntryLocation from "@/components/DailyEntry/DailyEntryLocation";
import DailyEntrySleep from "@/components/DailyEntry/DailyEntrySleep";
import DailyEntryMenstruationCycle from "@/components/DailyEntry/DailyEntryMenstruationCycle";
import { Colors, Sizes } from "@/constants";
import { getFontSize } from "@/utils/text/fonts";
import { wp, hp } from "@/utils/ui/sizes";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Trash2,
} from "lucide-react-native";
import { useUser } from "@/hooks/firebase/useUser";
import useDailyEntryStore from "@/store/global/daily/useDailyEntryStore";
import { useAuth } from "@/context/auth/AuthContext";

import { FACTORS } from "@/services/dailyFactors";
import { useDailyEntryForm } from "@/hooks/useDailyEntryForm";
import { useTodayEntry } from "@/hooks/firebase/useDailyEntry";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";
import { useRouter } from "expo-router";

// helpers
const toISODate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0"); // month is 0-indexed
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const addDays = (d: Date, days: number) => {
  const x = new Date(d);
  // preserve local time and just change the day
  x.setDate(x.getDate() + days);
  return x;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// Parse a variety of date string formats, prefer YYYY-MM-DD local date
const parseSelectedDateParam = (val: unknown): Date | null => {
  if (!val) return null;
  if (val instanceof Date && !isNaN(val.getTime())) return val;
  if (typeof val === "string") {
    // prefer plain YYYY-MM-DD to avoid timezone surprises
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const [y, m, d] = val.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  // numbers (timestamp)
  if (typeof val === "number" && !isNaN(val)) {
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return null;
};

// inline date header component
const DateHeader = ({
  date,
  onChange,
}: {
  date: Date;
  onChange: (d: Date) => void;
}) => {
  const [isPickerVisible, setPickerVisible] = useState(false);
  const today = new Date();

  const openPicker = () => setPickerVisible(true);
  const closePicker = () => setPickerVisible(false);

  const handleConfirm = (selected: Date) => {
    closePicker();
    if (selected) onChange(selected);
  };

  return (
    <View style={styles.dateHeader}>
      <TouchableOpacity
        onPress={() => onChange(addDays(date, -1))}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <ChevronLeft size={24} color={Colors.whiteTransparent} />
      </TouchableOpacity>

      <TouchableOpacity onPress={openPicker} style={styles.dateCenter}>
        <Text fontWeight="bold">{toISODate(date)}</Text>
        <View style={styles.dateSubRow}>
          <CalendarIcon size={16} color={Colors.neutral400} />
          <Text color={Colors.neutral400}>tap to pick</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onChange(addDays(date, 1))}
        disabled={isSameDay(date, today)}
        style={{ opacity: isSameDay(date, today) ? 0.4 : 1 }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <ChevronRight size={24} color={Colors.whiteTransparent} />
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isPickerVisible}
        mode="date"
        date={date}
        // optional limits:
        maximumDate={today}
        onConfirm={handleConfirm}
        onCancel={closePicker}
        pickerStyleIOS={{
          alignItems: "center",
        }}
      />
    </View>
  );
};

const DailyEntry: React.FC = () => {
  const user = useUser();
  const uid = useAuth().user?.uid;

  // Factor visibility settings (optional factors can be hidden)
  const factorVisibility = useMemo<Record<string, boolean>>(() => {
    const raw = ((user?.data as any)?.settings?.factorVisibility ??
      {}) as Record<string, boolean>;
    return raw;
  }, [user?.data]);

  const visibleChoiceFactors = useMemo(
    () =>
      FACTORS.filter((f) => f.kind === "choice" && f.choices).filter(
        (f) => factorVisibility[f.key] !== false // default: visible
      ),
    [factorVisibility]
  );
  const hiddenFactorsCount = useMemo(() => {
    // only count choice factors that can actually be shown/hidden
    return FACTORS.filter(
      (f) =>
        f.kind === "choice" && f.choices && factorVisibility[f.key] === false
    ).length;
  }, [factorVisibility]);

  const updateEntryStore = useDailyEntryStore((s) => s.updateEntryStore);
  const resetStore = useDailyEntryStore((s) => s.reset);
  const lastDate = useDailyEntryStore((s) => s.lastDate);
  const setLastDate = useDailyEntryStore((s) => s.setLastDate);
  const fullStore = useDailyEntryStore((s) => s);

  // selected date state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const SELECTED_ISO = useMemo(() => toISODate(selectedDate), [selectedDate]);

  // read route params
  const route = useRoute();
  const router = useRouter();
  const routeParams = (route as any)?.params;

  // Track which item is expanded
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const itemRefs = React.useRef<{ [key: string]: View | null }>({});
  const [showTopIndicator, setShowTopIndicator] = useState(false);
  const [showBottomIndicator, setShowBottomIndicator] = useState(false);

  // always reset to today when this tab/screen gains focus
  useFocusEffect(
    useCallback(() => {
      // reset UI store and expansion state always
      resetStore();
      setExpandedKey(null);

      // if a selectedDate param exists, try to parse and use it
      const param = routeParams?.selectedDate;
      const parsed = parseSelectedDateParam(param);
      if (parsed) {
        setSelectedDate(parsed);
      } else {
        // default behavior: show today
        setSelectedDate(new Date());
      }
    }, [resetStore, routeParams?.selectedDate])
  );

  // use your existing hook for the selected date
  const {
    todaysEntry: selectedEntry,
    hasSubmittedToday: hasEntryForSelectedDate,
    isLoading: isLoadingEntry,
  } = useTodayEntry(SELECTED_ISO);

  // Auto-expand first empty item when data loads
  React.useEffect(() => {
    if (!isLoadingEntry && expandedKey === null) {
      const firstEmptyFactor = visibleChoiceFactors.find(
        (f) => (fullStore as any)[f.key] == null
      );
      if (firstEmptyFactor) {
        setExpandedKey(firstEmptyFactor.key);
        // Scroll to it after a brief delay to ensure layout is complete
        setTimeout(() => {
          scrollToItem(firstEmptyFactor.key);
        }, 100);
      }
    }
  }, [isLoadingEntry, fullStore, expandedKey, visibleChoiceFactors]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  // NEW: copying state for "Same as yesterday" operation
  const [isCopyingYesterday, setIsCopyingYesterday] = useState(false);

  const handleDeleteEntry = useCallback(() => {
    if (!uid) {
      Alert.alert("Auth", "You need to be signed in to delete this entry.");
      return;
    }

    if (!hasEntryForSelectedDate) {
      Alert.alert("No entry", `There is no saved entry for ${SELECTED_ISO}.`);
      return;
    }

    Alert.alert(
      "Delete entry",
      `Are you sure you want to delete your entry for ${SELECTED_ISO}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              const db = getFirestore();
              const entryRef = doc(db, "users", uid, "dailies", TODAY_ISO);

              await deleteDoc(entryRef);

              // optionally bump user updatedAt
              const userRef = doc(db, "users", uid);
              await setDoc(
                userRef,
                { updatedAt: serverTimestamp() },
                { merge: true }
              );

              // clear local form state for this day
              resetStore();
              setExpandedKey(null);

              Alert.alert(
                "Deleted",
                `Your entry for ${SELECTED_ISO} has been deleted.`
              );
            } catch (err) {
              console.error("Failed to delete daily entry", err);
              const message = err instanceof Error ? err.message : String(err);
              Alert.alert("Error", `Failed to delete daily entry. ${message}`);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [
    uid,
    hasEntryForSelectedDate,
    SELECTED_ISO,
    TODAY_ISO,
    resetStore,
    setExpandedKey,
  ]);

  // Handle scroll to update indicators
  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollY = contentOffset.y;
    const scrollHeight = contentSize.height;
    const viewHeight = layoutMeasurement.height;

    // Show top indicator if scrolled down more than 20px
    setShowTopIndicator(scrollY > 20);

    // Show bottom indicator if not at the bottom (with 20px threshold)
    setShowBottomIndicator(scrollY + viewHeight < scrollHeight - 20);
  };

  // Helper to scroll to an item
  const scrollToItem = (key: string) => {
    const ref = itemRefs.current[key];
    if (ref && scrollViewRef.current) {
      ref.measureLayout(
        // @ts-ignore - findNodeHandle is available but types may be incomplete
        scrollViewRef.current.getNativeScrollRef?.() || scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current?.scrollTo({
            y: Math.max(0, y - hp(12)),
            animated: true,
          });
        },
        () => {} // error callback
      );
    }
  };

  // Handle item expansion and auto-advance
  const handleItemExpand = (key: string, shouldExpand: boolean) => {
    if (shouldExpand) {
      setExpandedKey(key);
      setTimeout(() => scrollToItem(key), 100);
    } else {
      setExpandedKey(null);
    }
  };
  const handleReset = useCallback(() => {
    // confirm because reset is destructive
    Alert.alert(
      "Reset",
      "Clear all answers for this day?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            resetStore();
            // optional: reset expanded state and scroll to top
            setExpandedKey(null);
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
          },
        },
      ],
      { cancelable: true }
    );
  }, [resetStore]);
  // make the form hook date aware via overrideTodayISO
  const { TODAY_ISO, handleEntryChange, formValid, percent, pickValues } =
    useDailyEntryForm({
      fullStore,
      updateEntryStore,
      resetStore,
      lastDate,
      setLastDate,
      todaysEntry: selectedEntry,
      gender: user?.data?.profile?.gender || null,
      overrideTodayISO: SELECTED_ISO,
    });

  // save to the selected date
  const saveEntry = useCallback(async () => {
    if (!uid) {
      Alert.alert(
        "Auth",
        "You need to be signed in to submit your daily entry."
      );
      return;
    }
    if (!formValid) {
      Alert.alert(
        "Incomplete Entry",
        "Please fill out at least your stress level, water intake, and meal count to continue."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const db = getFirestore();
      const entryRef = doc(db, "users", uid, "dailies", TODAY_ISO);
      const existing = await getDoc(entryRef);
      const values = pickValues();
      const now = serverTimestamp();

      if (existing.exists()) {
        const createdAt = existing.data()?.createdAt ?? now;
        await setDoc(
          entryRef,
          {
            ...values,
            date: TODAY_ISO,
            createdAt,
            updatedAt: now,
          },
          { merge: true }
        );
        Alert.alert("Updated", `Your entry for ${TODAY_ISO} has been updated.`);
      } else {
        await setDoc(entryRef, {
          ...values,
          date: TODAY_ISO,
          createdAt: now,
          updatedAt: now,
        });
        Alert.alert("Saved", `Your entry for ${TODAY_ISO} has been saved.`);
      }

      const userRef = doc(db, "users", uid);
      await setDoc(userRef, { updatedAt: serverTimestamp() }, { merge: true });
    } catch (err) {
      console.error("Failed to write daily entry", err);
      const message = err instanceof Error ? err.message : String(err);
      Alert.alert("Error", `Failed to save daily entry. ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [uid, formValid, pickValues, TODAY_ISO]);

  // NEW: copy values from yesterday into the current form store
  const handleCopyFromYesterday = useCallback(async () => {
    if (!uid) {
      Alert.alert("Auth", "You need to be signed in to copy from yesterday.");
      return;
    }
    setIsCopyingYesterday(true);
    try {
      const yesterdayDate = addDays(selectedDate, -1);
      const yesterdayISO = toISODate(yesterdayDate);
      const db = getFirestore();
      const prevRef = doc(db, "users", uid, "dailies", yesterdayISO);
      const snap = await getDoc(prevRef);

      if (!snap.exists()) {
        Alert.alert("No entry", `No entry found for ${yesterdayISO}.`);
        return;
      }

      const data = snap.data() || {};
      // reset current form then apply values
      resetStore();

      // copy all keys except metadata
      const forbidden = ["date", "createdAt", "updatedAt"];
      Object.entries(data).forEach(([k, v]) => {
        if (!forbidden.includes(k)) {
          // updateEntryStore expects (key, value)
          try {
            updateEntryStore(k as any, v);
          } catch (e) {
            // ignore individual update errors but log
            console.warn("Failed updating key from yesterday", k, e);
          }
        }
      });

      Alert.alert(
        "Copied",
        `Values from ${yesterdayISO} have been copied into ${SELECTED_ISO}.`
      );
    } catch (err) {
      console.error("Error copying yesterday", err);
      const message = err instanceof Error ? err.message : String(err);
      Alert.alert("Error", `Failed to copy from yesterday. ${message}`);
    } finally {
      setIsCopyingYesterday(false);
    }
  }, [uid, selectedDate, resetStore, updateEntryStore, SELECTED_ISO]);

  return (
    <SafeAreaContainer style={styles.container}>
      <View style={styles.header}>
        <Text fontWeight="bold" fontSize={getFontSize(24)} textCenter>
          Daily Health Entry
        </Text>
        <MyTouchableOpacity
          onPress={() => router.push("/(main)/faq")}
          style={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            alignSelf: "center",
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Navigate to FAQ"
          accessibilityHint="Opens the Frequently Asked Questions page"
          accessibilityIdentifier="faq-button"
        >
          <Text fontSize={getFontSize(14)} color={Colors.primary}>
            Questions? Visit our FAQ.
          </Text>
        </MyTouchableOpacity>
      </View>

      <DateHeader date={selectedDate} onChange={setSelectedDate} />

      {/* NEW: Same as yesterday button */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          onPress={handleReset}
          style={[styles.actionButton, styles.actionButtonOutline]}
          activeOpacity={0.8}
          disabled={isSubmitting || isCopyingYesterday}
        >
          <Text style={styles.actionButtonText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCopyFromYesterday}
          style={[
            styles.actionButton,
            styles.actionButtonPrimary,
            isCopyingYesterday || isSubmitting
              ? styles.actionButtonDisabled
              : null,
          ]}
          activeOpacity={0.8}
          disabled={isCopyingYesterday || isSubmitting || !uid}
        >
          {isCopyingYesterday ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.actionButtonText}>Same as yesterday</Text>
          )}
        </TouchableOpacity>
      </View>

      {hasEntryForSelectedDate && (
        <Text
          fontSize={getFontSize(14)}
          color={Colors.success700}
          textCenter
          style={{ paddingHorizontal: Sizes.containerPaddingHorizontal * 2 }}
        >
          You have already submitted an entry for {SELECTED_ISO}. You can update
          it anytime.
        </Text>
      )}

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {visibleChoiceFactors.map((f) => (
          <View
            key={f.key}
            ref={(ref) => {
              itemRefs.current[f.key] = ref;
            }}
            collapsable={false}
          >
            <DailyEntryChoice
              title={f.title || String(f.key)}
              description={f.description || ""}
              choices={f.choices!}
              onChange={(value) => {
                handleEntryChange(f.key as any, value, isSubmitting);
                // Auto-advance to next empty item after selection
                // Auto-advance to next empty *visible* item after selection
                setTimeout(() => {
                  const currentIndex = visibleChoiceFactors.findIndex(
                    (factor) => factor.key === f.key
                  );
                  const remainingFactors = visibleChoiceFactors.slice(
                    currentIndex + 1
                  );
                  const nextEmptyFactor = remainingFactors.find(
                    (factor) => (fullStore as any)[factor.key] == null
                  );
                  if (nextEmptyFactor) {
                    setExpandedKey(nextEmptyFactor.key);
                    setTimeout(() => scrollToItem(nextEmptyFactor.key), 100);
                  } else {
                    setExpandedKey(null);
                  }
                }, 300);
              }}
              value={(fullStore as any)[f.key]}
              isLoading={isSubmitting || isLoadingEntry}
              expanded={expandedKey === f.key}
              onToggleExpand={(shouldExpand) =>
                handleItemExpand(f.key, shouldExpand)
              }
            />
          </View>
        ))}

        <DailyEntrySleep />

        <DailyEntryLocation
          value={(fullStore as any)?.location ?? null}
          isBusy={isSubmitting}
          onChange={(info: any) => {
            updateEntryStore("location" as any, info);
          }}
        />

        {user?.data?.profile?.gender === "female" && (
          <DailyEntryMenstruationCycle />
        )}
        {hiddenFactorsCount > 0 && (
          <View style={styles.hiddenInfoRow}>
            <Text
              fontSize={getFontSize(12)}
              color={Colors.neutral400}
              style={{ marginRight: wp(2) }}
            >
              {hiddenFactorsCount} factor
              {hiddenFactorsCount > 1 ? "s" : ""} hidden.
            </Text>

            <MyTouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(main)/(tabs)/(account-stack)/settings",
                  params: { scrollTo: "factors" },
                })
              }
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text fontSize={getFontSize(12)} color={Colors.primary}>
                Manage in Settings
              </Text>
            </MyTouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Scroll Indicators */}
      {/* {showTopIndicator && (
        <View style={styles.topIndicator}>
          <View style={styles.indicatorLine} />
          <Text fontSize={getFontSize(12)} color={Colors.neutral400}>
            More above ↑
          </Text>
        </View>
      )} */}

      <View style={styles.fabContainer}>
        <View
          style={[
            styles.fabRow,
            {
              justifyContent: hasEntryForSelectedDate
                ? "space-between"
                : "flex-end",
            },
          ]}
        >
          {/* Floating trash – only when there is an entry for this day */}
          {hasEntryForSelectedDate && (
            <TouchableOpacity
              style={[styles.fab, styles.fabTrash]}
              onPress={handleDeleteEntry}
              activeOpacity={0.8}
              disabled={isSubmitting || isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Trash2 size={22} color={Colors.white} />
              )}
            </TouchableOpacity>
          )}

          {/* Existing floating checkmark */}
          <TouchableOpacity
            style={[
              styles.fab,
              formValid && !isSubmitting
                ? styles.fabActive
                : styles.fabInactive,
            ]}
            onPress={saveEntry}
            activeOpacity={0.8}
            disabled={isSubmitting || isDeleting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Check
                size={24}
                color={formValid ? Colors.white : Colors.neutral300}
              />
            )}
            {percent > 0 && !isSubmitting && !isDeleting && (
              <View style={styles.progressBadge}>
                <Text style={styles.progressText} color={Colors.textDark}>
                  {percent}%
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
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
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: hp(1),
    paddingHorizontal: Sizes.containerPaddingHorizontal,
  },
  dateCenter: {
    alignItems: "center",
  },
  dateSubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  // NEW styles for copy row / button
  copyRow: {
    paddingHorizontal: Sizes.containerPaddingHorizontal,
    alignItems: "center",
    marginBottom: hp(0.5),
  },
  hiddenInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Sizes.containerPaddingHorizontal,
    paddingBottom: hp(1),
  },

  copyButton: {
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3),
    borderRadius: 8,
    backgroundColor: Colors.primary || "#007AFF",
    minWidth: wp(40),
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  copyButtonDisabled: {
    opacity: 0.7,
  },
  copyButtonText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: getFontSize(12),
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Sizes.containerPaddingHorizontal,
    gap: hp(2),
    paddingBottom: hp(10),
  },
  fabContainer: {
    position: "absolute",
    bottom: hp(3),
    zIndex: 1000,
  },
  fabRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Sizes.containerPaddingHorizontal,
    width: "100%",
  },

  fabTrash: {
    backgroundColor: Colors.error500 || "#FF3B30",
  },
  fab: {
    width: hp(7),
    height: hp(7),
    borderRadius: hp(3.5),
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
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
  topIndicator: {
    position: "absolute",
    opacity: 0.5,
    top: "43%",
    left: 0,
    right: 0,
    alignItems: "center",
    paddingVertical: hp(1),
    backgroundColor: `${Colors.background}dd`,
    backdropFilter: "blur(10px)",
  },
  bottomIndicator: {
    position: "absolute",
    bottom: hp(12),
    left: 0,
    right: 0,
    alignItems: "center",
    paddingVertical: hp(1),
    backgroundColor: `${Colors.background}dd`,
    backdropFilter: "blur(10px)",
  },
  indicatorLine: {
    width: wp(20),
    height: 2,
    backgroundColor: Colors.neutral600,
    borderRadius: 1,
    marginVertical: hp(0.5),
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Sizes.containerPaddingHorizontal,
    gap: wp(2),
    marginBottom: hp(0.5),
  },
  actionButton: {
    flex: 1,
    paddingVertical: hp(0.8),
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: wp(36),
    elevation: 2,
  },
  actionButtonPrimary: {
    backgroundColor: Colors.primary || "#007AFF",
  },
  actionButtonOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.neutral400 || "#C7C7CC",
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: getFontSize(12),
  },
  // if you want reset text to be dark on outline button:
  actionButtonOutlineText: {
    color: Colors.textDark,
  },
  header: {
    alignItems: "center",
    marginBottom: -hp(2),
    paddingTop: hp(1),
  },
});

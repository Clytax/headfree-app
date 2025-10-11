import React, { useCallback, useMemo, useState } from "react";
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
} from "@react-native-firebase/firestore";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
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
} from "lucide-react-native";
import { useUser } from "@/hooks/firebase/useUser";
import useDailyEntryStore from "@/store/global/daily/useDailyEntryStore";
import { useAuth } from "@/context/auth/AuthContext";

import { FACTORS } from "@/services/dailyFactors";
import { useDailyEntryForm } from "@/hooks/useDailyEntryForm";
import { useTodayEntry } from "@/hooks/firebase/useDailyEntry";

// helpers
const toISODate = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, days: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
};
const isSameDay = (a: Date, b: Date) => toISODate(a) === toISODate(b);

// inline date header component
const DateHeader = ({
  date,
  onChange,
}: {
  date: Date;
  onChange: (d: Date) => void;
}) => {
  const [iosOpen, setIosOpen] = useState(false);
  const today = new Date();

  const openPicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        mode: "date",
        value: date,
        onChange: (_, selected) => selected && onChange(selected),
      });
    } else {
      setIosOpen(true);
    }
  };

  return (
    <View style={styles.dateHeader}>
      <TouchableOpacity
        onPress={() => onChange(addDays(date, -1))}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <ChevronLeft size={24} color={Colors.textDark} />
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
        <ChevronRight size={24} color={Colors.textDark} />
      </TouchableOpacity>

      {Platform.OS === "ios" && iosOpen && (
        <DateTimePicker
          mode="date"
          value={date}
          onChange={(_, selected) => {
            setIosOpen(false);
            if (selected) onChange(selected);
          }}
        />
      )}
    </View>
  );
};

const DailyEntry: React.FC = () => {
  const user = useUser();
  const uid = useAuth().user?.uid;

  const updateEntryStore = useDailyEntryStore((s) => s.updateEntryStore);
  const resetStore = useDailyEntryStore((s) => s.reset);
  const lastDate = useDailyEntryStore((s) => s.lastDate);
  const setLastDate = useDailyEntryStore((s) => s.setLastDate);
  const fullStore = useDailyEntryStore((s) => s);

  // selected date state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const SELECTED_ISO = useMemo(() => toISODate(selectedDate), [selectedDate]);

  // always reset to today when this tab/screen gains focus
  useFocusEffect(
    useCallback(() => {
      setSelectedDate(new Date());
      // optional: also clear local form store immediately so UI shows blank state until hydration
      resetStore();
    }, [resetStore])
  );

  // use your existing hook for the selected date
  const {
    todaysEntry: selectedEntry,
    hasSubmittedToday: hasEntryForSelectedDate,
    isLoading: isLoadingEntry,
  } = useTodayEntry(SELECTED_ISO);

  const [isSubmitting, setIsSubmitting] = useState(false);

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

      if (existing.exists) {
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

  return (
    <SafeAreaContainer style={styles.container}>
      <Text fontWeight="bold" fontSize={getFontSize(24)} textCenter>
        Daily Health Entry
      </Text>

      <DateHeader date={selectedDate} onChange={setSelectedDate} />

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
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {FACTORS.filter((f) => f.kind === "choice" && f.choices).map((f) => (
          <DailyEntryChoice
            key={f.key}
            title={f.title || String(f.key)}
            description={f.description || ""}
            choices={f.choices!}
            onChange={(value) =>
              handleEntryChange(f.key as any, value, isSubmitting)
            }
            value={(fullStore as any)[f.key]}
            isLoading={isSubmitting || isLoadingEntry}
          />
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
      </ScrollView>

      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[
            styles.fab,
            formValid && !isSubmitting ? styles.fabActive : styles.fabInactive,
          ]}
          onPress={saveEntry}
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
              color={formValid ? Colors.white : Colors.neutral300}
            />
          )}
          {percent > 0 && !isSubmitting && (
            <View style={styles.progressBadge}>
              <Text style={styles.progressText} color={Colors.textDark}>
                {percent}%
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
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: hp(1),
  },
  dateCenter: {
    alignItems: "center",
  },
  dateSubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
});

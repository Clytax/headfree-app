import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
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
import type { CityInfo } from "@/components/DailyEntry/DailyEntryLocation";

// Components
import Text from "@/components/common/Text";
import SafeAreaContainer from "@/components/common/Container/SafeAreaContainer";
import DailyEntryChoice from "@/components/DailyEntry/DailyEntryChoice";
import DailyEntryLocation from "@/components/DailyEntry/DailyEntryLocation";

// Constants
import { Colors, Sizes } from "@/constants";

// Hooks
import { useUser } from "@/hooks/firebase/useUser";
import useDailyEntryStore from "@/store/global/daily/useDailyEntryStore";
import { useAuth } from "@/context/auth/AuthContext";

// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";
import { Check } from "lucide-react-native";
import DailyEntrySleep from "@/components/DailyEntry/DailyEntrySleep";
import DailyEntryMenstruationCycle from "@/components/DailyEntry/DailyEntryMenstruationCycle";

interface EntryChoice {
  value: number | boolean;
  label: string;
}

const getTodayISO = () => new Date().toISOString().split("T")[0];

const useTodayISO = () => {
  const [today, setToday] = useState(getTodayISO());
  useEffect(() => {
    const updateNow = () => setToday(getTodayISO());
    updateNow();
    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0,
      0
    ).getTime();
    const timeout = setTimeout(updateNow, nextMidnight - now.getTime());
    return () => clearTimeout(timeout);
  }, []);
  return today;
};

const DAILY_ENTRY_CHOICES = {
  stress: {
    title: "Stress Level",
    description: "How stressed did you feel today",
    choices: [
      { value: 1, label: "😌 Very Low" },
      { value: 2, label: "🙂 Low" },
      { value: 3, label: "😐 Moderate" },
      { value: 4, label: "😟 High" },
      { value: 5, label: "😫 Very High" },
    ] as EntryChoice[],
  },
  emotion: {
    title: "Overall Emotion",
    description: "How was your overall emotional state today",
    choices: [
      { value: 1, label: "😃 Very Positive" },
      { value: 2, label: "🙂 Positive" },
      { value: 3, label: "😐 Neutral" },
      { value: 4, label: "😟 Negative" },
      { value: 5, label: "😭 Very Negative" },
    ] as EntryChoice[],
  },
  water: {
    title: "Water Intake",
    description: "How many liters of water did you drink",
    choices: [
      { value: 0, label: "💧 <1L" },
      { value: 1, label: "💧 1–2L" },
      { value: 2, label: "💧 2–3L" },
      { value: 3, label: "💧 3L+" },
    ] as EntryChoice[],
  },
  caffeine: {
    title: "Caffeine Consumption",
    description: "How much caffeine did you consume",
    choices: [
      { value: 0, label: "☕ None" },
      { value: 1, label: "☕ 1–2 cups" },
      { value: 2, label: "☕ 3+ cups" },
    ] as EntryChoice[],
  },
  neckPain: {
    title: "Neck Pain",
    description: "Did you experience neck pain today",
    choices: [
      { value: 0, label: "😃 None" },
      { value: 1, label: "😣 Mild" },
      { value: 2, label: "😭 Severe" },
    ] as EntryChoice[],
  },
  meals: {
    title: "Meal Count",
    description: "How many meals did you have",
    choices: [
      { value: 0, label: "🍽 None" },
      { value: 1, label: "🍽 1 meal" },
      { value: 2, label: "🍽 2 meals" },
      { value: 3, label: "🍽 3 meals" },
      { value: 4, label: "🍽 4+ meals" },
    ] as EntryChoice[],
  },
  chocolateOrCheese: {
    title: "Chocolate or Cheese",
    description: "Did you consume chocolate or cheese today",
    choices: [
      { value: 0, label: "🍫🧀 None" },
      { value: 1, label: "🍫🧀 A little" },
      { value: 2, label: "🍫🧀 A lot" },
    ] as EntryChoice[],
  },
  overEating: {
    title: "Overeating",
    description: "Did you overeat today",
    choices: [
      { value: 0, label: "🍔 No" },
      { value: 1, label: "🍔 A little" },
      { value: 2, label: "🍔 A lot" },
    ] as EntryChoice[],
  },
  alcohol: {
    title: "Alcohol Consumption",
    description: "Did you consume alcohol today",
    choices: [
      { value: 0, label: "🍺 No" },
      { value: 1, label: "🍺 A little" },
      { value: 2, label: "🍺 A lot" },
    ] as EntryChoice[],
  },
  smoking: {
    title: "Smoking",
    description: "Did you smoke today",
    choices: [
      { value: 0, label: "🚭 No" },
      { value: 1, label: "🚬 A little" },
      { value: 2, label: "🚬 A lot" },
    ] as EntryChoice[],
  },

  traveled: {
    title: "Travel",
    description: "Did you travel today",
    choices: [
      { value: true, label: "🛫 No" },
      { value: false, label: "🛫 Yes" },
    ] as EntryChoice[],
  },
} as const;

const DailyEntry: React.FC = () => {
  const user = useUser();
  const uid = useAuth().user?.uid;

  const updateEntryStore = useDailyEntryStore((s) => s.updateEntryStore);
  const resetStore = useDailyEntryStore((s) => s.reset);
  const lastDate = useDailyEntryStore((s) => s.lastDate);
  const setLastDate = useDailyEntryStore((s) => s.setLastDate);
  const fullStore = useDailyEntryStore((s) => s);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const TODAY_ISO = useTodayISO();

  const todaysEntry = useMemo(() => {
    const dailies = user?.data?.dailies || [];
    return dailies.find((e: any) => e?.date === TODAY_ISO) || null;
  }, [user?.data?.dailies, TODAY_ISO]);

  useEffect(() => {
    if (!lastDate || lastDate !== TODAY_ISO) {
      resetStore();
      setLastDate(TODAY_ISO);
    }
  }, [TODAY_ISO, lastDate, resetStore, setLastDate]);

  useEffect(() => {
    if (todaysEntry) {
      updateEntryStore("water", todaysEntry?.water ?? null);
      updateEntryStore("stress", todaysEntry?.stress ?? null);
      updateEntryStore("caffeine", todaysEntry?.caffeine ?? null);
      updateEntryStore("neckPain", todaysEntry?.neckPain ?? null);
      updateEntryStore("meals", todaysEntry?.meals ?? null);
      updateEntryStore(
        "chocolateOrCheese",
        todaysEntry?.chocolateOrCheese ?? null
      );
      updateEntryStore("overEating", todaysEntry?.overEating ?? null);
      updateEntryStore("location", todaysEntry?.location ?? null);
      updateEntryStore("sleep", todaysEntry?.sleep ?? null);
      updateEntryStore("menstrualCycle", todaysEntry?.menstrualCycle ?? null);

      updateEntryStore("alcohol", todaysEntry?.alcohol ?? null);
      updateEntryStore("smoking", todaysEntry?.smoking ?? null);
      updateEntryStore("traveled", todaysEntry?.traveled ?? null);

      setLastDate(TODAY_ISO);
    } else {
      resetStore();
      setLastDate(TODAY_ISO);
    }
  }, [todaysEntry, updateEntryStore, resetStore, setLastDate, TODAY_ISO]);

  const handleEntryChange = useCallback(
    (key: keyof DailyEntryStore, value: any) => {
      if (isSubmitting) return;
      const newValue = (fullStore as any)[key] === value ? null : value;
      updateEntryStore(key, newValue);
      setLastDate(TODAY_ISO);
    },
    [fullStore, updateEntryStore, isSubmitting, setLastDate, TODAY_ISO]
  );

  const hasSubmittedToday = useMemo((): boolean => {
    const dailyEntries = user?.data?.dailies || [];
    return dailyEntries.some((entry: any) => entry.date === TODAY_ISO);
  }, [user?.data?.dailies, TODAY_ISO]);

  const isFormValid = useMemo((): boolean => {
    const requiredFields = [fullStore.stress, fullStore.water, fullStore.meals];
    return requiredFields.some(
      (field) => field !== null && field !== undefined
    );
  }, [fullStore.stress, fullStore.water, fullStore.meals]);

  const completionPercentage = useMemo((): number => {
    const allFields = [
      fullStore.stress,
      fullStore.water,
      fullStore.caffeine,
      fullStore.neckPain,
      fullStore.meals,
      fullStore.chocolateOrCheese,
      fullStore.overEating,
      fullStore.location,
      fullStore.menstrualCycle,
      fullStore.sleep,
    ];
    const completed = allFields.filter(
      (f) => f !== null && f !== undefined
    ).length;
    return Math.round((completed / allFields.length) * 100);
  }, [fullStore]);

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
        sleep: (fullStore as any)?.sleep ?? null,
        menstrualCycle: (fullStore as any)?.menstrualCycle ?? null,
      };

      const db = getFirestore();
      const userRef = doc(db, "users", uid);

      await setDoc(
        userRef,
        {
          dailies: arrayUnion({
            ...allValues,
            date: TODAY_ISO,
            createdAt: Date.now(),
          }),
          updatedAt: serverTimestamp(),
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
  }, [isFormValid, hasSubmittedToday, fullStore, uid, TODAY_ISO]);

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
        sleep: (fullStore as any)?.sleep ?? null,
        menstrualCycle: (fullStore as any)?.menstrualCycle ?? null,
        date: TODAY_ISO,
        updatedAt: Date.now(),
        createdAt:
          dailies.find((e) => e?.date === TODAY_ISO)?.createdAt || Date.now(),
      };

      const nextDailies = (() => {
        const idx = dailies.findIndex((e) => e?.date === TODAY_ISO);
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
  }, [uid, fullStore, isFormValid, TODAY_ISO]);

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
        <DailyEntrySleep />
        <DailyEntryLocation
          value={(fullStore as any)?.location ?? null}
          isBusy={isSubmitting}
          onChange={(info: CityInfo | null) => {
            updateEntryStore("location", info);
            setLastDate(TODAY_ISO);
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

import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  onSnapshot,
} from "@react-native-firebase/firestore";
import Text from "@/components/common/Text";
import SafeAreaContainer from "@/components/common/Container/SafeAreaContainer";
import DailyEntryChoice from "@/components/DailyEntry/DailyEntryChoice";
import DailyEntryLocation from "@/components/DailyEntry/DailyEntryLocation";
import DailyEntrySleep from "@/components/DailyEntry/DailyEntrySleep";
import DailyEntryMenstruationCycle from "@/components/DailyEntry/DailyEntryMenstruationCycle";
import { Colors, Sizes } from "@/constants";
import { getFontSize } from "@/utils/text/fonts";
import { wp, hp } from "@/utils/ui/sizes";
import { Check } from "lucide-react-native";
import { useUser } from "@/hooks/firebase/useUser";
import useDailyEntryStore from "@/store/global/daily/useDailyEntryStore";
import { useAuth } from "@/context/auth/AuthContext";

import { FACTORS } from "@/services/dailyFactors";
import { useDailyEntryForm } from "@/hooks/useDailyEntryForm";

const DailyEntry: React.FC = () => {
  const user = useUser();
  const uid = useAuth().user?.uid;

  const updateEntryStore = useDailyEntryStore((s) => s.updateEntryStore);
  const resetStore = useDailyEntryStore((s) => s.reset);
  const lastDate = useDailyEntryStore((s) => s.lastDate);
  const setLastDate = useDailyEntryStore((s) => s.setLastDate);
  const fullStore = useDailyEntryStore((s) => s);

  const TODAY_ISO_LOCAL = new Date().toISOString().split("T")[0];

  const [todaysEntry, setTodaysEntry] = useState<any | null>(null);
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // live doc for today
  useEffect(() => {
    if (!uid) return;
    const db = getFirestore();
    const entryRef = doc(db, "users", uid, "dailies", TODAY_ISO_LOCAL);
    const unsub = onSnapshot(entryRef, (snap) => {
      setHasSubmittedToday(snap.exists);
      setTodaysEntry(snap.exists ? { ...snap.data(), id: snap.id } : null);
    });
    return unsub;
  }, [uid, TODAY_ISO_LOCAL]);

  const { TODAY_ISO, handleEntryChange, formValid, percent, pickValues } =
    useDailyEntryForm({
      fullStore,
      updateEntryStore,
      resetStore,
      lastDate,
      setLastDate,
      todaysEntry,
      gender: user?.data?.profile?.gender || null,
    });
  const saveToday = useCallback(async () => {
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
        Alert.alert("Updated", "Your entry for today has been updated.");
      } else {
        await setDoc(entryRef, {
          ...values,
          date: TODAY_ISO,
          createdAt: now,
          updatedAt: now,
        });
        Alert.alert("Saved", "Your entry for today has been saved.");
      }

      // touch parent user for list screens that sort by updatedAt
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
            isLoading={isSubmitting}
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
          onPress={saveToday}
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

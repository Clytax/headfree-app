// hooks/useDailyEntry.ts
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getFirestore,
  collection,
  doc,
  query,
  getDocs,
  getDoc,
  onSnapshot,
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { useAuth } from "@/context/auth/AuthContext";

const db = getFirestore();

// Types
interface DailyEntry {
  id: string;
  date: string;
  createdAt: any;
  updatedAt: any;
  [key: string]: any;
}

// Query keys
const dailyEntriesKey = (uid?: string | null) => ["dailyEntries", uid] as const;
const todayEntryKey = (uid?: string | null, date?: string) =>
  ["dailyEntry", uid, date] as const;

// Hook to get all daily entries
export function useDailyEntries() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => dailyEntriesKey(uid), [uid]);

  const dailyEntriesQuery = useQuery<DailyEntry[]>({
    queryKey,
    enabled: !!uid,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      const collectionRef = collection(db, "users", uid!, "dailies");
      const q = query(collectionRef);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data(),
        })
      ) as DailyEntry[];
    },
  });

  // Real-time listener
  useEffect(() => {
    if (!uid) return;

    const collectionRef = collection(db, "users", uid, "dailies");
    const q = query(collectionRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const entries = snapshot.docs.map(
          (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
            id: doc.id,
            ...doc.data(),
          })
        ) as DailyEntry[];
        queryClient.setQueryData(queryKey, entries);
      },
      (err) => {
        console.error("Daily entries snapshot error:", err);
      }
    );

    return unsubscribe;
  }, [uid, queryClient, queryKey]);

  return dailyEntriesQuery;
}

// Hook to get today's entry (or any specific date)
export function useTodayEntry(dateISO?: string) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const TODAY_ISO_LOCAL = dateISO || new Date().toISOString().split("T")[0];

  const [todaysEntry, setTodaysEntry] = useState<DailyEntry | null>(null);
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setIsLoading(false);
      return;
    }

    const entryRef = doc(db, "users", uid, "dailies", TODAY_ISO_LOCAL);

    // Initial fetch
    getDoc(entryRef).then((snap) => {
      setHasSubmittedToday(snap.exists());
      setTodaysEntry(
        snap.exists() ? ({ ...snap.data(), id: snap.id } as DailyEntry) : null
      );
      setIsLoading(false);
    });

    // Real-time listener
    const unsubscribe = onSnapshot(entryRef, (snap) => {
      setHasSubmittedToday(snap.exists());
      setTodaysEntry(
        snap.exists() ? ({ ...snap.data(), id: snap.id } as DailyEntry) : null
      );
    });

    return unsubscribe;
  }, [uid, TODAY_ISO_LOCAL]);

  return {
    todaysEntry,
    hasSubmittedToday,
    isLoading,
    dateISO: TODAY_ISO_LOCAL,
  };
}

export function useYesterdayEntry() {
  const yesterday = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split("T")[0];
  }, []);

  const {
    todaysEntry: yesterdaysEntry,
    hasSubmittedToday: hasYesterdayEntry,
    isLoading,
  } = useTodayEntry(yesterday);

  return {
    yesterdaysEntry,
    hasYesterdayEntry,
    isLoading,
    yesterdayDate: yesterday,
  };
}

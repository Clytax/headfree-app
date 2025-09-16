// hooks/useOnboardingStatus.ts
import { useEffect, useMemo } from "react";

// Packages
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Firebase
import {
  getFirestore,
  getDoc,
  doc,
  onSnapshot,
} from "@react-native-firebase/firestore";

const db = getFirestore();

export function useOnboardingStatus(uid?: string | null) {
  const queryClient = useQueryClient();

  // stable key reference so exhaustive deps is happy
  const queryKey = useMemo(
    () => ["user", "onboardingCompleted", uid] as const,
    [uid]
  );

  const query = useQuery<boolean>({
    queryKey,
    enabled: !!uid,
    staleTime: 60_000,
    queryFn: async () => {
      const ref = doc(db, "users", uid!);
      const snap = await getDoc(ref);
      return snap.exists()
        ? !!snap.data()?.analytics?.onboardingCompleted
        : false;
    },
  });

  useEffect(() => {
    try {
      if (!uid) return;
      const ref = doc(db, "users", uid);
      const unsubscribe = onSnapshot(ref, (snap) => {
        const value = snap.exists()
          ? !!snap.data()?.analytics?.onboardingCompleted
          : false;
        queryClient.setQueryData(queryKey, value);
      });
      return unsubscribe;
    } catch (error) {
      console.log(error);
    }
  }, [uid, queryClient, queryKey]);

  return query;
}

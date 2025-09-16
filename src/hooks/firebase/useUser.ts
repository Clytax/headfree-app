// hooks/useUser.ts
import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getFirestore,
  getDoc,
  doc,
  onSnapshot,
} from "@react-native-firebase/firestore";
import { useAuth } from "@/context/auth/AuthContext";
import { IUserDoc } from "@/types/user";

const db = getFirestore();

const userKey = (uid?: string | null) => ["user", uid] as const;

export function useUser() {
  const { user } = useAuth(); // pull the auth user
  const uid = user?.uid ?? null;

  const queryClient = useQueryClient();
  const queryKey = useMemo(() => userKey(uid), [uid]);

  const query = useQuery<IUserDoc | null>({
    queryKey,
    enabled: !!uid,
    staleTime: Infinity,
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      const ref = doc(db, "users", uid!);
      const snap = await getDoc(ref);
      return snap.exists() ? (snap.data() as IUserDoc) : null;
    },
  });

  useEffect(() => {
    if (!uid) return;
    const ref = doc(db, "users", uid);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        const value = snap.exists() ? (snap.data() as IUserDoc) : null;
        queryClient.setQueryData(queryKey, value);
      },
      (err) => {
        queryClient.setQueryData(
          queryKey,
          queryClient.getQueryData(queryKey) ?? null
        );
        console.log(err);
      }
    );
    return unsubscribe;
  }, [uid, queryClient, queryKey]);

  return query;
}

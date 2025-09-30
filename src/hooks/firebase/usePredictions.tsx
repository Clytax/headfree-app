// hooks/usePredictions.ts
import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getFirestore,
  collection,
  query,
  getDocs,
  onSnapshot,
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { useAuth } from "@/context/auth/AuthContext";
import { IUserPrediction } from "@/types/user";

const db = getFirestore();

const predictionsKey = (uid?: string | null) => ["predictions", uid] as const;

export function usePredictions() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => predictionsKey(uid), [uid]);

  const predictionsQuery = useQuery<IUserPrediction[]>({
    queryKey,
    enabled: !!uid,
    staleTime: 5 * 60 * 1000, // 5 minutes - adjust based on your needs
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      const collectionRef = collection(db, "users", uid!, "predictions");
      const q = query(collectionRef); // add orderBy, where, etc. if needed
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data(),
        })
      ) as IUserPrediction[];
    },
  });

  // Real-time listener
  useEffect(() => {
    if (!uid) return;

    const collectionRef = collection(db, "users", uid, "predictions");
    const q = query(collectionRef); // add same filters as queryFn

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const predictions = snapshot.docs.map(
          (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
            id: doc.id,
            ...doc.data(),
          })
        ) as IUserPrediction[];
        queryClient.setQueryData(queryKey, predictions);
      },
      (err) => {
        console.error("Predictions snapshot error:", err);
        // Keep existing data on error
      }
    );

    return unsubscribe;
  }, [uid, queryClient, queryKey]);

  return predictionsQuery;
}

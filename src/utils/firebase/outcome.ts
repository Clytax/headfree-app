import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDateKey } from "@/utils/storage/outcomeCheckPrompt";

export type Severity = "mild" | "moderate" | "severe";

export type MigraineOutcome = {
  hadMigraine: boolean;
  severity?: Severity;
  createdAt: any;
};

export const getOutcomeDocRef = (userId: string, date: Date, db: any) => {
  const key = getDateKey(date);
  return doc(db, "users", userId, "outcomes", key);
};

export const fetchOutcomeByDate = async (
  userId: string,
  date: Date,
  db: any
) => {
  const ref = getOutcomeDocRef(userId, date, db);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as MigraineOutcome) : null;
};

export const saveOutcomeByDate = async (
  userId: string,
  date: Date,
  db: any,
  payload: { hadMigraine: boolean; severity?: Severity }
) => {
  const ref = getOutcomeDocRef(userId, date, db);
  await setDoc(
    ref,
    {
      hadMigraine: payload.hadMigraine,
      ...(payload.hadMigraine ? { severity: payload.severity } : {}),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
};

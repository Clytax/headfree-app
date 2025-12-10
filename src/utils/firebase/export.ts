// utils/export.ts
import { getFirestore, doc, getDoc } from "firebase/firestore";

type DailySummary = {
  date: string;
  migraine_today: boolean;
  lifestyle: {
    alcohol: boolean;
    caffeine: boolean;
    chocolate_or_cheese: boolean;
    smoking: boolean;
    traveled: boolean;
    meals: number | null;
    stress_level: number | null;
    emotion_score: number | null;
    light_exposure: number | null;
    over_eating: boolean;
  };
  sleep: {
    total_minutes: number | null;
    interruptions: number | null;
    start_time: string | null;
    end_time: string | null;
    score: number | null;
  };
  prediction: {
    probability: number;
    risk_level: string;
  } | null;
};

const getCollection = async (firestore: any, path: string) => {
  const collectionRef = firestore.collection(path);
  const snap = await collectionRef.get();
  return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
};

export const fetchDailySummary = async (
  uid: string
): Promise<DailySummary[]> => {
  const firestore = getFirestore();

  const [rawEntries, rawPredictions] = await Promise.all([
    getCollection(firestore, `users/${uid}/entries`),
    getCollection(firestore, `users/${uid}/predictions`),
  ]);

  const predictionsByDate: Record<string, any> = {};
  rawPredictions.forEach((p: any) => {
    if (p.prediction_date) {
      predictionsByDate[p.prediction_date] = p;
    }
  });

  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const inLast30Days = (dateStr: string | undefined) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d >= thirtyDaysAgo && d <= today;
  };

  const dailySummary: DailySummary[] = rawEntries
    .filter((e: any) => inLast30Days(e.date))
    .sort((a: any, b: any) => (a.date || "").localeCompare(b.date || ""))
    .map((entry: any) => {
      const prediction = predictionsByDate[entry.date];

      const sleep = entry.sleep || {};
      const mappedPrediction = prediction
        ? {
            probability: prediction.migraine_probability,
            risk_level: prediction.risk_level,
          }
        : null;

      return {
        date: entry.date,
        migraine_today: !!entry.migraineToday,
        lifestyle: {
          alcohol: !!entry.alcohol,
          caffeine: !!entry.caffeine,
          chocolate_or_cheese: !!entry.chocolateOrCheese,
          smoking: !!entry.smoking,
          traveled: !!entry.traveled,
          meals: entry.meals ?? null,
          stress_level: entry.stress ?? null,
          emotion_score: entry.emotion ?? null,
          light_exposure: entry.lightExposure ?? null,
          over_eating: !!entry.overEating,
        },
        sleep: {
          total_minutes: sleep.totalSleepMinutes ?? null,
          interruptions: sleep.interruptions ?? null,
          start_time: sleep.startTime ?? null,
          end_time: sleep.endTime ?? null,
          score: sleep.score ?? null,
        },
        prediction: mappedPrediction,
      };
    });

  return dailySummary;
};

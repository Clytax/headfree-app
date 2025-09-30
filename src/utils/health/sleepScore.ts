// sleepScore.ts
import { CategoryValueSleepAnalysis } from "@kingstinct/react-native-healthkit";

type SleepSample = {
  startDate: string | Date;
  endDate: string | Date;
  value: number; // CategoryValueSleepAnalysis.*
};

type SleepScoreResult = {
  totalSleepMin: number;
  interruptions: number;
  totalAwakeMin: number;
  efficiency?: number; // 0 to 1 if in bed is available
  components: {
    durationScore: number;
    continuityScore: number;
    efficiencyScore?: number;
  };
  score: number; // 0 to 100
  label: "poor" | "fair" | "good" | "excellent";
};

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function round1(x: number) {
  return Math.round(x * 10) / 10;
}

export function computeSleepScore(samples: SleepSample[]): SleepScoreResult {
  // Normalize and sort
  const segs = samples
    .map((s) => ({
      start: new Date(s.startDate),
      end: new Date(s.endDate),
      value: s.value,
    }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  let totalSleepMs = 0;
  let totalAwakeMs = 0;
  let interruptions = 0;
  let inBedStart: Date | null = null;
  let inBedEnd: Date | null = null;
  for (const s of segs) {
    const dur = Math.max(0, s.end.getTime() - s.start.getTime());

    const v = s.value;
    const asleep =
      v === CategoryValueSleepAnalysis.asleepCore ||
      v === CategoryValueSleepAnalysis.asleepDeep ||
      v === CategoryValueSleepAnalysis.asleepREM ||
      v === CategoryValueSleepAnalysis.asleepUnspecified;

    if (asleep) totalSleepMs += dur;

    if (v === CategoryValueSleepAnalysis.awake) {
      totalAwakeMs += dur;
      if (dur >= 5 * 60 * 1000) interruptions += 1;
    }

    if (v === CategoryValueSleepAnalysis.inBed) {
      if (!inBedStart || s.start < inBedStart) inBedStart = s.start;
      if (!inBedEnd || s.end > inBedEnd) inBedEnd = s.end;
    }
  }
  const totalSleepMin = Math.round(totalSleepMs / 60000);
  const totalAwakeMin = Math.round(totalAwakeMs / 60000);

  // 1) Duration score
  // Ideal is around 8 hours. Full credit at 7 to 9 hours. Linear drop to zero by 5 or 11 hours.
  const hours = totalSleepMin / 60;
  const durationScore = Math.round(100 * clamp01(1 - Math.abs(hours - 8) / 3));

  // 2) Continuity score
  // Penalty for each interruption and for long awake time
  // 15 points per interruption and 1 point per awake minute up to 100 total
  const continuityPenalty = Math.min(
    100,
    interruptions * 15 + totalAwakeMin * 1
  );
  const continuityScore = Math.max(0, 100 - Math.round(continuityPenalty));

  // 3) Efficiency score if we have in bed window
  let efficiency: number | undefined;
  let efficiencyScore: number | undefined;
  if (inBedStart && inBedEnd) {
    const inBedMs = Math.max(0, inBedEnd.getTime() - inBedStart.getTime());
    efficiency = inBedMs > 0 ? totalSleepMs / inBedMs : undefined;
    if (typeof efficiency === "number") {
      // Map 0.8 to 1.0 onto 70 to 100. Below 0.8 falls off faster.
      const eff = clamp01((efficiency - 0.5) / 0.5); // 0.5 maps to 0, 1.0 maps to 1
      efficiencyScore = Math.round(50 + 50 * eff);
    }
  }

  // Combine
  const wDuration = 0.5;
  const wContinuity = efficiencyScore == null ? 0.5 : 0.3;
  const wEfficiency = efficiencyScore == null ? 0.0 : 0.2;

  const score = Math.round(
    durationScore * wDuration +
      continuityScore * wContinuity +
      (efficiencyScore ?? 0) * wEfficiency
  );

  const label =
    score >= 85
      ? "excellent"
      : score >= 70
      ? "good"
      : score >= 55
      ? "fair"
      : "poor";

  return {
    totalSleepMin,
    interruptions,
    totalAwakeMin,
    efficiency: efficiency != null ? round1(efficiency) : undefined,
    components: { durationScore, continuityScore, efficiencyScore },
    score,
    label,
  };
}

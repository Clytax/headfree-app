// components/DailyEntry/DailyEntryMenstruationCycle.tsx
import React, { useCallback, useMemo, useState } from "react";
import { Alert, Linking, Platform } from "react-native";
import { Droplet } from "lucide-react-native";
import DailyEntryDataSource from "@/components/DailyEntry/DailyEntryDataSource";
import {
  AuthorizationRequestStatus,
  CategoryValueMenstrualFlow,
  CategoryValueOvulationTestResult,
  CategoryValueCervicalMucusQuality,
  queryCategorySamples,
  useHealthkitAuthorization,
} from "@kingstinct/react-native-healthkit";
import type { CategoryTypeIdentifier } from "@kingstinct/react-native-healthkit";
import useDailyEntryStore from "@/store/global/daily/useDailyEntryStore";

type Props = { isBusy?: boolean };

// HealthKit types
const MENSTRUAL_FLOW_TYPE =
  "HKCategoryTypeIdentifierMenstrualFlow" as CategoryTypeIdentifier;
const OVULATION_TEST_TYPE =
  "HKCategoryTypeIdentifierOvulationTestResult" as CategoryTypeIdentifier;
const CERVICAL_MUCUS_TYPE =
  "HKCategoryTypeIdentifierCervicalMucusQuality" as CategoryTypeIdentifier;

const CYCLE_CONFIG = {
  title: "Menstrual cycle",
  description: "Determines your current stage from Apple Health.",
  baseUsages: ["Stage unknown"],
  errors: {
    unsupported: "Menstrual cycle is only available on iOS with Apple Health.",
    general: "Could not read cycle data. Please try again later.",
  },
} as const;

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}
function fmtDateISO(d: Date) {
  return d.toISOString().slice(0, 10);
}
function msToDays(ms: number) {
  return Math.max(0, Math.round(ms / 86400000));
}

type Sample = {
  startDate: Date;
  endDate: Date;
  value: number;
  metadata?: Record<string, unknown>;
};

type Stage = "menstruation" | "ovulation" | "follicular" | "luteal" | "unknown";

function normalize(samples: any[]): Sample[] {
  return samples
    .map((s) => ({
      startDate: new Date(s.startDate),
      endDate: new Date(s.endDate),
      value: Number(s.value),
      metadata: s.metadata as any,
    }))
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

function inferCycleStarts(flow: Sample[]) {
  const isFlow = (v: number) =>
    v === CategoryValueMenstrualFlow.light ||
    v === CategoryValueMenstrualFlow.medium ||
    v === CategoryValueMenstrualFlow.heavy ||
    v === CategoryValueMenstrualFlow.unspecified;

  const starts: Date[] = [];
  for (let i = 0; i < flow.length; i++) {
    const s = flow[i];
    const metaStart = Boolean((s.metadata as any)?.HKMenstrualCycleStart);
    if (metaStart) {
      if (
        starts.length === 0 ||
        fmtDateISO(starts[starts.length - 1]) !== fmtDateISO(s.startDate)
      ) {
        starts.push(s.startDate);
      }
      continue;
    }
    if (!isFlow(s.value)) continue;
    const prev = flow[i - 1];
    const prevHadFlow = prev ? isFlow(prev.value) : false;
    const gapDays = prev
      ? msToDays(s.startDate.getTime() - prev.endDate.getTime())
      : Number.POSITIVE_INFINITY;
    if (!prevHadFlow || gapDays >= 1) {
      if (
        starts.length === 0 ||
        fmtDateISO(starts[starts.length - 1]) !== fmtDateISO(s.startDate)
      ) {
        starts.push(s.startDate);
      }
    }
  }
  return starts;
}

function estimateAverageCycleDays(starts: Date[]) {
  if (starts.length < 2) return null;
  const diffs: number[] = [];
  for (let i = 1; i < starts.length; i++) {
    diffs.push(msToDays(starts[i].getTime() - starts[i - 1].getTime()));
  }
  if (diffs.length === 0) return null;
  const sum = diffs.reduce((a, b) => a + b, 0);
  const avg = Math.round(sum / diffs.length);
  return avg >= 20 && avg <= 45 ? avg : null;
}

function determineStage(
  flowRecent: Sample[],
  ovuRecent: Sample[],
  mucusRecent: Sample[],
  flowForHistory: Sample[]
): { stage: Stage; evidence: string } {
  const todayStart = startOfToday();
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const overlapsToday = (s: Sample) =>
    s.endDate > todayStart && s.startDate < todayEnd;

  const isFlowNow = flowRecent.some((s) => {
    const isFlowVal =
      s.value === CategoryValueMenstrualFlow.light ||
      s.value === CategoryValueMenstrualFlow.medium ||
      s.value === CategoryValueMenstrualFlow.heavy ||
      s.value === CategoryValueMenstrualFlow.unspecified;
    return isFlowVal && overlapsToday(s);
  });
  if (isFlowNow) {
    return { stage: "menstruation", evidence: "Menstrual flow overlaps today" };
  }

  const lhSurge = ovuRecent.find(
    (s) => s.value === CategoryValueOvulationTestResult.luteinizingHormoneSurge
  );
  if (
    lhSurge &&
    msToDays(new Date().getTime() - lhSurge.startDate.getTime()) <= 2
  ) {
    return { stage: "ovulation", evidence: "Recent ovulation test LH surge" };
  }
  const fertileMucus = mucusRecent.find(
    (s) =>
      s.value === CategoryValueCervicalMucusQuality.eggWhite ||
      s.value === CategoryValueCervicalMucusQuality.watery
  );
  if (
    fertileMucus &&
    msToDays(new Date().getTime() - fertileMucus.startDate.getTime()) <= 2
  ) {
    return { stage: "ovulation", evidence: "Recent fertile cervical mucus" };
  }

  // Heuristic based on cycle day
  const starts = inferCycleStarts(flowForHistory);
  const lastStart = starts.length ? starts[starts.length - 1] : null;
  const avgCycle = estimateAverageCycleDays(starts);
  if (!lastStart || !avgCycle) {
    return { stage: "unknown", evidence: "Insufficient history" };
  }
  const cycleDay = msToDays(new Date().getTime() - lastStart.getTime()) + 1;

  if (cycleDay <= 5) {
    return {
      stage: "menstruation",
      evidence: "Cycle day within first five days",
    };
  }
  const mid = Math.round(avgCycle / 2);
  if (Math.abs(cycleDay - mid) <= 2) {
    return { stage: "ovulation", evidence: "Cycle day near mid cycle" };
  }
  if (cycleDay < mid) {
    return { stage: "follicular", evidence: "Pre mid cycle without flow" };
  }
  return { stage: "luteal", evidence: "Post mid cycle without flow" };
}

const DailyEntryMenstruationCycle: React.FC<Props> = ({ isBusy }) => {
  const updateDailyEntry = useDailyEntryStore((s) => s.updateEntryStore);

  const [headline, setHeadline] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [, requestAuthorization] = useHealthkitAuthorization([
    MENSTRUAL_FLOW_TYPE,
    OVULATION_TEST_TYPE,
    CERVICAL_MUCUS_TYPE,
  ]);

  const openHealthOrSettings = useCallback(async () => {
    const url = "x-apple-health://";
    try {
      if (await Linking.canOpenURL(url)) {
        await Linking.openURL(url);
        Alert.alert(
          "How to enable",
          [
            "Tap your profile picture",
            "Tap Privacy",
            "Tap Apps",
            "Tap your app name",
            "Turn on Menstrual flow and related data",
          ].join("\n")
        );
        return;
      }
    } catch {}
    try {
      await Linking.openSettings();
    } catch {}
  }, []);

  const fetchStage = useCallback(async () => {
    if (Platform.OS !== "ios") {
      Alert.alert("Menstrual cycle", CYCLE_CONFIG.errors.unsupported);
      return null;
    }

    try {
      const result = await requestAuthorization();
      if (result === AuthorizationRequestStatus.shouldRequest) return null;
      if (result !== AuthorizationRequestStatus.unnecessary) {
        Alert.alert(
          "Apple Health",
          "Cycle permissions are not enabled. Open Health to allow access.",
          [
            { text: "Close", style: "cancel" },
            { text: "Open", onPress: openHealthOrSettings },
          ]
        );
        return null;
      }
    } catch {
      Alert.alert(
        "Apple Health",
        "Could not request permissions. Open Health to review them.",
        [
          { text: "Close", style: "cancel" },
          { text: "Open", onPress: openHealthOrSettings },
        ]
      );
      return null;
    }

    // Windows
    const recentStart = daysAgo(14);
    const now = new Date();
    const historyStart = daysAgo(240); // eight months of history

    try {
      const [flowRecentRaw, ovuRecentRaw, mucusRecentRaw, flowHistoryRaw] =
        await Promise.all([
          queryCategorySamples(MENSTRUAL_FLOW_TYPE, {
            filter: { startDate: recentStart, endDate: now },
          }),
          queryCategorySamples(OVULATION_TEST_TYPE, {
            filter: { startDate: daysAgo(7), endDate: now },
          }),
          queryCategorySamples(CERVICAL_MUCUS_TYPE, {
            filter: { startDate: daysAgo(7), endDate: now },
          }),
          queryCategorySamples(MENSTRUAL_FLOW_TYPE, {
            filter: { startDate: historyStart, endDate: now },
          }),
        ]);

      const flowRecent = normalize(flowRecentRaw);
      const ovuRecent = normalize(ovuRecentRaw);
      const mucusRecent = normalize(mucusRecentRaw);
      const flowHistory = normalize(flowHistoryRaw);

      const { stage, evidence } = determineStage(
        flowRecent,
        ovuRecent,
        mucusRecent,
        flowHistory
      );

      return { stage, evidence };
    } catch (e) {
      console.error("queryCategorySamples failed", e);
      Alert.alert("Cycle Error", CYCLE_CONFIG.errors.general);
      return null;
    }
  }, [openHealthOrSettings, requestAuthorization]);

  const run = useCallback(async () => {
    if (isLoading || isBusy) return;
    setIsLoading(true);
    try {
      const result = await fetchStage();

      if (!result) {
        setHeadline(CYCLE_CONFIG.baseUsages);
        updateDailyEntry("menstrualCycle", {
          stage: "unknown",
          evidence: null,
          source: "apple_health",
          timestampISO: new Date().toISOString(),
        });
        setIsConnected(true);
        return;
      }

      const { stage, evidence } = result;

      // Headline and store payload
      setHeadline([`Stage ${stage}`, evidence ? `Reason ${evidence}` : ""]);
      setIsConnected(true);

      updateDailyEntry("menstrualCycle", {
        stage,
        evidence,
        source: "apple_health",
        timestampISO: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchStage, isBusy, isLoading, updateDailyEntry]);

  const handleConnect = run;
  const handleRefresh = run;

  const handleDisconnect = useCallback(() => {
    setHeadline([]);
    setIsConnected(false);
    updateDailyEntry("menstrualCycle", null);
  }, [updateDailyEntry]);

  const usages = useMemo(() => {
    if (!isConnected) return CYCLE_CONFIG.baseUsages;
    return headline.filter(Boolean);
  }, [isConnected, headline]);

  return (
    <DailyEntryDataSource
      icon={Droplet}
      title={CYCLE_CONFIG.title}
      description={CYCLE_CONFIG.description}
      usages={usages}
      isConnected={isConnected}
      isLoading={isLoading || !!isBusy}
      onConnect={handleConnect}
      onRefresh={handleRefresh}
      onDisconnect={handleDisconnect}
    />
  );
};

export default DailyEntryMenstruationCycle;

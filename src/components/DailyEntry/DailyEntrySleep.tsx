// components/DailyEntry/DailyEntrySleep.tsx
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Modal,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Moon } from "lucide-react-native";
import DailyEntryDataSource from "@/components/DailyEntry/DailyEntryDataSource";
import {
  AuthorizationRequestStatus,
  CategoryValueSleepAnalysis,
  queryCategorySamples,
  useHealthkitAuthorization,
} from "@kingstinct/react-native-healthkit";
import type { CategoryTypeIdentifier } from "@kingstinct/react-native-healthkit";
import Text from "@/components/common/Text";
import { computeSleepScore } from "@/utils/health/sleepScore";
import useDailyEntryStore from "@/store/global/daily/useDailyEntryStore";
import { Colors, Sizes } from "@/constants";
import { wp, hp } from "@/utils/ui/sizes";

type Props = { isBusy?: boolean };

const SLEEP_TYPE =
  "HKCategoryTypeIdentifierSleepAnalysis" as CategoryTypeIdentifier;

const SLEEP_CONFIG = {
  title: "Sleep",
  description:
    "Reads last night sleep from Apple Health and shows a simple summary.",
  baseUsages: ["Total sleep", "Interruptions", "Sleep score coming soon"],
  errors: {
    unsupported: "Sleep is only available on iOS with Apple Health.",
    general: "Could not read sleep data. Please try again later.",
  },
} as const;

function lastNightWindow() {
  const now = new Date();
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    12,
    0,
    0,
    0
  );
  const start = new Date(end);
  start.setDate(end.getDate() - 1);
  return { start, end };
}

function msToHrsMins(ms: number) {
  const totalMin = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}h ${m}m`;
}

function isAsleep(value: number) {
  return (
    value === CategoryValueSleepAnalysis.asleepCore ||
    value === CategoryValueSleepAnalysis.asleepDeep ||
    value === CategoryValueSleepAnalysis.asleepREM ||
    value === CategoryValueSleepAnalysis.asleepUnspecified
  );
}

type SleepSample = {
  startDate: string | Date;
  endDate: string | Date;
  value: number;
};

function summarizeSleep(samples: SleepSample[]) {
  const sorted = [...samples]
    .map((s) => ({
      start: new Date(s.startDate),
      end: new Date(s.endDate),
      value: s.value,
    }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  let totalSleepMs = 0;
  let interruptions = 0;
  const startTime = sorted[0]?.start || new Date();

  for (const s of sorted) {
    const dur = s.end.getTime() - s.start.getTime();
    if (isAsleep(s.value)) totalSleepMs += Math.max(0, dur);
    else if (
      s.value === CategoryValueSleepAnalysis.awake &&
      dur >= 5 * 60 * 1000
    )
      interruptions += 1;
  }

  const totalMinutes = Math.round(totalSleepMs / 60000);
  const totalHours = totalMinutes / 60;

  let bracket = "";
  if (totalHours < 5) bracket = "(lack of sleep)";
  else if (totalHours > 9) bracket = "(oversleeping)";
  else bracket = "(normal)";

  const score = computeSleepScore(samples);

  const headline: string[] = [
    `Total sleep ${msToHrsMins(totalSleepMs)} ${bracket}`,
    `Interruptions ${interruptions}`,
    `Sleep score ${score.score} (${score.label})`,
  ];

  // return both UI and structured values
  return {
    headline,
    payload: {
      totalMinutes,
      interruptions,
      startTime: sorted[0]?.start.toISOString() || new Date().toISOString(),
      endTime:
        sorted[sorted.length - 1]?.end.toISOString() ||
        new Date().toISOString(),
      bracket: bracket.replace(/[()]/g, ""), // store without parens
      score: { value: score.score, label: score.label },
      source: "apple_health",
      window: "last_night",
    },
  };
}

const DailyEntrySleep: React.FC<Props> = ({ isBusy }) => {
  const updateDailyEntry = useDailyEntryStore((s) => s.updateEntryStore);

  const [headline, setHeadline] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Modal state for manual entry
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [manualHours, setManualHours] = useState("");
  const [manualMinutes, setManualMinutes] = useState("");

  const [, requestAuthorization] = useHealthkitAuthorization([SLEEP_TYPE]);

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
            "Turn on Sleep",
          ].join("\n")
        );
        return;
      }
    } catch {}
    try {
      await Linking.openSettings();
    } catch {}
  }, []);

  const fetchLastNight = useCallback(async (): Promise<
    SleepSample[] | null
  > => {
    if (Platform.OS !== "ios") {
      Alert.alert("Sleep", SLEEP_CONFIG.errors.unsupported);
      return null;
    }

    try {
      const result = await requestAuthorization();
      if (result === AuthorizationRequestStatus.shouldRequest) return null;
      if (result !== AuthorizationRequestStatus.unnecessary) {
        Alert.alert(
          "Apple Health",
          "Sleep permission is not enabled. Open Health to allow access.",
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

    const { start, end } = lastNightWindow();

    try {
      const samples = await queryCategorySamples(SLEEP_TYPE, {
        filter: {
          startDate: start,
          endDate: end,
        },
      });

      return samples.map((s) => ({
        startDate: s.startDate,
        endDate: s.endDate,
        value: Number(s.value),
      }));
    } catch (e) {
      console.error("queryCategorySamples failed", e);
      Alert.alert("Sleep Error", SLEEP_CONFIG.errors.general);
      return null;
    }
  }, [openHealthOrSettings, requestAuthorization]);

  const runFetch = useCallback(async () => {
    if (isLoading || isBusy) return;
    setIsLoading(true);
    try {
      const samples = await fetchLastNight();

      if (!samples || samples.length === 0) {
        const fallbackHead = [
          "Total sleep 0h 0m",
          "Interruptions 0",
          "Sleep score coming soon",
        ];
        setHeadline(fallbackHead);
        // still write a clear empty payload
        updateDailyEntry("sleep", {
          totalSleepMinutes: 0,
          interruptions: 0,
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          score: 0,
        });
        setIsConnected(true);
        return;
      }

      const { headline, payload } = summarizeSleep(samples);
      setHeadline(headline);
      setIsConnected(true);

      // save to the daily store
      updateDailyEntry("sleep", {
        endTime: payload.startTime,
        startTime: payload.endTime,
        totalSleepMinutes: payload.totalMinutes,
        interruptions: payload.interruptions,
        score: payload.score.value,
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchLastNight, isBusy, isLoading, updateDailyEntry]);

  const handleConnect = runFetch;
  const handleRefresh = runFetch;

  const handleDisconnect = useCallback(() => {
    setHeadline([]);
    setIsConnected(false);
    // clear from the store too
    updateDailyEntry("sleep", null);
  }, [updateDailyEntry]);

  // Manual entry handler: opens modal
  const handleOpenManual = useCallback(() => {
    setManualHours("");
    setManualMinutes("");
    setManualModalVisible(true);
  }, []);

  // Validate and save manual entry
  const handleSaveManual = useCallback(() => {
    const h = parseInt(manualHours || "0", 10);
    const m = parseInt(manualMinutes || "0", 10);

    if (Number.isNaN(h) || Number.isNaN(m) || h < 0 || m < 0 || m >= 60) {
      Alert.alert("Invalid input", "Please enter valid hours and minutes.");
      return;
    }

    const totalMinutes = h * 60 + m;
    if (totalMinutes <= 0) {
      Alert.alert(
        "Invalid duration",
        "Please enter a duration greater than 0."
      );
      return;
    }

    // Build headline and payload similar to summariseSleep
    const headlineArr = [
      `Total sleep ${h}h ${m}m`,
      "Interruptions 0",
      "Sleep score coming soon",
    ];
    setHeadline(headlineArr);
    setIsConnected(true);

    const endTime = new Date();
    const startTime = new Date(Date.now() - totalMinutes * 60 * 1000);

    updateDailyEntry("sleep", {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      totalSleepMinutes: totalMinutes,
      interruptions: 0,
      score: 0,
    });

    setManualModalVisible(false);
  }, [manualHours, manualMinutes, updateDailyEntry]);

  const usages = useMemo(() => {
    if (!isConnected) return SLEEP_CONFIG.baseUsages;
    return [...headline];
  }, [isConnected, headline]);

  return (
    <>
      <DailyEntryDataSource
        icon={Moon}
        title={SLEEP_CONFIG.title}
        description={SLEEP_CONFIG.description}
        usages={usages}
        isConnected={isConnected}
        isLoading={isLoading || !!isBusy}
        onConnect={handleConnect}
        onRefresh={handleRefresh}
        onDisconnect={handleDisconnect}
        onManualEntry={handleOpenManual}
      />

      <Modal
        visible={manualModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setManualModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text fontWeight="bold" fontSize={18} style={styles.modalTitle}>
              Enter sleep duration
            </Text>

            <View style={styles.inputsRow}>
              <View style={styles.inputWrap}>
                <Text fontSize={14} style={styles.inputLabel}>
                  Hours
                </Text>
                <TextInput
                  value={manualHours}
                  onChangeText={setManualHours}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={Colors.neutral400}
                  style={styles.input}
                  maxLength={3}
                />
              </View>

              <View style={styles.inputWrap}>
                <Text fontSize={14} style={styles.inputLabel}>
                  Minutes
                </Text>
                <TextInput
                  value={manualMinutes}
                  onChangeText={setManualMinutes}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={Colors.neutral400}
                  style={styles.input}
                  maxLength={2}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setManualModalVisible(false)}
                style={[styles.modalButton, styles.cancelButton]}
                activeOpacity={0.8}
              >
                <Text fontWeight="bold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveManual}
                style={[styles.modalButton, styles.saveButton]}
                activeOpacity={0.8}
              >
                <Text fontWeight="bold" color={Colors.white}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default DailyEntrySleep;

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: Colors.modalBackdrop,
    justifyContent: "center",
    alignItems: "center",
    padding: Sizes.containerPaddingHorizontal,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: Colors.backgroundLighter,
    borderRadius: Sizes.mediumRadius,
    padding: Sizes.containerPaddingHorizontal,
    shadowColor: Colors.black,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  modalTitle: {
    marginBottom: hp(1),
    textAlign: "center",
  },
  inputsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: wp(2),
    marginBottom: hp(1.5),
  },
  inputWrap: {
    flex: 1,
  },
  inputLabel: {
    marginBottom: hp(0.5),
    color: Colors.neutral200,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Sizes.smallRadius || 8,
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: wp(2),
  },
  modalButton: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderRadius: Sizes.smallRadius || 8,
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveButton: {
    backgroundColor: Colors.primary500,
  },
});

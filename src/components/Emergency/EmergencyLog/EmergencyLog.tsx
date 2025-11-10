// components/Emergency/EmergencyLogCard.tsx
import React, { useMemo, useRef, useState } from "react";
import { View, StyleSheet, AccessibilityRole, Platform } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import ExpandableCard from "@/components/Emergency/EmergencyExpandableCard";
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";
import Colors from "@/constants/colors";
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

export type SymptomLogState<S extends string, T extends string> = {
  startTime: string; // "HH:mm"
  painLevel: number;
  symptoms: S[];
  triggers: T[];
};

type Props<S extends string, T extends string> = {
  title?: string;
  defaultExpanded?: boolean;
  symptoms: readonly S[];
  triggers: readonly T[];
  symptomLog: SymptomLogState<S, T>;
  onSetStartTime: (time: string) => void;
  onSetPainLevel: (level: number) => void;
  onToggleSymptom: (symptom: S) => void;
  onToggleTrigger: (trigger: T) => void;
  onGenerateReport: () => void;
};

function toTodayWithTime(dateLike?: Date) {
  const now = new Date();
  const d = dateLike ?? now;
  const out = new Date();
  out.setHours(d.getHours(), d.getMinutes(), 0, 0);
  return out;
}

function formatHHmm(d: Date) {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function EmergencyLogCard<S extends string, T extends string>({
  title = "Log This Episode",
  defaultExpanded = false,
  symptoms,
  triggers,
  symptomLog,
  onSetStartTime,
  onSetPainLevel,
  onToggleSymptom,
  onToggleTrigger,
  onGenerateReport,
}: Props<S, T>) {
  const initialPicked = useMemo(() => {
    if (!symptomLog.startTime) return toTodayWithTime();
    const [hh = "00", mm = "00"] = symptomLog.startTime.split(":");
    const dt = new Date();
    dt.setHours(Number(hh), Number(mm), 0, 0);
    return dt;
  }, [symptomLog.startTime]);

  const [timeForToday, setTimeForToday] = useState<Date>(initialPicked);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const iosCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePickTimePress = () => setShowTimePicker(true);

  const handleTimeChange = (event: DateTimePickerEvent, selected?: Date) => {
    // Android sends type set or dismissed
    // iOS fires set continuously while spinning
    if (event.type === "dismissed") {
      setShowTimePicker(false);
      return;
    }

    const chosen = selected ?? timeForToday;
    const normalized = toTodayWithTime(chosen);
    setTimeForToday(normalized);
    onSetStartTime(formatHHmm(normalized));

    if (Platform.OS === "android") {
      setShowTimePicker(false);
    } else {
      // close shortly after first set so it feels instant
      if (iosCloseTimer.current) clearTimeout(iosCloseTimer.current);
      iosCloseTimer.current = setTimeout(() => {
        setShowTimePicker(false);
      }, 120);
    }
  };

  const setNow = () => {
    const normalized = toTodayWithTime(new Date());
    setTimeForToday(normalized);
    onSetStartTime(formatHHmm(normalized));
    setShowTimePicker(false);
  };

  return (
    <ExpandableCard
      title={title}
      icon={<Text fontSize={getFontSize(20)}>📝</Text>}
      defaultExpanded={defaultExpanded}
    >
      <View style={styles.cardInner}>
        <Text
          fontSize={getFontSize(16)}
          fontWeight="bold"
          style={styles.cardTitle}
          color={Colors.text}
        >
          Log Your Symptoms
        </Text>

        {/* Start Time */}
        <View style={styles.logSection}>
          <Text
            fontSize={getFontSize(14)}
            fontWeight="medium"
            style={styles.logLabel}
            color={Colors.text}
          >
            When did the migraine start
          </Text>

          <View style={styles.row}>
            <MyTouchableOpacity
              style={[styles.timeButton, { marginRight: wp(2) }]}
              onPress={setNow}
              accessible
              accessibilityRole={"button" as AccessibilityRole}
              accessibilityLabel="Set start time to now"
              accessibilityHint="Sets the timer start time to the current time"
              hitSlop={8}
            >
              <Text fontSize={getFontSize(14)} color={Colors.primary}>
                Set Now
              </Text>
            </MyTouchableOpacity>

            <MyTouchableOpacity
              style={styles.timeButton}
              onPress={handlePickTimePress}
              accessible
              accessibilityRole={"button" as AccessibilityRole}
              accessibilityLabel="Pick start time today"
              accessibilityHint="Open the time picker to select a start time for today"
              hitSlop={8}
            >
              <Text fontSize={getFontSize(14)} color={Colors.primary}>
                {symptomLog.startTime || "Pick Time"}
              </Text>
            </MyTouchableOpacity>
          </View>

          {showTimePicker && (
            <View style={{ marginTop: hp(1), width: "100%" }}>
              <View style={styles.pickerWrap}>
                <DateTimePicker
                  value={timeForToday}
                  mode="time"
                  is24Hour
                  display={Platform.select({
                    ios: "spinner",
                    android: "default",
                  })}
                  textColor={Colors.text}
                  onChange={handleTimeChange}
                />
              </View>
            </View>
          )}
        </View>

        {/* Pain Level */}
        <View style={styles.logSection}>
          <Text
            fontSize={getFontSize(14)}
            fontWeight="medium"
            style={styles.logLabel}
            color={Colors.text}
          >
            How bad is it. 1 to 10
          </Text>
          <View style={styles.painLevelContainer}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => {
              const selected = symptomLog.painLevel === level;
              return (
                <MyTouchableOpacity
                  key={level}
                  style={[
                    styles.painLevelButton,
                    selected && styles.selectedPainLevel,
                  ]}
                  onPress={() => onSetPainLevel(level)}
                  accessible
                  accessibilityRole={"button" as AccessibilityRole}
                  accessibilityLabel={`Set pain level to ${level}`}
                  accessibilityHint={`Sets the pain level to ${level} out of the scale`}
                  accessibilityState={{ selected: !!selected }}
                  hitSlop={8}
                >
                  <Text
                    fontSize={getFontSize(12)}
                    color={selected ? Colors.white : Colors.text}
                    fontWeight={selected ? "bold" : "regular"}
                  >
                    {level}
                  </Text>
                </MyTouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Symptoms */}
        <View style={styles.logSection}>
          <Text
            fontSize={getFontSize(14)}
            fontWeight="medium"
            style={styles.logLabel}
            color={Colors.text}
          >
            Which symptoms
          </Text>
          <View style={styles.optionButtons}>
            {symptoms.map((symptom) => {
              const selected = symptomLog.symptoms.includes(symptom);
              return (
                <MyTouchableOpacity
                  key={symptom}
                  style={[
                    styles.optionButton,
                    selected && styles.selectedOption,
                  ]}
                  onPress={() => onToggleSymptom(symptom)}
                  accessible
                  accessibilityRole={"button" as AccessibilityRole}
                  accessibilityLabel={`Toggle symptom ${symptom}`}
                  accessibilityHint={`Toggles ${symptom} as an active symptom`}
                  accessibilityState={{ selected: !!selected }}
                  hitSlop={8}
                >
                  <Text
                    fontSize={getFontSize(12)}
                    color={selected ? Colors.white : Colors.text}
                  >
                    {symptom}
                  </Text>
                </MyTouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Triggers */}
        <View style={styles.logSection}>
          <Text
            fontSize={getFontSize(14)}
            fontWeight="medium"
            style={styles.logLabel}
            color={Colors.text}
          >
            What do you think triggered it
          </Text>
          <View style={styles.optionButtons}>
            {triggers.map((trigger) => {
              const selected = symptomLog.triggers.includes(trigger);
              return (
                <MyTouchableOpacity
                  key={trigger}
                  style={[
                    styles.optionButton,
                    selected && styles.selectedOption,
                  ]}
                  onPress={() => onToggleTrigger(trigger)}
                  accessibilityRole={"button" as AccessibilityRole}
                  accessibilityLabel={`Toggle trigger ${trigger}`}
                >
                  <Text
                    fontSize={getFontSize(12)}
                    color={selected ? Colors.white : Colors.text}
                  >
                    {trigger}
                  </Text>
                </MyTouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      <MyTouchableOpacity
        style={styles.reportButton}
        onPress={onGenerateReport}
        accessibilityRole={"button" as AccessibilityRole}
        accessibilityLabel="Save episode and generate report"
      >
        <Text
          fontSize={getFontSize(14)}
          color={Colors.white}
          fontWeight="medium"
        >
          Save Episode and Generate Report
        </Text>
      </MyTouchableOpacity>
    </ExpandableCard>
  );
}

const styles = StyleSheet.create({
  cardInner: {
    backgroundColor: Colors.backgroundLighter,
    padding: wp(4),
    borderRadius: wp(3),
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: { marginBottom: hp(0.5) },
  logSection: { marginTop: hp(1.5) },
  logLabel: { marginBottom: hp(1) },
  row: { flexDirection: "row", alignItems: "center" },
  timeButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
    alignItems: "center",
  },
  pickerWrap: { width: "100%", alignItems: "center", justifyContent: "center" },
  painLevelContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp(1.5),
    marginTop: hp(1),
  },
  painLevelButton: {
    backgroundColor: Colors.background,
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: wp(8),
    alignItems: "center",
  },
  selectedPainLevel: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp(2),
    marginTop: hp(1),
  },
  optionButton: {
    backgroundColor: Colors.background,
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedOption: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  reportButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    alignItems: "center",
    marginTop: hp(2),
  },
});

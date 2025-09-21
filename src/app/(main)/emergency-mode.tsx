// app/EmergencyModePage.tsx
import React, { useState } from "react";
import { StyleSheet, View, ScrollView, AccessibilityRole } from "react-native";
import { useRouter } from "expo-router";
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";
import Colors from "@/constants/colors";
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";
import ColdTherapyVisual from "@/components/Emergency/ColdTherapy/ColdTherapyVisual";
import ExpandableCard from "@/components/Emergency/EmergencyExpandableCard";
import EmergencyLogCard, {
  SymptomLogState,
} from "@/components/Emergency/EmergencyLog/EmergencyLog";
import BreathingExercise from "@/components/Emergency/Breathing/BreathingExercise";
import { Ionicons } from "@expo/vector-icons";

type StepId = "darken" | "cold" | "ginger" | "water" | "breathing";
type CompletedSteps = Partial<Record<StepId, boolean>>;

const SYMPTOMS = [
  "Pounding",
  "Aura",
  "Light Sensitivity",
  "Nausea",
  "Vomiting",
  "Sound Sensitivity",
  "Dizziness",
] as const;

const TRIGGERS = [
  "Stress",
  "Skipped Meals",
  "Weather",
  "Dehydration",
  "Hormones",
  "Sleep Issues",
  "Screen Time",
  "I don't know",
] as const;

type Symptom = (typeof SYMPTOMS)[number];
type Trigger = (typeof TRIGGERS)[number];

// give the generic concrete unions
type LogState = SymptomLogState<Symptom, Trigger>;

const EmergencyModePage: React.FC = () => {
  const router = useRouter();

  const [completedSteps, setCompletedSteps] = useState<CompletedSteps>({});
  const [symptomLog, setSymptomLog] = useState<LogState>({
    startTime: "",
    painLevel: 5,
    symptoms: [],
    triggers: [],
  });

  const markStepCompleted = (stepId: StepId) => {
    setCompletedSteps(
      (prev: CompletedSteps): CompletedSteps => ({
        ...prev,
        [stepId]: !prev[stepId],
      })
    );
  };

  const toggleSymptom = (symptom: Symptom) => {
    setSymptomLog(
      (prev: LogState): LogState => ({
        ...prev,
        symptoms: prev.symptoms.includes(symptom)
          ? prev.symptoms.filter((s) => s !== symptom)
          : [...prev.symptoms, symptom],
      })
    );
  };

  const toggleTrigger = (trigger: Trigger) => {
    setSymptomLog(
      (prev: LogState): LogState => ({
        ...prev,
        triggers: prev.triggers.includes(trigger)
          ? prev.triggers.filter((t) => t !== trigger)
          : [...prev.triggers, trigger],
      })
    );
  };

  const updatePainLevel = (level: number) => {
    setSymptomLog(
      (prev: LogState): LogState => ({ ...prev, painLevel: level })
    );
  };

  const updateStartTime = (time: string) => {
    setSymptomLog((prev: LogState): LogState => ({ ...prev, startTime: time }));
  };

  const generateReport = () => {
    // save and share logic
  };

  // Close all expandable cards when navigating back
  React.useEffect(() => {
    return () => {
      // Cleanup if needed when component unmounts
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text
          fontSize={getFontSize(24)}
          fontWeight="bold"
          textCenter
          color={Colors.text}
        >
          Emergency Relief
        </Text>
        <MyTouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
          accessibilityRole={"button" as AccessibilityRole}
          accessibilityLabel="Close emergency mode"
        >
          <Text fontSize={getFontSize(18)} color={Colors.gray}>
            ✕
          </Text>
        </MyTouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Section A */}
        <View style={styles.section}>
          <Text
            fontSize={getFontSize(18)}
            fontWeight="bold"
            style={styles.sectionTitle}
            color={Colors.text}
          >
            Immediate Comfort
          </Text>

          <ExpandableCard
            title="Darken Your Environment"
            icon={<Text fontSize={getFontSize(24)}>🌙</Text>}
            subtitle="Turn off lights, close curtains, and reduce screen brightness"
            defaultExpanded
            expandable={false}
          >
            <MyTouchableOpacity
              style={[
                styles.actionButton,
                completedSteps.darken && styles.completedButton,
              ]}
              onPress={() => markStepCompleted("darken")}
              accessibilityRole={"button" as AccessibilityRole}
              accessibilityLabel={
                completedSteps.darken
                  ? "Marked darken as done"
                  : "Mark darken as complete"
              }
            >
              <Text
                fontSize={getFontSize(14)}
                style={
                  completedSteps.darken
                    ? styles.completedButtonText
                    : styles.actionButtonText
                }
                fontWeight="medium"
              >
                {completedSteps.darken ? "Done ✓" : "Mark Complete"}
              </Text>
            </MyTouchableOpacity>
          </ExpandableCard>
        </View>

        {/* Section B */}
        <View style={styles.section}>
          <Text
            fontSize={getFontSize(18)}
            fontWeight="bold"
            style={styles.sectionTitle}
            color={Colors.text}
          >
            Active Relief
          </Text>

          <ExpandableCard
            title="Apply Cold Therapy"
            icon={<Text fontSize={getFontSize(24)}>❄️</Text>}
            subtitle="Place cold pack on forehead, temples, or back of neck"
            defaultExpanded={false}
          >
            <ColdTherapyVisual
              defaultMinutes={15}
              onComplete={() => markStepCompleted("cold")}
            />
          </ExpandableCard>

          <ExpandableCard
            title="Breathing Exercises"
            subtitle="4-7-8 breathing technique for relaxation and pain relief"
            icon={<Text fontSize={getFontSize(24)}>🧘‍♂️</Text>}
            defaultExpanded={false}
          >
            <BreathingExercise
              cycles={3}
              onComplete={() => markStepCompleted("breathing")}
            />
          </ExpandableCard>

          <ExpandableCard
            title="Ginger Relief"
            icon={<Text fontSize={getFontSize(24)}>🫚</Text>}
            subtitle="Take 250mg of ginger powder with water"
            defaultExpanded={false}
            expandable={false}
          >
            <MyTouchableOpacity
              style={[
                styles.actionButton,
                completedSteps.ginger && styles.completedButton,
              ]}
              onPress={() => markStepCompleted("ginger")}
              accessibilityRole={"button" as AccessibilityRole}
              accessibilityLabel={
                completedSteps.ginger
                  ? "Marked ginger relief as done"
                  : "Mark ginger relief as complete"
              }
            >
              <Text
                fontSize={getFontSize(14)}
                style={
                  completedSteps.ginger
                    ? styles.completedButtonText
                    : styles.actionButtonText
                }
                fontWeight="medium"
              >
                {completedSteps.ginger ? "Done ✓" : "Mark Complete"}
              </Text>
            </MyTouchableOpacity>
          </ExpandableCard>

          <ExpandableCard
            title="Stay Hydrated"
            icon={<Text fontSize={getFontSize(24)}>💧</Text>}
            subtitle="Drink water slowly. Small sips if nauseous."
            defaultExpanded={false}
            expandable={false}
          >
            <MyTouchableOpacity
              style={[
                styles.actionButton,
                completedSteps.water && styles.completedButton,
              ]}
              onPress={() => markStepCompleted("water")}
              accessibilityRole={"button" as AccessibilityRole}
              accessibilityLabel={
                completedSteps.water
                  ? "Marked hydration as done"
                  : "Mark hydration as complete"
              }
            >
              <Text
                fontSize={getFontSize(14)}
                style={
                  completedSteps.water
                    ? styles.completedButtonText
                    : styles.actionButtonText
                }
                fontWeight="medium"
              >
                {completedSteps.water ? "Done ✓" : "Mark Complete"}
              </Text>
            </MyTouchableOpacity>
          </ExpandableCard>
        </View>

        {/* Section C */}
        <View style={styles.section}>
          <EmergencyLogCard<Symptom, Trigger>
            symptoms={SYMPTOMS}
            triggers={TRIGGERS}
            symptomLog={symptomLog}
            onSetStartTime={updateStartTime}
            onSetPainLevel={updatePainLevel}
            onToggleSymptom={toggleSymptom}
            onToggleTrigger={toggleTrigger}
            onGenerateReport={generateReport}
            defaultExpanded={false}
          />
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

export default EmergencyModePage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: wp(2),
    borderRadius: wp(6),
    backgroundColor: Colors.backgroundLighter,
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: wp(5) },
  section: { marginTop: hp(3) },
  sectionTitle: { marginBottom: hp(2) },
  actionButton: {
    backgroundColor: Colors.backgroundLighter,
    borderWidth: 1,
    borderColor: Colors.primary300,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    alignItems: "center",
  },
  actionButtonText: { color: Colors.primary300 },
  completedButton: {
    backgroundColor: Colors.primary500 + "8A",
    borderColor: "transparent",
  },
  completedButtonText: { color: Colors.neutral100 },
  bottomSpacing: { height: hp(5) },
  breathingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.backgroundLighter,
    borderWidth: 1,
    borderColor: Colors.primary300,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
  },
});

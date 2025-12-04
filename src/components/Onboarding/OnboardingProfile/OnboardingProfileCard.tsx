import React, { useState, memo } from "react";
import { StyleSheet, View } from "react-native";
import Text from "@/components/common/Text";
import { Colors, Sizes } from "@/constants";
import { hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";
import { OptionScale } from "./Fields/OptionScale";
import { OptionToggle } from "./Fields/OptionToggle";
import { OptionChoice } from "@/components/Onboarding/OnboardingProfile/Fields/OptionChoice";

import { useOnboardingStore } from "@/store/onboarding/useOnboardingStore";
import type { OnboardingMigraineProfileSetup } from "@/store/onboarding/useOnboardingStore.types";

// ---------- Types for UI ----------
type OptionId =
  | "ageRange"
  | "gender"
  | "meals"
  | "caffeine"
  | "sleepDuration"
  | "waterIntake"
  | "stress"
  | "weatherSensitivity"
  | "exercise"
  | "alcohol"
  | "smoking";

type BaseOption = {
  id: OptionId;
  title: string;
  required: boolean;
  helperText?: string;
  description?: string;
};

type ChoiceValue = number | string | boolean;

type ChoiceOption = BaseOption & {
  kind: "choice";
  choices: { value: ChoiceValue; label: string }[];
  isPlusValue?: number;
};
type ToggleOption = BaseOption & { kind: "toggle" };
// Place this near your config
const RESET_DEFAULTS: Record<
  | "meals"
  | "caffeine"
  | "sleepDuration"
  | "waterIntake"
  | "stress"
  | "weatherSensitivity"
  | "exercise"
  | "alcohol"
  | "smoking",
  number | boolean | null
> = {
  meals: null,
  caffeine: null,
  sleepDuration: null,
  waterIntake: null,
  stress: null,
  weatherSensitivity: null, // store uses boolean
  exercise: null,
  alcohol: null,
  smoking: null,
};
type ScaleOption = BaseOption & {
  kind: "scale";
  min: number;
  max: number;
  step?: number;
  leftLabel?: string;
  rightLabel?: string;
};

type OptionConfig = ChoiceOption | ToggleOption | ScaleOption;

// ---------- Config with descriptions ----------
const ALL_OPTIONS: OptionConfig[] = [
  {
    id: "ageRange",
    title: "Age Range",
    description: "Please select your age range",
    required: true,
    kind: "choice",
    choices: [
      { value: 0, label: "<18" },
      { value: 1, label: "18-24" },
      { value: 2, label: "25-34" },
      { value: 3, label: "35-44" },
      { value: 4, label: "45-54" },
      { value: 5, label: "55-64" },
      { value: 6, label: "65+" },
    ],
  },
  {
    id: "gender",
    title: "Gender",
    description: "Please select your gender",
    required: true,
    kind: "choice",
    choices: [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
      { value: "other", label: "Other" },
      { value: "prefer-not-to-say", label: "Prefer not to say" },
    ],
  },

  {
    id: "meals",
    title: "Meals",
    description: "How many meals do you eat per day on average",
    required: true,
    kind: "choice",
    choices: [
      { value: 0, label: "0" },
      { value: 1, label: "1" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4+" },
    ],
    isPlusValue: 4,
  },
  {
    id: "caffeine",
    title: "Caffeine",
    description: "How many caffeinated drinks do you have per day",
    required: true,
    kind: "choice",
    choices: [
      { value: 0, label: "0" },
      { value: 1, label: "1 to 2" },
      { value: 2, label: "3" },
      { value: 3, label: "4+" },
    ],
  },
  {
    id: "sleepDuration",
    title: "Sleep",
    description: "How long do you sleep on average every night",
    required: true,
    kind: "choice",
    choices: [
      { value: 0, label: "<5 h" },
      { value: 1, label: "5 to 6 h" },
      { value: 2, label: "6 to 7 h" },
      { value: 3, label: "7 to 8 h" },
      { value: 4, label: "8 h+" },
    ],
    isPlusValue: 4,
  },
  {
    id: "waterIntake",
    title: "Water intake",
    description: "How many liters of water do you drink per day",
    required: true,
    kind: "choice",
    choices: [
      { value: 0, label: "<1 Liter" },
      { value: 1, label: "1 to 2" },
      { value: 2, label: "2 to 3" },
      { value: 3, label: "3+" },
    ],
    isPlusValue: 3,
  },
  {
    id: "stress",
    title: "Stress",
    description: "How stressed do you feel on average",
    required: true,
    kind: "choice",
    choices: [
      { value: 1, label: "😌" },
      { value: 2, label: "🙂" },
      { value: 3, label: "😐" },
      { value: 4, label: "😟" },
      { value: 5, label: "😫" },
    ],
  },
  {
    id: "weatherSensitivity",
    title: "Weather sensitivity",
    description: "Do you notice symptoms getting worse with certain weather",
    required: false,
    kind: "choice",
    choices: [
      { value: true, label: "Yes" },
      { value: false, label: "No" },
    ],
  },
  {
    id: "exercise",
    title: "Exercise",
    description: "How often do you exercise per week",
    required: false,
    kind: "choice",
    choices: [
      { value: 0, label: "0" },
      { value: 1, label: "1 to 2" },
      { value: 2, label: "3 to 4" },
      { value: 3, label: "5+" },
    ],
    isPlusValue: 3,
  },
  {
    id: "alcohol",
    title: "Alcohol",
    description: "How often do you drink alcohol",
    required: false,
    kind: "choice",
    choices: [
      { value: 0, label: "Never" },
      { value: 1, label: "Once a month" },
      { value: 2, label: "Once a week" },
      { value: 3, label: "Almost every day" },
    ],
  },
  {
    id: "smoking",
    title: "Smoking",
    description: "Do you smoke?",
    required: false,
    kind: "choice",
    choices: [
      { value: 0, label: "No" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Regularly" },
    ],
  },
];

const TEST_VALUES = {
  ageRange: 2,
  gender: "male",
  meals: 3,
  caffeine: 0,
  sleepDuration: 3,
  waterIntake: 2,
  stress: 4,
  weatherSensitivity: true,
  exercise: 1,
  alcohol: 0,
  smoking: 0,
};
const OnboardingProfileCard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const updateMigraineProfile = useOnboardingStore(
    (s) => s.updateMigraineProfile
  );
  const values = useOnboardingStore((s) => s.data.migraineProfile) as
    | OnboardingMigraineProfileSetup
    | undefined;

  const current = ALL_OPTIONS[currentIndex];

  // Write through to the store with field aware typing
  const setValue = (id: OptionId, v: number | boolean | null) => {
    const patch: Partial<OnboardingMigraineProfileSetup> = {};

    // if (id === "weatherSensitivity") {
    //   // store expects boolean
    //   if (v === null) {
    //     // do not overwrite boolean with null
    //     // simply do nothing to avoid the TS error and keep current value
    //     updateMigraineProfile({});
    //     return;
    //   }
    //   patch.weatherSensitivity = v === 1;
    //   updateMigraineProfile(patch);
    //   return;
    // }

    // fields that allow null in the store
    const nullableNumberFields: OptionId[] = ["exercise", "alcohol", "smoking"];

    if (v === null) {
      if (nullableNumberFields.includes(id)) {
        // safe to set null
        patch[id] = null;
        updateMigraineProfile(patch);
      } else {
        // required numeric fields do not accept null
        // ignore the reset for these
        updateMigraineProfile({});
      }
      return;
    }

    // normal write for numbers or booleans
    // @ts-expect-error index access with typed key
    patch[id] = v;
    updateMigraineProfile(patch);

    // Auto-advance to next question after a short delay
    setTimeout(() => {
      setCurrentIndex((prev) => {
        // clamp to last index so we never go out-of-bounds
        if (prev >= ALL_OPTIONS.length - 1) return prev;
        return prev + 1;
      });
    }, 300);
  };

  const readChoiceValue = (id: OptionId): number | null => {
    if (!values) return null;

    // if (id === "weatherSensitivity") {
    //   const b = values.weatherSensitivity;
    //   // map boolean to choice value
    //   return b === true ? 1 : b === false ? 0 : null;
    // }

    const raw = values[id as keyof OnboardingMigraineProfileSetup] as
      | number
      | null
      | undefined;

    return raw ?? null;
  };

  const isFilled = (id: OptionId) => {
    if (!values) return false;
    const v = values[id as keyof OnboardingMigraineProfileSetup] as
      | number
      | boolean
      | null
      | undefined;
    return v !== null && v !== undefined && v !== "";
  };

  const canGoNext = () => {
    if (!current.required) return true;
    return isFilled(current.id);
  };

  const next = () => {
    if (currentIndex < ALL_OPTIONS.length - 1) {
      if (!canGoNext()) return;
      setCurrentIndex((i) => i + 1);
    }
  };

  const prev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const onTestValues = () => {
    Object.entries(TEST_VALUES).forEach(([k, v]) => {
      setValue(k as OptionId, v as any);
    });
  };

  const resetCurrent = () => {
    const id = current.id;
    // @ts-ignore
    const v = RESET_DEFAULTS[id];
    // write the correct default for this field
    setValue(id, v as any);
  };

  const hasValue = isFilled(current.id);

  return (
    <View style={styles.container}>
      {/* Top */}
      <View style={styles.top}>
        <Text
          style={[styles.sideText, { left: Sizes.containerPaddingHorizontal }]}
          fontWeight="lightitalic"
          fontSize={getFontSize(14)}
        >
          {currentIndex + 1} of {ALL_OPTIONS.length}
        </Text>

        <Text style={styles.centerTitle}>{current.title}</Text>

        <Text
          style={[styles.sideText, { right: Sizes.containerPaddingHorizontal }]}
          fontWeight="lightitalic"
          fontSize={getFontSize(14)}
        >
          {current.required ? "Required" : "Optional"}
        </Text>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {current.description ? (
          <Text style={styles.description} color={Colors.neutral300}>
            {current.description}
          </Text>
        ) : null}

        {current.kind === "choice" && (
          <OptionChoice
            option={current}
            value={readChoiceValue(current.id)}
            onChange={(v) => setValue(current.id, v)}
            allowNull={!current.required}
          />
        )}

        {current.kind === "toggle" && (
          <OptionToggle
            option={current}
            value={
              (values?.[current.id as keyof OnboardingMigraineProfileSetup] as
                | boolean
                | null
                | undefined) ?? null
            }
            onChange={(v) => setValue(current.id, v)}
            allowNull
          />
        )}

        {current.kind === "scale" && (
          <OptionScale
            option={current}
            value={readChoiceValue(current.id)}
            onChange={(v) => setValue(current.id, v)}
            allowNull={!current.required}
          />
        )}
      </View>

      {/* Bottom with centered Reset */}
      <View style={styles.bottom}>
        <View style={styles.third}>
          <Text
            style={styles.prev}
            onPress={prev}
            fontSize={getFontSize(16)}
            color={currentIndex === 0 ? Colors.neutral400 : Colors.text}
          >
            Previous
          </Text>
        </View>

        <View style={styles.third}>
          <Text
            style={styles.reset}
            onPress={hasValue ? resetCurrent : undefined}
            fontSize={getFontSize(15)}
            color={hasValue ? Colors.text : Colors.neutral400}
          >
            Reset
          </Text>
          {/* <Text
            style={styles.reset}
            onPress={onTestValues}
            fontSize={getFontSize(15)}
            color={hasValue ? Colors.text : Colors.neutral400}
          >
            Test
          </Text> */}
        </View>

        <View style={styles.third}>
          <Text
            style={styles.next}
            onPress={
              canGoNext() && currentIndex < ALL_OPTIONS.length - 1
                ? next
                : undefined
            }
            fontSize={getFontSize(16)}
            color={
              !canGoNext() || currentIndex === ALL_OPTIONS.length - 1
                ? Colors.neutral400
                : Colors.text
            }
          >
            Next
          </Text>
        </View>
      </View>
    </View>
  );
};

export default memo(OnboardingProfileCard);

// ---------- styles ----------
const styles = StyleSheet.create({
  container: {
    borderColor: Colors.neutral500,
    borderWidth: 1,
    flex: 1,
    marginVertical: hp(3),
    borderRadius: Sizes.mediumRadius,
    paddingVertical: hp(1.5),
    backgroundColor: Colors.neutral800,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    justifyContent: "center",
  },
  sideText: { position: "absolute" },
  centerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: getFontSize(18),
    fontWeight: "bold",
  },
  description: {
    textAlign: "center",
    paddingHorizontal: Sizes.containerPaddingHorizontal,
    marginTop: hp(0.5),
    marginBottom: hp(1),
  },
  body: {
    flex: 1,
    paddingHorizontal: Sizes.containerPaddingHorizontal,
    paddingVertical: hp(1.5),
    alignItems: "center",
    justifyContent: "center",
    gap: hp(1),
  },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1),
    paddingHorizontal: Sizes.containerPaddingHorizontal * 2,
  },
  third: {
    flex: 1,
    alignItems: "center",
  },
  prev: {
    textDecorationLine: "underline",
    textAlign: "left",
    width: "100%",
  },
  reset: {
    textAlign: "center",
  },
  next: {
    textDecorationLine: "underline",
    textAlign: "right",
    width: "100%",
  },
});

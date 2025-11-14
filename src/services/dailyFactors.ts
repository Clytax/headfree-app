export type FactorKey =
  | "migraineToday"
  | "stress"
  | "emotion"
  | "caffeine"
  | "meals"
  | "chocolateOrCheese"
  | "overEating"
  | "alcohol"
  | "smoking"
  | "traveled"
  | "lightExposure"
  | "location"
  | "sleep"
  | "menstrualCycle";
export type FactorKind = "choice" | "boolean" | "object" | "number" | "text";

export interface Choice<T = number | boolean | string> {
  value: T;
  label: string;
}

export interface FactorMeta<T = any> {
  key: FactorKey;
  kind: FactorKind;
  required?: boolean;
  initial: T | null;
  title?: string;
  description?: string;
  choices?: Choice[];
}
export const FACTORS: readonly FactorMeta[] = [
  {
    key: "migraineToday",
    kind: "choice",
    required: true,
    initial: null,
    title: "Migraine Today",
    description: "Did you have a migraine today",
    choices: [
      { value: 0, label: "🙂 No" },
      { value: 1, label: "🤕 Yes" },
    ],
  },
  {
    key: "stress",
    kind: "choice",
    required: true,
    initial: null,
    title: "Stress Level",
    description: "How stressed did you feel today",
    choices: [
      { value: 1, label: "😌 Very Low" },
      { value: 2, label: "🙂 Low" },
      { value: 3, label: "😐 Moderate" },
      { value: 4, label: "😟 High" },
      { value: 5, label: "😫 Very High" },
    ],
  },
  {
    key: "emotion",
    kind: "choice",
    initial: null,
    title: "Overall Emotion",
    description: "How was your overall emotional state today",
    choices: [
      { value: 1, label: "😃 Very Positive" },
      { value: 2, label: "🙂 Positive" },
      { value: 3, label: "😐 Neutral" },
      { value: 4, label: "😟 Negative" },
      { value: 5, label: "😭 Very Negative" },
    ],
  },

  {
    key: "caffeine",
    kind: "choice",
    initial: null,
    title: "Caffeine Consumption",
    description: "How much caffeine did you consume",
    choices: [
      { value: 0, label: "☕ None" },
      { value: 1, label: "☕ 1–2 cups" },
      { value: 2, label: "☕ 3+ cups" },
    ],
  },

  {
    key: "meals",
    kind: "choice",
    required: true,
    initial: null,
    title: "Meal Count",
    description: "How many meals did you have",
    choices: [
      { value: 0, label: "🍽 None" },
      { value: 1, label: "🍽 1 meal" },
      { value: 2, label: "🍽 2 meals" },
      { value: 3, label: "🍽 3 meals" },
      { value: 4, label: "🍽 4+ meals" },
    ],
  },
  {
    key: "chocolateOrCheese",
    kind: "choice",
    initial: null,
    title: "Chocolate or Cheese",
    description: "Did you consume chocolate or cheese today",
    choices: [
      { value: 0, label: "🍫🧀 None" },
      { value: 1, label: "🍫🧀 A little" },
      { value: 2, label: "🍫🧀 A lot" },
    ],
  },
  {
    key: "overEating",
    kind: "choice",
    initial: null,
    title: "Overeating",
    description: "Did you overeat today",
    choices: [
      { value: 0, label: "🍔 No" },
      { value: 1, label: "🍔 A little" },
      { value: 2, label: "🍔 A lot" },
    ],
  },
  {
    key: "alcohol",
    kind: "choice",
    initial: null,
    title: "Alcohol Consumption",
    description: "Did you consume alcohol today",
    choices: [
      { value: 0, label: "🍺 No" },
      { value: 1, label: "🍺 A little" },
      { value: 2, label: "🍺 A lot" },
    ],
  },
  {
    key: "smoking",
    kind: "choice",
    initial: null,
    title: "Smoking",
    description: "Did you smoke today",
    choices: [
      { value: 0, label: "🚭 No" },
      { value: 1, label: "🚬 A little" },
      { value: 2, label: "🚬 A lot" },
    ],
  },
  {
    key: "traveled",
    kind: "choice",
    initial: null,
    title: "Travel",
    description: "Did you travel today",
    choices: [
      { value: false, label: "🛫 No" },
      { value: true, label: "🛫 Yes" },
    ],
  },
  {
    key: "lightExposure",
    kind: "choice",
    initial: null,
    required: false,
    title: "Problematic Light",
    description: "Were you bothed by light exposure today",
    choices: [
      { value: 0, label: "💡 No Issue" },
      { value: 1, label: "💡 Mild discomfort (bright screens, fluorescents)" },
      { value: 2, label: "💡 Significant exposure (harsh lighting, glare)" },
    ],
  },
  { key: "sleep", kind: "object", initial: null },
  { key: "location", kind: "object", initial: null },
  { key: "menstrualCycle", kind: "object", initial: null },
] as const;

export const FACTOR_KEYS = FACTORS.map((f) => f.key) as readonly FactorKey[];
export const REQUIRED_KEYS = FACTORS.filter((f) => f.required).map(
  (f) => f.key
) as readonly FactorKey[];

export const isFactorKey = (k: string): k is FactorKey =>
  FACTOR_KEYS.includes(k as FactorKey);

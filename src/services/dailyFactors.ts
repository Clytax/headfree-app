export type FactorKey =
  | "stress"
  | "emotion"
  | "water"
  | "caffeine"
  | "neckPain"
  | "meals"
  | "chocolateOrCheese"
  | "overEating"
  | "alcohol"
  | "smoking"
  | "traveled"
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
    key: "water",
    kind: "choice",
    required: true,
    initial: null,
    title: "Water Intake",
    description: "How many liters of water did you drink",
    choices: [
      { value: 0, label: "💧 <1L" },
      { value: 1, label: "💧 1–2L" },
      { value: 2, label: "💧 2–3L" },
      { value: 3, label: "💧 3L+" },
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
    key: "neckPain",
    kind: "choice",
    initial: null,
    title: "Neck Pain",
    description: "Did you experience neck pain today",
    choices: [
      { value: 0, label: "😃 None" },
      { value: 1, label: "😣 Mild" },
      { value: 2, label: "😭 Severe" },
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

import { formatFeatureName } from "@/components/Prediction/utils/predictionUtils";
const toSentenceFragment = (name: string): string => {
  // Lowercase first character so it fits after "your"
  const lower = name.charAt(0).toLowerCase() + name.slice(1);

  // Make "Today" → "today" so it reads naturally
  return lower.replace(" Today", " today");
};
const joinWithCommasAndAnd = (items: string[]): string => {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
};

export const getOutlookRiskFactorsText = (factors: string[]) => {
  if (!factors.length) {
    return "No significant risk factors today.";
  }

  const properFactors = factors.map((factor) => formatFeatureName(factor));
  const listText = joinWithCommasAndAnd(properFactors);

  return `Today's risk is mainly influenced by ${listText}.`;
};

export const getOutlookGuideText = (percentage: number) => {
  if (percentage > 75)
    return "Your chance to get a migraine today is higher. Take breaks, stay hydrated, and avoid known triggers.";
  if (percentage > 50)
    return "Your chance to get a migraine today is moderate. Maintain a balanced routine and monitor your stress levels.";
  return "Your chance to get a migraine today is low. Keep up the good habits and stay mindful of your triggers.";
};

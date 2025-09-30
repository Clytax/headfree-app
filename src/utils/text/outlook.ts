import { formatFeatureName } from "@/components/Prediction/utils/predictionUtils";

export const getOutlookRiskFactorsText = (factors: string[]) => {
  const properFactors = factors.map((factor) => formatFeatureName(factor));

  let baseText = "Today's risk is mainly influenced by your ";

  if (properFactors.length === 1) {
    baseText += `${properFactors[0]}.`;
  } else if (properFactors.length === 2) {
    baseText += `${properFactors[0]} and ${properFactors[1]}.`;
  } else if (properFactors.length > 2) {
    // For 3+ factors, join with commas and "and" before the last one
    baseText += `${properFactors[0]}, ${properFactors[1]}, and ${properFactors[2]}.`;
  } else {
    baseText = "No significant risk factors today.";
  }

  return baseText;
};

export const getOutlookGuideText = (percentage: number) => {
  if (percentage > 75)
    return "Your chance to get a migraine today is higher. Take breaks, stay hydrated, and avoid known triggers.";
  if (percentage > 50)
    return "Your chance to get a migraine today is moderate. Maintain a balanced routine and monitor your stress levels.";
  return "Your chance to get a migraine today is low. Keep up the good habits and stay mindful of your triggers.";
};

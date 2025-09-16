export const getOutlookRiskFactorsText = (factors: string[]) => {
  const properFactors = factors.map((factor) => {
    if (factor === "cycle") return "Menstrual Cycle";
    if (factor === "stress") return "Stress";
    if (factor === "sleep") return "Sleep";
    return factor.charAt(0).toUpperCase() + factor.slice(1);
  });

  let baseText = "Today's risk is mainly influenced by your ";

  if (properFactors.length === 1) {
    baseText += `${properFactors[0]}.`;
  } else if (properFactors.length === 2) {
    baseText += `${properFactors[0]} and ${properFactors[1]}.`;
  } else if (properFactors.length > 2) {
    baseText += properFactors.join(" and ") + ".";
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

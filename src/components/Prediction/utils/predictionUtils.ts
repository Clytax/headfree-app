import { Colors } from "@/constants";

export const formatFeatureName = (feature: string): string => {
  const nameMap: Record<string, string> = {
    stress_today: "Yesterday's Stress",
    stress_drop_today: "Yesterday's Stress Drop",
    consecutive_stress_days: "Consecutive Stress Days",

    lack_of_sleep_today: "Last Night's Sleep Duration",
    oversleeping_today: "Oversleeping Last Night",
    any_sleep_issue_today: "Sleep Issues Last Night",
    sleep_debt_3day: "Sleep Debt (3 Days)",
    sleep_disruption_today: "Sleep Disruption Last Night",
    sleep_variability_7day: "Sleep Variability (7 Days)",
    recent_weekend_sleep_issues: "Recent Weekend Sleep Issues",

    weather_change_today: "Yesterday's Weather Change",
    consecutive_weather_changes: "Consecutive Weather Changes",
    weather_instability_3day: "Weather Instability (3 Days)",
    weather_changes_3day_count: "Weather Changes (3 Day Count)",

    irregular_meals_today: "Irregular Meals Yesterday",
    overeating_today: "Overeating Yesterday",
    trigger_foods_today: "Trigger Foods Yesterday",
    excessive_caffeine_today: "Excessive Caffeine Yesterday",
    alcohol_today: "Yesterday's Alcohol Intake",
    excessive_smoking_today: "Excessive Smoking Yesterday",
    smoking_withdrawal_today: "Smoking Withdrawal Yesterday",
    consecutive_trigger_days: "Consecutive Trigger Days",

    exercise_today: "Yesterday's Exercise",
    travel_today: "Yesterday's Travel",
    consecutive_exercise_days: "Consecutive Exercise Days",
    consecutive_sedentary_days: "Consecutive Sedentary Days",
    exercise_days_7day: "Exercise Days (7 Days)",
    exercise_consistency_7day: "Exercise Consistency (7 Days)",
    exercise_disruption: "Exercise Disruption",
    travel_exercise_conflict: "Travel Exercise Conflict",

    menstruation_today: "Yesterday's Menstruation",
    ovulation_today: "Yesterday's Ovulation",
  };

  return (
    nameMap[feature] ||
    feature.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  );
};

// ["Very Low", "Low", "Moderate", "High", "Very High"]
export const getRiskColor = (riskLevel: string): string => {
  switch (riskLevel.toLowerCase()) {
    case "very high":
      return Colors.error500;
    case "high":
      return Colors.error300;
    case "moderate":
      return Colors.warning500;

    case "low":
      return Colors.success500;
    case "very low":
      return Colors.success300;
    default:
      return Colors.neutral500;
  }
};

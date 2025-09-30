import { Colors } from "@/constants";

export const formatFeatureName = (feature: string): string => {
  const nameMap: Record<string, string> = {
    stress_today: "Stress Today",
    stress_drop_today: "Stress Drop Today",
    consecutive_stress_days: "Consecutive Stress Days",
    lack_of_sleep_today: "Lack of Sleep Today",
    oversleeping_today: "Oversleeping Today",
    any_sleep_issue_today: "Any Sleep Issue Today",
    sleep_debt_3day: "Sleep Debt (3 Days)",
    sleep_disruption_today: "Sleep Disruption Today",
    sleep_variability_7day: "Sleep Variability (7 Days)",
    recent_weekend_sleep_issues: "Recent Weekend Sleep Issues",
    weather_change_today: "Weather Change Today",
    consecutive_weather_changes: "Consecutive Weather Changes",
    weather_instability_3day: "Weather Instability (3 Days)",
    weather_changes_3day_count: "Weather Changes (3 Day Count)",
    irregular_meals_today: "Irregular Meals Today",
    overeating_today: "Overeating Today",
    trigger_foods_today: "Trigger Foods Today",
    excessive_caffeine_today: "Excessive Caffeine Today",
    alcohol_today: "Alcohol Today",
    excessive_smoking_today: "Excessive Smoking Today",
    smoking_withdrawal_today: "Smoking Withdrawal Today",
    consecutive_trigger_days: "Consecutive Trigger Days",
    exercise_today: "Exercise Today",
    travel_today: "Travel Today",
    consecutive_exercise_days: "Consecutive Exercise Days",
    consecutive_sedentary_days: "Consecutive Sedentary Days",
    exercise_days_7day: "Exercise Days (7 Days)",
    exercise_consistency_7day: "Exercise Consistency (7 Days)",
    exercise_disruption: "Exercise Disruption",
    travel_exercise_conflict: "Travel Exercise Conflict",
    menstruation_today: "Menstruation Today",
    ovulation_today: "Ovulation Today",
  };

  return (
    nameMap[feature] ||
    feature.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  );
};

export const getRiskColor = (riskLevel: string): string => {
  switch (riskLevel.toLowerCase()) {
    case "very high":
      return Colors.error500;
    case "high":
      return Colors.error300;
    case "medium":
      return Colors.warning500;
    case "low":
      return Colors.success500;
    default:
      return Colors.neutral500;
  }
};

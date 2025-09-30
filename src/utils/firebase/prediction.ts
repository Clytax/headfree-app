import { IUserPrediction } from "@/types/user";

export const getPredictionByDate = (
  predictions: IUserPrediction[] | undefined,
  date: Date
): IUserPrediction | null => {
  if (!predictions) return null;
  const targetDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const todaysPrediction = predictions
    ? predictions.find(
        (p) =>
          new Date(p.prediction_date).getFullYear() ===
            targetDate.getFullYear() &&
          new Date(p.prediction_date).getMonth() === targetDate.getMonth() &&
          new Date(p.prediction_date).getDate() === targetDate.getDate()
      ) || null
    : null;
  return todaysPrediction || null;
};

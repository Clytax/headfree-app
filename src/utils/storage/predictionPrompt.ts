// utils/storage/predictionPrompt.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "prediction_prompt_dismissed_at";
const COOLDOWN_PERIOD = 60 * 60 * 1000; // 1 hour in milliseconds

export const saveDismissalTime = async (): Promise<void> => {
  try {
    const now = new Date().getTime().toString();
    await AsyncStorage.setItem(STORAGE_KEY, now);
  } catch (error) {
    console.error("Error saving dismissal time:", error);
  }
};

export const canShowPrompt = async (): Promise<boolean> => {
  try {
    const lastDismissed = await AsyncStorage.getItem(STORAGE_KEY);

    if (!lastDismissed) {
      return true; // Never dismissed before
    }

    const lastDismissedTime = parseInt(lastDismissed, 10);
    const now = new Date().getTime();
    const timePassed = now - lastDismissedTime;

    return timePassed >= COOLDOWN_PERIOD;
  } catch (error) {
    console.error("Error checking dismissal time:", error);
    return true; // Default to showing if there's an error
  }
};

export const clearDismissalTime = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing dismissal time:", error);
  }
};

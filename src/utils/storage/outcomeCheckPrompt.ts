import AsyncStorage from "@react-native-async-storage/async-storage";

const DISMISSED_PREFIX = "outcomeCheckDismissed:";
const REMINDER_ID_PREFIX = "outcomeCheckReminderId:";

export const getDateKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const canShowOutcomeCheck = async (pendingDateKey: string) => {
  const v = await AsyncStorage.getItem(DISMISSED_PREFIX + pendingDateKey);
  return !v;
};

export const markOutcomeCheckDismissed = async (pendingDateKey: string) => {
  await AsyncStorage.setItem(
    DISMISSED_PREFIX + pendingDateKey,
    new Date().toISOString()
  );
};

export const clearOutcomeCheckDismissed = async (pendingDateKey: string) => {
  await AsyncStorage.removeItem(DISMISSED_PREFIX + pendingDateKey);
};

export const getReminderIdKey = (pendingDateKey: string) =>
  REMINDER_ID_PREFIX + pendingDateKey;

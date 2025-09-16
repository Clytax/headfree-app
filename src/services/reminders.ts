// services/reminders.ts
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const DAILY_REMINDER_ID_KEY = "dailyReminderId";
const REMINDER_KIND = "daily_migraine_reminder";

async function saveId(id: string) {
  await SecureStore.setItemAsync(DAILY_REMINDER_ID_KEY, id);
}
async function loadId() {
  return SecureStore.getItemAsync(DAILY_REMINDER_ID_KEY);
}
async function clearId() {
  await SecureStore.deleteItemAsync(DAILY_REMINDER_ID_KEY);
}

export async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("reminders", {
    name: "Reminders",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    vibrationPattern: [0, 250, 250, 250],
    bypassDnd: false,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

// Find any already scheduled daily reminder
async function findExisting() {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  console.log(all);
  return all.find((n) => {
    const data = n.content?.data as any;
    const t = n.trigger as any;
    const isOurKind = data?.kind === REMINDER_KIND;
    const isCalendar =
      t?.type === Notifications.SchedulableTriggerInputTypes.CALENDAR;
    const repeats = Boolean(t?.repeats);
    return isOurKind && isCalendar && repeats;
  });
}

function sameTime(existing: any, hour: number, minute: number) {
  const t = existing?.trigger as any;
  return t?.hour === hour && t?.minute === minute;
}

export async function scheduleDailyReminder(hour: number, minute: number) {
  try {
    await ensureAndroidChannel();

    const trigger: Notifications.NotificationTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
      ...(Platform.OS === "android" ? { channelId: "reminders" } : {}),
    };

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Daily migraine entry",
        body: "Add your entry for today",
        data: {
          kind: REMINDER_KIND,
          route: "/(main)/(tabs)/(entry-stack)",
          params: { source: "reminder" },
        },
        sound: Platform.OS === "ios" ? "default" : undefined,
      },
      trigger,
    });

    await saveId(identifier);
    return identifier;
  } catch (error) {
    console.error("Error scheduling daily reminder:", error);
  }
}

export async function cancelDailyReminder() {
  // Cancel anything we know about
  const saved = await loadId();
  if (saved) {
    try {
      await Notifications.cancelScheduledNotificationAsync(saved);
    } catch {}
    await clearId();
  }
  // Also cancel any stray one that matches our kind
  const existing = await findExisting();
  if (existing) {
    try {
      await Notifications.cancelScheduledNotificationAsync(existing.identifier);
    } catch {}
  }
}

// Only schedule if needed
export async function rescheduleIfNeeded(
  enabled: boolean,
  hour: number,
  minute: number
) {
  if (!enabled) {
    await cancelDailyReminder();
    return;
  }

  const existing = await findExisting();

  // If one exists at the same time, ensure id is stored and return
  if (existing && sameTime(existing, hour, minute)) {
    // keep the identifier persisted for later cancellation
    const saved = await loadId();
    if (existing.identifier && saved !== existing.identifier) {
      await saveId(existing.identifier);
    }
    return;
  }

  // If time changed or none exists, cancel any stray and schedule fresh
  if (existing) {
    try {
      await Notifications.cancelScheduledNotificationAsync(existing.identifier);
    } catch {}
  }
  await scheduleDailyReminder(hour, minute);
}

export async function cancelAllAppNotifications() {
  // cancel all future schedules
  await Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
  // clear anything already delivered in the shade or notification center
  await Notifications.dismissAllNotificationsAsync().catch(() => {});
  // reset the app badge
  await Notifications.setBadgeCountAsync(0).catch(() => {});
  // forget our saved identifier
  await SecureStore.deleteItemAsync(DAILY_REMINDER_ID_KEY).catch(() => {});
}

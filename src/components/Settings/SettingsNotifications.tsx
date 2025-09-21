import React, { useState, useMemo, useCallback } from "react";
import { StyleSheet, View, Pressable, Platform } from "react-native";
// Packages
import * as Notifications from "expo-notifications";
import { Checkbox } from "expo-checkbox";
import DateTimePickerModal from "react-native-modal-datetime-picker";
// Components
import Text from "@/components/common/Text";
// Constants
import { Colors } from "@/constants";
// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";
import { useOnboardingStore } from "@/store/onboarding/useOnboardingStore";
import { useNotifications } from "@/providers/NotificationProvider";
import {
  cancelAllAppNotifications,
  rescheduleIfNeeded,
} from "@/services/reminders";
import Toast from "react-native-toast-message";

const SettingsNotifications = () => {
  const updateSettings = useOnboardingStore((s) => s.updateSettings);
  const sendRemindersFromStore = useOnboardingStore(
    (s) => s.data.settings?.sendReminders
  );
  const reminderTimeFromStore = useOnboardingStore(
    (s) => s.data.settings?.reminderTime
  );
  const { requestAndRegister } = useNotifications();

  const [sendReminders, setSendReminders] = useState<boolean>(
    Boolean(sendRemindersFromStore)
  );

  const initialDate = useMemo(() => {
    if (typeof reminderTimeFromStore === "string") {
      const [hh, mm] = reminderTimeFromStore
        .split(":")
        .map((n) => parseInt(n, 10));
      const d = new Date();
      if (!Number.isNaN(hh) && !Number.isNaN(mm)) {
        d.setHours(hh);
        d.setMinutes(mm);
        d.setSeconds(0);
        d.setMilliseconds(0);
        return d;
      }
    }
    const d = new Date();
    d.setHours(8, 0, 0, 0);
    return d;
  }, [reminderTimeFromStore]);

  const [time, setTime] = useState<Date>(initialDate);
  const [pickerVisible, setPickerVisible] = useState(false);

  const timeLabel = useMemo(() => {
    const hh = time.getHours().toString().padStart(2, "0");
    const mm = time.getMinutes().toString().padStart(2, "0");
    return `${hh}:${mm}`;
  }, [time]);

  const persistSettings = useCallback(
    (nextSendReminders: boolean, nextTime: Date) => {
      const hh = nextTime.getHours().toString().padStart(2, "0");
      const mm = nextTime.getMinutes().toString().padStart(2, "0");
      updateSettings({
        sendReminders: nextSendReminders,
        reminderTime: `${hh}:${mm}`,
      });
    },
    [updateSettings]
  );

  const handleToggle = useCallback(
    async (next: boolean) => {
      setSendReminders(next);

      if (next) {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== "granted") {
          const result = await requestAndRegister();
          if (!result.granted) {
            setSendReminders(false);
            persistSettings(false, time);
            return;
          }
        }
        await rescheduleIfNeeded(true, time.getHours(), time.getMinutes());
        showSuccessToast();
      } else {
        await cancelAllAppNotifications();
      }

      persistSettings(next, time);
    },
    [persistSettings, requestAndRegister, time]
  );

  const onConfirmTime = useCallback(
    async (date: Date) => {
      setPickerVisible(false);
      setTime(date);
      persistSettings(sendReminders, date);
      if (sendReminders) {
        await rescheduleIfNeeded(true, date.getHours(), date.getMinutes());
        showSuccessToast();
      }
    },
    [persistSettings, sendReminders]
  );

  const showSuccessToast = useCallback(() => {
    if (sendReminders) {
      Toast.show({
        type: "success",
        text1: "Reminder time updated",
        text2: `You'll be notified daily at ${timeLabel}`,
        visibilityTime: 4000,
      });
    }
  }, [sendReminders, timeLabel]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Text style={styles.sectionHint}>
          Control daily reminders and pick your ideal time
        </Text>

        <View style={[styles.settingCard, styles.elevatedCard]}>
          <View style={styles.row}>
            <Checkbox
              value={sendReminders}
              onValueChange={handleToggle}
              color={sendReminders ? Colors.primary : Colors.neutral400}
              style={styles.checkbox}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Daily reminders</Text>
              <Text style={styles.rowHint}>
                Get notified at your preferred time each day
              </Text>
            </View>
          </View>
        </View>

        {sendReminders && (
          <View style={[styles.settingCard, styles.elevatedCardAccent]}>
            <Text style={styles.cardTitle}>Reminder time</Text>

            <Pressable
              onPress={() => setPickerVisible(true)}
              style={({ pressed }) => [
                styles.timeSelector,
                pressed && { backgroundColor: Colors.blackTransparent },
              ]}
            >
              <View>
                <Text style={styles.timeValue}>{timeLabel}</Text>
                <Text style={styles.timeSubtle}>
                  Localized to your device time
                </Text>
              </View>

              <View style={styles.pillButton}>
                <Text style={styles.pillButtonText}>Change</Text>
              </View>
            </Pressable>
          </View>
        )}
      </View>

      <DateTimePickerModal
        isVisible={pickerVisible}
        mode="time"
        date={time}
        onConfirm={onConfirmTime}
        onCancel={() => setPickerVisible(false)}
        is24Hour
        themeVariant="dark"
        isDarkModeEnabled
      />
    </View>
  );
};

export default SettingsNotifications;

const shadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  android: {
    elevation: 6,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
  },
  sectionTitle: {
    fontSize: getFontSize(22),
    fontWeight: "800",
    color: Colors.white,
    letterSpacing: 0.2,
  },
  sectionHint: {
    marginTop: 4,
    marginBottom: hp(2),
    fontSize: getFontSize(13),
    color: Colors.neutral300,
  },
  settingCard: {
    backgroundColor: Colors.backgroundLighter,
    borderRadius: 16,
    padding: wp(4),
    marginBottom: hp(2),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  elevatedCard: {
    ...shadow,
  },
  elevatedCardAccent: {
    ...shadow,
    borderColor: Colors.primaryDark,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
  },
  rowTitle: {
    fontSize: getFontSize(16),
    fontWeight: "700",
    color: Colors.text,
  },
  rowHint: {
    fontSize: getFontSize(13),
    color: Colors.neutral300,
    marginTop: 2,
    lineHeight: 18,
  },
  cardTitle: {
    fontSize: getFontSize(15),
    fontWeight: "700",
    color: Colors.text,
    marginBottom: hp(1),
  },
  timeSelector: {
    marginTop: 2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(3),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeValue: {
    fontSize: getFontSize(20),
    fontWeight: "800",
    color: Colors.primaryLight,
    letterSpacing: 0.5,
  },
  timeSubtle: {
    marginTop: 2,
    fontSize: getFontSize(12),
    color: Colors.neutral300,
  },
  pillButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  pillButtonText: {
    fontSize: getFontSize(13),
    fontWeight: "700",
    color: Colors.white,
    letterSpacing: 0.3,
  },
});

// React and React Native Imports
import React, { useMemo, useState, useCallback } from "react";
import { StyleSheet, View, Pressable } from "react-native";

// Third-Party Libraries
import * as Notifications from "expo-notifications";
import { Checkbox } from "expo-checkbox";
import { useRouter } from "expo-router";
import Animated from "react-native-reanimated";
import { enter, exit } from "@/utils/animation/onboardingAnimation";
// Custom Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";
import OnboardingTop from "@/components/Onboarding/OnboardingTop";

// Constants and Utilities
import { Colors } from "@/constants";
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";
import { useOnboardingStore } from "@/store/onboarding/useOnboardingStore";
import { useNotifications } from "@/providers/NotificationProvider";
import {
  cancelAllAppNotifications,
  cancelDailyReminder,
  rescheduleIfNeeded,
  scheduleDailyReminder,
} from "@/services/reminders";
const OnboardingNotifications = () => {
  const router = useRouter();

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
    d.setHours(8);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);
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
      } else {
        // nuke every planned notification
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
      }
    },
    [persistSettings, sendReminders]
  );

  return (
    <View style={styles.container}>
      <OnboardingTop />

      <Animated.View
        entering={enter(100)}
        exiting={exit(100)}
        style={styles.content}
      >
        <Text style={styles.title}>Stay on track with gentle reminders</Text>
        <Text style={styles.subtitle}>
          Choose if you want daily reminders. You can change this anytime in
          Settings.
        </Text>

        <View style={styles.row}>
          <Checkbox
            value={sendReminders}
            onValueChange={handleToggle}
            color={sendReminders ? Colors.primary : undefined}
            style={styles.checkbox}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Send daily reminders</Text>
            <Text style={styles.rowHint}>
              We will notify you at your preferred time
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => setPickerVisible(true)}
          disabled={!sendReminders}
          style={[styles.timeCard, !sendReminders && { opacity: 0.2 }]}
        >
          <View style={styles.timeLeft}>
            <Text style={styles.timeLabel}>Reminder time</Text>
            <Text style={styles.timeValue}>{timeLabel}</Text>
          </View>
          <View style={styles.timeRight}>
            <Text style={styles.changeText}>Change</Text>
          </View>
        </Pressable>

        <View style={{ flex: 1 }} />
      </Animated.View>

      {/* <DateTimePickerModal
        isVisible={pickerVisible}
        mode="time"
        date={time}
        onConfirm={onConfirmTime}
        onCancel={() => setPickerVisible(false)}
        is24Hour
      /> */}
    </View>
  );
};

export default OnboardingNotifications;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: wp(6),
    paddingTop: hp(2),
  },
  title: {
    fontSize: getFontSize(22),
    fontWeight: "700",
    color: Colors.text,
    marginTop: hp(2),
  },
  subtitle: {
    fontSize: getFontSize(14),
    color: Colors.neutral100,
    marginTop: hp(1),
    lineHeight: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
    marginTop: hp(3),
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  rowTitle: {
    fontSize: getFontSize(16),
    fontWeight: "600",
    color: Colors.text,
  },
  rowHint: {
    fontSize: getFontSize(13),
    color: Colors.neutral100,
    marginTop: 2,
  },
  timeCard: {
    marginTop: hp(2),
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.neutral500,
    backgroundColor: Colors.backgroundLighter,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeLeft: { flexDirection: "column" },
  timeLabel: {
    fontSize: getFontSize(13),
    color: Colors.text,
  },
  timeValue: {
    marginTop: 4,
    fontSize: getFontSize(18),
    fontWeight: "700",
    color: Colors.text,
    letterSpacing: 0.5,
  },
  timeRight: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderRadius: 10,
    backgroundColor: Colors.secondary700,
  },
  changeText: {
    fontSize: getFontSize(13),
    color: Colors.neutral200,
  },
  cta: {
    marginBottom: hp(3),
    alignSelf: "stretch",
  },
  ctaText: {
    textAlign: "center",
    fontSize: getFontSize(16),
    fontWeight: "700",
    color: Colors.white,
  },
});

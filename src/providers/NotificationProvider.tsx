import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useState,
} from "react";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

type NotificationCtx = {
  requestAndRegister: () => Promise<{ granted: boolean; token?: string }>;
  expoPushToken?: string;
  notification?: Notifications.Notification;
  scheduleNotification: (
    content: Notifications.NotificationContentInput,
    trigger?: Notifications.NotificationTriggerInput
  ) => Promise<string>;
  cancelAllScheduledNotifications: () => Promise<void>;
  clearNotificationBadge: () => Promise<boolean>;
};

const NotificationsContext = createContext<NotificationCtx>({
  requestAndRegister: async () => ({ granted: false }),
  scheduleNotification: async () => "",
  cancelAllScheduledNotifications: async () => {},
  clearNotificationBadge: async () => false,
});

// Configure notification handler for foreground presentation
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const NotificationsProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >();

  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Set up Android notification channel
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      }).catch(console.error);
    }

    // Set up notification listeners
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        // Handle notification response (e.g., deep linking)
        // You can add custom logic here based on response.notification.request.content.data
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const requestAndRegister = useCallback(async () => {
    // Check existing permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not already granted
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowDisplayInCarPlay: true,
          allowCriticalAlerts: false,
        },
      });
      finalStatus = status;
    }

    // Handle iOS provisional authorization
    const granted =
      finalStatus === "granted" ||
      (Platform.OS === "ios" &&
        typeof finalStatus === "object" &&
        finalStatus?.ios?.status ===
          Notifications.IosAuthorizationStatus.PROVISIONAL);

    if (!granted) {
      console.warn("Push notification permissions not granted");
      return { granted: false };
    }

    try {
      // Get project ID from Constants (EAS configuration)
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      if (!projectId) {
        throw new Error(
          "Project ID not found. Make sure you have configured EAS."
        );
      }

      // Get Expo push token
      const { data: token } = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      setExpoPushToken(token);

      // TODO: Send token to your backend
      // await sendTokenToBackend(token);

      return { granted: true, token };
    } catch (error) {
      console.error("Error getting push token:", error);
      return { granted: false };
    }
  }, []);

  const scheduleNotification = useCallback(
    async (
      content: Notifications.NotificationContentInput,
      trigger: Notifications.NotificationTriggerInput = null
    ) => {
      try {
        const identifier = await Notifications.scheduleNotificationAsync({
          content,
          trigger,
        });
        return identifier;
      } catch (error) {
        console.error("Error scheduling notification:", error);
        throw error;
      }
    },
    []
  );

  const cancelAllScheduledNotifications = useCallback(async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error canceling notifications:", error);
      throw error;
    }
  }, []);

  const clearNotificationBadge = useCallback(async () => {
    try {
      return await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error("Error clearing badge:", error);
      return false;
    }
  }, []);

  const contextValue: NotificationCtx = {
    requestAndRegister,
    expoPushToken,
    notification,
    scheduleNotification,
    cancelAllScheduledNotifications,
    clearNotificationBadge,
  };

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
};

// Hook for accessing the last notification response
export const useLastNotificationResponse = () => {
  return Notifications.useLastNotificationResponse();
};

// Utility function for sending test notifications (development only)
export const sendTestNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Test Notification 📧",
      body: "This is a test notification!",
      data: { screen: "home", userId: "123" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
};

export default NotificationsContext;

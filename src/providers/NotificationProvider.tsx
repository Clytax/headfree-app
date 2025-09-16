// providers/NotificationsProvider.tsx
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

type Ctx = {
  requestAndRegister: () => Promise<{ granted: boolean; token?: string }>;
  expoPushToken?: string;
};

const NotificationsCtx = createContext<Ctx>({
  requestAndRegister: async () => ({ granted: false }),
});

// Foreground presentation for iOS
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
  const respListener = useRef<Notifications.Subscription | null>(null);
  const recvListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.DEFAULT,
      }).catch(() => {});
    }

    recvListener.current = Notifications.addNotificationReceivedListener(
      () => {}
    );
    respListener.current =
      Notifications.addNotificationResponseReceivedListener(() => {});

    return () => {
      if (recvListener.current) {
        Notifications.removeNotificationSubscription(recvListener.current);
      }
      if (respListener.current) {
        Notifications.removeNotificationSubscription(respListener.current);
      }
    };
  }, []);

  const requestAndRegister = useCallback(async () => {
    // 1) Check existing permission
    const current = await Notifications.getPermissionsAsync();
    let granted =
      current.granted ||
      current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

    // 2) Ask if not granted yet
    if (!granted) {
      const ask = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: true, allowSound: true },
      });
      granted =
        ask.granted ||
        ask.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
    }

    if (!granted) {
      return { granted: false };
    }

    // 3) Get token with a reliable projectId
    const projectId =
      // EAS production
      Constants.easConfig?.projectId ??
      // Dev client and Expo Go
      Constants.expoConfig?.extra?.eas?.projectId;

    const tokenResp = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );

    const token = tokenResp.data;
    setExpoPushToken(token);

    // Send token to backend here
    // await api.savePushToken(token)

    return { granted: true, token };
  }, []);

  return (
    <NotificationsCtx.Provider value={{ requestAndRegister, expoPushToken }}>
      {children}
    </NotificationsCtx.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsCtx);

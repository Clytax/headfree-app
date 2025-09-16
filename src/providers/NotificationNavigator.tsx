import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useLastNotificationResponse } from "expo-notifications";
import { useRouter, Href } from "expo-router";

type RouteData = { route?: string; params?: Record<string, any> };

function pushSafe(
  router: ReturnType<typeof useRouter>,
  route: string,
  params?: Record<string, any>
) {
  if (params) {
    router.push({ pathname: route as Href["pathname"], params } as Href);
  } else {
    router.push(route as Href);
  }
}

export default function NotificationNavigator() {
  const router = useRouter();
  const last = useLastNotificationResponse();

  useEffect(() => {
    const data = last?.notification?.request?.content?.data as
      | RouteData
      | undefined;
    if (data?.route) {
      pushSafe(router, data.route, data.params);
    }
  }, [last, router]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as
          | RouteData
          | undefined;
        if (data?.route) {
          pushSafe(router, data.route, data.params);
        }
      }
    );
    return () => sub.remove();
  }, [router]);

  return null;
}

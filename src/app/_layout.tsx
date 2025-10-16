import React, { useEffect, useRef, useState } from "react";
import { AppState, InteractionManager } from "react-native";
import { Stack } from "expo-router";
import {
  FirebaseAuthTypes,
  getAuth,
  onAuthStateChanged,
  onIdTokenChanged,
  reload,
  signOut,
} from "@react-native-firebase/auth";
import PrepareApp from "@/providers/PrepareApp";

// Packages
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Context
import { AuthProvider, useAuth } from "@/context/auth/AuthContext";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { EmergencyProvider } from "@/context/emergency/EmergencyContext";
// (globalThis as any).__APP_T0_MS ??= Date.now();

// hook

const qc = new QueryClient();
const InitialLayout = () => {
  const auth = getAuth();
  const [initializing, setInitializing] = useState(true);
  const { user, loading } = useAuth();
  const isLoaded = !loading;
  const isSignedIn = !!user;
  const reported = useRef(false);

  // useEffect(() => {
  //   if (!reported.current && isLoaded) {
  //     InteractionManager.runAfterInteractions(() => {
  //       if (reported.current) return;
  //       const t0 = (globalThis as any).__APP_T0_MS ?? Date.now();
  //       const tReady = Date.now() - t0;

  //       // Send to logs or analytics
  //       // Keep simple console for manual runs. Replace with your analytics event if needed.
  //       // Example analytics: analytics().logEvent('perf_first_interactive', { ms: tReady });
  //       // Tag makes it easy to grep in logcat or Xcode
  //       // Only log in release to avoid noise during dev
  //       if (__DEV__) {
  //         // console.log(`[PERF] first_interactive_ms=${tReady}`);
  //       }
  //       reported.current = true;
  //     });
  //   }
  // }, [isLoaded]);
  if (!isLoaded) return null;

  return (
    <Stack>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(main)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <PrepareApp>
      <QueryClientProvider client={qc}>
        <AuthProvider>
          <EmergencyProvider>
            <InitialLayout />
          </EmergencyProvider>
        </AuthProvider>
      </QueryClientProvider>
    </PrepareApp>
  );
}

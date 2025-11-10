import React, { useEffect, useRef, useState } from "react";
import { AppState, InteractionManager, Platform } from "react-native";
import { Stack } from "expo-router";
import { getAuth } from "@react-native-firebase/auth";
import PrepareApp from "@/providers/PrepareApp";

// Packages
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Context
import { AuthProvider, useAuth } from "@/context/auth/AuthContext";
import { EmergencyProvider } from "@/context/emergency/EmergencyContext";

// --- Earliest possible t0 in this file (fallback when no custom entry exists)
(globalThis as any).__APP_T0_MS ??= Date.now();
(globalThis as any).__HAS_STARTED_BEFORE ??= false;

// Safe rAF wrapper (Hermes-friendly)
const raf =
  globalThis.requestAnimationFrame ??
  ((cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 0));

const qc = new QueryClient();

function logPerf(event: string, payload: Record<string, unknown>) {
  if (__DEV__) {
    // Dev: console only

    console.log(`[PERF] ${event}`, payload);
    return;
  }
  // Prod: example POST (keep tiny)
  // void fetch("https://your.api/perf", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json", "X-Benchmark": "1" },
  //   body: JSON.stringify({ event, ...payload }),
  // }).catch(() => {});
}

const InitialLayout = () => {
  const auth = getAuth();
  const { user, loading } = useAuth();

  const isLoaded = !loading;
  const isSignedIn = !!user;

  const firstInteractiveReported = useRef(false);
  const skipNextActive = useRef(true); // ignore initial 'active' (cold-ish already measured)

  // ---- Measure "first interactive" (cold-ish start with this fallback)
  useEffect(() => {
    if (firstInteractiveReported.current || !isLoaded) return;

    InteractionManager.runAfterInteractions(() => {
      raf(() => {
        if (firstInteractiveReported.current) return;

        const t0 =
          (globalThis as any).__APP_T0_MS ??
          globalThis.performance?.timeOrigin ??
          Date.now();

        const tReady = Date.now() - t0;
        const wasCold = !(globalThis as any).__HAS_STARTED_BEFORE;

        logPerf("first_interactive_ms", {
          ms: tReady,
          cold_start: wasCold,
          platform: Platform.OS,
        });

        (globalThis as any).__HAS_STARTED_BEFORE = true;
        firstInteractiveReported.current = true;
      });
    });
  }, [isLoaded]);

  // ---- Measure warm start (resume from background) to interactive
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") return;

      // Skip the initial 'active' from fresh launch
      if (skipNextActive.current) {
        skipNextActive.current = false;
        return;
      }

      const tResume0 = Date.now();

      InteractionManager.runAfterInteractions(() => {
        raf(() => {
          const tResume = Date.now() - tResume0;
          logPerf("warm_start_ms", {
            ms: tResume,
            platform: Platform.OS,
          });
        });
      });
    });

    return () => sub.remove();
  }, []);

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

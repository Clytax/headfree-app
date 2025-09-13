import React, { useEffect, useState } from "react";
import { AppState } from "react-native";
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

const qc = new QueryClient();
const InitialLayout = () => {
  const auth = getAuth();
  const [initializing, setInitializing] = useState(true);
  const { user, loading } = useAuth();
  const isLoaded = !loading;
  const isSignedIn = !!user;

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
          <InitialLayout />
        </AuthProvider>
      </QueryClientProvider>
    </PrepareApp>
  );
}

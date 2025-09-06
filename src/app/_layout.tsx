// React / React Native
import React, { useEffect, useState } from "react";
// Expo
import { Stack, useRouter, useSegments } from "expo-router";

// Hooks
// Providers

// Firebase
import {
  FirebaseAuthTypes,
  getAuth,
  onAuthStateChanged,
} from "@react-native-firebase/auth";

// Components
import PrepareApp from "@/providers/PrepareApp";
const InitialLayout = () => {
  const isLoaded = true;
  const isSignedIn = false;
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>();
  const router = useRouter();

  const handleAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
    console.log("onAuthStateChanged", user);
    setUser(user);
    if (initializing) setInitializing(false);
  };
  useEffect(() => {
    const subscriber = onAuthStateChanged(getAuth(), handleAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return null;
  return (
    <Stack>
      <Stack.Protected guard={isSignedIn && isLoaded ? true : false}>
        <Stack.Screen
          name="(main)"
          options={{
            headerShown: false,
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!isSignedIn || !isLoaded}>
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
          }}
        />
      </Stack.Protected>
    </Stack>
  );
};
export default function RootLayout() {
  return (
    <PrepareApp>
      <InitialLayout />
    </PrepareApp>
  );
}

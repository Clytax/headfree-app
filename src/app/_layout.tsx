// React / React Native

// Expo
import { Stack } from "expo-router";

// Hooks
// Providers

import PrepareApp from "@/providers/PrepareApp";
const InitialLayout = () => {
  const isLoaded = true;
  const isSignedIn = false;
  return (
    <Stack>
      <Stack.Protected guard={isSignedIn && isLoaded ? true : false}>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!isSignedIn || !isLoaded}>
        <Stack.Screen name="(auth)" />
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

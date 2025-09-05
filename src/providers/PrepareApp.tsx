// React / React Native
import { useEffect, useState } from "react";
import { LogBox, StyleSheet } from "react-native";

// Components
import BaseToast from "@/components/common/BaseToast";

// Expo

// Packages
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Hooks
import useFonts from "../hooks/useFonts";

// Splash Screen
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
SplashScreen.preventAutoHideAsync();
LogBox.ignoreLogs(["Clerk: Clerk has been loaded with development keys"]);

const PrepareApp = ({ children }: { children: React.ReactNode }) => {
  // App is Ready
  const [appIsReady, setAppIsReady] = useState(false);
  // Load fonts
  const { fontsLoaded } = useFonts();

  // useEffect to stop the splash screen
  useEffect(() => {
    async function prepare() {
      try {
        // Add necessary preparations here

        // Custom delay to simulate loading
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
      } catch (e) {
        console.warn(e);
      } finally {
        await SplashScreen.hideAsync();
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  if (!fontsLoaded || !appIsReady) {
    return null;
  }
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider style={styles.container}>
        <BottomSheetModalProvider>
          {children}
          <BaseToast />
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default PrepareApp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

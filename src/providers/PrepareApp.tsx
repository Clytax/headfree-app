// React / React Native
import { useEffect, useState } from "react";
import { AppState, LogBox, StyleSheet, View } from "react-native";

// Components
import BaseToast from "@/components/common/BaseToast";
import NotificationNavigator from "@/providers/NotificationNavigator";

// Icons
import { Ionicons } from "@expo/vector-icons";

// Context
import { EmergencyProvider } from "@/context/emergency/EmergencyContext";
import {
  BiometricAuthProvider,
  useBiometricAuth,
} from "@/context/auth/BiometricAuthContext";

// Packages
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CopilotProvider } from "react-native-copilot";
// Utils
import { rescheduleIfNeeded } from "@/services/reminders";

// Hooks
import useFonts from "../hooks/useFonts";
import { useUser } from "@/hooks/firebase/useUser";

// Splash Screen
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NotificationsProvider } from "@/providers/NotificationProvider";
import { Colors } from "@/constants";
import { hp } from "@/utils/ui/sizes";

SplashScreen.preventAutoHideAsync();

LogBox.ignoreLogs(["Clerk: Clerk has been loaded with development keys"]);
LogBox.ignoreLogs([""]);

const AppContent = ({ children }: { children: React.ReactNode }) => {
  const [isBlurred, setIsBlurred] = useState(false);
  const { isBiometricAuthActive } = useBiometricAuth();
  // Handle app state changes for privacy screen
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        // Only blur if we're NOT doing biometric auth
        if (!isBiometricAuthActive) {
          setIsBlurred(true);
        }
      } else if (nextAppState === "active") {
        setIsBlurred(false);
      }
    });

    return () => subscription.remove();
  }, [isBiometricAuthActive]);

  return (
    <>
      <GestureHandlerRootView style={styles.container}>
        <CopilotProvider overlay="svg" animated>
          <SafeAreaProvider style={styles.container}>
            <NotificationsProvider>
              <BottomSheetModalProvider>
                {children}
                <NotificationNavigator />
                <BaseToast />
              </BottomSheetModalProvider>
            </NotificationsProvider>
          </SafeAreaProvider>
        </CopilotProvider>

        {/* Privacy blur overlay */}
        {isBlurred && (
          <View
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: Colors.background },
            ]}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="lock-closed" size={80} color={Colors.primary} />
            </View>
          </View>
        )}
      </GestureHandlerRootView>
    </>
  );
};

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
    <BiometricAuthProvider>
      <AppContent>{children}</AppContent>
    </BiometricAuthProvider>
  );
};

export default PrepareApp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});

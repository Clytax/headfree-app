import React, { createContext, useContext, useState, ReactNode } from "react";
import { Alert } from "react-native";

// Packages
import {
  getAuth,
  signInWithEmailAndPassword,
} from "@react-native-firebase/auth";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

// Types
import {
  BiometricAuthContextType,
  BiometricAvailability,
} from "@/context/auth/BiometricAuthContext.types";

const BiometricAuthContext = createContext<
  BiometricAuthContextType | undefined
>(undefined);

export const BiometricAuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isBiometricAuthActive, setIsBiometricAuthActive] = useState(false);

  const checkBiometricAvailability =
    async (): Promise<BiometricAvailability> => {
      try {
        const biometricEnabled = await SecureStore.getItemAsync(
          "biometricEnabled"
        );
        const userEmail = await SecureStore.getItemAsync("userEmail");

        if (biometricEnabled === "true" && userEmail) {
          const hasHardware = await LocalAuthentication.hasHardwareAsync();
          const isEnrolled = await LocalAuthentication.isEnrolledAsync();

          if (hasHardware && isEnrolled) {
            // Determine biometric type
            const supportedTypes =
              await LocalAuthentication.supportedAuthenticationTypesAsync();
            let biometricType = "biometric";

            if (
              supportedTypes.includes(
                LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
              )
            ) {
              biometricType = "Face ID";
            } else if (
              supportedTypes.includes(
                LocalAuthentication.AuthenticationType.FINGERPRINT
              )
            ) {
              biometricType = "Fingerprint";
            }

            return { isAvailable: true, biometricType };
          }
        }

        return { isAvailable: false, biometricType: "biometric" };
      } catch (error) {
        console.error("Error checking biometric availability:", error);
        return { isAvailable: false, biometricType: "biometric" };
      }
    };

  const handleBiometricAuth = async (): Promise<boolean> => {
    try {
      setIsBiometricAuthActive(true);

      const { biometricType } = await checkBiometricAvailability();

      // Authenticate with biometrics
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Sign in with ${biometricType}`,
        fallbackLabel: "Use passcode",
        cancelLabel: "Cancel",
      });

      if (result.success) {
        // Retrieve stored credentials
        const email = await SecureStore.getItemAsync("userEmail");
        const password = await SecureStore.getItemAsync("userPassword");

        if (!email || !password) {
          Alert.alert(
            "Error",
            "Biometric credentials not found. Please sign in manually."
          );
          // Clear the biometric flag since data is missing
          await disableBiometrics();
          return false;
        }

        // Sign in with stored credentials
        await signInWithEmailAndPassword(getAuth(), email, password);
        return true;
      } else {
        Alert.alert(
          "Authentication Failed",
          "Biometric authentication was not successful."
        );
        return false;
      }
    } catch (error) {
      console.error("Biometric authentication error:", error);
      Alert.alert(
        "Error",
        "Failed to sign in. Please try again or use your password."
      );
      return false;
    } finally {
      setIsBiometricAuthActive(false);
    }
  };

  const offerBiometricSetup = async (
    email: string,
    uid: string,
    password: string
  ): Promise<void> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        return;
      }

      const supportedTypes =
        await LocalAuthentication.supportedAuthenticationTypesAsync();
      let biometricName = "biometric";

      if (
        supportedTypes.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
        )
      ) {
        biometricName = "Face ID";
      } else if (
        supportedTypes.includes(
          LocalAuthentication.AuthenticationType.FINGERPRINT
        )
      ) {
        biometricName = "fingerprint";
      }

      return new Promise((resolve) => {
        Alert.alert(
          `Enable ${biometricName}?`,
          `Use ${biometricName} to quickly and securely sign in next time`,
          [
            {
              text: "Not Now",
              style: "cancel",
              onPress: () => resolve(),
            },
            {
              text: "Enable",
              onPress: async () => {
                try {
                  await SecureStore.setItemAsync("userEmail", email);
                  await SecureStore.setItemAsync("userId", uid);
                  await SecureStore.setItemAsync("userPassword", password);
                  await SecureStore.setItemAsync("biometricEnabled", "true");

                  Alert.alert("Success", `${biometricName} enabled!`);
                  resolve();
                } catch (error) {
                  console.error("Failed to save biometric data:", error);
                  resolve();
                }
              },
            },
          ]
        );
      });
    } catch (error) {
      console.error("Biometric setup error:", error);
    }
  };

  const disableBiometrics = async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync("userEmail");
      await SecureStore.deleteItemAsync("userId");
      await SecureStore.deleteItemAsync("userPassword");
      await SecureStore.deleteItemAsync("biometricEnabled");
    } catch (error) {
      console.error("Error disabling biometrics:", error);
    }
  };

  return (
    <BiometricAuthContext.Provider
      value={{
        isBiometricAuthActive,
        setIsBiometricAuthActive,
        checkBiometricAvailability,
        handleBiometricAuth,
        offerBiometricSetup,
        disableBiometrics,
      }}
    >
      {children}
    </BiometricAuthContext.Provider>
  );
};

export const useBiometricAuth = () => {
  const context = useContext(BiometricAuthContext);
  if (context === undefined) {
    throw new Error(
      "useBiometricAuth must be used within a BiometricAuthProvider"
    );
  }
  return context;
};

import React, { useState, useEffect } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

// Packages
import { useRouter } from "expo-router";
import { useHeaderHeight } from "@react-navigation/elements";

// Components
import Text from "@/components/common/Text";
import SafeAreaContainer from "@/components/common/Container/SafeAreaContainer";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";
import MyInput from "@/components/common/Input";
import SimpleButton from "@/components/common/Buttons/SimpleButton";

// Context
import { useBiometricAuth } from "@/context/auth/BiometricAuthContext";

// Constants
import { Colors, Sizes } from "@/constants";

// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

// Firebase
import {
  getAuth,
  signInWithEmailAndPassword,
} from "@react-native-firebase/auth";
import { FirebaseError } from "firebase/app";

// Assets
import WelcomeImage from "@/assets/illustrations/welcome.svg";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Validation
import { SignInSchema } from "@/schemas/authSchema";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
type SignInFormType = z.infer<typeof SignInSchema>;

const SignIn = () => {
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState("biometric");
  const [isBiometricAuthenticating, setIsBiometricAuthenticating] =
    useState(false);

  const {
    checkBiometricAvailability,
    handleBiometricAuth,
    offerBiometricSetup,
  } = useBiometricAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormType>({
    resolver: zodResolver(SignInSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Check if biometric auth is available on component mount
  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const { isAvailable, biometricType: type } =
      await checkBiometricAvailability();
    setBiometricAvailable(isAvailable);
    setBiometricType(type);
  };

  const onBiometricPress = async () => {
    setIsBiometricAuthenticating(true);
    const success = await handleBiometricAuth();
    setIsBiometricAuthenticating(false);

    if (!success) {
      // If biometric auth failed and credentials were cleared, update UI
      await checkBiometrics();
    }
  };

  const onSubmit = async (data: SignInFormType) => {
    try {
      const { email, password } = data;
      const userCredential = await signInWithEmailAndPassword(
        getAuth(),
        email,
        password
      );

      // Offer biometric setup after successful sign in
      await offerBiometricSetup(email, userCredential.user.uid, password);

      // Check if biometric was enabled and update UI
      await checkBiometrics();
    } catch (e: any) {
      const err = e as FirebaseError;
      alert("Sign in failed: " + err.message);
    }
  };

  return (
    <SafeAreaContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={styles.container}>
            <View style={styles.top}>
              <Text fontWeight="bold" fontSize={getFontSize(32)}>
                Welcome Back!
              </Text>
              <WelcomeImage />
            </View>

            <View style={styles.inputs}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <MyInput
                    required
                    label="E-Mail"
                    placeholder="name@email.com"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    errorText={errors.email?.message}
                    leftIcon={{
                      set: "MaterialCommunityIcons",
                      name: "email-outline",
                    }}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <MyInput
                    required
                    label="Password"
                    placeholder="Your password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    showPasswordToggle
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                    textContentType="password"
                    errorText={errors.password?.message}
                    leftIcon={{
                      set: "MaterialCommunityIcons",
                      name: "lock-outline",
                    }}
                  />
                )}
              />
            </View>

            <View style={styles.bottom}>
              <SimpleButton
                title="Login"
                onPress={handleSubmit(onSubmit)}
                loading={isSubmitting}
              />

              {biometricAvailable && (
                <>
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text fontSize={getFontSize(12)} color={Colors.gray}>
                      OR
                    </Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <MyTouchableOpacity
                    style={styles.biometricButton}
                    onPress={onBiometricPress}
                    disabled={isBiometricAuthenticating}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel="Use biometrics to authenticate"
                    accessibilityHint="Opens Face ID or Touch ID to authenticate"
                    accessibilityState={{
                      busy: isBiometricAuthenticating,
                      disabled: !!isBiometricAuthenticating,
                    }}
                    hitSlop={8}
                  >
                    <MaterialCommunityIcons
                      name={
                        biometricType === "Face ID"
                          ? "face-recognition"
                          : "fingerprint"
                      }
                      size={24}
                      color={Colors.primaryLight}
                    />
                    <Text
                      fontSize={getFontSize(14)}
                      color={Colors.primaryLight}
                    >
                      Sign in with {biometricType}
                    </Text>
                  </MyTouchableOpacity>
                </>
              )}

              <Text fontSize={getFontSize(12)} textCenter>
                No Account?{" "}
                <Text
                  fontSize={getFontSize(13)}
                  onPress={() => router.replace("/(auth)/signUp")}
                  color={Colors.primaryLight}
                >
                  Register here
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaContainer>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Sizes.containerPaddingHorizontal,
  },
  top: {
    marginTop: hp(6),
    marginBottom: "auto",
    alignItems: "center",
    gap: hp(2),
  },
  inputs: {
    gap: hp(2),
  },
  bottom: {
    marginTop: hp(6),
    marginBottom: hp(4),
    gap: hp(2),
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
    marginVertical: hp(1),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray,
    opacity: 0.3,
  },
  biometricButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp(2),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
});

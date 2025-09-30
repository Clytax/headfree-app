import React, { useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
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

// Constants
import { Colors, Sizes } from "@/constants";

// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

// Firebase
import auth, {
  getAuth,
  signInWithEmailAndPassword,
} from "@react-native-firebase/auth";
import { FirebaseError } from "firebase/app";
// Types

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
  const headerHeight = useHeaderHeight(); // 0 if no header

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    getFieldState,
    formState: { errors, isValid, isSubmitting }, // note: isSubmitting is typical here
  } = useForm<SignInFormType>({
    resolver: zodResolver(SignInSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
    },
  });
  console.log(errors);
  const onSubmit = async (data: SignInFormType) => {
    try {
      const { email, password } = data;
      await signInWithEmailAndPassword(getAuth(), email, password);
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
        // a little more space
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
                    autoCapitalize="none" // ← was "words"
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

              {/* Password */}
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
});

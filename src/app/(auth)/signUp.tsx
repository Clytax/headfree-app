import React, { useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

// Packages
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpSchema } from "@/schemas/authSchema";
import { useHeaderHeight } from "@react-navigation/elements";

// Firebase
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "@react-native-firebase/auth";
import {
  setDoc,
  doc,
  serverTimestamp,
  getFirestore,
} from "@react-native-firebase/firestore";
import { FirebaseError } from "firebase/app";

// Components
import AuthAGB from "@/components/common/Policy/AuthAGB";
import Text from "@/components/common/Text";
import SafeAreaContainer from "@/components/common/Container/SafeAreaContainer";
import SimpleButton from "@/components/common/Buttons/SimpleButton";
import MyInput from "@/components/common/Input";

// Constants
import { Colors, Sizes } from "@/constants";

// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

// Models
import { createEmptyUser } from "@/utils/firebase/user";

// Types
type SignUpFormType = z.infer<typeof SignUpSchema>;

const SignUp = () => {
  const router = useRouter();

  const headerHeight = useHeaderHeight();

  const db = getFirestore();
  const auth = getAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormType>({
    resolver: zodResolver(SignUpSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const onSubmit = async (data: SignUpFormType) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      if (data.name) {
        await updateProfile(user, {
          displayName: data.name,
        });
      }

      const base = createEmptyUser(user.uid);

      await setDoc(
        doc(db, "users", user.uid),
        {
          ...base,
          // override analytics times with server timestamps
          analytics: {
            ...base.analytics,
            accountCreated: serverTimestamp() as unknown as string,
            lastActive: serverTimestamp() as unknown as string,
          },
        },
        { merge: true }
      );

      // router.replace("/onboarding"); // optional route
    } catch (error: any) {
      const err = error as FirebaseError;
      alert("Registration failed: " + err.message);
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
                Welcome to
              </Text>
              <Text
                fontWeight="bold"
                fontSize={getFontSize(46)}
                color={Colors.primary200}
              >
                HEADFREE
              </Text>
              <Text fontSize={getFontSize(20)} style={{ paddingTop: hp(1) }}>
                Your smart migraine tracker
              </Text>
            </View>

            <View style={styles.inputs}>
              {/* Name Optional */}
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <MyInput
                    loading={isSubmitting}
                    label="Name"
                    placeholder="John Doe"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="default"
                    autoCapitalize="words"
                    autoCorrect={false}
                    autoComplete="name"
                    textContentType="name"
                    errorText={errors.name?.message}
                    leftIcon={{ set: "MaterialIcons", name: "person-outline" }}
                  />
                )}
              />
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <MyInput
                    loading={isSubmitting}
                    label="E Mail"
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
                    required
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
                    loading={isSubmitting}
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
              <AuthAGB loading={isSubmitting} />
              <SimpleButton
                title="Register"
                onPress={handleSubmit(onSubmit)}
                loading={isSubmitting}
              />
              <Text fontSize={getFontSize(12)} textCenter>
                Already have an account{" "}
                <Text
                  fontSize={getFontSize(13)}
                  onPress={() => !isSubmitting && router.replace("/(auth)")}
                  color={Colors.primaryLight}
                >
                  Sign In
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaContainer>
  );
};
export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Sizes.containerPaddingHorizontal,
  },
  inputs: {
    gap: hp(2),
    marginBottom: hp(5),
  },
  top: {
    marginTop: hp(6),
    marginBottom: "auto",
    alignItems: "center",
  },
  bottom: {
    marginBottom: hp(4),
    gap: hp(2),
  },
});

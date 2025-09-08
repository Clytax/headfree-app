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
// Components
import AuthAGB from "@/components/common/Policy/AuthAGB";
import Text from "@/components/common/Text";
import SafeAreaContainer from "@/components/common/Container/SafeAreaContainer";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";
import SimpleButton from "@/components/common/Buttons/SimpleButton";
import MyInput from "@/components/common/Input";
// Constants
import { Colors, Sizes } from "@/constants";

// Utils
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

// Assets

// Types
type SignUpFormType = z.infer<typeof SignUpSchema>;

const SignUp = () => {
  const router = useRouter();

  const headerHeight = useHeaderHeight(); // 0 if no header

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    getFieldState,
    formState: { errors, isValid, isSubmitting }, // note: isSubmitting is typical here
  } = useForm<SignUpFormType>({
    resolver: zodResolver(SignUpSchema),
    mode: "onSubmit",
  });

  const onSubmit = (data: SignUpFormType) => {};

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
              {/* Name *Optional* */}
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <MyInput
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
              <AuthAGB />
              <SimpleButton title="Register" onPress={handleSubmit(onSubmit)} />
              <Text fontSize={getFontSize(12)} textCenter>
                Already have an account?{" "}
                <Text
                  fontSize={getFontSize(13)}
                  onPress={() => router.replace("/(auth)")}
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
    marginTop: hp(10),
    marginBottom: hp(7),
    alignItems: "center",
  },
  bottom: {
    marginTop: "auto", // anchor bottom
    marginBottom: hp(4),
    gap: hp(2),
  },
});

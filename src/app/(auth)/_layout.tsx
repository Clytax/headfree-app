import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";

// Packages
import { Stack } from "expo-router";

const AuthLayout = () => {
  return (
    <Stack initialRouteName="index">
      <Stack.Screen
        name="index"
        options={{ headerShown: false, title: "Sign In" }}
      />
      <Stack.Screen
        name="signUp"
        options={{ headerShown: false, title: "Sign Up" }}
      />
    </Stack>
  );
};

export default AuthLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

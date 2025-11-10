// app/(tabs)/_layout.tsx
import React from "react";
import { Tabs } from "expo-router";
import MyTabBar from "@/components/BottomTab/CustomBottomBar/CustomBottomBar";
import { useUser } from "@/hooks/firebase/useUser";
import { useEmergencyContext } from "@/context/emergency/EmergencyContext";

// Store

export default function TabLayout() {
  const user = useUser();
  const { isEnabled, settings, animationForStacks } = useEmergencyContext();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: "none",
        },
      }}
      tabBar={(props) => <MyTabBar {...props} />}
    >
      <Tabs.Screen name="(home-stack)" />
      <Tabs.Screen name="(trend-stack)" />
      <Tabs.Screen name="(entry-stack)" />
      <Tabs.Screen name="(account-stack)" />
    </Tabs>
  );
}

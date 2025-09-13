// app/(tabs)/_layout.tsx
import React from "react";
import { Tabs } from "expo-router";
import MyTabBar from "@/components/BottomTab/CustomBottomBar/CustomBottomBar";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <MyTabBar {...props} />}
    >
      <Tabs.Screen name="(home-stack)" />
      <Tabs.Screen name="(trend-stack)" />
      <Tabs.Screen name="(entry-stack)" />
      <Tabs.Screen name="(account-stack)" />
    </Tabs>
  );
}

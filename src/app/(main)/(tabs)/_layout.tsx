// app/(tabs)/_layout.tsx
import React from "react";
import { Tabs } from "expo-router";
import MyTabBar from "@/components/BottomTab/CustomBottomBar/CustomBottomBar";
import { useUser } from "@/hooks/firebase/useUser";

export default function TabLayout() {
  const user = useUser();
  const animationsDisabled = user?.data?.emergency?.noAnimations;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: animationsDisabled ? "none" : "shift",
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

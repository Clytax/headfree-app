// components/navigation/MyTabBar.tsx
import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  LayoutChangeEvent,
} from "react-native";

// Packages
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

// Icons
import { Feather } from "@expo/vector-icons";

// Components
import Text from "@/components/common/Text";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";
import EmergencyButton from "@/components/Emergency/EmergencyButton";
// Constants
import { Colors } from "@/constants";

// Utils
import { hp, wp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

const BAR_HEIGHT = hp(10);
const NOTCH_RADIUS = 40;
const NOTCH_CENTER_Y = 0;
const FAB_SIZE = 80;
const FAB_RISE = 22;
const ICON_SIZE = hp(2.5);

type Props = BottomTabBarProps & {
  barColor?: string;
  borderTopColor?: string;
  notchRadius?: number;
  notchCenterY?: number;
  fabSize?: number;
  fabRise?: number;
};

export default function MyTabBar({
  state,
  navigation,
  barColor = Colors.neutral800,
  borderTopColor = "rgba(0,0,0,0.06)",
  notchRadius = NOTCH_RADIUS,
  notchCenterY = NOTCH_CENTER_Y,
  fabSize = FAB_SIZE,
  fabRise = FAB_RISE,
}: Props) {
  const insets = useSafeAreaInsets();
  const current = state.routes[state.index]?.name;
  const [barW, setBarW] = useState(0);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setBarW(e.nativeEvent.layout.width);
  }, []);

  const getNotchedPath = (
    width: number,
    height: number,
    r: number,
    cornerR: number = 16 // top corner radius
  ) => {
    const cX = width / 2;
    const notchWidth = r * 3; // how wide the dip is
    const notchDepth = r * 0.9; // how far it dips down

    const leftX = cX - notchWidth / 2;
    const rightX = cX + notchWidth / 2;

    return `
    M0,0
    H${leftX - 20}
    C${leftX + 20},0 ${cX - r},${notchDepth} ${cX},${notchDepth}
    C${cX + r},${notchDepth} ${rightX - 20},0 ${rightX + 20},0
    H${width}
    V${height}
    H0
    Z
  `;
  };

  if (!state || !navigation) return null;

  const getLabel = (routeName: string) =>
    routeName === "(home-stack)"
      ? "Home"
      : routeName === "(account-stack)"
      ? "Account"
      : routeName === "(trend-stack)"
      ? "Trend"
      : "Entry";

  const getIconName = (label: string): keyof typeof Feather.glyphMap => {
    if (label === "Home") return "home";
    if (label === "Trend") return "trending-up";
    if (label === "Account") return "user";
    return "plus";
  };

  return (
    <View
      onLayout={onLayout}
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 8) }]}
    >
      <View
        style={[
          styles.safeFill,
          { height: insets.bottom, backgroundColor: barColor },
        ]}
      />

      {barW > 0 && (
        <Svg
          pointerEvents="none"
          width={barW}
          height={BAR_HEIGHT}
          style={styles.svg}
        >
          <Path
            d={getNotchedPath(barW, BAR_HEIGHT, notchRadius)}
            fill={barColor}
            stroke={borderTopColor}
            strokeWidth={StyleSheet.hairlineWidth}
            fillRule="evenodd"
          />
        </Svg>
      )}

      {/* three zone layout to keep the center free */}
      <View style={styles.row}>
        {/* left third */}
        <View style={styles.third}>
          <View style={styles.sideGroup}>
            {state.routes.slice(0, 2).map((route) => {
              const isFocused = current === route.name;
              const onPress = () => {
                const evt = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isFocused && !evt.defaultPrevented) {
                  navigation.navigate({ name: route.name, merge: true });
                }
              };

              const label = getLabel(route.name);
              const color = isFocused ? Colors.primary : "#9aa0a6";
              const icon = getIconName(label);

              return (
                <MyTouchableOpacity
                  key={route.key}
                  onPress={onPress}
                  style={styles.item}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={`${label} tab`}
                  accessibilityHint={`Navigate to ${label}`}
                  hitSlop={8}
                >
                  <View style={styles.itemInner}>
                    <Feather
                      name={icon}
                      size={ICON_SIZE}
                      color={color}
                      style={{ marginBottom: 2 }}
                    />
                    <Text style={[styles.label, { color }]}>{label}</Text>
                  </View>
                </MyTouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* middle third empty for FAB and notch */}
        <View style={styles.third} />

        {/* right third */}
        <View style={styles.third}>
          <View style={styles.sideGroup}>
            {state.routes.slice(2).map((route) => {
              const isFocused = current === route.name;
              const onPress = () => {
                const evt = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isFocused && !evt.defaultPrevented) {
                  navigation.navigate({ name: route.name, merge: true });
                }
              };

              const label = getLabel(route.name);
              const color = isFocused ? Colors.primary : "#9aa0a6";
              const icon = getIconName(label);

              return (
                <MyTouchableOpacity
                  key={route.key}
                  onPress={onPress}
                  style={styles.item}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={`${label} tab`}
                  accessibilityHint={`Navigate to ${label}`}
                  // Optional: include selection state if you have it (replace `isFocused` accordingly)
                  // accessibilityState={{ selected: !!isFocused }}
                  hitSlop={8}
                >
                  <View style={styles.itemInner}>
                    <Feather
                      name={icon}
                      size={ICON_SIZE}
                      color={color}
                      style={{ marginBottom: 2 }}
                    />
                    <Text style={[styles.label, { color }]}>{label}</Text>
                  </View>
                </MyTouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* centered FAB */}
      <EmergencyButton
        style={[
          styles.fab,
          {
            width: fabSize,
            height: fabSize,
            borderRadius: fabSize / 2,
            bottom: BAR_HEIGHT - fabRise,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: BAR_HEIGHT,
    backgroundColor: Colors.background,
    justifyContent: "flex-end",
  },
  safeFill: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -1,
  },
  svg: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  row: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: BAR_HEIGHT,
    flexDirection: "row",
    paddingHorizontal: "5%",
  },
  third: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sideGroup: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    gap: 20,
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
    height: BAR_HEIGHT,
    paddingBottom: 4,
  },
  itemInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 12, fontWeight: "600" },
  fab: {
    position: "absolute",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  fabText: { color: "white", fontSize: 28, fontWeight: "700", lineHeight: 30 },
});

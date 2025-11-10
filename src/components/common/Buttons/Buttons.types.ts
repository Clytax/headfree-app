import { ReactNode } from "react";
import {
  AccessibilityRole,
  AccessibilityState,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";

export interface MyTouchableOpacityProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  activeOpacity?: number;
  testID?: string;
  disabled?: boolean;
  onPress?: any;
  onLayout?: any;
  accessible?: boolean;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  accessibilityState?: AccessibilityState;
  accessibilityIdentifier?: string;
  accessibilityHint?: string;

  hitSlop?:
    | number
    | { top: number; bottom: number; left: number; right: number };
}
export type SimpleButtonVariant = "primary" | "secondary";
export type SimpleButtonSize = "sm" | "md" | "lg";

export interface SimpleButtonProps {
  title: string;
  onPress?: () => void;
  testID?: string;

  /** Visuals */
  variant?: SimpleButtonVariant;
  size?: SimpleButtonSize;
  fullWidth?: boolean;
  rounded?: number;

  /** State */
  loading?: boolean;
  disabled?: boolean;

  /** Icons / extras */
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  showPremiumBadge?: boolean;

  /** Overrides */
  textStyle?: TextStyle;
  contentStyle?: ViewStyle;

  /** Testing */
  testID?: string;
}

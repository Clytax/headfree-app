import { StyleProp, ViewStyle } from "react-native";

export interface MyTouchableOpacityProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  activeOpacity?: number;
  disabled?: boolean;
  onPress?: any;
  onLayout?: any;
}
export type SimpleButtonVariant = "primary" | "secondary";
export type SimpleButtonSize = "sm" | "md" | "lg";

export interface SimpleButtonProps {
  title: string;
  onPress?: () => void;

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

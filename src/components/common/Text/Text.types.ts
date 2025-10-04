import {
  AccessibilityRole,
  AccessibilityState,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";

export interface TextProps {
  fontFamily?: "Inter";
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  fontSize?: number;
  numberOfLines?: number;
  onLayout?: any;

  fontWeight?: fontWeights;
  color?: string;

  hasContainer?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onContainerPress?: () => void;
  multiline?: boolean;
  ellipsis?: boolean;
  uppercase?: boolean;
  textCenter?: boolean;

  // ACcessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  isDecorative?: boolean;
  announcePolite?: boolean;
  allowFontScaling?: boolean;
  maxFontSizeMultiplier?: number;
  adjustsFontSizeToFit?: boolean;
  minimumFontScale?: number;
  selectable?: boolean;
}

export interface TextContainerProps {
  containerStyles?: StyleProp<ViewStyle> | StyleProp<ViewStyle>[];
  children?: React.ReactNode;
  onPress?: () => void;
}
export type fontWeights =
  | "thin"
  | "light"
  | "lightitalic"
  | "regular"
  | "regularitalic"
  | "medium"
  | "mediumitalic"
  | "semibold"
  | "semibolditalic"
  | "bold"
  | "extrabold"
  | "black";

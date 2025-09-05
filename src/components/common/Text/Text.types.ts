import { StyleProp, TextStyle, ViewStyle } from "react-native";

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
  | "medium"
  | "mediumitalic"
  | "semibold"
  | "semibolditalic"
  | "bold"
  | "extrabold"
  | "black";

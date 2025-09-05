import { StyleProp, ViewStyle } from "react-native";

export interface MyTouchableOpacityProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  activeOpacity?: number;
  disabled?: boolean;
  onPress?: any;
  onLayout?: any;
}

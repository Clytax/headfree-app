import { StyleProp, ViewStyle } from "react-native";

export interface EmergencyButtonProps {
  style: StyleProp<ViewStyle>;
}

export interface ColdTherapyVisualProps {
  defaultMinutes?: number; // 10 or 15
  onComplete?: () => void;
}

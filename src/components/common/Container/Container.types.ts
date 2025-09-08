import { StyleProp, ViewStyle } from "react-native";
import { Edge } from "react-native-safe-area-context";

export interface SafeAreaContainerProps {
  /** Children to render inside the container. */
  children?: React.ReactNode;

  /** Additional style(s) for the root view. */
  style?: StyleProp<ViewStyle>;

  /**
   * Which safe-area edges to apply as padding.
   * @default ["top", "bottom"]
   */
  edges?: readonly Edge[];
  /** Extra padding added on top of the safe-area top padding. @default 0 */
  extraTop?: number;

  /** Extra padding added on bottom of the safe-area bottom padding. @default 0 */
  extraBottom?: number;

  extraLeft?: number;
  extraRight?: number;

  /**
   * Optional override for safe-area insets.
   * Useful for portals or nested SafeAreaProviders.
   */
  insetsOverride?: Partial<EdgeInsets>;

  /** Set to false to ignore safe-area insets entirely. @default true */
  useSafeArea?: boolean;

  /** Background color. Prefer styling via `style` when possible. @default Colors.Background */
  backgroundColor?: string;

  /** Testing identifier. */
  testID?: string;
}

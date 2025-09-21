import { IUserEmergencySettings } from "@/types/user";
import { TabAnimationName } from "node_modules/@react-navigation/bottom-tabs/lib/typescript/src/types";
import { StackAnimationTypes } from "react-native-screens";

export type UseEmergencyResult = {
  isEnabled: boolean;
  enabledAt: Date | null;
  settings: IUserEmergencySettings;
  isReady: boolean;

  setEnabled: (v: boolean) => Promise<void>;
  toggle: () => Promise<void>;
  refreshSettingsFromCache: () => Promise<void>;
  animationForTabs: TabAnimationName | undefined;
  animationForStacks: StackAnimationTypes | undefined;
};

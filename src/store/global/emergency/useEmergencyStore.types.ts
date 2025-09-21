import { IUserEmergencySettings } from "@/types/user";

export interface IEmergencyStoreState {
  isEnabled: boolean;
  enabledAt: Date | null;
  settings: IUserEmergencySettings | null;

  unSubscribe: (() => void) | null;
  setEnabled: (enabled: boolean) => void;
  hydrateSettings: (userId: string) => Promise<void>;
}

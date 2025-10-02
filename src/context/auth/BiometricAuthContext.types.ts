export interface BiometricAuthContextType {
  isBiometricAuthActive: boolean;
  setIsBiometricAuthActive: (active: boolean) => void;
  checkBiometricAvailability: () => Promise<BiometricAvailability>;
  handleBiometricAuth: () => Promise<boolean>;
  offerBiometricSetup: (
    email: string,
    uid: string,
    password: string
  ) => Promise<void>;
  disableBiometrics: () => Promise<void>;
}

export interface BiometricAvailability {
  isAvailable: boolean;
  biometricType: string;
}

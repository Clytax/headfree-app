import { FirebaseAuthTypes } from "@react-native-firebase/auth";

export type AuthContextType = {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
};

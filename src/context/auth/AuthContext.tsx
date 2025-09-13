// providers/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import auth, {
  FirebaseAuthTypes,
  getAuth,
  onAuthStateChanged,
  onIdTokenChanged,
  reload,
  signOut,
} from "@react-native-firebase/auth";

// Types
import { AuthContextType } from "@/context/auth/AuthContext.types";

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const auth = getAuth();
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const mounted = useRef(true);

  const handleUser = (u: FirebaseAuthTypes.User | null) => {
    if (!mounted.current) return;
    setUser(u);
    if (loading) setLoading(false);
  };

  // Core listeners
  useEffect(() => {
    mounted.current = true;
    const unsubState = onAuthStateChanged(auth, handleUser);
    const unsubToken = onIdTokenChanged(auth, handleUser);
    return () => {
      mounted.current = false;
      unsubState();
      unsubToken();
    };
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", async (state) => {
      if (state === "active") {
        try {
          await reload(user!);
        } catch {
          // If the user was deleted on the server, reload throws.
          await signOut(auth);
          setUser(null);
        }
      }
    });
    return () => sub.remove();
  }, []);

  const value = useMemo(() => ({ user, loading }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

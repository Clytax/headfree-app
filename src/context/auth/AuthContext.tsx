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
import {
  FirebaseAuthTypes,
  getAuth,
  onAuthStateChanged,
  reload,
} from "@react-native-firebase/auth";

import { AuthContextType } from "@/context/auth/AuthContext.types";

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const firebaseAuth = getAuth();
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const unsub = onAuthStateChanged(firebaseAuth, (u) => {
      if (!mounted.current) return;
      setUser(u);
      setLoading(false);
    });
    return () => {
      mounted.current = false;
      unsub();
    };
  }, [firebaseAuth]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", async (state) => {
      if (state !== "active") return;

      const a = getAuth();
      const current = a.currentUser;
      if (!current) return;

      try {
        await reload(current);
        // Optional, force refresh the ID token if you need it
        // await current.getIdToken(true);
      } catch (e) {
        // If the user was deleted on the server or the token is invalid, reload can throw
        try {
          await a.signOut();
        } finally {
          if (mounted.current) setUser(null);
        }
      }
    });
    return () => sub.remove();
  }, []);

  const value = useMemo(() => ({ user, loading }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

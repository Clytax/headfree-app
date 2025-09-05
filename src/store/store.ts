import { configureStore, combineReducers } from "@reduxjs/toolkit";

// Reducers
import globalSlice from "./global/globalSlice";

// Persist
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Combine all reducers
const rootReducer = combineReducers({
  global: globalSlice,
  // add auth, settings, etc. here later
});

// Persist config — empty whitelist for now
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  blacklist: ["global"],
};

// Apply persistence wrapper
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        warnAfter: 1000,
      },
      immutableCheck: {
        warnAfter: 1000,
      },
    }),
});

// Persistor for redux-persist gate
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

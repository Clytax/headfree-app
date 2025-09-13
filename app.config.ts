import { ConfigContext, ExpoConfig } from "@expo/config";
import * as dotenv from "dotenv";
dotenv.config();
module.exports = ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: "headfree-app",
    slug: "headfree-app",
    version: "1.0.0",
    ios: {
      supportsTablet: true,

      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
      bundleIdentifier: "com.clytax.headfree",
      googleServicesFile:
        process.env.IOS_FIREBASE_GOOGLE_SERVICE ?? "./GoogleService-Info.plist",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./src/assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: "com.clytax.headfree",
      // googleServicesFile:
      //   process.env.ANDROID_FIREBASE_GOOGLE_SERVICE || "./google-services.json",
    },
  };
};

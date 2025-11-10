import { DetoxConfig } from "detox";

const config: DetoxConfig = {
  testRunner: {
    // use jest
    args: {
      config: "e2e/jest.config.js",
      _: ["e2e"],
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    "ios.sim.debug": {
      type: "ios.app",
      build:
        "xcodebuild -workspace ios/YourApp.xcworkspace -scheme YourApp -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build",
      binaryPath: "ios/build/Build/Products/Debug-iphonesimulator/YourApp.app",
    },
    "ios.sim.release": {
      type: "ios.app",
      build:
        "xcodebuild -workspace ios/YourApp.xcworkspace -scheme YourApp -configuration Release -sdk iphonesimulator -derivedDataPath ios/build",
      binaryPath:
        "ios/build/Build/Products/Release-iphonesimulator/YourApp.app",
    },
  },
  devices: {
    "ios.sim": {
      type: "ios.simulator",
      // pick a common device or replace with your favorite
      device: { type: "iPhone 17" },
    },
  },
  configurations: {
    "ios.debug": {
      device: "ios.sim",
      app: "ios.sim.debug",
    },
    "ios.release": {
      device: "ios.sim",
      app: "ios.sim.release",
    },
  },
};

export default config;

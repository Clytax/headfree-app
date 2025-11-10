// .detoxrc.js
const APP_SCHEME = "headfreeapp"; // <- change to your real iOS scheme name
const DERIVED = "ios/build";

module.exports = {
  testRunner: {
    // Jest runner settings
    args: {
      config: "e2e/jest.config.js",
      _: ["e2e"],
    },
    jest: { setupTimeout: 120000 },
  },
  apps: {
    "ios.sim.release": {
      type: "ios.app",
      build: `xcodebuild -workspace ios/${APP_SCHEME}.xcworkspace -scheme ${APP_SCHEME} -configuration Release -sdk iphonesimulator -derivedDataPath ${DERIVED}`,
      binaryPath: `${DERIVED}/Build/Products/Release-iphonesimulator/${APP_SCHEME}.app`,
    },
    "ios.sim.debug": {
      type: "ios.app",
      build: `xcodebuild -workspace ios/${APP_SCHEME}.xcworkspace -scheme ${APP_SCHEME} -configuration Debug -sdk iphonesimulator -derivedDataPath ${DERIVED}`,
      binaryPath: `${DERIVED}/Build/Products/Debug-iphonesimulator/${APP_SCHEME}.app`,
    },
  },
  devices: {
    "ios.sim": {
      type: "ios.simulator",
      // Use a valid device installed on your machine:
      // Check with: `xcrun simctl list devicetypes`
      device: { type: "iPhone 17" },
      // Or match by NAME (exact from `xcrun simctl list devices`):
      // device: { name: 'iPhone 15 Pro' },
    },
  },
  configurations: {
    "ios.release": { device: "ios.sim", app: "ios.sim.release" },
    "ios.debug": { device: "ios.sim", app: "ios.sim.debug" },
  },
};

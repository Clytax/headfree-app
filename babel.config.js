module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // other plugins like expo-router if you use it
      "react-native-reanimated/plugin",
    ],
  };
};

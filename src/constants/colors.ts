export const BaseColors = {
  primary50: "#eaf4f2",
  primary100: "#bddcd6",
  primary200: "#9dcbc2",
  primary300: "#70b4a6",
  primary400: "#55a595",
  primary500: "#2a8f7a",
  primary600: "#26826f",
  primary700: "#1e6657",
  primary800: "#174f43",
  primary900: "#123c33",
  ssecondary50: "#e9edf1",
  secondary100: "#bcc8d5",
  secondary200: "#9cadc0",
  secondary300: "#6e87a4",
  secondary400: "#527092",
  secondary500: "#274c77",
  secondary600: "#23456c",
  secondary700: "#1c3654",
  secondary800: "#152a41",
  secondary900: "#102032",

  neutral50: "#e9e9ea",
  neutral100: "#babcbd",
  neutral200: "#999c9d",
  neutral300: "#6b6e71",
  neutral400: "#4e5255",
  neutral500: "#22272b",
  neutral600: "#1f2327",
  neutral700: "#181c1f",
  neutral800: "#161a1d",
  neutral900: "#101214",

  // Utils
  success50: "#ecf8f3",
  success100: "#c3e8da",
  success200: "#a6ddc9",
  success300: "#7ecdb0",
  success400: "#65c3a1",
  success500: "#3eba89",
  success600: "#38ad74",
  success700: "#2c8061",
  success800: "#22634b",
  success900: "#1a6c3a",

  warning50: "#fff4ed",
  warning100: "#f7dec7",
  warning200: "#f4ceac",
  warning300: "#eeb886",
  warning400: "#ebaa6f",
  warning500: "#e6954b",
  warning600: "#d18844",
  warning700: "#a36a35",
  warning800: "#7f5229",
  warning900: "#613120",

  error50: "#fcf1f1",
  error100: "#f7d4d4",
  error200: "#f3bfbf",
  error300: "#eea1a1",
  error400: "#ea8f8f",
  error500: "#e57373",
  error600: "#d06969",
  error700: "#a35252",
  error800: "#7e3f3f",
  error900: "#603030",
};

const FinalColors = {
  transparent: "transparent",
  primary: BaseColors.primary500,
  primaryLight: BaseColors.primary300,
  primaryDark: BaseColors.primary700,
  secondary: BaseColors.secondary500,
  secondaryDark: BaseColors.secondary700,

  background: BaseColors.neutral900,
  backgroundLighter: BaseColors.neutral800,
  border: BaseColors.neutral500,

  text: BaseColors.neutral100,
  textDark: BaseColors.neutral700,

  // Colors
  black: BaseColors.neutral900,
  blackTransparent: BaseColors.neutral900 + "80",
  white: BaseColors.neutral50,
  whiteTransparent: BaseColors.neutral50 + "80",
  gray: BaseColors.neutral300,
  grayTransparent: BaseColors.neutral300 + "80",
  lightGray: BaseColors.neutral200,
  lightGrayTransparent: BaseColors.neutral200 + "80",

  // Utils
  error: BaseColors.error300,
  success: BaseColors.success300,
  warning: BaseColors.warning300,
  info: BaseColors.primary300,

  // Components
  modalBackdrop: BaseColors.neutral900 + "CC",
};

const Colors = { ...BaseColors, ...FinalColors };
export default Colors;

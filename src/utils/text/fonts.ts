import { Dimensions, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const SCALE = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT);
const BASE_WIDTH = 375;

type DeviceType = "phone" | "tablet";
type ScreenCategory = "small" | "medium" | "large";

const fontConfig: Record<
  DeviceType,
  Record<ScreenCategory, { min: number; max: number }>
> = {
  phone: {
    small: { min: 0.8, max: 1 },
    medium: { min: 0.9, max: 1.1 },
    large: { min: 1, max: 1.2 },
  },
  tablet: {
    small: { min: 1.3, max: 1.4 },
    medium: { min: 1.4, max: 1.5 },
    large: { min: 1.5, max: 1.7 },
  },
};

// Memoization cache
let cachedDeviceType: DeviceType | null = null;
let cachedScreenCategory: ScreenCategory | null = null;

export const getDeviceType = (): DeviceType => {
  if (cachedDeviceType) return cachedDeviceType;

  const pixelDensity = PixelRatio.get();
  const adjustedWidth = SCREEN_WIDTH * pixelDensity;
  const adjustedHeight = SCREEN_HEIGHT * pixelDensity;

  cachedDeviceType =
    (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000)) ||
    (pixelDensity === 2 && (adjustedWidth >= 1920 || adjustedHeight >= 1920))
      ? "tablet"
      : "phone";

  return cachedDeviceType;
};

const getScreenSizeCategory = (): ScreenCategory => {
  if (cachedScreenCategory) return cachedScreenCategory;

  cachedScreenCategory =
    SCALE < 350 ? "small" : SCALE > 500 ? "large" : "medium";

  return cachedScreenCategory;
};

const getClampedScaleFactor = (
  deviceType: DeviceType,
  screenCategory: ScreenCategory
): number => {
  const config = fontConfig[deviceType][screenCategory];
  const scaleFactor = SCALE / BASE_WIDTH;
  return Math.min(Math.max(scaleFactor, config.min), config.max);
};

export const getFontSize = (
  size: number,
  overrideDeviceType?: DeviceType,
  overrideScreenCategory?: ScreenCategory
): number => {
  const deviceType = overrideDeviceType || getDeviceType();
  const screenCategory = overrideScreenCategory || getScreenSizeCategory();
  let newSize = size * getClampedScaleFactor(deviceType, screenCategory);
  if (deviceType === "tablet") {
    newSize *= 1.1;
  }

  return (
    Math.round(PixelRatio.roundToNearestPixel(newSize)) /
    PixelRatio.getFontScale()
  );
};

export const adjustFontConfig = (
  deviceType: DeviceType,
  screenCategory: ScreenCategory,
  minScale: number,
  maxScale: number
) => {
  fontConfig[deviceType][screenCategory] = { min: minScale, max: maxScale };
};

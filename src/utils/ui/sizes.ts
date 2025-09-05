import { Dimensions, PixelRatio } from "react-native";

const { height, width } = Dimensions.get("window");

const BASE_WIDTH = 375;
export const normalize = (size: number) =>
  PixelRatio.roundToNearestPixel((width / BASE_WIDTH) * size);
const wp = (percentage: number) =>
  PixelRatio.roundToNearestPixel((width * percentage) / 100);

const hp = (percentage: number) =>
  PixelRatio.roundToNearestPixel((height * percentage) / 100);

export { wp, hp };

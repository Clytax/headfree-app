//Fonts
import {
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
  useFonts as expoFont,
} from "@expo-google-fonts/inter";
const useFonts = () => {
  const [fontsLoaded, error] = expoFont({
    Inter_Thin: Inter_100Thin,
    Inter_ExtraLight: Inter_200ExtraLight,
    Inter_Light: Inter_300Light,
    Inter_Regular: Inter_400Regular,
    Inter_Medium: Inter_500Medium,
    Inter_Semibold: Inter_600SemiBold,

    Inter_Bold: Inter_700Bold,
    Inter_Extrabold: Inter_800ExtraBold,

    Inter_Black: Inter_900Black,
  });

  return { fontsLoaded, error };
};

export default useFonts;

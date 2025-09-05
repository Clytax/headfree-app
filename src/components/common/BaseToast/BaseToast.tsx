import { hp } from "@/utils/ui/sizes";
import React from "react";

// Packages
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast, { ToastProps } from "react-native-toast-message";

const BaseToast = (props: ToastProps) => {
  const insets = useSafeAreaInsets();
  return (
    <Toast
      position="top"
      visibilityTime={3000}
      topOffset={insets.top + hp(1)}
      bottomOffset={insets.bottom + 10}
      {...props}
    />
  );
};
export default BaseToast;

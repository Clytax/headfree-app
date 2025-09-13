import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
} from "react";

// Packages
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, View } from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetScrollView,
  BottomSheetFooter,
} from "@gorhom/bottom-sheet";

// UI
import Text from "@/components/common/Text";
import { AnimatedButton } from "@/components/Onboarding/OnboardingBottom/OnboardingPrimitiveButton";
import { Colors } from "@/constants";
import OnboardingEmergencyBrightness from "@/components/Onboarding/OnboardingEmergency/OnboardingEmergencyBrightness";

export type EmergencySetupSheetHandle = {
  present: () => void;
  dismiss: () => void;
};

type Props = {
  onSaveContinue: () => void;
  onClose?: () => void;
};

const EmergencySetupSheet = forwardRef<EmergencySetupSheetHandle, Props>(
  ({ onSaveContinue, onClose }, ref) => {
    const innerRef = useRef<BottomSheetModal>(null);
    const insets = useSafeAreaInsets();

    const present = useCallback(() => {
      const m = innerRef.current;
      if (!m) return;
      m.present();
      requestAnimationFrame(() => m.snapToIndex(0));
    }, []);

    const dismiss = useCallback(() => innerRef.current?.dismiss(), []);

    useImperativeHandle(ref, () => ({ present, dismiss }), [present, dismiss]);

    const handleSaveContinue = useCallback(() => {
      dismiss();
      onSaveContinue();
    }, [dismiss, onSaveContinue]);

    return (
      <BottomSheetModal
        ref={innerRef}
        snapPoints={["50%"]}
        enablePanDownToClose
        onDismiss={onClose}
        backgroundStyle={{ backgroundColor: Colors.background }}
        handleIndicatorStyle={{ backgroundColor: Colors.secondary400 }}
        keyboardBehavior={Platform.select({
          ios: "extend",
          android: "fillParent",
        })}
        android_keyboardInputMode="adjustResize"
        footerComponent={(footerProps) => (
          <BottomSheetFooter {...footerProps} bottomInset={insets.bottom}>
            <View
              style={{
                paddingHorizontal: 16,
                paddingTop: 12,
                backgroundColor: Colors.background,
                gap: 10,
              }}
            >
              <AnimatedButton
                style={{ backgroundColor: Colors.primary500 }}
                onPress={handleSaveContinue}
              >
                <Text fontWeight="bold" color={Colors.textDark}>
                  Save and continue
                </Text>
              </AnimatedButton>

              <AnimatedButton
                style={{ backgroundColor: Colors.secondary200 }}
                onPress={dismiss}
              >
                <Text fontWeight="bold" color={Colors.textDark}>
                  Close
                </Text>
              </AnimatedButton>
            </View>
          </BottomSheetFooter>
        )}
      >
        <BottomSheetView style={{ flex: 1 }}>
          <BottomSheetScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 24,
            }}
          >
            <Text
              fontSize={20}
              fontWeight="bold"
              color={Colors.neutral400}
              style={{ marginBottom: 8 }}
            >
              Emergency setup
            </Text>
            <OnboardingEmergencyBrightness />

            {/* Example filler to demonstrate scrolling */}
            <View style={{ height: 400 }} />
          </BottomSheetScrollView>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

EmergencySetupSheet.displayName = "EmergencySetupSheet";
export default EmergencySetupSheet;

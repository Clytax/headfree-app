import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
  memo,
  useMemo,
} from "react";

// Packages
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, StyleSheet, View } from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetScrollView,
  BottomSheetFooter,
  BottomSheetFooterProps,
} from "@gorhom/bottom-sheet";
import * as Brightness from "expo-brightness";

// UI
import Text from "@/components/common/Text";
import { AnimatedButton } from "@/components/Onboarding/OnboardingBottom/OnboardingPrimitiveButton";
import { Colors, Sizes } from "@/constants";

// Setup
import OnboardingEmergencyMute from "@/components/Onboarding/OnboardingEmergency/OnboardingEmergencyMute";
import OnboardingEmergencyBrightness from "@/components/Onboarding/OnboardingEmergency/OnboardingEmergencyBrightness";
import OnboardingEmergencyAnimations from "@/components/Onboarding/OnboardingEmergency/OnboardingEmergencyAnimation";

export type EmergencySetupSheetHandle = {
  present: () => void;
  dismiss: () => void;
};

type Props = {
  onSaveContinue: () => void;
  onClose?: () => void;
};

// memoized footer component
const EmergencyFooter = memo(function EmergencyFooter({
  bottomInset,
  onSaveContinue,
  onClose,
  footerProps,
}: {
  bottomInset: number;
  onSaveContinue: () => void;
  onClose: () => void;
  footerProps: BottomSheetFooterProps;
}) {
  return (
    <BottomSheetFooter bottomInset={bottomInset} {...footerProps}>
      <View style={footerStyles.container}>
        <AnimatedButton
          entering={undefined}
          style={footerStyles.primary}
          onPress={onSaveContinue}
        >
          <Text fontWeight="bold" color={Colors.textDark}>
            Save and continue
          </Text>
        </AnimatedButton>

        <AnimatedButton
          entering={undefined}
          style={footerStyles.secondary}
          onPress={onClose}
        >
          <Text fontWeight="bold" color={Colors.textDark}>
            Close
          </Text>
        </AnimatedButton>
      </View>
    </BottomSheetFooter>
  );
});

const footerStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: Colors.background,
    gap: 10,
  },
  primary: { backgroundColor: Colors.primary500 },
  secondary: { backgroundColor: Colors.secondary200 },
});

const EmergencySetupSheet = forwardRef<EmergencySetupSheetHandle, Props>(
  ({ onSaveContinue, onClose }, ref) => {
    const innerRef = useRef<BottomSheetModal>(null);
    const insets = useSafeAreaInsets();

    // brightness refs
    const initialAppRef = useRef<number | null>(null);
    const initialSystemRef = useRef<number | null>(null);
    const openedRef = useRef(false);

    const captureCurrentBrightness = useCallback(async () => {
      try {
        if (openedRef.current) return;
        openedRef.current = true;

        const app = await Brightness.getBrightnessAsync();
        initialAppRef.current = app;

        if (Platform.OS === "ios") {
          const sys = await Brightness.getSystemBrightnessAsync();
          initialSystemRef.current = sys;
        }
      } catch {
        // ignore
      }
    }, []);

    const restoreBrightness = useCallback(async () => {
      try {
        const app = initialAppRef.current;
        if (typeof app === "number") {
          await Brightness.setBrightnessAsync(app);
        }
        if (Platform.OS === "ios") {
          const sys = initialSystemRef.current;
          if (typeof sys === "number") {
            await Brightness.setSystemBrightnessAsync(sys);
          }
        }
      } catch {
        // ignore
      } finally {
        initialAppRef.current = null;
        initialSystemRef.current = null;
        openedRef.current = false;
      }
    }, []);

    const present = useCallback(() => {
      const m = innerRef.current;
      if (!m) return;
      m.present();
      captureCurrentBrightness();
      requestAnimationFrame(() => m.snapToIndex(0));
    }, [captureCurrentBrightness]);

    const dismiss = useCallback(() => innerRef.current?.dismiss(), []);

    useImperativeHandle(ref, () => ({ present, dismiss }), [present, dismiss]);

    const handleSaveContinue = useCallback(() => {
      dismiss();
      onSaveContinue();
    }, [dismiss, onSaveContinue]);

    const handleDismiss = useCallback(() => {
      restoreBrightness();
      onClose?.();
    }, [onClose, restoreBrightness]);

    const bgStyle = useMemo(() => ({ backgroundColor: Colors.background }), []);
    const indicatorStyle = useMemo(
      () => ({ backgroundColor: Colors.secondary400 }),
      []
    );

    return (
      <BottomSheetModal
        ref={innerRef}
        snapPoints={["50%"]}
        enablePanDownToClose
        onDismiss={handleDismiss}
        backgroundStyle={bgStyle}
        handleIndicatorStyle={indicatorStyle}
        keyboardBehavior={Platform.select({
          ios: "extend",
          android: "fillParent",
        })}
        android_keyboardInputMode="adjustResize"
        footerComponent={(footerProps) => (
          <EmergencyFooter
            bottomInset={insets.bottom}
            onSaveContinue={handleSaveContinue}
            onClose={onClose ?? dismiss}
            footerProps={footerProps}
          />
        )}
      >
        <BottomSheetView style={{ flex: 1 }}>
          <BottomSheetScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: Sizes.containerPaddingHorizontal * 2,
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
            <View style={styles.divider} />
            <OnboardingEmergencyMute />
            <View style={styles.divider} />
            <OnboardingEmergencyAnimations />
            <View style={styles.divider} />

            <View style={{ height: 400 }} />
          </BottomSheetScrollView>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

EmergencySetupSheet.displayName = "EmergencySetupSheet";
export default EmergencySetupSheet;

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.neutral500,
    marginVertical: 16,
  },
});

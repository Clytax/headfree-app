import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useEffect,
  ComponentProps,
} from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  InteractionManager,
  ActivityIndicator,
} from "react-native";

// Utils
import { getFontSize } from "@/utils/text/fonts";

// Constants
import { Colors, Sizes } from "@/constants";
import { wp, hp } from "@/utils/ui/sizes";

// Expo vector icons
import {
  Entypo,
  Feather,
  Ionicons,
  MaterialIcons,
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  AntDesign,
  MaterialCommunityIcons,
  Octicons,
  SimpleLineIcons,
  EvilIcons,
  Foundation,
} from "@expo/vector-icons";

import Text from "@/components/common/Text";
import { MyInputProps, MyInputHandle } from "./Input.d";

/** Icon typing */
type IconSpec =
  | { set: "Entypo"; name: ComponentProps<typeof Entypo>["name"] }
  | { set: "Feather"; name: ComponentProps<typeof Feather>["name"] }
  | { set: "Ionicons"; name: ComponentProps<typeof Ionicons>["name"] }
  | { set: "MaterialIcons"; name: ComponentProps<typeof MaterialIcons>["name"] }
  | { set: "FontAwesome"; name: ComponentProps<typeof FontAwesome>["name"] }
  | { set: "FontAwesome5"; name: ComponentProps<typeof FontAwesome5>["name"] }
  | { set: "FontAwesome6"; name: ComponentProps<typeof FontAwesome6>["name"] }
  | { set: "AntDesign"; name: ComponentProps<typeof AntDesign>["name"] }
  | {
      set: "MaterialCommunityIcons";
      name: ComponentProps<typeof MaterialCommunityIcons>["name"];
    }
  | { set: "Octicons"; name: ComponentProps<typeof Octicons>["name"] }
  | {
      set: "SimpleLineIcons";
      name: ComponentProps<typeof SimpleLineIcons>["name"];
    }
  | { set: "EvilIcons"; name: ComponentProps<typeof EvilIcons>["name"] }
  | { set: "Foundation"; name: ComponentProps<typeof Foundation>["name"] };

function renderIconFromSpec(
  spec: IconSpec | undefined,
  color: string,
  size: number
) {
  if (!spec) return null;
  const common = { color, size } as const;

  switch (spec.set) {
    case "Entypo":
      return <Entypo name={spec.name} {...common} />;
    case "Feather":
      return <Feather name={spec.name} {...common} />;
    case "Ionicons":
      return <Ionicons name={spec.name} {...common} />;
    case "MaterialIcons":
      return <MaterialIcons name={spec.name} {...common} />;
    case "FontAwesome":
      return <FontAwesome name={spec.name} {...common} />;
    case "FontAwesome5":
      return <FontAwesome5 name={spec.name} {...common} />;
    case "FontAwesome6":
      return <FontAwesome6 name={spec.name} {...common} />;
    case "AntDesign":
      return <AntDesign name={spec.name} {...common} />;
    case "MaterialCommunityIcons":
      return <MaterialCommunityIcons name={spec.name} {...common} />;
    case "Octicons":
      return <Octicons name={spec.name} {...common} />;
    case "SimpleLineIcons":
      return <SimpleLineIcons name={spec.name} {...common} />;
    case "EvilIcons":
      return <EvilIcons name={spec.name} {...common} />;
    case "Foundation":
      return <Foundation name={spec.name} {...common} />;
    default:
      return null;
  }
}

const MyInput = forwardRef<
  MyInputHandle,
  Omit<MyInputProps, "leftIcon" | "rightIcon"> & {
    leftIcon?: IconSpec;
    rightIcon?: IconSpec;
    loading?: boolean;
  }
>((props, ref) => {
  const {
    loading = false,
    value,
    onChangeText,
    onFocus,
    onBlur,
    multiline = false,

    label,
    subLabel,
    helperText,
    errorText,
    required,

    size = "md",
    status = "default",
    disabled = false,

    secureTextEntry = false,
    showPasswordToggle = false,

    leftIcon,
    rightIcon,

    containerStyle,
    inputStyle,
    outerStyle,

    autoGrow = multiline,
    minHeight = hp(4.6),
    maxHeight,

    placeholder,
    keyboardType,
    selectionColor = Colors.primary,
    autoCapitalize,
    autoCorrect,
    returnKeyType,
    onSubmitEditing,
    blurOnSubmit,
    placeholderTextColor,
    editable,
    testID,
    accessibilityLabel,
    accessibilityHint,
    ...rest
  } = props;

  const tiRef = useRef<TextInput>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [height, setHeight] = useState(minHeight);
  const [focused, setFocused] = useState(false);

  useImperativeHandle(ref, () => ({
    focus: () => tiRef.current?.focus(),
    blur: () => tiRef.current?.blur(),
    clear: () => tiRef.current?.clear(),
    isFocused: () => !!tiRef.current?.isFocused(),
  }));

  useEffect(() => {
    if (loading) {
      tiRef.current?.blur();
    }
  }, [loading]);

  const blocked = disabled || loading;
  const hasError = status === "error" || !!errorText;

  const { paddings, fontSize, iconSize, radius } = useMemo(() => {
    switch (size) {
      case "sm":
        return {
          paddings: { v: hp(0.8), h: wp(3.2) },
          fontSize: getFontSize(12),
          iconSize: getFontSize(16),
          radius: Sizes.smallRadius,
        };
      case "lg":
        return {
          paddings: { v: hp(1.6), h: wp(4) },
          fontSize: getFontSize(15),
          iconSize: getFontSize(20),
          radius: Sizes.mediumRadius,
        };
      default:
        return {
          paddings: { v: hp(1.5), h: wp(4) },
          fontSize: getFontSize(16),
          iconSize: getFontSize(18),
          radius: Sizes.smallRadius,
        };
    }
  }, [size]);

  const palette = useMemo(() => {
    const base = {
      bg: Colors.neutral700,
      border: Colors.neutral500,
      text: Colors.neutral200,
      placeholder: Colors.lightGray,
      helper: Colors.lightGray,
      icon: Colors.lightGray,
    };

    if (focused) {
      base.border = Colors.neutral200;
      base.icon = Colors.neutral100;
    }
    if (status === "success") base.border = Colors.success;
    if (status === "warning") base.border = Colors.warning;

    if (hasError) {
      base.border = Colors.error;
      base.placeholder = Colors.error;
      base.icon = Colors.error;
    }

    if (blocked) {
      base.text = Colors.gray;
      base.placeholder = Colors.gray;
      base.icon = Colors.gray;
    }

    return base;
  }, [status, hasError, blocked, focused]);

  const onContentSizeChange = useCallback(
    (e: any) => {
      if (!autoGrow || !multiline) return;
      const nextHeight = Math.max(
        minHeight,
        e?.nativeEvent?.contentSize?.height ?? minHeight
      );
      const clamped = maxHeight ? Math.min(nextHeight, maxHeight) : nextHeight;
      setHeight(clamped);
    },
    [autoGrow, multiline, minHeight, maxHeight]
  );

  const effectiveSecure = secureTextEntry && !showPassword;

  const handleFocus = useCallback(
    (...args: any[]) => {
      setFocused(true);
      onFocus?.(...(args as Parameters<NonNullable<typeof onFocus>>));
    },
    [onFocus]
  );

  const handleBlur = useCallback(
    (...args: any[]) => {
      setFocused(false);
      onBlur?.(...(args as Parameters<NonNullable<typeof onBlur>>));
    },
    [onBlur]
  );

  return (
    <View style={[outerStyle, { position: "relative" }]}>
      {label ? (
        <>
          <Text
            fontSize={getFontSize(20)}
            color={hasError ? Colors.error : Colors.neutral100}
            style={{ marginBottom: subLabel ? hp(0.3) : hp(1) }}
          >
            {label}
            <Text color={Colors.error}>{required ? "*" : ""}</Text>
          </Text>
          {subLabel ? (
            <Text
              fontSize={getFontSize(11)}
              color={Colors.neutral300}
              style={{ marginBottom: hp(1) }}
            >
              {subLabel}
            </Text>
          ) : null}
        </>
      ) : null}

      <View
        style={[
          styles.container,
          {
            backgroundColor: palette.bg,
            borderColor: palette.border,
            borderRadius: radius,
            paddingVertical: paddings.v,
            paddingHorizontal: paddings.h,
            opacity: blocked ? 0.6 : 1,
            borderWidth: 1,
          },
          containerStyle,
        ]}
        pointerEvents={blocked ? "none" : "auto"}
      >
        {leftIcon ? (
          <View style={styles.iconLeft}>
            {renderIconFromSpec(leftIcon, palette.icon, iconSize)}
          </View>
        ) : null}

        <TextInput
          ref={tiRef}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={editable ?? !blocked}
          multiline={multiline}
          onContentSizeChange={onContentSizeChange}
          style={[
            styles.input,
            {
              minHeight: multiline ? minHeight : undefined,
              height: multiline ? height : undefined,
              color: palette.text,
              fontSize,
              paddingLeft: leftIcon ? wp(2.2) : 0,
              fontFamily: "Inter-Regular",
              paddingRight:
                (secureTextEntry && showPasswordToggle) || rightIcon
                  ? wp(2.2)
                  : 0,
              textAlignVertical: multiline ? "top" : "center",
            },
            inputStyle,
          ]}
          selectionColor={selectionColor}
          placeholder={required ? `${placeholder ?? ""}*` : placeholder}
          placeholderTextColor={placeholderTextColor ?? palette.placeholder}
          keyboardType={keyboardType}
          secureTextEntry={effectiveSecure}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          testID={testID}
          accessibilityLabel={accessibilityLabel ?? label ?? placeholder}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled: blocked, busy: loading }}
          {...rest}
        />

        {secureTextEntry && showPasswordToggle ? (
          <Pressable
            onPress={() => {
              InteractionManager.runAfterInteractions(() => {
                setShowPassword((s) => !s);
                requestAnimationFrame(() => tiRef.current?.focus());
              });
            }}
            accessibilityRole="button"
            accessibilityLabel={
              showPassword ? "Hide password" : "Show password"
            }
            style={styles.iconRight}
            disabled={blocked}
            hitSlop={8}
          >
            <Entypo
              name={showPassword ? "eye" : "eye-with-line"}
              size={iconSize + 2}
              color={palette.icon}
            />
          </Pressable>
        ) : rightIcon ? (
          <View style={styles.iconRight}>
            {renderIconFromSpec(rightIcon, palette.icon, iconSize)}
          </View>
        ) : null}
      </View>

      {(errorText || helperText) && (
        <Text
          fontSize={getFontSize(12)}
          color={errorText ? Colors.error : palette.helper}
          style={{ marginTop: hp(0.4) }}
          textCenter
        >
          {errorText ?? helperText}
        </Text>
      )}

      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="auto"></View>
      )}
    </View>
  );
});

MyInput.displayName = "MyInput";
export default MyInput;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: "100%",
    backgroundColor: "transparent",
    includeFontPadding: false,
    paddingVertical: 0,
  },
  iconLeft: {
    justifyContent: "center",
    alignItems: "center",
    paddingRight: wp(1),
  },
  iconRight: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.08)",
    borderRadius: Sizes.smallRadius,
  },
});

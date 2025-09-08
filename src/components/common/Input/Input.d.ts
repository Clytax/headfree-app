import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TextInputProps,
  Pressable,
  ViewStyle,
  TextStyle,
} from "react-native";

type Status = "default" | "error" | "success" | "warning";
type Size = "sm" | "md" | "lg";

export interface MyInputHandle {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
}

export interface MyInputProps
  extends Omit<TextInputProps, "style" | "onChangeText" | "multiline"> {
  // Content & behavior
  value?: string;
  onChangeText?: (text: string) => void;
  multiline?: boolean;

  // Decoration
  label?: string;
  subLabel?: string;
  helperText?: string;
  errorText?: string; // takes precedence over helperText when provided
  required?: boolean;

  // Look & feel (variants removed)
  size?: Size;
  status?: Status; // influences colors/border; "error" also shows errorText if present
  disabled?: boolean;

  // Password handling
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean; // opt-in eye icon

  // Icons
  leftIcon?:
    | React.ReactNode
    | ((color: string, size: number) => React.ReactNode);
  rightIcon?:
    | React.ReactNode
    | ((color: string, size: number) => React.ReactNode);

  // Layout & styles
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  outerStyle?: ViewStyle;

  // Multiline auto-grow
  autoGrow?: boolean;
  minHeight?: number; // only for multiline
  maxHeight?: number; // only for multiline
}

import React, { useState, forwardRef } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  KeyboardTypeOptions,
  StyleProp,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from "react-native";

// Packages
import { getFontSize } from "@/utils/text/fonts";

// Constants
import Colors from "@/constants/colors";

// Utils
import { wp, hp } from "@/utils/ui/sizes";

// Icons
import { Entypo } from "@expo/vector-icons";
// Components
import Text from "@/common/Text/Text";

interface MyInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;

  required?: boolean;

  multiline?: boolean;

  error?: string;
  noErrorText?: boolean;

  outerStyle?: StyleProp<ViewStyle>;

  inputStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;

  type?: KeyboardTypeOptions;
  secureTextEntry?: boolean;

  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  accessibilityLabel?: string;
  textContentType?: TextInputProps["textContentType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoCorrect?: TextInputProps["autoCorrect"];

  keyboardType?: KeyboardTypeOptions;
}

const MyInput = forwardRef<TextInput, MyInputProps>(
  (
    {
      placeholder,
      value,
      onChangeText,
      onBlur,
      onFocus,
      required,
      error,
      noErrorText = false,
      multiline = false,
      type,
      secureTextEntry,
      containerStyle,
      inputStyle,
      outerStyle,
      leftIcon,
      rightIcon,
      accessibilityLabel,
      textContentType,
      autoCapitalize,
      autoCorrect,
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [inputHeight, setInputHeight] = useState(hp(4)); // Default height
    const handleContentSizeChange = (e: any) => {
      if (multiline) {
        const height = e.nativeEvent.contentSize.height + hp(2); // Adjusted height calculation
        setInputHeight(height);
      }
    };

    return (
      <View style={[outerStyle]}>
        <View
          style={[
            styles.container,
            {
              borderColor: error ? Colors.danger : Colors.gray,
              borderWidth: 1,
              height: multiline ? inputHeight : hp(4),
              alignItems: multiline ? "flex-start" : "center", // Ensures correct vertical alignment
            },
            containerStyle,
          ]}
        >
          <View style={{ position: "absolute", left: wp(6) }}>
            {leftIcon && leftIcon}
          </View>
          <TextInput
            ref={ref}
            onFocus={onFocus}
            onBlur={onBlur}
            selectTextOnFocus={false}
            accessibilityLabel={accessibilityLabel}
            textContentType={textContentType}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            multiline={multiline}
            onContentSizeChange={handleContentSizeChange}
            selectionColor={Colors.primary}
            value={value}
            secureTextEntry={secureTextEntry && !showPassword}
            onChangeText={onChangeText}
            keyboardType={type}
            placeholder={`${placeholder}${required ? "*" : ""}`}
            placeholderTextColor={error ? Colors.danger : Colors.lightGray}
            style={[
              styles.input,
              {
                color: error ? Colors.danger : Colors.black,
                width: secureTextEntry ? "73%" : "95%",
                textAlignVertical: multiline ? "center" : "center", // Ensures text is centered
                paddingVertical: multiline ? hp(1) : 0, // Adds padding to improve alignment
              },
              inputStyle,
            ]}
          />
          {secureTextEntry ? (
            <Entypo
              name={!showPassword ? "eye-with-line" : "eye"}
              size={hp(2.5)}
              color={error ? Colors.danger : Colors.gray}
              style={styles.icon}
              onPress={() => setShowPassword(!showPassword)}
            />
          ) : rightIcon ? (
            <View style={styles.icon}>{rightIcon}</View>
          ) : null}
        </View>
        {error && !noErrorText && (
          <Text
            fontSize={getFontSize(13)}
            color={Colors.danger}
            textCenter
            style={{ marginTop: hp(0.4), alignSelf: "center" }}
          >
            {error}
          </Text>
        )}
      </View>
    );
  }
);

MyInput.displayName = "MyInput"; // Set display name for better debugging
export default MyInput;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    width: "100%",
    flexDirection: "row",
    borderWidth: 1,
    alignSelf: "center",
    borderRadius: 12,
    position: "relative",
  },
  icon: {
    position: "absolute",
    right: wp(6),
  },
  input: {
    fontSize: getFontSize(13),
    textAlign: "center",
    paddingHorizontal: wp(3),
    backgroundColor: "transparent",
    flex: 1,
  },
});

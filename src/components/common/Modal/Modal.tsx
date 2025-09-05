import { StyleSheet, Text, View } from "react-native";
import React from "react";

// Packages
import { default as BaseModal } from "react-native-modal";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BaseToast from "@/common/BaseToast";

// Types
import { IModal } from "@/common/Modal/Modal.types";

const Modal = ({ visible, onClose, title, children }: IModal) => {
  return (
    <BaseModal
      isVisible={visible}
      onBackdropPress={onClose}
      style={{ margin: 0 }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BaseToast />
        <View style={styles.container}>
          {title && (
            <View style={styles.title}>
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>{title}</Text>
            </View>
          )}
          <View style={styles.content}>{children}</View>
        </View>
      </GestureHandlerRootView>
    </BaseModal>
  );
};

export default Modal;

const styles = StyleSheet.create({
  container: {},
  title: {},
  content: {},
});

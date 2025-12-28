import React, { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import Text from "@/components/common/Text";
import { Colors, Sizes } from "@/constants";

type Severity = "mild" | "moderate" | "severe";

type Props = {
  visible: boolean;
  dateLabel: string; // shown above the question, does not change the question text
  onClose: () => void;
  onSubmit: (payload: {
    hadMigraine: boolean;
    severity?: Severity;
  }) => Promise<void> | void;
};

const OutcomeCheckModal: React.FC<Props> = ({
  visible,
  dateLabel,
  onClose,
  onSubmit,
}) => {
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [severity, setSeverity] = useState<Severity | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  const severityOptions = useMemo(
    () =>
      [
        { key: "mild", label: "Mild" },
        { key: "moderate", label: "Moderate" },
        { key: "severe", label: "Severe" },
      ] as const,
    []
  );

  const handlePick = (val: boolean) => {
    setAnswer(val);
    if (!val) setSeverity(undefined);
  };

  const handleSubmit = async () => {
    if (answer === null || saving) return;
    try {
      setSaving(true);
      await onSubmit(
        answer ? { hadMigraine: true, severity } : { hadMigraine: false }
      );
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = answer !== null && !saving;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropPress} onPress={onClose} />

        <View style={styles.card}>
          <Text style={styles.title}>Outcome check</Text>
          <Text style={styles.subtitle}>{dateLabel}</Text>

          {/* Requirement: single question text exactly */}
          <Text style={styles.question}>Did you have a migraine today?</Text>

          <View style={styles.row}>
            <Pressable
              onPress={() => handlePick(true)}
              style={[styles.choice, answer === true && styles.choiceActive]}
            >
              <Text style={styles.choiceText}>Yes</Text>
            </Pressable>

            <Pressable
              onPress={() => handlePick(false)}
              style={[styles.choice, answer === false && styles.choiceActive]}
            >
              <Text style={styles.choiceText}>No</Text>
            </Pressable>
          </View>

          {/* Optional severity chip set appears only if Yes */}
          {answer === true && (
            <View style={styles.chips}>
              {severityOptions.map((opt) => (
                <Pressable
                  key={opt.key}
                  onPress={() => setSeverity(opt.key)}
                  style={[
                    styles.chip,
                    severity === opt.key && styles.chipActive,
                  ]}
                >
                  <Text style={styles.chipText}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.footer}>
            <Pressable onPress={onClose} style={styles.secondaryBtn}>
              <Text style={styles.secondaryText}>Not now</Text>
            </Pressable>

            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              style={[
                styles.primaryBtn,
                !canSubmit && styles.primaryBtnDisabled,
              ]}
            >
              <Text style={styles.primaryText}>
                {saving ? "Saving..." : "Save"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default OutcomeCheckModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Sizes.containerPaddingHorizontal,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  backdropPress: { ...StyleSheet.absoluteFillObject },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
  },
  title: { fontSize: 18, fontWeight: "700" },
  subtitle: { marginTop: 4, opacity: 0.7 },
  question: { marginTop: 16, fontSize: 16, fontWeight: "600" },
  row: { flexDirection: "row", gap: 12, marginTop: 12 },
  choice: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.15)",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  choiceActive: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  choiceText: { fontWeight: "600" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  chip: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.15)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: { borderColor: Colors.primary },
  chipText: { fontWeight: "600" },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  secondaryBtn: { paddingVertical: 10, paddingHorizontal: 12 },
  secondaryText: { opacity: 0.75, fontWeight: "600" },
  primaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryText: { color: "white", fontWeight: "700" },
});

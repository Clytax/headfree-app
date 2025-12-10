// components/Outlook/HistoryModal.tsx
import React, { useMemo } from "react";
import {
  Modal,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

// Components
import Text from "@/components/common/Text";

// Constants
import { Colors, Sizes } from "@/constants";

// Utils
import { hp, wp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

// Hooks
import { usePredictions } from "@/hooks/firebase/usePredictions";

// Types
import type { IUserPrediction, IUserWeeklyHint } from "@/types/user";

export type HistoryFilter = IUserWeeklyHint["filter"];

type Props = {
  visible: boolean;
  onClose: () => void;
  filter?: HistoryFilter | null;
};

/**
 * Toggle for temporary debugging on device logs.
 * Set to true to print parsed dates / reasons for exclusion to console.
 */
const DEBUG_LOG_DATES = false;

/**
 * Parse a variety of date shapes commonly found in predictions:
 * - pred.prediction_date (preferred): "YYYY-MM-DD" or ISO or epoch string
 * - Firestore Timestamp (object with .toDate())
 * - Date instance
 * - epoch number (seconds or ms)
 */
export function dateFromPrediction(
  pred: Partial<IUserPrediction> | any
): Date | null {
  if (!pred) return null;

  // If pred itself is a JSON string, try parse to object
  if (typeof pred === "string") {
    try {
      const maybeObj = JSON.parse(pred);
      if (typeof maybeObj === "object" && maybeObj !== null) {
        pred = maybeObj;
      }
    } catch {
      // not JSON — continue
    }
  }

  // Prefer explicit field names (prediction_date is authoritative)
  // Use optional chaining since pred might be loosely typed
  let d =
    (pred as any)?.prediction_date ??
    (pred as any)?.predictionDate ??
    (pred as any)?.date ??
    (pred as any)?.created_at ??
    (pred as any)?.createdAt ??
    (pred as any)?.timestamp ??
    (pred as any)?.at ??
    null;

  if (!d) return null;

  // Firestore Timestamp-like (object with toDate)
  if (typeof d === "object" && d !== null && typeof d.toDate === "function") {
    try {
      return d.toDate();
    } catch {
      return null;
    }
  }

  // Date instance
  if (d instanceof Date) return d;

  // numeric epoch (seconds or ms)
  if (typeof d === "number") {
    // heuristic: if < 1e10 it's probably seconds
    if (d < 10000000000) return new Date(d * 1000);
    return new Date(d);
  }

  // string handling
  if (typeof d === "string") {
    const ds = d.trim();

    // YYYY-MM-DD => parse as UTC midnight to avoid timezone shift
    if (/^\d{4}-\d{2}-\d{2}$/.test(ds)) {
      const dt = new Date(ds + "T00:00:00Z");
      if (!isNaN(dt.getTime())) return dt;
    }

    // Try ISO / Date constructor
    const iso = new Date(ds);
    if (!isNaN(iso.getTime())) return iso;

    // Last attempt: numeric string
    const numeric = Number(ds);
    if (!Number.isNaN(numeric)) {
      if (numeric < 10000000000) return new Date(numeric * 1000);
      return new Date(numeric);
    }
  }

  return null;
}

export default function HistoryModal({ visible, onClose, filter }: Props) {
  // usePredictions is typed to return IUserPrediction[] in your hook already,
  // but be defensive and tell TS the generic type here if needed.
  const { data: predictions, isLoading } = usePredictions(); // typed from hook

  // Normalize predictions into typed array
  const predsArray = useMemo((): IUserPrediction[] => {
    if (!predictions) return [];
    if (Array.isArray(predictions)) return predictions as IUserPrediction[];
    if (typeof predictions === "object")
      return Object.values(predictions) as IUserPrediction[];
    return [];
  }, [predictions]);

  // Show ALL predictions sorted newest first (defensive parsing)
  const allSorted = useMemo((): IUserPrediction[] => {
    const transformed = predsArray
      .map((p) => {
        const parsed = dateFromPrediction(p);
        if (DEBUG_LOG_DATES) {
          console.warn("[HistoryModal] parsed date", {
            id: (p as any)?.id ?? (p as any)?.docId ?? "<no-id>",
            raw: (p as any)?.prediction_date ?? (p as any)?.date ?? null,
            parsed: parsed ? parsed.toISOString() : null,
          });
        }
        return { raw: p, date: parsed };
      })
      .sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return b.date.getTime() - a.date.getTime();
      })
      .map((x) => x.raw);

    return transformed;
  }, [predsArray]);

  const filtered = useMemo(() => {
    if (!filter) return allSorted;

    const { type, operator, value } = filter;

    if (operator !== "==") {
      // For now, prototype only supports equality
      return allSorted;
    }

    switch (type) {
      case "risk_level":
        return allSorted.filter(
          (p) =>
            String((p as any)?.risk_level ?? "").toLowerCase() ===
            String(value).toLowerCase()
        );

      case "top_risk_feature":
        return allSorted.filter((p) => {
          const factors = (p as any)?.top_risk_factors;
          if (!Array.isArray(factors)) return false;
          return factors.some(
            (f: any) =>
              typeof f?.feature === "string" &&
              f.feature.toLowerCase() === String(value).toLowerCase()
          );
        });

      // extend with whatever you need later, e.g. "caffeine_day", etc.
      default:
        return allSorted;
    }
  }, [allSorted, filter]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text fontWeight="semibold" style={styles.headerTitle}>
              Prediction History
            </Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityLabel="Close history"
            >
              <Text style={styles.close}>Close</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={{ marginTop: 8 }}>Loading predictions</Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text>
                {filter
                  ? "No predictions match this filter"
                  : "No predictions yet"}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              // keyExtractor will use `id` when present, otherwise fallback to index string
              keyExtractor={(item: IUserPrediction, index) =>
                String(
                  (item as any)?.id ??
                    (item as any)?.docId ??
                    (item as any)?.prediction_date ??
                    index
                )
              }
              contentContainerStyle={styles.listContent}
              renderItem={({ item }: { item: IUserPrediction }) => {
                const parsedDate = dateFromPrediction(item);
                const friendly = parsedDate
                  ? parsedDate.toLocaleDateString(undefined, {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "Unknown date";
                const rawDateString =
                  (item as any)?.prediction_date ?? (item as any)?.date ?? "";
                const summary =
                  (item as any)?.summary ??
                  (item as any)?.outlook ??
                  (typeof (item as any)?.prediction_text === "string"
                    ? (item as any).prediction_text
                    : undefined) ??
                  ((item as any)?.migraine_probability != null
                    ? `Score: ${Number(
                        (item as any).migraine_probability
                      ).toFixed(2)}`
                    : "No summary");

                return (
                  <View style={styles.row}>
                    <View style={styles.rowLeft}>
                      <Text style={styles.rowDate}>{friendly}</Text>
                      <Text numberOfLines={2} style={styles.rowSummary}>
                        {summary}
                      </Text>
                      {/* show raw prediction_date for clarity */}
                      {rawDateString ? (
                        <Text style={styles.rawDate} numberOfLines={1}>
                          {rawDateString}
                        </Text>
                      ) : null}
                    </View>

                    <View style={styles.rowRight}>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {String(
                            (item as any)?.risk_level ??
                              (item as any)?.status ??
                              "—"
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.modalBackdrop,
    justifyContent: "flex-end",
  },
  sheet: {
    minHeight: hp(30),
    maxHeight: hp(85),
    backgroundColor: Colors.backgroundLighter,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: Sizes.containerPaddingHorizontal,
    paddingTop: hp(2),
    paddingBottom: hp(3),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1),
  },
  headerTitle: {
    fontSize: getFontSize(18),
    color: Colors.text,
  },
  close: {
    fontSize: getFontSize(14),
    color: Colors.primary,
  },
  loading: {
    alignItems: "center",
    padding: hp(4),
  },
  empty: {
    alignItems: "center",
    padding: hp(4),
  },
  listContent: {
    paddingBottom: hp(6),
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: hp(1.2),
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    maxHeight: hp(12),
  },
  rowLeft: {
    flex: 1,
    paddingRight: wp(3),
  },
  rowDate: {
    color: Colors.text,
    fontSize: getFontSize(13),
    marginBottom: hp(0.3),
  },
  rowSummary: {
    color: Colors.text,
    fontSize: getFontSize(12),
    opacity: 0.95,
  },
  rawDate: {
    marginTop: hp(0.4),
    color: Colors.gray,
    fontSize: getFontSize(11),
  },
  rowRight: {
    marginLeft: wp(2),
    height: "100%",
    justifyContent: "center",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 68,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
  },
  badgeText: {
    color: Colors.white,
    fontSize: getFontSize(11),
    fontWeight: "600",
  },
});

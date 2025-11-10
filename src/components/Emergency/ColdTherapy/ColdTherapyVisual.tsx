// ColdTherapyVisual.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MyTouchableOpacity from "@/components/common/Buttons/MyTouchableOpacity";
import Text from "@/components/common/Text";
import Colors from "@/constants/colors";
import { wp, hp } from "@/utils/ui/sizes";
import { getFontSize } from "@/utils/text/fonts";

// Types
import { ColdTherapyVisualProps } from "@/components/Emergency/Emergency.types";

type Spot = "Forehead" | "Temples" | "Back of neck";

const SPOTS: Spot[] = ["Forehead", "Temples", "Back of neck"];

const ColdTherapyVisual: React.FC<ColdTherapyVisualProps> = ({
  defaultMinutes = 10,
  onComplete,
}) => {
  const [activeSpot, setActiveSpot] = useState<Spot>("Forehead");
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(defaultMinutes * 60);

  // keep minutes selector in sync if you change default
  useEffect(() => {
    setSecondsLeft(defaultMinutes * 60);
  }, [defaultMinutes]);

  // tick
  const intervalRef = useRef<NodeJS.Timer | null>(null);
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current as NodeJS.Timer);
          onComplete?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, onComplete]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const total = defaultMinutes * 60;
  const progress = useMemo(() => {
    return total === 0 ? 0 : (total - secondsLeft) / total;
  }, [secondsLeft, total]);

  const reset = (mins: number) => {
    setRunning(false);
    setSecondsLeft(mins * 60);
  };

  // pulse animation for active area
  const [pulseAnim] = useState(new Animated.Value(1));
  useEffect(() => {
    if (running) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [running, pulseAnim]);

  const renderBodyDiagram = () => (
    <View style={styles.diagram}>
      <Text fontSize={getFontSize(12)} color={Colors.gray}>
        Apply cold pack to highlighted area
      </Text>

      <View style={styles.bodyContainer}>
        {/* Head representation */}
        <View style={styles.head}>
          {/* Forehead area */}
          <View
            style={[
              styles.bodyPart,
              styles.foreheadArea,
              activeSpot === "Forehead" && styles.activeArea,
            ]}
          >
            {activeSpot === "Forehead" && (
              <Animated.View
                style={[
                  styles.coldPackIndicator,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Ionicons
                  name="snow"
                  size={getFontSize(10)}
                  color={Colors.white}
                />
              </Animated.View>
            )}
          </View>

          {/* Left temple */}
          <View
            style={[
              styles.bodyPart,
              styles.leftTempleArea,
              activeSpot === "Temples" && styles.activeArea,
            ]}
          >
            {activeSpot === "Temples" && (
              <Animated.View
                style={[
                  styles.coldPackIndicator,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Ionicons
                  name="snow"
                  size={getFontSize(10)}
                  color={Colors.white}
                />
              </Animated.View>
            )}
          </View>

          {/* Right temple */}
          <View
            style={[
              styles.bodyPart,
              styles.rightTempleArea,
              activeSpot === "Temples" && styles.activeArea,
            ]}
          >
            {activeSpot === "Temples" && (
              <Animated.View
                style={[
                  styles.coldPackIndicator,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Ionicons
                  name="snow"
                  size={getFontSize(10)}
                  color={Colors.white}
                />
              </Animated.View>
            )}
          </View>

          {/* Simple facial features for context */}
          <View style={styles.leftEye} />
          <View style={styles.rightEye} />
          <View style={styles.nose} />
        </View>

        {/* Neck */}
        <View style={styles.neck}>
          {/* Back of neck area */}
          <View
            style={[
              styles.bodyPart,
              styles.neckArea,
              activeSpot === "Back of neck" && styles.activeArea,
            ]}
          >
            {activeSpot === "Back of neck" && (
              <Animated.View
                style={[
                  styles.coldPackIndicator,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Ionicons
                  name="snow"
                  size={getFontSize(12)}
                  color={Colors.white}
                />
              </Animated.View>
            )}
          </View>
        </View>
      </View>

      <Text fontSize={getFontSize(11)} color={Colors.gray} textCenter>
        {activeSpot === "Temples"
          ? "Apply to both temples"
          : `Target: ${activeSpot}`}
      </Text>
      <Text fontSize={getFontSize(10)} color={Colors.gray} textCenter>
        Always wrap cold pack in cloth
      </Text>
    </View>
  );

  return (
    <View>
      {/* Spots */}
      <View style={styles.spotsRow}>
        {SPOTS.map((s) => {
          const selected = s === activeSpot;
          return (
            <MyTouchableOpacity
              key={s}
              style={[styles.spotChip, selected && styles.spotChipSelected]}
              onPress={() => setActiveSpot(s)}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Select spot ${s}`}
              accessibilityHint={`Selects the ${s} spot`}
              accessibilityState={{ selected: !!selected }}
              hitSlop={8}
            >
              <View
                style={styles.spotIcon}
                accessibilityElementsHidden={true}
                importantForAccessibility="no-hide-descendants"
              >
                <Ionicons
                  name={s === "Back of neck" ? "snow-outline" : "snow"}
                  size={getFontSize(16)}
                  color={selected ? Colors.white : Colors.primary}
                />
              </View>

              <Text
                fontSize={getFontSize(12)}
                color={selected ? Colors.white : Colors.text}
              >
                {s}
              </Text>
            </MyTouchableOpacity>
          );
        })}
      </View>

      {/* Replaced diagram with animated body representation */}
      {renderBodyDiagram()}

      {/* Timer controls */}
      <View style={styles.timerCard}>
        <View style={styles.timerHeader}>
          <Text
            fontSize={getFontSize(14)}
            fontWeight="medium"
            color={Colors.text}
          >
            Cold session
          </Text>
          <View style={styles.pills}>
            {[15].map((m) => (
              <MyTouchableOpacity
                key={m}
                style={[
                  styles.pill,
                  secondsLeft === m * 60 && !running && styles.pillActive,
                ]}
                onPress={() => reset(m)}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`Set timer to ${m} minutes`}
                accessibilityHint={`Sets the timer to ${m} minutes`}
                accessibilityState={{
                  selected: secondsLeft === m * 60 && !running,
                  disabled: !!running,
                }}
                hitSlop={8}
              >
                <Text
                  fontSize={getFontSize(12)}
                  color={
                    secondsLeft === m * 60 && !running
                      ? Colors.textDark
                      : Colors.text
                  }
                >
                  {m} min
                </Text>
              </MyTouchableOpacity>
            ))}
          </View>
        </View>

        {/* big time */}
        <Text
          fontSize={getFontSize(28)}
          fontWeight="bold"
          color={Colors.text}
          textCenter
        >
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </Text>

        {/* progress bar */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(progress * 100, 100)}%` },
            ]}
          />
        </View>

        {/* buttons */}
        <View style={styles.controlsRow}>
          {running ? (
            <MyTouchableOpacity
              style={[styles.controlBtn, styles.secondaryBtn]}
              onPress={() => setRunning(false)}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Pause cold timer"
              accessibilityHint="Pauses the current cold timer"
              accessibilityState={{ disabled: !running }}
              hitSlop={8}
            >
              <Ionicons
                name="pause"
                size={getFontSize(16)}
                color={Colors.text}
              />
              <Text fontSize={getFontSize(14)} color={Colors.text}>
                Pause
              </Text>
            </MyTouchableOpacity>
          ) : (
            <MyTouchableOpacity
              style={[styles.controlBtn, styles.primaryBtn]}
              onPress={() => setRunning(true)}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Start cold timer"
              accessibilityHint="Starts the cold timer"
              accessibilityState={{ disabled: !!running }}
              hitSlop={8}
            >
              <Ionicons
                name="play"
                size={getFontSize(16)}
                color={Colors.textDark}
              />
              <Text fontSize={getFontSize(14)} color={Colors.textDark}>
                Start
              </Text>
            </MyTouchableOpacity>
          )}

          <MyTouchableOpacity
            style={[styles.controlBtn, styles.ghostBtn]}
            onPress={() => reset(defaultMinutes)}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Reset cold timer"
            accessibilityHint="Resets the cold timer to the default duration"
            accessibilityState={{ disabled: !!running }}
            hitSlop={8}
          >
            <Ionicons
              name="refresh"
              size={getFontSize(16)}
              color={Colors.text}
            />
            <Text fontSize={getFontSize(14)} color={Colors.text}>
              Reset
            </Text>
          </MyTouchableOpacity>
        </View>

        {/* safety tips */}
        <View style={styles.tips}>
          <Ionicons
            name="information-circle-outline"
            size={getFontSize(14)}
            color={Colors.gray}
          />
          <Text fontSize={getFontSize(12)} color={Colors.gray}>
            Limit to ten to fifteen minutes per spot. Use a cloth. Stop if skin
            hurts or goes numb.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ColdTherapyVisual;

const styles = StyleSheet.create({
  spotsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp(2),
    marginBottom: hp(1.5),
  },
  spotChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(1.5),
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3),
    borderRadius: wp(4),
  },
  spotChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  spotIcon: {
    width: wp(6),
    alignItems: "center",
  },
  diagram: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: wp(2),
    padding: wp(3),
    alignItems: "center",
    marginBottom: hp(1.5),
  },
  // Animated body diagram styles
  bodyContainer: {
    alignItems: "center",
    marginVertical: hp(2),
  },
  head: {
    width: wp(22),
    height: wp(22),
    backgroundColor: Colors.backgroundLighter,
    borderRadius: wp(11),
    borderWidth: 2,
    borderColor: Colors.border,
    position: "relative",
    marginBottom: hp(1),
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  neck: {
    width: wp(10),
    height: wp(8),
    backgroundColor: Colors.backgroundLighter,
    borderRadius: wp(2),
    borderWidth: 2,
    borderColor: Colors.border,
    position: "relative",
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  bodyPart: {
    position: "absolute",
    borderRadius: wp(3),
    borderWidth: 1,
    borderColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  activeArea: {
    backgroundColor: Colors.primary + "AA",
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  foreheadArea: {
    width: wp(16),
    height: wp(4),
    top: wp(2),
    left: wp(3),
    borderRadius: wp(3),
  },
  leftTempleArea: {
    width: wp(5),
    height: wp(5),
    top: wp(3),
    left: wp(2),
    borderRadius: wp(2.5),
  },
  rightTempleArea: {
    width: wp(5),
    height: wp(5),
    top: wp(3),
    right: wp(1),
    borderRadius: wp(2.5),
  },
  neckArea: {
    width: wp(14),
    height: wp(4),
    top: wp(2),
    left: -wp(2),
    borderRadius: wp(2),
    opacity: 0.5,
  },
  coldPackIndicator: {
    backgroundColor: Colors.primary,
    borderRadius: wp(2),
    padding: wp(1),
  },
  leftEye: {
    position: "absolute",
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    backgroundColor: Colors.text + "66",
    top: wp(8),
    left: wp(6),
  },
  rightEye: {
    position: "absolute",
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    backgroundColor: Colors.text + "66",
    top: wp(8),
    right: wp(6),
  },
  nose: {
    position: "absolute",
    width: wp(1),
    height: wp(3),
    borderRadius: wp(0.5),
    backgroundColor: Colors.text + "44",
    top: wp(11),
    left: wp(10.5),
  },
  // Timer and controls
  timerCard: {
    backgroundColor: Colors.backgroundLighter,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: wp(2),
    padding: wp(3),
  },
  timerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1),
  },
  pills: {
    flexDirection: "row",
    gap: wp(1),
  },
  pill: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: hp(0.6),
    paddingHorizontal: wp(2),
    borderRadius: wp(3),
  },
  pillActive: {
    backgroundColor: Colors.primary500,
    borderColor: Colors.primary,
  },
  progressTrack: {
    height: hp(1),
    backgroundColor: Colors.background,
    borderRadius: wp(1),
    overflow: "hidden",
    marginVertical: hp(1),
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
  },
  controlsRow: {
    flexDirection: "row",
    gap: wp(2),
    marginTop: hp(0.5),
  },
  controlBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(1.5),
    paddingVertical: hp(1.1),
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
  },
  secondaryBtn: {
    backgroundColor: Colors.primary300 + "33",
  },
  ghostBtn: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tips: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(1),
    marginTop: hp(1.2),
  },
});

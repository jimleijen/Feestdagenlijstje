import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";

// Standard 6-face pip layouts on a 3x3 grid (row-major, true = pip present).
const PIP_LAYOUTS: Record<number, boolean[]> = {
  1: [false, false, false, false, true, false, false, false, false],
  2: [true, false, false, false, false, false, false, false, true],
  3: [true, false, false, false, true, false, false, false, true],
  4: [true, false, true, false, false, false, true, false, true],
  5: [true, false, true, false, true, false, true, false, true],
  6: [true, false, true, true, false, true, true, false, true],
};

const SIZE = 128;
const ROLL_DURATION = 820;

export function Dice({ face, rolling }: { face: number | null; rolling: boolean }) {
  const spinX = useRef(new Animated.Value(0)).current;
  const spinY = useRef(new Animated.Value(0)).current;
  const heightT = useRef(new Animated.Value(0)).current;
  const idlePulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (rolling) {
      spinX.setValue(0);
      spinY.setValue(0);
      heightT.setValue(0);
      // Two axes at different durations so it tumbles rather than spinning flat on one plane.
      Animated.timing(spinX, { toValue: 1, duration: ROLL_DURATION, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
      Animated.timing(spinY, {
        toValue: 1,
        duration: ROLL_DURATION + 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      // One linear driver, shaped into a toss-up / fall / bounce / settle arc entirely via
      // interpolation keyframes below — simpler and safer than chaining several Animated
      // sequences on the same value.
      Animated.timing(heightT, { toValue: 1, duration: ROLL_DURATION, easing: Easing.linear, useNativeDriver: true }).start();
    }
  }, [rolling, spinX, spinY, heightT]);

  useEffect(() => {
    if (rolling || face) return;
    // Gentle breathing pulse while idle (no roll yet) to invite a tap.
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(idlePulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(idlePulse, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [rolling, face, idlePulse]);

  const rotateX = spinX.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "1160deg"] });
  const rotateY = spinY.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "940deg"] });
  // Toss up, fall, small bounce, settle — all keyframed off one 0..1 driver.
  const liftY = heightT.interpolate({
    inputRange: [0, 0.27, 0.62, 0.72, 0.85, 1],
    outputRange: [0, -78, 0, -16, 0, 0],
  });
  const squashX = heightT.interpolate({
    inputRange: [0, 0.27, 0.6, 0.65, 0.72, 0.85, 0.92, 1],
    outputRange: [1, 1, 1, 1.14, 0.96, 1.06, 0.98, 1],
  });
  const squashY = heightT.interpolate({
    inputRange: [0, 0.27, 0.6, 0.65, 0.72, 0.85, 0.92, 1],
    outputRange: [1, 1, 1, 0.84, 1.04, 0.94, 1.02, 1],
  });
  const shadowScale = liftY.interpolate({ inputRange: [-78, 0], outputRange: [0.55, 1], extrapolate: "clamp" });
  const shadowOpacity = liftY.interpolate({ inputRange: [-78, 0], outputRange: [0.12, 0.32], extrapolate: "clamp" });

  const idleScale = idlePulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });
  const layout = PIP_LAYOUTS[face ?? 1];

  return (
    <View style={styles.pedestal}>
      <Animated.View
        style={[
          styles.diceShadow,
          {
            transform: rolling
              ? [
                  { perspective: 900 },
                  { translateY: liftY },
                  { rotateX },
                  { rotateY },
                  { scaleX: squashX },
                  { scaleY: squashY },
                ]
              : [
                  { perspective: 900 },
                  { rotateX: "-8deg" },
                  { rotateY: "14deg" },
                  { scale: face ? 1 : idleScale },
                ],
          },
        ]}
      >
        <LinearGradient colors={["#7A4A2E", "#3E2113"]} start={{ x: 0.15, y: 0.05 }} end={{ x: 0.9, y: 1 }} style={styles.face}>
          <View style={styles.gloss} />
          <View style={styles.grid}>
            {layout.map((on, i) => (
              <View key={i} style={styles.cell}>
                {on ? (
                  <View style={styles.pip}>
                    <View style={styles.pipHighlight} />
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        </LinearGradient>
      </Animated.View>
      <Animated.View style={[styles.shadowEllipse, { transform: [{ scaleX: shadowScale }], opacity: rolling ? shadowOpacity : 0.28 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  pedestal: { alignItems: "center", justifyContent: "center" },
  diceShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 14,
  },
  face: {
    width: SIZE,
    height: SIZE,
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: colors.gold,
    overflow: "hidden",
    padding: 14,
  },
  gloss: {
    position: "absolute",
    top: -SIZE * 0.3,
    left: -SIZE * 0.2,
    width: SIZE * 0.9,
    height: SIZE * 0.9,
    borderRadius: SIZE,
    backgroundColor: "#FFFFFF",
    opacity: 0.16,
  },
  grid: { flex: 1, flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "33.33%", height: "33.33%", alignItems: "center", justifyContent: "center" },
  pip: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.goldLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  pipHighlight: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.6)",
    marginBottom: 6,
    marginLeft: -4,
  },
  shadowEllipse: {
    width: SIZE * 0.7,
    height: 16,
    borderRadius: 999,
    backgroundColor: "#000",
    marginTop: 10,
  },
});

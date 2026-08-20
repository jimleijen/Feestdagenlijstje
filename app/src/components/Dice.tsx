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

export function Dice({ face, rolling }: { face: number | null; rolling: boolean }) {
  const spin = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const idlePulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (rolling) {
      spin.setValue(0);
      Animated.timing(spin, {
        toValue: 1,
        duration: 760,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.18, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.92, duration: 140, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [rolling, spin, scale]);

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

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "1080deg"] });
  const idleScale = idlePulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });
  const layout = PIP_LAYOUTS[face ?? 1];

  return (
    <View style={styles.pedestal}>
      <Animated.View
        style={[
          styles.diceShadow,
          { transform: [{ scale: rolling ? scale : face ? 1 : idleScale }, { rotate: rolling ? rotate : "0deg" }] },
        ]}
      >
        <LinearGradient
          colors={["#FFFDF6", "#F1E4C4"]}
          start={{ x: 0.15, y: 0.1 }}
          end={{ x: 0.9, y: 1 }}
          style={styles.face}
        >
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
      <View style={styles.shadowEllipse} />
    </View>
  );
}

const styles = StyleSheet.create({
  pedestal: { alignItems: "center", justifyContent: "center" },
  diceShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 14,
  },
  face: {
    width: SIZE,
    height: SIZE,
    borderRadius: 26,
    borderWidth: 2,
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
    opacity: 0.35,
  },
  grid: { flex: 1, flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "33.33%", height: "33.33%", alignItems: "center", justifyContent: "center" },
  pip: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#3A2418",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  pipHighlight: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.35)",
    marginBottom: 6,
    marginLeft: -4,
  },
  shadowEllipse: {
    width: SIZE * 0.7,
    height: 16,
    borderRadius: 999,
    backgroundColor: "#000",
    opacity: 0.25,
    marginTop: 10,
  },
});

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

const FACE = 100;
// The top and right faces are short/narrow slivers sheared with skewX/skewY into
// parallelograms, glued to the edge they share with the front face — this is what makes it
// read as a cube with real volume at rest, unlike a single flat card. They stay in this
// fixed pose at all times; only the front face's own value/animation changes.
//
// skewX never changes a point's Y coordinate (it only shifts X based on Y), and skewY never
// changes X — so the seam axis each face shares with the front face (a horizontal line for
// the top face, a vertical line for the right face) stays exactly put regardless of where
// RN/web actually puts the transform's pivot. That sidesteps transformOrigin, which doesn't
// reliably pivot at an edge in this RN/web setup (rotateX/rotateY + perspective rotate
// around the face's own center no matter what transformOrigin is set to, which left visible
// gaps at the seams no amount of position-nudging could close, since a center-pivot rotation
// also shears the shape into a trapezoid whose near/far edges don't line up the way a true
// edge-hinge would).
const FRONT_TOP = FACE * 0.55;
const FRONT_LEFT = 0;
const LID_HEIGHT = FACE * 0.42;
const SIDE_WIDTH = FACE * 0.42;
const TOP_SKEW = "-24deg";
const SIDE_SKEW = "24deg";
// skewX/skewY keep the seam's own axis exactly in place (see above), but the center-pivot
// also nudges the shape *along* that axis by an amount that isn't worth deriving exactly —
// tuned against the rendered seam until the gap closed. The top face's seam happened to need
// none; the right face's did.
const SIDE_OVERLAP = 30;
const ROLL_DURATION = 820;

function Pips({ face }: { face: number }) {
  const layout = PIP_LAYOUTS[face];
  return (
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
  );
}

export function Dice({ face, rolling }: { face: number | null; rolling: boolean }) {
  const spinX = useRef(new Animated.Value(0)).current;
  const spinY = useRef(new Animated.Value(0)).current;
  const heightT = useRef(new Animated.Value(0)).current;
  const idlePulse = useRef(new Animated.Value(0)).current;
  const sideFacesVisible = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (rolling) {
      spinX.setValue(0);
      spinY.setValue(0);
      heightT.setValue(0);
      Animated.timing(spinX, { toValue: 1, duration: ROLL_DURATION, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
      Animated.timing(spinY, {
        toValue: 1,
        duration: ROLL_DURATION + 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      Animated.timing(heightT, { toValue: 1, duration: ROLL_DURATION, easing: Easing.linear, useNativeDriver: true }).start();
      // The side faces are only glued to the front face in its resting pose — while the
      // front face is tumbling on its own, hide them rather than let them lag behind it.
      Animated.timing(sideFacesVisible, { toValue: 0, duration: 120, useNativeDriver: true }).start();
    } else {
      Animated.timing(sideFacesVisible, { toValue: 1, duration: 220, delay: 80, useNativeDriver: true }).start();
    }
  }, [rolling, spinX, spinY, heightT, sideFacesVisible]);

  useEffect(() => {
    if (rolling || face) return;
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
  const idleScale = idlePulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] });

  const shownFace = face ?? 1;

  return (
    <View style={styles.pedestal}>
      <Animated.View style={{ width: FACE * 1.7, height: FACE * 1.95, transform: [{ scale: rolling || face ? 1 : idleScale }] }}>
        {/* Top face — hinged at its own bottom edge (shared with the front face's top
            edge), folded back so it reads as the lid of the cube, lit brightest. */}
        <Animated.View
          testID="dice-top"
          style={[
            styles.sideFace,
            {
              top: FRONT_TOP - LID_HEIGHT,
              left: FRONT_LEFT,
              width: FACE,
              height: LID_HEIGHT,
              opacity: sideFacesVisible,
              transform: [{ skewX: TOP_SKEW }],
            },
          ]}
        >
          <LinearGradient colors={["#EDE1FF", "#C9AEFF"]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={styles.faceFill} />
        </Animated.View>

        {/* Right face — hinged at its own left edge (shared with the front face's right
            edge), sheared back so it reads as the shadowed side of the cube. */}
        <Animated.View
          testID="dice-right"
          style={[
            styles.sideFace,
            {
              top: FRONT_TOP,
              left: FRONT_LEFT + FACE - SIDE_OVERLAP,
              width: SIDE_WIDTH,
              height: FACE,
              opacity: sideFacesVisible,
              transform: [{ skewY: SIDE_SKEW }],
            },
          ]}
        >
          <LinearGradient colors={["#B79CFF", "#7C4FE0"]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.faceFill} />
        </Animated.View>

        {/* Front face — the value that actually counts. Tumbles on its own while rolling;
            sits flush in the cube's resting pose otherwise. */}
        <Animated.View
          testID="dice-front"
          style={[
            styles.face,
            styles.frontFace,
            {
              top: FRONT_TOP,
              left: FRONT_LEFT,
              transform: rolling
                ? [
                    { perspective: 900 },
                    { translateY: liftY },
                    { rotateX },
                    { rotateY },
                    { scaleX: squashX },
                    { scaleY: squashY },
                  ]
                : [],
            },
          ]}
        >
          <LinearGradient colors={["#FFFFFF", "#F5EFFF"]} start={{ x: 0.15, y: 0.05 }} end={{ x: 0.9, y: 1 }} style={styles.faceFill}>
            <View style={styles.gloss} />
            <View style={styles.faceInner}>
              <Pips face={shownFace} />
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
      <Animated.View style={[styles.shadowEllipse, { transform: [{ scaleX: shadowScale }], opacity: rolling ? shadowOpacity : 0.28 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  pedestal: { alignItems: "center", justifyContent: "center" },
  face: {
    position: "absolute",
    width: FACE,
    height: FACE,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  // No border radius here: these are thin slivers glued flush to the front face's edges, and
  // rounding their corners would notch tiny gaps back into that seam.
  sideFace: { position: "absolute", overflow: "hidden" },
  frontFace: {
    borderWidth: 2.5,
    borderColor: colors.accent,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 14,
  },
  faceFill: { flex: 1 },
  faceInner: { flex: 1, padding: 13 },
  gloss: {
    position: "absolute",
    top: -FACE * 0.3,
    left: -FACE * 0.2,
    width: FACE * 0.9,
    height: FACE * 0.9,
    borderRadius: FACE,
    backgroundColor: "#FFFFFF",
    opacity: 0.14,
  },
  grid: { flex: 1, flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "33.33%", height: "33.33%", alignItems: "center", justifyContent: "center" },
  pip: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.accent,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  pipHighlight: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.6)",
    marginBottom: 5,
    marginLeft: -3,
  },
  shadowEllipse: {
    width: FACE * 1.1,
    height: 18,
    borderRadius: 999,
    backgroundColor: "#000",
    marginTop: 4,
  },
});

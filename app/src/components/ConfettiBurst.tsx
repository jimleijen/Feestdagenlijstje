import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";

const CONFETTI_COLORS = [colors.confettiPurple, colors.confettiYellow, colors.confettiMint, colors.confettiCoral];
const CONFETTI_COUNT = 16;

// A burst of small colored pieces flying outward from the center, used anywhere a moment
// deserves celebrating — the gift reveal, the round timer running out. Shared so every
// "party moment" in the app looks like the same confetti, not a one-off effect per screen.
export function ConfettiBurst({ playing }: { playing: boolean }) {
  // Generated once — each piece gets a random angle/distance/rotation so the burst reads as
  // messy confetti rather than a uniform ring.
  const pieces = useRef(
    Array.from({ length: CONFETTI_COUNT }, (_, i) => {
      const angle = (Math.PI * 2 * i) / CONFETTI_COUNT + Math.random() * 0.5;
      const distance = 90 + Math.random() * 70;
      return {
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
        rotate: Math.random() > 0.5 ? "540deg" : "-540deg",
      };
    })
  ).current;
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (playing) {
      t.setValue(0);
      Animated.timing(t, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    }
  }, [playing, t]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((p, i) => {
        const translateX = t.interpolate({ inputRange: [0, 1], outputRange: [0, p.dx] });
        const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, p.dy] });
        const opacity = t.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 1, 1, 0] });
        const rotate = t.interpolate({ inputRange: [0, 1], outputRange: ["0deg", p.rotate] });
        return (
          <Animated.View
            key={i}
            style={[
              styles.piece,
              {
                backgroundColor: p.color,
                opacity,
                transform: [{ translateX }, { translateY }, { rotate }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: { position: "absolute", top: "42%", left: "48%", width: 10, height: 10, borderRadius: 3 },
});

import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";

// The ambient backdrop behind every screen: a soft cream-to-pastel gradient plus a few
// low-opacity confetti-colored blobs — cheap to render (no blur library, no image asset)
// but reads as a warm, party-agnostic glow instead of the stark flat white it replaces.
export function FestiveBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[colors.backgroundGlowTop, colors.background, colors.backgroundGlowBottom]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.glow, { width: 240, height: 240, top: -70, right: -60, backgroundColor: colors.confettiPurple, opacity: 0.1 }]} />
      <View style={[styles.glow, { width: 190, height: 190, top: 180, left: -80, backgroundColor: colors.confettiYellow, opacity: 0.14 }]} />
      <View style={[styles.glow, { width: 220, height: 220, bottom: 60, left: -60, backgroundColor: colors.confettiMint, opacity: 0.12 }]} />
      <View style={[styles.glow, { width: 260, height: 260, bottom: -110, right: -90, backgroundColor: colors.confettiCoral, opacity: 0.12 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  glow: { position: "absolute", borderRadius: 999 },
});

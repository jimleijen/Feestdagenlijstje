import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";

// The ambient backdrop behind every screen: a dark green-to-maroon gradient plus a few very
// low-opacity gold "glow" circles standing in for the bokeh-lights texture in the reference
// design — cheap to render (no blur library, no image asset) but reads as warm ambient glow
// rather than flat black as long as the opacity stays low and the circles bleed off-edge.
export function FestiveBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[colors.backgroundGlowTop, colors.background, colors.backgroundGlowBottom]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.glow, { width: 260, height: 260, top: -80, right: -60, backgroundColor: colors.gold, opacity: 0.08 }]} />
      <View style={[styles.glow, { width: 220, height: 220, bottom: 40, left: -70, backgroundColor: colors.gold, opacity: 0.06 }]} />
      <View style={[styles.glow, { width: 300, height: 300, bottom: -120, right: -90, backgroundColor: colors.primary, opacity: 0.14 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  glow: { position: "absolute", borderRadius: 999 },
});

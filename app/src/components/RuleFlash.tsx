import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { colors, radius, shadow, spacing } from "../theme/colors";
import { fonts } from "../theme/fonts";

// A rough keyword guess at which icon best represents the rule, so a rule reads instantly
// even before anyone finishes reading the sentence — "voorkomt discussie aan tafel".
function iconFor(text: string): keyof typeof Ionicons.glyphMap {
  const t = text.toLowerCase();
  if (t.includes("links")) return "arrow-back-circle";
  if (t.includes("rechts")) return "arrow-forward-circle";
  if (t.includes("wissel") || t.includes("ruil") || t.includes("swap")) return "swap-horizontal";
  if (t.includes("iedereen") || t.includes("allemaal")) return "people";
  if (t.includes("stop") || t.includes("veilig") || t.includes("wacht") || t.includes("sla over")) return "lock-closed";
  if (t.includes("extra") || t.includes("nog een")) return "add-circle";
  return "gift";
}

// The big on-screen flash after a roll — replaces a small text line with a large, hard-to-
// miss badge + icon + rule, on the theory that nobody at the table should have to squint or
// ask "wat stond er?" after a dice game roll.
export function RuleFlash({ rollId, face, text }: { rollId: number; face: number; text: string }) {
  const scale = useRef(new Animated.Value(0)).current;
  const bump = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    scale.setValue(0);
    bump.setValue(0);
    Animated.sequence([
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(bump, { toValue: 1, duration: 90, useNativeDriver: true }),
        Animated.timing(bump, { toValue: 0, duration: 140, useNativeDriver: true }),
      ]),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rollId]);

  const bumpScale = bump.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });

  return (
    <Animated.View style={[styles.banner, shadow.card, { transform: [{ scale }, { scale: bumpScale }] }]}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{face}</Text>
      </View>
      <Ionicons name={iconFor(text)} size={30} color={colors.accent} style={{ marginHorizontal: spacing.sm }} />
      <Text style={styles.ruleText}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.tintPurple,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
    width: "100%",
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontFamily: fonts.displayBold, color: "#FFFFFF", fontSize: 20 },
  ruleText: { flex: 1, fontFamily: fonts.bodyBold, color: colors.text, fontSize: 17, flexShrink: 1 },
});

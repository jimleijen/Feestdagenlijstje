import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

// Numbered-circles-connected-by-lines wizard progress, e.g. "1 — 2 — 3 — ✓". `current` is
// 1-indexed; a value greater than `steps` (i.e. finished) shows every circle as done.
export function StepIndicator({ steps, current }: { steps: number; current: number }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: steps }, (_, i) => i + 1).map((step) => {
        const done = step < current;
        const active = step === current;
        return (
          <React.Fragment key={step}>
            <View style={[styles.circle, (done || active) && styles.circleActive]}>
              {done ? (
                <Ionicons name="checkmark" size={16} color={colors.header} />
              ) : (
                <Text style={[styles.circleText, active && styles.circleTextActive]}>{step}</Text>
              )}
            </View>
            {step < steps ? <View style={[styles.line, done && styles.lineActive]} /> : null}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  circleActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  circleText: { color: colors.textMuted, fontWeight: "700", fontSize: 13 },
  circleTextActive: { color: colors.header },
  line: { flex: 1, height: 2, backgroundColor: colors.border, marginHorizontal: 4 },
  lineActive: { backgroundColor: colors.gold },
});

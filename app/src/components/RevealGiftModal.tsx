import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Modal, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { ConfettiBurst } from "./ConfettiBurst";
import { Button } from "./ui";

// The "unboxing" reveal used by both Lootjes trekken and Secret Santa: instead of a plain
// text line, the drawn name is hidden behind a gift box the player swipes up (or taps) to
// unwrap, with a confetti burst on reveal — meant to feel like an actual gift, not a
// notification.
export function RevealGiftModal({
  visible,
  loading,
  name,
  emoji = "🎁",
  onClose,
}: {
  visible: boolean;
  loading: boolean;
  name: string | null;
  emoji?: string;
  onClose: () => void;
}) {
  const [opened, setOpened] = useState(false);
  const boxScale = useRef(new Animated.Value(1)).current;
  const boxOpacity = useRef(new Animated.Value(1)).current;
  const boxRotate = useRef(new Animated.Value(0)).current;
  const nameScale = useRef(new Animated.Value(0)).current;
  const wiggle = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      setOpened(false);
      boxScale.setValue(1);
      boxOpacity.setValue(1);
      boxRotate.setValue(0);
      nameScale.setValue(0);
      dragY.setValue(0);
    }
  }, [visible, boxScale, boxOpacity, boxRotate, nameScale, dragY]);

  useEffect(() => {
    if (!visible || loading || opened) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(wiggle, { toValue: 1, duration: 380, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(wiggle, { toValue: -1, duration: 380, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(wiggle, { toValue: 0, duration: 380, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.delay(600),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [visible, loading, opened, wiggle]);

  function handleOpen() {
    if (opened || loading || !name) return;
    setOpened(true);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(boxScale, { toValue: 1.25, duration: 160, useNativeDriver: true }),
        Animated.timing(boxRotate, { toValue: 1, duration: 160, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(boxScale, { toValue: 0, duration: 260, easing: Easing.in(Easing.back(1.5)), useNativeDriver: true }),
        Animated.timing(boxOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]),
    ]).start();
    Animated.spring(nameScale, { toValue: 1, delay: 260, friction: 5, tension: 60, useNativeDriver: true }).start();
  }

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => !opened && Math.abs(g.dy) > 6,
      onPanResponderMove: (_, g) => {
        if (g.dy < 0) dragY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy < -40) {
          handleOpen();
        } else {
          Animated.spring(dragY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const rotateDeg = boxRotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "18deg"] });
  const wiggleDeg = wiggle.interpolate({ inputRange: [-1, 1], outputRange: ["-6deg", "6deg"] });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.stage}>
          <ConfettiBurst playing={opened} />

          {!opened ? (
            <Animated.View
              {...panResponder.panHandlers}
              style={{
                transform: [
                  { translateY: dragY },
                  { scale: boxScale },
                  { rotate: loading ? "0deg" : rotateDeg },
                  { rotate: wiggleDeg },
                ],
                opacity: boxOpacity,
              }}
            >
              {/* Swipe-up is handled by the PanResponder above (only claims the gesture past a
                  drag threshold); this nested Pressable is the tap fallback — and, on web,
                  the only one a plain click actually reaches. */}
              <Pressable onPress={handleOpen} testID="gift-box">
                <Text style={styles.boxEmoji}>{emoji}</Text>
              </Pressable>
            </Animated.View>
          ) : null}

          <Animated.View style={{ transform: [{ scale: nameScale }], alignItems: "center" }}>
            {opened ? (
              <>
                <Text style={styles.revealEmoji}>🎉</Text>
                <Text style={styles.revealLabel}>Jij hebt:</Text>
                <Text style={styles.revealName}>{name}</Text>
              </>
            ) : null}
          </Animated.View>

          {!opened ? (
            <Text style={styles.hint}>
              {loading ? "Bezig met inpakken…" : "Swipe omhoog of tik op het cadeau om uit te pakken"}
            </Text>
          ) : null}

          <View style={{ marginTop: spacing.xl, width: "100%" }}>
            <Button title="Sluiten" variant="ghost" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(43, 36, 64, 0.55)", alignItems: "center", justifyContent: "center", padding: spacing.lg },
  stage: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 320,
  },
  boxEmoji: { fontSize: 96 },
  hint: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 13, marginTop: spacing.lg, textAlign: "center" },
  revealEmoji: { fontSize: 48, marginBottom: spacing.xs },
  revealLabel: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 15 },
  revealName: { fontFamily: fonts.displayBold, color: colors.accent, fontSize: 30, textAlign: "center", marginTop: spacing.xs },
});

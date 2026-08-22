import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { ConfettiBurst } from "./ConfettiBurst";
import { Button, Card, Muted, SubHeading } from "./ui";

const MIN_SECONDS = 20;
const MAX_SECONDS = 75;
// Tension ramps up for the final stretch of the countdown, not just at the very last second.
const TENSION_FRACTION = 0.7;

type TimerState = "idle" | "running" | "popped";

// "Ronde 2" of the classic dice game: an unpredictable countdown everyone can see growing,
// like a balloon about to pop — nobody knows exactly when, which is the point. Standalone so
// it can sit on the dice session screen without touching the roll logic itself.
export function RoundTimer() {
  const [state, setState] = useState<TimerState>("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const growth = useRef(new Animated.Value(0)).current;
  const wiggle = useRef(new Animated.Value(0)).current;
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tensionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wiggleLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  function clearTimers() {
    if (tickRef.current) clearInterval(tickRef.current);
    if (tensionTimeoutRef.current) clearTimeout(tensionTimeoutRef.current);
    wiggleLoopRef.current?.stop();
  }

  useEffect(() => clearTimers, []);

  function start() {
    clearTimers();
    const durationSec = MIN_SECONDS + Math.floor(Math.random() * (MAX_SECONDS - MIN_SECONDS));
    setSecondsLeft(durationSec);
    setState("running");
    growth.setValue(0);
    wiggle.setValue(0);

    tickRef.current = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);

    Animated.timing(growth, {
      toValue: 1,
      duration: durationSec * 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) pop();
    });

    tensionTimeoutRef.current = setTimeout(() => {
      wiggleLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(wiggle, { toValue: 1, duration: 90, useNativeDriver: true }),
          Animated.timing(wiggle, { toValue: -1, duration: 90, useNativeDriver: true }),
        ])
      );
      wiggleLoopRef.current.start();
    }, durationSec * 1000 * TENSION_FRACTION);
  }

  function pop() {
    clearTimers();
    setState("popped");
  }

  function reset() {
    clearTimers();
    growth.setValue(0);
    wiggle.setValue(0);
    setState("idle");
  }

  const scale = growth.interpolate({ inputRange: [0, 1], outputRange: [1, 2.3] });
  const wiggleDeg = wiggle.interpolate({ inputRange: [-1, 1], outputRange: ["-10deg", "10deg"] });

  return (
    <Card>
      <SubHeading>🎈 Ronde 2: de spannende timer</SubHeading>
      <Muted>Niemand weet wanneer hij knalt — als de ballon knapt, is de ronde voorbij.</Muted>

      {state === "idle" ? <Button title="Start de timer" variant="secondary" onPress={start} /> : null}

      {state === "running" ? (
        <View style={styles.stage}>
          <Animated.View style={{ transform: [{ scale }, { rotate: wiggleDeg }] }}>
            <Text style={styles.balloon}>🎈</Text>
          </Animated.View>
          <Text style={styles.countdown}>{secondsLeft}s…</Text>
          <Button title="Stop" variant="ghost" onPress={reset} />
        </View>
      ) : null}

      {state === "popped" ? (
        <View style={styles.stage}>
          <ConfettiBurst playing />
          <Text style={styles.pop}>💥</Text>
          <Text style={styles.popText}>Tijd is om! 🎉</Text>
          <Button title="Nog een keer" variant="secondary" onPress={reset} />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  stage: { alignItems: "center", marginTop: spacing.sm },
  balloon: { fontSize: 64 },
  countdown: { fontFamily: fonts.displayBold, color: colors.accent, fontSize: 22, marginVertical: spacing.sm },
  pop: { fontSize: 56 },
  popText: { fontFamily: fonts.displayBold, color: colors.accent, fontSize: 22, marginVertical: spacing.sm },
});

import { Accelerometer } from "expo-sensors";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

// Magnitude-delta shake detection: fires onShake at most once per COOLDOWN_MS so one
// shake doesn't trigger several rolls, and ignores the resting ~1g gravity reading.
const SHAKE_THRESHOLD = 1.8;
const COOLDOWN_MS = 1200;

export function useShakeToRoll(onShake: () => void, enabled: boolean) {
  const lastShakeAt = useRef(0);
  const lastMagnitude = useRef(1);

  useEffect(() => {
    // No accelerometer on web, and there's always the "Gooi de dobbelsteen" button as a
    // fallback there and anywhere else the sensor isn't available — never let a missing
    // native module crash the whole screen (it has before: an uncaught error here takes
    // down the entire React tree since there's no error boundary around it).
    if (!enabled || Platform.OS === "web") return;

    try {
      Accelerometer.setUpdateInterval(100);
      const subscription = Accelerometer.addListener(({ x, y, z }) => {
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        const delta = Math.abs(magnitude - lastMagnitude.current);
        lastMagnitude.current = magnitude;

        const now = Date.now();
        if (delta > SHAKE_THRESHOLD && now - lastShakeAt.current > COOLDOWN_MS) {
          lastShakeAt.current = now;
          onShake();
        }
      });

      return () => subscription.remove();
    } catch (err) {
      console.warn("Schudden om te dobbelen is niet beschikbaar, gebruik de knop.", err);
    }
  }, [enabled, onShake]);
}

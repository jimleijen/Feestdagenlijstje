import { Accelerometer } from "expo-sensors";
import { useEffect, useRef } from "react";

// Magnitude-delta shake detection: fires onShake at most once per COOLDOWN_MS so one
// shake doesn't trigger several rolls, and ignores the resting ~1g gravity reading.
const SHAKE_THRESHOLD = 1.8;
const COOLDOWN_MS = 1200;

export function useShakeToRoll(onShake: () => void, enabled: boolean) {
  const lastShakeAt = useRef(0);
  const lastMagnitude = useRef(1);

  useEffect(() => {
    if (!enabled) return;

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
  }, [enabled, onShake]);
}

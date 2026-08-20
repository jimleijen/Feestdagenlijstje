import * as Speech from "expo-speech";

// One shared "leuke stem" for every round announcement — a single place to tune pitch/rate
// so the whole game sounds consistent instead of each screen picking its own settings.
export function announce(text: string) {
  Speech.stop();
  Speech.speak(text, { language: "nl-NL", pitch: 1.05, rate: 0.98 });
}

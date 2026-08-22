// A "party-agnostic" pastel palette — works for a kid's Sinterklaas list, a birthday, Kerst
// or Oud & Nieuw alike, instead of defaulting to Christmas red/green. Warm cream canvas,
// bento-style white cards, and four confetti accents (purple/yellow/mint/coral) carry the
// festivity instead of a single seasonal color.
export const colors = {
  background: "#FFF8EF",
  backgroundGlowTop: "#F3E9FF",
  backgroundGlowBottom: "#FFF0E3",
  surface: "#FFFFFF",
  surfaceAlt: "#F7F1FF",
  header: "#FFFFFF",
  // "accent" is the app's main brand color (was a luxury gold, now confetti-purple).
  accent: "#8B5CF6",
  accentLight: "#B79CFF",
  primary: "#8B5CF6",
  primaryDark: "#6D3FE0",
  secondary: "#2FBE85",
  secondaryDark: "#1F9A6B",
  text: "#2B2440",
  textMuted: "#8C84A0",
  textOnDark: "#FFFFFF",
  border: "rgba(139, 92, 246, 0.16)",
  success: "#2FBE85",
  danger: "#F0553A",
  fieldBackground: "#FFFFFF",
  fieldText: "#2B2440",
  // Confetti accent set — used for badges, seasonal touches, and small decorative bits
  // across the app, not just the tab bar.
  confettiPurple: "#8B5CF6",
  confettiYellow: "#FFC94D",
  confettiMint: "#2FBE85",
  confettiCoral: "#FF7F5C",
  // Pale tints of the same four, for coloring a bento card's fill without losing legibility
  // of the dark text on top.
  tintPurple: "#F1EAFF",
  tintYellow: "#FFF4D9",
  tintMint: "#E1FBF0",
  tintCoral: "#FFE9E0",
};

// One accent per bottom-tab destination — pulled from the confetti palette so the bar reads
// as playful/colorful rather than the flat single-tint template.
export const tabColors = {
  home: colors.confettiYellow,
  wishlist: colors.confettiCoral,
  lootjes: colors.confettiMint,
  secretSanta: colors.confettiPurple,
  spel: "#FF6FA8",
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 44 };

export const radius = { sm: 12, md: 18, lg: 26, pill: 999 };

export const shadow = {
  card: {
    shadowColor: "#3D2E63",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  button: {
    shadowColor: "#3D2E63",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  glow: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
};

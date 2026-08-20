// A dark, premium "gala evening" palette — near-black canvas with a green/maroon glow,
// gold accents and borders, jewel-toned cards instead of flat fills. Replaces the earlier
// cream/light theme: this is now the app's only look, not a togglable dark mode.
export const colors = {
  background: "#0B120C",
  backgroundGlowTop: "#132A1E",
  backgroundGlowBottom: "#210C0C",
  surface: "#15251C",
  surfaceAlt: "#1A2E22",
  header: "#0E1912",
  gold: "#C9A24B",
  goldLight: "#E8CD86",
  primary: "#8C2A26",
  primaryDark: "#551713",
  secondary: "#1F5C42",
  secondaryDark: "#123D2B",
  text: "#F3E9D2",
  textMuted: "#B7A788",
  textOnDark: "#F3E9D2",
  border: "rgba(201, 162, 75, 0.35)",
  success: "#3FA679",
  danger: "#C24545",
  // Inputs stay light-on-dark ("a lit well set into the dark surface") — reads far more
  // legibly than dark-on-dark, and matches how the reference treats data-entry areas.
  fieldBackground: "#F6EEDD",
  fieldText: "#241C1A",
};

// One accent per bottom-tab destination — jewel tones chosen to stay legible against the
// near-black tab bar instead of the muddier hues that worked on the old light background.
export const tabColors = {
  home: "#E0B23D",
  wishlist: "#D2703B",
  lootjes: "#3FA679",
  secretSanta: "#B583D9",
  spel: "#F0C94A",
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 44 };

export const radius = { sm: 10, md: 16, lg: 24, pill: 999 };

export const shadow = {
  card: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  button: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  glow: {
    shadowColor: "#E8CD86",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
  },
};

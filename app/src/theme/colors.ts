// A warm, festive palette — deep forest green + gold for header/premium accents, a rich
// red for primary actions, and parchment/cream surfaces instead of stark white. Each bottom
// tab gets its own accent color rather than one flat active/inactive tint, which is what
// makes the nav bar feel alive instead of a generic template.
export const colors = {
  background: "#FBF3E6",
  surface: "#FFFFFF",
  surfaceAlt: "#FBF1E1", // parchment card fill, used where warmth matters more than contrast
  header: "#1F3D2E",
  headerDark: "#152A20",
  gold: "#C9A24B",
  goldLight: "#E4C77A",
  primary: "#AE2E2A",
  primaryDark: "#872420",
  secondary: "#2F6F5E",
  text: "#241C1A",
  textMuted: "#8A7A73",
  textOnDark: "#F5EFE0",
  border: "#ECDFC8",
  success: "#2F6F5E",
  danger: "#B3261E",
};

// One accent per bottom-tab destination, used for both the icon tint and the active label.
export const tabColors = {
  home: "#AE2E2A",
  wishlist: "#D2542B",
  lootjes: "#2F6F5E",
  secretSanta: "#8C4A9C",
  spel: "#B08A1E",
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const radius = { sm: 10, md: 16, lg: 24, pill: 999 };

export const shadow = {
  card: {
    shadowColor: "#3A2A1A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  button: {
    shadowColor: "#3A2A1A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
};

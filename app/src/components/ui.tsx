import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  TextInputProps,
  View,
  ViewProps,
} from "react-native";
import { colors, radius, shadow, spacing } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { FestiveBackground } from "./FestiveBackground";

export function Screen({ children, style, ...rest }: ViewProps) {
  return (
    <View style={styles.screenRoot}>
      <FestiveBackground />
      <View style={[styles.screen, style]} {...rest}>
        {children}
      </View>
    </View>
  );
}

// Bento-style card: white, generously rounded, shadow-only (no border) so a screen full of
// cards reads as soft floating tiles rather than boxed-in panels.
export function Card({ children, style, ...rest }: ViewProps) {
  return (
    <View style={[styles.card, shadow.card, style]} {...rest}>
      {children}
    </View>
  );
}

export function TextInput({ style, ...rest }: TextInputProps) {
  // Destructure style out before spreading `rest` — spreading the original `props` after
  // this component's own `style` prop let a caller-supplied `style` silently clobber the
  // base input styling (border/background/padding) instead of merging with it.
  return <RNTextInput placeholderTextColor={colors.textMuted} style={[styles.input, style]} {...rest} />;
}

const GRADIENTS: Record<string, [string, string]> = {
  primary: [colors.primary, colors.primaryDark],
  secondary: [colors.secondary, colors.secondaryDark],
  danger: [colors.danger, "#C93A24"],
};

export function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  disabled?: boolean;
}) {
  const isDisabled = disabled || loading;

  if (variant === "ghost") {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.button,
          styles.ghostButton,
          styles.buttonSpacing,
          isDisabled && { opacity: 0.5 },
          pressed && !isDisabled && { opacity: 0.7 },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.accent} />
        ) : (
          <Text style={[styles.buttonText, { color: colors.accent }]}>{title}</Text>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.buttonSpacing,
        shadow.button,
        isDisabled && { opacity: 0.5 },
        pressed && !isDisabled && { opacity: 0.85 },
      ]}
    >
      <LinearGradient colors={GRADIENTS[variant]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.button}>
        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>{title}</Text>}
      </LinearGradient>
    </Pressable>
  );
}

export function Heading({ children }: { children: React.ReactNode }) {
  return <Text style={styles.heading}>{children}</Text>;
}

export function SubHeading({ children }: { children: React.ReactNode }) {
  return <Text style={styles.subHeading}>{children}</Text>;
}

export function Muted({ children }: { children: React.ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

// A fixed vertical gap for the (rare) spots that need more room than a component's own
// built-in margin gives — e.g. before a visually distinct section within the same screen.
export function Spacer({ size = "lg" }: { size?: keyof typeof spacing }) {
  return <View style={{ height: spacing[size] }} />;
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>🎁</Text>
      <Text style={styles.heading}>{title}</Text>
      {subtitle ? <Text style={styles.emptyStateSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, padding: spacing.lg, paddingBottom: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    fontFamily: fonts.body,
    color: colors.fieldText,
    backgroundColor: colors.fieldBackground,
    marginBottom: spacing.md,
  },
  button: {
    borderRadius: radius.pill,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    minWidth: 150,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSpacing: { marginBottom: spacing.md },
  ghostButton: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  buttonText: { fontFamily: fonts.bodyBold, fontSize: 17, letterSpacing: 0.2 },
  heading: { fontFamily: fonts.displayBold, fontSize: 26, color: colors.accent, marginBottom: spacing.sm },
  subHeading: { fontFamily: fonts.display, fontSize: 18, color: colors.text, marginBottom: spacing.sm },
  muted: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 14, marginBottom: spacing.sm },
  emptyState: { alignItems: "center", paddingVertical: spacing.xl },
  emptyStateIcon: { fontSize: 44, marginBottom: spacing.md },
  emptyStateSubtitle: {
    fontFamily: fonts.bodyItalic,
    color: colors.textMuted,
    fontSize: 15,
    textAlign: "center",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
});

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
  danger: [colors.danger, "#7E1B15"],
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
          <ActivityIndicator color={colors.gold} />
        ) : (
          <Text style={[styles.buttonText, { color: colors.gold }]}>{title}</Text>
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
      <LinearGradient colors={GRADIENTS[variant]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={[styles.button, styles.buttonBorder]}>
        {loading ? <ActivityIndicator color={colors.goldLight} /> : <Text style={styles.buttonText}>{title}</Text>}
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
  screen: { flex: 1, padding: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.gold,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md + 4,
    paddingVertical: spacing.sm + 4,
    fontSize: 16,
    color: colors.fieldText,
    backgroundColor: colors.fieldBackground,
    marginBottom: spacing.sm,
  },
  button: {
    borderRadius: radius.pill,
    paddingVertical: spacing.sm + 6,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonBorder: { borderWidth: 1, borderColor: "rgba(232, 205, 134, 0.5)" },
  buttonSpacing: { marginBottom: spacing.sm },
  ghostButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.gold,
  },
  buttonText: { color: colors.goldLight, fontWeight: "700", fontSize: 16, letterSpacing: 0.2 },
  heading: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.gold, marginBottom: spacing.xs },
  subHeading: { fontFamily: fonts.display, fontSize: 18, color: colors.text, marginBottom: spacing.xs },
  muted: { color: colors.textMuted, fontSize: 14 },
  emptyState: { alignItems: "center", paddingVertical: spacing.xl },
  emptyStateIcon: { fontSize: 44, marginBottom: spacing.sm },
  emptyStateSubtitle: {
    fontFamily: fonts.display,
    fontStyle: "italic",
    color: colors.textMuted,
    fontSize: 15,
    textAlign: "center",
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
});

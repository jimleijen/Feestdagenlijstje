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
import { colors, radius, spacing } from "../theme/colors";

export function Screen({ children, style, ...rest }: ViewProps) {
  return (
    <View style={[styles.screen, style]} {...rest}>
      {children}
    </View>
  );
}

export function Card({ children, style, ...rest }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

export function TextInput(props: TextInputProps) {
  return <RNTextInput placeholderTextColor={colors.textMuted} style={[styles.input, props.style]} {...props} />;
}

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
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        variantStyles[variant],
        isDisabled && { opacity: 0.5 },
        pressed && !isDisabled && { opacity: 0.85 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "ghost" ? colors.primary : "#fff"} />
      ) : (
        <Text style={[styles.buttonText, variant === "ghost" && { color: colors.primary }]}>{title}</Text>
      )}
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
      <Text style={styles.heading}>{title}</Text>
      {subtitle ? <Muted>{subtitle}</Muted> : null}
    </View>
  );
}

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.secondary },
  danger: { backgroundColor: colors.danger },
  ghost: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.primary },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  button: {
    borderRadius: radius.sm,
    paddingVertical: spacing.sm + 4,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  heading: { fontSize: 22, fontWeight: "700", color: colors.text, marginBottom: spacing.xs },
  subHeading: { fontSize: 17, fontWeight: "600", color: colors.text, marginBottom: spacing.xs },
  muted: { color: colors.textMuted, fontSize: 14 },
  emptyState: { alignItems: "center", paddingVertical: spacing.xl },
});

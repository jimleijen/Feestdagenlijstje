import { Ionicons } from "@expo/vector-icons";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { Button, Muted, Screen } from "../components/ui";
import { colors, radius, shadow, spacing } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { MainTabParamList } from "../navigation/types";

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

// One big colorful bento tile — the whole dashboard is built from these instead of plain
// list rows, so it reads as a set of activities to tap into rather than a menu.
function BentoTile({
  emoji,
  title,
  subtitle,
  tint,
  accent,
  onPress,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  tint: string;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, shadow.card, { backgroundColor: tint }, pressed && { opacity: 0.8 }]}
    >
      <Text style={styles.tileEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.tileTitle, { color: accent }]}>{title}</Text>
        <Text style={styles.tileSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={accent} />
    </Pressable>
  );
}

export function HomeScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  return (
    <Screen>
      <Text style={styles.kicker}>✨ Fijne feestdagen ✨</Text>
      <Text style={styles.heading}>Hoi {user?.name}</Text>
      <Muted>Alles voor het feest, overzichtelijk op één plek.</Muted>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionTitle>🎁 Mijn Verlangen</SectionTitle>
        <BentoTile
          emoji="🎁"
          title="Wensenlijstjes"
          subtitle="Maak een lijstje, deel de link, en zie in één oogopslag wat al afgestreept is."
          tint={colors.tintCoral}
          accent={colors.confettiCoral}
          onPress={() => navigation.navigate("Wensenlijstjes")}
        />

        <SectionTitle>🎉 Groepsfeesten</SectionTitle>
        <BentoTile
          emoji="🎯"
          title="Lootjes trekken"
          subtitle="Voor surprises en cadeaupotjes — eerlijk geloot, met een spannende unbox-reveal."
          tint={colors.tintMint}
          accent={colors.confettiMint}
          onPress={() => navigation.navigate("Lootjes")}
        />
        <BentoTile
          emoji="🎅"
          title="Secret Santa"
          subtitle="Zelfde eerlijke loting, met geheime hints over jezelf voor wie jou trekt."
          tint={colors.tintPurple}
          accent={colors.confettiPurple}
          onPress={() => navigation.navigate("Secret Santa")}
        />

        <SectionTitle>🎲 Partymodus</SectionTitle>
        <BentoTile
          emoji="🎲"
          title="Cadeautjesspel"
          subtitle="Ronde 1: cadeaus verdelen. Ronde 2: de spannende timer. Schud je telefoon om te gooien."
          tint={colors.tintYellow}
          accent="#D98C10"
          onPress={() => navigation.navigate("Spel")}
        />

        <Button title="Uitloggen" variant="ghost" onPress={logout} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { fontFamily: fonts.bodyBold, color: colors.confettiPurple, fontSize: 13, letterSpacing: 1, marginBottom: spacing.xs },
  heading: { fontFamily: fonts.displayBold, fontSize: 28, color: colors.accent, marginBottom: spacing.sm },
  content: { paddingTop: spacing.md, paddingBottom: spacing.lg },
  sectionTitle: { fontFamily: fonts.display, fontSize: 17, color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm },
  tile: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  tileEmoji: { fontSize: 34, marginRight: spacing.md },
  tileTitle: { fontFamily: fonts.displayBold, fontSize: 18, marginBottom: 2 },
  tileSubtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.text, opacity: 0.75, marginRight: spacing.sm },
});

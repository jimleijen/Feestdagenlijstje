import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../auth/AuthContext";
import { Button, Card, Muted, SubHeading } from "../components/ui";
import { colors, radius, spacing } from "../theme/colors";
import { fonts } from "../theme/fonts";

export function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.banner}>
        <Text style={styles.bannerKicker}>✨ Fijne feestdagen ✨</Text>
        <Text style={styles.bannerTitle}>Hoi {user?.name}</Text>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>
        <Muted>Alles voor de feestdagen, overzichtelijk op één plek.</Muted>

        <Card>
          <SubHeading>🎁 Wensenlijstjes</SubHeading>
          <Muted>Maak een lijstje, deel de link, en zie in één oogopslag wat al afgestreept is.</Muted>
        </Card>
        <Card>
          <SubHeading>🎯 Lootjes trekken</SubHeading>
          <Muted>Voor surprises en cadeaupotjes — eerlijk geloot, met een geheime "wie heeft wie"-functie.</Muted>
        </Card>
        <Card>
          <SubHeading>🎅 Secret Santa</SubHeading>
          <Muted>Zelfde eerlijke loting, met hints over jezelf voor wie jou trekt.</Muted>
        </Card>
        <Card>
          <SubHeading>🎲 Cadeautjesspel</SubHeading>
          <Muted>Schud je telefoon om te dobbelen, met gesproken opdrachten per ronde.</Muted>
        </Card>

        <Button title="Uitloggen" variant="ghost" onPress={logout} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  banner: {
    backgroundColor: colors.header,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  bannerKicker: { color: colors.gold, fontSize: 13, letterSpacing: 1, marginBottom: spacing.xs },
  bannerTitle: { fontFamily: fonts.displayBold, color: colors.textOnDark, fontSize: 28 },
  content: { padding: spacing.lg, paddingTop: spacing.md },
});

import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { Button, Card, Heading, Muted, Screen, SubHeading } from "../components/ui";
import { colors, spacing } from "../theme/colors";

export function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <Screen>
      <Text style={styles.kicker}>✨ Fijne feestdagen ✨</Text>
      <Heading>Hoi {user?.name}</Heading>
      <Muted>Alles voor de feestdagen, overzichtelijk op één plek.</Muted>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { color: colors.goldLight, fontSize: 13, letterSpacing: 1, marginBottom: spacing.xs },
  content: { paddingTop: spacing.md, paddingBottom: spacing.lg },
});

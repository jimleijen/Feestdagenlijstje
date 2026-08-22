import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { lootjesApi } from "../../api/draws";
import { apiErrorMessage } from "../../auth/AuthContext";
import { Button, Card, EmptyState, Heading, Muted, Screen, SubHeading, TextInput } from "../../components/ui";
import { RevealGiftModal } from "../../components/RevealGiftModal";
import { colors, spacing } from "../../theme/colors";
import { LootjesStackParamList } from "../../navigation/types";
import { NameDraw } from "../../types";

export function LootjesDetailScreen({ route }: NativeStackScreenProps<LootjesStackParamList, "LootjesDetail">) {
  const { drawId } = route.params;
  const [draw, setDraw] = useState<NameDraw | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [revealOpen, setRevealOpen] = useState(false);
  const [revealLoading, setRevealLoading] = useState(false);
  const [myAssignment, setMyAssignment] = useState<string | null>(null);
  const [adminReveal, setAdminReveal] = useState<{ giver: string; receiver: string }[] | null>(null);

  const load = useCallback(() => {
    lootjesApi.get(drawId).then(setDraw);
  }, [drawId]);

  useFocusEffect(load);

  async function handleAddParticipant() {
    if (!name.trim() || !email.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await lootjesApi.addParticipant(drawId, { name: name.trim(), email: email.trim().toLowerCase() });
      setName("");
      setEmail("");
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleRun() {
    setBusy(true);
    setError(null);
    try {
      await lootjesApi.run(drawId);
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleRevealMine() {
    setRevealOpen(true);
    setRevealLoading(true);
    try {
      const result = await lootjesApi.myAssignment(drawId);
      setMyAssignment(result.receiverName);
    } catch (err) {
      setError(apiErrorMessage(err));
      setRevealOpen(false);
    } finally {
      setRevealLoading(false);
    }
  }

  async function handleAdminPeek() {
    try {
      const result = await lootjesApi.adminPeek(drawId);
      setAdminReveal(result.assignments);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  if (!draw) return <Screen />;

  return (
    <Screen>
      <Heading>{draw.title}</Heading>
      {draw.budget ? <Muted>Budget: {draw.budget}</Muted> : null}
      {error ? <Text style={{ color: colors.danger, marginVertical: 8 }}>{error}</Text> : null}

      {draw.status === "OPEN" ? (
        <>
          <Card>
            <SubHeading>Deelnemer toevoegen</SubHeading>
            <TextInput placeholder="Naam" value={name} onChangeText={setName} />
            <TextInput placeholder="E-mailadres" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            <Button title="Toevoegen" onPress={handleAddParticipant} loading={busy} disabled={!name.trim() || !email.trim()} />
          </Card>

          {draw.participants.length > 0 ? (
            <Card>
              <SubHeading>Deelnemers</SubHeading>
              <FlatList
                data={draw.participants}
                keyExtractor={(p) => p.id}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border, marginVertical: spacing.sm }} />}
                renderItem={({ item }) => (
                  <Text style={{ color: colors.text, fontSize: 15 }}>
                    {item.name} · {item.email}
                  </Text>
                )}
              />
            </Card>
          ) : (
            <EmptyState title="Nog geen deelnemers" />
          )}

          <Button
            title={`Loot nu! (${draw.participants.length} deelnemers)`}
            variant="secondary"
            onPress={handleRun}
            loading={busy}
            disabled={draw.participants.length < 3}
          />
          {draw.participants.length < 3 ? <Muted>Minimaal 3 deelnemers nodig.</Muted> : null}
        </>
      ) : (
        <>
          <Card>
            <SubHeading>Geloot! Iedereen heeft een e-mail ontvangen.</SubHeading>
            <Muted>Ben je het vergeten? Pak hieronder je cadeau uit.</Muted>
            <Button title="Wie heb ik? 🎁" onPress={handleRevealMine} />
          </Card>

          <RevealGiftModal
            visible={revealOpen}
            loading={revealLoading}
            name={myAssignment}
            emoji="🎁"
            onClose={() => {
              setRevealOpen(false);
              setMyAssignment(null);
            }}
          />

          <Card>
            <SubHeading>Geheime beheerfunctie</SubHeading>
            <Muted>Alleen voor de organisator — bekijk wie wie heeft, voor als iemand het echt niet meer weet.</Muted>
            <Button title="Toon alle koppels" variant="ghost" onPress={handleAdminPeek} />
            {adminReveal ? (
              <View style={{ marginTop: spacing.md }}>
                {adminReveal.map((a, i) => (
                  <Text key={i} style={{ color: colors.text, fontSize: 15, marginBottom: spacing.xs }}>
                    {a.giver} → {a.receiver}
                  </Text>
                ))}
              </View>
            ) : null}
          </Card>
        </>
      )}
    </Screen>
  );
}

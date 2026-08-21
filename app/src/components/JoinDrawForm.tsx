import React, { useState } from "react";
import { Text, View } from "react-native";
import { colors, spacing } from "../theme/colors";
import { Button, Card, Muted, SubHeading, TextInput } from "./ui";

interface JoinApi {
  joinInfo: (joinCode: string) => Promise<{ id: string; title: string; status: string }>;
  join: (joinCode: string, data: { name: string; email: string }) => Promise<{ id: string; name: string }>;
}

// For someone who received a join code (e.g. via WhatsApp) and wants to add themselves
// without the organiser typing them in — the counterpart to DrawWizard's "deel join-code".
export function JoinDrawForm({ api }: { api: JoinApi }) {
  const [joinCode, setJoinCode] = useState("");
  const [info, setInfo] = useState<{ id: string; title: string; status: string } | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLookup() {
    if (!joinCode.trim()) return;
    setLoading(true);
    setError(null);
    try {
      setInfo(await api.joinInfo(joinCode.trim()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Code niet gevonden");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!info || !name.trim() || !email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await api.join(joinCode.trim(), { name: name.trim(), email: email.trim().toLowerCase() });
      setJoined(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Aanmelden lukte niet");
    } finally {
      setLoading(false);
    }
  }

  if (joined) {
    return (
      <Card>
        <SubHeading>Je staat erin! 🎉</SubHeading>
        <Muted>De organisator loot binnenkort en jij ontvangt dan een e-mail met wie je hebt.</Muted>
      </Card>
    );
  }

  if (!info) {
    return (
      <View>
        <TextInput placeholder="Join-code" value={joinCode} onChangeText={setJoinCode} autoCapitalize="none" />
        {error ? <Text style={{ color: "#C4392F", marginBottom: spacing.xs }}>{error}</Text> : null}
        <Button title="Zoek trekking" onPress={handleLookup} loading={loading} disabled={!joinCode.trim()} />
      </View>
    );
  }

  if (info.status !== "OPEN") {
    return (
      <Card>
        <SubHeading>{info.title}</SubHeading>
        <Muted>Er is al geloot voor deze trekking — aanmelden kan helaas niet meer.</Muted>
      </Card>
    );
  }

  return (
    <View>
      <Card>
        <SubHeading>{info.title}</SubHeading>
        <Muted>Vul je naam en e-mailadres in om mee te doen.</Muted>
      </Card>
      <TextInput placeholder="Naam" value={name} onChangeText={setName} />
      <TextInput placeholder="E-mailadres" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      {error ? <Text style={{ color: colors.danger, marginBottom: spacing.xs }}>{error}</Text> : null}
      <Button title="Doe mee" onPress={handleJoin} loading={loading} disabled={!name.trim() || !email.trim()} />
    </View>
  );
}

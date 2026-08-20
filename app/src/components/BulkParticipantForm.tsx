import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { apiErrorMessage } from "../auth/AuthContext";
import { spacing } from "../theme/colors";
import { Button, Card, Muted, SubHeading, TextInput } from "./ui";

interface DrawApi {
  create: (data: { title: string; budget?: string }) => Promise<{ id: string }>;
  addParticipant: (id: string, data: { name: string; email: string }) => Promise<unknown>;
}

const MIN_PARTICIPANTS = 3;
const MAX_PARTICIPANTS = 50;

// Two-step bulk entry, shared by Lootjes trekken and Secret Santa: first the trekking's
// name/budget and how many people join, then exactly that many name+e-mail rows at once —
// so the organiser fills everyone in in one go instead of adding participants one by one.
export function BulkParticipantForm({
  api,
  titlePlaceholder,
  onCreated,
}: {
  api: DrawApi;
  titlePlaceholder: string;
  onCreated: (drawId: string) => void;
}) {
  const [step, setStep] = useState<"setup" | "names">("setup");
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("");
  const [countText, setCountText] = useState("");
  const [rows, setRows] = useState<{ name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const count = parseInt(countText, 10);
  const countValid = Number.isInteger(count) && count >= MIN_PARTICIPANTS && count <= MAX_PARTICIPANTS;

  function handleNext() {
    if (!title.trim() || !countValid) return;
    setRows(Array.from({ length: count }, () => ({ name: "", email: "" })));
    setError(null);
    setStep("names");
  }

  function updateRow(index: number, field: "name" | "email", value: string) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  const allFilled = rows.length > 0 && rows.every((row) => row.name.trim() && row.email.trim());

  async function handleSubmit() {
    if (!allFilled) return;
    setLoading(true);
    setError(null);
    try {
      const draw = await api.create({ title: title.trim(), budget: budget.trim() || undefined });
      await Promise.all(
        rows.map((row) => api.addParticipant(draw.id, { name: row.name.trim(), email: row.email.trim().toLowerCase() }))
      );
      onCreated(draw.id);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (step === "setup") {
    return (
      <View>
        <TextInput placeholder={titlePlaceholder} value={title} onChangeText={setTitle} />
        <TextInput placeholder="Budget (optioneel), bv. max 15 euro" value={budget} onChangeText={setBudget} />
        <TextInput
          placeholder="Aantal deelnemers"
          value={countText}
          onChangeText={setCountText}
          keyboardType="number-pad"
        />
        <Muted>Minimaal {MIN_PARTICIPANTS} deelnemers nodig om te kunnen loten.</Muted>
        {error ? <Text style={{ color: "#C4392F", marginTop: spacing.xs }}>{error}</Text> : null}
        <Button
          title="Volgende: namen invullen"
          onPress={handleNext}
          disabled={!title.trim() || !countValid}
        />
      </View>
    );
  }

  return (
    <View>
      <Button title="‹ Aantal wijzigen" variant="ghost" onPress={() => setStep("setup")} />
      <ScrollView style={{ maxHeight: 420 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
        {rows.map((row, i) => (
          <Card key={i}>
            <SubHeading>Deelnemer {i + 1}</SubHeading>
            <TextInput placeholder="Naam" value={row.name} onChangeText={(text) => updateRow(i, "name", text)} />
            <TextInput
              placeholder="E-mailadres"
              value={row.email}
              onChangeText={(text) => updateRow(i, "email", text)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </Card>
        ))}
      </ScrollView>
      {error ? <Text style={{ color: "#C4392F", marginTop: spacing.xs }}>{error}</Text> : null}
      <Button title="Trekking aanmaken" onPress={handleSubmit} loading={loading} disabled={!allFilled} />
    </View>
  );
}

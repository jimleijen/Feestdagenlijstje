import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Text } from "react-native";
import { secretSantaApi } from "../../api/draws";
import { apiErrorMessage } from "../../auth/AuthContext";
import { Button, Heading, Screen, TextInput } from "../../components/ui";
import { SecretSantaStackParamList } from "../../navigation/types";

export function SecretSantaCreateScreen({
  navigation,
}: NativeStackScreenProps<SecretSantaStackParamList, "SecretSantaCreate">) {
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const draw = await secretSantaApi.create({ title: title.trim(), budget: budget.trim() || undefined });
      navigation.replace("SecretSantaDetail", { drawId: draw.id });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Heading>Nieuwe Secret Santa</Heading>
      <TextInput placeholder="Naam, bv. Vriendengroep Kerst 2026" value={title} onChangeText={setTitle} />
      <TextInput placeholder="Budget (optioneel), bv. max 20 euro" value={budget} onChangeText={setBudget} />
      {error ? <Text style={{ color: "#C4392F", marginBottom: 8 }}>{error}</Text> : null}
      <Button title="Aanmaken" onPress={handleCreate} loading={loading} disabled={!title.trim()} />
    </Screen>
  );
}

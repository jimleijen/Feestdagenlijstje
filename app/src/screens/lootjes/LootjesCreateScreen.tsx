import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { lootjesApi } from "../../api/draws";
import { apiErrorMessage } from "../../auth/AuthContext";
import { Button, Heading, Screen, TextInput } from "../../components/ui";
import { LootjesStackParamList } from "../../navigation/types";
import { Text } from "react-native";

export function LootjesCreateScreen({ navigation }: NativeStackScreenProps<LootjesStackParamList, "LootjesCreate">) {
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const draw = await lootjesApi.create({ title: title.trim(), budget: budget.trim() || undefined });
      navigation.replace("LootjesDetail", { drawId: draw.id });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Heading>Nieuwe trekking</Heading>
      <TextInput placeholder="Naam, bv. Sinterklaas kantoor 2026" value={title} onChangeText={setTitle} />
      <TextInput placeholder="Budget (optioneel), bv. max 15 euro" value={budget} onChangeText={setBudget} />
      {error ? <Text style={{ color: "#C4392F", marginBottom: 8 }}>{error}</Text> : null}
      <Button title="Aanmaken" onPress={handleCreate} loading={loading} disabled={!title.trim()} />
    </Screen>
  );
}

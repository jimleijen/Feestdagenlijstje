import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { apiErrorMessage } from "../../auth/AuthContext";
import { wishlistsApi } from "../../api/wishlists";
import { Button, Heading, Screen, TextInput } from "../../components/ui";
import { WishlistStackParamList } from "../../navigation/types";
import { Text } from "react-native";

export function WishlistEditScreen({ navigation }: NativeStackScreenProps<WishlistStackParamList, "WishlistEdit">) {
  const [title, setTitle] = useState("");
  const [occasion, setOccasion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const created = await wishlistsApi.create({ title: title.trim(), occasion: occasion.trim() || undefined });
      navigation.replace("WishlistDetail", { wishlistId: created.id });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Heading>Nieuw lijstje</Heading>
      <TextInput placeholder="Titel, bv. Verlanglijstje Sinterklaas" value={title} onChangeText={setTitle} />
      <TextInput placeholder="Gelegenheid (optioneel), bv. Kerst" value={occasion} onChangeText={setOccasion} />
      {error ? <Text style={{ color: "#C4392F", marginBottom: 8 }}>{error}</Text> : null}
      <Button title="Lijstje aanmaken" onPress={handleSave} loading={loading} disabled={!title.trim()} />
    </Screen>
  );
}

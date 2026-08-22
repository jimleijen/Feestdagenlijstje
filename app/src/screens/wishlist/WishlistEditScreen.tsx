import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import { apiErrorMessage } from "../../auth/AuthContext";
import { wishlistsApi } from "../../api/wishlists";
import { Button, Heading, Muted, Screen, TextInput } from "../../components/ui";
import { WishlistStackParamList } from "../../navigation/types";
import { colors } from "../../theme/colors";

export function WishlistEditScreen({
  route,
  navigation,
}: NativeStackScreenProps<WishlistStackParamList, "WishlistEdit">) {
  const wishlistId = route.params?.wishlistId;
  const isEditing = Boolean(wishlistId);

  const [title, setTitle] = useState("");
  const [occasion, setOccasion] = useState("");
  const [location, setLocation] = useState("");
  const [dateLabel, setDateLabel] = useState("");
  const [note, setNote] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!wishlistId) return;
    wishlistsApi.get(wishlistId).then((w) => {
      setTitle(w.title);
      setOccasion(w.occasion ?? "");
      setLocation(w.location ?? "");
      setDateLabel(w.dateLabel ?? "");
      setNote(w.note ?? "");
      setPhotoUrl(w.photoUrl ?? "");
    });
  }, [wishlistId]);

  async function handleSave() {
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    const data = {
      title: title.trim(),
      occasion: occasion.trim() || undefined,
      location: location.trim() || undefined,
      dateLabel: dateLabel.trim() || undefined,
      note: note.trim() || undefined,
      photoUrl: photoUrl.trim() || undefined,
    };
    try {
      if (wishlistId) {
        await wishlistsApi.update(wishlistId, data);
        navigation.replace("WishlistDetail", { wishlistId });
      } else {
        const created = await wishlistsApi.create(data);
        navigation.replace("WishlistDetail", { wishlistId: created.id });
      }
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Heading>{isEditing ? "Lijstje bewerken" : "Nieuw lijstje"}</Heading>
      <TextInput placeholder="Titel, bv. Verjaardagslijstje Stijn" value={title} onChangeText={setTitle} />
      <TextInput placeholder="Voor wie / gelegenheid, bv. Mijn verjaardag" value={occasion} onChangeText={setOccasion} />
      <TextInput placeholder="Woonplaats (optioneel)" value={location} onChangeText={setLocation} />
      <TextInput placeholder="Datum (optioneel), bv. 29 januari" value={dateLabel} onChangeText={setDateLabel} />
      <TextInput placeholder="Foto-URL (optioneel)" value={photoUrl} onChangeText={setPhotoUrl} autoCapitalize="none" />
      <TextInput
        placeholder="Berichtje bij je lijstje (optioneel), bv. Eigen ideeën ook leuk!"
        value={note}
        onChangeText={setNote}
        multiline
        numberOfLines={3}
        style={{ height: 90, textAlignVertical: "top" }}
      />
      <Muted>Deze gegevens komen boven aan je lijstje te staan, net als bij een echte verlanglijst.</Muted>
      {error ? <Text style={{ color: colors.danger, marginBottom: 8 }}>{error}</Text> : null}
      <Button title={isEditing ? "Opslaan" : "Lijstje aanmaken"} onPress={handleSave} loading={loading} disabled={!title.trim()} />
    </Screen>
  );
}

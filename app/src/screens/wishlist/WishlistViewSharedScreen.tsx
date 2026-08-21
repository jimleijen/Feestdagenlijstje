import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Text } from "react-native";
import { colors } from "../../theme/colors";
import { Button, Heading, Muted, Screen, TextInput } from "../../components/ui";
import { WishlistStackParamList } from "../../navigation/types";

// Entry point for someone who received a share-link/code for someone else's wishlist
// (they're not the owner, so this can't just be "open my own list") — mirrors the
// "Doe mee met code" pattern used for Lootjes/Secret Santa join codes.
export function WishlistViewSharedScreen({
  navigation,
}: NativeStackScreenProps<WishlistStackParamList, "WishlistViewShared">) {
  const [code, setCode] = useState("");

  return (
    <Screen>
      <Heading>Gedeeld lijstje bekijken</Heading>
      <Muted>Heb je een lijstje-code gekregen? Vul 'm hieronder in om cadeaus te bekijken en af te strepen.</Muted>
      <TextInput placeholder="Lijstje-code" value={code} onChangeText={setCode} autoCapitalize="none" />
      <Button
        title="Lijstje bekijken"
        onPress={() => navigation.navigate("WishlistDetail", { shareCode: code.trim() })}
        disabled={!code.trim()}
      />
      <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>
        De code staat in het berichtje dat je van de eigenaar hebt gekregen.
      </Text>
    </Screen>
  );
}

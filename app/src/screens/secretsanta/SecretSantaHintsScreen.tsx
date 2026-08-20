import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { FlatList, Text } from "react-native";
import { secretSantaApi } from "../../api/draws";
import { Button, Card, EmptyState, Heading, Muted, Screen, SubHeading, TextInput } from "../../components/ui";
import { SecretSantaStackParamList } from "../../navigation/types";
import { Hint } from "../../types";

export function SecretSantaHintsScreen({ route }: NativeStackScreenProps<SecretSantaStackParamList, "SecretSantaHints">) {
  const { drawId } = route.params;
  const [myHints, setMyHints] = useState<Hint[]>([]);
  const [hintsToRead, setHintsToRead] = useState<Hint[]>([]);
  const [newHint, setNewHint] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    secretSantaApi.myHints(drawId).then(setMyHints);
    secretSantaApi.hintsToRead(drawId).then(setHintsToRead).catch(() => setHintsToRead([]));
  }, [drawId]);

  useFocusEffect(load);

  async function handleAdd() {
    if (!newHint.trim()) return;
    setBusy(true);
    try {
      await secretSantaApi.addHint(drawId, newHint.trim());
      setNewHint("");
      load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Heading>Hints & geheime info</Heading>

      <Card>
        <SubHeading>Hints over jou (voor wie jou trekt)</SubHeading>
        <TextInput placeholder="Bv. maat L, houd van thee, geen chocolade" value={newHint} onChangeText={setNewHint} />
        <Button title="Hint toevoegen" onPress={handleAdd} loading={busy} disabled={!newHint.trim()} />
        <FlatList
          data={myHints}
          keyExtractor={(h) => h.id}
          ListEmptyComponent={<Muted>Nog geen hints van jou.</Muted>}
          renderItem={({ item }) => <Text style={{ paddingVertical: 4 }}>• {item.text}</Text>}
        />
      </Card>

      <Card>
        <SubHeading>Hints van wie jij getrokken hebt</SubHeading>
        <FlatList
          data={hintsToRead}
          keyExtractor={(h) => h.id}
          ListEmptyComponent={<EmptyState title="Nog geen hints beschikbaar" />}
          renderItem={({ item }) => <Text style={{ paddingVertical: 4 }}>• {item.text}</Text>}
        />
      </Card>
    </Screen>
  );
}

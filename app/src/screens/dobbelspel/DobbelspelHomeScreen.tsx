import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Share, Text } from "react-native";
import { gameApi } from "../../api/draws";
import { apiErrorMessage } from "../../auth/AuthContext";
import { Button, Card, Heading, Muted, Screen, SubHeading, TextInput } from "../../components/ui";
import { DobbelspelStackParamList } from "../../navigation/types";
import { colors } from "../../theme/colors";

export function DobbelspelHomeScreen({
  navigation,
}: NativeStackScreenProps<DobbelspelStackParamList, "DobbelspelHome">) {
  const [title, setTitle] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const session = await gameApi.create(title.trim());
      // Best-effort — unsupported on web/desktop browsers, and the join-code is shown on
      // screen regardless, so a failure here shouldn't block starting the game.
      Share.share({ message: `Doe mee met het cadeautjesspel "${session.title}"! Join-code: ${session.joinCode}` }).catch(
        () => {}
      );
      navigation.navigate("DobbelspelSession", { joinCode: session.joinCode });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function handleJoin() {
    if (!joinCode.trim()) return;
    navigation.navigate("DobbelspelSession", { joinCode: joinCode.trim() });
  }

  return (
    <Screen>
      <Heading>Cadeautjesspel 🎲</Heading>
      <Muted>Schud je telefoon om te dobbelen — elk vlak heeft een opdracht, met gesproken aankondiging.</Muted>

      <Card>
        <SubHeading>Nieuw spel starten</SubHeading>
        <TextInput placeholder="Naam van het spel" value={title} onChangeText={setTitle} />
        {error ? <Text style={{ color: colors.danger, marginBottom: 8 }}>{error}</Text> : null}
        <Button title="Starten & deel join-code" onPress={handleCreate} loading={loading} disabled={!title.trim()} />
      </Card>

      <Card>
        <SubHeading>Meedoen met een spel</SubHeading>
        <TextInput placeholder="Join-code" value={joinCode} onChangeText={setJoinCode} autoCapitalize="none" />
        <Button title="Meedoen" variant="secondary" onPress={handleJoin} disabled={!joinCode.trim()} />
      </Card>
    </Screen>
  );
}

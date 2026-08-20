import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { FlatList, Text } from "react-native";
import { secretSantaApi } from "../../api/draws";
import { Button, Card, EmptyState, Heading, Muted, Screen } from "../../components/ui";
import { colors } from "../../theme/colors";
import { SecretSantaStackParamList } from "../../navigation/types";
import { NameDraw } from "../../types";

export function SecretSantaListScreen({
  navigation,
}: NativeStackScreenProps<SecretSantaStackParamList, "SecretSantaList">) {
  const [draws, setDraws] = useState<NameDraw[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      secretSantaApi.list().then(setDraws);
    }, [])
  );

  return (
    <Screen>
      <Heading>Secret Santa 🎅</Heading>
      <Muted>Zoals lootjes trekken, maar met geheime hints over jezelf voor wie jou trekt.</Muted>
      <Button title="+ Nieuwe Secret Santa" onPress={() => navigation.navigate("SecretSantaCreate")} />
      <FlatList
        style={{ marginTop: 12 }}
        data={draws ?? []}
        keyExtractor={(d) => d.id}
        ListEmptyComponent={draws ? <EmptyState title="Nog geen Secret Santa" /> : null}
        renderItem={({ item }) => (
          <Card>
            <Text
              style={{ fontSize: 17, fontWeight: "600", color: colors.gold }}
              onPress={() => navigation.navigate("SecretSantaDetail", { drawId: item.id })}
            >
              {item.title}
            </Text>
            <Muted>
              {item.participants.length} deelnemer{item.participants.length === 1 ? "" : "s"} ·{" "}
              {item.status === "OPEN" ? "nog niet geloot" : "geloot"}
            </Muted>
          </Card>
        )}
      />
    </Screen>
  );
}

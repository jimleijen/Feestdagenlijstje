import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { FlatList, Text } from "react-native";
import { lootjesApi } from "../../api/draws";
import { Button, Card, EmptyState, Heading, Muted, Screen } from "../../components/ui";
import { colors } from "../../theme/colors";
import { LootjesStackParamList } from "../../navigation/types";
import { NameDraw } from "../../types";

export function LootjesListScreen({ navigation }: NativeStackScreenProps<LootjesStackParamList, "LootjesList">) {
  const [draws, setDraws] = useState<NameDraw[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      lootjesApi.list().then(setDraws);
    }, [])
  );

  return (
    <Screen>
      <Heading>Lootjes trekken</Heading>
      <Muted>Voor surprises, sinterklaas of gewoon een pot met cadeautjes — vul namen en e-mails in, wij loten eerlijk.</Muted>
      <Button title="+ Nieuwe trekking" onPress={() => navigation.navigate("LootjesCreate")} />
      <FlatList
        style={{ marginTop: 12 }}
        data={draws ?? []}
        keyExtractor={(d) => d.id}
        ListEmptyComponent={draws ? <EmptyState title="Nog geen trekking" subtitle="Start je eerste lootjestrekking." /> : null}
        renderItem={({ item }) => (
          <Card>
            <Text
              style={{ fontSize: 17, fontWeight: "600", color: colors.gold }}
              onPress={() => navigation.navigate("LootjesDetail", { drawId: item.id })}
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

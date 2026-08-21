import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { ScrollView } from "react-native";
import { lootjesApi } from "../../api/draws";
import { DrawWizard } from "../../components/DrawWizard";
import { Heading, Screen } from "../../components/ui";
import { LootjesStackParamList } from "../../navigation/types";

export function LootjesCreateScreen({ navigation }: NativeStackScreenProps<LootjesStackParamList, "LootjesCreate">) {
  return (
    <Screen>
      <Heading>Nieuwe trekking</Heading>
      <ScrollView showsVerticalScrollIndicator={false}>
        <DrawWizard
          api={lootjesApi}
          titlePlaceholder="Naam, bv. Sinterklaas kantoor 2026"
          onCreated={(drawId) => navigation.replace("LootjesDetail", { drawId })}
        />
      </ScrollView>
    </Screen>
  );
}

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { lootjesApi } from "../../api/draws";
import { BulkParticipantForm } from "../../components/BulkParticipantForm";
import { Heading, Muted, Screen } from "../../components/ui";
import { LootjesStackParamList } from "../../navigation/types";

export function LootjesCreateScreen({ navigation }: NativeStackScreenProps<LootjesStackParamList, "LootjesCreate">) {
  return (
    <Screen>
      <Heading>Nieuwe trekking</Heading>
      <Muted>Vul het aantal deelnemers in, dan vraagt hij precies zoveel naam- en e-mailregels.</Muted>
      <BulkParticipantForm
        api={lootjesApi}
        titlePlaceholder="Naam, bv. Sinterklaas kantoor 2026"
        onCreated={(drawId) => navigation.replace("LootjesDetail", { drawId })}
      />
    </Screen>
  );
}

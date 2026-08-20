import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { secretSantaApi } from "../../api/draws";
import { BulkParticipantForm } from "../../components/BulkParticipantForm";
import { Heading, Muted, Screen } from "../../components/ui";
import { SecretSantaStackParamList } from "../../navigation/types";

export function SecretSantaCreateScreen({
  navigation,
}: NativeStackScreenProps<SecretSantaStackParamList, "SecretSantaCreate">) {
  return (
    <Screen>
      <Heading>Nieuwe Secret Santa</Heading>
      <Muted>Vul het aantal deelnemers in, dan vraagt hij precies zoveel naam- en e-mailregels.</Muted>
      <BulkParticipantForm
        api={secretSantaApi}
        titlePlaceholder="Naam, bv. Vriendengroep Kerst 2026"
        onCreated={(drawId) => navigation.replace("SecretSantaDetail", { drawId })}
      />
    </Screen>
  );
}

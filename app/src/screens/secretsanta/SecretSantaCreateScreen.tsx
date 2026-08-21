import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { ScrollView } from "react-native";
import { secretSantaApi } from "../../api/draws";
import { DrawWizard } from "../../components/DrawWizard";
import { Heading, Screen } from "../../components/ui";
import { SecretSantaStackParamList } from "../../navigation/types";

export function SecretSantaCreateScreen({
  navigation,
}: NativeStackScreenProps<SecretSantaStackParamList, "SecretSantaCreate">) {
  return (
    <Screen>
      <Heading>Nieuwe Secret Santa</Heading>
      <ScrollView showsVerticalScrollIndicator={false}>
        <DrawWizard
          api={secretSantaApi}
          titlePlaceholder="Naam, bv. Vriendengroep Kerst 2026"
          onCreated={(drawId) => navigation.replace("SecretSantaDetail", { drawId })}
        />
      </ScrollView>
    </Screen>
  );
}

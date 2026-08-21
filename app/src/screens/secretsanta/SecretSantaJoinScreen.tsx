import React from "react";
import { secretSantaApi } from "../../api/draws";
import { JoinDrawForm } from "../../components/JoinDrawForm";
import { Heading, Muted, Screen } from "../../components/ui";

export function SecretSantaJoinScreen() {
  return (
    <Screen>
      <Heading>Doe mee met code</Heading>
      <Muted>Heb je een join-code van de organisator gekregen? Vul 'm hieronder in.</Muted>
      <JoinDrawForm api={secretSantaApi} />
    </Screen>
  );
}

import React from "react";
import { lootjesApi } from "../../api/draws";
import { JoinDrawForm } from "../../components/JoinDrawForm";
import { Heading, Muted, Screen } from "../../components/ui";

export function LootjesJoinScreen() {
  return (
    <Screen>
      <Heading>Doe mee met code</Heading>
      <Muted>Heb je een join-code van de organisator gekregen? Vul 'm hieronder in.</Muted>
      <JoinDrawForm api={lootjesApi} />
    </Screen>
  );
}

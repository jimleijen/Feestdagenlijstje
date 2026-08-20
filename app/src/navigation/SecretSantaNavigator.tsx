import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { SecretSantaCreateScreen } from "../screens/secretsanta/SecretSantaCreateScreen";
import { SecretSantaDetailScreen } from "../screens/secretsanta/SecretSantaDetailScreen";
import { SecretSantaHintsScreen } from "../screens/secretsanta/SecretSantaHintsScreen";
import { SecretSantaListScreen } from "../screens/secretsanta/SecretSantaListScreen";
import { festiveHeaderOptions } from "./headerOptions";
import { SecretSantaStackParamList } from "./types";

const Stack = createNativeStackNavigator<SecretSantaStackParamList>();

export function SecretSantaNavigator() {
  return (
    <Stack.Navigator screenOptions={festiveHeaderOptions}>
      <Stack.Screen name="SecretSantaList" component={SecretSantaListScreen} options={{ title: "Secret Santa" }} />
      <Stack.Screen name="SecretSantaCreate" component={SecretSantaCreateScreen} options={{ title: "Nieuwe Secret Santa" }} />
      <Stack.Screen name="SecretSantaDetail" component={SecretSantaDetailScreen} options={{ title: "Secret Santa" }} />
      <Stack.Screen name="SecretSantaHints" component={SecretSantaHintsScreen} options={{ title: "Hints" }} />
    </Stack.Navigator>
  );
}

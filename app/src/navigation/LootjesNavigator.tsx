import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { LootjesCreateScreen } from "../screens/lootjes/LootjesCreateScreen";
import { LootjesDetailScreen } from "../screens/lootjes/LootjesDetailScreen";
import { LootjesListScreen } from "../screens/lootjes/LootjesListScreen";
import { festiveHeaderOptions } from "./headerOptions";
import { LootjesStackParamList } from "./types";

const Stack = createNativeStackNavigator<LootjesStackParamList>();

export function LootjesNavigator() {
  return (
    <Stack.Navigator screenOptions={festiveHeaderOptions}>
      <Stack.Screen name="LootjesList" component={LootjesListScreen} options={{ title: "Lootjes trekken" }} />
      <Stack.Screen name="LootjesCreate" component={LootjesCreateScreen} options={{ title: "Nieuwe trekking" }} />
      <Stack.Screen name="LootjesDetail" component={LootjesDetailScreen} options={{ title: "Trekking" }} />
    </Stack.Navigator>
  );
}

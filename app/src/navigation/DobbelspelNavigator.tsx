import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { colors } from "../theme/colors";
import { DobbelspelHomeScreen } from "../screens/dobbelspel/DobbelspelHomeScreen";
import { DobbelspelSessionScreen } from "../screens/dobbelspel/DobbelspelSessionScreen";
import { DobbelspelStackParamList } from "./types";

const Stack = createNativeStackNavigator<DobbelspelStackParamList>();

export function DobbelspelNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.primary }}>
      <Stack.Screen name="DobbelspelHome" component={DobbelspelHomeScreen} options={{ title: "Cadeautjesspel" }} />
      <Stack.Screen name="DobbelspelSession" component={DobbelspelSessionScreen} options={{ title: "Spel" }} />
    </Stack.Navigator>
  );
}

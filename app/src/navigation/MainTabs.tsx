import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { Text } from "react-native";
import { HomeScreen } from "../screens/HomeScreen";
import { colors } from "../theme/colors";
import { DobbelspelNavigator } from "./DobbelspelNavigator";
import { LootjesNavigator } from "./LootjesNavigator";
import { SecretSantaNavigator } from "./SecretSantaNavigator";
import { WishlistNavigator } from "./WishlistNavigator";

const Tab = createBottomTabNavigator();

// Emoji tab icons keep this dependency-free — swap for a proper icon set (e.g. @expo/vector-icons)
// once the app has real branding.
function tabIcon(emoji: string) {
  return ({ focused }: { focused: boolean }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.textMuted }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: tabIcon("🏠") }} />
      <Tab.Screen name="Wensenlijstjes" component={WishlistNavigator} options={{ tabBarIcon: tabIcon("🎁") }} />
      <Tab.Screen name="Lootjes" component={LootjesNavigator} options={{ tabBarIcon: tabIcon("🎯") }} />
      <Tab.Screen name="Secret Santa" component={SecretSantaNavigator} options={{ tabBarIcon: tabIcon("🎅") }} />
      <Tab.Screen name="Spel" component={DobbelspelNavigator} options={{ tabBarIcon: tabIcon("🎲") }} />
    </Tab.Navigator>
  );
}

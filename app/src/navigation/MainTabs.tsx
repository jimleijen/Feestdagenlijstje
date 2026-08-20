import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { HomeScreen } from "../screens/HomeScreen";
import { colors, tabColors } from "../theme/colors";
import { fonts } from "../theme/fonts";
import { DobbelspelNavigator } from "./DobbelspelNavigator";
import { LootjesNavigator } from "./LootjesNavigator";
import { SecretSantaNavigator } from "./SecretSantaNavigator";
import { WishlistNavigator } from "./WishlistNavigator";

const Tab = createBottomTabNavigator();

// Each destination keeps its own signature color on the icon at all times — only the label
// dims when inactive. That's what makes the bar read as colorful/festive instead of the usual
// flat single-tint template, while still making the active tab obvious.
function tabIcon(name: keyof typeof Ionicons.glyphMap, tint: string) {
  return ({ focused }: { focused: boolean }) => (
    <Ionicons name={name} size={24} color={tint} style={{ opacity: focused ? 1 : 0.62 }} />
  );
}

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 62, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontFamily: fonts.display, fontSize: 11 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: tabIcon("home", tabColors.home), tabBarActiveTintColor: tabColors.home }}
      />
      <Tab.Screen
        name="Wensenlijstjes"
        component={WishlistNavigator}
        options={{ tabBarIcon: tabIcon("gift", tabColors.wishlist), tabBarActiveTintColor: tabColors.wishlist }}
      />
      <Tab.Screen
        name="Lootjes"
        component={LootjesNavigator}
        options={{ tabBarIcon: tabIcon("pricetag", tabColors.lootjes), tabBarActiveTintColor: tabColors.lootjes }}
      />
      <Tab.Screen
        name="Secret Santa"
        component={SecretSantaNavigator}
        options={{ tabBarIcon: tabIcon("sparkles", tabColors.secretSanta), tabBarActiveTintColor: tabColors.secretSanta }}
      />
      <Tab.Screen
        name="Spel"
        component={DobbelspelNavigator}
        options={{ tabBarIcon: tabIcon("dice", tabColors.spel), tabBarActiveTintColor: tabColors.spel }}
      />
    </Tab.Navigator>
  );
}

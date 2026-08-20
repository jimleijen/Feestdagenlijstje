import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { colors } from "../theme/colors";
import { WishlistDetailScreen } from "../screens/wishlist/WishlistDetailScreen";
import { WishlistEditScreen } from "../screens/wishlist/WishlistEditScreen";
import { WishlistListScreen } from "../screens/wishlist/WishlistListScreen";
import { WishlistStackParamList } from "./types";

const Stack = createNativeStackNavigator<WishlistStackParamList>();

export function WishlistNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.primary }}>
      <Stack.Screen name="WishlistList" component={WishlistListScreen} options={{ title: "Wensenlijstjes" }} />
      <Stack.Screen name="WishlistDetail" component={WishlistDetailScreen} options={{ title: "Lijstje" }} />
      <Stack.Screen name="WishlistEdit" component={WishlistEditScreen} options={{ title: "Nieuw lijstje" }} />
    </Stack.Navigator>
  );
}

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { WishlistDetailScreen } from "../screens/wishlist/WishlistDetailScreen";
import { WishlistEditScreen } from "../screens/wishlist/WishlistEditScreen";
import { WishlistListScreen } from "../screens/wishlist/WishlistListScreen";
import { WishlistViewSharedScreen } from "../screens/wishlist/WishlistViewSharedScreen";
import { festiveHeaderOptions } from "./headerOptions";
import { WishlistStackParamList } from "./types";

const Stack = createNativeStackNavigator<WishlistStackParamList>();

export function WishlistNavigator() {
  return (
    <Stack.Navigator screenOptions={festiveHeaderOptions}>
      <Stack.Screen name="WishlistList" component={WishlistListScreen} options={{ title: "Wensenlijstjes" }} />
      <Stack.Screen name="WishlistDetail" component={WishlistDetailScreen} options={{ title: "Lijstje" }} />
      <Stack.Screen name="WishlistEdit" component={WishlistEditScreen} options={{ title: "Nieuw lijstje" }} />
      <Stack.Screen name="WishlistViewShared" component={WishlistViewSharedScreen} options={{ title: "Gedeeld lijstje" }} />
    </Stack.Navigator>
  );
}

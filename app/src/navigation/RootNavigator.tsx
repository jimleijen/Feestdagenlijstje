import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { colors } from "../theme/colors";
import { AuthNavigator } from "./AuthNavigator";
import { MainTabs } from "./MainTabs";

export function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return <NavigationContainer>{user ? <MainTabs /> : <AuthNavigator />}</NavigationContainer>;
}

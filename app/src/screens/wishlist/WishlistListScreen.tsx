import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { FlatList, Text } from "react-native";
import { wishlistsApi } from "../../api/wishlists";
import { Button, Card, EmptyState, Heading, Muted, Screen } from "../../components/ui";
import { colors } from "../../theme/colors";
import { WishlistStackParamList } from "../../navigation/types";
import { Wishlist } from "../../types";

export function WishlistListScreen({ navigation }: NativeStackScreenProps<WishlistStackParamList, "WishlistList">) {
  const [wishlists, setWishlists] = useState<Wishlist[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      wishlistsApi.list().then(setWishlists);
    }, [])
  );

  return (
    <Screen>
      <Heading>Wensenlijstjes</Heading>
      <Muted>Maak een lijstje en deel de link — anderen strepen af wat ze kopen.</Muted>
      <Button title="+ Nieuw lijstje" onPress={() => navigation.navigate("WishlistEdit", {})} />
      <FlatList
        style={{ marginTop: 12 }}
        data={wishlists ?? []}
        keyExtractor={(w) => w.id}
        ListEmptyComponent={
          wishlists ? <EmptyState title="Nog geen lijstje" subtitle="Maak je eerste wensenlijstje aan." /> : null
        }
        renderItem={({ item }) => (
          <Card>
            <Text
              style={{ fontSize: 17, fontWeight: "600", color: colors.gold }}
              onPress={() => navigation.navigate("WishlistDetail", { wishlistId: item.id })}
            >
              {item.title}
            </Text>
            {item.occasion ? <Muted>{item.occasion}</Muted> : null}
          </Card>
        )}
      />
    </Screen>
  );
}

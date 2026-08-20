import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { FlatList, Share, Text } from "react-native";
import { wishlistsApi } from "../../api/wishlists";
import { Button, Card, EmptyState, Heading, Muted, Screen, TextInput } from "../../components/ui";
import { WishlistItemRow } from "../../components/WishlistItemRow";
import { spacing } from "../../theme/colors";
import { WishlistStackParamList } from "../../navigation/types";
import { Wishlist } from "../../types";

export function WishlistDetailScreen({
  route,
}: NativeStackScreenProps<WishlistStackParamList, "WishlistDetail">) {
  const { wishlistId } = route.params;
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [adding, setAdding] = useState(false);

  const load = useCallback(() => {
    wishlistsApi.get(wishlistId).then(setWishlist);
  }, [wishlistId]);

  useFocusEffect(load);

  async function handleAddItem() {
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      await wishlistsApi.addItem(wishlistId, {
        title: newTitle.trim(),
        sourceUrl: newUrl.trim() || undefined,
      });
      setNewTitle("");
      setNewUrl("");
      load();
    } finally {
      setAdding(false);
    }
  }

  function handleShare() {
    if (!wishlist) return;
    Share.share({
      message: `Bekijk mijn wensenlijstje "${wishlist.title}" op Feestdagenlijstje: feestdagenlijstje://lijst/${wishlist.shareCode}`,
    });
  }

  if (!wishlist) return <Screen />;

  return (
    <Screen>
      <Heading>{wishlist.title}</Heading>
      {wishlist.occasion ? <Muted>{wishlist.occasion}</Muted> : null}
      <Button title="Deel dit lijstje" variant="secondary" onPress={handleShare} />

      <Card style={{ marginTop: spacing.md }}>
        <Text style={{ fontWeight: "600", marginBottom: spacing.xs }}>Cadeau toevoegen</Text>
        <TextInput placeholder="Wat wil je graag?" value={newTitle} onChangeText={setNewTitle} />
        <TextInput placeholder="Link naar webwinkel (optioneel)" value={newUrl} onChangeText={setNewUrl} autoCapitalize="none" />
        <Button title="Toevoegen" onPress={handleAddItem} loading={adding} disabled={!newTitle.trim()} />
      </Card>

      <FlatList
        data={wishlist.items ?? []}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={<EmptyState title="Nog geen cadeaus" subtitle="Voeg hierboven je eerste wens toe." />}
        renderItem={({ item }) => (
          <WishlistItemRow
            item={item}
            shareCode={wishlist.shareCode}
            onChange={(updated) =>
              setWishlist((prev) =>
                prev ? { ...prev, items: prev.items?.map((i) => (i.id === updated.id ? updated : i)) } : prev
              )
            }
          />
        )}
      />
    </Screen>
  );
}
